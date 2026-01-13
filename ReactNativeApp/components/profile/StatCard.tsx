import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { designSystem } from '@/constants/designSystem';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  gradientColors?: [string, string];
  iconColor?: string;
  borderColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle = '',
  gradientColors = ['rgba(147, 51, 234, 0.3)', 'rgba(147, 51, 234, 0.2)'], // purple-600/30 to purple-600/20
  iconColor = '#C084FC', // purple-400
  borderColor = 'rgba(168, 85, 247, 0.2)', // purple-500/20
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderColor }]}
      >
        <View style={styles.header}>
          <Ionicons name={icon} size={20} color={iconColor} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
  },
  gradient: {
    borderRadius: designSystem.borderRadius['2xl'],
    padding: designSystem.spacing[4],
    borderWidth: 1,
    ...designSystem.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[2],
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB', // gray-300
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: designSystem.spacing[1],
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF', // gray-400
  },
});
