import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  SafeAreaView,
  ScrollView,
  AccessibilityRole,
} from 'react-native';
import { designSystem } from '@/constants/designSystem';

interface WelcomeMessageProps {
  onSuggestionPress: (suggestion: string) => void;
  accessibilityLabel?: string;
}

interface SuggestionChipProps {
  text: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({
  text,
  onPress,
  accessibilityLabel,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginVertical: designSystem.spacing[2],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible={true}
        accessibilityLabel={accessibilityLabel || text}
        style={{
          height: 44,
          paddingHorizontal: designSystem.spacing[5],
          borderRadius: designSystem.borderRadius.full,
          borderWidth: 2,
          borderColor: '#374151', // gray-700
          backgroundColor: '#1F2937', // gray-800
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        }}
      >
        <Text
          style={{
            fontSize: designSystem.typography.fontSize.base,
            fontWeight: designSystem.typography.fontWeight.semibold,
            color: '#A78BFA', // purple-400
            textAlign: 'center' as const,
          }}
        >
          {text}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  onSuggestionPress,
  accessibilityLabel = 'Welcome to AI Music Recommendation',
}) => {
  const suggestions = [
    '🎭 Surprise me with something energetic',
    '🎸 Recommend based on my taste',
    '🌙 Perfect for a chill evening',
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: designSystem.spacing[5],
          paddingVertical: designSystem.spacing[12],
        }}
        scrollEnabled={false}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
      >
        {/* Greeting */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: designSystem.typography.fontWeight.bold,
            color: '#F9FAFB', // gray-50
            textAlign: 'center' as const,
            marginBottom: designSystem.spacing[3],
          }}
        >
          👋 Hey! I'm your AI music buddy
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.regular,
            color: '#9CA3AF', // gray-400
            textAlign: 'center' as const,
            marginBottom: designSystem.spacing[12],
            lineHeight: 28,
          }}
        >
          Ask me for recommendations based on your mood, activity, or favorite artists
        </Text>

        {/* Suggestion Chips */}
        <View style={{ width: '100%', alignItems: 'center' as const }}>
          {suggestions.map((suggestion, index) => (
            <SuggestionChip
              key={index}
              text={suggestion}
              onPress={() => onSuggestionPress(suggestion)}
              accessibilityLabel={`Suggestion: ${suggestion}`}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeMessage;
