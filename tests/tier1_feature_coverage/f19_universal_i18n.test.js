const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const { equal, ok, isTrue, isFalse } = require('../harness/assert');

function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const m = { exports: {} };
  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', transpiled);
  fn(m, m.exports, require, path.dirname(filePath), filePath);
  return m.exports.default || m.exports.en || m.exports.ptBr || m.exports;
}

describe('F19: Universal i18n & Multi-Language Support (EN & PT-BR)', () => {
  const enPath = path.resolve(__dirname, '../../src/i18n/translations/en.ts');
  const ptPath = path.resolve(__dirname, '../../src/i18n/translations/pt-br.ts');

  let enDict;
  let ptDict;

  test('19.1 - Translation dictionary files exist and parse cleanly', () => {
    isTrue(fs.existsSync(enPath), 'en.ts translation file must exist');
    isTrue(fs.existsSync(ptPath), 'pt-br.ts translation file must exist');

    enDict = loadTsModule(enPath);
    ptDict = loadTsModule(ptPath);

    ok(enDict, 'enDict should be successfully loaded');
    ok(ptDict, 'ptDict should be successfully loaded');
  });

  test('19.2 - All top-level translation domains are present in both dictionaries', () => {
    const requiredDomains = [
      'common',
      'header',
      'sidebar',
      'heroCard',
      'quickInfo',
      'matchupTabs',
      'combos',
      'deeplol',
      'champSelect',
      'inGameHUD',
      'notes',
      'postGame',
      'guidesModal',
      'tierListModal',
    ];

    for (const domain of requiredDomains) {
      ok(enDict[domain], `Domain '${domain}' must exist in en.ts`);
      ok(ptDict[domain], `Domain '${domain}' must exist in pt-br.ts`);
    }
  });

  test('19.3 - Exact key parity between English and Brazilian Portuguese dictionaries', () => {
    function getLeafKeys(obj, prefix = '') {
      let keys = [];
      for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
          keys = keys.concat(getLeafKeys(v, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    }

    const enKeys = getLeafKeys(enDict).sort();
    const ptKeys = getLeafKeys(ptDict).sort();

    const missingInPt = enKeys.filter((k) => !ptKeys.includes(k));
    const missingInEn = ptKeys.filter((k) => !enKeys.includes(k));

    equal(missingInPt.length, 0, `Keys missing in pt-br.ts: ${missingInPt.join(', ')}`);
    equal(missingInEn.length, 0, `Keys missing in en.ts: ${missingInEn.join(', ')}`);
    equal(enKeys.length, ptKeys.length, 'Key counts must be strictly identical');
  });

  test('19.4 - No empty translation strings or undefined values', () => {
    function validateValues(obj, dictName, pathStr = '') {
      for (const [k, v] of Object.entries(obj)) {
        const currentPath = pathStr ? `${pathStr}.${k}` : k;
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
          validateValues(v, dictName, currentPath);
        } else if (typeof v === 'string') {
          isTrue(v.trim().length > 0, `String at ${dictName}:${currentPath} must not be empty`);
        } else {
          ok(v !== undefined && v !== null, `Value at ${dictName}:${currentPath} must be defined`);
        }
      }
    }

    validateValues(enDict, 'en.ts');
    validateValues(ptDict, 'pt-br.ts');
  });

  test('19.5 - All 8 General Guides categories are localized in both languages', () => {
    const requiredGuideCats = [
      'introduction',
      'faq',
      'runes',
      'mechanics_combos',
      'summoners',
      'items_builds',
      'ability_starts_maxing',
      'fury_management',
    ];

    for (const cat of requiredGuideCats) {
      ok(enDict.guidesModal.categories[cat], `en guidesModal.categories must have '${cat}'`);
      ok(ptDict.guidesModal.categories[cat], `pt-br guidesModal.categories must have '${cat}'`);
      ok(enDict.guidesModal.categoryDescriptions[cat], `en guidesModal.categoryDescriptions must have '${cat}'`);
      ok(ptDict.guidesModal.categoryDescriptions[cat], `pt-br guidesModal.categoryDescriptions must have '${cat}'`);
    }
  });

  test('19.6 - Level 1 Tier List configs (5 ability starts, 3 item starts) are localized', () => {
    const abilityStarts = ['Q', 'W', 'E', 'E_ALCOVE', 'SITUATIONAL'];
    for (const ab of abilityStarts) {
      ok(enDict.tierListModal.abilityTiers[ab]?.title, `en abilityTier ${ab} must have title`);
      ok(ptDict.tierListModal.abilityTiers[ab]?.title, `pt abilityTier ${ab} must have title`);
      ok(enDict.tierListModal.abilityTiers[ab]?.description, `en abilityTier ${ab} must have description`);
      ok(ptDict.tierListModal.abilityTiers[ab]?.description, `pt abilityTier ${ab} must have description`);
    }

    const itemStarts = ['shield_only', 'blade_or_shield', 'long_sword_rush'];
    for (const item of itemStarts) {
      ok(enDict.tierListModal.itemTiers[item]?.title, `en itemTier ${item} must have title`);
      ok(ptDict.tierListModal.itemTiers[item]?.title, `pt itemTier ${item} must have title`);
      ok(enDict.tierListModal.itemTiers[item]?.description, `en itemTier ${item} must have description`);
      ok(ptDict.tierListModal.itemTiers[item]?.description, `pt itemTier ${item} must have description`);
    }
  });

  test('19.7 - Post-Game and Match Notes models support localized star ratings and results', () => {
    for (let stars = 1; stars <= 5; stars++) {
      ok(enDict.notes.difficultyDescriptions[stars], `en notes must have rating for ${stars} stars`);
      ok(ptDict.notes.difficultyDescriptions[stars], `pt notes must have rating for ${stars} stars`);
    }

    ok(enDict.notes.results.win, 'en must have win label');
    ok(ptDict.notes.results.win, 'pt must have win label');
    ok(enDict.notes.results.loss, 'en must have loss label');
    ok(ptDict.notes.results.loss, 'pt must have loss label');
    ok(enDict.notes.results.remake, 'en must have remake label');
    ok(ptDict.notes.results.remake, 'pt must have remake label');
  });
});
