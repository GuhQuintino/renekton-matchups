pub mod client;
pub mod lane_detector;
pub mod types;

pub use client::LiveClient;
pub use lane_detector::{
    calculate_opponent_score, detect_lane_opponent, manual_lane_swap, TOP_LANER_CATALOG,
};
pub use types::{
    ActivePlayer, AllGameData, GameData, Item, LaneOpponentDetection, Player, ScoredCandidate,
    Scores, SummonerSpell,
};
