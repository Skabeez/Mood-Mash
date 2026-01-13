import React, { useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  ViewStyle,
  TextStyle,
  Dimensions,
  Platform,
  AccessibilityRole,
} from 'react-native';
import { Message, Recommendation } from '@/types';
import { formatTimestamp } from '@/utils/helpers';
import { designSystem } from '@/constants/designSystem';
import { RecommendationList } from '@/components/recommendations';

interface MessageBubbleProps {
  message: Message;
  key: string;
  accessibilityLabel?: string;
  onPlaySong?: (recommendation: Recommendation) => void;
  onCardPress?: (recommendation: Recommendation) => void;
  onToggleFavorite?: (recommendation: Recommendation) => void;
  favorites?: Set<string>;
  playingSongId?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  accessibilityLabel,
  onPlaySong,
  onCardPress,
  onToggleFavorite,
  favorites = new Set(),
  playingSongId,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const isUserMessage = message.sender === 'user';
  const hasRecommendations = message.recommendations && message.recommendations.length > 0;
  const screenWidth = Dimensions.get('window').width;
  // Wider bubble for messages with recommendations
  const maxBubbleWidth = screenWidth * (hasRecommendations ? 0.95 : designSystem.components.messageBubble.maxWidth);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: designSystem.animation.duration.normal,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Separate recommendations by type
  const highlightRec = message.recommendations?.find(rec => rec.type === 'highlight');
  const deepCutRecs = message.recommendations?.filter(rec => rec.type === 'deep-cut') || [];
  const mainstreamRecs = message.recommendations?.filter(rec => rec.type === 'mainstream') || [];

  const bubbleStyle: ViewStyle = {
    maxWidth: maxBubbleWidth,
    marginVertical: designSystem.spacing[2],
    marginHorizontal: designSystem.spacing[3],
    paddingHorizontal: hasRecommendations ? designSystem.spacing[5] : designSystem.spacing[4],
    paddingVertical: hasRecommendations ? designSystem.spacing[4] : designSystem.spacing[3],
    borderRadius: designSystem.borderRadius.xl,
    backgroundColor: isUserMessage
      ? designSystem.colors.chat.userMessage.background
      : designSystem.colors.chat.aiMessage.background,
    ...(isUserMessage
      ? {
          borderTopRightRadius: designSystem.borderRadius.sm,
          alignSelf: 'flex-end' as const,
        }
      : {
          borderTopLeftRadius: designSystem.borderRadius.sm,
          alignSelf: 'flex-start' as const,
        }),
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: designSystem.shadows.sm.shadowColor,
          shadowOffset: designSystem.shadows.sm.shadowOffset,
          shadowOpacity: designSystem.shadows.sm.shadowOpacity,
          shadowRadius: designSystem.shadows.sm.shadowRadius,
        }
      : { elevation: designSystem.shadows.sm.elevation }),
  };

  const textStyle: TextStyle = {
    fontSize: designSystem.typography.fontSize.base,
    lineHeight: designSystem.typography.lineHeight.normal * designSystem.typography.fontSize.base,
    fontWeight: designSystem.typography.fontWeight.regular,
    color: isUserMessage
      ? designSystem.colors.chat.userMessage.text
      : designSystem.colors.chat.aiMessage.text,
  };

  const timestampStyle: TextStyle = {
    fontSize: designSystem.typography.fontSize.xs,
    fontWeight: designSystem.typography.fontWeight.regular,
    color: designSystem.colors.light.text.tertiary,
    marginTop: designSystem.spacing[1],
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      accessible={true}
      accessibilityLabel={
        accessibilityLabel || `${isUserMessage ? 'Your' : 'AI'} message: ${message.text}`
      }
    >
      <View style={bubbleStyle}>
        <Text style={textStyle}>{message.text}</Text>
        <Text style={timestampStyle}>{formatTimestamp(message.timestamp)}</Text>

        {/* Recommendations inline with message (Figma design) */}
        {hasRecommendations && (
          <View style={{ marginTop: designSystem.spacing[4] }}>
            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: 'rgba(156, 163, 175, 0.2)', // gray-400/20
                marginBottom: designSystem.spacing[6],
              }}
            />

            {/* Highlight Pick */}
            {highlightRec && (
              <View style={{ marginBottom: designSystem.spacing[6] }}>
                <RecommendationList
                  recommendations={[highlightRec]}
                  type="highlight"
                  onPlaySong={onPlaySong!}
                  onCardPress={onCardPress}
                  onToggleFavorite={onToggleFavorite}
                  favorites={favorites}
                  playingSongId={playingSongId}
                />
              </View>
            )}

            {/* Deep Cuts */}
            {deepCutRecs.length > 0 && (
              <View style={{ marginBottom: designSystem.spacing[6] }}>
                <RecommendationList
                  recommendations={deepCutRecs}
                  type="deep-cuts"
                  onPlaySong={onPlaySong!}
                  onCardPress={onCardPress}
                  onToggleFavorite={onToggleFavorite}
                  favorites={favorites}
                  playingSongId={playingSongId}
                />
              </View>
            )}

            {/* Mainstream Picks */}
            {mainstreamRecs.length > 0 && (
              <View>
                <RecommendationList
                  recommendations={mainstreamRecs}
                  type="mainstream"
                  onPlaySong={onPlaySong!}
                  onCardPress={onCardPress}
                  onToggleFavorite={onToggleFavorite}
                  favorites={favorites}
                  playingSongId={playingSongId}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default MessageBubble;
