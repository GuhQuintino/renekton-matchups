/**
 * Post-Game Notes and Performance Analytics Service.
 * Provides unified interface across Tauri IPC (SQLite) and Web/Offline fallback (localStorage/In-Memory).
 */

import type {
  UserNote,
  NewNotePayload,
  UpdateNotePayload,
  NotesSummary,
  MatchResult,
} from '../types/note';
import { getChampionById, getChampionByName, getAllChampions } from '../data/data-engine';

const STORAGE_KEY = 'renekton_matchup_user_notes_v1';

// In-memory cache for fast sync and non-browser Node/test environments
let memoryStore: UserNote[] = [];
let isInitialized = false;
let nextId = 1;

/**
 * Normalizes match result to standard format
 */
export function normalizeMatchResult(result: string): MatchResult {
  const clean = (result || '').trim().toUpperCase();
  if (clean === 'WIN') return 'WIN';
  if (clean === 'LOSS') return 'LOSS';
  if (clean === 'REMAKE') return 'REMAKE';
  throw new Error(`Invalid match_result: "${result}". Must be WIN, LOSS, or REMAKE.`);
}

/**
 * Validates perceived difficulty (1 to 5)
 */
export function validatePerceivedDifficulty(diff: number | string): number {
  const num = typeof diff === 'string' ? parseInt(diff, 10) : Number(diff);
  if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 5) {
    throw new Error(`Invalid perceived_difficulty: "${diff}". Must be an integer between 1 and 5.`);
  }
  return num;
}

/**
 * Checks whether Tauri IPC bridge is available in current runtime
 */
function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ||
    (window as unknown as { __TAURI__?: unknown }).__TAURI__
  );
}

/**
 * Invokes Tauri IPC command safely
 */
async function invokeTauri<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const w = window as unknown as {
    __TAURI__?: { core?: { invoke?: <R>(c: string, a?: Record<string, unknown>) => Promise<R> } };
  };
  if (w.__TAURI__?.core?.invoke) {
    return w.__TAURI__.core.invoke<T>(cmd, args);
  }
  throw new Error('Tauri core invoke not available');
}

/**
 * Loads stored notes from localStorage / memory
 */
function loadLocalStore(): void {
  if (isInitialized) return;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryStore = parsed;
          for (const n of memoryStore) {
            if (n.id >= nextId) {
              nextId = n.id + 1;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[NotesService] Error loading localStorage:', err);
  }
  isInitialized = true;
}

/**
 * Saves in-memory store to localStorage
 */
function saveLocalStore(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    }
  } catch (err) {
    console.warn('[NotesService] Error saving localStorage:', err);
  }
}

/**
 * Helper to resolve champion info
 */
function resolveChampion(championIdOrName: number | string): { id: number; name: string } {
  if (typeof championIdOrName === 'number') {
    const champ = getChampionById(championIdOrName);
    return {
      id: championIdOrName,
      name: champ ? champ.name : `Champion #${championIdOrName}`,
    };
  }

  const str = String(championIdOrName).trim();
  const num = parseInt(str, 10);
  if (!isNaN(num) && String(num) === str) {
    const champ = getChampionById(num);
    return {
      id: num,
      name: champ ? champ.name : `Champion #${num}`,
    };
  }

  const champ = getChampionByName(str);
  if (champ) {
    return { id: champ.id, name: champ.name };
  }

  // Find partial or fallback
  const all = getAllChampions();
  const lower = str.toLowerCase();
  const found = all.find(
    (c) =>
      c.name.toLowerCase() === lower ||
      c.sheetName.toLowerCase() === lower ||
      c.riotKey.toLowerCase() === lower
  );
  if (found) {
    return { id: found.id, name: found.name };
  }

  return { id: 0, name: str };
}

/**
 * Creates a new structured post-game note
 */
export async function createNote(payload: NewNotePayload): Promise<UserNote> {
  if (!payload) {
    throw new Error('Payload is required');
  }

  const validResult = normalizeMatchResult(payload.matchResult);
  const validDifficulty = validatePerceivedDifficulty(payload.perceivedDifficulty);

  let champId = payload.championId;
  let champName = payload.championName;

  if (!champId && champName) {
    const resolved = resolveChampion(champName);
    champId = resolved.id;
    champName = resolved.name;
  } else if (champId && !champName) {
    const resolved = resolveChampion(champId);
    champName = resolved.name;
  }

  if (!champId && !champName) {
    throw new Error('championId or championName is required');
  }

  // Try Tauri IPC if available
  if (isTauriEnvironment()) {
    try {
      const rustNote = await invokeTauri<UserNote>('create_post_game_note', {
        note: {
          champion_id: champId,
          champion_name: champName,
          game_id: payload.gameId || null,
          match_result: validResult,
          perceived_difficulty: validDifficulty,
          what_worked: payload.whatWorked || '',
          what_failed: payload.whatFailed || '',
          free_notes: payload.freeNotes || '',
          runes_used: payload.runesUsed || null,
          items_built: payload.itemsBuilt || null,
          summoners_used: payload.summonersUsed || null,
          kda: payload.kda || null,
          created_at: payload.createdAt || null,
        },
      });
      return rustNote;
    } catch (ipcErr) {
      console.warn('[NotesService] Tauri IPC failed, using local storage fallback:', ipcErr);
    }
  }

  // Local Storage / Memory Fallback
  loadLocalStore();

  const now = payload.createdAt || new Date().toISOString();
  const newNote: UserNote = {
    id: nextId++,
    championId: champId || 1,
    championName: champName || 'Unknown Champion',
    gameId: payload.gameId || undefined,
    matchResult: validResult,
    perceivedDifficulty: validDifficulty,
    whatWorked: payload.whatWorked || '',
    whatFailed: payload.whatFailed || '',
    freeNotes: payload.freeNotes || '',
    runesUsed: payload.runesUsed || undefined,
    itemsBuilt: payload.itemsBuilt || undefined,
    summonersUsed: payload.summonersUsed || undefined,
    kda: payload.kda || undefined,
    createdAt: now,
    updatedAt: now,
  };

  memoryStore.unshift(newNote);
  saveLocalStore();

  return newNote;
}

/**
 * Retrieves all notes for a specific champion (ordered newest first)
 */
export async function getNotesByChampion(
  championIdOrName: number | string
): Promise<UserNote[]> {
  const resolved = resolveChampion(championIdOrName);

  if (isTauriEnvironment()) {
    try {
      const notes = await invokeTauri<UserNote[]>('get_notes_by_champion', {
        champion_name: resolved.name,
      });
      return notes;
    } catch (ipcErr) {
      console.warn('[NotesService] Tauri IPC failed, using local storage fallback:', ipcErr);
    }
  }

  loadLocalStore();

  const filtered = memoryStore.filter((n) => {
    if (resolved.id && n.championId === resolved.id) return true;
    if (
      resolved.name &&
      n.championName &&
      n.championName.toLowerCase() === resolved.name.toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  // Sort descending by createdAt
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return filtered;
}

/**
 * Retrieves a single note by ID
 */
export async function getNoteById(noteId: number): Promise<UserNote | null> {
  loadLocalStore();
  const note = memoryStore.find((n) => n.id === noteId);
  return note || null;
}

/**
 * Updates an existing note
 */
export async function updateNote(
  noteId: number,
  updates: UpdateNotePayload
): Promise<UserNote> {
  if (isTauriEnvironment()) {
    try {
      const updated = await invokeTauri<UserNote>('update_note', {
        note_id: noteId,
        updates: {
          match_result: updates.matchResult
            ? normalizeMatchResult(updates.matchResult)
            : undefined,
          perceived_difficulty:
            updates.perceivedDifficulty !== undefined
              ? validatePerceivedDifficulty(updates.perceivedDifficulty)
              : undefined,
          what_worked: updates.whatWorked,
          what_failed: updates.whatFailed,
          free_notes: updates.freeNotes,
          runes_used: updates.runesUsed,
          items_built: updates.itemsBuilt,
          summoners_used: updates.summonersUsed,
          kda: updates.kda,
        },
      });
      return updated;
    } catch (ipcErr) {
      console.warn('[NotesService] Tauri IPC failed, using local storage fallback:', ipcErr);
    }
  }

  loadLocalStore();
  const index = memoryStore.findIndex((n) => n.id === noteId);
  if (index === -1) {
    throw new Error(`Note with id ${noteId} not found`);
  }

  const existing = memoryStore[index];
  const validResult = updates.matchResult
    ? normalizeMatchResult(updates.matchResult)
    : existing.matchResult;
  const validDifficulty =
    updates.perceivedDifficulty !== undefined
      ? validatePerceivedDifficulty(updates.perceivedDifficulty)
      : existing.perceivedDifficulty;

  const updatedNote: UserNote = {
    ...existing,
    matchResult: validResult,
    perceivedDifficulty: validDifficulty,
    whatWorked: updates.whatWorked !== undefined ? updates.whatWorked : existing.whatWorked,
    whatFailed: updates.whatFailed !== undefined ? updates.whatFailed : existing.whatFailed,
    freeNotes: updates.freeNotes !== undefined ? updates.freeNotes : existing.freeNotes,
    runesUsed: updates.runesUsed !== undefined ? updates.runesUsed : existing.runesUsed,
    itemsBuilt: updates.itemsBuilt !== undefined ? updates.itemsBuilt : existing.itemsBuilt,
    summonersUsed:
      updates.summonersUsed !== undefined ? updates.summonersUsed : existing.summonersUsed,
    kda: updates.kda !== undefined ? updates.kda : existing.kda,
    updatedAt: new Date().toISOString(),
  };

  memoryStore[index] = updatedNote;
  saveLocalStore();

  return updatedNote;
}

/**
 * Deletes a note by ID
 */
export async function deleteNote(noteId: number): Promise<boolean> {
  if (isTauriEnvironment()) {
    try {
      const success = await invokeTauri<boolean>('delete_note', { note_id: noteId });
      return success;
    } catch (ipcErr) {
      console.warn('[NotesService] Tauri IPC failed, using local storage fallback:', ipcErr);
    }
  }

  loadLocalStore();
  const index = memoryStore.findIndex((n) => n.id === noteId);
  if (index === -1) {
    throw new Error(`Note with id ${noteId} not found`);
  }

  memoryStore.splice(index, 1);
  saveLocalStore();
  return true;
}

/**
 * Calculates aggregated performance summary and analytics for a champion
 */
export async function getNotesSummary(
  championIdOrName: number | string
): Promise<NotesSummary> {
  const resolved = resolveChampion(championIdOrName);
  const notes = await getNotesByChampion(championIdOrName);

  if (!notes || notes.length === 0) {
    return {
      championId: resolved.id,
      championName: resolved.name,
      totalMatches: 0,
      wins: 0,
      losses: 0,
      remakes: 0,
      winratePercent: 0,
      avgDifficulty: 0,
      recentNotes: [],
    };
  }

  let wins = 0;
  let losses = 0;
  let remakes = 0;
  let sumDifficulty = 0;

  for (const n of notes) {
    const res = String(n.matchResult).toUpperCase();
    if (res === 'WIN') wins++;
    else if (res === 'LOSS') losses++;
    else if (res === 'REMAKE') remakes++;
    sumDifficulty += Number(n.perceivedDifficulty) || 0;
  }

  const decisiveGames = wins + losses;
  const winratePercent =
    decisiveGames > 0 ? Math.round((wins / decisiveGames) * 1000) / 10 : 0;
  const avgDifficulty = Math.round((sumDifficulty / notes.length) * 10) / 10;

  return {
    championId: resolved.id,
    championName: resolved.name,
    totalMatches: notes.length,
    wins,
    losses,
    remakes,
    winratePercent,
    avgDifficulty,
    recentNotes: notes,
  };
}

/**
 * Retrieves all notes in the database/localStorage
 */
export async function getAllNotes(): Promise<UserNote[]> {
  loadLocalStore();
  return [...memoryStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Clears all notes (useful for testing and data reset)
 */
export async function clearAllNotes(): Promise<void> {
  memoryStore = [];
  nextId = 1;
  saveLocalStore();
}

/**
 * Exports all user notes as JSON string
 */
export async function exportNotes(): Promise<string> {
  const notes = await getAllNotes();
  return JSON.stringify(notes, null, 2);
}

/**
 * Imports notes from JSON string
 */
export async function importNotes(jsonStr: string): Promise<number> {
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error('Import data must be a JSON array of notes');
  }

  loadLocalStore();
  let count = 0;
  for (const item of parsed) {
    if (item.matchResult && item.perceivedDifficulty) {
      await createNote({
        championId: item.championId,
        championName: item.championName,
        gameId: item.gameId,
        matchResult: item.matchResult,
        perceivedDifficulty: item.perceivedDifficulty,
        whatWorked: item.whatWorked,
        whatFailed: item.whatFailed,
        freeNotes: item.freeNotes,
        runesUsed: item.runesUsed,
        itemsBuilt: item.itemsBuilt,
        summonersUsed: item.summonersUsed,
        kda: item.kda,
        createdAt: item.createdAt,
      });
      count++;
    }
  }
  return count;
}

export default {
  createNote,
  getNotesByChampion,
  getNoteById,
  updateNote,
  deleteNote,
  getNotesSummary,
  getAllNotes,
  clearAllNotes,
  exportNotes,
  importNotes,
  normalizeMatchResult,
  validatePerceivedDifficulty,
};
