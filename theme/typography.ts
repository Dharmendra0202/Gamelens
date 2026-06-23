/**
 * CrickBuz — Typography Scale
 * Consistent text styles.
 */
import { TextStyle } from "react-native";

export const Typography = {
  /** Large screen title — 28px bold */
  h1: {
    fontSize: 28,
    fontWeight: "800",
    color: "#212121",
    letterSpacing: 0.3,
  } as TextStyle,

  /** Section title — 22px bold */
  h2: {
    fontSize: 22,
    fontWeight: "800",
    color: "#212121",
  } as TextStyle,

  /** Card title — 18px semibold */
  h3: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
  } as TextStyle,

  /** Subtitle — 16px medium */
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#616161",
  } as TextStyle,

  /** Body text — 15px regular */
  body: {
    fontSize: 15,
    fontWeight: "500",
    color: "#212121",
    lineHeight: 22,
  } as TextStyle,

  /** Secondary body — 14px */
  bodySmall: {
    fontSize: 14,
    fontWeight: "500",
    color: "#616161",
  } as TextStyle,

  /** Caption text — 12px */
  caption: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9E9E9E",
  } as TextStyle,

  /** Overline / label — 11px uppercase */
  overline: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#9E9E9E",
  } as TextStyle,

  /** Large stat number */
  stat: {
    fontSize: 24,
    fontWeight: "800",
    color: "#212121",
  } as TextStyle,

  /** Button text */
  button: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  } as TextStyle,
} as const;
