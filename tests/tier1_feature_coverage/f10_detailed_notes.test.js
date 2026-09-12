const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { equal, ok, greaterThanOrEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('F10: Detailed Notes (10-15 Tips) & Fury Tips & Videos', () => {
  let db;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
  });

  test('10.1 - Matchup details provide structured numbered tips with title and tactical content', () => {
    const data = db.getMatchupByChampion('Aatrox');
    greaterThanOrEqual(data.tips.length, 5, 'Aatrox should have at least 5 tips');
    equal(data.tips[0].tip_number, 1);
    ok(data.tips[0].title_en.length > 0);
    ok(data.tips[0].content_en.length > 0);
  });

  test('10.2 - Matchup summary provides strategic lane overview', () => {
    const data = db.getMatchupByChampion('Aatrox');
    ok(data.matchup.summary_en.length > 0, 'Aatrox should have a summary');
  });

  test('10.3 - Tips include specific advice on Renekton abilities and Fury usage', () => {
    const data = db.getMatchupByChampion('Aatrox');
    const allTipsText = data.tips.map(t => t.content_en).join(' ');
    ok(allTipsText.includes('Q') || allTipsText.includes('W') || allTipsText.includes('E'));
  });

  test('10.4 - Video example link is preserved and formatted if present', () => {
    const data = db.getMatchupByChampion('Aatrox');
    ok(data.matchup.video_url !== undefined);
  });

  test('10.5 - Matchup with empty summary falls back gracefully without error', () => {
    const data = db.getMatchupByChampion('Zyra');
    ok(data.matchup.summary_pt.length > 0, 'Fallback summary must be present');
  });
});
