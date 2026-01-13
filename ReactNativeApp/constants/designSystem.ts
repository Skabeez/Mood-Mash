/**
 * Design System for Music Recommendation App
 * Based on Figma design specifications
 * Includes light and dark mode variants
 */

import { Platform } from 'react-native';

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Colors
  primary: {
    main: '#8B5CF6',        // Purple - main brand color
    light: '#A78BFA',       // Light purple variant
    dark: '#7C3AED',        // Dark purple variant
    foreground: '#FFFFFF',  // Text on primary
  },

  // Secondary Colors
  secondary: {
    main: '#14B8A6',        // Teal - accent color
    light: '#2DD4BF',       // Light teal variant
    dark: '#0D9488',        // Dark teal variant
    foreground: '#FFFFFF',  // Text on secondary
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',     // Green
    error: '#EF4444',       // Red
    warning: '#F59E0B',     // Amber
    info: '#3B82F6',        // Blue
  },

  // Neutral Colors - Light Mode
  light: {
    background: {
      primary: '#FFFFFF',     // Main background
      secondary: '#F9FAFB',   // Secondary background
      tertiary: '#F3F4F6',    // Tertiary background
    },
    surface: {
      primary: '#FFFFFF',     // Card background
      secondary: '#F9FAFB',   // Alternative surface
      elevated: '#FFFFFF',    // Elevated surfaces
    },
    border: {
      light: 'rgba(0, 0, 0, 0.06)',    // Subtle borders
      medium: 'rgba(0, 0, 0, 0.1)',    // Regular borders
      strong: 'rgba(0, 0, 0, 0.2)',    // Strong borders
    },
    text: {
      primary: '#111827',     // Main text
      secondary: '#6B7280',   // Secondary text
      tertiary: '#9CA3AF',    // Tertiary text
      inverse: '#FFFFFF',     // Text on dark backgrounds
      disabled: '#D1D5DB',    // Disabled text
    },
  },

  // Neutral Colors - Dark Mode
  dark: {
    background: {
      primary: '#0F172A',     // Main background (slate-900)
      secondary: '#1E293B',   // Secondary background (slate-800)
      tertiary: '#334155',    // Tertiary background (slate-700)
    },
    surface: {
      primary: '#1E293B',     // Card background
      secondary: '#334155',   // Alternative surface
      elevated: '#475569',    // Elevated surfaces
    },
    border: {
      light: 'rgba(255, 255, 255, 0.06)',    // Subtle borders
      medium: 'rgba(255, 255, 255, 0.1)',    // Regular borders
      strong: 'rgba(255, 255, 255, 0.2)',    // Strong borders
    },
    text: {
      primary: '#F1F5F9',     // Main text
      secondary: '#CBD5E1',   // Secondary text
      tertiary: '#94A3B8',    // Tertiary text
      inverse: '#1E293B',     // Text on light backgrounds
      disabled: '#64748B',    // Disabled text
    },
  },

  // Chat-Specific Colors
  chat: {
    userMessage: {
      background: '#8B5CF6',  // Purple
      text: '#FFFFFF',
    },
    aiMessage: {
      background: '#374151',  // Gray-700
      backgroundDark: '#4B5563',  // Gray-600
      text: '#FFFFFF',
    },
    inputBar: {
      background: '#374151',  // Gray-800
      backgroundDark: '#1F2937',
      placeholder: '#9CA3AF',
    },
  },

  // Music Category Colors
  music: {
    highlight: {
      primary: '#14B8A6',     // Teal
      gradient: ['#14B8A6', '#0D9488'],
    },
    deepCut: {
      primary: '#8B5CF6',     // Purple
      text: '#A78BFA',
    },
    mainstream: {
      primary: '#EC4899',     // Pink
      text: '#F9A8D4',
    },
  },

  // Interactive States
  interactive: {
    hover: 'rgba(139, 92, 246, 0.1)',    // Light purple overlay
    pressed: 'rgba(139, 92, 246, 0.2)',   // Darker purple overlay
    focus: '#8B5CF6',                     // Purple focus ring
    disabled: 'rgba(156, 163, 175, 0.3)', // Gray overlay
  },

  // Overlays
  overlay: {
    light: 'rgba(0, 0, 0, 0.4)',
    medium: 'rgba(0, 0, 0, 0.6)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Font Sizes (based on 16px base)
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },

  // Font Weights
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
} as const;

// ============================================================================
// SPACING SYSTEM (8px grid)
// ============================================================================

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS (iOS and Android compatible)
// ============================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

export const layout = {
  // Container
  container: {
    maxWidth: 1200,
    padding: spacing[4],
  },

  // Screen Padding
  screen: {
    horizontal: spacing[4],  // 16px
    vertical: spacing[5],    // 20px
  },

  // Safe Area
  safeArea: {
    top: Platform.select({ ios: 44, android: 0, default: 0 }),
    bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  },

  // Navigation
  bottomTab: {
    height: 60,
    iconSize: 24,
    labelSize: typography.fontSize.xs,
  },

  header: {
    height: 56,
    iconSize: 24,
    titleSize: typography.fontSize.lg,
  },

  // Component Heights
  button: {
    sm: 36,
    md: 44,
    lg: 52,
  },

  input: {
    height: 48,
    multilineMinHeight: 48,
    multilineMaxHeight: 120,
  },
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ============================================================================
// COMPONENT-SPECIFIC STYLES
// ============================================================================

export const components = {
  // Message Bubbles
  messageBubble: {
    maxWidth: 0.8,  // As decimal ratio, not percentage
    padding: spacing[3],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[2],
    user: {
      backgroundColor: colors.chat.userMessage.background,
      alignSelf: 'flex-end' as const,
      borderTopRightRadius: borderRadius.sm,
    },
    ai: {
      backgroundColor: colors.chat.aiMessage.background,
      alignSelf: 'flex-start' as const,
      borderTopLeftRadius: borderRadius.sm,
    },
  },

  // Input Bar
  inputBar: {
    height: layout.input.height,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.chat.inputBar.background,
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
  },

  // Buttons
  button: {
    primary: {
      height: layout.button.md,
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.lg,
      backgroundColor: colors.primary.main,
    },
    secondary: {
      height: layout.button.md,
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.lg,
      backgroundColor: colors.secondary.main,
    },
    icon: {
      size: 40,
      borderRadius: borderRadius.full,
      padding: spacing[2],
    },
  },

  // Cards
  card: {
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.light.surface.primary,
    ...shadows.md,
  },

  // Song Cards
  songCard: {
    small: {
      width: 140,
      borderRadius: borderRadius.xl,
      padding: spacing[3],
    },
    highlight: {
      padding: spacing[4],
      borderRadius: borderRadius['2xl'],
      ...shadows.lg,
    },
  },

  // Category Labels
  categoryLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase' as const,
    marginBottom: spacing[3],
  },
} as const;

// ============================================================================
// DESIGN SYSTEM EXPORT
// ============================================================================

export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
  components,
} as const;

export default designSystem;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Layout = typeof layout;
export type Animation = typeof animation;
export type Components = typeof components;
export type DesignSystem = typeof designSystem;
