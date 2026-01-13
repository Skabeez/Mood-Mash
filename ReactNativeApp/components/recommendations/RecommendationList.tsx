import React from 'react';
import {
  View,
  Text,
  FlatList,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Recommendation, RecommendationType } from '@/types';
import { designSystem } from '@/constants/designSystem';
import { RecommendationCard } from './RecommendationCard';

interface RecommendationListProps {
  /** List of recommendations to display */
  recommendations: Recommendation[];
  /** Type of recommendations section */
  type: 'highlight' | 'deep-cuts' | 'mainstream';
  /** Handler for when a song is pressed to play */
  onPlaySong: (recommendation: Recommendation) => void;
  /** Handler for when a card is pressed */
  onCardPress?: (recommendation: Recommendation) => void;
  /** Handler for favorite toggle */
  onToggleFavorite?: (recommendation: Recommendation) => void;
  /** Map of favorited song IDs */
  favorites?: Set<string>;
  /** Current playing song ID */
  playingSongId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Show section even if empty */
  showWhenEmpty?: boolean;
}

/**
 * Section component for displaying a list of recommendations
 * Handles different layouts for different recommendation types
 */
export const RecommendationList: React.FC<RecommendationListProps> = React.memo(
  ({
    onToggleFavorite,
    favorites = new Set(),
    recommendations,
    type,
    onPlaySong,
    onCardPress,
    playingSongId,
    isLoading = false,
    showWhenEmpty = false,
  }) => {
    // Don't render if empty and not forced to show
    if (!isLoading && recommendations.length === 0 && !showWhenEmpty) {
      return null;
    }

    const getSectionConfig = () => {
      switch (type) {
        case 'highlight':
          return {
            title: '✨ Highlight Pick',
            titleColor: '#2DD4BF', // teal-400
            variant: 'highlight' as RecommendationType,
            horizontal: false,
            numColumns: 1,
          };
        case 'deep-cuts':
          return {
            title: '🎵 Deep Cuts',
            titleColor: '#C084FC', // purple-400
            variant: 'deep-cut' as RecommendationType,
            horizontal: true,
            numColumns: undefined,
          };
        case 'mainstream':
          return {
            title: '🔥 Mainstream Picks',
            titleColor: '#F9A8D4', // pink-400
            variant: 'mainstream' as RecommendationType,
            horizontal: true,
            numColumns: undefined,
          };
        default:
          return {
            title: 'Recommendations',
            titleColor: '#9CA3AF',
            variant: 'mainstream' as RecommendationType,
            horizontal: true,
            numColumns: undefined,
          };
      }
    };

    const config = getSectionConfig();

    const headerStyle: TextStyle = {
      fontSize: designSystem.typography.fontSize.sm,
      fontWeight: designSystem.typography.fontWeight.semibold,
      color: config.titleColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: designSystem.spacing[3],
      paddingHorizontal: config.horizontal ? designSystem.spacing[4] : 0,
    };

    const containerStyle: ViewStyle = {
      marginBottom: designSystem.spacing[6],
    };

    const emptyContainerStyle: ViewStyle = {
      padding: designSystem.spacing[6],
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: designSystem.colors.light.background.secondary,
      borderRadius: designSystem.borderRadius.xl,
      marginHorizontal: config.horizontal ? designSystem.spacing[4] : 0,
    };

    const emptyTextStyle: TextStyle = {
      fontSize: designSystem.typography.fontSize.base,
      color: designSystem.colors.light.text.secondary,
      textAlign: 'center',
    };

    const renderItem = ({ item }: { item: Recommendation }) => (
      <View
        style={{
          marginRight: config.horizontal ? designSystem.spacing[3] : 0,
          marginBottom: config.horizontal ? 0 : designSystem.spacing[3],
        }}
      >
        <RecommendationCard
          recommendation={item}
          variant={config.variant}
          onPress={onCardPress}
          onPlayPress={onPlaySong}
          isPlaying={playingSongId === item.id}
          isFavorite={favorites.has(item.id)}
          onToggleFavorite={onToggleFavorite}
        />
      </View>
    );

    const renderLoadingSkeleton = () => {
      const skeletonCount = config.horizontal ? 3 : 1;
      return (
        <View
          style={{
            flexDirection: config.horizontal ? 'row' : 'column',
            paddingHorizontal: config.horizontal ? designSystem.spacing[4] : 0,
          }}
        >
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <View
              key={`skeleton-${index}`}
              style={{
                width: config.horizontal ? 180 : '100%',
                height: config.variant === 'highlight' ? 140 : 180,
                backgroundColor: designSystem.colors.light.background.secondary,
                borderRadius: designSystem.borderRadius.xl,
                marginRight: config.horizontal ? designSystem.spacing[3] : 0,
                marginBottom: config.horizontal ? 0 : designSystem.spacing[3],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator
                size="large"
                color={designSystem.colors.primary.main}
              />
            </View>
          ))}
        </View>
      );
    };

    const renderEmptyState = () => {
      if (isLoading) return null;

      return (
        <View style={emptyContainerStyle}>
          <Text style={{ fontSize: 32, marginBottom: designSystem.spacing[2] }}>
            🎵
          </Text>
          <Text style={emptyTextStyle}>
            {type === 'highlight'
              ? 'No highlight available yet'
              : type === 'deep-cuts'
                ? 'No hidden gems found'
                : 'No trending picks available'}
          </Text>
        </View>
      );
    };

    return (
      <View style={containerStyle}>
        {/* Section Header */}
        <Text style={headerStyle}>{config.title}</Text>

        {/* Loading State */}
        {isLoading && renderLoadingSkeleton()}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && renderEmptyState()}

        {/* Recommendations List */}
        {!isLoading && recommendations.length > 0 && (
          <FlatList
            data={recommendations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal={config.horizontal}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: config.horizontal ? designSystem.spacing[4] : 0,
            }}
            ItemSeparatorComponent={
              config.horizontal
                ? undefined
                : () => <View style={{ height: designSystem.spacing[3] }} />
            }
            scrollEnabled={config.horizontal}
            nestedScrollEnabled={config.horizontal}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={50}
            windowSize={5}
          />
        )}
      </View>
    );
  }
);

RecommendationList.displayName = 'RecommendationList';
