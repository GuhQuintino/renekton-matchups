/**
 * Game State Simulator and Mock Control Engine
 */

import type { GameStateEvent } from '../types/game';

export interface SimulatorState {
  phase: 'DISCONNECTED' | 'LOBBY' | 'CHAMP_SELECT' | 'IN_GAME' | 'POST_GAME';
  connected: boolean;
  game_time_seconds: number;
  my_champion: string | null;
  opponent_champion: string | null;
  opponent_confidence: number;
  potential_opponents: string[];
  match_id: string | null;
  match_result?: 'WIN' | 'LOSS' | 'REMAKE' | 'UNSPECIFIED' | null;
  is_manual_override?: boolean;
}

export type SimulatorEvent = 'gameStateChanged' | 'postGameTrigger';

export class SimulatorEngine {
  private state: SimulatorState;
  private listeners: Map<string, Set<(data: any) => void>>;

  constructor() {
    this.state = {
      phase: 'DISCONNECTED',
      connected: false,
      game_time_seconds: 0,
      my_champion: null,
      opponent_champion: null,
      opponent_confidence: 0,
      potential_opponents: [],
      match_id: null,
    };
    this.listeners = new Map();
  }

  on(event: SimulatorEvent | string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: SimulatorEvent | string, callback: (data: any) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  emit(event: SimulatorEvent | string, data: any): void {
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)!) {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in simulator listener for event "${event}":`, err);
        }
      }
    }
  }

  getState(): SimulatorState {
    return JSON.parse(JSON.stringify(this.state));
  }

  getGameStateEvent(): GameStateEvent {
    const s = this.getState();
    return {
      phase: s.phase,
      connected: s.connected,
      gameTimeSeconds: s.game_time_seconds,
      myChampion: s.my_champion || undefined,
      opponentChampion: s.opponent_champion || undefined,
      opponentConfidence: s.opponent_confidence,
      potentialOpponents: s.potential_opponents,
      matchId: s.match_id || undefined,
      matchResult: s.match_result || undefined,
      isManualOverride: s.is_manual_override,
    };
  }

  setState(partialState: Partial<SimulatorState>): SimulatorState {
    this.state = {
      ...this.state,
      ...partialState,
    };
    const current = this.getState();
    this.emit('gameStateChanged', current);
    return current;
  }

  loadScenario(scenarioName: string, customPayload: Partial<SimulatorState> = {}): SimulatorState {
    const s = (scenarioName || '').toUpperCase();
    switch (s) {
      case 'SCENARIO_A_DRAFT':
      case 'CHAMP_SELECT':
      case 'CHAMP_SELECT_RENEKTON_VS_AATROX':
        this.setState({
          phase: 'CHAMP_SELECT',
          connected: true,
          my_champion: 'Renekton',
          opponent_champion: 'Aatrox',
          opponent_confidence: 85,
          potential_opponents: ['Aatrox', 'Lee Sin', 'Ahri', "Kai'Sa", 'Nautilus'],
          game_time_seconds: 0,
          match_id: 'draft_sim_001',
          match_result: null,
          is_manual_override: false,
          ...customPayload,
        });
        break;

      case 'SCENARIO_B_IN_GAME':
      case 'IN_GAME':
      case 'IN_GAME_VS_DARIUS':
        this.setState({
          phase: 'IN_GAME',
          connected: true,
          my_champion: 'Renekton',
          opponent_champion: 'Darius',
          opponent_confidence: 100,
          potential_opponents: ['Darius'],
          game_time_seconds: 215,
          match_id: 'live_sim_darius_002',
          match_result: null,
          is_manual_override: false,
          ...customPayload,
        });
        break;

      case 'SCENARIO_C_LANE_SWAP':
      case 'IN_GAME_SWAP':
      case 'LANE_SWAP':
        this.setState({
          phase: 'IN_GAME',
          connected: true,
          my_champion: 'Renekton',
          opponent_champion: 'Yasuo',
          opponent_confidence: 70,
          potential_opponents: ['Yasuo', 'Yone'],
          game_time_seconds: 180,
          match_id: 'swap_sim_003',
          match_result: null,
          is_manual_override: false,
          ...customPayload,
        });
        break;

      case 'SCENARIO_D_POST_GAME_WIN':
      case 'POST_GAME':
      case 'POST_GAME_VICTORY':
        this.setState({
          phase: 'POST_GAME',
          connected: true,
          my_champion: 'Renekton',
          opponent_champion: 'Aatrox',
          opponent_confidence: 100,
          potential_opponents: [],
          game_time_seconds: 1720,
          match_id: 'post_game_win_004',
          match_result: 'WIN',
          is_manual_override: false,
          ...customPayload,
        });
        this.emit('postGameTrigger', this.getState());
        break;

      case 'SCENARIO_E_DISCONNECTED':
      case 'DISCONNECTED':
        this.setState({
          phase: 'DISCONNECTED',
          connected: false,
          my_champion: null,
          opponent_champion: null,
          opponent_confidence: 0,
          potential_opponents: [],
          game_time_seconds: 0,
          match_id: null,
          match_result: null,
          is_manual_override: false,
          ...customPayload,
        });
        break;

      case 'LOBBY':
        this.setState({
          phase: 'LOBBY',
          connected: true,
          my_champion: null,
          opponent_champion: null,
          opponent_confidence: 0,
          potential_opponents: [],
          game_time_seconds: 0,
          match_id: null,
          match_result: null,
          is_manual_override: false,
          ...customPayload,
        });
        break;

      default:
        throw new Error(
          `Unknown simulation scenario: "${scenarioName}". Available: SCENARIO_A_DRAFT, SCENARIO_B_IN_GAME, SCENARIO_C_LANE_SWAP, SCENARIO_D_POST_GAME_WIN, SCENARIO_E_DISCONNECTED`
        );
    }

    return this.getState();
  }
}

export const simulatorEngine = new SimulatorEngine();
