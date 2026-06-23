/**
 * CrickBuz — Border Radius Scale
 */

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export type BorderRadiusKey = keyof typeof BorderRadius;
