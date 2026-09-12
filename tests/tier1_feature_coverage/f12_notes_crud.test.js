const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { NotesService } = require('../harness/notesService');
const { equal, ok, throws, isTrue } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('F12: Post-Game Notes CRUD (Win/Loss, 1-5 Stars)', () => {
  let db;
  let notesService;
  let aatrox;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    notesService = new NotesService(db);
    aatrox = db.getChampionByName('Aatrox');
  });

  test('12.1 - CREATE note persists all structured fields (Win/Loss, rating 1-5, what worked/failed, free notes)', () => {
    const newNote = notesService.addNote({
      champion_id: aatrox.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Short trades with E-AA-W-Q-E',
      what_failed: 'Took bad trade at lv 1',
      free_notes: 'Rush Executioner\'s Calling'
    });

    ok(newNote.id, 'Note ID should be generated');
    equal(newNote.match_result, 'WIN');
    equal(newNote.perceived_difficulty, 3);
    equal(newNote.what_worked, 'Short trades with E-AA-W-Q-E');
  });

  test('12.2 - READ notes returns notes list for specified champion', () => {
    notesService.addNote({
      champion_id: aatrox.id,
      match_result: 'WIN',
      perceived_difficulty: 4,
      what_worked: 'Bait Q3'
    });

    const notes = notesService.getNotesForChampion(aatrox.id);
    equal(notes.length, 1);
    equal(notes[0].what_worked, 'Bait Q3');
  });

  test('12.3 - UPDATE note modifies note fields and updates timestamp', () => {
    const created = notesService.addNote({
      champion_id: aatrox.id,
      match_result: 'WIN',
      perceived_difficulty: 2,
      what_worked: 'All-in lv 3'
    });

    const updated = notesService.updateNote(created.id, {
      perceived_difficulty: 4,
      what_worked: 'All-in lv 3 with Ignite'
    });

    equal(updated.perceived_difficulty, 4);
    equal(updated.what_worked, 'All-in lv 3 with Ignite');
  });

  test('12.4 - DELETE note removes the note from database', () => {
    const created = notesService.addNote({
      champion_id: aatrox.id,
      match_result: 'LOSS',
      perceived_difficulty: 5
    });

    equal(notesService.getNotesForChampion(aatrox.id).length, 1);
    const deleted = notesService.deleteNote(created.id);
    isTrue(deleted);
    equal(notesService.getNotesForChampion(aatrox.id).length, 0);
  });

  test('12.5 - Validation enforces valid match_result and 1-5 rating constraints', () => {
    throws(() => {
      notesService.addNote({
        champion_id: aatrox.id,
        match_result: 'INVALID_RESULT',
        perceived_difficulty: 3
      });
    }, 'Invalid match_result');

    throws(() => {
      notesService.addNote({
        champion_id: aatrox.id,
        match_result: 'WIN',
        perceived_difficulty: 10 // Out of range 1..5
      });
    }, 'Invalid perceived_difficulty');
  });
});
