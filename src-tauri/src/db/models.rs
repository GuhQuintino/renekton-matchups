use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Champion {
    pub id: i64,
    pub name: String,
    pub sheet_name: String,
    pub riot_key: String,
    pub riot_id: Option<i64>,
    pub title_pt: Option<String>,
    pub title_en: Option<String>,
    pub roles_json: Option<String>,
    pub icon_url: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchupSummary {
    pub id: i64,
    pub champion_id: i64,
    pub champion_name: String,
    pub sheet_name: String,
    pub riot_key: String,
    pub difficulty_tier: String,
    pub difficulty_rating: i64,
    pub difficulty_raw: String,
    pub runes_recommendation: String,
    pub starting_items: String,
    pub summoner_spells: String,
    pub ability_max_order: String,
    pub icon_url: Option<String>,
    pub has_video: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchupTip {
    pub id: i64,
    pub matchup_id: i64,
    pub tip_number: i64,
    pub title_en: String,
    pub title_pt: String,
    pub content_en: String,
    pub content_pt: String,
    pub category: String,
    pub display_order: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchupDetail {
    pub id: i64,
    pub champion_id: i64,
    pub champion_name: String,
    pub sheet_name: String,
    pub riot_key: String,
    pub difficulty_tier: String,
    pub difficulty_rating: i64,
    pub difficulty_raw: String,
    pub runes_recommendation: String,
    pub starting_items: String,
    pub summoner_spells: String,
    pub ability_max_order: String,
    pub summary_en: Option<String>,
    pub summary_pt: Option<String>,
    pub detailed_notes_raw_en: Option<String>,
    pub detailed_notes_raw_pt: Option<String>,
    pub video_url: Option<String>,
    pub icon_url: Option<String>,
    pub tips: Vec<MatchupTip>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuideSection {
    pub id: i64,
    pub category: String,
    pub section_key: String,
    pub display_order: i64,
    pub title_en: String,
    pub title_pt: String,
    pub subtitle_en: Option<String>,
    pub subtitle_pt: Option<String>,
    pub content_en: String,
    pub content_pt: String,
    pub video_url: Option<String>,
    pub metadata_json: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuideContent {
    pub category: String,
    pub title_en: String,
    pub title_pt: String,
    pub description_en: String,
    pub description_pt: String,
    pub video_url: Option<String>,
    pub sections: Vec<GuideSection>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserNote {
    pub id: i64,
    pub champion_id: i64,
    pub champion_name: Option<String>,
    pub game_id: Option<String>,
    pub match_result: String,
    pub perceived_difficulty: i64,
    pub what_worked: Option<String>,
    pub what_failed: Option<String>,
    pub free_notes: Option<String>,
    pub runes_used: Option<String>,
    pub items_built: Option<String>,
    pub summoners_used: Option<String>,
    pub kda: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewNotePayload {
    pub champion_id: i64,
    pub champion_name: Option<String>,
    pub game_id: Option<String>,
    pub match_result: String,
    pub perceived_difficulty: i64,
    pub what_worked: Option<String>,
    pub what_failed: Option<String>,
    pub free_notes: Option<String>,
    pub runes_used: Option<String>,
    pub items_built: Option<String>,
    pub summoners_used: Option<String>,
    pub kda: Option<String>,
}
