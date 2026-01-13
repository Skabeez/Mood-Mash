import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { RecommendationType } from '@/types';
import { designSystem } from '@/constants/designSystem';

interface TypeBadgeProps {
  /** Type of recommendation */
  type: RecommendationType;
  /** Custom container style */
  style?: ViewStyle;
}

/**
 * Small pill badge indicating recommendation type
 * Shows appropriate icon and background color per type
 */
export const TypeBadge: React.FC<TypeBadgeProps> = React.memo(({ type, style }) => {
  const getBadgeConfig = (type: RecommendationType) => {
    switch (type) {
      case 'highlight':
        return {
          icon: '⭐',
          text: 'Highlight',
          backgroundColor: '#FBBF24', // Yellow-400
          textColor: '#78350F', // Yellow-900
        };
      case 'deep-cut':
        return {
          icon: '💎',
          text: 'Deep Cut',
          backgroundColor: designSystem.colors.music.deepCut.primary,
          textColor: designSystem.colors.primary.foreground,
        };
      case 'mainstream':
        return {
          icon: '🔥',
          text: 'Trending',
          backgroundColor: '#F97316', // Orange-500
          textColor: designSystem.colors.primary.foreground,
        };
      default:
        return {
          icon: '🎵',
          text: 'Song',
          backgroundColor: designSystem.colors.light.surface.secondary,
          textColor: designSystem.colors.light.text.primary,
        };
    }
  };

  const config = getBadgeConfig(type);

  const containerStyle: ViewStyle = {
    height: 24,
    paddingHorizontal: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.full,
    backgroundColor: config.backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    ...style,
  };

  const textStyle: TextStyle = {
    fontSize: designSystem.typography.fontSize.xs,
    fontWeight: designSystem.typography.fontWeight.semibold,
    color: config.textColor,
    marginLeft: designSystem.spacing[1],
  };

  const iconStyle: TextStyle = {
    fontSize: designSystem.typography.fontSize.xs,
  };

  return (
    <View style={containerStyle}>
      <Text style={iconStyle}>{config.icon}</Text>
      <Text style={textStyle}>{config.text}</Text>
    </View>
  );
});

TypeBadge.displayName = 'TypeBadge';

export default TypeBadge;
