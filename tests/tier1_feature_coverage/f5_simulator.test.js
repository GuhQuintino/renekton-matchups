const { SimulatorEngine } = require('../harness/simulatorEngine');
const { equal, ok, deepEqual, throws, isTrue, isFalse } = require('../harness/assert');

describe('F5: Game State Simulator & Mock Control', () => {
  let sim;

  beforeEach(() => {
    sim = new SimulatorEngine();
  });

  test('5.1 - Simulator initializes in DISCONNECTED state and emits state changes', () => {
    const initialState = sim.getState();
    equal(initialState.phase, 'DISCONNECTED');
    isFalse(initialState.connected);

    let emitted = null;
    sim.on('gameStateChanged', (state) => {
      emitted = state;
    });

    sim.setState({ phase: 'LOBBY', connected: true });
    ok(emitted, 'Must emit state change');
    equal(emitted.phase, 'LOBBY');
    isTrue(emitted.connected);
  });

  test('5.2 - Scenario A: Draft simulation loads Champ Select with enemy Aatrox', () => {
    const state = sim.loadScenario('SCENARIO_A_DRAFT');
    equal(state.phase, 'CHAMP_SELECT');
    equal(state.my_champion, 'Renekton');
    equal(state.opponent_champion, 'Aatrox');
    ok(state.potential_opponents.includes('Aatrox'));
  });

  test('5.3 - Scenario B: In-Game simulation loads Live state vs Darius Level 3', () => {
    const state = sim.loadScenario('SCENARIO_B_IN_GAME');
    equal(state.phase, 'IN_GAME');
    equal(state.opponent_champion, 'Darius');
    equal(state.opponent_confidence, 100);
    equal(state.game_time_seconds, 215);
  });

  test('5.4 - Scenario C: Lane Swap simulation loads dual flex opponents (Yasuo & Yone)', () => {
    const state = sim.loadScenario('SCENARIO_C_LANE_SWAP');
    equal(state.phase, 'IN_GAME');
    equal(state.opponent_champion, 'Yasuo');
    ok(state.potential_opponents.includes('Yasuo'));
    ok(state.potential_opponents.includes('Yone'));
  });

  test('5.5 - Scenario D: Post-Game simulation triggers postGameTrigger event with Victory payload', () => {
    let triggeredPayload = null;
    sim.on('postGameTrigger', (payload) => {
      triggeredPayload = payload;
    });

    const state = sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    equal(state.phase, 'POST_GAME');
    ok(triggeredPayload, 'Must fire postGameTrigger event');
    equal(triggeredPayload.match_result, 'WIN');
    equal(triggeredPayload.opponent_champion, 'Aatrox');
  });
});
