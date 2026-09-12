/**
 * React Hooks for Post-Game Notes Management and Auto-Trigger.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  UserNote,
  NewNotePayload,
  UpdateNotePayload,
  NotesSummary,
  MatchResult,
} from '../types/note';
import type { GameStateEvent } from '../types/game';
import {
  createNote,
  getNotesByChampion,
  getNotesSummary,
  updateNote,
  deleteNote,
  getAllNotes,
  exportNotes,
  importNotes,
} from '../services/notes';

/**
 * Hook for managing notes and summary for a specific champion.
 */
export function useNotes(championIdOrName?: number | string) {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [summary, setSummary] = useState<NotesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotesAndSummary = useCallback(async () => {
    if (!championIdOrName && championIdOrName !== 0) {
      setNotes([]);
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [fetchedNotes, fetchedSummary] = await Promise.all([
        getNotesByChampion(championIdOrName),
        getNotesSummary(championIdOrName),
      ]);
      setNotes(fetchedNotes);
      setSummary(fetchedSummary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error('[useNotes] Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [championIdOrName]);

  useEffect(() => {
    fetchNotesAndSummary();
  }, [fetchNotesAndSummary]);

  const addNote = useCallback(
    async (payload: NewNotePayload): Promise<UserNote> => {
      setError(null);
      try {
        const created = await createNote(payload);
        await fetchNotesAndSummary();
        return created;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      }
    },
    [fetchNotesAndSummary]
  );

  const editNote = useCallback(
    async (noteId: number, updates: UpdateNotePayload): Promise<UserNote> => {
      setError(null);
      try {
        const updated = await updateNote(noteId, updates);
        await fetchNotesAndSummary();
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      }
    },
    [fetchNotesAndSummary]
  );

  const removeNote = useCallback(
    async (noteId: number): Promise<boolean> => {
      setError(null);
      try {
        const success = await deleteNote(noteId);
        await fetchNotesAndSummary();
        return success;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      }
    },
    [fetchNotesAndSummary]
  );

  return {
    notes,
    summary,
    loading,
    error,
    addNote,
    editNote,
    removeNote,
    refresh: fetchNotesAndSummary,
  };
}

/**
 * Hook for global notes management across all champions.
 */
export function useAllNotes() {
  const [allNotes, setAllNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllNotes();
      setAllNotes(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error('[useAllNotes] Error fetching all notes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    allNotes,
    loading,
    error,
    refresh: fetchAll,
    exportData: exportNotes,
    importData: importNotes,
  };
}

export interface PostGameTriggerPayload {
  opponentChampion: string;
  matchResult?: MatchResult;
  gameTimeSeconds?: number;
  matchId?: string;
}

/**
 * Automatic Post-Game Trigger Hook.
 * Detects transition from IN_GAME -> POST_GAME and fires callback with match details.
 */
export function usePostGameTrigger(
  gameState: GameStateEvent | null,
  onTrigger: (data: PostGameTriggerPayload) => void
) {
  const prevPhaseRef = useRef<string | null>(null);
  const lastTriggeredMatchRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gameState) return;

    const currentPhase = gameState.phase;
    const prevPhase = prevPhaseRef.current;

    // Detect IN_GAME -> POST_GAME transition
    if (prevPhase === 'IN_GAME' && currentPhase === 'POST_GAME') {
      const opponent = gameState.opponentChampion || 'Aatrox';
      const matchKey = `${opponent}_${gameState.matchId || ''}_${gameState.gameTimeSeconds || 0}`;

      if (lastTriggeredMatchRef.current !== matchKey) {
        lastTriggeredMatchRef.current = matchKey;

        onTrigger({
          opponentChampion: opponent,
          matchResult: 'WIN', // Default suggestion
          gameTimeSeconds: gameState.gameTimeSeconds,
          matchId: gameState.matchId,
        });
      }
    }

    // Reset lock when starting a new draft or match
    if (currentPhase === 'CHAMP_SELECT' || currentPhase === 'IN_GAME') {
      if (prevPhase === 'POST_GAME' || prevPhase === 'LOBBY') {
        lastTriggeredMatchRef.current = null;
      }
    }

    prevPhaseRef.current = currentPhase;
  }, [gameState, onTrigger]);
}

export default {
  useNotes,
  useAllNotes,
  usePostGameTrigger,
};
