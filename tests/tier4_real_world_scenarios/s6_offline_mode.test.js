const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { SearchService } = require('../harness/searchService');
const { DataDragonService } = require('../harness/dataDragonService');
const { NotesService } = require('../harness/notesService');
const { equal, ok, isTrue } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 4 - Scenario S6: Zero-Network Offline Resilience Mode', () => {
  let db;
  let searchService;
  let ddragonOffline;
  let notesService;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    const summary = db.getAllMatchupsSummary();
    searchService = new SearchService(summary);
    ddragonOffline = new DataDragonService({ isOffline: true });
    notesService = new NotesService(db);
  });

  test('S6 - App operates completely offline without internet: 170 matchups, 8 guides, Notes SQLite CRUD, and SVG icons', () => {
    // 1. Startup & Data Seeding: 170 matchups and 8 guides ready
    equal(db.champions.size, 170);
    equal(db.matchups.size, 170);
    equal(db.guideSections.size, 8);

    // 2. Offline Instant Search
    const searchRes = searchService.search({ query: 'Malphite' });
    equal(searchRes.count, 1);
    equal(searchRes.results[0].championName, 'Malphite');

    // 3. Offline Matchup View
    const malphiteData = db.getMatchupByChampion('Malphite');
    ok(malphiteData);
    equal(malphiteData.matchup.difficulty_raw, 'Hard - 7/10');
    equal(malphiteData.matchup.difficulty_tier, 'Hard');

    // 4. Offline SVG icon generation
    const champIcon = ddragonOffline.getChampionIconUrl('Malphite');
    isTrue(champIcon.startsWith('data:image/svg+xml;utf8,'));

    const itemIcon = ddragonOffline.getItemIconUrl(3071); // Black Cleaver
    isTrue(itemIcon.startsWith('data:image/svg+xml;utf8,'));

    // 5. Offline General Guides Consultation
    const runesGuide = db.getGeneralGuide('runes');
    ok(runesGuide.content_en.length > 500);

    const combosGuide = db.getGeneralGuide('mechanicsCombos');
    ok(combosGuide.content_en.length > 500);

    // 6. Offline Notes Creation and History Query
    const newNote = notesService.addNote({
      champion_id: malphiteData.champion.id,
      match_result: 'WIN',
      perceived_difficulty: 1,
      what_worked: 'Pushed wave, took towers with Demolish, built Black Cleaver first item',
      what_failed: 'None'
    });

    ok(newNote.id);
    const history = notesService.getNotesSummary(malphiteData.champion.id);
    equal(history.totalMatches, 1);
    equal(history.winratePercent, 100.0);
    equal(history.avgDifficulty, 1.0);
  });
});
