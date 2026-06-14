// AsyncStorage wrapper — used NOW, replaced by Supabase API calls later.
// Every method mirrors the API service signature so the swap is mechanical.
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Match, Tournament, User } from "@/types";

const KEYS = {
  USER_PROFILE: "crickbuz:user_profile",
  MATCH_HISTORY: "crickbuz:match_history",
  ACTIVE_MATCH: "crickbuz:active_match",
  TOURNAMENTS: "crickbuz:tournaments",
} as const;

export const LocalStorage = {
  // ── Profile ──
  saveProfile: (profile: User): Promise<void> =>
    AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile)),

  getProfile: async (): Promise<User | null> => {
    const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  // ── Match history ──
  saveMatch: async (match: Match): Promise<void> => {
    const existing = await LocalStorage.getMatchHistory();
    const updated = [match, ...existing.filter((m) => m.id !== match.id)];
    await AsyncStorage.setItem(KEYS.MATCH_HISTORY, JSON.stringify(updated));
  },

  getMatchHistory: async (): Promise<Match[]> => {
    const raw = await AsyncStorage.getItem(KEYS.MATCH_HISTORY);
    return raw ? (JSON.parse(raw) as Match[]) : [];
  },

  // ── Active (resumable) match ──
  saveActiveMatch: (match: Partial<Match>): Promise<void> =>
    AsyncStorage.setItem(KEYS.ACTIVE_MATCH, JSON.stringify(match)),

  getActiveMatch: async (): Promise<Partial<Match> | null> => {
    const raw = await AsyncStorage.getItem(KEYS.ACTIVE_MATCH);
    return raw ? (JSON.parse(raw) as Partial<Match>) : null;
  },

  clearActiveMatch: (): Promise<void> =>
    AsyncStorage.removeItem(KEYS.ACTIVE_MATCH),

  // ── Tournaments ──
  saveTournaments: (tournaments: Tournament[]): Promise<void> =>
    AsyncStorage.setItem(KEYS.TOURNAMENTS, JSON.stringify(tournaments)),

  getTournaments: async (): Promise<Tournament[]> => {
    const raw = await AsyncStorage.getItem(KEYS.TOURNAMENTS);
    return raw ? (JSON.parse(raw) as Tournament[]) : [];
  },
};
