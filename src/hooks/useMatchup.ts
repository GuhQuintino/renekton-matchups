import { useState, useEffect, useMemo, useCallback } from 'react';
import type { MatchupDetail, MatchupSummary } from '../types';
import { getMatchupByChampion, getAllMatchupsSummary } from '../data/data-engine';

export function useMatchup(initialChampion = 'Aatrox') {
  const [selectedChampionName, setSelectedChampionName] = useState<string>(initialChampion);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Retrieve all summaries for navigation
  const summaries = useMemo(() => getAllMatchupsSummary(), []);

  // Retrieve active matchup details
  const matchup = useMemo<MatchupDetail | undefined>(() => {
    return getMatchupByChampion(selectedChampionName) || getMatchupByChampion('Aatrox');
  }, [selectedChampionName]);

  const selectChampion = useCallback((nameOrKey: string) => {
    if (!nameOrKey) return;
    setSelectedChampionName((prev) => {
      if (prev.toLowerCase() === nameOrKey.toLowerCase()) {
        return prev;
      }
      return nameOrKey;
    });
  }, []);

  return {
    selectedChampionName,
    matchup,
    isLoading,
    selectChampion,
    summaries
  };
}
