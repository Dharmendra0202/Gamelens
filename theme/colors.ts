/**
 * CrickBuz / Gamelens — Brand Color System
 * Premium cricket-focused palette inspired by CricHeroes.
 */

export const Colors = {
  // ─── Primary Brand ───
  primary: "#B71C1C",
  primaryDark: "#8B0000",
  primaryAccent: "#D32F2F",
  primaryLight: "#FBE9E7",
  primaryMuted: "#FFCDD2",

  // ─── Backgrounds ───
  background: "#F5F5F5",
  surface: "#FFFFFF",
  surfaceElevated: "#FAFAFA",

  // ─── Text ───
  textPrimary: "#212121",
  textSecondary: "#616161",
  textMuted: "#9E9E9E",
  textOnPrimary: "#FFFFFF",
  textOnDark: "#FFFFFF",

  // ─── Status ───
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  live: "#EF4444",
  upcoming: "#F59E0B",
  completed: "#10B981",

  // ─── Borders ───
  border: "#E0E0E0",
  borderLight: "#F0F0F0",
  divider: "#EEEEEE",

  // ─── Misc ───
  overlay: "rgba(0,0,0,0.5)",
  overlayLight: "rgba(0,0,0,0.3)",
  shimmer: "#E8E8E8",

  // ─── Tab Bar ───
  tabActive: "#B71C1C",
  tabInactive: "#9E9E9E",
  tabBackground: "#FFFFFF",
} as const;

export type ColorKey = keyof typeof Colors;
