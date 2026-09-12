const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { NotesService } = require('../harness/notesService');
const { SimulatorEngine } = require('../harness/simulatorEngine');
const { equal, ok, throws, doesNotThrow, isTrue, notEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('M4 Deep Coverage: Structured Post-Game Notes & Offline Persistence', () => {
  let db;
  let notesService;
  let sim;
  let aatrox;
  let darius;
  let fiora;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    notesService = new NotesService(db);
    sim = new SimulatorEngine();
    aatrox = db.getChampionByName('Aatrox');
    darius = db.getChampionByName('Darius');
    fiora = db.getChampionByName('Fiora');
  });

  test('M4.1 - Creates structured note with all required and optional fields', () => {
    const note = notesService.addNote({
      champion_id: aatrox.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Zone with Q and Empowered W stun under tower',
      what_failed: 'Took unfavorable level 1 trade',
      free_notes: 'Rush Executioner\'s Calling and Plated Steelcaps',
      kda: '8/1/4',
      runes_used: 'PTA + Bone Plating',
      items_built: 'Eclipse, Steelcaps, Sterak\'s Gage',
      summoners_used: 'Flash + Ignite'
    });

    ok(note.id, 'Note ID must be generated');
    equal(note.champion_id, aatrox.id);
    equal(note.match_result, 'WIN');
    equal(note.perceived_difficulty, 3);
    equal(note.what_worked, 'Zone with Q and Empowered W stun under tower');
    equal(note.what_failed, 'Took unfavorable level 1 trade');
    equal(note.free_notes, 'Rush Executioner\'s Calling and Plated Steelcaps');
    equal(note.kda, '8/1/4');
    equal(note.runes_used, 'PTA + Bone Plating');
  });

  test('M4.2 - Supports case-insensitive match result (win -> WIN, loss -> LOSS, remake -> REMAKE)', () => {
    const n1 = notesService.addNote({ champion_id: darius.id, match_result: 'win', perceived_difficulty: 2 });
    const n2 = notesService.addNote({ champion_id: darius.id, match_result: 'loss', perceived_difficulty: 4 });
    const n3 = notesService.addNote({ champion_id: darius.id, match_result: 'remake', perceived_difficulty: 1 });

    equal(n1.match_result, 'WIN');
    equal(n2.match_result, 'LOSS');
    equal(n3.match_result, 'REMAKE');
  });

  test('M4.3 - Validates perceived difficulty strictly between 1 and 5', () => {
    for (const validDiff of [1, 2, 3, 4, 5]) {
      doesNotThrow(() => {
        notesService.addNote({
          champion_id: fiora.id,
          match_result: 'WIN',
          perceived_difficulty: validDiff
        });
      });
    }

    for (const invalidDiff of [0, 6, -1, 10, 'abc']) {
      throws(() => {
        notesService.addNote({
          champion_id: fiora.id,
          match_result: 'WIN',
          perceived_difficulty: invalidDiff
        });
      }, 'Invalid perceived_difficulty');
    }
  });

  test('M4.4 - Updates an existing note and refreshes timestamp', () => {
    const created = notesService.addNote({
      champion_id: aatrox.id,
      match_result: 'LOSS',
      perceived_difficulty: 5,
      what_worked: 'Nothing early',
      what_failed: 'Got hit by all sweetspots'
    });

    const updated = notesService.updateNote(created.id, {
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Bait Q3 and sidestep with E; then full Empowered W combo'
    });

    equal(updated.id, created.id);
    equal(updated.match_result, 'WIN');
    equal(updated.perceived_difficulty, 3);
    equal(updated.what_worked, 'Bait Q3 and sidestep with E; then full Empowered W combo');
  });

  test('M4.5 - Deletes a note and confirms removal from database', () => {
    const n1 = notesService.addNote({ champion_id: darius.id, match_result: 'WIN', perceived_difficulty: 3 });
    const n2 = notesService.addNote({ champion_id: darius.id, match_result: 'LOSS', perceived_difficulty: 4 });

    equal(notesService.getNotesForChampion(darius.id).length, 2);

    const deleted = notesService.deleteNote(n1.id);
    isTrue(deleted);

    const remaining = notesService.getNotesForChampion(darius.id);
    equal(remaining.length, 1);
    equal(remaining[0].id, n2.id);
  });

  test('M4.6 - Calculates aggregate stats accurately (Winrate %, Average Rating, Total Games)', () => {
    // 3 Wins (Ratings: 2, 3, 3)
    notesService.addNote({ champion_id: fiora.id, match_result: 'WIN', perceived_difficulty: 2 });
    notesService.addNote({ champion_id: fiora.id, match_result: 'WIN', perceived_difficulty: 3 });
    notesService.addNote({ champion_id: fiora.id, match_result: 'WIN', perceived_difficulty: 3 });
    // 1 Loss (Rating: 5)
    notesService.addNote({ champion_id: fiora.id, match_result: 'LOSS', perceived_difficulty: 5 });
    // 1 Remake (Rating: 1)
    notesService.addNote({ champion_id: fiora.id, match_result: 'REMAKE', perceived_difficulty: 1 });

    const summary = notesService.getNotesSummary(fiora.id);
    equal(summary.totalMatches, 5);
    equal(summary.wins, 3);
    equal(summary.losses, 1);
    equal(summary.remakes, 1);
    // Winrate = 3 / (3 + 1) = 75.0%
    equal(summary.winratePercent, 75.0);
    // Avg Difficulty = (2 + 3 + 3 + 5 + 1) / 5 = 14 / 5 = 2.8
    equal(summary.avgDifficulty, 2.8);
  });

  test('M4.7 - Handles Unicode, emojis, multiline strings, and special characters safely', () => {
    const unicodePayload = {
      champion_id: aatrox.id,
      match_result: 'WIN',
      perceived_difficulty: 2,
      what_worked: '🐊 Renekton dominou a rota! ✨ Combo perfeito E > AA > W > Q > E ⚔️',
      what_failed: 'Nenhum erro grave! 🛡️',
      free_notes: 'Linha 1: Rushar Eclipse\nLinha 2: Focar o ADC nas TFs\nLinha 3: GGWP 🏆'
    };

    const note = notesService.addNote(unicodePayload);
    equal(note.what_worked, unicodePayload.what_worked);
    equal(note.free_notes, unicodePayload.free_notes);

    const fetched = notesService.getNotesForChampion(aatrox.id);
    equal(fetched[0].what_worked, unicodePayload.what_worked);
    equal(fetched[0].free_notes, unicodePayload.free_notes);
  });

  test('M4.8 - Post-game automatic trigger integration with simulation transition', () => {
    let triggeredPayload = null;
    sim.on('postGameTrigger', (data) => {
      triggeredPayload = data;
    });

    sim.loadScenario('SCENARIO_B_IN_GAME');
    equal(sim.getState().phase, 'IN_GAME');

    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    equal(sim.getState().phase, 'POST_GAME');
    ok(triggeredPayload, 'Trigger event payload must be fired');
    equal(triggeredPayload.opponent_champion, 'Aatrox');
    equal(triggeredPayload.match_result, 'WIN');
  });
});
