/**
 * Riot Live Client Data API Service & Lane Opponent Detector
 */

const TOP_LANER_CATALOG = new Set([
  'Aatrox', 'Akali', 'Camille', 'Cho\'Gath', 'Darius', 'Dr. Mundo', 'Fiora', 'Gangplank',
  'Garen', 'Gnar', 'Gragas', 'Gwen', 'Illaoi', 'Irelia', 'Jax', 'Jayce', 'K\'Sante',
  'Kayle', 'Kennen', 'Kled', 'Malphite', 'Mordekaiser', 'Nasus', 'Olaf', 'Ornn',
  'Pantheon', 'Poppy', 'Quinn', 'Renekton', 'Riven', 'Rumble', 'Sett', 'Shen',
  'Singed', 'Sion', 'Tahm Kench', 'Teemo', 'Trundle', 'Tryndamere', 'Urgot', 'Varus',
  'Vayne', 'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Yasuo', 'Yone', 'Yorick'
]);

class LiveClientService {
  /**
   * Calculates confidence score for an enemy player being the lane opponent of Renekton (Top lane)
   */
  static calculateOpponentScore(player) {
    let score = 0;
    const pos = (player.position || '').toUpperCase();
    const spells = [
      (player.summonerSpellOne && player.summonerSpellOne.displayName || '').toLowerCase(),
      (player.summonerSpellTwo && player.summonerSpellTwo.displayName || '').toLowerCase()
    ];
    const items = (player.items || []).map(it => (it.displayName || '').toLowerCase());
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
    const hasJungleItem = items.some(it => it.includes('smite') || it.includes('pet') || it.includes('seedling') || it.includes('emberknife') || it.includes('scorchclaw'));
    const hasSupportItem = items.some(it => it.includes('atlas') || it.includes('world') || it.includes('relic') || it.includes('spellthief') || it.includes('sickle') || it.includes('shoulderguards'));
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
  static detectLaneOpponent(allGameData) {
    if (!allGameData || !allGameData.allPlayers || !Array.isArray(allGameData.allPlayers)) {
      return {
        detected: false,
        opponentChampion: null,
        confidence: 0,
        candidates: []
      };
    }

    const activePlayerName = allGameData.activePlayer ? allGameData.activePlayer.summonerName : null;
    const allPlayers = allGameData.allPlayers;

    // Find active player's team (ORDER or CHAOS)
    let myTeamName = null;
    for (const p of allPlayers) {
      if (p.summonerName === activePlayerName || p.championName === 'Renekton') {
        myTeamName = p.team;
        break;
      }
    }

    if (!myTeamName && allPlayers.length > 0) {
      myTeamName = allPlayers[0].team; // Default to first player's team if not found
    }

    // Filter enemies
    const enemies = allPlayers.filter(p => p.team !== myTeamName);
    if (enemies.length === 0) {
      return {
        detected: false,
        opponentChampion: null,
        confidence: 0,
        candidates: []
      };
    }

    // Special case: Single enemy in match (Practice Tool, 1v1, Custom Game)
    if (enemies.length === 1) {
      const singleEnemy = enemies[0];
      const champName = singleEnemy.championName || 'Warwick';
      const candidate = {
        championName: champName,
        position: singleEnemy.position,
        score: 1000,
        playerData: singleEnemy
      };

      return {
        detected: true,
        opponentChampion: champName,
        confidence: 100,
        topCandidateScore: 1000,
        candidates: [candidate]
      };
    }

    // Score all enemies
    const scoredEnemies = enemies.map(p => ({
      championName: p.championName,
      position: p.position,
      score: LiveClientService.calculateOpponentScore(p),
      playerData: p
    }));

    scoredEnemies.sort((a, b) => b.score - a.score);

    const topCandidate = scoredEnemies[0];
    const confidence = Math.min(100, Math.max(30, Math.round((topCandidate.score + 500) / 7)));

    return {
      detected: topCandidate.championName !== undefined,
      opponentChampion: topCandidate.championName,
      confidence,
      topCandidateScore: topCandidate.score,
      candidates: scoredEnemies
    };
  }

  /**
   * Supports manual lane swap override
   */
  static manualLaneSwap(currentDetection, newChampionName) {
    return {
      ...currentDetection,
      detected: true,
      opponentChampion: newChampionName,
      confidence: 100,
      isManualOverride: true
    };
  }
}

module.exports = {
  LiveClientService,
  TOP_LANER_CATALOG
};
