/**
 * App-specific design tokens — re-exports from the new @/theme system.
 * Kept for backward compatibility with existing imports.
 */
import { BorderRadius, Colors, Spacing } from "@/theme";

export const AppColors = {
  // Brand (now red-based)
  green: Colors.primary,
  greenDark: Colors.primaryDark,
  greenDeep: Colors.primaryDark,
  greenLight: Colors.primaryLight,
  greenBg: Colors.background,

  // Brand red
  red: Colors.primary,
  redDark: Colors.primaryDark,
  redDeep: Colors.primaryDark,

  // Neutrals
  text: Colors.textPrimary,
  textSecondary: Colors.textSecondary,
  textMuted: Colors.textMuted,
  border: Colors.border,
  borderLight: Colors.borderLight,
  bg: Colors.background,

  // Status
  like: Colors.error,
  verified: Colors.success,
} as const;

export const AppSpacing = Spacing;

export const AppRadius = BorderRadius;

export const TAB_BAR_HEIGHT = 60;
