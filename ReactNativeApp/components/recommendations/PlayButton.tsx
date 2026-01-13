import React, { useRef } from 'react';
import { Pressable, Animated, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { designSystem } from '@/constants/designSystem';

interface PlayButtonProps {
  /** Handler for button press */
  onPress: () => void;
  /** Whether the song is currently playing */
  isPlaying?: boolean;
  /** Size of the button (default: 36) */
  size?: number;
  /** Accessibility label override */
  accessibilityLabel?: string;
}

/**
 * Circular play/pause button overlay for album art
 * Features press animation and semi-transparent background
 */
export const PlayButton: React.FC<PlayButtonProps> = React.memo(
  ({ onPress, isPlaying = false, size = 36, accessibilityLabel }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 1.1,
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

    const buttonStyle: ViewStyle = {
      position: 'absolute',
      right: designSystem.spacing[2],
      bottom: designSystem.spacing[2],
      width: size,
      height: size,
      borderRadius: designSystem.borderRadius.full,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      ...designSystem.shadows.md,
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={buttonStyle}
          accessible={true}
          accessibilityLabel={accessibilityLabel || (isPlaying ? 'Pause' : 'Play')}
          accessibilityHint={`Double tap to ${isPlaying ? 'pause' : 'play'} this song`}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={size * 0.5}
            color={designSystem.colors.primary.foreground}
            style={{ marginLeft: isPlaying ? 0 : 2 }} // Slight offset for play icon centering
          />
        </Pressable>
      </Animated.View>
    );
  }
);

PlayButton.displayName = 'PlayButton';

export default PlayButton;
