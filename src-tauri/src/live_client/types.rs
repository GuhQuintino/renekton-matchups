use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SummonerSpell {
    pub display_name: Option<String>,
    pub raw_description: Option<String>,
    pub raw_display_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub item_id: Option<i64>,
    pub display_name: Option<String>,
    pub count: Option<i64>,
    pub price: Option<i64>,
    pub slot: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Scores {
    pub kills: Option<i64>,
    pub deaths: Option<i64>,
    pub assists: Option<i64>,
    pub creep_score: Option<i64>,
    pub ward_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RuneKeystone {
    pub display_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PlayerRunes {
    pub keystone: Option<RuneKeystone>,
    pub primary_rune_tree: Option<RuneKeystone>,
    pub secondary_rune_tree: Option<RuneKeystone>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Player {
    pub summoner_name: Option<String>,
    pub champion_name: Option<String>,
    pub team: Option<String>, // "ORDER" or "CHAOS"
    pub position: Option<String>, // "TOP", "MIDDLE", "BOTTOM", "JUNGLE", "UTILITY"
    pub summoner_spell_one: Option<SummonerSpell>,
    pub summoner_spell_two: Option<SummonerSpell>,
    pub items: Option<Vec<Item>>,
    pub scores: Option<Scores>,
    pub runes: Option<PlayerRunes>,
    pub level: Option<i64>,
    pub is_dead: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ActivePlayer {
    pub summoner_name: Option<String>,
    pub level: Option<i64>,
    pub current_gold: Option<f64>,
    pub champion_stats: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GameData {
    pub game_time: Option<f64>,
    pub game_mode: Option<String>,
    pub map_number: Option<i64>,
    pub map_name: Option<String>,
    pub map_terrain: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AllGameData {
    pub active_player: Option<ActivePlayer>,
    pub all_players: Option<Vec<Player>>,
    pub events: Option<serde_json::Value>,
    pub game_data: Option<GameData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScoredCandidate {
    pub champion_name: String,
    pub position: Option<String>,
    pub score: i32,
    pub player_data: Player,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaneOpponentDetection {
    pub detected: bool,
    pub opponent_champion: Option<String>,
    pub confidence: u32,
    pub top_candidate_score: i32,
    pub candidates: Vec<ScoredCandidate>,
    pub is_manual_override: bool,
}
