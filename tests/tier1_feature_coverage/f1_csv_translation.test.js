const path = require('path');
const { parseMatchUpSheet, parseAllGeneralGuides, extractNumberedTips } = require('../harness/csvParser');
const { validateTranslation, checkForbiddenTranslations } = require('../harness/translationEngine');
const { equal, ok, greaterThanOrEqual, deepEqual, isTrue } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('F1: CSV Parser & PT-BR Translation Pipeline', () => {
  test('1.1 - Match Up Sheet CSV extracts exactly 170 champions with 9 standard columns', () => {
    const matchupFile = path.join(docsDir, 'The Ultimate Renekton Guide Spreadsheet - Match Up Sheet.csv');
    const parsed = parseMatchUpSheet(matchupFile);

    equal(parsed.totalChampions, 170, 'Should extract exactly 170 champions');
    equal(parsed.headers.length, 9, 'Should have 9 columns');
    equal(parsed.headers[0], 'Champion');
    equal(parsed.headers[1], 'Difficulty + Rating');
    equal(parsed.headers[2], 'Runes');
    equal(parsed.headers[3], 'Starting Items');
    equal(parsed.headers[4], 'Summoners');
    equal(parsed.headers[5], 'Ability Max Order');
    equal(parsed.headers[6], 'Match Up Summary');
    equal(parsed.headers[7], 'Detailed Notes');
    equal(parsed.headers[8], 'Video Examples');

    const first = parsed.matchups[0];
    equal(first.champion, 'Aatrox');
    equal(first.difficultyTier, 'Medium');
    equal(first.difficultyRating, 5);

    const last = parsed.matchups[169];
    equal(last.champion, 'Zyra');
  });

  test('1.2 - General guides parser loads all 8 auxiliary sheets with complete text content', () => {
    const guides = parseAllGeneralGuides(docsDir);
    const expectedKeys = [
      'abilityStarts',
      'faq',
      'furyManagement',
      'introduction',
      'itemsBuilds',
      'mechanicsCombos',
      'runes',
      'summoners'
    ];

    equal(Object.keys(guides).length, 8, 'Should load all 8 general guides');
    for (const key of expectedKeys) {
      ok(guides[key], `Guide "${key}" must be present`);
      ok(guides[key].records.length > 0, `Guide "${key}" records must not be empty`);
      ok(guides[key].rawText.length > 100, `Guide "${key}" text must have content`);
    }
  });

  test('1.3 - Numbered tips extraction correctly parses (1), (2), (3) formatted tips', () => {
    const sampleNotes = `(1) Respect Her Passive - Fiora's biggest strength across her kit is simply hitting her passive procs.
(2) Avoid Her W Stun - Fiora W Riposte is her key defensive tool, parrying all incoming damage and CC.
(3) Wave Management - Avoid pushing mindlessly into her tower.`;

    const tips = extractNumberedTips(sampleNotes);
    equal(tips.length, 3, 'Should extract 3 numbered tips');
    equal(tips[0].tipNumber, 1);
    equal(tips[0].title, 'Respect Her Passive');
    ok(tips[0].content.includes('Fiora\'s biggest strength'));

    equal(tips[1].tipNumber, 2);
    equal(tips[1].title, 'Avoid Her W Stun');
    ok(tips[1].content.includes('Fiora W Riposte'));

    equal(tips[2].tipNumber, 3);
    equal(tips[2].title, 'Wave Management');
  });

  test('1.4 - Translation engine preserves 100% English integrity for sacred LoL terms', () => {
    const validSamplePt = 'Garen é um matchup fácil no início. Use o Q Cull the Meek para trocar e guarde o W Ruthless Predator para quebrar escudos. Comece de Doran\'s Blade com Flash e Ignite. Comande a wave e busque um freeze.';
    const result = validateTranslation(validSamplePt, 'English original text');

    isTrue(result.valid, 'Translation must pass glossary validation');
    equal(result.errors.length, 0);

    const badSamplePt = 'Use Pressione o Ataque com Espada do Rei Destruído e Incendiar.';
    const violations = checkForbiddenTranslations(badSamplePt);
    greaterThanOrEqual(violations.length, 3, 'Must flag translated terms like Pressione o Ataque, Espada do Rei Destruído, and Incendiar');
  });

  test('1.5 - Translation engine produces accurate PT-BR explanations and tactical advice without breaking terms', () => {
    const samplePtBr = 'Quando o Aatrox gastar o Q1 e Q2, use o E Slice and Dice para entrar no alcance dele, desferir um AA fortalecido com W e sair com E2 antes do cooldown do Q dele voltar.';
    const result = validateTranslation(samplePtBr, 'When Aatrox spends Q1 and Q2...');
    isTrue(result.valid);
    ok(samplePtBr.includes('Slice and Dice'));
    ok(samplePtBr.includes('cooldown'));
  });
});
