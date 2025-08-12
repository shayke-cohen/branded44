/**
 * Design System Constants for AI-Optimized React Native Component Library
 * 
 * This file contains all design tokens and constants used throughout the component system.
 * Optimized for AI agent consumption with extensive documentation and consistent naming.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Color palette with semantic meaning for consistent theming
 * Uses a 50-900 scale for each color family following Material Design principles
 */
export const COLORS = {
  // Primary brand colors (blue scale)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary colors (gray scale)
  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280', // Main secondary color
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Gray scale (alias for secondary)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Blue scale (alias for primary)
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Red scale (alias for error)
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral scale (alias for gray)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic colors for state indication
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main info color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Green scale (alias for success)
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Orange scale (alias for warning)
  orange: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Yellow scale
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },

  // Purple scale
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Pink scale
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },

  // Indigo scale
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  // Neutral colors for backgrounds and text
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Special purpose colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Semantic colors for easy theming
  background: '#ffffff',
  card: '#ffffff',
  border: '#e5e7eb',
  
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
  
  // Social media brand colors
  social: {
    facebook: '#1877f2',
    google: '#4285f4',
    apple: '#000000',
    twitter: '#1da1f2',
    linkedin: '#0077b5',
    instagram: '#e4405f',
  },
} as const;

/**
 * Spacing system based on 4px grid for consistent layouts
 * All values are in React Native units (dp on Android, points on iOS)
 */
export const SPACING = {
  // Base unit (4px)
  xs: 4,   // Extra small spacing
  sm: 8,   // Small spacing
  md: 16,  // Medium spacing (default)
  lg: 24,  // Large spacing
  xl: 32,  // Extra large spacing
  '2xl': 48, // 2x extra large spacing
  '3xl': 64, // 3x extra large spacing
  '4xl': 96, // 4x extra large spacing

  // Common layout spacing
  screen: 16,    // Default screen padding
  section: 24,   // Section spacing
  component: 16, // Component internal spacing
  
  // Form-specific spacing
  formField: 16,   // Between form fields
  formSection: 32, // Between form sections
  
  // List spacing
  listItem: 12,    // Between list items
  listSection: 24, // Between list sections
} as const;

/**
 * Typography system with consistent font sizes and weights
 * Follows a modular scale for visual hierarchy
 */
export const TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    xs: 12,   // Extra small text
    sm: 14,   // Small text
    base: 16, // Base font size
    md: 16,   // Medium (alias for base)
    lg: 18,   // Large text
    xl: 20,   // Extra large text
    '2xl': 24, // 2x extra large
    '3xl': 30, // 3x extra large
    '4xl': 36, // 4x extra large
    '5xl': 48, // 5x extra large
    '6xl': 60, // 6x extra large
  },

  // Font weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line heights (relative to font size)
  lineHeight: {
    tight: 1.2,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Font families (platform specific)
  fontFamily: {
    // iOS system fonts
    ios: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    // Android system fonts
    android: {
      regular: 'Roboto',
      medium: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    // Web fallbacks
    web: {
      regular: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      medium: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      bold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
} as const;

/**
 * Layout constants for responsive design and common dimensions
 */
export const LAYOUT = {
  // Screen dimensions
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // Common breakpoints for responsive design
  breakpoints: {
    xs: 320,  // Small phones
    sm: 375,  // Standard phones
    md: 414,  // Large phones
    lg: 768,  // Tablets
    xl: 1024, // Large tablets
  },

  // Component dimensions
  header: {
    height: Platform.OS === 'ios' ? 44 : 56,
    heightWithStatusBar: Platform.OS === 'ios' ? 88 : 76,
  },

  tabBar: {
    height: Platform.OS === 'ios' ? 83 : 60,
  },

  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
    },
    minWidth: 64,
  },

  input: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
  },

  // Common aspect ratios
  aspectRatio: {
    square: 1,
    landscape: 16 / 9,
    portrait: 3 / 4,
    wide: 21 / 9,
  },

  // Border radius values
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999, // Fully rounded
  },

  // Common z-index values
  zIndex: {
    hide: -1,
    base: 0,
    overlay: 10,
    dropdown: 50,
    modal: 100,
    toast: 200,
    tooltip: 300,
  },
} as const;

/**
 * Animation constants for consistent motion design
 */
export const ANIMATIONS = {
  // Duration constants (in milliseconds)
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 800,
  },

  // Easing curves for natural motion
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // React Native specific
    spring: {
      damping: 15,
      mass: 1,
      stiffness: 150,
    },
  },

  // Common animation presets
  presets: {
    fadeIn: {
      duration: 250,
      easing: 'ease-out',
    },
    slideUp: {
      duration: 300,
      easing: 'ease-out',
    },
    scale: {
      duration: 200,
      easing: 'ease-in-out',
    },
    bounce: {
      duration: 400,
      easing: 'ease-out',
    },
  },
} as const;

/**
 * Common shadow presets for elevation
 */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
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
    elevation: 16,
  },
} as const;

/**
 * Platform-specific constants
 */
export const PLATFORM = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  
  // Safe area constants (approximate)
  safeArea: {
    top: Platform.OS === 'ios' ? 44 : 24,
    bottom: Platform.OS === 'ios' ? 34 : 0,
  },
} as const;

// Type exports for TypeScript support
export type ColorScale = typeof COLORS.primary;
export type SpacingKey = keyof typeof SPACING;
export type FontSizeKey = keyof typeof TYPOGRAPHY.fontSize;
export type FontWeightKey = keyof typeof TYPOGRAPHY.fontWeight;
export type BreakpointKey = keyof typeof LAYOUT.breakpoints;
export type AnimationDurationKey = keyof typeof ANIMATIONS.duration;
export type ShadowKey = keyof typeof SHADOWS; 