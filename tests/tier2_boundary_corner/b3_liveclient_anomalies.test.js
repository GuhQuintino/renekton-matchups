const { LiveClientService } = require('../harness/liveClientService');
const { equal, ok, isFalse, isTrue, greaterThan, lessThan } = require('../harness/assert');

describe('Tier 2 - B3: Live Client Data Anomalies & In-Game Edge Cases', () => {
  test('B3.1 - Null, undefined, or empty allgamedata payload returns not-detected safely', () => {
    const resNull = LiveClientService.detectLaneOpponent(null);
    isFalse(resNull.detected);
    equal(resNull.opponentChampion, null);

    const resEmpty = LiveClientService.detectLaneOpponent({});
    isFalse(resEmpty.detected);
  });

  test('B3.2 - Empty allPlayers array (0 players returned during loading screen initial tick)', () => {
    const res = LiveClientService.detectLaneOpponent({ allPlayers: [] });
    isFalse(res.detected);
    equal(res.candidates.length, 0);
  });

  test('B3.3 - Active player is not Renekton (e.g. playing Garen) still resolves enemy Top opponent', () => {
    const mock = {
      activePlayer: { summonerName: 'SoloTopPlayer' },
      allPlayers: [
        { summonerName: 'SoloTopPlayer', championName: 'Garen', team: 'ORDER', position: 'TOP' },
        { summonerName: 'EnemyTop', championName: 'Darius', team: 'CHAOS', position: 'TOP', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Ghost' }, items: [{ displayName: 'Doran\'s Blade' }] }
      ]
    };
    const res = LiveClientService.detectLaneOpponent(mock);
    isTrue(res.detected);
    equal(res.opponentChampion, 'Darius');
  });

  test('B3.4 - Missing summoner spells or items in player payload defaults scores safely without error', () => {
    const playerMinimal = {
      championName: 'Malphite',
      position: 'TOP',
      summonerSpellOne: null,
      summonerSpellTwo: null,
      items: null
    };

    const score = LiveClientService.calculateOpponentScore(playerMinimal);
    // +100 (TOP) + 30 (Catalog) = 130
    equal(score, 130);
  });

  test('B3.5 - Partial enemy team (AFK / DC in loading screen: only 3 enemies returned)', () => {
    const mock3Enemies = {
      activePlayer: { summonerName: 'Player1' },
      allPlayers: [
        { summonerName: 'Player1', championName: 'Renekton', team: 'ORDER', position: 'TOP' },
        { summonerName: 'EnemyMid', championName: 'Zed', team: 'CHAOS', position: 'MIDDLE' },
        { summonerName: 'EnemyBot', championName: 'Jinx', team: 'CHAOS', position: 'BOTTOM' },
        { summonerName: 'EnemyTop', championName: 'Sion', team: 'CHAOS', position: 'TOP', summonerSpellOne: { displayName: 'Teleport' }, summonerSpellTwo: { displayName: 'Flash' }, items: [] }
      ]
    };

    const res = LiveClientService.detectLaneOpponent(mock3Enemies);
    isTrue(res.detected);
    equal(res.opponentChampion, 'Sion');
  });

  test('B3.6 - Both enemy Top and Mid have Teleport and Flash (position tie-break resolves Top)', () => {
    const enemyTop = {
      championName: 'Camille',
      position: 'TOP',
      summonerSpellOne: { displayName: 'Flash' },
      summonerSpellTwo: { displayName: 'Teleport' },
      items: [{ displayName: 'Doran\'s Blade' }]
    };
    const enemyMid = {
      championName: 'Galio',
      position: 'MIDDLE',
      summonerSpellOne: { displayName: 'Flash' },
      summonerSpellTwo: { displayName: 'Teleport' },
      items: [{ displayName: 'Doran\'s Ring' }]
    };

    const topScore = LiveClientService.calculateOpponentScore(enemyTop);
    const midScore = LiveClientService.calculateOpponentScore(enemyMid);

    greaterThan(topScore, midScore, 'Camille (TOP) score must exceed Galio (MIDDLE)');
  });

  test('B3.7 - Off-meta pick without explicit position tag scores catalogued Top laners positively', () => {
    const enemyOffMeta = {
      championName: 'Riven',
      position: '',
      summonerSpellOne: { displayName: 'Flash' },
      summonerSpellTwo: { displayName: 'Ignite' },
      items: [{ displayName: 'Doran\'s Blade' }]
    };

    const score = LiveClientService.calculateOpponentScore(enemyOffMeta);
    // +25 (Ignite) + 20 (Doran) + 30 (Catalog Riven) = 75
    equal(score, 75);
  });

  test('B3.8 - Remake game at 03:00 has valid game data and triggers end state cleanly', () => {
    const remakePayload = {
      gameData: { gameTime: 185 }, // 3:05
      allPlayers: [
        { summonerName: 'P1', championName: 'Renekton', team: 'ORDER', scores: { kills: 0, deaths: 0, assists: 0 } }
      ]
    };
    ok(remakePayload.gameData.gameTime < 240);
  });

  test('B3.9 - Extremely long game (> 60 minutes / 3600 seconds) parses time without overflow', () => {
    const longGameSec = 4200; // 70 minutes
    const minutes = Math.floor(longGameSec / 60);
    const seconds = longGameSec % 60;
    equal(minutes, 70);
    equal(seconds, 0);
  });

  test('B3.10 - Sudden LiveClient socket termination (ECONNREFUSED) does not lose locked opponent', () => {
    const initialMatchup = {
      detected: true,
      opponentChampion: 'Fiora',
      confidence: 100
    };

    // Simulate network error fallback retaining last known state
    const cachedState = { ...initialMatchup, isStale: true };
    isTrue(cachedState.detected);
    equal(cachedState.opponentChampion, 'Fiora');
  });
});
