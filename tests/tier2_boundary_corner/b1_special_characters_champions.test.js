const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { SearchService } = require('../harness/searchService');
const { DataDragonService } = require('../harness/dataDragonService');
const { equal, ok, isTrue, greaterThanOrEqual } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 2 - B1: Special Characters & Champion Names Boundary Cases', () => {
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

  test('B1.1 - Apostrophes in Cho\'Gath, Kai\'Sa, K\'Sante, Kha\'Zix, Rek\'Sai, Vel\'Koz, Bel\'Veth resolve properly', () => {
    const apostropheChamps = ["Cho'Gath", "Kai'Sa", "K'Sante", "Kha'Zix", "Rek'Sai", "Vel'Koz", "Bel'Veth"];
    for (const name of apostropheChamps) {
      const match = db.getMatchupByChampion(name);
      ok(match, `Matchup for ${name} must be found`);
      const searchRes = searchService.search({ query: name });
      greaterThanOrEqual(searchRes.count, 1, `Search for ${name} must find champion`);
    }
  });

  test('B1.2 - Spaces and Roman numerals (Jarvan IV, Lee Sin, Master Yi, Miss Fortune, Tahm Kench, Twisted Fate, Xin Zhao, Aurelion Sol)', () => {
    const multiWordChamps = ['Jarvan IV', 'Lee Sin', 'Master Yi', 'Miss Fortune', 'Tahm Kench', 'Twisted Fate', 'Xin Zhao', 'Aurelion Sol'];
    for (const name of multiWordChamps) {
      const match = db.getMatchupByChampion(name);
      ok(match, `Matchup for ${name} must be found`);
      equal(match.champion.name, name);
    }
  });

  test('B1.3 - Punctuation in Dr. Mundo ("DR.Mundo" in sheet maps to "Dr. Mundo" display and "DrMundo" key)', () => {
    const fromSheet = db.getMatchupByChampion('DR.Mundo');
    const fromDisplay = db.getMatchupByChampion('Dr. Mundo');
    const fromRiot = db.getMatchupByChampion('DrMundo');

    ok(fromSheet && fromDisplay && fromRiot);
    equal(fromSheet.champion.name, 'Dr. Mundo');
    equal(fromSheet.champion.riot_key, 'DrMundo');
    equal(ddragon.getChampionRiotKey('Dr. Mundo'), 'DrMundo');
  });

  test('B1.4 - Riot internal key divergence (Wukong -> MonkeyKing, Renata Glasc -> Renata, Nunu & Willump -> Nunu, Bel\'Veth -> Belveth)', () => {
    equal(ddragon.getChampionRiotKey('Wukong'), 'MonkeyKing');
    equal(ddragon.getChampionRiotKey('Renata Glasc'), 'Renata');
    equal(ddragon.getChampionRiotKey('Nunu & Willump'), 'Nunu');
    equal(ddragon.getChampionRiotKey('Bel\'Veth'), 'Belveth');

    const wukongMatch = db.getMatchupByChampion('Wukong');
    equal(wukongMatch.champion.riot_key, 'MonkeyKing');
  });

  test('B1.5 - Author typo corrections in raw CSV ("Lillah" -> Lillia, "Millio" -> Milio, "Nillah" -> Nilah)', () => {
    const lillia = db.getMatchupByChampion('Lillia');
    const lilliaTypo = db.getMatchupByChampion('Lillah');
    ok(lillia && lilliaTypo);
    equal(lillia.champion.name, 'Lillia');

    const milio = db.getMatchupByChampion('Milio');
    const milioTypo = db.getMatchupByChampion('Millio');
    ok(milio && milioTypo);
    equal(milio.champion.name, 'Milio');

    const nilah = db.getMatchupByChampion('Nilah');
    const nilahTypo = db.getMatchupByChampion('Nillah');
    ok(nilah && nilahTypo);
    equal(nilah.champion.name, 'Nilah');
  });

  test('B1.6 - Mixed and weird casing ("aAtRoX", "dArIuS", "CHO\'GATH", "k\'sAnTe")', () => {
    ok(db.getMatchupByChampion('aAtRoX'));
    ok(db.getMatchupByChampion('dArIuS'));
    ok(db.getMatchupByChampion('CHO\'GATH'));
    ok(db.getMatchupByChampion('k\'sAnTe'));
  });

  test('B1.7 - Leading and trailing whitespace with tabs and newlines ("  Aatrox  ", "\\tDarius\\n")', () => {
    ok(db.getMatchupByChampion('  Aatrox  '));
    ok(db.getMatchupByChampion('\tDarius\n'));
    ok(db.getMatchupByChampion(' \r\nFiora   '));
  });

  test('B1.8 - Short single-character queries ("A", "Z") and non-existent champions ("Goku", "Invoker")', () => {
    const resA = searchService.search({ query: 'A' });
    greaterThanOrEqual(resA.count, 10);

    const resGoku = searchService.search({ query: 'Goku' });
    equal(resGoku.count, 0);

    const resInvoker = searchService.search({ query: 'Invoker' });
    equal(resInvoker.count, 0);
  });

  test('B1.9 - Special punctuation and symbols in search query (*, ?, %, &, $, #)', () => {
    const resPercent = searchService.search({ query: 'Aatrox%#$*?' });
    equal(resPercent.results[0].championName, 'Aatrox', 'Normalized search should ignore special symbols');
  });

  test('B1.10 - SQL Injection payload strings in search queries execute safely without error', () => {
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE champions; --",
      "1' UNION SELECT * FROM user_notes --",
      "\" OR \"\"=\""
    ];

    for (const p of payloads) {
      const res = searchService.search({ query: p });
      ok(Array.isArray(res.results), 'Must return array safely without throwing');
    }
  });
});
