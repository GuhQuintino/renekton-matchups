/**
 * Matchup and Matchup Tips interfaces.
 */

export type DifficultyTier = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export type Level1StartType = 'Q' | 'W' | 'E' | 'E_ALCOVE' | 'SITUATIONAL';

export interface MatchupTip {
  id: number;
  matchupId: number;
  tipNumber: number;
  titleEn: string;
  titlePt: string;
  contentEn: string;
  contentPt: string;
  category: 'Level 1' | 'Trading' | 'All-in' | 'Wave Management' | 'Itemization' | 'Teamfight' | 'General';
  displayOrder: number;
}

export type LevelAdvantageType = 'advantage' | 'disadvantage' | 'neutral';

export interface LevelAdvantageMatrix {
  lv1: LevelAdvantageType;
  lv2: LevelAdvantageType;
  lv3: LevelAdvantageType;
  lv4: LevelAdvantageType;
  lv5: LevelAdvantageType;
  lv6: LevelAdvantageType;
}

export interface DeepLoLTip {
  titleEn: string;
  titlePt: string;
  contentEn: string;
  contentPt: string;
}

export interface DeepLoLStats {
  sampleSize: number;
  renektonWinRate: number;
  enemyWinRate: number;
}

export interface DeepLoLData {
  hasData: boolean;
  levelAdvantage?: LevelAdvantageMatrix;
  tips?: DeepLoLTip[];
  stats?: DeepLoLStats;
}

export interface MatchupSummary {
  id: number;
  championId: number;
  championName: string;
  sheetName: string;
  riotKey: string;
  difficultyTier: DifficultyTier;
  difficultyRating: number;   // 1 to 10 scale
  difficultyRaw: string;     // e.g. "Medium - 5/10"
  runesRecommendation: string;
  startingItems: string;
  summonerSpells: string;
  abilityMaxOrder: string;
  level1Start?: Level1StartType;
  level1ExplanationPt?: string;
  level1ExplanationEn?: string;
  winConditionPt?: string;
  winConditionEn?: string;
  cautionPt?: string;
  cautionEn?: string;
  iconUrl: string;
  roles: string[];
  hasVideo: boolean;
  videoUrl?: string;
  videoId?: string;
  videoTitle?: string;
  videoChannel?: string;
  videoSource?: 'godrekton_sheet' | 'youtube_kr_challenger' | 'youtube_search_fallback' | 'sheet_raw' | string;
  deepLol?: DeepLoLData;
}

export interface MatchupDetail extends MatchupSummary {
  summaryEn: string;
  summaryPt: string;
  detailedNotesRawEn: string;
  detailedNotesRawPt: string;
  videoUrl?: string;
  videoId?: string;
  videoTitle?: string;
  videoChannel?: string;
  videoSource?: 'godrekton_sheet' | 'youtube_kr_challenger' | 'youtube_search_fallback' | 'sheet_raw' | string;
  tips: MatchupTip[];
  furyTips?: string[];
  createdAt?: string;
  updatedAt?: string;
  deepLol?: DeepLoLData;
}

