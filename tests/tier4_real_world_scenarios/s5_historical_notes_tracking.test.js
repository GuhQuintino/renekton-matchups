const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { NotesService } = require('../harness/notesService');
const { equal, ok, deepEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 4 - Scenario S5: Historical Notes Tracking & Performance Analytics', () => {
  let db;
  let notesService;
  let fiora;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    notesService = new NotesService(db);
    fiora = db.getChampionByName('Fiora');
  });

  test('S5 - Logs 5 sequential matches against Fiora, tracking ratings, tactical notes, and calculates dynamic WR & Average Rating', () => {
    // Match 1: Loss vs Fiora (Rating 5)
    notesService.addNote({
      champion_id: fiora.id,
      match_result: 'LOSS',
      perceived_difficulty: 5,
      what_worked: 'Nothing worked, Fiora hit vitals at Level 1',
      what_failed: 'Took bad trade at Level 1',
      created_at: '2026-08-15T14:00:00Z'
    });

    // Match 2: Loss vs Fiora (Rating 4)
    notesService.addNote({
      champion_id: fiora.id,
      match_result: 'LOSS',
      perceived_difficulty: 4,
      what_worked: 'Even trades early',
      what_failed: 'Riposte parried my Empowered W stun',
      created_at: '2026-08-16T15:00:00Z'
    });

    // Match 3: Win vs Fiora (Rating 3)
    notesService.addNote({
      champion_id: fiora.id,
      match_result: 'WIN',
      perceived_difficulty: 3,
      what_worked: 'Baited Riposte with AA buffer, then used Empowered W',
      what_failed: 'Missed some CS under tower',
      created_at: '2026-08-17T16:00:00Z'
    });

    // Match 4: Win vs Fiora (Rating 2)
    notesService.addNote({
      champion_id: fiora.id,
      match_result: 'WIN',
      perceived_difficulty: 2,
      what_worked: 'Rushed Bramble Vest and Plated Steelcaps; total lane dominance',
      what_failed: 'None',
      created_at: '2026-08-18T17:00:00Z'
    });

    // Match 5: Win vs Fiora (Rating 2)
    notesService.addNote({
      champion_id: fiora.id,
      match_result: 'WIN',
      perceived_difficulty: 2,
      what_worked: 'Froze wave near my tower and zoned her off CS completely',
      what_failed: 'None',
      created_at: '2026-08-19T18:00:00Z'
    });

    // Analytics Verification
    const summary = notesService.getNotesSummary(fiora.id);
    equal(summary.totalMatches, 5);
    equal(summary.wins, 3);
    equal(summary.losses, 2);
    equal(summary.winratePercent, 60.0, '3 wins out of 5 games = 60% WR');
    equal(summary.avgDifficulty, 3.2, '(5 + 4 + 3 + 2 + 2) / 5 = 3.2 average difficulty');

    // Chronological Order Verification (Newest first)
    equal(summary.recentNotes.length, 5);
    equal(summary.recentNotes[0].created_at, '2026-08-19T18:00:00Z');
    equal(summary.recentNotes[4].created_at, '2026-08-15T14:00:00Z');
  });
});
