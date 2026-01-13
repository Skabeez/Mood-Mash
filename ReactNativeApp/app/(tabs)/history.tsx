import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase, getCurrentUser } from '@/services/api/supabase';
import { designSystem } from '@/constants/designSystem';
import { Recommendation } from '@/types';

export interface HistoryEntry {
  id: string;
  song: Recommendation;
  date: Date;
}

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user's favorites from Supabase
  const fetchHistory = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      // Fetch user's favorites
      const { data: favoriteData, error: favError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (favError) throw favError;

      // Convert to HistoryEntry format
      const historyEntries: HistoryEntry[] = (favoriteData || []).map((fav: any) => ({
        id: fav.id,
        song: {
          id: fav.youtube_id,
          title: fav.title,
          artist: fav.artist,
          albumArt: fav.album_art || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
          youtubeId: fav.youtube_id,
          type: 'mainstream' as any,
          duration: '4:00',
        },
        date: new Date(fav.added_at),
      }));

      setHistory(historyEntries);

      // Mark all fetched items as favorites
      const favSet = new Set(favoriteData?.map((f: any) => f.youtube_id) || []);
      setFavorites(favSet);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((entry) =>
    searchQuery === ''
      ? true
      : entry.song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleToggleFavorite = async (songId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const isFavorited = favorites.has(songId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('youtube_id', songId);

        if (error) throw error;

        // Update local state
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          newFavorites.delete(songId);
          return newFavorites;
        });

        // Remove from history list since this page shows favorites
        setHistory((prev) => prev.filter(h => h.song.youtubeId !== songId));
      } else {
        // Find the song in history to get its details
        const song = history.find(h => h.song.youtubeId === songId)?.song;
        if (!song) return;

        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ 
            user_id: user.id, 
            youtube_id: song.youtubeId,
            title: song.title,
            artist: song.artist,
            album_art: song.albumArt,
          });

        if (error) throw error;

        // Update local state
        setFavorites((prev) => new Set([...prev, songId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePlay = (song: Recommendation) => {
    console.log('Playing song:', song.title);
    // TODO: Integrate with music player
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchHistory();
    setIsRefreshing(false);
  };

  const handleNavigateToChat = () => {
    router.push('/(tabs)');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="musical-notes-outline" size={64} color="#6B7280" />
      </View>
      <Text style={styles.emptyTitle}>No highlights yet!</Text>
      <Text style={styles.emptySubtitle}>
        Start chatting to discover amazing music
      </Text>
      <Pressable style={styles.emptyCTA} onPress={handleNavigateToChat}>
        <Text style={styles.emptyCTAText}>Go to Chat</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemContent}>
        {/* Album Art */}
        <View style={styles.albumArtContainer}>
          <Image
            source={{ uri: item.song.albumArt }}
            style={styles.albumArt}
            resizeMode="cover"
          />
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.song.title}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {item.song.artist}
          </Text>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={styles.playButton}
            onPress={() => handlePlay(item.song)}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item.song.youtubeId)}
          >
            <Ionicons
              name={favorites.has(item.song.youtubeId) ? 'heart' : 'heart-outline'}
              size={16}
              color={favorites.has(item.song.youtubeId) ? '#EC4899' : '#9CA3AF'}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030712', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <LinearGradient
          colors={['#030712', 'rgba(3, 7, 18, 0.95)']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Listening History</Text>
              <Text style={styles.headerSubtitle}>Your highlighted recommendations</Text>
            </View>
            <Pressable style={styles.filterButton}>
              <Ionicons name="filter-outline" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your highlights..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* History List */}
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={[
            styles.listContent,
            filteredHistory.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#9333EA"
              colors={['#9333EA']}
            />
          }
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
  header: {
    paddingHorizontal: designSystem.spacing[5],
    paddingTop: designSystem.spacing[6],
    paddingBottom: designSystem.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937', // gray-800
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: designSystem.spacing[4],
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: designSystem.spacing[1],
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF', // gray-400
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: designSystem.borderRadius.full,
    paddingHorizontal: designSystem.spacing[4],
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: designSystem.spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#F9FAFB',
  },
  clearButton: {
    marginLeft: designSystem.spacing[2],
  },
  listContent: {
    paddingHorizontal: designSystem.spacing[5],
    paddingVertical: designSystem.spacing[4],
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: designSystem.spacing[8],
    paddingVertical: designSystem.spacing[16],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: designSystem.spacing[6],
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: designSystem.spacing[2],
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: designSystem.spacing[8],
    lineHeight: 24,
  },
  emptyCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    backgroundColor: '#9333EA', // purple-600
    paddingHorizontal: designSystem.spacing[6],
    paddingVertical: designSystem.spacing[3],
    borderRadius: designSystem.borderRadius.full,
  },
  emptyCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyItem: {
    borderRadius: designSystem.borderRadius['2xl'],
    marginBottom: designSystem.spacing[3],
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    padding: designSystem.spacing[4],
    gap: designSystem.spacing[4],
  },
  albumArtContainer: {
    width: 80,
    height: 80,
    borderRadius: designSystem.borderRadius.xl,
    overflow: 'hidden',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  songInfo: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488', // teal-600
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)', // gray-700/50
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HistoryScreen;
