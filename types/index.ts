// Shared TypeScript interfaces — the API contract between the app and the
// (future) Supabase backend. Keep these in sync with the database schema.

export type BattingPosition =
  | 'Opener'
  | 'Middle Order'
  | 'Lower Order'
  | 'Tailender';

export type BowlingStyle =
  | 'Right Arm Fast'
  | 'Right Arm Medium'
  | 'Right Arm Off Spin'
  | 'Right Arm Leg Spin'
  | 'Left Arm Fast'
  | 'Left Arm Medium'
  | 'Left Arm Orthodox'
  | 'Left Arm Chinaman'
  | 'None';

export type MatchType = 'friendly' | 'tournament' | 'practice';
export type TeamSide = 'teamA' | 'teamB';
export type TossChoice = 'bat' | 'bowl';
export type MatchStatus = 'setup' | 'live' | 'completed';
export type TournamentFormat = 'knockout' | 'league' | 'group+knockout';
export type TournamentStatus = 'upcoming' | 'live' | 'completed';

export interface User {
  id: string;
  username: string;
  fullName: string;
  profilePhoto?: string;
  city?: string;
  battingStyle?: BattingPosition;
  bowlingStyle?: BowlingStyle;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  userId?: string; // linked if registered user
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Ball {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;
  isBye: boolean;
  isLegBye: boolean;
  batsmanId: string;
  bowlerId: string;
}

export interface Innings {
  battingTeam: TeamSide;
  balls: Ball[];
  totalRuns: number;
  totalWickets: number;
  overs: number;
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  overs: number;
  venue?: string;
  matchDate: string;
  matchType: MatchType;
  tossWinner: TeamSide;
  tossChoice: TossChoice;
  status: MatchStatus;
  innings: Innings[];
  createdBy: string; // userId
}

export interface Tournament {
  id: string;
  name: string;
  createdBy: string;
  teams: Team[];
  matches: Match[];
  format: TournamentFormat;
  status: TournamentStatus;
}
