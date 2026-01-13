import React from 'react';
import {
  Pressable,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  AccessibilityRole,
  View,
} from 'react-native';
import { designSystem } from '@/constants/designSystem';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state (shows spinner) */
  loading?: boolean;
  /** Button press handler */
  onPress: () => void;
  /** Button content/label */
  children: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
}

const getButtonStyle = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  loading: boolean
): { container: ViewStyle; text: TextStyle } => {
  // Size styles
  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        height: designSystem.layout.button.sm,
        paddingHorizontal: designSystem.spacing[3],
        borderRadius: designSystem.borderRadius.md,
      },
      text: {
        fontSize: designSystem.typography.fontSize.sm,
        fontWeight: designSystem.typography.fontWeight.medium,
      },
    },
    md: {
      container: {
        height: designSystem.layout.button.md,
        paddingHorizontal: designSystem.spacing[4],
        borderRadius: designSystem.borderRadius.lg,
      },
      text: {
        fontSize: designSystem.typography.fontSize.base,
        fontWeight: designSystem.typography.fontWeight.semibold,
      },
    },
    lg: {
      container: {
        height: designSystem.layout.button.lg,
        paddingHorizontal: designSystem.spacing[6],
        borderRadius: designSystem.borderRadius.lg,
      },
      text: {
        fontSize: designSystem.typography.fontSize.lg,
        fontWeight: designSystem.typography.fontWeight.semibold,
      },
    },
  };

  // Variant styles
  const getVariantStyle = (
    variant: ButtonVariant
  ): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled
              ? designSystem.colors.interactive.disabled
              : designSystem.colors.primary.main,
            ...designSystem.shadows.md,
          },
          text: {
            color: disabled
              ? designSystem.colors.light.text.tertiary
              : designSystem.colors.primary.foreground,
          },
        };

      case 'secondary':
        return {
          container: {
            backgroundColor: disabled
              ? designSystem.colors.interactive.disabled
              : designSystem.colors.secondary.main,
            ...designSystem.shadows.md,
          },
          text: {
            color: disabled
              ? designSystem.colors.light.text.tertiary
              : designSystem.colors.secondary.foreground,
          },
        };

      case 'outline':
        return {
          container: {
            backgroundColor: designSystem.colors.light.surface.primary,
            borderWidth: 2,
            borderColor: disabled
              ? designSystem.colors.light.border.light
              : designSystem.colors.primary.main,
          },
          text: {
            color: disabled
              ? designSystem.colors.light.text.tertiary
              : designSystem.colors.primary.main,
          },
        };

      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: disabled
              ? designSystem.colors.light.text.tertiary
              : designSystem.colors.primary.main,
          },
        };

      default:
        return { container: {}, text: {} };
    }
  };

  const sizeStyle = sizeStyles[size];
  const variantStyle = getVariantStyle(variant);

  return {
    container: { ...sizeStyle.container, ...variantStyle.container },
    text: { ...sizeStyle.text, ...variantStyle.text },
  };
};

/**
 * Reusable Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button onPress={() => console.log('Pressed')} variant="primary" size="md">
 *   Press Me
 * </Button>
 *
 * <Button
 *   onPress={handleSubmit}
 *   variant="secondary"
 *   size="lg"
 *   loading={isLoading}
 *   disabled={!isFormValid}
 * >
 *   Submit Form
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  children,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  containerStyle,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const styles = getButtonStyle(variant, size, isDisabled, loading);

  const containerFinalStyle: ViewStyle = {
    ...styles.container,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : 'auto',
    opacity: isDisabled && variant !== 'outline' && variant !== 'ghost' ? 0.6 : 1,
    ...containerStyle,
  };

  const textFinalStyle: TextStyle = {
    ...styles.text,
    marginLeft: loading ? designSystem.spacing[2] : 0,
    ...textStyle,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Button')}
      accessibilityHint={
        accessibilityHint || (isDisabled ? 'Button is disabled' : 'Double tap to activate')
      }
      style={({ pressed }) => ({
        ...containerFinalStyle,
        backgroundColor:
          variant === 'outline' || variant === 'ghost'
            ? containerFinalStyle.backgroundColor
            : pressed && !isDisabled
              ? typeof containerFinalStyle.backgroundColor === 'string'
                ? `${containerFinalStyle.backgroundColor}cc`
                : containerFinalStyle.backgroundColor
              : containerFinalStyle.backgroundColor,
      })}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? designSystem.colors.primary.foreground
              : variant === 'secondary'
                ? designSystem.colors.secondary.foreground
                : designSystem.colors.primary.main
          }
        />
      )}
      {typeof children === 'string' ? (
        <Text style={textFinalStyle} numberOfLines={1}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

export default Button;
