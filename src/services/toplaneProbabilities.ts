/**
 * Toplane Role Probability & Matchup Role Classifier for League of Legends Drafts
 */

// Native & frequent Toplaners with their baseline probability of going Top
const TOPLANE_FREQUENCIES: Record<string, number> = {
  // Heavy Primary Toplaners (90% - 99%)
  'Aatrox': 99,
  'Camille': 98,
  'Cho\'Gath': 95,
  'Chogath': 95,
  'Darius': 99,
  'Dr. Mundo': 96,
  'DrMundo': 96,
  'Fiora': 99,
  'Gangplank': 97,
  'Garen': 98,
  'Gnar': 99,
  'Gwen': 95,
  'Illaoi': 99,
  'Irelia': 85,
  'Jax': 96,
  'Jayce': 88,
  'K\'Sante': 98,
  'KSante': 98,
  'Kayle': 92,
  'Kennen': 94,
  'Kled': 98,
  'Malphite': 92,
  'Mordekaiser': 97,
  'Nasus': 98,
  'Olaf': 90,
  'Ornn': 97,
  'Pantheon': 75,
  'Poppy': 80,
  'Quinn': 92,
  'Renekton': 98,
  'Riven': 99,
  'Rumble': 85,
  'Sett': 96,
  'Shen': 92,
  'Singed': 98,
  'Sion': 95,
  'Tahm Kench': 88,
  'TahmKench': 88,
  'Teemo': 93,
  'Trundle': 85,
  'Tryndamere': 95,
  'Urgot': 99,
  'Volibear': 90,
  'Warwick': 75,
  'Wukong': 75,
  'MonkeyKing': 75,
  'Yorick': 99,
  'Ambessa': 90,

  // Secondary Toplaners / Flex Picks (40% - 70%)
  'Gragas': 70,
  'Akali': 55,
  'Yasuo': 45,
  'Yone': 65,
  'Sylas': 40,
  'Zac': 45,
  'Cassiopeia': 35,
  'Heimerdinger': 45,
  'Karma': 30,
  'Lillia': 30,
  'Rengar': 40,
  'Sejuani': 40,
  'Udyr': 50,
  'Vayne': 40,
  'Varus': 25,
  'Vladimir': 65,

  // Junglers / Mids (10% - 30%)
  'Lee Sin': 10,
  'LeeSin': 10,
  'Viego': 15,
  'Master Yi': 5,
  'MasterYi': 5,
  'Zed': 10,
  'Talon': 15,
  'Ekko': 15,
  'Fizz': 15,
  'Diana': 15,
  'Kha\'Zix': 8,
  'Khazix': 8,
  'Hecarim': 12,
  'Nocturne': 15,
  'Kayn': 10,
  'Shaco': 10,
  'Ahri': 5,
  'Syndra': 5,
  'Orianna': 5,
  'Lux': 5,
  'Veigar': 10,
  'Twisted Fate': 20,
  'TwistedFate': 20,
  'Galio': 25,
  'Vex': 5,
  'Hwei': 5,
  'Aurora': 40,
  'Naafiri': 15,
  'Briar': 15,
  'Smolder': 30,

  // ADCs & Supports (< 5%)
  'Jinx': 1,
  'Caitlyn': 1,
  'Ashe': 1,
  'Jhin': 1,
  'Kai\'Sa': 1,
  'Kaisa': 1,
  'Ezreal': 1,
  'Lucian': 10,
  'Tristana': 15,
  'Draven': 2,
  'Samira': 1,
  'Sivir': 1,
  'Aphelios': 1,
  'Kalista': 10,
  'Zeri': 1,
  'Thresh': 1,
  'Blitzcrank': 1,
  'Nautilus': 15,
  'Leona': 1,
  'Lulu': 5,
  'Nami': 1,
  'Sona': 1,
  'Soraka': 2,
  'Yuumi': 1,
  'Braum': 1,
  'Rakan': 1,
  'Pyke': 5,
  'Senna': 1,
  'Milio': 1,
  'Renata Glasc': 1,
  'Renata': 1,
};

export interface RankedOpponent {
  championName: string;
  probability: number;
  isLikelyToplaner: boolean;
}

/**
 * Returns estimated Toplane probability (1 to 99) for a champion name
 */
export function getToplaneProbability(championName: string): number {
  if (!championName) return 10;
  const clean = championName.trim();
  if (TOPLANE_FREQUENCIES[clean] !== undefined) {
    return TOPLANE_FREQUENCIES[clean];
  }
  // Try case-insensitive lookup
  const lower = clean.toLowerCase();
  for (const [key, val] of Object.entries(TOPLANE_FREQUENCIES)) {
    if (key.toLowerCase() === lower) {
      return val;
    }
  }
  // Default fallback for unknown champions
  return 20;
}

/**
 * Ranks an array of revealed enemy champions by probability of being the Toplane matchup against Renekton
 */
export function sortChampionsByToplaneProbability(championNames: string[]): RankedOpponent[] {
  if (!championNames || championNames.length === 0) return [];

  const ranked: RankedOpponent[] = championNames.map((name) => {
    const prob = getToplaneProbability(name);
    return {
      championName: name,
      probability: prob,
      isLikelyToplaner: prob >= 70,
    };
  });

  // Sort descending by probability
  ranked.sort((a, b) => b.probability - a.probability);
  return ranked;
}
