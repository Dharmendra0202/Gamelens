/**
 * CrickBuz — Soft Neumorphic Shadow System
 * Subtle, premium shadows for elevated cards and components.
 */
import { Platform, ViewStyle } from "react-native";

/** Soft card elevation — default for most cards */
export const shadowCard: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
  default: {},
}) as ViewStyle;

/** Subtle elevation — chips, small interactive elements */
export const shadowSubtle: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  android: {
    elevation: 2,
  },
  default: {},
}) as ViewStyle;

/** Medium elevation — floating buttons, modals */
export const shadowMedium: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  android: {
    elevation: 8,
  },
  default: {},
}) as ViewStyle;

/** Heavy elevation — bottom sheet, navigation bar */
export const shadowHeavy: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  android: {
    elevation: 12,
  },
  default: {},
}) as ViewStyle;

/** Brand shadow — primary buttons with brand color glow */
export const shadowBrand: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  android: {
    elevation: 8,
  },
  default: {},
}) as ViewStyle;

export const Shadows = {
  card: shadowCard,
  subtle: shadowSubtle,
  medium: shadowMedium,
  heavy: shadowHeavy,
  brand: shadowBrand,
} as const;
