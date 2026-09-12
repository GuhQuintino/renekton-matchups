const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { LcuService } = require('../harness/lcuService');
const { LiveClientService } = require('../harness/liveClientService');
const { SimulatorEngine } = require('../harness/simulatorEngine');
const { NotesService } = require('../harness/notesService');
const { equal, ok, isTrue, greaterThanOrEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 4 - Scenario S1: Full Ranked Match Workflow', () => {
  let db;
  let notesService;
  let sim;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    notesService = new NotesService(db);
    sim = new SimulatorEngine();
  });

  test('S1 - Complete ranked match lifecycle from Lobby to Champ Select, In-Game Lock, Victory, and Post-Game Note Persistence', () => {
    // Phase 1: Lobby
    sim.setState({ phase: 'LOBBY', connected: true });
    equal(sim.getState().phase, 'LOBBY');
    isTrue(sim.getState().connected);

    // Phase 2: Champ Select (Drafting vs Aatrox)
    const draftSession = {
      myTeam: [
        { cellId: 0, championId: 58, assignedPosition: 'top' }, // Renekton
        { cellId: 1, championId: 64, assignedPosition: 'jungle' },
        { cellId: 2, championId: 103, assignedPosition: 'middle' },
        { cellId: 3, championId: 222, assignedPosition: 'bottom' },
        { cellId: 4, championId: 111, assignedPosition: 'utility' }
      ],
      theirTeam: [
        { cellId: 5, championId: 266, assignedPosition: 'top' }, // Aatrox
        { cellId: 6, championId: 76, assignedPosition: 'jungle' },
        { cellId: 7, championId: 84, assignedPosition: 'middle' },
        { cellId: 8, championId: 145, assignedPosition: 'bottom' },
        { cellId: 9, championId: 89, assignedPosition: 'utility' }
      ]
    };

    const draft = LcuService.parseChampSelectSession(draftSession);
    equal(draft.myChampion, 'Renekton');
    equal(draft.enemyCount, 5);
    sim.loadScenario('SCENARIO_A_DRAFT');
    equal(sim.getState().phase, 'CHAMP_SELECT');

    // Phase 3: In-Game Loading & LiveClient opponent locking
    const inGamePayload = {
      activePlayer: { summonerName: 'SoloRenektonBR' },
      allPlayers: [
        { summonerName: 'SoloRenektonBR', championName: 'Renekton', team: 'ORDER', position: 'TOP' },
        { summonerName: 'EnemyAatrox', championName: 'Aatrox', team: 'CHAOS', position: 'TOP', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Teleport' }, items: [{ displayName: 'Doran\'s Shield' }] }
      ]
    };

    const detection = LiveClientService.detectLaneOpponent(inGamePayload);
    isTrue(detection.detected);
    equal(detection.opponentChampion, 'Aatrox');
    greaterThanOrEqual(detection.confidence, 90);

    sim.setState({
      phase: 'IN_GAME',
      opponent_champion: 'Aatrox',
      opponent_confidence: 100,
      game_time_seconds: 120
    });

    // Phase 4: Quick Info decision consultation in 3s
    const aatroxMatchup = db.getMatchupByChampion('Aatrox');
    equal(aatroxMatchup.matchup.runes_recommendation, 'PTA / Conq > Resolve / Inspiration');
    equal(aatroxMatchup.matchup.starting_items, 'Doran\'s Blade / Doran\'s Shield');
    equal(aatroxMatchup.matchup.ability_max_order, 'Q > E > W');
    greaterThanOrEqual(aatroxMatchup.tips.length, 5);

    // Phase 5: Match Victory & Post-Game Trigger
    let postGameTriggerFired = false;
    sim.on('postGameTrigger', (payload) => {
      postGameTriggerFired = true;
      equal(payload.match_result, 'WIN');
    });

    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    isTrue(postGameTriggerFired);
    equal(sim.getState().phase, 'POST_GAME');

    // Phase 6: Post-Game Note Submission
    const createdNote = notesService.addNote({
      champion_id: aatroxMatchup.champion.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Dodged Aatrox Q3 and punished with Empowered W. Built Eclipse -> Cleaver.',
      what_failed: 'Got poked early level 1.',
      free_notes: 'Rush Executioner\'s if Aatrox builds Sundered Sky.',
      kda: '8/2/5',
      game_id: 'ranked_game_s1_001'
    });

    ok(createdNote.id);
    equal(createdNote.kda, '8/2/5');

    // Phase 7: History Timeline and Analytics Verification
    const summary = notesService.getNotesSummary(aatroxMatchup.champion.id);
    equal(summary.totalMatches, 1);
    equal(summary.wins, 1);
    equal(summary.losses, 0);
    equal(summary.winratePercent, 100.0);
    equal(summary.avgDifficulty, 3.0);
    equal(summary.recentNotes[0].game_id, 'ranked_game_s1_001');
  });
});
