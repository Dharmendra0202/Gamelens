# CrickBuz Backend Spec — Supabase

## Stack

- **Backend:** Supabase (Postgres + Auth + Storage + Realtime)
- **Client:** `@supabase/supabase-js` via `services/supabase.ts`
- **Auth session:** persisted in AsyncStorage (see supabase client config)
- **Pre-backend bridge:** `services/storage.ts` (AsyncStorage) mirrors the API
  surface so the swap to Supabase is mechanical.

## Why Supabase

- Postgres with row-level security (RLS) for per-user data access.
- Realtime subscriptions → live scoring syncs across devices.
- Built-in Auth (email, phone OTP, OAuth) — phone OTP suits the India market.
- Storage buckets for profile photos and match media.
- Generous free tier for early stage.

## Tables

```
users        (id, username, full_name, profile_photo, city,
              batting_style, bowling_style, created_at)
teams        (id, name, created_by)
players      (id, team_id, name, user_id?)
matches      (id, team_a, team_b, overs, venue, match_date, match_type,
              toss_winner, toss_choice, status, created_by)
innings      (id, match_id, batting_team, total_runs, total_wickets, overs)
balls        (id, innings_id, over, ball, runs, is_wicket, is_wide,
              is_no_ball, is_bye, is_leg_bye, batsman_id, bowler_id)
tournaments  (id, name, created_by, format, status)
tournament_teams (tournament_id, team_id)
```

## REST/RPC mapping (services/api.ts stubs)

| App method                    | Supabase call                                         |
| ----------------------------- | ----------------------------------------------------- |
| UserService.createProfile     | `from('users').insert()`                              |
| UserService.getProfile        | `from('users').select().eq('id').single()`            |
| MatchService.createMatch      | `from('matches').insert()`                            |
| MatchService.saveInningsState | `from('innings').upsert()` + `from('balls').insert()` |
| MatchService.getMatchHistory  | `from('matches').select().eq('created_by')`           |
| TournamentService.create      | `from('tournaments').insert()`                        |
| TournamentService.list        | `from('tournaments').select()`                        |

## RLS Rules

- Users read/write only their own `users` row.
- Match creator writes match/innings/balls; participants read.
- Tournaments: creator writes, participants read.
- Match history: public read for leaderboards.

## Auth Flow

1. App start → supabase client restores session from AsyncStorage.
2. No session → show login (phone OTP primary, OAuth secondary).
3. Authenticated requests use the session JWT automatically.

## Env

Set in `.env.local` (see `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

`services/supabase.ts` exposes `isSupabaseConfigured` — until credentials are
set, services fall back to LocalStorage.

## Migration Order

1. Create Supabase project + tables + RLS.
2. Wire Auth (phone OTP) replacing the placeholder login.
3. Replace `UserService` stub bodies with Supabase calls.
4. Replace `MatchService` + wire realtime innings sync.
5. Tournaments + leaderboard aggregation.
6. Storage bucket for profile photos / match media.
