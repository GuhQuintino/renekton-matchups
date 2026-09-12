const { DataDragonService } = require('../harness/dataDragonService');
const { equal, ok, isTrue } = require('../harness/assert');

describe('F15: Data Dragon CDN Icon Resolver & Fallbacks', () => {
  test('15.1 - Champion icon URL builds valid Riot CDN URL with latest version', () => {
    const ddragon = new DataDragonService({ version: '16.16.1' });
    const url = ddragon.getChampionIconUrl('Aatrox');
    equal(url, 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/Aatrox.png');
  });

  test('15.2 - Special champion keys map correctly (Wukong -> MonkeyKing, Dr. Mundo -> DrMundo, Cho\'Gath -> Chogath, Bel\'Veth -> Belveth)', () => {
    const ddragon = new DataDragonService({ version: '16.16.1' });
    equal(ddragon.getChampionIconUrl('Wukong'), 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/MonkeyKing.png');
    equal(ddragon.getChampionIconUrl('Dr. Mundo'), 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/DrMundo.png');
    equal(ddragon.getChampionIconUrl('Cho\'Gath'), 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/Chogath.png');
    equal(ddragon.getChampionIconUrl('Kai\'Sa'), 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/Kaisa.png');
    equal(ddragon.getChampionIconUrl('K\'Sante'), 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/KSante.png');
    equal(ddragon.getChampionIconUrl('Bel\'Veth'), 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/Belveth.png');
  });

  test('15.3 - Item, Spell, and Rune icon builders construct correct paths', () => {
    const ddragon = new DataDragonService({ version: '16.16.1' });
    const itemUrl = ddragon.getItemIconUrl(1055); // Doran's Blade
    equal(itemUrl, 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/item/1055.png');

    const spellUrl = ddragon.getSpellIconUrl('SummonerFlash');
    equal(spellUrl, 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/spell/SummonerFlash.png');

    const runeUrl = ddragon.getRuneIconUrl('perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png');
    equal(runeUrl, 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png');
  });

  test('15.4 - Offline fallback returns valid inline SVG data URI when offline', () => {
    const ddragon = new DataDragonService({ isOffline: true });
    const url = ddragon.getChampionIconUrl('Renekton');
    isTrue(url.startsWith('data:image/svg+xml;utf8,'), 'Should return inline SVG data URI');
    ok(url.includes('Renekton') || url.includes('svg'));
  });

  test('15.5 - Offline SVG fallback generator sanitizes labels to prevent injection', () => {
    const ddragon = new DataDragonService({ isOffline: true });
    const url = ddragon.getOfflineSvgFallback('<script>alert(1)</script>');
    isTrue(!url.includes('<script>'), 'Must sanitize script tags from SVG');
  });
});
