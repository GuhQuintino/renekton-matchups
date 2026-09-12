const { LiveClientService } = require('../harness/liveClientService');
const { equal, ok, greaterThan, lessThan, isTrue } = require('../harness/assert');

describe('F4: Live Client Data & Lane Opponent Detector', () => {
  test('4.1 - Calculates high positive score for enemy with Top position, Teleport, and Doran item', () => {
    const enemyDarius = {
      championName: 'Darius',
      position: 'TOP',
      summonerSpellOne: { displayName: 'Flash' },
      summonerSpellTwo: { displayName: 'Teleport' },
      items: [{ displayName: 'Doran\'s Blade' }]
    };

    const score = LiveClientService.calculateOpponentScore(enemyDarius);
    // +100 (TOP) + 40 (TP) + 20 (Doran) + 30 (Catalog) = 190
    equal(score, 190);
  });

  test('4.2 - Penalizes Junglers and Supports heavily to eliminate false positives', () => {
    const enemyJungler = {
      championName: 'Sejuani',
      position: 'JUNGLE',
      summonerSpellOne: { displayName: 'Smite' },
      summonerSpellTwo: { displayName: 'Flash' },
      items: [{ displayName: 'Scorchclaw Seedling' }]
    };

    const jungleScore = LiveClientService.calculateOpponentScore(enemyJungler);
    lessThan(jungleScore, -1000, 'Jungler score must be heavily negative');

    const enemySupport = {
      championName: 'Nautilus',
      position: 'UTILITY',
      summonerSpellOne: { displayName: 'Ignite' },
      summonerSpellTwo: { displayName: 'Flash' },
      items: [{ displayName: 'World Atlas' }]
    };

    const supportScore = LiveClientService.calculateOpponentScore(enemySupport);
    lessThan(supportScore, -1000, 'Support score must be heavily negative');
  });

  test('4.3 - Detects lane opponent with 100% confidence from full allgamedata mock', () => {
    const fullMock = {
      activePlayer: { summonerName: 'GodrektonBR' },
      allPlayers: [
        { summonerName: 'GodrektonBR', championName: 'Renekton', team: 'ORDER', position: 'TOP' },
        { summonerName: 'AllyMid', championName: 'Ahri', team: 'ORDER', position: 'MIDDLE' },
        { summonerName: 'EnemyTop', championName: 'Aatrox', team: 'CHAOS', position: 'TOP', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Teleport' }, items: [{ displayName: 'Doran\'s Shield' }] },
        { summonerName: 'EnemyMid', championName: 'Sylas', team: 'CHAOS', position: 'MIDDLE', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Ignite' }, items: [{ displayName: 'Doran\'s Ring' }] },
        { summonerName: 'EnemyJg', championName: 'Lee Sin', team: 'CHAOS', position: 'JUNGLE', summonerSpellOne: { displayName: 'Smite' }, summonerSpellTwo: { displayName: 'Flash' }, items: [] }
      ]
    };

    const detection = LiveClientService.detectLaneOpponent(fullMock);
    isTrue(detection.detected, 'Must detect opponent');
    equal(detection.opponentChampion, 'Aatrox');
    greaterThan(detection.confidence, 80, 'Confidence must be > 80%');
  });

  test('4.4 - Handles missing active player gracefully by checking Renekton champion in team list', () => {
    const mockWithoutActive = {
      activePlayer: null,
      allPlayers: [
        { summonerName: 'Player1', championName: 'Renekton', team: 'ORDER', position: 'TOP' },
        { summonerName: 'Enemy1', championName: 'Jax', team: 'CHAOS', position: 'TOP', summonerSpellOne: { displayName: 'Teleport' }, summonerSpellTwo: { displayName: 'Flash' }, items: [{ displayName: 'Doran\'s Blade' }] }
      ]
    };

    const detection = LiveClientService.detectLaneOpponent(mockWithoutActive);
    isTrue(detection.detected);
    equal(detection.opponentChampion, 'Jax');
  });

  test('4.5 - Manual lane swap override reassigns tracked matchup with 100% confidence', () => {
    const initialDetection = {
      detected: true,
      opponentChampion: 'Yasuo',
      confidence: 70
    };

    const overridden = LiveClientService.manualLaneSwap(initialDetection, 'Yone');
    isTrue(overridden.detected);
    equal(overridden.opponentChampion, 'Yone');
    equal(overridden.confidence, 100);
    isTrue(overridden.isManualOverride);
  });

  test('4.6 - Practice Tool / 1v1: Detects single enemy Warwick Bot with Smite with 100% confidence', () => {
    const practiceToolMock = {
      activePlayer: { summonerName: 'Gustavo#SUP' },
      gameData: { gameMode: 'PRACTICETOOL' },
      allPlayers: [
        { summonerName: 'Gustavo#SUP', championName: 'Renekton', team: 'ORDER', position: 'NONE' },
        { summonerName: 'Warwick Bot', championName: 'Warwick', team: 'CHAOS', position: 'JUNGLE', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Golpear' } }
      ]
    };

    const detection = LiveClientService.detectLaneOpponent(practiceToolMock);
    isTrue(detection.detected, 'Must detect single enemy in practice tool');
    equal(detection.opponentChampion, 'Warwick');
    equal(detection.confidence, 100);
  });
});
