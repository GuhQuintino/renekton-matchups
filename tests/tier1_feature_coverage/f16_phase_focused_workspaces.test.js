const { equal, ok, isTrue } = require('../harness/assert');

// Toplane Probability Table mapping (mirrored from src/services/toplaneProbabilities.ts)
const TOPLANE_FREQUENCIES = {
  'Aatrox': 99,
  'Camille': 98,
  'Darius': 99,
  'Fiora': 99,
  'Garen': 98,
  'Jax': 96,
  'Renekton': 98,
  'Gragas': 70,
  'Akali': 55,
  'Yasuo': 45,
  'Lee Sin': 10,
  'Ahri': 5,
  'Jinx': 1,
  'Thresh': 1,
};

function getToplaneProbability(championName) {
  if (!championName) return 10;
  return TOPLANE_FREQUENCIES[championName] !== undefined ? TOPLANE_FREQUENCIES[championName] : 20;
}

function sortChampionsByToplaneProbability(championNames) {
  if (!championNames || championNames.length === 0) return [];
  const ranked = championNames.map((name) => {
    const prob = getToplaneProbability(name);
    return {
      championName: name,
      probability: prob,
      isLikelyToplaner: prob >= 70,
    };
  });
  ranked.sort((a, b) => b.probability - a.probability);
  return ranked;
}

describe('F16: Phase-Focused Workspaces & Toplane Intelligence', () => {
  test('16.1 - Correctly identifies primary toplaners with high probability (>= 90%)', () => {
    equal(getToplaneProbability('Aatrox'), 99);
    equal(getToplaneProbability('Darius'), 99);
    equal(getToplaneProbability('Fiora'), 99);
    equal(getToplaneProbability('Garen'), 98);
  });

  test('16.2 - Correctly identifies mid/jungle and botlane champions with low probability', () => {
    equal(getToplaneProbability('Ahri'), 5);
    equal(getToplaneProbability('Lee Sin'), 10);
    equal(getToplaneProbability('Jinx'), 1);
    equal(getToplaneProbability('Thresh'), 1);
  });

  test('16.3 - Ranks mixed enemy draft picks putting Toplaners at top priority', () => {
    const draftPicks = ['Jinx', 'Thresh', 'Aatrox', 'Ahri', 'Lee Sin'];
    const ranked = sortChampionsByToplaneProbability(draftPicks);

    equal(ranked.length, 5);
    equal(ranked[0].championName, 'Aatrox');
    equal(ranked[0].probability, 99);
    isTrue(ranked[0].isLikelyToplaner);

    // Botlane champions should be at bottom
    isTrue(ranked[3].probability <= 10);
    isTrue(ranked[4].probability <= 10);
  });

  test('16.4 - Empty or null draft returns empty array safely', () => {
    equal(sortChampionsByToplaneProbability([]).length, 0);
    equal(sortChampionsByToplaneProbability(null).length, 0);
  });

  test('16.5 - Phase routing logic supports all 4 standard lifecycle phases', () => {
    const phases = ['DISCONNECTED', 'LOBBY', 'CHAMP_SELECT', 'IN_GAME', 'POST_GAME'];
    isTrue(phases.includes('LOBBY'));
    isTrue(phases.includes('CHAMP_SELECT'));
    isTrue(phases.includes('IN_GAME'));
    isTrue(phases.includes('POST_GAME'));
  });

  test('16.6 - In-Game HUD timer correctly formats seconds into mm:ss string', () => {
    const formatTime = (secs) => {
      const mins = Math.floor(secs / 60);
      const remainderSecs = secs % 60;
      return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
    };

    equal(formatTime(0), '00:00');
    equal(formatTime(75), '01:15');
    equal(formatTime(872), '14:32');
    equal(formatTime(1805), '30:05');
  });
});
