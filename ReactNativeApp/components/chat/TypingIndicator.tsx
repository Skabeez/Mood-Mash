import React, { useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  ViewStyle,
  Platform,
  Dimensions,
  AccessibilityRole,
} from 'react-native';
import { designSystem } from '@/constants/designSystem';

interface TypingIndicatorProps {
  visible?: boolean;
  accessibilityLabel?: string;
}

const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const translateY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -10,
          duration: designSystem.animation.duration.slow,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: designSystem.animation.duration.slow,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [translateY, delay]);

  return (
    <Animated.View
      style={{
        width: designSystem.spacing[2],
        height: designSystem.spacing[2],
        borderRadius: designSystem.borderRadius.full,
        backgroundColor: designSystem.colors.light.text.secondary,
        marginHorizontal: designSystem.spacing[1],
        transform: [{ translateY }],
      }}
    />
  );
};

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  visible = true,
  accessibilityLabel = 'AI is typing',
}) => {
  const screenWidth = Dimensions.get('window').width;
  const maxBubbleWidth = screenWidth * designSystem.components.messageBubble.maxWidth;

  if (!visible) {
    return null;
  }

  const bubbleStyle: ViewStyle = {
    maxWidth: maxBubbleWidth,
    marginVertical: designSystem.spacing[2],
    marginHorizontal: designSystem.spacing[3],
    paddingHorizontal: designSystem.spacing[4],
    paddingVertical: designSystem.spacing[3],
    borderRadius: designSystem.borderRadius.xl,
    borderTopLeftRadius: designSystem.borderRadius.sm,
    backgroundColor: designSystem.colors.chat.aiMessage.background,
    alignSelf: 'flex-start' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: designSystem.shadows.sm.shadowColor,
          shadowOffset: designSystem.shadows.sm.shadowOffset,
          shadowOpacity: designSystem.shadows.sm.shadowOpacity,
          shadowRadius: designSystem.shadows.sm.shadowRadius,
        }
      : { elevation: designSystem.shadows.sm.elevation }),
  };

  return (
    <View
      style={bubbleStyle}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      <Text
        style={{
          fontSize: designSystem.typography.fontSize.base,
          fontWeight: designSystem.typography.fontWeight.regular,
          marginRight: designSystem.spacing[2],
          color: designSystem.colors.chat.aiMessage.text,
        }}
      >
        🎵 Finding perfect tracks...
      </Text>
      <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
        <Dot delay={0} />
        <Dot delay={designSystem.animation.duration.fast} />
        <Dot delay={designSystem.animation.duration.normal} />
      </View>
    </View>
  );
};

export default TypingIndicator;
