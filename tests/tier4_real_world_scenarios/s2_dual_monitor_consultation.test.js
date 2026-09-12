const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { SearchService } = require('../harness/searchService');
const { DataDragonService } = require('../harness/dataDragonService');
const { THEME_TOKENS, getContrastRatio } = require('../harness/uiThemeService');
const { equal, ok, lessThan, greaterThanOrEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 4 - Scenario S2: Dual-Monitor Manual Consultation', () => {
  let db;
  let searchService;
  let ddragon;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    const summary = db.getAllMatchupsSummary();
    searchService = new SearchService(summary);
    ddragon = new DataDragonService({ version: '16.16.1' });
  });

  test('S2 - Rapid manual search for "Darius" in second monitor, Quick Info inspection, Fury Tips, and Video guide access', () => {
    // Step 1: User types "Darius" in search bar
    const searchRes = searchService.search({ query: 'Darius' });
    lessThan(searchRes.executionTimeMs, 10.0, 'Search should complete in < 10ms for immediate second monitor response');
    equal(searchRes.count, 1);
    equal(searchRes.results[0].championName, 'Darius');

    // Step 2: Hero card renders with LoLTheory contrast
    const dariusData = db.getMatchupByChampion('Darius');
    ok(dariusData);
    equal(dariusData.champion.name, 'Darius');
    equal(dariusData.matchup.difficulty_tier, 'Medium');
    equal(dariusData.matchup.difficulty_rating, 5);

    const contrast = getContrastRatio(THEME_TOKENS.textPrimary, THEME_TOKENS.bgBase);
    greaterThanOrEqual(contrast, 10.0);

    // Step 3: Quick Info provides decision metrics in 3 seconds
    equal(dariusData.matchup.runes_recommendation, 'PTA / Conq > Resolve / Inspiration');
    equal(dariusData.matchup.starting_items, 'Doran\'s Blade / Doran\'s Shield');
    equal(dariusData.matchup.summoner_spells, 'Ignite + Flash');
    equal(dariusData.matchup.ability_max_order, 'Q3 > W > E');

    // Step 4: Inspect Detailed Notes (tips 1 to 5)
    greaterThanOrEqual(dariusData.tips.length, 5);
    const allNotesText = dariusData.tips.map(t => t.content_en).join(' ');
    ok(allNotesText.includes('Q') || allNotesText.includes('W') || allNotesText.includes('E'));

    // Step 5: Consult Fury Management Guide for empowering abilities
    const furyGuide = db.getGeneralGuide('furyManagement');
    ok(furyGuide);
    ok(furyGuide.content_en.includes('50') || furyGuide.content_en.includes('Fury'));

    // Step 6: Verify Data Dragon icon URLs
    const iconUrl = ddragon.getChampionIconUrl('Darius');
    equal(iconUrl, 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/Darius.png');

    const bladeUrl = ddragon.getItemIconUrl(1055); // Doran's Blade
    equal(bladeUrl, 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/item/1055.png');
  });
});
