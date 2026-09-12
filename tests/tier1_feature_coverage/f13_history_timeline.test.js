const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { NotesService } = require('../harness/notesService');
const { equal, ok, deepEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('F13: Notes History per Champion & Date Sorting', () => {
  let db;
  let notesService;
  let darius;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    notesService = new NotesService(db);
    darius = db.getChampionByName('Darius');
  });

  test('13.1 - Notes query returns timeline ordered by created_at DESC (newest first)', () => {
    notesService.addNote({
      champion_id: darius.id,
      match_result: 'LOSS',
      perceived_difficulty: 5,
      what_worked: 'Game 1 - 10:00',
      created_at: '2026-08-20T10:00:00Z'
    });

    notesService.addNote({
      champion_id: darius.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Game 2 - 12:00',
      created_at: '2026-08-20T12:00:00Z'
    });

    const notes = notesService.getNotesForChampion(darius.id);
    equal(notes.length, 2);
    equal(notes[0].what_worked, 'Game 2 - 12:00', 'Newer note should be first');
    equal(notes[1].what_worked, 'Game 1 - 10:00', 'Older note should be second');
  });

  test('13.2 - Aggregate statistics computes Total Matches, Wins, Losses, and Winrate %', () => {
    notesService.addNote({ champion_id: darius.id, match_result: 'WIN', perceived_difficulty: 3 });
    notesService.addNote({ champion_id: darius.id, match_result: 'WIN', perceived_difficulty: 2 });
    notesService.addNote({ champion_id: darius.id, match_result: 'LOSS', perceived_difficulty: 4 });

    const summary = notesService.getNotesSummary(darius.id);
    equal(summary.totalMatches, 3);
    equal(summary.wins, 2);
    equal(summary.losses, 1);
    equal(summary.winratePercent, 66.7);
  });

  test('13.3 - Average felt difficulty calculation returns accurate arithmetic mean', () => {
    notesService.addNote({ champion_id: darius.id, match_result: 'WIN', perceived_difficulty: 2 });
    notesService.addNote({ champion_id: darius.id, match_result: 'LOSS', perceived_difficulty: 4 });

    const summary = notesService.getNotesSummary(darius.id);
    equal(summary.avgDifficulty, 3.0);
  });

  test('13.4 - Champion with zero notes returns empty summary and 0% WR without crashing', () => {
    const summary = notesService.getNotesSummary(darius.id);
    equal(summary.totalMatches, 0);
    equal(summary.wins, 0);
    equal(summary.losses, 0);
    equal(summary.winratePercent, 0);
    equal(summary.avgDifficulty, 0);
    equal(summary.recentNotes.length, 0);
  });

  test('13.5 - Summary excludes REMAKE games from winrate calculation percentage', () => {
    notesService.addNote({ champion_id: darius.id, match_result: 'WIN', perceived_difficulty: 1 });
    notesService.addNote({ champion_id: darius.id, match_result: 'REMAKE', perceived_difficulty: 1 });

    const summary = notesService.getNotesSummary(darius.id);
    equal(summary.totalMatches, 2);
    equal(summary.wins, 1);
    equal(summary.remakes, 1);
    equal(summary.winratePercent, 100.0, 'Remake should not lower winrate of decisive game');
  });
});
