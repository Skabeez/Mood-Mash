import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import WelcomeMessage from '@/components/chat/WelcomeMessage';
import InputBar from '@/components/chat/InputBar';
import { RecommendationList } from '@/components/recommendations';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { FullPlayer } from '@/components/player/FullPlayer';
import { Recommendation } from '@/types';
import { useChatContext } from '@/context/ChatContext';
import { usePlayerContext } from '@/context/PlayerContext';
import { designSystem } from '@/constants/designSystem';
import { getCurrentUser, saveFavoriteSong, removeFavoriteSong, getUserFavorites } from '@/services/api/supabase';


// Loading messages that rotate
const LOADING_MESSAGES = [
  '🎵 Analyzing your music taste...',
  '🎸 Finding the perfect tracks...',
  '💿 Curating your playlist...',
  '🎧 Discovering hidden gems...',
  '🎹 Mixing your recommendations...',
];

const ChatScreen: React.FC = () => {
  const { state, generateRecommendations } = useChatContext();
  const { playSong, currentSong } = usePlayerContext();
  const [inputValue, setInputValue] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingDuration, setLoadingDuration] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Load user and favorites on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          
          // Load user's favorites
          const userFavorites = await getUserFavorites(user.id);
          const favIds = new Set(userFavorites.map((f: any) => f.youtubeId));
          setFavorites(favIds);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  // Rotate loading messages
  useEffect(() => {
    if (state.isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setLoadingDuration((prev) => prev + 2);
      }, 2000);
      return () => {
        clearInterval(interval);
        setLoadingMessageIndex(0);
        setLoadingDuration(0);
      };
    }
  }, [state.isLoading]);

  const handleToggleFavorite = async (recommendation: Recommendation) => {
    if (!userId) {
      console.warn('No user logged in');
      return;
    }

    try {
      const isFavorited = favorites.has(recommendation.youtubeId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await removeFavoriteSong(userId, recommendation.youtubeId);
        if (error) throw error;

        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          newFavorites.delete(recommendation.youtubeId);
          return newFavorites;
        });
      } else {
        // Add to favorites
        const { error } = await saveFavoriteSong(userId, recommendation.id, {
          title: recommendation.title,
          artist: recommendation.artist,
          albumArt: recommendation.albumArt,
          youtubeId: recommendation.youtubeId,
        });
        if (error) throw error;

        setFavorites((prev) => new Set([...prev, recommendation.youtubeId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePlaySong = (recommendation: Recommendation) => {
    // Get all recommendations from current message
    const currentMessage = state.messages[state.messages.length - 1];
    const playlist = currentMessage?.recommendations || [recommendation];
    
    // Play the song with the full playlist
    playSong(recommendation, playlist);
  };

  const handleCardPress = (recommendation: Recommendation) => {
    // Play song when card is pressed
    handlePlaySong(recommendation);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || state.isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    
    await generateRecommendations(message);
  };

  const handleRetry = async () => {
    // Get the last user message and retry
    const lastUserMessage = [...state.messages].reverse().find(m => m.sender === 'user');
    if (lastUserMessage) {
      await generateRecommendations(lastUserMessage.text);
    }
  };

  const handleSuggestionPress = async (suggestion: string) => {
    setInputValue(suggestion);
    await generateRecommendations(suggestion);
  };

  const categorizeRecommendations = (recommendations?: Recommendation[]) => {
    if (!recommendations) return { highlight: undefined, deepCuts: [], mainstream: [] };
    
    return {
      highlight: recommendations.find(r => r.type === 'highlight'),
      deepCuts: recommendations.filter(r => r.type === 'deep-cut'),
      mainstream: recommendations.filter(r => r.type === 'mainstream'),
    };
  };

  const renderMessage = ({ item, index }: { item: typeof state.messages[0]; index: number }) => {
    const { highlight, deepCuts, mainstream } = categorizeRecommendations(item.recommendations);
    const hasRecommendations = highlight || deepCuts.length > 0 || mainstream.length > 0;
    const isError = item.text.includes("couldn't generate") || item.text.includes("Oops!");

    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.aiBubble,
            isError && styles.errorBubble,
          ]}
        >
          {item.text && (
            <Text style={[styles.messageText, isError && styles.errorText]}>
              {item.text}
            </Text>
          )}

          {/* Retry Button for Error Messages */}
          {isError && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              disabled={state.isLoading}
            >
              <Text style={styles.retryButtonText}>
                {state.isLoading ? 'Retrying...' : '🔄 Retry'}
              </Text>
            </TouchableOpacity>
          )}

          {/* AI Response with Recommendations */}
          {item.sender === 'ai' && hasRecommendations && (
            <View style={styles.recommendationsContainer}>
              {/* Highlight */}
              {highlight && (
                <RecommendationList
                  recommendations={[highlight]}
                  type="highlight"
                  onPlaySong={handlePlaySong}
                  onCardPress={handleCardPress}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                  playingSongId={currentSong?.youtubeId}
                />
              )}

              {/* Deep Cuts */}
              {deepCuts.length > 0 && (
                <View style={styles.sectionSpacing}>
                  <RecommendationList
                    recommendations={deepCuts}
                    type="deep-cuts"
                    onPlaySong={handlePlaySong}
                    onCardPress={handleCardPress}
                    onToggleFavorite={handleToggleFavorite}
                    favorites={favorites}
                    playingSongId={currentSong?.youtubeId}
                  />
                </View>
              )}

              {/* Mainstream Picks */}
              {mainstream.length > 0 && (
                <View style={styles.sectionSpacing}>
                  <RecommendationList
                    recommendations={mainstream}
                    type="mainstream"
                    onPlaySong={handlePlaySong}
                    onCardPress={handleCardPress}
                    onToggleFavorite={handleToggleFavorite}
                    favorites={favorites}
                    playingSongId={currentSong?.youtubeId}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderLoadingIndicator = () => {
    if (!state.isLoading) return null;

    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBubble}>
          <ActivityIndicator size="small" color="#9333EA" />
          <Text style={styles.loadingText}>
            {LOADING_MESSAGES[loadingMessageIndex]}
          </Text>
          {loadingDuration > 10 && (
            <Text style={styles.loadingSubtext}>
              Still generating your perfect recommendations...
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030712', '#111827']} // gray-950 to gray-900
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={0}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={state.messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            ListEmptyComponent={
              !state.isLoading ? (
                <WelcomeMessage onSuggestionPress={handleSuggestionPress} />
              ) : null
            }
            ListFooterComponent={renderLoadingIndicator()}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={scrollToBottom}
          />

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <InputBar
              onSend={handleSend}
              isLoading={state.isLoading}
              value={inputValue}
              onChangeText={setInputValue}
            />
          </View>
        </KeyboardAvoidingView>

        {/* Mini Player - Now in normal flow */}
        {<MiniPlayer
          onExpand={() => setShowFullPlayer(true)}
          onClose={() => {}}
        />}

        {/* Full Player Modal */}
        <FullPlayer
          visible={showFullPlayer}
          onClose={() => setShowFullPlayer(false)}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: designSystem.spacing[4],
    paddingTop: designSystem.spacing[6],
    paddingBottom: designSystem.spacing[4],
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: designSystem.spacing[4],
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  userBubble: {
    backgroundColor: '#9333EA', // purple-600
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderTopLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#7F1D1D', // red-900
    borderWidth: 1,
    borderColor: '#DC2626', // red-600
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FCA5A5', // red-300
  },
  recommendationsContainer: {
    marginTop: designSystem.spacing[4],
  },
  sectionSpacing: {
    marginTop: designSystem.spacing[6],
  },
  inputContainer: {
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    paddingVertical: designSystem.spacing[4],
    alignItems: 'flex-start',
  },
  loadingBubble: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: '85%',
  },
  loadingText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    marginLeft: designSystem.spacing[2],
  },
  loadingSubtext: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: designSystem.spacing[2],
    fontStyle: 'italic',
  },
  retryButton: {
    marginTop: designSystem.spacing[3],
    backgroundColor: '#DC2626', // red-600
    paddingHorizontal: designSystem.spacing[4],
    paddingVertical: designSystem.spacing[2],
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatScreen;
