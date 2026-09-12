const path = require('path');
const { InMemoryDbService } = require('../harness/dbService');
const { LiveClientService } = require('../harness/liveClientService');
const { SimulatorEngine } = require('../harness/simulatorEngine');
const { equal, ok, isTrue } = require('../harness/assert');

const docsDir = path.join(__dirname, '..', '..', 'Docs', 'Guia de Renekton');

describe('Tier 4 - Scenario S4: Ambiguous Draft & In-Game Lane Swap Resolution', () => {
  let db;
  let sim;

  beforeEach(() => {
    db = new InMemoryDbService();
    db.seedFromCsvDirectory(docsDir);
    sim = new SimulatorEngine();
  });

  test('S4 - Resolves flex draft with Yasuo and Yone, locks Yasuo Top at 0:30, and executes 1-click manual swap to Yone at 06:00', () => {
    // Step 1: Simulator loads Scenario C (Yasuo & Yone on enemy team)
    const initialSim = sim.loadScenario('SCENARIO_C_LANE_SWAP');
    equal(initialSim.phase, 'IN_GAME');
    equal(initialSim.potential_opponents.length, 2);

    // Step 2: LiveClient scoring matrix confirms Yasuo (position: TOP) vs Yone (position: MIDDLE)
    const liveData = {
      activePlayer: { summonerName: 'SoloRenekton' },
      allPlayers: [
        { summonerName: 'SoloRenekton', championName: 'Renekton', team: 'ORDER', position: 'TOP' },
        { summonerName: 'EnemyYasuo', championName: 'Yasuo', team: 'CHAOS', position: 'TOP', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Ignite' }, items: [{ displayName: 'Doran\'s Blade' }] },
        { summonerName: 'EnemyYone', championName: 'Yone', team: 'CHAOS', position: 'MIDDLE', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Teleport' }, items: [{ displayName: 'Doran\'s Shield' }] }
      ]
    };

    const detection = LiveClientService.detectLaneOpponent(liveData);
    isTrue(detection.detected);
    equal(detection.opponentChampion, 'Yasuo');

    // Step 3: Matchup for Yasuo displayed
    const yasuoData = db.getMatchupByChampion('Yasuo');
    ok(yasuoData);
    equal(yasuoData.champion.name, 'Yasuo');
    equal(yasuoData.matchup.difficulty_tier, 'Easy');

    // Step 4: Enemies execute lane swap at 06:00. Player triggers 1-click manual swap to Yone
    const swapped = LiveClientService.manualLaneSwap(detection, 'Yone');
    isTrue(swapped.detected);
    equal(swapped.opponentChampion, 'Yone');
    isTrue(swapped.isManualOverride);

    // Step 5: Interface updates to Yone guide
    const yoneData = db.getMatchupByChampion('Yone');
    ok(yoneData);
    equal(yoneData.champion.name, 'Yone');
    equal(yoneData.matchup.difficulty_raw, 'Easy - 2/10');
    ok(yoneData.matchup.runes_recommendation);
  });
});
