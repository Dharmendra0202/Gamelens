/**
 * App-specific design tokens shared across screens.
 * For dark/light Colors, see constants/theme.ts.
 */

export const AppColors = {
  // Brand green
  green: '#00A66A',
  greenDark: '#0F766E',
  greenDeep: '#064E3B',
  greenLight: '#D1FAE5',
  greenBg: '#F0FFF8',

  // Brand red
  red: '#B91C1C',
  redDark: '#991B1B',
  redDeep: '#7F1D1D',

  // Neutrals
  text: '#222',
  textSecondary: '#666',
  textMuted: '#999',
  border: '#E5E5E5',
  borderLight: '#F4F4F4',
  bg: '#F0F7F4',

  // Status
  like: '#EF4444',
  verified: '#00A66A',
} as const;

export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const AppRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const TAB_BAR_HEIGHT = 60;
