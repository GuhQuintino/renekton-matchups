/**
 * Instant Search and Filter Service for Champions
 */

class SearchService {
  constructor(championsSummaryList) {
    this.champions = championsSummaryList || [];
    this.aliasMap = new Map([
      ['mundo', 'Dr. Mundo'],
      ['dr mundo', 'Dr. Mundo'],
      ['drmundo', 'Dr. Mundo'],
      ['dr. mundo', 'Dr. Mundo'],
      ['monkeyking', 'Wukong'],
      ['macaco', 'Wukong'],
      ['renata', 'Renata Glasc'],
      ['renata glasc', 'Renata Glasc'],
      ['nunu', 'Nunu & Willump'],
      ['nunu e willump', 'Nunu & Willump'],
      ['nunu & willump', 'Nunu & Willump'],
      ['chogath', 'Cho\'Gath'],
      ['cho\'gath', 'Cho\'Gath'],
      ['kaisa', 'Kai\'Sa'],
      ['kai\'sa', 'Kai\'Sa'],
      ['ksante', 'K\'Sante'],
      ['k\'sante', 'K\'Sante'],
      ['khazix', 'Kha\'Zix'],
      ['kha\'zix', 'Kha\'Zix'],
      ['reksai', 'Rek\'Sai'],
      ['rek\'sai', 'Rek\'Sai'],
      ['velkoz', 'Vel\'Koz'],
      ['vel\'koz', 'Vel\'Koz'],
      ['lillah', 'Lillia'],
      ['millio', 'Milio'],
      ['nillah', 'Nilah'],
      ['tf', 'Twisted Fate'],
      ['asol', 'Aurelion Sol'],
      ['yi', 'Master Yi'],
      ['mf', 'Miss Fortune'],
      ['j4', 'Jarvan IV']
    ]);
  }

  static normalize(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  search(options = {}) {
    const startTime = process.hrtime();
    const query = (options.query || '').trim();
    const normalizedQuery = SearchService.normalize(query);
    const difficultyFilter = options.difficulty ? options.difficulty.toUpperCase() : 'ALL';
    const favoritesOnly = !!options.favoritesOnly;
    const notesOnly = !!options.notesOnly;
    const userFavorites = options.userFavorites || new Set();
    const userNotesMap = options.userNotesMap || new Map();
    const sortBy = options.sortBy || 'ALPHABETICAL_ASC';

    // Check alias
    const aliasTarget = this.aliasMap.get(query.toLowerCase());
    const normalizedAlias = aliasTarget ? SearchService.normalize(aliasTarget) : null;

    let results = this.champions.filter(champ => {
      // 1. Text Search
      if (query.length > 0) {
        const normName = SearchService.normalize(champ.championName);
        const normRiot = SearchService.normalize(champ.riotKey);
        const matchesName = normName.includes(normalizedQuery);
        const matchesRiot = normRiot.includes(normalizedQuery);
        const matchesAlias = normalizedAlias && (normName.includes(normalizedAlias) || normRiot.includes(normalizedAlias));

        if (!matchesName && !matchesRiot && !matchesAlias) {
          return false;
        }
      }

      // 2. Difficulty Filter
      if (difficultyFilter !== 'ALL') {
        const tier = (champ.difficultyTier || '').toUpperCase();
        if (difficultyFilter === 'EASY' && tier !== 'EASY') return false;
        if (difficultyFilter === 'MEDIUM' && tier !== 'MEDIUM') return false;
        if (difficultyFilter === 'HARD' && tier !== 'HARD') return false;
        if ((difficultyFilter === 'VERY HARD' || difficultyFilter === 'VERY_HARD') && tier !== 'VERY HARD') return false;
        if (difficultyFilter === 'EXTREME' && !(tier === 'VERY HARD' || champ.difficultyRating >= 9)) return false;
      }

      // 3. Favorites Filter
      if (favoritesOnly && !userFavorites.has(champ.championId)) {
        return false;
      }

      // 4. Notes Filter
      if (notesOnly && (!userNotesMap.has(champ.championId) || userNotesMap.get(champ.championId).length === 0)) {
        return false;
      }

      return true;
    });

    // Sort Results
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
        case 'WINRATE_DESC': {
          const wrA = (userNotesMap.get(a.championId) && userNotesMap.get(a.championId).winrate) || 0;
          const wrB = (userNotesMap.get(b.championId) && userNotesMap.get(b.championId).winrate) || 0;
          return wrB - wrA;
        }
        default:
          return 0;
      }
    });

    const elapsed = process.hrtime(startTime);
    const executionTimeMs = (elapsed[0] * 1000) + (elapsed[1] / 1000000);

    return {
      results,
      count: results.length,
      executionTimeMs
    };
  }
}

module.exports = {
  SearchService
};
