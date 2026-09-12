/**
 * Structured post-game note interfaces.
 */

export type MatchResult = 'win' | 'loss' | 'remake' | 'WIN' | 'LOSS' | 'REMAKE';

export interface UserNote {
  id: number;
  championId: number;
  championName: string;
  gameId?: string;
  matchResult: MatchResult;
  perceivedDifficulty: number; // 1 to 5 stars
  whatWorked?: string;
  whatFailed?: string;
  freeNotes?: string;
  runesUsed?: string;
  itemsBuilt?: string;
  summonersUsed?: string;
  kda?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewNotePayload {
  championId: number;
  championName?: string;
  gameId?: string;
  matchResult: MatchResult;
  perceivedDifficulty: number;
  whatWorked?: string;
  whatFailed?: string;
  freeNotes?: string;
  runesUsed?: string;
  itemsBuilt?: string;
  summonersUsed?: string;
  kda?: string;
  createdAt?: string;
}

export interface UpdateNotePayload {
  matchResult?: MatchResult;
  perceivedDifficulty?: number;
  whatWorked?: string;
  whatFailed?: string;
  freeNotes?: string;
  runesUsed?: string;
  itemsBuilt?: string;
  summonersUsed?: string;
  kda?: string;
}

export interface NotesSummary {
  championId: number;
  championName: string;
  totalMatches: number;
  wins: number;
  losses: number;
  remakes: number;
  winratePercent: number; // e.g. 66.7
  avgDifficulty: number;   // e.g. 3.2
  recentNotes: UserNote[];
}

