/**
 * High-performance In-Memory Data Engine for Renekton Matchup Tool.
 * Provides instant query responses (<1ms) with full offline support.
 */

import championsData from './champions.json';
import matchupsData from './matchups.json';
import summariesData from './matchup-summaries.json';
import guidesData from './guides.json';

import type {
  Champion,
  MatchupDetail,
  MatchupSummary,
  GuideContent,
  GuideCategory,
  DifficultyTier
} from '../types';

// Typed cached collections
const champions: Champion[] = championsData as Champion[];
const matchups: MatchupDetail[] = matchupsData as unknown as MatchupDetail[];
const summaries: MatchupSummary[] = summariesData as unknown as MatchupSummary[];
const guides: GuideContent[] = guidesData as unknown as GuideContent[];

// Fast lookup indices
const championByName = new Map<string, Champion>();
const championByRiotKey = new Map<string, Champion>();
const championById = new Map<number, Champion>();

const matchupByChampionName = new Map<string, MatchupDetail>();
const matchupByRiotKey = new Map<string, MatchupDetail>();
const matchupById = new Map<number, MatchupDetail>();

const guideByCategory = new Map<string, GuideContent>();

// Initialize lookup caches
for (const champ of champions) {
  championById.set(champ.id, champ);
  championByName.set(champ.name.toLowerCase(), champ);
  championByName.set(champ.sheetName.toLowerCase(), champ);
  championByRiotKey.set(champ.riotKey.toLowerCase(), champ);
}

for (const m of matchups) {
  matchupById.set(m.id, m);
  matchupByChampionName.set(m.championName.toLowerCase(), m);
  matchupByChampionName.set(m.sheetName.toLowerCase(), m);
  matchupByRiotKey.set(m.riotKey.toLowerCase(), m);
}

for (const g of guides) {
  guideByCategory.set(g.category.toLowerCase(), g);
}

/**
 * Returns all 170 champions.
 */
export function getAllChampions(): Champion[] {
  return champions;
}

/**
 * Gets champion by numerical ID.
 */
export function getChampionById(id: number): Champion | undefined {
  return championById.get(id);
}

/**
 * Gets champion by display name or spreadsheet name (case-insensitive).
 */
export function getChampionByName(name: string): Champion | undefined {
  if (!name) return undefined;
  return championByName.get(name.trim().toLowerCase());
}

/**
 * Gets champion by Riot Data Dragon key (case-insensitive).
 */
export function getChampionByRiotKey(riotKey: string): Champion | undefined {
  if (!riotKey) return undefined;
  return championByRiotKey.get(riotKey.trim().toLowerCase());
}

/**
 * Returns summary list of all 170 matchups for quick sidebar rendering and search.
 */
export function getAllMatchupsSummary(): MatchupSummary[] {
  return summaries;
}

/**
 * Returns full matchup details by champion name, sheet name, or Riot key.
 */
export function getMatchupByChampion(identifier: string): MatchupDetail | undefined {
  if (!identifier) return undefined;
  const clean = identifier.trim().toLowerCase();
  return (
    matchupByChampionName.get(clean) ||
    matchupByRiotKey.get(clean) ||
    matchups.find(
      (m) =>
        m.championName.toLowerCase() === clean ||
        m.riotKey.toLowerCase() === clean ||
        m.sheetName.toLowerCase() === clean
    )
  );
}

/**
 * Returns full matchup details by matchup ID.
 */
export function getMatchupById(id: number): MatchupDetail | undefined {
  return matchupById.get(id);
}

/**
 * Instant full-text and difficulty filter search (<5ms).
 */
export function searchMatchups(
  query = '',
  difficulty?: DifficultyTier | 'All'
): MatchupSummary[] {
  const q = query.trim().toLowerCase();
  return summaries.filter((item) => {
    const matchesDifficulty =
      !difficulty || difficulty === 'All' || item.difficultyTier === difficulty;

    if (!matchesDifficulty) return false;
    if (!q) return true;

    return (
      item.championName.toLowerCase().includes(q) ||
      item.sheetName.toLowerCase().includes(q) ||
      item.riotKey.toLowerCase().includes(q) ||
      item.roles.some((r) => r.toLowerCase().includes(q)) ||
      item.runesRecommendation.toLowerCase().includes(q) ||
      item.startingItems.toLowerCase().includes(q)
    );
  });
}

/**
 * Returns all 8 general guides.
 */
export function getAllGuides(): GuideContent[] {
  return guides;
}

/**
 * Returns guide content by category.
 */
export function getGuideByCategory(category: GuideCategory | string): GuideContent | undefined {
  if (!category) return undefined;
  return guideByCategory.get(category.trim().toLowerCase());
}

export default {
  getAllChampions,
  getChampionById,
  getChampionByName,
  getChampionByRiotKey,
  getAllMatchupsSummary,
  getMatchupByChampion,
  getMatchupById,
  searchMatchups,
  getAllGuides,
  getGuideByCategory,
};
