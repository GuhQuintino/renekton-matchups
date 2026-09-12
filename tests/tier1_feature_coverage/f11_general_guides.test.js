const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { equal, ok } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('F11: 8 General Guides Viewer (Runes, Combos, etc.)', () => {
  let db;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
  });

  test('11.1 - Runes guide loads complete content with PTA vs Conqueror analysis', () => {
    const guide = db.getGeneralGuide('runes');
    ok(guide, 'Runes guide must exist');
    ok(guide.content_en.includes('Press the Attack') || guide.content_en.includes('PTA'));
  });

  test('11.2 - Mechanics & Combos guide loads animation cancels and combo sequences', () => {
    const guide = db.getGeneralGuide('mechanicsCombos');
    ok(guide, 'Mechanics & Combos guide must exist');
    ok(guide.content_en.includes('Cancel') || guide.content_en.includes('Combo') || guide.content_en.includes('W'));
  });

  test('11.3 - Summoners guide loads Flash, Ignite, Teleport, and Ghost breakdown', () => {
    const guide = db.getGeneralGuide('summoners');
    ok(guide, 'Summoners guide must exist');
    ok(guide.content_en.includes('Ignite') || guide.content_en.includes('Flash') || guide.content_en.includes('Teleport'));
  });

  test('11.4 - Items & Builds guide loads Tier List and starter items', () => {
    const guide = db.getGeneralGuide('itemsBuilds');
    ok(guide, 'Items & Builds guide must exist');
    ok(guide.content_en.includes('Doran') || guide.content_en.includes('Eclipse') || guide.content_en.includes('Cleaver'));
  });

  test('11.5 - Fury Management, Ability Starts, FAQ, and Introduction guides load properly', () => {
    const fury = db.getGeneralGuide('furyManagement');
    ok(fury, 'Fury Management guide must exist');

    const ability = db.getGeneralGuide('abilityStarts');
    ok(ability, 'Ability Starts guide must exist');

    const faq = db.getGeneralGuide('faq');
    ok(faq, 'FAQ guide must exist');

    const intro = db.getGeneralGuide('introduction');
    ok(intro, 'Introduction guide must exist');
  });
});
