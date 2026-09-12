const { THEME_TOKENS, DIFFICULTY_BADGES, getContrastRatio } = require('../harness/uiThemeService');
const { equal, ok, greaterThanOrEqual } = require('../harness/assert');

describe('F6: LoLTheory UI & Color Contrast', () => {
  test('6.1 - Theme color tokens match LoLTheory reference specification (#090A0C, #D4A017)', () => {
    equal(THEME_TOKENS.bgBase, '#090A0C');
    equal(THEME_TOKENS.bgSurface1, '#0F1015');
    equal(THEME_TOKENS.bgSurface2, '#151821');
    equal(THEME_TOKENS.goldPrimary, '#D4A017');
    equal(THEME_TOKENS.goldBright, '#F3B72C');
    equal(THEME_TOKENS.borderSubtle, '#262B3D');
  });

  test('6.2 - WCAG Contrast: Primary text on dark base exceeds 10:1 (exceeds AAA requirement 7:1)', () => {
    const ratio = getContrastRatio(THEME_TOKENS.textPrimary, THEME_TOKENS.bgBase);
    greaterThanOrEqual(ratio, 12.0, `Primary text contrast ratio (${ratio.toFixed(2)}) must exceed 12:1`);
  });

  test('6.3 - WCAG Contrast: Secondary text on surface exceeds 4.5:1 (AA requirement for small text)', () => {
    const ratio = getContrastRatio(THEME_TOKENS.textSecondary, THEME_TOKENS.bgSurface2);
    greaterThanOrEqual(ratio, 4.5, `Secondary text contrast ratio (${ratio.toFixed(2)}) must be >= 4.5:1`);
  });

  test('6.4 - Difficulty badge color sets provide 4 distinct, legible semantic levels', () => {
    const levels = ['EASY', 'MEDIUM', 'HARD', 'EXTREME'];
    for (const lvl of levels) {
      ok(DIFFICULTY_BADGES[lvl], `Difficulty level ${lvl} must have badge styling`);
      ok(DIFFICULTY_BADGES[lvl].text, `Difficulty ${lvl} text color defined`);
      ok(DIFFICULTY_BADGES[lvl].bg, `Difficulty ${lvl} bg color defined`);

      const textOnBgRatio = getContrastRatio(DIFFICULTY_BADGES[lvl].text, DIFFICULTY_BADGES[lvl].bg);
      greaterThanOrEqual(textOnBgRatio, 3.5, `Badge ${lvl} text-on-bg contrast (${textOnBgRatio.toFixed(2)}) must be >= 3.5:1`);
    }
  });

  test('6.5 - Gold accent contrast on dark surface is legible for icons and borders', () => {
    const goldRatio = getContrastRatio(THEME_TOKENS.goldPrimary, THEME_TOKENS.bgBase);
    greaterThanOrEqual(goldRatio, 7.0, `Gold accent contrast (${goldRatio.toFixed(2)}) must be >= 7:1`);
  });
});
