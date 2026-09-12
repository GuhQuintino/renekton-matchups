import { useState, useMemo, useCallback } from 'react';
import type { MatchupSummary, DifficultyTier } from '../types';
import { getAllMatchupsSummary } from '../data/data-engine';

export type SortOption =
  | 'ALPHABETICAL_ASC'
  | 'ALPHABETICAL_DESC'
  | 'DIFFICULTY_ASC'
  | 'DIFFICULTY_DESC';

export type DifficultyFilterOption = 'ALL' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY HARD' | 'EXTREME';

const ALIAS_MAP: Record<string, string> = {
  'mundo': 'Dr. Mundo',
  'dr mundo': 'Dr. Mundo',
  'drmundo': 'Dr. Mundo',
  'dr. mundo': 'Dr. Mundo',
  'monkeyking': 'Wukong',
  'macaco': 'Wukong',
  'renata': 'Renata Glasc',
  'renata glasc': 'Renata Glasc',
  'nunu': 'Nunu & Willump',
  'nunu e willump': 'Nunu & Willump',
  'nunu & willump': 'Nunu & Willump',
  'chogath': 'Cho\'Gath',
  'cho\'gath': 'Cho\'Gath',
  'kaisa': 'Kai\'Sa',
  'kai\'sa': 'Kai\'Sa',
  'ksante': 'K\'Sante',
  'k\'sante': 'K\'Sante',
  'khazix': 'Kha\'Zix',
  'kha\'zix': 'Kha\'Zix',
  'reksai': 'Rek\'Sai',
  'rek\'sai': 'Rek\'Sai',
  'velkoz': 'Vel\'Koz',
  'vel\'koz': 'Vel\'Koz',
  'lillah': 'Lillia',
  'millio': 'Milio',
  'nillah': 'Nilah',
  'tf': 'Twisted Fate',
  'asol': 'Aurelion Sol',
  'yi': 'Master Yi',
  'mf': 'Miss Fortune',
  'j4': 'Jarvan IV'
};

function normalizeString(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function useSearch(initialList?: MatchupSummary[]) {
  const allChampions = useMemo(() => initialList || getAllMatchupsSummary(), [initialList]);

  const [query, setQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilterOption>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [notesOnly, setNotesOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('ALPHABETICAL_ASC');

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('renekton_fav_champions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  const toggleFavorite = useCallback((championId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(championId)) {
        next.delete(championId);
      } else {
        next.add(championId);
      }
      try {
        localStorage.setItem('renekton_fav_champions', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const { filteredChampions, executionTimeMs } = useMemo(() => {
    const startTime = performance.now();
    const cleanQuery = query.trim();
    const normQuery = normalizeString(cleanQuery);

    const aliasTarget = ALIAS_MAP[cleanQuery.toLowerCase()];
    const normAlias = aliasTarget ? normalizeString(aliasTarget) : null;

    const results = allChampions.filter((champ) => {
      // 1. Text Search (< 10ms with normalized index)
      if (cleanQuery.length > 0) {
        const normName = normalizeString(champ.championName);
        const normRiot = normalizeString(champ.riotKey);
        const normSheet = normalizeString(champ.sheetName);

        const matchesName = normName.includes(normQuery);
        const matchesRiot = normRiot.includes(normQuery);
        const matchesSheet = normSheet.includes(normQuery);
        const matchesAlias = normAlias && (normName.includes(normAlias) || normRiot.includes(normAlias));

        if (!matchesName && !matchesRiot && !matchesSheet && !matchesAlias) {
          return false;
        }
      }

      // 2. Difficulty Filter
      if (difficultyFilter !== 'ALL') {
        const tier = (champ.difficultyTier || '').toUpperCase();
        if (difficultyFilter === 'EASY' && tier !== 'EASY') return false;
        if (difficultyFilter === 'MEDIUM' && tier !== 'MEDIUM') return false;
        if (difficultyFilter === 'HARD' && tier !== 'HARD') return false;
        if (difficultyFilter === 'VERY HARD' && tier !== 'VERY HARD') return false;
        if (difficultyFilter === 'EXTREME' && !(tier === 'VERY HARD' || champ.difficultyRating >= 9)) return false;
      }

      // 3. Favorites Filter
      if (favoritesOnly && !favorites.has(champ.championId)) {
        return false;
      }

      return true;
    });

    // 4. Sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'ALPHABETICAL_ASC':
          return a.championName.localeCompare(b.championName);
        case 'ALPHABETICAL_DESC':
          return b.championName.localeCompare(a.championName);
        case 'DIFFICULTY_ASC':
          return a.difficultyRating - b.difficultyRating || a.championName.localeCompare(b.championName);
        case 'DIFFICULTY_DESC':
          return b.difficultyRating - a.difficultyRating || a.championName.localeCompare(b.championName);
        default:
          return 0;
      }
    });

    const endTime = performance.now();

    return {
      filteredChampions: results,
      executionTimeMs: endTime - startTime
    };
  }, [allChampions, query, difficultyFilter, favoritesOnly, favorites, sortBy]);

  return {
    query,
    setQuery,
    difficultyFilter,
    setDifficultyFilter,
    favoritesOnly,
    setFavoritesOnly,
    notesOnly,
    setNotesOnly,
    sortBy,
    setSortBy,
    favorites,
    toggleFavorite,
    filteredChampions,
    totalCount: allChampions.length,
    filteredCount: filteredChampions.length,
    executionTimeMs
  };
}
