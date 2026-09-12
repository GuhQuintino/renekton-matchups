use std::sync::RwLock;

use super::scenarios::get_scenario_default;
use super::types::GameStateEvent;

pub struct SimulatorEngine {
    state: RwLock<GameStateEvent>,
}

impl Default for SimulatorEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl SimulatorEngine {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(GameStateEvent::default()),
        }
    }

    pub fn get_state(&self) -> GameStateEvent {
        self.state.read().unwrap().clone()
    }

    pub fn set_state(&self, new_state: GameStateEvent) -> GameStateEvent {
        let mut lock = self.state.write().unwrap();
        *lock = new_state.clone();
        new_state
    }

    pub fn load_scenario(
        &self,
        scenario_name: &str,
        custom_payload: Option<serde_json::Value>,
    ) -> Result<GameStateEvent, String> {
        let mut base_state = get_scenario_default(scenario_name)?;

        if let Some(payload) = custom_payload {
            if let Some(obj) = payload.as_object() {
                if let Some(phase_val) = obj.get("phase").and_then(|v| v.as_str()) {
                    base_state.phase = phase_val.to_string();
                }
                if let Some(conn_val) = obj.get("connected").and_then(|v| v.as_bool()) {
                    base_state.connected = conn_val;
                }
                if let Some(opp_val) = obj.get("opponent_champion").and_then(|v| v.as_str()) {
                    base_state.opponent_champion = Some(opp_val.to_string());
                } else if let Some(opp_val) = obj.get("opponentChampion").and_then(|v| v.as_str()) {
                    base_state.opponent_champion = Some(opp_val.to_string());
                }
                if let Some(my_val) = obj.get("my_champion").and_then(|v| v.as_str()) {
                    base_state.my_champion = Some(my_val.to_string());
                } else if let Some(my_val) = obj.get("myChampion").and_then(|v| v.as_str()) {
                    base_state.my_champion = Some(my_val.to_string());
                }
                if let Some(time_val) = obj.get("game_time_seconds").and_then(|v| v.as_u64()) {
                    base_state.game_time_seconds = time_val;
                } else if let Some(time_val) = obj.get("gameTimeSeconds").and_then(|v| v.as_u64()) {
                    base_state.game_time_seconds = time_val;
                }
                if let Some(conf_val) = obj.get("opponent_confidence").and_then(|v| v.as_u64()) {
                    base_state.opponent_confidence = conf_val as u32;
                } else if let Some(conf_val) = obj.get("opponentConfidence").and_then(|v| v.as_u64()) {
                    base_state.opponent_confidence = conf_val as u32;
                }
                if let Some(res_val) = obj.get("match_result").and_then(|v| v.as_str()) {
                    base_state.match_result = Some(res_val.to_string());
                } else if let Some(res_val) = obj.get("matchResult").and_then(|v| v.as_str()) {
                    base_state.match_result = Some(res_val.to_string());
                }
                if let Some(match_id) = obj.get("match_id").and_then(|v| v.as_str()) {
                    base_state.match_id = Some(match_id.to_string());
                } else if let Some(match_id) = obj.get("matchId").and_then(|v| v.as_str()) {
                    base_state.match_id = Some(match_id.to_string());
                }
                if let Some(pots) = obj.get("potential_opponents").and_then(|v| v.as_array()) {
                    base_state.potential_opponents = pots
                        .iter()
                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                        .collect();
                } else if let Some(pots) = obj.get("potentialOpponents").and_then(|v| v.as_array()) {
                    base_state.potential_opponents = pots
                        .iter()
                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                        .collect();
                }
            }
        }

        let mut lock = self.state.write().unwrap();
        *lock = base_state.clone();
        Ok(base_state)
    }
}
