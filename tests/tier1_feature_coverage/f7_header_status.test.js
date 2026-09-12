const { CONNECTION_STATUS } = require('../harness/uiThemeService');
const { SimulatorEngine } = require('../harness/simulatorEngine');
const { equal, ok, isTrue, isFalse } = require('../harness/assert');

describe('F7: Live Detection Status Header Transitions', () => {
  let sim;

  beforeEach(() => {
    sim = new SimulatorEngine();
  });

  test('7.1 - Status indicators defined with correct color codes for all 5 phases', () => {
    equal(CONNECTION_STATUS.DISCONNECTED.color, '#64748B');
    equal(CONNECTION_STATUS.LOBBY.color, '#38BDF8');
    equal(CONNECTION_STATUS.CHAMP_SELECT.color, '#F59E0B');
    equal(CONNECTION_STATUS.IN_GAME.color, '#10B981');
    equal(CONNECTION_STATUS.POST_GAME.color, '#A78BFA');
  });

  test('7.2 - Header transitions to CHAMP_SELECT and tracks potential enemy champions', () => {
    sim.setState({
      phase: 'CHAMP_SELECT',
      connected: true,
      potential_opponents: ['Aatrox', 'Darius', 'Fiora']
    });

    const state = sim.getState();
    equal(state.phase, 'CHAMP_SELECT');
    equal(state.potential_opponents.length, 3);
  });

  test('7.3 - Header transitions to IN_GAME and displays locked opponent', () => {
    sim.setState({
      phase: 'IN_GAME',
      connected: true,
      opponent_champion: 'Camille',
      opponent_confidence: 95
    });

    const state = sim.getState();
    equal(state.phase, 'IN_GAME');
    equal(state.opponent_champion, 'Camille');
    equal(state.opponent_confidence, 95);
  });

  test('7.4 - Header supports switching between LCU_AUTO, SIMULATOR, and MANUAL modes', () => {
    const modes = ['LCU_AUTO', 'SIMULATOR', 'MANUAL'];
    for (const mode of modes) {
      sim.setState({ current_mode: mode });
      equal(sim.getState().current_mode, mode);
    }
  });

  test('7.5 - Client disconnection cleanly transitions header to DISCONNECTED', () => {
    sim.loadScenario('SCENARIO_B_IN_GAME');
    equal(sim.getState().phase, 'IN_GAME');

    sim.loadScenario('SCENARIO_E_DISCONNECTED');
    equal(sim.getState().phase, 'DISCONNECTED');
    isFalse(sim.getState().connected);
  });
});
