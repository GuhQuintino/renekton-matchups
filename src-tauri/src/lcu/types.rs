use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LockfileInfo {
    pub process_name: String,
    pub pid: u32,
    pub port: u16,
    pub auth_token: String,
    pub protocol: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum StandardGamePhase {
    Disconnected,
    Lobby,
    ChampSelect,
    InGame,
    PostGame,
}

impl StandardGamePhase {
    pub fn as_str(&self) -> &'static str {
        match self {
            StandardGamePhase::Disconnected => "DISCONNECTED",
            StandardGamePhase::Lobby => "LOBBY",
            StandardGamePhase::ChampSelect => "CHAMP_SELECT",
            StandardGamePhase::InGame => "IN_GAME",
            StandardGamePhase::PostGame => "POST_GAME",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectPlayer {
    pub cell_id: i64,
    pub champion_id: i64,
    pub summoner_id: Option<i64>,
    pub assigned_position: Option<String>,
    pub spell1_id: Option<i64>,
    pub spell2_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectAction {
    pub id: i64,
    pub actor_cell_id: i64,
    pub champion_id: i64,
    pub completed: bool,
    #[serde(rename = "type")]
    pub action_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectSession {
    #[serde(default)]
    pub my_team: Vec<ChampSelectPlayer>,
    #[serde(default)]
    pub their_team: Vec<ChampSelectPlayer>,
    #[serde(default)]
    pub actions: Vec<Vec<ChampSelectAction>>,
    pub local_player_cell_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealedPick {
    pub cell_id: i64,
    pub champion_id: i64,
    pub assigned_position: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectDraftSummary {
    pub in_champ_select: bool,
    pub my_champion: Option<String>,
    pub my_position: Option<String>,
    pub enemy_picks: Vec<RevealedPick>,
    pub ally_picks: Vec<RevealedPick>,
    pub enemy_count: usize,
    pub total_actions: usize,
}
