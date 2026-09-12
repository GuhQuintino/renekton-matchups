const { SimulatorEngine } = require('../harness/simulatorEngine');
const { equal, ok, isTrue } = require('../harness/assert');

describe('F14: Automatic Post-Game Trigger', () => {
  let sim;

  beforeEach(() => {
    sim = new SimulatorEngine();
  });

  test('14.1 - Transition from IN_GAME to POST_GAME triggers postGameTrigger notification event', () => {
    let triggered = false;
    sim.on('postGameTrigger', () => {
      triggered = true;
    });

    sim.loadScenario('SCENARIO_B_IN_GAME');
    equal(sim.getState().phase, 'IN_GAME');

    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    isTrue(triggered, 'postGameTrigger must fire when transitioning to POST_GAME');
  });

  test('14.2 - Post-game payload pre-populates enemy champion name and match outcome', () => {
    let payload = null;
    sim.on('postGameTrigger', (data) => {
      payload = data;
    });

    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    ok(payload);
    equal(payload.opponent_champion, 'Aatrox');
    equal(payload.match_result, 'WIN');
    equal(payload.game_time_seconds, 1720);
  });

  test('14.3 - Post-game trigger can be dismissed or answered without corrupting app state', () => {
    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    equal(sim.getState().phase, 'POST_GAME');

    // Simulate modal close -> transition back to LOBBY
    sim.setState({ phase: 'LOBBY', connected: true });
    equal(sim.getState().phase, 'LOBBY');
  });

  test('14.4 - Subsequent game start resets post-game modal trigger state', () => {
    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    equal(sim.getState().phase, 'POST_GAME');

    sim.loadScenario('SCENARIO_A_DRAFT');
    equal(sim.getState().phase, 'CHAMP_SELECT');
    equal(sim.getState().opponent_champion, 'Aatrox');
  });

  test('14.5 - Multiple consecutive matches trigger post-game event reliably each time', () => {
    let triggerCount = 0;
    sim.on('postGameTrigger', () => {
      triggerCount++;
    });

    // Match 1
    sim.loadScenario('SCENARIO_B_IN_GAME');
    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    equal(triggerCount, 1);

    // Match 2
    sim.loadScenario('SCENARIO_C_LANE_SWAP');
    sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    equal(triggerCount, 2);
  });
});
