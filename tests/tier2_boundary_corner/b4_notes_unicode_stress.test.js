const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { NotesService } = require('../harness/notesService');
const { equal, ok, throws, doesNotThrow, isTrue } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 2 - B4: Notes CRUD Stress & Unicode / Multi-line Boundary Cases', () => {
  let db;
  let notesService;
  let renektonOpponent;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    notesService = new NotesService(db);
    renektonOpponent = db.getChampionByName('Aatrox');
  });

  test('B4.1 - Unicode characters and emojis in note text (🐊 ⚔️ 🛡️ 🔥 ✨ 🏆)', () => {
    const unicodeText = '🐊 Renekton dominou a rota! ⚔️ Trocas perfeitas com W 🛡️ Eclipse + Sterak 🔥 GGWP 🏆';
    const note = notesService.addNote({
      champion_id: renektonOpponent.id,
      match_result: 'WIN',
      perceived_difficulty: 2,
      what_worked: unicodeText,
      free_notes: '✨ Notas com emojis: 🎮 🎯 ⚡'
    });

    equal(note.what_worked, unicodeText);
    const fetched = notesService.getNotesForChampion(renektonOpponent.id);
    equal(fetched[0].what_worked, unicodeText);
  });

  test('B4.2 - Massive multiline text (10,000 characters) in what_worked and free_notes', () => {
    const massiveText = 'Dica tática repetida. '.repeat(500); // ~11,500 chars
    const note = notesService.addNote({
      champion_id: renektonOpponent.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: massiveText,
      free_notes: massiveText
    });

    equal(note.what_worked.length, massiveText.length);
    equal(note.free_notes.length, massiveText.length);
  });

  test('B4.3 - Note with all optional fields empty strings or null defaults safely', () => {
    const note = notesService.addNote({
      champion_id: renektonOpponent.id,
      match_result: 'WIN',
      perceived_difficulty: 1,
      what_worked: null,
      what_failed: null,
      free_notes: null
    });

    equal(note.what_worked, '');
    equal(note.what_failed, '');
    equal(note.free_notes, '');
  });

  test('B4.4 - Out-of-bounds rating values (0, 6, -5, 100) are rejected by validator', () => {
    const badRatings = [0, 6, -1, 100, NaN, 'three'];
    for (const r of badRatings) {
      throws(() => {
        notesService.addNote({
          champion_id: renektonOpponent.id,
          match_result: 'WIN',
          perceived_difficulty: r
        });
      }, 'Invalid perceived_difficulty');
    }
  });

  test('B4.5 - Invalid match_result strings ("TIE", "SURRENDER", "DODGE") are rejected', () => {
    const badResults = ['TIE', 'SURRENDER', 'DODGE', 'DRAW', ''];
    for (const res of badResults) {
      throws(() => {
        notesService.addNote({
          champion_id: renektonOpponent.id,
          match_result: res,
          perceived_difficulty: 3
        });
      }, 'Invalid match_result');
    }
  });

  test('B4.6 - SQL Injection payload strings in note fields are stored verbatim as safe text', () => {
    const sqlInjection = "Robert'); DROP TABLE user_notes; SELECT * FROM champions WHERE ('1'='1";
    const note = notesService.addNote({
      champion_id: renektonOpponent.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: sqlInjection
    });

    equal(note.what_worked, sqlInjection);
    equal(db.champions.size, 170, 'Champions table must remain untouched');
  });

  test('B4.7 - HTML/XSS script tags stored safely without code execution', () => {
    const xss = '<script>alert("pwned")</script><img src="x" onerror="alert(1)"/>';
    const note = notesService.addNote({
      champion_id: renektonOpponent.id,
      match_result: 'LOSS',
      perceived_difficulty: 4,
      free_notes: xss
    });

    equal(note.free_notes, xss);
  });

  test('B4.8 - High volume concurrency: 50 notes inserted in rapid succession for same champion', () => {
    for (let i = 1; i <= 50; i++) {
      notesService.addNote({
        champion_id: renektonOpponent.id,
        match_result: i % 2 === 0 ? 'WIN' : 'LOSS',
        perceived_difficulty: (i % 5) + 1,
        what_worked: `Note number ${i}`
      });
    }

    const notes = notesService.getNotesForChampion(renektonOpponent.id);
    equal(notes.length, 50);
    const summary = notesService.getNotesSummary(renektonOpponent.id);
    equal(summary.totalMatches, 50);
    equal(summary.wins, 25);
    equal(summary.losses, 25);
    equal(summary.winratePercent, 50.0);
  });

  test('B4.9 - Deleting a non-existent note ID throws descriptive error without crashing', () => {
    throws(() => {
      notesService.deleteNote(99999);
    }, 'Note with id 99999 not found');
  });

  test('B4.10 - Updating a non-existent note ID throws descriptive error without crashing', () => {
    throws(() => {
      notesService.updateNote(99999, { what_worked: 'New text' });
    }, 'Note with id 99999 not found');
  });
});
