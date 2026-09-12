use serde::{Deserialize, Serialize};
use std::sync::RwLock;

use crate::lcu::{discover_lockfile, map_gameflow_phase, parse_champ_select_session, LcuClient};
use crate::live_client::{detect_lane_opponent, LiveClient};
use crate::simulator::{GameStateEvent, SimulatorEngine};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LcuStatus {
    pub is_connected: bool,
    pub port: Option<u16>,
    pub phase: Option<String>,
    pub error: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveClientStatus {
    pub is_active: bool,
    pub game_time: Option<f64>,
    pub active_player: Option<String>,
    pub detected_opponent: Option<String>,
    pub confidence: Option<u32>,
    pub error: Option<String>,
}

#[derive(Clone, Debug, Default)]
pub struct LivePlayerMatchStats {
    pub kda: String,
    pub items: String,
    pub spells: String,
    pub runes: String,
    pub cs: u32,
    pub opponent: Option<String>,
    pub game_time_seconds: u64,
}

pub struct GameStateManager {
    pub is_simulator_mode: RwLock<bool>,
    pub simulator_engine: SimulatorEngine,
    pub live_client: LiveClient,
    pub cached_lcu: RwLock<Option<LcuClient>>,
    pub last_live_match_stats: RwLock<Option<LivePlayerMatchStats>>,
    pub last_known_state: RwLock<GameStateEvent>,
}

impl Default for GameStateManager {
    fn default() -> Self {
        Self::new()
    }
}

impl GameStateManager {
    pub fn new() -> Self {
        Self {
            is_simulator_mode: RwLock::new(false),
            simulator_engine: SimulatorEngine::new(),
            live_client: LiveClient::new(),
            cached_lcu: RwLock::new(None),
            last_live_match_stats: RwLock::new(None),
            last_known_state: RwLock::new(GameStateEvent::default()),
        }
    }

    pub fn is_simulator_active(&self) -> bool {
        *self.is_simulator_mode.read().unwrap()
    }

    pub fn set_simulator_mode(&self, active: bool) {
        let mut lock = self.is_simulator_mode.write().unwrap();
        *lock = active;
    }

    pub async fn poll_real_game_state(&self) -> GameStateEvent {
        // 1. Try Live Client Data API first (in-game has highest priority)
        if let Ok(all_data) = self.live_client.get_all_game_data().await {
            let detection = detect_lane_opponent(&all_data);
            let game_time = all_data
                .game_data
                .as_ref()
                .and_then(|g| g.game_time)
                .unwrap_or(0.0) as u64;

            let active_name = all_data
                .active_player
                .as_ref()
                .and_then(|ap| ap.summoner_name.as_deref());

            let my_champ = all_data
                .all_players
                .as_ref()
                .and_then(|players| {
                    players.iter().find(|p| {
                        (active_name.is_some() && p.summoner_name.as_deref() == active_name)
                            || p.champion_name.as_deref() == Some("Renekton")
                    })
                })
                .and_then(|p| p.champion_name.clone())
                .unwrap_or_else(|| "Renekton".to_string());

            let mut potential_opponents = Vec::new();
            for c in &detection.candidates {
                potential_opponents.push(c.champion_name.clone());
            }

            // Extract Live Player Stats (KDA, Items, Spells, Runes, CS)
            let mut kda_val = None;
            let mut items_val = None;
            let mut spells_val = None;
            let mut runes_val = None;
            let mut cs_val = None;

            if let Some(players) = &all_data.all_players {
                if let Some(p) = players.iter().find(|p| {
                    (active_name.is_some() && p.summoner_name.as_deref() == active_name)
                        || p.champion_name.as_deref() == Some("Renekton")
                }) {
                    let k = p.scores.as_ref().and_then(|s| s.kills).unwrap_or(0);
                    let d = p.scores.as_ref().and_then(|s| s.deaths).unwrap_or(0);
                    let a = p.scores.as_ref().and_then(|s| s.assists).unwrap_or(0);
                    let cs = p.scores.as_ref().and_then(|s| s.creep_score).unwrap_or(0) as u32;
                    let kda = format!("{}/{}/{}", k, d, a);

                    let items = p.items.as_ref().map(|its| {
                        its.iter()
                            .filter_map(|it| it.display_name.clone())
                            .filter(|n| !n.is_empty())
                            .collect::<Vec<_>>()
                            .join(", ")
                    }).unwrap_or_default();

                    let mut sps = Vec::new();
                    if let Some(s1) = &p.summoner_spell_one {
                        if let Some(name) = &s1.display_name {
                            sps.push(name.clone());
                        }
                    }
                    if let Some(s2) = &p.summoner_spell_two {
                        if let Some(name) = &s2.display_name {
                            sps.push(name.clone());
                        }
                    }
                    let spells = sps.join(", ");

                    let runes = p.runes.as_ref()
                        .and_then(|r| r.keystone.as_ref())
                        .and_then(|k| k.display_name.clone())
                        .unwrap_or_else(|| "Conquistador".to_string());

                    // Save snapshot in memory for Post-Game handoff
                    let stats_snapshot = LivePlayerMatchStats {
                        kda: kda.clone(),
                        items: items.clone(),
                        spells: spells.clone(),
                        runes: runes.clone(),
                        cs,
                        opponent: detection.opponent_champion.clone(),
                        game_time_seconds: game_time,
                    };
                    let mut stats_lock = self.last_live_match_stats.write().unwrap();
                    *stats_lock = Some(stats_snapshot);

                    kda_val = Some(kda);
                    items_val = if items.is_empty() { None } else { Some(items) };
                    spells_val = if spells.is_empty() { None } else { Some(spells) };
                    runes_val = Some(runes);
                    cs_val = Some(cs);
                }
            }

            let new_state = GameStateEvent {
                phase: "IN_GAME".to_string(),
                connected: true,
                game_time_seconds: game_time,
                my_champion: Some(my_champ),
                opponent_champion: detection.opponent_champion,
                opponent_confidence: detection.confidence,
                potential_opponents,
                match_id: Some(format!("live_match_{}", game_time)),
                match_result: None,
                is_manual_override: detection.is_manual_override,
                kda: kda_val,
                items_built: items_val,
                summoners_used: spells_val,
                runes_used: runes_val,
                cs: cs_val,
            };

            let mut lock = self.last_known_state.write().unwrap();
            *lock = new_state.clone();
            return new_state;
        }

        // 2. Try LCU API (Champ select / Lobby / Post game) with client caching
        let lcu_client_opt = {
            let read_lock = self.cached_lcu.read().unwrap();
            read_lock.clone()
        };

        let lcu_client = match lcu_client_opt {
            Some(client) => client,
            None => {
                if let Ok(lockfile) = discover_lockfile() {
                    if let Ok(client) = LcuClient::new(lockfile) {
                        let mut write_lock = self.cached_lcu.write().unwrap();
                        *write_lock = Some(client.clone());
                        client
                    } else {
                        let new_state = GameStateEvent::default();
                        let mut lock = self.last_known_state.write().unwrap();
                        *lock = new_state.clone();
                        return new_state;
                    }
                } else {
                    let new_state = GameStateEvent::default();
                    let mut lock = self.last_known_state.write().unwrap();
                    *lock = new_state.clone();
                    return new_state;
                }
            }
        };

        if let Ok(raw_phase) = lcu_client.get_gameflow_phase().await {
            let standard_phase = map_gameflow_phase(&raw_phase);
            let phase_str = standard_phase.as_str().to_string();

            if standard_phase == crate::lcu::types::StandardGamePhase::ChampSelect {
                let prev = self.last_known_state.read().unwrap().clone();
                let mut enemy_pots = Vec::new();
                let mut my_champ = Some("Renekton".to_string());

                if let Ok(session) = lcu_client.get_champ_select_session().await {
                    let draft = parse_champ_select_session(&session);
                    if let Some(c) = draft.my_champion {
                        my_champ = Some(c);
                    }
                    for enemy in &draft.enemy_picks {
                        let cname = crate::lcu::lockfile::get_champion_name_or_fallback(enemy.champion_id);
                        enemy_pots.push(cname);
                    }
                }

                // Determine opponent champion & manual override flag
                let (opponent, is_manual_override, confidence) = if prev.phase == "CHAMP_SELECT" && prev.is_manual_override && prev.opponent_champion.is_some() {
                    // Retain user's manual selection during Champ Select
                    (prev.opponent_champion, true, 100)
                } else if let Some(prev_opp) = prev.opponent_champion.as_ref().filter(|o| enemy_pots.contains(o)) {
                    // Keep currently focused opponent if still in revealed picks
                    (Some(prev_opp.clone()), prev.is_manual_override, prev.opponent_confidence)
                } else if let Some(first) = enemy_pots.first() {
                    // Default fallback to first revealed enemy pick
                    (Some(first.clone()), false, 80)
                } else {
                    (None, false, 0)
                };

                let new_state = GameStateEvent {
                    phase: phase_str,
                    connected: true,
                    game_time_seconds: 0,
                    my_champion: my_champ,
                    opponent_champion: opponent,
                    opponent_confidence: confidence,
                    potential_opponents: enemy_pots,
                    match_id: Some("lcu_champ_select".to_string()),
                    match_result: None,
                    is_manual_override,
                    kda: None,
                    items_built: None,
                    summoners_used: None,
                    runes_used: None,
                    cs: None,
                };

                let mut lock = self.last_known_state.write().unwrap();
                *lock = new_state.clone();
                return new_state;
            } else if standard_phase == crate::lcu::types::StandardGamePhase::PostGame {
                let prev = self.last_known_state.read().unwrap().clone();
                let last_stats = self.last_live_match_stats.read().unwrap().clone().unwrap_or_default();

                let final_opponent = if last_stats.opponent.is_some() {
                    last_stats.opponent
                } else {
                    prev.opponent_champion.or_else(|| Some("Warwick".to_string()))
                };

                let new_state = GameStateEvent {
                    phase: phase_str,
                    connected: true,
                    game_time_seconds: if last_stats.game_time_seconds > 0 { last_stats.game_time_seconds } else { prev.game_time_seconds },
                    my_champion: prev.my_champion.or_else(|| Some("Renekton".to_string())),
                    opponent_champion: final_opponent,
                    opponent_confidence: 100,
                    potential_opponents: Vec::new(),
                    match_id: prev.match_id.or_else(|| Some(format!("post_match_{}", last_stats.game_time_seconds))),
                    match_result: Some("WIN".to_string()),
                    is_manual_override: false,
                    kda: if !last_stats.kda.is_empty() { Some(last_stats.kda) } else { prev.kda },
                    items_built: if !last_stats.items.is_empty() { Some(last_stats.items) } else { prev.items_built },
                    summoners_used: if !last_stats.spells.is_empty() { Some(last_stats.spells) } else { prev.summoners_used },
                    runes_used: if !last_stats.runes.is_empty() { Some(last_stats.runes) } else { prev.runes_used },
                    cs: if last_stats.cs > 0 { Some(last_stats.cs) } else { prev.cs },
                };

                let mut lock = self.last_known_state.write().unwrap();
                *lock = new_state.clone();
                return new_state;
            } else {
                let new_state = GameStateEvent {
                    phase: phase_str,
                    connected: true,
                    game_time_seconds: 0,
                    my_champion: None,
                    opponent_champion: None,
                    opponent_confidence: 0,
                    potential_opponents: Vec::new(),
                    match_id: None,
                    match_result: None,
                    is_manual_override: false,
                    kda: None,
                    items_built: None,
                    summoners_used: None,
                    runes_used: None,
                    cs: None,
                };

                let mut lock = self.last_known_state.write().unwrap();
                *lock = new_state.clone();
                return new_state;
            }
        }

        // Invalidate cached client on failure
        {
            let mut write_lock = self.cached_lcu.write().unwrap();
            *write_lock = None;
        }

        // 3. Fallback to Disconnected
        let new_state = GameStateEvent {
            phase: "DISCONNECTED".to_string(),
            connected: false,
            game_time_seconds: 0,
            my_champion: None,
            opponent_champion: None,
            opponent_confidence: 0,
            potential_opponents: Vec::new(),
            match_id: None,
            match_result: None,
            is_manual_override: false,
            kda: None,
            items_built: None,
            summoners_used: None,
            runes_used: None,
            cs: None,
        };

        let mut lock = self.last_known_state.write().unwrap();
        *lock = new_state.clone();
        new_state
    }

    pub async fn get_current_game_state(&self) -> GameStateEvent {
        if self.is_simulator_active() {
            self.simulator_engine.get_state()
        } else {
            self.poll_real_game_state().await
        }
    }

    pub fn set_simulation_scenario(
        &self,
        scenario: &str,
        payload: Option<serde_json::Value>,
    ) -> Result<GameStateEvent, String> {
        self.set_simulator_mode(true);
        self.simulator_engine.load_scenario(scenario, payload)
    }

    pub fn manual_lane_swap(&self, new_champion: &str) -> GameStateEvent {
        if self.is_simulator_active() {
            let mut state = self.simulator_engine.get_state();
            state.opponent_champion = Some(new_champion.to_string());
            state.opponent_confidence = 100;
            state.is_manual_override = true;
            self.simulator_engine.set_state(state)
        } else {
            let mut state = self.last_known_state.read().unwrap().clone();
            state.opponent_champion = Some(new_champion.to_string());
            state.opponent_confidence = 100;
            state.is_manual_override = true;
            let mut lock = self.last_known_state.write().unwrap();
            *lock = state.clone();
            state
        }
    }
}
