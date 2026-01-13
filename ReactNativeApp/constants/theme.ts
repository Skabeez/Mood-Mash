/**
 * Theme Configuration
 * Contains all design tokens for the music recommendation chat app
 */

/**
 * Color palette for the application
 */
export const colors = {
  // Primary colors
  primary: '#007AFF',
  secondary: '#5856D6',
  
  // Background colors
  background: '#F2F2F7',
  backgroundSecondary: '#FFFFFF',
  
  // Chat bubble colors
  userBubble: '#007AFF',
  aiBubble: '#E5E5EA',
  
  // Text colors
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#00C7FF',
  
  // Semantic colors
  border: '#D1D1D6',
  borderLight: '#E5E5EA',
  disabled: '#C7C7CC',
  
  // Recommendation type colors
  highlight: '#FF3B30',
  deepCut: '#5856D6',
  mainstream: '#34C759',
  
  // Gradient support
  gradientStart: '#007AFF',
  gradientEnd: '#5856D6',
} as const;

/**
 * Spacing scale
 * Used for padding, margin, gaps
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

/**
 * Border radius scale
 */
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  circle: 999,
} as const;

/**
 * iOS shadow style
 */
export const shadowIOS = {
  shadowColor: '#000000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
} as const;

/**
 * Android elevation levels
 */
export const elevationAndroid = {
  low: 2,
  medium: 4,
  high: 8,
  veryHigh: 12,
} as const;

/**
 * Typography scales
 */
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const animation = {
  fast: 150,
  base: 300,
  slow: 500,
  verySlow: 1000,
} as const;

/**
 * Opacity values
 */
export const opacity = {
  disabled: 0.5,
  medium: 0.7,
  hover: 0.8,
  active: 0.9,
  full: 1,
} as const;

/**
 * Complete theme object for easy access
 */
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadowIOS,
  elevationAndroid,
  typography,
  animation,
  opacity,
} as const;

/**
 * Get shadow styles based on platform
 */
export const getShadow = (level: 'low' | 'medium' | 'high' | 'veryHigh' = 'medium') => {
  return {
    ...shadowIOS,
    shadowOpacity: {
      low: 0.15,
      medium: 0.25,
      high: 0.4,
      veryHigh: 0.5,
    }[level],
    shadowRadius: {
      low: 2,
      medium: 4,
      high: 8,
      veryHigh: 12,
    }[level],
  };
};

/**
 * Get elevation level for Android
 */
export const getElevation = (level: 'low' | 'medium' | 'high' | 'veryHigh' = 'medium') => {
  return elevationAndroid[level];
};

/**
 * Common component styles
 */
export const componentStyles = {
  userBubbleStyle: {
    backgroundColor: colors.userBubble,
    borderRadius: borderRadius.xlarge,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '80%',
  },
  
  aiBubbleStyle: {
    backgroundColor: colors.aiBubble,
    borderRadius: borderRadius.xlarge,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '80%',
  },
  
  inputStyle: {
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  cardStyle: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    ...shadowIOS,
  },
  
  recommendationCardStyle: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
} as const;

export default theme;
