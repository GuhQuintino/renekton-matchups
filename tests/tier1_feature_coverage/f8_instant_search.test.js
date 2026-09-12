const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { SearchService } = require('../harness/searchService');
const { equal, ok, lessThan, greaterThanOrEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('F8: Instant Search & Difficulty Filters', () => {
  let searchService;

  beforeEach(() => {
    const db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    const summary = db.getAllMatchupsSummary();
    searchService = new SearchService(summary);
  });

  test('8.1 - Search executes in sub-10ms latency for prefix, substring, and case-insensitive terms', () => {
    const searchRes = searchService.search({ query: 'aat' });
    lessThan(searchRes.executionTimeMs, 10.0, 'Search execution time must be < 10ms');
    greaterThanOrEqual(searchRes.count, 1);
    equal(searchRes.results[0].championName, 'Aatrox');
  });

  test('8.2 - Search resolves champion aliases (Mundo -> Dr. Mundo, MonkeyKing -> Wukong, Renata -> Renata Glasc)', () => {
    const resMundo = searchService.search({ query: 'mundo' });
    equal(resMundo.results[0].championName, 'Dr. Mundo');

    const resMonkey = searchService.search({ query: 'monkeyking' });
    equal(resMonkey.results[0].championName, 'Wukong');

    const resRenata = searchService.search({ query: 'renata' });
    equal(resRenata.results[0].championName, 'Renata Glasc');
  });

  test('8.3 - Difficulty tier filter returns exact subset for Easy, Medium, Hard, and Very Hard', () => {
    const resEasy = searchService.search({ difficulty: 'EASY' });
    equal(resEasy.count, 82, 'Should return exactly 82 Easy champions');

    const resMedium = searchService.search({ difficulty: 'MEDIUM' });
    equal(resMedium.count, 58, 'Should return exactly 58 Medium champions');

    const resHard = searchService.search({ difficulty: 'HARD' });
    equal(resHard.count, 29, 'Should return exactly 29 Hard champions');

    const resVeryHard = searchService.search({ difficulty: 'VERY HARD' });
    equal(resVeryHard.count, 1, 'Should return 1 Very Hard champion (Varus 10/10)');
    equal(resVeryHard.results[0].championName, 'Varus');
  });

  test('8.4 - Favorites filter isolates user-starred champions', () => {
    const favorites = new Set([1, 2, 3]); // Champion IDs 1, 2, 3
    const res = searchService.search({ favoritesOnly: true, userFavorites: favorites });
    equal(res.count, 3);
  });

  test('8.5 - Sorting orders 170 champions deterministically by Alphabetical (A-Z/Z-A) and Difficulty', () => {
    const ascAlpha = searchService.search({ sortBy: 'ALPHABETICAL_ASC' });
    equal(ascAlpha.results[0].championName, 'Aatrox');
    equal(ascAlpha.results[ascAlpha.count - 1].championName, 'Zyra');

    const descAlpha = searchService.search({ sortBy: 'ALPHABETICAL_DESC' });
    equal(descAlpha.results[0].championName, 'Zyra');
    equal(descAlpha.results[descAlpha.count - 1].championName, 'Aatrox');

    const descDiff = searchService.search({ sortBy: 'DIFFICULTY_DESC' });
    equal(descDiff.results[0].championName, 'Varus', 'Hardest matchup should be Varus 10/10');
  });
});
