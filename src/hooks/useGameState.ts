import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameStateEvent, GamePhase } from '../types/game';
import { simulatorEngine, SimulatorState } from '../services/simulator';
import { LiveClientService } from '../services/liveClient';
import type { AppMode } from '../components/Header';

export interface PostGamePayload {
  championName: string;
  championId?: number;
  matchResult: 'WIN' | 'LOSS' | 'REMAKE' | 'UNSPECIFIED';
  gameTimeSeconds: number;
  kda?: string;
  itemsBuilt?: string;
  summonersUsed?: string;
  runesUsed?: string;
  cs?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
}

export interface UseGameStateOptions {
  initialMode?: AppMode;
  pollingIntervalMs?: number;
  onPostGameTrigger?: (payload: PostGamePayload) => void;
}

export interface UseGameStateReturn {
  gameState: GameStateEvent;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  loadScenario: (scenarioName: string, customPayload?: any) => void;
  manualOverrideOpponent: (championName: string) => void;
  refreshGameState: () => Promise<void>;
  dismissPostGameModal: () => void;
  isSimulating: boolean;
  isConnected: boolean;
  phase: GamePhase;
  myChampion?: string;
  opponentChampion?: string;
  opponentConfidence: number;
  potentialOpponents: string[];
  gameTimeSeconds: number;
  matchId?: string;
  matchResult?: string | null;
  isManualOverride: boolean;
  postGameTriggerPayload: PostGamePayload | null;
}

const EMPTY_ARRAY: string[] = [];

const DEFAULT_DISCONNECTED_STATE: GameStateEvent = {
  phase: 'DISCONNECTED',
  connected: false,
  gameTimeSeconds: 0,
  opponentConfidence: 0,
  potentialOpponents: EMPTY_ARRAY,
  isManualOverride: false,
};

export function isGameStateEqual(prev: GameStateEvent, next: GameStateEvent): boolean {
  if (!prev || !next) return prev === next;
  if (prev.phase !== next.phase) return false;
  if (prev.connected !== next.connected) return false;
  if (prev.opponentChampion !== next.opponentChampion) return false;
  if (prev.opponentConfidence !== next.opponentConfidence) return false;
  if (prev.myChampion !== next.myChampion) return false;
  if (prev.matchId !== next.matchId) return false;
  if (prev.matchResult !== next.matchResult) return false;
  if (prev.isManualOverride !== next.isManualOverride) return false;
  if (prev.kda !== next.kda) return false;
  if (prev.itemsBuilt !== next.itemsBuilt) return false;
  if (prev.summonersUsed !== next.summonersUsed) return false;
  if (prev.runesUsed !== next.runesUsed) return false;
  if (prev.cs !== next.cs) return false;
  if (prev.gameTimeSeconds !== next.gameTimeSeconds) return false;

  const prevPots = prev.potentialOpponents || EMPTY_ARRAY;
  const nextPots = next.potentialOpponents || EMPTY_ARRAY;
  if (prevPots.length !== nextPots.length) return false;
  for (let i = 0; i < prevPots.length; i++) {
    if (prevPots[i] !== nextPots[i]) return false;
  }

  return true;
}

/**
 * Safely invokes a Tauri backend command if running inside Tauri runtime
 */
async function safeTauriInvoke<T>(cmd: string, args?: Record<string, any>): Promise<T | null> {
  try {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<T>(cmd, args);
    }
  } catch {
    // Fallback if not running in Tauri or invoke fails
  }
  return null;
}

export function useGameState(options: UseGameStateOptions = {}): UseGameStateReturn {
  const {
    initialMode = 'LCU_AUTO',
    pollingIntervalMs = 1500,
    onPostGameTrigger,
  } = options;

  const [mode, setModeState] = useState<AppMode>(initialMode);
  const [gameState, setGameState] = useState<GameStateEvent>(() => {
    if (initialMode === 'SIMULATOR') {
      return simulatorEngine.getGameStateEvent();
    }
    return DEFAULT_DISCONNECTED_STATE;
  });

  const [postGameTriggerPayload, setPostGameTriggerPayload] = useState<PostGamePayload | null>(null);
  const isMountedRef = useRef(true);
  const prevPhaseRef = useRef<GamePhase>(gameState.phase);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Simulator mode subscription
  useEffect(() => {
    if (mode !== 'SIMULATOR') return;

    // Sync initial simulator state
    setGameState(simulatorEngine.getGameStateEvent());

    const unsubState = simulatorEngine.on('gameStateChanged', (simState: SimulatorState) => {
      if (!isMountedRef.current) return;
      const converted: GameStateEvent = {
        phase: simState.phase,
        connected: simState.connected,
        gameTimeSeconds: simState.game_time_seconds,
        myChampion: simState.my_champion || undefined,
        opponentChampion: simState.opponent_champion || undefined,
        opponentConfidence: simState.opponent_confidence,
        potentialOpponents: simState.potential_opponents,
        matchId: simState.match_id || undefined,
        matchResult: (simState.match_result as any) || undefined,
        isManualOverride: simState.is_manual_override || false,
      };
      setGameState(converted);
    });

    const unsubPostGame = simulatorEngine.on('postGameTrigger', (payload: any) => {
      if (!isMountedRef.current) return;
      const formatted: PostGamePayload = {
        championName: payload.championName || 'Aatrox',
        championId: payload.championId || 1,
        matchResult: payload.result || 'WIN',
        gameTimeSeconds: payload.gameTimeSeconds || 1440,
        kda: payload.kda || '8/2/5',
        kills: payload.kills || 8,
        deaths: payload.deaths || 2,
        assists: payload.assists || 5,
        cs: payload.cs || 185,
      };
      setPostGameTriggerPayload(formatted);
      if (onPostGameTrigger) {
        onPostGameTrigger(formatted);
      }
    });

    return () => {
      unsubState();
      unsubPostGame();
    };
  }, [mode, onPostGameTrigger]);

  const onPostGameTriggerRef = useRef(onPostGameTrigger);
  useEffect(() => {
    onPostGameTriggerRef.current = onPostGameTrigger;
  }, [onPostGameTrigger]);

  const isPollingRef = useRef(false);

  // Real Mode Polling Loop (Tauri Backend IPC + Web Fallback)
  const pollRealGame = useCallback(async () => {
    if (mode !== 'LCU_AUTO' || !isMountedRef.current || isPollingRef.current) return;

    isPollingRef.current = true;

    try {
      // 1. Try Tauri backend IPC first (has full OS & LCU access)
      const tauriState = await safeTauriInvoke<GameStateEvent>('get_game_state');
      if (tauriState && typeof tauriState === 'object' && tauriState.phase) {
        if (isMountedRef.current) {
          setGameState((prev) => (isGameStateEqual(prev, tauriState) ? prev : tauriState));

          // Check if newly transitioned to POST_GAME
          if (tauriState.phase === 'POST_GAME' && prevPhaseRef.current !== 'POST_GAME') {
            const payload: PostGamePayload = {
              championName: tauriState.opponentChampion || 'Aatrox',
              matchResult: (tauriState.matchResult as any) || 'WIN',
              gameTimeSeconds: tauriState.gameTimeSeconds || 1500,
              kda: tauriState.kda || '1/0/0',
              itemsBuilt: tauriState.itemsBuilt || undefined,
              summonersUsed: tauriState.summonersUsed || undefined,
              runesUsed: tauriState.runesUsed || undefined,
              cs: tauriState.cs || undefined,
            };
            setPostGameTriggerPayload(payload);
            if (onPostGameTriggerRef.current) onPostGameTriggerRef.current(payload);
          }
          prevPhaseRef.current = tauriState.phase;
        }
        return;
      }

      // 2. Web browser fallback: Try Live Client Data API directly
      const liveData = await LiveClientService.fetchAllGameData();
      if (liveData && liveData.allPlayers && liveData.allPlayers.length > 0) {
        const detection = LiveClientService.detectLaneOpponent(liveData);
        const gameTime = liveData.gameData ? liveData.gameData.gameTime || 0 : 0;
        const myName = liveData.activePlayer ? liveData.activePlayer.summonerName : 'Renekton';
        const potentialOpponents = detection.candidates.map((c) => c.championName);

        const liveState: GameStateEvent = {
          phase: 'IN_GAME',
          connected: true,
          gameTimeSeconds: Math.round(gameTime),
          myChampion: myName || 'Renekton',
          opponentChampion: detection.opponentChampion || undefined,
          opponentConfidence: detection.confidence,
          potentialOpponents,
          matchId: `live_${Math.round(gameTime)}`,
          isManualOverride: detection.isManualOverride || false,
        };

        if (isMountedRef.current) {
          setGameState((prev) => (isGameStateEqual(prev, liveState) ? prev : liveState));
          prevPhaseRef.current = 'IN_GAME';
        }
        return;
      }

      // 3. Client closed or disconnected
      if (isMountedRef.current) {
        setGameState((prev) => (isGameStateEqual(prev, DEFAULT_DISCONNECTED_STATE) ? prev : DEFAULT_DISCONNECTED_STATE));
        prevPhaseRef.current = 'DISCONNECTED';
      }
    } catch {
      if (isMountedRef.current) {
        setGameState((prev) => (isGameStateEqual(prev, DEFAULT_DISCONNECTED_STATE) ? prev : DEFAULT_DISCONNECTED_STATE));
        prevPhaseRef.current = 'DISCONNECTED';
      }
    } finally {
      isPollingRef.current = false;
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'LCU_AUTO') return;

    let isMounted = true;
    pollRealGame();

    const interval = setInterval(() => {
      if (isMounted) {
        pollRealGame();
      }
    }, pollingIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [mode, pollingIntervalMs, pollRealGame]);

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    if (newMode === 'SIMULATOR') {
      setGameState(simulatorEngine.getGameStateEvent());
    } else if (newMode === 'MANUAL') {
      setGameState({
        ...DEFAULT_DISCONNECTED_STATE,
        phase: 'DISCONNECTED',
        connected: false,
      });
    } else {
      setGameState(DEFAULT_DISCONNECTED_STATE);
      // Trigger immediate poll
      setTimeout(() => {
        pollRealGame();
      }, 50);
    }
  }, [pollRealGame]);

  const loadScenario = useCallback(
    (scenarioName: string, customPayload: any = {}) => {
      if (mode !== 'SIMULATOR') {
        setModeState('SIMULATOR');
      }
      simulatorEngine.loadScenario(scenarioName, customPayload);
    },
    [mode]
  );

  const manualOverrideOpponent = useCallback(
    (championName: string) => {
      if (mode === 'SIMULATOR') {
        simulatorEngine.setState({
          opponent_champion: championName,
          opponent_confidence: 100,
          is_manual_override: true,
        });
      } else {
        setGameState((prev) => ({
          ...prev,
          opponentChampion: championName,
          opponentConfidence: 100,
          isManualOverride: true,
        }));
        safeTauriInvoke('manual_override_opponent', { championName });
      }
    },
    [mode]
  );

  const dismissPostGameModal = useCallback(() => {
    setPostGameTriggerPayload(null);
  }, []);

  const refreshGameState = useCallback(async () => {
    if (mode === 'SIMULATOR') {
      setGameState(simulatorEngine.getGameStateEvent());
    } else {
      await pollRealGame();
    }
  }, [mode, pollRealGame]);

  return {
    gameState,
    mode,
    setMode,
    loadScenario,
    manualOverrideOpponent,
    refreshGameState,
    dismissPostGameModal,
    isSimulating: mode === 'SIMULATOR',
    isConnected: gameState.connected,
    phase: gameState.phase,
    myChampion: gameState.myChampion,
    opponentChampion: gameState.opponentChampion,
    opponentConfidence: gameState.opponentConfidence || 0,
    potentialOpponents: gameState.potentialOpponents || [],
    gameTimeSeconds: gameState.gameTimeSeconds || 0,
    matchId: gameState.matchId,
    matchResult: gameState.matchResult || undefined,
    isManualOverride: gameState.isManualOverride || false,
    postGameTriggerPayload,
  };
}
