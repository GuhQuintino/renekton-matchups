const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { equal, ok, isTrue } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 4 - Scenario S3: Out-of-Game Theorycrafting & Guide Navigation', () => {
  let db;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
  });

  test('S3 - Full out-of-game study session browsing all 8 general guides (Runes, Combos, Builds, Fury, FAQ)', () => {
    // 1. Runes Guide
    const runes = db.getGeneralGuide('runes');
    ok(runes, 'Runes guide must be available');
    ok(runes.content_en.includes('PTA') || runes.content_en.includes('Press the Attack'));
    ok(runes.content_en.includes('Conqueror'));

    // 2. Mechanics & Combos Guide
    const mechanics = db.getGeneralGuide('mechanicsCombos');
    ok(mechanics, 'Mechanics & Combos guide must be available');
    ok(mechanics.content_en.includes('Animation') || mechanics.content_en.includes('Cancel') || mechanics.content_en.includes('Combo'));

    // 3. Summoners Guide
    const summoners = db.getGeneralGuide('summoners');
    ok(summoners, 'Summoners guide must be available');
    ok(summoners.content_en.includes('Flash') && summoners.content_en.includes('Ignite'));

    // 4. Items & Builds Guide
    const items = db.getGeneralGuide('itemsBuilds');
    ok(items, 'Items & Builds guide must be available');
    ok(items.content_en.includes('Eclipse') || items.content_en.includes('Cleaver') || items.content_en.includes('Build'));

    // 5. Fury Management Guide
    const fury = db.getGeneralGuide('furyManagement');
    ok(fury, 'Fury Management guide must be available');
    ok(fury.content_en.includes('50') && fury.content_en.includes('100'));

    // 6. Ability Starts & Maxing Guide
    const ability = db.getGeneralGuide('abilityStarts');
    ok(ability, 'Ability Starts guide must be available');
    ok(ability.content_en.includes('Q') || ability.content_en.includes('W') || ability.content_en.includes('E'));

    // 7. FAQ Guide
    const faq = db.getGeneralGuide('faq');
    ok(faq, 'FAQ guide must be available');
    ok(faq.content_en.length > 50);

    // 8. Introduction Guide
    const intro = db.getGeneralGuide('introduction');
    ok(intro, 'Introduction guide must be available');
    ok(intro.content_en.includes('Godrekton') || intro.content_en.includes('Renekton') || intro.content_en.length > 50);
  });
});
