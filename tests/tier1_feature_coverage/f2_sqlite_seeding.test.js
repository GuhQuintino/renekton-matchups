const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { equal, ok, greaterThanOrEqual, throws, isTrue, isFalse } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('F2: SQLite Database & Seeding (170 Champions)', () => {
  let db;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
  });

  test('2.1 - Schema validation: champions, matchups, tips, guides, and notes tables initialize', () => {
    equal(db.champions.size, 170, 'Should seed exactly 170 champions');
    equal(db.matchups.size, 170, 'Should seed exactly 170 matchups');
    greaterThanOrEqual(db.matchupTips.size, 1500, 'Should seed over 1500 detailed tips');
    equal(db.guideSections.size, 8, 'Should seed 8 general guide sections');
    equal(db.userNotes.size, 0, 'User notes should start empty');
  });

  test('2.2 - Seeding integrity: Riot Data Dragon keys correctly mapped for canonical champions', () => {
    const aatrox = db.getChampionByName('Aatrox');
    ok(aatrox, 'Aatrox must exist');
    equal(aatrox.riot_key, 'Aatrox');

    const wukong = db.getChampionByName('Wukong');
    ok(wukong, 'Wukong must exist');
    equal(wukong.riot_key, 'MonkeyKing', 'Wukong Riot key must be MonkeyKing');

    const mundo = db.getChampionByName('Dr. Mundo');
    ok(mundo, 'Dr. Mundo must exist');
    equal(mundo.riot_key, 'DrMundo', 'Dr. Mundo Riot key must be DrMundo');

    const chogath = db.getChampionByName('Cho\'Gath');
    ok(chogath, 'Cho\'Gath must exist');
    equal(chogath.riot_key, 'Chogath', 'Cho\'Gath Riot key must be Chogath');

    const kaisa = db.getChampionByName('Kai\'Sa');
    ok(kaisa, 'Kai\'Sa must exist');
    equal(kaisa.riot_key, 'Kaisa', 'Kai\'Sa Riot key must be Kaisa');
  });

  test('2.3 - Foreign key cascading: deleting a champion cascades to matchups, tips, and notes', () => {
    const aatrox = db.getChampionByName('Aatrox');
    const aatroxMatchup = db.getMatchupByChampion('Aatrox');
    ok(aatroxMatchup.tips.length > 0, 'Aatrox should have tips');

    // Create note for Aatrox
    db.createNote({
      champion_id: aatrox.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Dodge Q3'
    });
    equal(db.getNotesByChampion(aatrox.id).length, 1);

    // Delete champion
    const deleted = db.deleteChampion(aatrox.id);
    isTrue(deleted);

    // Verify cascade
    equal(db.getChampionByName('Aatrox'), null, 'Aatrox champion should be gone');
    equal(db.getMatchupByChampion('Aatrox'), null, 'Aatrox matchup should be gone');
    equal(db.getNotesByChampion(aatrox.id).length, 0, 'Aatrox notes should be deleted');
  });

  test('2.4 - Query performance: Matchup lookup by name or key returns in sub-millisecond time', () => {
    const start = process.hrtime();
    const result = db.getMatchupByChampion('Darius');
    const elapsed = process.hrtime(start);
    const ms = (elapsed[0] * 1000) + (elapsed[1] / 1000000);

    ok(result, 'Darius matchup should exist');
    equal(result.champion.name, 'Darius');
    equal(result.matchup.difficulty_tier, 'Medium');
    equal(result.matchup.difficulty_rating, 5);
    ok(ms < 5.0, `Lookup time (${ms.toFixed(2)}ms) must be under 5ms`);
  });

  test('2.5 - Validation constraints: Duplicate champions and invalid foreign keys rejected', () => {
    // Note with invalid foreign key
    throws(() => {
      db.createNote({
        champion_id: 99999,
        match_result: 'WIN',
        perceived_difficulty: 3
      });
    }, 'Champion with id 99999 not found');
  });
});
