const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { equal, ok } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('F9: Matchup Hero Card & Quick Info (3-Second Decision)', () => {
  let db;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
  });

  test('9.1 - Hero Card contains enemy display name, portrait URL, and difficulty rating', () => {
    const data = db.getMatchupByChampion('Aatrox');
    ok(data, 'Aatrox matchup must exist');
    equal(data.champion.name, 'Aatrox');
    equal(data.matchup.difficulty_raw, 'Medium - 5/10');
    ok(data.champion.icon_url.includes('Aatrox.png'));
  });

  test('9.2 - Quick Info displays recommended Primary & Secondary Runes', () => {
    const data = db.getMatchupByChampion('Aatrox');
    equal(data.matchup.runes_recommendation, 'PTA / Conq > Resolve / Inspiration');
  });

  test('9.3 - Quick Info displays recommended Summoner Spells', () => {
    const data = db.getMatchupByChampion('Aatrox');
    equal(data.matchup.summoner_spells, 'Ignite / Teleport / Ghost + Flash');
  });

  test('9.4 - Quick Info displays recommended Starting Items', () => {
    const data = db.getMatchupByChampion('Aatrox');
    equal(data.matchup.starting_items, 'Doran\'s Blade / Doran\'s Shield');
  });

  test('9.5 - Quick Info displays Ability Max Order and Level 1 Start', () => {
    const data = db.getMatchupByChampion('Aatrox');
    equal(data.matchup.ability_max_order, 'Q > E > W');
  });
});
