use std::fs;
use std::path::{Path, PathBuf};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use regex::Regex;

use super::types::{
    ChampSelectDraftSummary, ChampSelectSession, LockfileInfo, RevealedPick, StandardGamePhase,
};

/// Parses a raw lockfile string: "LeagueClient:PID:PORT:AUTH_TOKEN:PROTOCOL"
pub fn parse_lockfile(content: &str) -> Result<LockfileInfo, String> {
    if content.trim().is_empty() {
        return Err("Invalid lockfile: content must be a non-empty string".to_string());
    }

    let parts: Vec<&str> = content.trim().split(':').collect();
    if parts.len() < 5 {
        return Err(format!(
            "Invalid lockfile format: expected 5 colon-separated fields, got {}",
            parts.len()
        ));
    }

    let process_name = parts[0].to_string();
    let pid = parts[1]
        .parse::<u32>()
        .map_err(|_| format!("Invalid PID in lockfile: \"{}\"", parts[1]))?;
    if pid == 0 {
        return Err(format!("Invalid PID in lockfile: \"{}\"", parts[1]));
    }

    let port = parts[2]
        .parse::<u16>()
        .map_err(|_| format!("Invalid Port in lockfile: \"{}\"", parts[2]))?;
    if port == 0 {
        return Err(format!("Invalid Port in lockfile: \"{}\"", parts[2]));
    }

    let auth_token = parts[3].to_string();
    if auth_token.is_empty() {
        return Err("Empty AuthToken in lockfile".to_string());
    }

    let protocol = if parts[4].is_empty() {
        "https".to_string()
    } else {
        parts[4].to_string()
    };

    Ok(LockfileInfo {
        process_name,
        pid,
        port,
        auth_token,
        protocol,
    })
}

/// Generates HTTP Basic Auth header value for LCU API
pub fn generate_basic_auth_header(auth_token: &str) -> String {
    let credentials = format!("riot:{}", auth_token);
    let base64_encoded = STANDARD.encode(credentials.as_bytes());
    format!("Basic {}", base64_encoded)
}

/// Parses process command line arguments (e.g. LeagueClientUx.exe --app-port=52341 --remoting-auth-token=AbC)
pub fn parse_command_line(command_line: &str) -> Option<LockfileInfo> {
    if command_line.trim().is_empty() {
        return None;
    }

    let port_re = Regex::new(r"--app-port=(\d+)").ok()?;
    let token_re = Regex::new(r#"--remoting-auth-token=([^\s"']+)"#).ok()?;
    let pid_re = Regex::new(r"--app-pid=(\d+)").ok()?;

    let port_cap = port_re.captures(command_line)?;
    let token_cap = token_re.captures(command_line)?;

    let port = port_cap.get(1)?.as_str().parse::<u16>().ok()?;
    let auth_token = token_cap.get(1)?.as_str().to_string();
    let pid = pid_re
        .captures(command_line)
        .and_then(|cap| cap.get(1)?.as_str().parse::<u32>().ok())
        .unwrap_or(0);

    Some(LockfileInfo {
        process_name: "LeagueClientUx".to_string(),
        pid,
        port,
        auth_token,
        protocol: "https".to_string(),
    })
}

/// Discovers the LCU lockfile across default Windows installation paths, Riot Client metadata and process inspection
pub fn discover_lockfile() -> Result<LockfileInfo, String> {
    let candidate_paths = [
        r"C:\Riot Games\League of Legends\lockfile",
        r"D:\Riot Games\League of Legends\lockfile",
        r"E:\Riot Games\League of Legends\lockfile",
        r"F:\Riot Games\League of Legends\lockfile",
        r"G:\Riot Games\League of Legends\lockfile",
        r"C:\League of Legends\lockfile",
        r"D:\League of Legends\lockfile",
        r"E:\League of Legends\lockfile",
        r"C:\Games\League of Legends\lockfile",
        r"D:\Games\League of Legends\lockfile",
    ];

    for path_str in &candidate_paths {
        let path = Path::new(path_str);
        if path.exists() {
            if let Ok(content) = fs::read_to_string(path) {
                if let Ok(info) = parse_lockfile(&content) {
                    return Ok(info);
                }
            }
        }
    }

    // Check Riot Client settings metadata
    let metadata_yaml = r"C:\ProgramData\Riot Games\Metadata\league_of_legends.live\league_of_legends.live.product_settings.yaml";
    if let Ok(content) = fs::read_to_string(metadata_yaml) {
        for line in content.lines() {
            if line.contains("product_install_full_path:") {
                if let Some(path_val) = line.split(':').nth(1) {
                    let install_dir = path_val.trim().trim_matches('"');
                    let mut lock_path = PathBuf::from(install_dir);
                    lock_path.push("lockfile");
                    if lock_path.exists() {
                        if let Ok(c) = fs::read_to_string(&lock_path) {
                            if let Ok(info) = parse_lockfile(&c) {
                                return Ok(info);
                            }
                        }
                    }
                }
            }
        }
    }

    // Check Riot Client metadata lockfile directly
    let metadata_lockfile = r"C:\ProgramData\Riot Games\Metadata\league_of_legends.live\league_of_legends.live.lockfile";
    if let Ok(content) = fs::read_to_string(metadata_lockfile) {
        if let Ok(info) = parse_lockfile(&content) {
            return Ok(info);
        }
    }

    Err("League of Legends client lockfile not found".to_string())
}

/// Converts a Riot Champion numeric ID to its canonical English display name
pub fn champion_id_to_name(id: i64) -> Option<&'static str> {
    match id {
        1 => Some("Annie"),
        2 => Some("Olaf"),
        3 => Some("Galio"),
        4 => Some("Twisted Fate"),
        5 => Some("Xin Zhao"),
        6 => Some("Urgot"),
        7 => Some("LeBlanc"),
        8 => Some("Vladimir"),
        9 => Some("Fiddlesticks"),
        10 => Some("Kayle"),
        11 => Some("Master Yi"),
        12 => Some("Alistar"),
        13 => Some("Ryze"),
        14 => Some("Sion"),
        15 => Some("Sivir"),
        16 => Some("Soraka"),
        17 => Some("Teemo"),
        18 => Some("Tristana"),
        19 => Some("Warwick"),
        20 => Some("Nunu & Willump"),
        21 => Some("Miss Fortune"),
        22 => Some("Ashe"),
        23 => Some("Tryndamere"),
        24 => Some("Jax"),
        25 => Some("Morgana"),
        26 => Some("Zilean"),
        27 => Some("Singed"),
        28 => Some("Evelynn"),
        29 => Some("Twitch"),
        30 => Some("Karthus"),
        31 => Some("Cho'Gath"),
        32 => Some("Amumu"),
        33 => Some("Rammus"),
        34 => Some("Anivia"),
        35 => Some("Shaco"),
        36 => Some("Dr. Mundo"),
        37 => Some("Sona"),
        38 => Some("Kassadin"),
        39 => Some("Irelia"),
        40 => Some("Janna"),
        41 => Some("Gangplank"),
        42 => Some("Corki"),
        43 => Some("Karma"),
        44 => Some("Taric"),
        45 => Some("Veigar"),
        48 => Some("Trundle"),
        50 => Some("Swain"),
        51 => Some("Caitlyn"),
        53 => Some("Blitzcrank"),
        54 => Some("Malphite"),
        55 => Some("Katarina"),
        56 => Some("Nocturne"),
        57 => Some("Maokai"),
        58 => Some("Renekton"),
        59 => Some("Jarvan IV"),
        60 => Some("Elise"),
        61 => Some("Orianna"),
        62 => Some("Mordekaiser"),
        63 => Some("Brand"),
        64 => Some("Lee Sin"),
        67 => Some("Vayne"),
        68 => Some("Rumble"),
        69 => Some("Cassiopeia"),
        72 => Some("Skarner"),
        74 => Some("Heimerdinger"),
        75 => Some("Nasus"),
        76 => Some("Nidalee"),
        77 => Some("Udyr"),
        78 => Some("Poppy"),
        79 => Some("Gragas"),
        80 => Some("Pantheon"),
        81 => Some("Ezreal"),
        82 => Some("Mordekaiser"),
        83 => Some("Yorick"),
        84 => Some("Akali"),
        85 => Some("Kennen"),
        86 => Some("Garen"),
        89 => Some("Leona"),
        90 => Some("Malzahar"),
        91 => Some("Talon"),
        92 => Some("Riven"),
        96 => Some("Kog'Maw"),
        98 => Some("Shen"),
        99 => Some("Lux"),
        101 => Some("Xerath"),
        102 => Some("Shyvana"),
        103 => Some("Ahri"),
        104 => Some("Graves"),
        105 => Some("Fizz"),
        106 => Some("Volibear"),
        107 => Some("Rengar"),
        110 => Some("Varus"),
        111 => Some("Nautilus"),
        112 => Some("Viktor"),
        113 => Some("Sejuani"),
        114 => Some("Fiora"),
        115 => Some("Ziggs"),
        117 => Some("Lulu"),
        119 => Some("Draven"),
        120 => Some("Hecarim"),
        121 => Some("Kha'Zix"),
        122 => Some("Darius"),
        126 => Some("Jayce"),
        127 => Some("Lissandra"),
        131 => Some("Diana"),
        133 => Some("Quinn"),
        134 => Some("Syndra"),
        136 => Some("Aurelion Sol"),
        141 => Some("Kayn"),
        142 => Some("Zoe"),
        143 => Some("Zyra"),
        145 => Some("Kai'Sa"),
        147 => Some("Seraphine"),
        150 => Some("Gnar"),
        154 => Some("Zac"),
        157 => Some("Yasuo"),
        161 => Some("Vel'Koz"),
        163 => Some("Taliyah"),
        164 => Some("Camille"),
        166 => Some("Akshan"),
        200 => Some("Bel'Veth"),
        201 => Some("Braum"),
        202 => Some("Jhin"),
        203 => Some("Kindred"),
        221 => Some("Zeri"),
        222 => Some("Jinx"),
        223 => Some("Tahm Kench"),
        233 => Some("Briar"),
        234 => Some("Viego"),
        235 => Some("Senna"),
        236 => Some("Lucian"),
        238 => Some("Zed"),
        240 => Some("Kled"),
        245 => Some("Ekko"),
        246 => Some("Qiyana"),
        254 => Some("Vi"),
        266 => Some("Aatrox"),
        267 => Some("Nami"),
        268 => Some("Azir"),
        350 => Some("Yuumi"),
        360 => Some("Samira"),
        412 => Some("Thresh"),
        420 => Some("Illaoi"),
        421 => Some("Rek'Sai"),
        427 => Some("Ivern"),
        429 => Some("Kalista"),
        432 => Some("Bard"),
        497 => Some("Rakan"),
        498 => Some("Xayah"),
        516 => Some("Ornn"),
        517 => Some("Sylas"),
        518 => Some("Neeko"),
        523 => Some("Aphelios"),
        526 => Some("Rell"),
        555 => Some("Pyke"),
        711 => Some("Vex"),
        777 => Some("Yone"),
        799 => Some("Ambessa"),
        875 => Some("Sett"),
        876 => Some("Lillia"),
        887 => Some("Gwen"),
        888 => Some("Renata Glasc"),
        893 => Some("Aurora"),
        895 => Some("Naafiri"),
        897 => Some("K'Sante"),
        901 => Some("Smolder"),
        902 => Some("Milio"),
        910 => Some("Hwei"),
        950 => Some("Naafiri"),
        _ => None,
    }
}

pub fn get_champion_name_or_fallback(id: i64) -> String {
    champion_id_to_name(id)
        .map(|s| s.to_string())
        .unwrap_or_else(|| format!("Champion_{}", id))
}

/// Maps raw LCU gameflow phases to standard application state
pub fn map_gameflow_phase(phase: &str) -> StandardGamePhase {
    match phase.trim() {
        "None" | "Matchmaking" | "ReadyCheck" | "Lobby" => StandardGamePhase::Lobby,
        "ChampSelect" => StandardGamePhase::ChampSelect,
        "InProgress" | "Reconnect" => StandardGamePhase::InGame,
        "WaitingForStats" | "PreEndOfGame" | "EndOfGame" => StandardGamePhase::PostGame,
        _ => StandardGamePhase::Disconnected,
    }
}

/// Parses Champ Select draft session payload
pub fn parse_champ_select_session(session: &ChampSelectSession) -> ChampSelectDraftSummary {
    let in_champ_select = !session.my_team.is_empty() || !session.their_team.is_empty();

    let mut my_champion = None;
    let mut my_position = Some("TOP".to_string());

    for player in &session.my_team {
        if player.champion_id == 58 {
            // 58 is Renekton
            my_champion = Some("Renekton".to_string());
            if let Some(ref pos) = player.assigned_position {
                my_position = Some(pos.clone());
            }
            break;
        }
    }

    let enemy_picks: Vec<RevealedPick> = session
        .their_team
        .iter()
        .filter(|p| p.champion_id > 0)
        .map(|p| RevealedPick {
            cell_id: p.cell_id,
            champion_id: p.champion_id,
            assigned_position: p.assigned_position.clone().unwrap_or_else(|| "UNKNOWN".to_string()),
        })
        .collect();

    let ally_picks: Vec<RevealedPick> = session
        .my_team
        .iter()
        .filter(|p| p.champion_id > 0)
        .map(|p| RevealedPick {
            cell_id: p.cell_id,
            champion_id: p.champion_id,
            assigned_position: p.assigned_position.clone().unwrap_or_else(|| "UNKNOWN".to_string()),
        })
        .collect();

    let enemy_count = enemy_picks.len();
    let total_actions = session.actions.len();

    ChampSelectDraftSummary {
        in_champ_select,
        my_champion,
        my_position,
        enemy_picks,
        ally_picks,
        enemy_count,
        total_actions,
    }
}

