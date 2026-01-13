import React from 'react';
import { Text, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { designSystem } from '@/constants/designSystem';

interface PreferenceChipProps {
  label: string;
  onRemove?: () => void;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

export const PreferenceChip: React.FC<PreferenceChipProps> = ({
  label,
  onRemove,
  onPress,
  backgroundColor = 'rgba(147, 51, 234, 0.3)', // purple-600/30
  textColor = '#D8B4FE', // purple-300
  borderColor = 'rgba(168, 85, 247, 0.3)', // purple-500/30
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor, borderColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress || onRemove}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={textColor} />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    paddingHorizontal: designSystem.spacing[3],
    paddingVertical: 6, // spacing between 1 (4px) and 2 (8px)
    borderRadius: designSystem.borderRadius.full,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
