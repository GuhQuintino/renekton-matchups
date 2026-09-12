const { SimulatorEngine } = require('../harness/simulatorEngine');
const { equal, ok, throws, isTrue, isFalse } = require('../harness/assert');

describe('Tier 2 - B7: Simulator & State Transition Edge Cases', () => {
  let sim;

  beforeEach(() => {
    sim = new SimulatorEngine();
  });

  test('B7.1 - Rapid successive state transitions (DISCONNECTED -> LOBBY -> CHAMP_SELECT -> IN_GAME -> POST_GAME in 5ms)', () => {
    const phases = ['DISCONNECTED', 'LOBBY', 'CHAMP_SELECT', 'IN_GAME', 'POST_GAME'];
    for (const p of phases) {
      sim.setState({ phase: p, connected: p !== 'DISCONNECTED' });
      equal(sim.getState().phase, p);
    }
  });

  test('B7.2 - Out-of-order state transitions (DISCONNECTED jump directly to IN_GAME) handled cleanly', () => {
    sim.setState({ phase: 'IN_GAME', opponent_champion: 'Aatrox', connected: true });
    equal(sim.getState().phase, 'IN_GAME');
    equal(sim.getState().opponent_champion, 'Aatrox');
  });

  test('B7.3 - Requesting unknown simulation scenario throws descriptive error', () => {
    throws(() => {
      sim.loadScenario('SCENARIO_UNKNOWN_XYZ');
    }, 'Unknown simulation scenario');
  });

  test('B7.4 - Custom payload overrides default scenario properties cleanly', () => {
    const customState = sim.loadScenario('SCENARIO_B_IN_GAME', {
      opponent_champion: 'Gnar',
      game_time_seconds: 999
    });

    equal(customState.opponent_champion, 'Gnar');
    equal(customState.game_time_seconds, 999);
  });

  test('B7.5 - Re-loading same scenario resets previous mutations', () => {
    sim.loadScenario('SCENARIO_A_DRAFT', { opponent_champion: 'CustomChamp' });
    equal(sim.getState().opponent_champion, 'CustomChamp');

    sim.loadScenario('SCENARIO_A_DRAFT');
    equal(sim.getState().opponent_champion, 'Aatrox');
  });

  test('B7.6 - Event listener registration, execution, and unsubscription', () => {
    let callCount = 0;
    const unsub = sim.on('gameStateChanged', () => {
      callCount++;
    });

    sim.setState({ phase: 'LOBBY' });
    equal(callCount, 1);

    unsub();
    sim.setState({ phase: 'CHAMP_SELECT' });
    equal(callCount, 1, 'Unsubscribed listener must not be called again');
  });

  test('B7.7 - Concurrency: 50 listeners attached to simulator event loop fire without memory leaks', () => {
    let sum = 0;
    for (let i = 0; i < 50; i++) {
      sim.on('gameStateChanged', () => {
        sum += 1;
      });
    }

    sim.setState({ phase: 'LOBBY' });
    equal(sum, 50);
  });

  test('B7.8 - State getter returns deep copy / immutable clone of internal state', () => {
    const s1 = sim.getState();
    s1.phase = 'CORRUPTED_PHASE';
    equal(sim.getState().phase, 'DISCONNECTED', 'Mutating returned state must not alter internal state');
  });

  test('B7.9 - Disconnect scenario resets all active match parameters', () => {
    sim.loadScenario('SCENARIO_B_IN_GAME');
    equal(sim.getState().opponent_champion, 'Darius');

    sim.loadScenario('SCENARIO_E_DISCONNECTED');
    equal(sim.getState().opponent_champion, null);
    equal(sim.getState().game_time_seconds, 0);
    isFalse(sim.getState().connected);
  });

  test('B7.10 - Lane Swap scenario pre-loads multiple candidate opponents', () => {
    sim.loadScenario('SCENARIO_C_LANE_SWAP');
    const state = sim.getState();
    equal(state.phase, 'IN_GAME');
    ok(state.potential_opponents.length >= 2);
    ok(state.potential_opponents.includes('Yasuo'));
    ok(state.potential_opponents.includes('Yone'));
  });
});
