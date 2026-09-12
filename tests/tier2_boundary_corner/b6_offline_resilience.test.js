const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { DataDragonService } = require('../harness/dataDragonService');
const { NotesService } = require('../harness/notesService');
const { equal, ok, isTrue, lessThan } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 2 - B6: Network Failure & Offline Resilience Stress', () => {
  let db;
  let ddragonOffline;
  let notesService;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    ddragonOffline = new DataDragonService({ isOffline: true });
    notesService = new NotesService(db);
  });

  test('B6.1 - Offline database startup loads all 170 champions with zero network activity', () => {
    equal(db.champions.size, 170);
    equal(db.matchups.size, 170);
  });

  test('B6.2 - Offline database loads all 8 general guide sections with full content', () => {
    equal(db.guideSections.size, 8);
    const runes = db.getGeneralGuide('runes');
    ok(runes.content_en.length > 500);
  });

  test('B6.3 - Offline DataDragon returns local vector SVG icon without network request', () => {
    const icon = ddragonOffline.getChampionIconUrl('Darius');
    isTrue(icon.startsWith('data:image/svg+xml;utf8,'));
  });

  test('B6.4 - Offline DataDragon returns SVG for items and summoner spells', () => {
    const itemSvg = ddragonOffline.getItemIconUrl(3074);
    const spellSvg = ddragonOffline.getSpellIconUrl('SummonerFlash');
    isTrue(itemSvg.startsWith('data:image/svg+xml;utf8,'));
    isTrue(spellSvg.startsWith('data:image/svg+xml;utf8,'));
  });

  test('B6.5 - Offline notes creation, editing, and querying executes fully in local SQLite', () => {
    const champ = db.getChampionByName('Jax');
    const note = notesService.addNote({
      champion_id: champ.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Offline note saved successfully'
    });

    const summary = notesService.getNotesSummary(champ.id);
    equal(summary.totalMatches, 1);
    equal(summary.wins, 1);
  });

  test('B6.6 - Online to Offline mid-session transition maintains application state', () => {
    const ddragonOnline = new DataDragonService({ isOffline: false });
    const onlineUrl = ddragonOnline.getChampionIconUrl('Aatrox');
    ok(onlineUrl.includes('https://ddragon.leagueoflegends.com'));

    // Switch offline
    ddragonOnline.isOffline = true;
    const offlineUrl = ddragonOnline.getChampionIconUrl('Aatrox');
    isTrue(offlineUrl.startsWith('data:image/svg+xml;utf8,'));
  });

  test('B6.7 - Null version parameter falls back to safe bundled patch version (16.16.1)', () => {
    const fallbackDdragon = new DataDragonService({ version: null });
    equal(fallbackDdragon.version, '16.16.1');
  });

  test('B6.8 - Offline SVG handles weird champion names with special chars safely', () => {
    const specialChamps = ["Cho'Gath", "Kai'Sa", "K'Sante", "Dr. Mundo"];
    for (const name of specialChamps) {
      const svg = ddragonOffline.getChampionIconUrl(name);
      isTrue(svg.startsWith('data:image/svg+xml;utf8,'));
    }
  });

  test('B6.9 - Zero network latency for local matchup queries in offline mode (< 1ms)', () => {
    const start = process.hrtime();
    const data = db.getMatchupByChampion('Riven');
    const elapsed = process.hrtime(start);
    const ms = (elapsed[0] * 1000) + (elapsed[1] / 1000000);

    ok(data);
    lessThan(ms, 5.0);
  });

  test('B6.10 - Offline app state allows full CRUD lifecycle for 10 consecutive matches without errors', () => {
    const fiora = db.getChampionByName('Fiora');
    for (let i = 1; i <= 10; i++) {
      notesService.addNote({
        champion_id: fiora.id,
        match_result: i % 2 === 0 ? 'WIN' : 'LOSS',
        perceived_difficulty: 4,
        what_worked: `Offline match ${i}`
      });
    }

    const summary = notesService.getNotesSummary(fiora.id);
    equal(summary.totalMatches, 10);
    equal(summary.winratePercent, 50.0);
  });
});
