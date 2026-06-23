/**
 * CrickBuz — Brand Gradient Definitions
 * Used with expo-linear-gradient's colors prop.
 */

export const Gradients = {
  /** Main brand gradient — headers, hero sections */
  brand: ["#B71C1C", "#8B0000"] as const,

  /** Hero card gradient — featured content */
  hero: ["#C62828", "#8B0000"] as const,

  /** Primary button gradient */
  button: ["#D32F2F", "#B71C1C"] as const,

  /** Subtle brand — light background accent */
  brandSubtle: ["#FBE9E7", "#FFFFFF"] as const,

  /** Card premium — elevated important cards */
  cardPremium: ["#FFFFFF", "#FAFAFA"] as const,

  /** Success gradient */
  success: ["#10B981", "#059669"] as const,

  /** Dark overlay for images */
  imageOverlay: ["transparent", "rgba(0,0,0,0.6)"] as const,

  /** Status badge live */
  live: ["#EF4444", "#DC2626"] as const,

  /** Gold/premium accent */
  gold: ["#FFD700", "#FFA500"] as const,
} as const;

export type GradientKey = keyof typeof Gradients;
