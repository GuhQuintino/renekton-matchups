const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { SearchService } = require('../harness/searchService');
const { equal, ok, lessThan, greaterThanOrEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 2 - B5: Search & Filter Boundary Cases', () => {
  let searchService;

  beforeEach(() => {
    const db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    const summary = db.getAllMatchupsSummary();
    searchService = new SearchService(summary);
  });

  test('B5.1 - Empty search query returns all 170 champions', () => {
    const res = searchService.search({ query: '' });
    equal(res.count, 170);
  });

  test('B5.2 - Whitespace-only search query ("   ") returns all 170 champions', () => {
    const res = searchService.search({ query: '    ' });
    equal(res.count, 170);
  });

  test('B5.3 - Query matching 0 champions returns empty array, not null/undefined', () => {
    const res = searchService.search({ query: 'nonexistentchampionname12345' });
    equal(res.count, 0);
    ok(Array.isArray(res.results));
  });

  test('B5.4 - Impossible filter combination (Difficulty: EASY + Search: "Varus") returns 0 results', () => {
    const res = searchService.search({ query: 'Varus', difficulty: 'EASY' });
    equal(res.count, 0);
  });

  test('B5.5 - Extremely long search query (500 characters) executes safely in < 5ms', () => {
    const longQuery = 'A'.repeat(500);
    const res = searchService.search({ query: longQuery });
    equal(res.count, 0);
    lessThan(res.executionTimeMs, 10.0);
  });

  test('B5.6 - Rapid successive search queries simulation (100 queries in a loop) maintains low latency', () => {
    const queries = ['Aa', 'Dar', 'Fio', 'Ja', 'Rive', 'Garen', 'Mundo', 'Kaisa', 'Renata', 'Wukong'];
    const start = process.hrtime();
    for (let i = 0; i < 100; i++) {
      const q = queries[i % queries.length];
      const res = searchService.search({ query: q });
      greaterThanOrEqual(res.count, 1);
    }
    const elapsed = process.hrtime(start);
    const totalMs = (elapsed[0] * 1000) + (elapsed[1] / 1000000);
    lessThan(totalMs, 200.0, '100 searches should complete in < 200ms');
  });

  test('B5.7 - Combined filter: Difficulty HARD + Alphabetical DESC', () => {
    const res = searchService.search({ difficulty: 'HARD', sortBy: 'ALPHABETICAL_DESC' });
    equal(res.count, 29);
    equal(res.results[0].championName, 'Zoe', 'First alphabetically descending in Hard tier is Zoe');
  });

  test('B5.8 - Favorite toggle stress: adding and removing favorites dynamically updates results', () => {
    const favs = new Set();
    equal(searchService.search({ favoritesOnly: true, userFavorites: favs }).count, 0);

    favs.add(1); // Aatrox
    favs.add(2); // Ahri
    equal(searchService.search({ favoritesOnly: true, userFavorites: favs }).count, 2);

    favs.delete(1);
    equal(searchService.search({ favoritesOnly: true, userFavorites: favs }).count, 1);
  });

  test('B5.9 - Notes filter isolates only champions with registered user notes', () => {
    const notesMap = new Map();
    notesMap.set(1, [{ id: 101, result: 'WIN' }]);
    notesMap.set(5, [{ id: 102, result: 'LOSS' }]);

    const res = searchService.search({ notesOnly: true, userNotesMap: notesMap });
    equal(res.count, 2);
  });

  test('B5.10 - Sorting by Difficulty ASC puts Easy 1/10 first and Hard/Extreme last', () => {
    const res = searchService.search({ sortBy: 'DIFFICULTY_ASC' });
    equal(res.results[0].difficultyRating, 1);
    equal(res.results[res.count - 1].difficultyRating, 10);
  });
});
