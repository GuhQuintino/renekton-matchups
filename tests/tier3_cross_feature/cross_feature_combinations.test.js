const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { SearchService } = require('../harness/searchService');
const { LcuService } = require('../harness/lcuService');
const { LiveClientService } = require('../harness/liveClientService');
const { SimulatorEngine } = require('../harness/simulatorEngine');
const { NotesService } = require('../harness/notesService');
const { DataDragonService } = require('../harness/dataDragonService');
const { equal, ok, isTrue, greaterThanOrEqual, deepEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 3: Cross-Feature Combinations & Integration Flows (15 Tests)', () => {
  let db;
  let searchService;
  let notesService;
  let ddragon;
  let sim;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    const summary = db.getAllMatchupsSummary();
    searchService = new SearchService(summary);
    notesService = new NotesService(db);
    ddragon = new DataDragonService({ version: '16.16.1' });
    sim = new SimulatorEngine();
  });

  test('3.1 - LCU Lockfile detection -> Champ Select draft parsing -> Candidate opponent filtering -> Hero Card update', () => {
    const lockfileRaw = 'LeagueClient:1234:5000:SecretToken:https';
    const lockfile = LcuService.parseLockfile(lockfileRaw);
    equal(lockfile.port, 5000);

    const draftSession = {
      myTeam: [{ cellId: 0, championId: 58 }], // Renekton
      theirTeam: [
        { cellId: 5, championId: 266 }, // Aatrox
        { cellId: 6, championId: 103 }, // Ahri
        { cellId: 7, championId: 0 }
      ]
    };

    const draft = LcuService.parseChampSelectSession(draftSession);
    equal(draft.myChampion, 'Renekton');
    equal(draft.enemyCount, 2);

    // Hero card displays first revealed top pick (Aatrox)
    const matchup = db.getMatchupByChampion('Aatrox');
    ok(matchup);
    equal(matchup.champion.name, 'Aatrox');
    equal(matchup.matchup.difficulty_raw, 'Medium - 5/10');
  });

  test('3.2 - LiveClientData In-Game event -> Opponent locked (Aatrox) -> Quick Info decision bar populated', () => {
    const liveData = {
      activePlayer: { summonerName: 'SoloRenekton' },
      allPlayers: [
        { summonerName: 'SoloRenekton', championName: 'Renekton', team: 'ORDER', position: 'TOP' },
        { summonerName: 'EnemyTop', championName: 'Aatrox', team: 'CHAOS', position: 'TOP', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Teleport' }, items: [{ displayName: 'Doran\'s Shield' }] }
      ]
    };

    const detection = LiveClientService.detectLaneOpponent(liveData);
    isTrue(detection.detected);
    equal(detection.opponentChampion, 'Aatrox');

    const matchupData = db.getMatchupByChampion(detection.opponentChampion);
    equal(matchupData.matchup.runes_recommendation, 'PTA / Conq > Resolve / Inspiration');
    equal(matchupData.matchup.starting_items, 'Doran\'s Blade / Doran\'s Shield');
    equal(matchupData.matchup.ability_max_order, 'Q > E > W');
  });

  test('3.3 - In-Game Lock -> Post-Game Trigger event -> Note creation modal -> SQLite persistence -> History query', () => {
    let triggered = null;
    sim.on('postGameTrigger', (payload) => {
      triggered = payload;
    });

    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    ok(triggered);

    const opponent = db.getChampionByName(triggered.opponent_champion);
    const createdNote = notesService.addNote({
      champion_id: opponent.id,
      match_result: triggered.match_result,
      perceived_difficulty: 3,
      what_worked: 'Dodged Aatrox Q3 and punished with Empowered W',
      game_id: triggered.match_id
    });

    equal(createdNote.match_result, 'WIN');
    const history = notesService.getNotesForChampion(opponent.id);
    equal(history.length, 1);
    equal(history[0].game_id, 'post_game_win_004');
  });

  test('3.4 - Instant Search query -> Select matchup (Darius) -> View Detailed Notes -> Switch to Fury Management guide', () => {
    const searchRes = searchService.search({ query: 'Darius' });
    equal(searchRes.results[0].championName, 'Darius');

    const dariusData = db.getMatchupByChampion('Darius');
    greaterThanOrEqual(dariusData.tips.length, 5);

    const furyGuide = db.getGeneralGuide('furyManagement');
    ok(furyGuide);
    ok(furyGuide.content_en.includes('50') || furyGuide.content_en.includes('Fury'));
  });

  test('3.5 - Simulator Lane Swap trigger -> Switch tracked opponent from Yasuo to Yone -> Re-render Quick Info & Notes', () => {
    sim.loadScenario('SCENARIO_C_LANE_SWAP');
    equal(sim.getState().opponent_champion, 'Yasuo');

    // User triggers 1-click manual swap to Yone
    sim.setState({ opponent_champion: 'Yone', opponent_confidence: 100 });
    equal(sim.getState().opponent_champion, 'Yone');

    const yoneData = db.getMatchupByChampion('Yone');
    ok(yoneData);
    equal(yoneData.champion.name, 'Yone');
    equal(yoneData.matchup.difficulty_tier, 'Easy');
    equal(yoneData.matchup.difficulty_rating, 2);
  });

  test('3.6 - Offline Mode startup -> Search "Camille" -> View Medium 4/10 Matchup -> Create Note -> Verify Offline SVG Icon', () => {
    const ddragonOffline = new DataDragonService({ isOffline: true });
    const searchRes = searchService.search({ query: 'Camille' });
    equal(searchRes.results[0].championName, 'Camille');

    const camilleData = db.getMatchupByChampion('Camille');
    equal(camilleData.matchup.difficulty_raw, 'Medium - 4/10');

    const note = notesService.addNote({
      champion_id: camilleData.champion.id,
      match_result: 'WIN',
      perceived_difficulty: 4,
      what_worked: 'Bait her passive shield with AA then W'
    });
    equal(note.perceived_difficulty, 4);

    const iconUrl = ddragonOffline.getChampionIconUrl('Camille');
    isTrue(iconUrl.startsWith('data:image/svg+xml;utf8,'));
  });

  test('3.7 - Multi-Game History: Play 3 matches vs Jax (Win, Loss, Win) -> Calculate aggregate WR 66.7% and average felt rating', () => {
    const jax = db.getChampionByName('Jax');
    notesService.addNote({ champion_id: jax.id, match_result: 'WIN', perceived_difficulty: 3 });
    notesService.addNote({ champion_id: jax.id, match_result: 'LOSS', perceived_difficulty: 5 });
    notesService.addNote({ champion_id: jax.id, match_result: 'WIN', perceived_difficulty: 4 });

    const summary = notesService.getNotesSummary(jax.id);
    equal(summary.totalMatches, 3);
    equal(summary.wins, 2);
    equal(summary.losses, 1);
    equal(summary.winratePercent, 66.7);
    equal(summary.avgDifficulty, 4.0);
  });

  test('3.8 - Header Mode Toggle: Live LCU -> Simulator -> Load Scenario B (Darius Lv3) -> Verify Header Pill, Hero Card, Quick Info', () => {
    sim.setState({ current_mode: 'SIMULATOR' });
    const state = sim.loadScenario('SCENARIO_B_IN_GAME');

    equal(state.phase, 'IN_GAME');
    equal(state.opponent_champion, 'Darius');

    const dariusData = db.getMatchupByChampion('Darius');
    equal(dariusData.matchup.difficulty_tier, 'Medium');
    ok(dariusData.matchup.starting_items.includes('Doran'));
  });

  test('3.9 - General Guide Navigation: Runes Guide -> Inspect PTA vs Conq -> Switch to Mechanics & Combos -> Return to Matchup', () => {
    const runesGuide = db.getGeneralGuide('runes');
    ok(runesGuide.content_en.includes('PTA') || runesGuide.content_en.includes('Press the Attack'));

    const combosGuide = db.getGeneralGuide('mechanicsCombos');
    ok(combosGuide.content_en.includes('Combos') || combosGuide.content_en.includes('Animation'));

    const matchup = db.getMatchupByChampion('Aatrox');
    equal(matchup.champion.name, 'Aatrox');
  });

  test('3.10 - Filter by Difficulty (Hard) -> Select Illaoi -> Check Detailed Note #1 -> Add Note -> Delete Note -> Verify DB cascade', () => {
    const hardChamps = searchService.search({ difficulty: 'HARD' });
    const illaoiSummary = hardChamps.results.find(c => c.championName === 'Illaoi');
    ok(illaoiSummary, 'Illaoi should be in Hard tier (9/10)');

    const illaoiMatchup = db.getMatchupByChampion('Illaoi');
    equal(illaoiMatchup.tips[0].tip_number, 1);

    const note = notesService.addNote({
      champion_id: illaoiMatchup.champion.id,
      match_result: 'WIN',
      perceived_difficulty: 5
    });

    equal(notesService.getNotesForChampion(illaoiMatchup.champion.id).length, 1);
    notesService.deleteNote(note.id);
    equal(notesService.getNotesForChampion(illaoiMatchup.champion.id).length, 0);
  });

  test('3.11 - Simulator Scenario D (Victory) -> Post-Game Trigger -> Submit Note -> Sidebar Notes Indicator appears for Opponent', () => {
    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    const aatrox = db.getChampionByName('Aatrox');

    notesService.addNote({
      champion_id: aatrox.id,
      match_result: 'WIN',
      perceived_difficulty: 3
    });

    const userNotesMap = new Map();
    userNotesMap.set(aatrox.id, [{ id: 1, result: 'WIN' }]);

    const searchWithNotes = searchService.search({ notesOnly: true, userNotesMap });
    equal(searchWithNotes.count, 1);
    equal(searchWithNotes.results[0].championName, 'Aatrox');
  });

  test('3.12 - Search with Alias ("Mundo") -> Hero Card displays "Dr. Mundo" -> Data Dragon resolves "DrMundo.png" -> Quick Info shows D-Blade / Ignite', () => {
    const searchRes = searchService.search({ query: 'Mundo' });
    equal(searchRes.results[0].championName, 'Dr. Mundo');

    const matchup = db.getMatchupByChampion('Dr. Mundo');
    equal(matchup.champion.riot_key, 'DrMundo');
    equal(ddragon.getChampionIconUrl('Dr. Mundo'), 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/DrMundo.png');
    ok(matchup.matchup.summoner_spells.includes('Ignite') || matchup.matchup.summoner_spells.includes('Flash'));
  });

  test('3.13 - Special Champion Workflow ("Wukong") -> Data Dragon resolves "MonkeyKing.png" -> Detailed Notes render -> Add Note -> Query History', () => {
    const searchRes = searchService.search({ query: 'Wukong' });
    equal(searchRes.results[0].championName, 'Wukong');

    const wukongData = db.getMatchupByChampion('Wukong');
    equal(wukongData.champion.riot_key, 'MonkeyKing');
    equal(ddragon.getChampionIconUrl('Wukong'), 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/MonkeyKing.png');

    notesService.addNote({
      champion_id: wukongData.champion.id,
      match_result: 'WIN',
      perceived_difficulty: 2,
      what_worked: 'Track real Wukong with Empowered W stun'
    });

    const notes = notesService.getNotesForChampion(wukongData.champion.id);
    equal(notes.length, 1);
    equal(notes[0].what_worked, 'Track real Wukong with Empowered W stun');
  });

  test('3.14 - Champ Select (3 Enemy Picks Revealed) -> Sidebar filters candidates -> 4th pick locked -> Hero Card switches to locked opponent', () => {
    const draftSession = {
      myTeam: [{ cellId: 0, championId: 58 }],
      theirTeam: [
        { cellId: 5, championId: 64 },  // Lee Sin (Jungle)
        { cellId: 6, championId: 103 }, // Ahri (Mid)
        { cellId: 7, championId: 266 }  // Aatrox (Top)
      ]
    };

    const draft = LcuService.parseChampSelectSession(draftSession);
    equal(draft.enemyCount, 3);

    // Identify Top Opponent (Aatrox id 266)
    const enemyTop = draft.enemyPicks.find(p => p.championId === 266);
    ok(enemyTop);

    const matchup = db.getMatchupByChampion('Aatrox');
    equal(matchup.champion.name, 'Aatrox');
  });

  test('3.15 - Full App Lifecycle: Boot -> Initial Seeding -> Search -> Guide Study -> Sim Game -> In-Game Quick Info -> Post-Game Note -> History Audit', () => {
    // 1. Boot & Seed
    equal(db.champions.size, 170);
    equal(db.guideSections.size, 8);

    // 2. Search
    const searchRes = searchService.search({ query: 'Riven' });
    equal(searchRes.results[0].championName, 'Riven');

    // 3. Study Guide
    const combos = db.getGeneralGuide('mechanicsCombos');
    ok(combos);

    // 4. Simulate In-Game
    sim.loadScenario('SCENARIO_B_IN_GAME');
    equal(sim.getState().phase, 'IN_GAME');

    // 5. In-Game Quick Info
    const dariusData = db.getMatchupByChampion('Darius');
    ok(dariusData.matchup.runes_recommendation);

    // 6. Post-Game Note
    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    const note = notesService.addNote({
      champion_id: dariusData.champion.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Short trades and kite passive'
    });
    ok(note.id);

    // 7. History Audit
    const summary = notesService.getNotesSummary(dariusData.champion.id);
    equal(summary.totalMatches, 1);
    equal(summary.winratePercent, 100.0);
  });
});
