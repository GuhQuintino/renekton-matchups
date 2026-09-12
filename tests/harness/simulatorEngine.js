/**
 * Game State Simulator and Mock Engine
 */

class SimulatorEngine {
  constructor() {
    this.state = {
      phase: 'DISCONNECTED',
      connected: false,
      game_time_seconds: 0,
      my_champion: null,
      opponent_champion: null,
      opponent_confidence: 0,
      potential_opponents: [],
      match_id: null
    };
    this.listeners = new Map(); // event -> Set<callback>
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        cb(data);
      }
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  setState(partialState) {
    this.state = {
      ...this.state,
      ...partialState
    };
    this.emit('gameStateChanged', this.getState());
  }

  loadScenario(scenarioName, customPayload = {}) {
    const s = scenarioName.toUpperCase();
    switch (s) {
      case 'SCENARIO_A_DRAFT':
        this.setState({
          phase: 'CHAMP_SELECT',
          connected: true,
          my_champion: 'Renekton',
          opponent_champion: 'Aatrox',
          opponent_confidence: 85,
          potential_opponents: ['Aatrox', 'Lee Sin', 'Ahri', 'Kai\'Sa', 'Nautilus'],
          game_time_seconds: 0,
          match_id: 'draft_sim_001',
          ...customPayload
        });
        break;

      case 'SCENARIO_B_IN_GAME':
        this.setState({
          phase: 'IN_GAME',
          connected: true,
          my_champion: 'Renekton',
          opponent_champion: 'Darius',
          opponent_confidence: 100,
          potential_opponents: ['Darius'],
          game_time_seconds: 215,
          match_id: 'live_sim_darius_002',
          ...customPayload
        });
        break;

      case 'SCENARIO_C_LANE_SWAP':
        this.setState({
          phase: 'IN_GAME',
          connected: true,
          my_champion: 'Renekton',
          opponent_champion: 'Yasuo',
          opponent_confidence: 70,
          potential_opponents: ['Yasuo', 'Yone'],
          game_time_seconds: 180,
          match_id: 'swap_sim_003',
          ...customPayload
        });
        break;

      case 'SCENARIO_D_POST_GAME_WIN':
        this.setState({
          phase: 'POST_GAME',
          connected: true,
          my_champion: 'Renekton',
          opponent_champion: 'Aatrox',
          opponent_confidence: 100,
          potential_opponents: [],
          game_time_seconds: 1720, // 28:40
          match_id: 'post_game_win_004',
          match_result: 'WIN',
          ...customPayload
        });
        this.emit('postGameTrigger', this.getState());
        break;

      case 'SCENARIO_E_DISCONNECTED':
        this.setState({
          phase: 'DISCONNECTED',
          connected: false,
          my_champion: null,
          opponent_champion: null,
          opponent_confidence: 0,
          potential_opponents: [],
          game_time_seconds: 0,
          match_id: null,
          ...customPayload
        });
        break;

      default:
        throw new Error(`Unknown simulation scenario: "${scenarioName}". Available: SCENARIO_A_DRAFT, SCENARIO_B_IN_GAME, SCENARIO_C_LANE_SWAP, SCENARIO_D_POST_GAME_WIN, SCENARIO_E_DISCONNECTED`);
    }
    return this.getState();
  }
}

module.exports = {
  SimulatorEngine
};
