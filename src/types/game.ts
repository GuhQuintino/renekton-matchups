/**
 * Game state, LCU, Live Client Data, and Simulator interfaces.
 */

export type GamePhase =
  | 'DISCONNECTED'
  | 'LOBBY'
  | 'CHAMP_SELECT'
  | 'IN_GAME'
  | 'POST_GAME';

export interface GameStateEvent {
  phase: GamePhase;
  connected: boolean;
  gameTimeSeconds?: number;
  myChampion?: string;
  opponentChampion?: string;
  opponentConfidence?: number; // 0 to 100
  potentialOpponents?: string[];
  matchId?: string;
  matchResult?: 'WIN' | 'LOSS' | 'REMAKE' | 'UNSPECIFIED' | null;
  isManualOverride?: boolean;
  kda?: string;
  itemsBuilt?: string;
  summonersUsed?: string;
  runesUsed?: string;
  cs?: number;
}

export type SimulationScenario =
  | 'disconnected'
  | 'lobby'
  | 'champ_select_renekton_vs_aatrox'
  | 'champ_select_renekton_vs_darius'
  | 'champ_select_renekton_vs_fiora'
  | 'in_game_vs_aatrox'
  | 'in_game_vs_darius'
  | 'in_game_vs_fiora'
  | 'in_game_vs_varus'
  | 'post_game_victory'
  | 'post_game_defeat';
