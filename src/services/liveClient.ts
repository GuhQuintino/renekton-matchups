/**
 * Riot Live Client Data API Service & Lane Opponent Detector (TypeScript)
 */

export const TOP_LANER_CATALOG = new Set([
  'Aatrox', 'Akali', 'Camille', "Cho'Gath", 'Darius', 'Dr. Mundo', 'Fiora', 'Gangplank',
  'Garen', 'Gnar', 'Gragas', 'Gwen', 'Illaoi', 'Irelia', 'Jax', 'Jayce', "K'Sante",
  'Kayle', 'Kennen', 'Kled', 'Malphite', 'Mordekaiser', 'Nasus', 'Olaf', 'Ornn',
  'Pantheon', 'Poppy', 'Quinn', 'Renekton', 'Riven', 'Rumble', 'Sett', 'Shen',
  'Singed', 'Sion', 'Tahm Kench', 'Teemo', 'Trundle', 'Tryndamere', 'Urgot', 'Varus',
  'Vayne', 'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Yasuo', 'Yone', 'Yorick',
  'Ambessa', 'Aurora', 'Briar', "K'sante", 'DrMundo', 'MonkeyKing', 'Chogath'
]);

export interface LivePlayerSpell {
  displayName?: string;
  rawDescription?: string;
  rawDisplayName?: string;
}

export interface LivePlayerItem {
  itemID?: number;
  displayName?: string;
  count?: number;
  price?: number;
  slot?: number;
}

export interface LivePlayer {
  summonerName?: string;
  championName?: string;
  team?: string; // "ORDER" or "CHAOS"
  position?: string; // "TOP", "MIDDLE", "BOTTOM", "JUNGLE", "UTILITY"
  summonerSpellOne?: LivePlayerSpell | null;
  summonerSpellTwo?: LivePlayerSpell | null;
  items?: LivePlayerItem[] | null;
  scores?: {
    kills?: number;
    deaths?: number;
    assists?: number;
    creepScore?: number;
    wardScore?: number;
  };
  level?: number;
  isDead?: boolean;
}

export interface LiveActivePlayer {
  summonerName?: string;
  level?: number;
  currentGold?: number;
  championStats?: Record<string, any>;
}

export interface LiveGameData {
  gameTime?: number;
  gameMode?: string;
  mapNumber?: number;
  mapName?: string;
  mapTerrain?: string;
}

export interface LiveAllGameData {
  activePlayer?: LiveActivePlayer | null;
  allPlayers?: LivePlayer[] | null;
  events?: { Events?: any[] };
  gameData?: LiveGameData | null;
}

export interface ScoredEnemyCandidate {
  championName: string;
  position?: string;
  score: number;
  playerData: LivePlayer;
}

export interface LaneDetectionResult {
  detected: boolean;
  opponentChampion: string | null;
  confidence: number;
  topCandidateScore: number;
  candidates: ScoredEnemyCandidate[];
  isManualOverride?: boolean;
}

export class LiveClientService {
  /**
   * Calculates confidence score for an enemy player being the lane opponent of Renekton (Top lane)
   */
  static calculateOpponentScore(player: LivePlayer | null | undefined): number {
    if (!player) return -9999;
    let score = 0;
    const pos = (player.position || '').toUpperCase();
    const spells = [
      ((player.summonerSpellOne && player.summonerSpellOne.displayName) || '').toLowerCase(),
      ((player.summonerSpellTwo && player.summonerSpellTwo.displayName) || '').toLowerCase(),
    ];
    const items = (player.items || []).map(it => ((it && it.displayName) || '').toLowerCase());
    const champName = player.championName || '';

    // 1. Position Scoring
    if (pos === 'TOP') {
      score += 100;
    } else if (pos === 'MIDDLE' || pos === 'MID') {
      score += 30;
    } else if (pos === 'BOTTOM' || pos === 'BOT') {
      score -= 300;
    } else if (pos === 'JUNGLE') {
      score -= 500;
    } else if (pos === 'UTILITY' || pos === 'SUPPORT') {
      score -= 500;
    }

    // 2. Summoner Spell Scoring
    const hasSmite = spells.some(s => s.includes('smite') || s.includes('golpear'));
    const hasTeleport = spells.some(s => s.includes('teleport') || s.includes('tp'));
    const hasIgniteOrGhost = spells.some(s => s.includes('ignite') || s.includes('ghost'));
    const hasHealOrCleanse = spells.some(s => s.includes('heal') || s.includes('cleanse') || s.includes('barrier'));

    if (hasSmite) score -= 1000;
    if (hasTeleport) score += 40;
    if (hasIgniteOrGhost) score += 25;
    if (hasHealOrCleanse && pos !== 'TOP') score -= 200;

    // 3. Item Scoring
    const hasJungleItem = items.some(
      it =>
        it.includes('smite') ||
        it.includes('pet') ||
        it.includes('seedling') ||
        it.includes('emberknife') ||
        it.includes('scorchclaw')
    );

    const hasSupportItem = items.some(
      it =>
        it.includes('atlas') ||
        it.includes('world') ||
        it.includes('relic') ||
        it.includes('spellthief') ||
        it.includes('sickle') ||
        it.includes('shoulderguards')
    );

    const hasDorans = items.some(it => it.includes('doran'));

    if (hasJungleItem) score -= 1000;
    if (hasSupportItem) score -= 1000;
    if (hasDorans) score += 20;

    // 4. Catalog Check
    if (TOP_LANER_CATALOG.has(champName)) {
      score += 30;
    }

    return score;
  }

  /**
   * Detects the lane opponent from full allgamedata payload
   */
  static detectLaneOpponent(allGameData: LiveAllGameData | null | undefined): LaneDetectionResult {
    if (!allGameData || !allGameData.allPlayers || !Array.isArray(allGameData.allPlayers) || allGameData.allPlayers.length === 0) {
      return {
        detected: false,
        opponentChampion: null,
        confidence: 0,
        topCandidateScore: 0,
        candidates: [],
      };
    }

    const activePlayerName = allGameData.activePlayer ? allGameData.activePlayer.summonerName : null;
    const allPlayers = allGameData.allPlayers;

    // Find active player's team (ORDER or CHAOS)
    let myTeamName: string | null = null;
    for (const p of allPlayers) {
      if (p.summonerName === activePlayerName || p.championName === 'Renekton') {
        myTeamName = p.team || null;
        break;
      }
    }

    if (!myTeamName && allPlayers.length > 0) {
      myTeamName = allPlayers[0].team || null;
    }

    // Filter enemies
    const enemies = allPlayers.filter(p => p.team !== myTeamName);
    if (enemies.length === 0) {
      return {
        detected: false,
        opponentChampion: null,
        confidence: 0,
        topCandidateScore: 0,
        candidates: [],
      };
    }

    // Special case: Single enemy in match (Practice Tool, 1v1, Custom Game against 1 bot)
    if (enemies.length === 1) {
      const singleEnemy = enemies[0];
      const champName = singleEnemy.championName || 'Warwick';
      const candidate: ScoredEnemyCandidate = {
        championName: champName,
        position: singleEnemy.position,
        score: 1000,
        playerData: singleEnemy,
      };

      return {
        detected: true,
        opponentChampion: champName,
        confidence: 100,
        topCandidateScore: 1000,
        candidates: [candidate],
      };
    }

    // Score all enemies for standard matches
    const scoredEnemies: ScoredEnemyCandidate[] = enemies.map(p => ({
      championName: p.championName || '',
      position: p.position,
      score: LiveClientService.calculateOpponentScore(p),
      playerData: p,
    }));

    scoredEnemies.sort((a, b) => b.score - a.score);

    const topCandidate = scoredEnemies[0];
    const confidence = Math.min(100, Math.max(30, Math.round((topCandidate.score + 500) / 7)));
    const candidateName = topCandidate.championName ? topCandidate.championName : null;

    return {
      detected: candidateName !== null,
      opponentChampion: candidateName,
      confidence,
      topCandidateScore: topCandidate.score,
      candidates: scoredEnemies,
    };
  }

  /**
   * Supports manual lane swap override
   */
  static manualLaneSwap(currentDetection: LaneDetectionResult, newChampionName: string): LaneDetectionResult {
    return {
      ...currentDetection,
      detected: true,
      opponentChampion: newChampionName,
      confidence: 100,
      isManualOverride: true,
    };
  }

  /**
   * Fetches all game data directly via HTTP
   */
  static async fetchAllGameData(): Promise<LiveAllGameData | null> {
    try {
      const url = 'https://127.0.0.1:2999/liveclientdata/allgamedata';
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}
