import React from 'react';
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { designSystem } from '@/constants/designSystem';

type RightElementType = 'switch' | 'chevron' | 'custom';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  rightElement?: RightElementType;
  customRightElement?: React.ReactNode;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  iconColor?: string;
  destructive?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  rightElement = 'chevron',
  customRightElement,
  switchValue = false,
  onSwitchChange,
  onPress,
  iconColor = '#9CA3AF', // gray-400
  destructive = false,
}) => {
  const renderRightElement = () => {
    if (customRightElement) {
      return customRightElement;
    }

    switch (rightElement) {
      case 'switch':
        return (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#374151', true: '#9333EA' }} // gray-700, purple-600
            thumbColor={switchValue ? '#F3F4F6' : '#9CA3AF'} // gray-100, gray-400
            ios_backgroundColor="#374151"
          />
        );
      case 'chevron':
        return <Ionicons name="chevron-forward" size={20} color="#6B7280" />;
      default:
        return null;
    }
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, destructive && styles.destructiveText]}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.rightContent}>{renderRightElement()}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
};

const styles = StyleSheet.create({
  pressable: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // gray-800/50
    borderRadius: designSystem.borderRadius['2xl'],
    marginBottom: designSystem.spacing[2],
  },
  pressed: {
    backgroundColor: 'rgba(31, 41, 55, 0.7)', // gray-800/70
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designSystem.spacing[4],
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[3],
    minWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)', // gray-700/50
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF', // gray-400
  },
  destructiveText: {
    color: '#EF4444', // red-500
  },
  rightContent: {
    marginLeft: designSystem.spacing[3],
  },
});
