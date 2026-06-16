// Stub API service — all methods return mock resolved promises now.
// Replace promise bodies with real Supabase calls when the backend is live.
// Each method has a TODO comment with the exact endpoint / Supabase table.
//
// Backend target: Supabase (Postgres + Auth + Storage + Realtime).

import type { Innings, Match, Tournament, User } from "@/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

// Re-export so callers can read the configured base URL if needed.
export const API_BASE_URL = BASE_URL;

export const UserService = {
  createProfile: async (data: Partial<User>): Promise<User | null> => {
    // TODO(backend): POST /api/v1/users → supabase.from('users').insert(data)
    return null;
  },
  getProfile: async (userId: string): Promise<User | null> => {
    // TODO(backend): GET /api/v1/users/:userId → supabase.from('users').select().eq('id', userId).single()
    return null;
  },
};

export const MatchService = {
  createMatch: async (data: Partial<Match>): Promise<Match | null> => {
    // TODO(backend): POST /api/v1/matches → supabase.from('matches').insert(data)
    return null;
  },
  saveInningsState: async (
    matchId: string,
    innings: Innings,
  ): Promise<void> => {
    // TODO(backend): PATCH /api/v1/matches/:matchId/innings → supabase.from('innings').upsert({ matchId, ...innings })
  },
  getMatchHistory: async (userId: string): Promise<Match[]> => {
    // TODO(backend): GET /api/v1/matches?userId=:userId → supabase.from('matches').select().eq('createdBy', userId)
    return [];
  },
};

export const TournamentService = {
  create: async (data: Partial<Tournament>): Promise<Tournament | null> => {
    // TODO(backend): POST /api/v1/tournaments → supabase.from('tournaments').insert(data)
    return null;
  },
  list: async (): Promise<Tournament[]> => {
    // TODO(backend): GET /api/v1/tournaments → supabase.from('tournaments').select()
    return [];
  },
};
