use std::collections::HashSet;
use once_cell::sync::Lazy;

use super::types::{AllGameData, LaneOpponentDetection, Player, ScoredCandidate};

pub static TOP_LANER_CATALOG: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    let mut s = HashSet::new();
    let champions = [
        "Aatrox", "Akali", "Camille", "Cho'Gath", "Darius", "Dr. Mundo", "Fiora", "Gangplank",
        "Garen", "Gnar", "Gragas", "Gwen", "Illaoi", "Irelia", "Jax", "Jayce", "K'Sante",
        "Kayle", "Kennen", "Kled", "Malphite", "Mordekaiser", "Nasus", "Olaf", "Ornn",
        "Pantheon", "Poppy", "Quinn", "Renekton", "Riven", "Rumble", "Sett", "Shen",
        "Singed", "Sion", "Tahm Kench", "Teemo", "Trundle", "Tryndamere", "Urgot", "Varus",
        "Vayne", "Vladimir", "Volibear", "Warwick", "Wukong", "Yasuo", "Yone", "Yorick",
        "Ambessa", "Aurora", "Briar", "K'sante", "DrMundo", "MonkeyKing", "Chogath",
    ];
    for c in champions {
        s.insert(c);
    }
    s
});

/// Calculates confidence score for an enemy player being the lane opponent of Renekton (Top lane)
pub fn calculate_opponent_score(player: &Player) -> i32 {
    let mut score = 0;
    let pos = player
        .position
        .as_deref()
        .unwrap_or("")
        .to_uppercase();

    let spell1 = player
        .summoner_spell_one
        .as_ref()
        .and_then(|s| s.display_name.as_deref().or(s.raw_display_name.as_deref()))
        .unwrap_or("")
        .to_lowercase();
    let spell2 = player
        .summoner_spell_two
        .as_ref()
        .and_then(|s| s.display_name.as_deref().or(s.raw_display_name.as_deref()))
        .unwrap_or("")
        .to_lowercase();

    let items = player.items.as_deref().unwrap_or(&[]);
    let champ_name = player.champion_name.as_deref().unwrap_or("");

    // 1. Position Scoring
    if pos == "TOP" {
        score += 100;
    } else if pos == "MIDDLE" || pos == "MID" {
        score += 30;
    } else if pos == "BOTTOM" || pos == "BOT" {
        score -= 300;
    } else if pos == "JUNGLE" {
        score -= 500;
    } else if pos == "UTILITY" || pos == "SUPPORT" {
        score -= 500;
    }

    // 2. Summoner Spell Scoring
    let spells = [&spell1, &spell2];
    let has_smite = spells.iter().any(|s| s.contains("smite") || s.contains("golpear"));
    let has_teleport = spells.iter().any(|s| s.contains("teleport") || s.contains("tp"));
    let has_ignite_or_ghost = spells.iter().any(|s| s.contains("ignite") || s.contains("ghost"));
    let has_heal_or_cleanse = spells
        .iter()
        .any(|s| s.contains("heal") || s.contains("cleanse") || s.contains("barrier"));

    if has_smite {
        score -= 1000;
    }
    if has_teleport {
        score += 40;
    }
    if has_ignite_or_ghost {
        score += 25;
    }
    if has_heal_or_cleanse && pos != "TOP" {
        score -= 200;
    }

    // 3. Item Scoring
    let has_jungle_item = items.iter().any(|it| {
        let name = it.display_name.as_deref().unwrap_or("").to_lowercase();
        name.contains("smite")
            || name.contains("pet")
            || name.contains("seedling")
            || name.contains("emberknife")
            || name.contains("scorchclaw")
    });

    let has_support_item = items.iter().any(|it| {
        let name = it.display_name.as_deref().unwrap_or("").to_lowercase();
        name.contains("atlas")
            || name.contains("world")
            || name.contains("relic")
            || name.contains("spellthief")
            || name.contains("sickle")
            || name.contains("shoulderguards")
    });

    let has_dorans = items.iter().any(|it| {
        let name = it.display_name.as_deref().unwrap_or("").to_lowercase();
        name.contains("doran")
    });

    if has_jungle_item {
        score -= 1000;
    }
    if has_support_item {
        score -= 1000;
    }
    if has_dorans {
        score += 20;
    }

    // 4. Catalog Check
    if TOP_LANER_CATALOG.contains(champ_name) {
        score += 30;
    }

    score
}

/// Detects the lane opponent from full allgamedata payload
pub fn detect_lane_opponent(all_game_data: &AllGameData) -> LaneOpponentDetection {
    let all_players = match &all_game_data.all_players {
        Some(players) if !players.is_empty() => players,
        _ => {
            return LaneOpponentDetection {
                detected: false,
                opponent_champion: None,
                confidence: 0,
                top_candidate_score: 0,
                candidates: Vec::new(),
                is_manual_override: false,
            };
        }
    };

    let active_player_name = all_game_data
        .active_player
        .as_ref()
        .and_then(|ap| ap.summoner_name.as_deref());

    // Find active player's team (ORDER or CHAOS)
    let mut my_team_name = None;
    for p in all_players {
        let s_name = p.summoner_name.as_deref();
        let c_name = p.champion_name.as_deref();
        if (active_player_name.is_some() && s_name == active_player_name)
            || (c_name == Some("Renekton"))
        {
            my_team_name = p.team.as_deref();
            break;
        }
    }

    if my_team_name.is_none() {
        my_team_name = all_players.first().and_then(|p| p.team.as_deref());
    }

    // Filter enemies
    let enemies: Vec<&Player> = all_players
        .iter()
        .filter(|p| {
            if let Some(my_team) = my_team_name {
                p.team.as_deref() != Some(my_team)
            } else {
                true
            }
        })
        .collect();

    if enemies.is_empty() {
        return LaneOpponentDetection {
            detected: false,
            opponent_champion: None,
            confidence: 0,
            top_candidate_score: 0,
            candidates: Vec::new(),
            is_manual_override: false,
        };
    }

    // Special case: Single enemy in match (Practice Tool, 1v1, Custom Game against 1 bot)
    if enemies.len() == 1 {
        let single_enemy = enemies[0];
        let champ_name = single_enemy.champion_name.clone().unwrap_or_else(|| "Warwick".to_string());
        let candidate = ScoredCandidate {
            champion_name: champ_name.clone(),
            position: single_enemy.position.clone(),
            score: 1000,
            player_data: single_enemy.clone(),
        };

        return LaneOpponentDetection {
            detected: true,
            opponent_champion: Some(champ_name),
            confidence: 100,
            top_candidate_score: 1000,
            candidates: vec![candidate],
            is_manual_override: false,
        };
    }

    // Score all enemies for standard matches
    let mut scored_enemies: Vec<ScoredCandidate> = enemies
        .into_iter()
        .map(|p| {
            let score = calculate_opponent_score(p);
            ScoredCandidate {
                champion_name: p.champion_name.clone().unwrap_or_default(),
                position: p.position.clone(),
                score,
                player_data: p.clone(),
            }
        })
        .collect();

    scored_enemies.sort_by(|a, b| b.score.cmp(&a.score));

    let top_candidate = &scored_enemies[0];
    let raw_conf = ((top_candidate.score + 500) as f64 / 7.0).round() as i32;
    let confidence = raw_conf.clamp(30, 100) as u32;

    let candidate_name = if !top_candidate.champion_name.is_empty() {
        Some(top_candidate.champion_name.clone())
    } else {
        None
    };

    LaneOpponentDetection {
        detected: candidate_name.is_some(),
        opponent_champion: candidate_name,
        confidence,
        top_candidate_score: top_candidate.score,
        candidates: scored_enemies,
        is_manual_override: false,
    }
}

/// Supports manual lane swap override
pub fn manual_lane_swap(
    current: &LaneOpponentDetection,
    new_champion_name: &str,
) -> LaneOpponentDetection {
    LaneOpponentDetection {
        detected: true,
        opponent_champion: Some(new_champion_name.to_string()),
        confidence: 100,
        top_candidate_score: current.top_candidate_score,
        candidates: current.candidates.clone(),
        is_manual_override: true,
    }
}
