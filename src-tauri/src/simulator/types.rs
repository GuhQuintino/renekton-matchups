use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GameStateEvent {
    pub phase: String, // "DISCONNECTED", "LOBBY", "CHAMP_SELECT", "IN_GAME", "POST_GAME"
    pub connected: bool,
    #[serde(default)]
    pub game_time_seconds: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub my_champion: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opponent_champion: Option<String>,
    #[serde(default)]
    pub opponent_confidence: u32,
    #[serde(default)]
    pub potential_opponents: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub match_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub match_result: Option<String>,
    #[serde(default)]
    pub is_manual_override: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub kda: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub items_built: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summoners_used: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub runes_used: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cs: Option<u32>,
}

impl Default for GameStateEvent {
    fn default() -> Self {
        Self {
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
        }
    }
}
