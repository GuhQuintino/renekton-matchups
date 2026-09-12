const { parseCSV, extractNumberedTips } = require('../harness/csvParser');
const { validateTranslation } = require('../harness/translationEngine');
const { equal, ok, isTrue } = require('../harness/assert');

describe('Tier 2 - B8: Translation & CSV Parsing Anomaly Resistance', () => {
  test('B8.1 - CSV parser handles mixed line endings (CRLF \\r\\n and LF \\n)', () => {
    const csvContent = 'Champion,Difficulty\r\nAatrox,Medium - 5/10\nAhri,Hard - 9/10\r\nAkali,Medium - 4/10';
    const parsed = parseCSV(csvContent);
    equal(parsed.length, 4);
    equal(parsed[1][0], 'Aatrox');
    equal(parsed[2][0], 'Ahri');
    equal(parsed[3][0], 'Akali');
  });

  test('B8.2 - CSV parser handles fields containing commas, double quotes, and internal newlines inside quotes', () => {
    const csvContent = 'Champion,Notes\n"Aatrox","(1) Tip one, with comma\n(2) Tip two, with ""escaped quotes"""';
    const parsed = parseCSV(csvContent);
    equal(parsed.length, 2);
    equal(parsed[1][0], 'Aatrox');
    ok(parsed[1][1].includes('with comma'));
    ok(parsed[1][1].includes('"escaped quotes"'));
  });

  test('B8.3 - Numbered tips parser handles tips with semicolons, dashes, and complex punctuation', () => {
    const rawTips = '(1) Short Trades: E -> AA -> W -> Q -> E2; repeat when CDs are up.\n(2) Item Spike - Rush Eclipse: Gives huge shield & burst.';
    const tips = extractNumberedTips(rawTips);
    equal(tips.length, 2);
    equal(tips[0].tipNumber, 1);
    ok(tips[0].content.includes('repeat when CDs are up'));
    equal(tips[1].tipNumber, 2);
    ok(tips[1].content.includes('Rush Eclipse'));
  });

  test('B8.4 - Translation engine validates complex PT-BR paragraph with multiple LoL acronyms (AA, CC, CD, DPS, TF, TP, CS)', () => {
    const complexPtText = 'No Nível 3, seu powerspike é alto. Encaixe um AA antes do W para maximizar o DPS, aplique o Stun do CC e use o E2 para disengage se o JG inimigo der gank com TP.';
    const res = validateTranslation(complexPtText);
    isTrue(res.valid);
    equal(res.errors.length, 0);
  });

  test('B8.5 - Complex ability max strings ("Q > E > W or Q3 > W > E") preserved without corruption', () => {
    const abilityString = 'Q > E > W or Q3 > W > E';
    const res = validateTranslation(`A ordem de evolução é ${abilityString}.`);
    isTrue(res.valid);
    ok(res.errors.length === 0);
  });
});
