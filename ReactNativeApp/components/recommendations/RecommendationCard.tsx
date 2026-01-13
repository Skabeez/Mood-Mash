import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Animated,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Recommendation, RecommendationType } from '@/types';
import { designSystem } from '@/constants/designSystem';
import PlayButton from './PlayButton';

interface RecommendationCardProps {
  /** Recommendation data */
  recommendation: Recommendation;
  /** Handler for card press */
  onPress?: (recommendation: Recommendation) => void;
  /** Visual variant */
  variant: RecommendationType;
  /** Whether the song is currently playing */
  isPlaying?: boolean;
  /** Handler for play button press */
  onPlayPress?: (recommendation: Recommendation) => void;
  /** Whether song is favorited */
  isFavorite?: boolean;
  /** Handler for favorite toggle */
  onToggleFavorite?: (recommendation: Recommendation) => void;
}

/**
 * Beautiful card for displaying song recommendations
 * Matches exact Figma design from web app
 * Supports three variants: highlight (large), deep-cut, mainstream
 */
const RecommendationCard: React.FC<RecommendationCardProps> = React.memo(
  ({
    recommendation,
    onPress,
    variant,
    isPlaying = false,
    onPlayPress,
    isFavorite = false,
    onToggleFavorite,
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [imageError, setImageError] = useState(false);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        friction: 3,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }).start();
    };

    const handlePress = () => {
      if (onPress) {
        onPress(recommendation);
      }
    };

    const handlePlayPress = () => {
      if (onPlayPress) {
        onPlayPress(recommendation);
      }
    };

    const handleFavoritePress = () => {
      if (onToggleFavorite) {
        onToggleFavorite(recommendation);
      }
    };

    // Variant-specific dimensions and styles (matching Figma web design)
    const getVariantStyles = () => {
      const isHighlight = variant === 'highlight';
      const imageSize = isHighlight ? 112 : 160; // w-28 (112px) for highlight, 160px for others

      const baseContainer: ViewStyle = {
        borderRadius: designSystem.borderRadius.xl,
        overflow: 'hidden',
        zIndex: 10,
      };

      switch (variant) {
        case 'highlight':
          return {
            imageSize,
            container: {
              ...baseContainer,
              width: '100%',
              padding: designSystem.spacing[4],
              backgroundColor: 'rgba(55, 65, 81, 0.6)', // gray-700/60
              ...designSystem.shadows.xl,
            } as ViewStyle,
            layout: 'row' as const,
            showGradient: true,
            gradientColors: ['rgba(55, 65, 81, 0.6)', 'rgba(31, 41, 55, 0.6)'], // gray-700 to gray-800
          };

        case 'deep-cut':
        case 'mainstream':
          return {
            imageSize,
            container: {
              ...baseContainer,
              width: 180,
              padding: designSystem.spacing[3],
              backgroundColor: 'rgba(55, 65, 81, 0.5)', // gray-700/50
            } as ViewStyle,
            layout: 'column' as const,
            showGradient: false,
            gradientColors: [],
          };

        default:
          return {
            imageSize: 160,
            container: baseContainer,
            layout: 'column' as const,
            showGradient: false,
            gradientColors: [],
          };
      }
    };

    const variantStyles = getVariantStyles();

    const imageContainerStyle: ViewStyle = {
      width: variantStyles.imageSize,
      height: variantStyles.imageSize,
      borderRadius: designSystem.borderRadius.xl,
      overflow: 'hidden',
      backgroundColor: '#1F2937', // gray-800
      position: 'relative',
    };

    const imageStyle: ImageStyle = {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    };

    const contentContainerStyle: ViewStyle = {
      flex: variant === 'highlight' ? 1 : undefined,
      marginLeft: variantStyles.layout === 'row' ? designSystem.spacing[4] : 0,
      marginTop: variantStyles.layout === 'column' ? designSystem.spacing[3] : 0,
      justifyContent: 'space-between',
      paddingVertical: variantStyles.layout === 'column' ? designSystem.spacing[2] : 0,
    };

    const titleStyle: TextStyle = {
      fontSize:
        variant === 'highlight'
          ? designSystem.typography.fontSize.lg
          : designSystem.typography.fontSize.sm,
      fontWeight:
        variant === 'highlight'
          ? designSystem.typography.fontWeight.semibold
          : designSystem.typography.fontWeight.medium,
      color: '#FFFFFF',
      marginBottom: designSystem.spacing[1],
      lineHeight: variant === 'highlight' ? 24 : 18,
    };

    const artistStyle: TextStyle = {
      fontSize:
        variant === 'highlight'
          ? designSystem.typography.fontSize.sm
          : designSystem.typography.fontSize.xs,
      fontWeight: designSystem.typography.fontWeight.regular,
      color: variant === 'highlight' ? '#D1D5DB' : '#9CA3AF', // gray-300 / gray-400
      marginBottom: variant === 'highlight' ? 0 : designSystem.spacing[2],
      lineHeight: variant === 'highlight' ? 18 : 14,
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={variantStyles.container}
          accessible={true}
          accessibilityLabel={`${recommendation.title} by ${recommendation.artist}`}
          accessibilityHint="Double tap to view song details"
        >
          {variantStyles.showGradient && (
            <LinearGradient
              colors={variantStyles.gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          )}

          <View
            style={{
              flexDirection: variantStyles.layout,
              alignItems: variantStyles.layout === 'row' ? 'center' : 'flex-start',
            }}
          >
            {/* Album Art with Play Button */}
            <View style={imageContainerStyle}>
              {!imageError ? (
                <Image
                  source={{ uri: recommendation.albumArt }}
                  style={imageStyle}
                  onError={() => setImageError(true)}
                  accessibilityLabel={`Album art for ${recommendation.title}`}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#1F2937',
                  }}
                >
                  <Text style={{ fontSize: 32 }}>🎵</Text>
                </View>
              )}
              <PlayButton
                onPress={handlePlayPress}
                isPlaying={isPlaying}
                size={variant === 'highlight' ? 44 : 36}
              />
            </View>

            {/* Content */}
            <View style={contentContainerStyle}>
              <View>
                <Text style={titleStyle} numberOfLines={2} ellipsizeMode="tail">
                  {recommendation.title}
                </Text>
                <Text style={artistStyle} numberOfLines={1} ellipsizeMode="tail">
                  {recommendation.artist}
                </Text>
              </View>

              {/* Action Buttons */}
              {variant === 'highlight' ? (
                // Highlight: Play button + Favorite button
                <View
                  style={{
                    flexDirection: 'row',
                    gap: designSystem.spacing[2],
                    marginTop: designSystem.spacing[3],
                  }}
                >
                  <Pressable
                    onPress={handlePlayPress}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: designSystem.spacing[2],
                      paddingVertical: 10,
                      borderRadius: designSystem.borderRadius.lg,
                      backgroundColor: '#0D9488', // teal-600
                    }}
                  >
                    <Ionicons name="play" size={16} color="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.medium,
                        color: '#FFFFFF',
                      }}
                    >
                      Play
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleFavoritePress}
                    style={{
                      paddingHorizontal: designSystem.spacing[3],
                      paddingVertical: 10,
                      borderRadius: designSystem.borderRadius.lg,
                      backgroundColor: 'rgba(55, 65, 81, 0.5)', // gray-700/50
                    }}
                  >
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorite ? '#EC4899' : '#D1D5DB'} // pink-500 / gray-300
                    />
                  </Pressable>
                </View>
              ) : (
                // Regular cards: Save/Favorite button
                <Pressable
                  onPress={handleFavoritePress}
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: designSystem.spacing[2],
                    paddingVertical: designSystem.spacing[3],
                    paddingHorizontal: designSystem.spacing[2],
                    borderRadius: designSystem.borderRadius.lg,
                    backgroundColor: 'rgba(31, 41, 55, 0.5)', // gray-800/50
                    minHeight: 44,
                  }}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={16}
                    color={isFavorite ? '#EC4899' : '#9CA3AF'} // pink-500 / gray-400
                  />
                  <Text
                    style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: '#D1D5DB', // gray-300
                    }}
                  >
                    {isFavorite ? 'Saved' : 'Save'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }
);

RecommendationCard.displayName = 'RecommendationCard';

export { RecommendationCard };
export default RecommendationCard;
