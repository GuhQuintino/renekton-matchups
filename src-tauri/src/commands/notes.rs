//! Tauri IPC Commands and Database Handlers for Post-Game Notes
//! Provides structured notes CRUD operations, analytics aggregation, and validation.

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UserNoteRecord {
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
pub struct NewNoteInput {
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
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateNoteInput {
    pub match_result: Option<String>,
    pub perceived_difficulty: Option<i64>,
    pub what_worked: Option<String>,
    pub what_failed: Option<String>,
    pub free_notes: Option<String>,
    pub runes_used: Option<String>,
    pub items_built: Option<String>,
    pub summoners_used: Option<String>,
    pub kda: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotesSummary {
    pub champion_id: i64,
    pub champion_name: String,
    pub total_matches: i64,
    pub wins: i64,
    pub losses: i64,
    pub remakes: i64,
    pub winrate_percent: f64,
    pub avg_difficulty: f64,
    pub recent_notes: Vec<UserNoteRecord>,
}

/// Normalizes match result to uppercase (WIN, LOSS, REMAKE) and validates
pub fn validate_and_normalize_result(result_str: &str) -> Result<String, String> {
    let normalized = result_str.trim().to_uppercase();
    match normalized.as_str() {
        "WIN" | "LOSS" | "REMAKE" => Ok(normalized),
        _ => Err(format!(
            "Invalid match_result: '{}'. Must be WIN, LOSS, or REMAKE.",
            result_str
        )),
    }
}

/// Validates perceived difficulty rating (1 to 5)
pub fn validate_difficulty(rating: i64) -> Result<i64, String> {
    if (1..=5).contains(&rating) {
        Ok(rating)
    } else {
        Err(format!(
            "Invalid perceived_difficulty: {}. Must be an integer between 1 and 5.",
            rating
        ))
    }
}

/// Creates a new user note record in SQLite
pub fn create_note_handler(conn: &Connection, input: &NewNoteInput) -> Result<UserNoteRecord, String> {
    let normalized_result = validate_and_normalize_result(&input.match_result)?;
    let valid_difficulty = validate_difficulty(input.perceived_difficulty)?;

    // Check if champion exists
    let champ_exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM champions WHERE id = ?1)",
            params![input.champion_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Database error verifying champion: {}", e))?;

    if !champ_exists {
        return Err(format!("Champion with id {} not found", input.champion_id));
    }

    let what_worked = input.what_worked.as_deref().unwrap_or("");
    let what_failed = input.what_failed.as_deref().unwrap_or("");
    let free_notes = input.free_notes.as_deref().unwrap_or("");

    if let Some(ref custom_created_at) = input.created_at {
        conn.execute(
            "INSERT INTO user_notes (
                champion_id, game_id, match_result, perceived_difficulty,
                what_worked, what_failed, free_notes, runes_used, items_built, summoners_used, kda,
                created_at, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?12)",
            params![
                input.champion_id,
                input.game_id,
                normalized_result,
                valid_difficulty,
                what_worked,
                what_failed,
                free_notes,
                input.runes_used,
                input.items_built,
                input.summoners_used,
                input.kda,
                custom_created_at
            ],
        )
        .map_err(|e| format!("Failed to insert note: {}", e))?;
    } else {
        conn.execute(
            "INSERT INTO user_notes (
                champion_id, game_id, match_result, perceived_difficulty,
                what_worked, what_failed, free_notes, runes_used, items_built, summoners_used, kda
             ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                input.champion_id,
                input.game_id,
                normalized_result,
                valid_difficulty,
                what_worked,
                what_failed,
                free_notes,
                input.runes_used,
                input.items_built,
                input.summoners_used,
                input.kda
            ],
        )
        .map_err(|e| format!("Failed to insert note: {}", e))?;
    }

    let last_id = conn.last_insert_rowid();

    get_note_by_id_handler(conn, last_id)?
        .ok_or_else(|| "Failed to retrieve newly created note".to_string())
}

/// Retrieves a specific note by ID
pub fn get_note_by_id_handler(conn: &Connection, note_id: i64) -> Result<Option<UserNoteRecord>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT n.id, n.champion_id, c.name, n.game_id, n.match_result, n.perceived_difficulty,
                    n.what_worked, n.what_failed, n.free_notes, n.runes_used, n.items_built, n.summoners_used,
                    n.kda, n.created_at, n.updated_at
             FROM user_notes n
             LEFT JOIN champions c ON n.champion_id = c.id
             WHERE n.id = ?1",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let mut rows = stmt
        .query(params![note_id])
        .map_err(|e| format!("Query error: {}", e))?;

    if let Some(row) = rows.next().map_err(|e| format!("Row error: {}", e))? {
        Ok(Some(UserNoteRecord {
            id: row.get(0).map_err(|e| e.to_string())?,
            champion_id: row.get(1).map_err(|e| e.to_string())?,
            champion_name: row.get(2).unwrap_or(None),
            game_id: row.get(3).unwrap_or(None),
            match_result: row.get(4).map_err(|e| e.to_string())?,
            perceived_difficulty: row.get(5).map_err(|e| e.to_string())?,
            what_worked: row.get(6).unwrap_or(None),
            what_failed: row.get(7).unwrap_or(None),
            free_notes: row.get(8).unwrap_or(None),
            runes_used: row.get(9).unwrap_or(None),
            items_built: row.get(10).unwrap_or(None),
            summoners_used: row.get(11).unwrap_or(None),
            kda: row.get(12).unwrap_or(None),
            created_at: row.get(13).unwrap_or(None),
            updated_at: row.get(14).unwrap_or(None),
        }))
    } else {
        Ok(None)
    }
}

/// Retrieves all notes for a specific champion (ordered newest first)
pub fn get_notes_by_champion_id_handler(
    conn: &Connection,
    champion_id: i64,
) -> Result<Vec<UserNoteRecord>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT n.id, n.champion_id, c.name, n.game_id, n.match_result, n.perceived_difficulty,
                    n.what_worked, n.what_failed, n.free_notes, n.runes_used, n.items_built, n.summoners_used,
                    n.kda, n.created_at, n.updated_at
             FROM user_notes n
             JOIN champions c ON n.champion_id = c.id
             WHERE n.champion_id = ?1
             ORDER BY datetime(n.created_at) DESC, n.id DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let rows = stmt
        .query_map(params![champion_id], |row| {
            Ok(UserNoteRecord {
                id: row.get(0)?,
                champion_id: row.get(1)?,
                champion_name: row.get(2)?,
                game_id: row.get(3)?,
                match_result: row.get(4)?,
                perceived_difficulty: row.get(5)?,
                what_worked: row.get(6)?,
                what_failed: row.get(7)?,
                free_notes: row.get(8)?,
                runes_used: row.get(9)?,
                items_built: row.get(10)?,
                summoners_used: row.get(11)?,
                kda: row.get(12)?,
                created_at: row.get(13)?,
                updated_at: row.get(14)?,
            })
        })
        .map_err(|e| format!("Query map error: {}", e))?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r.map_err(|e| format!("Row mapping error: {}", e))?);
    }
    Ok(list)
}

/// Retrieves all notes for a champion identified by name or alias
pub fn get_notes_by_champion_name_handler(
    conn: &Connection,
    champion_name: &str,
) -> Result<Vec<UserNoteRecord>, String> {
    let clean_name = champion_name.trim().to_lowercase();
    let mut stmt = conn
        .prepare(
            "SELECT n.id, n.champion_id, c.name, n.game_id, n.match_result, n.perceived_difficulty,
                    n.what_worked, n.what_failed, n.free_notes, n.runes_used, n.items_built, n.summoners_used,
                    n.kda, n.created_at, n.updated_at
             FROM user_notes n
             JOIN champions c ON n.champion_id = c.id
             WHERE LOWER(c.name) = ?1 OR LOWER(c.sheet_name) = ?1 OR LOWER(c.riot_key) = ?1
             ORDER BY datetime(n.created_at) DESC, n.id DESC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let rows = stmt
        .query_map(params![clean_name], |row| {
            Ok(UserNoteRecord {
                id: row.get(0)?,
                champion_id: row.get(1)?,
                champion_name: row.get(2)?,
                game_id: row.get(3)?,
                match_result: row.get(4)?,
                perceived_difficulty: row.get(5)?,
                what_worked: row.get(6)?,
                what_failed: row.get(7)?,
                free_notes: row.get(8)?,
                runes_used: row.get(9)?,
                items_built: row.get(10)?,
                summoners_used: row.get(11)?,
                kda: row.get(12)?,
                created_at: row.get(13)?,
                updated_at: row.get(14)?,
            })
        })
        .map_err(|e| format!("Query map error: {}", e))?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r.map_err(|e| format!("Row mapping error: {}", e))?);
    }
    Ok(list)
}

/// Updates an existing note by ID
pub fn update_note_handler(
    conn: &Connection,
    note_id: i64,
    updates: &UpdateNoteInput,
) -> Result<UserNoteRecord, String> {
    // Check note existence
    let existing = get_note_by_id_handler(conn, note_id)?
        .ok_or_else(|| format!("Note with id {} not found", note_id))?;

    let new_result = if let Some(ref res) = updates.match_result {
        validate_and_normalize_result(res)?
    } else {
        existing.match_result
    };

    let new_diff = if let Some(diff) = updates.perceived_difficulty {
        validate_difficulty(diff)?
    } else {
        existing.perceived_difficulty
    };

    let new_worked = updates.what_worked.clone().or(existing.what_worked);
    let new_failed = updates.what_failed.clone().or(existing.what_failed);
    let new_notes = updates.free_notes.clone().or(existing.free_notes);
    let new_runes = updates.runes_used.clone().or(existing.runes_used);
    let new_items = updates.items_built.clone().or(existing.items_built);
    let new_summoners = updates.summoners_used.clone().or(existing.summoners_used);
    let new_kda = updates.kda.clone().or(existing.kda);

    conn.execute(
        "UPDATE user_notes SET
            match_result = ?1,
            perceived_difficulty = ?2,
            what_worked = ?3,
            what_failed = ?4,
            free_notes = ?5,
            runes_used = ?6,
            items_built = ?7,
            summoners_used = ?8,
            kda = ?9,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?10",
        params![
            new_result,
            new_diff,
            new_worked,
            new_failed,
            new_notes,
            new_runes,
            new_items,
            new_summoners,
            new_kda,
            note_id
        ],
    )
    .map_err(|e| format!("Failed to update note: {}", e))?;

    get_note_by_id_handler(conn, note_id)?
        .ok_or_else(|| format!("Failed to retrieve updated note {}", note_id))
}

/// Deletes a note by ID
pub fn delete_note_handler(conn: &Connection, note_id: i64) -> Result<bool, String> {
    let rows_affected = conn
        .execute("DELETE FROM user_notes WHERE id = ?1", params![note_id])
        .map_err(|e| format!("Failed to delete note: {}", e))?;

    if rows_affected == 0 {
        Err(format!("Note with id {} not found", note_id))
    } else {
        Ok(true)
    }
}

/// Computes performance summary and analytics for a champion
pub fn get_notes_summary_handler(
    conn: &Connection,
    champion_id: i64,
) -> Result<NotesSummary, String> {
    let champ_name: String = conn
        .query_row(
            "SELECT name FROM champions WHERE id = ?1",
            params![champion_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Champion with id {} not found: {}", champion_id, e))?;

    let notes = get_notes_by_champion_id_handler(conn, champion_id)?;

    if notes.is_empty() {
        return Ok(NotesSummary {
            champion_id,
            champion_name: champ_name,
            total_matches: 0,
            wins: 0,
            losses: 0,
            remakes: 0,
            winrate_percent: 0.0,
            avg_difficulty: 0.0,
            recent_notes: Vec::new(),
        });
    }

    let mut wins = 0;
    let mut losses = 0;
    let mut remakes = 0;
    let mut sum_difficulty = 0;

    for n in &notes {
        match n.match_result.to_uppercase().as_str() {
            "WIN" => wins += 1,
            "LOSS" => losses += 1,
            "REMAKE" => remakes += 1,
            _ => {}
        }
        sum_difficulty += n.perceived_difficulty;
    }

    let total = notes.len() as i64;
    let decisive = wins + losses;
    let winrate_percent = if decisive > 0 {
        ((wins as f64 / decisive as f64) * 1000.0).round() / 10.0
    } else {
        0.0
    };

    let avg_difficulty = ((sum_difficulty as f64 / total as f64) * 10.0).round() / 10.0;

    Ok(NotesSummary {
        champion_id,
        champion_name: champ_name,
        total_matches: total,
        wins,
        losses,
        remakes,
        winrate_percent,
        avg_difficulty,
        recent_notes: notes,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_test_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("
            CREATE TABLE champions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                sheet_name TEXT NOT NULL,
                riot_key TEXT NOT NULL,
                icon_url TEXT
            );
            CREATE TABLE user_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                champion_id INTEGER NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
                game_id TEXT,
                match_result TEXT NOT NULL CHECK(match_result IN ('WIN', 'LOSS', 'REMAKE', 'win', 'loss', 'remake')),
                perceived_difficulty INTEGER NOT NULL CHECK(perceived_difficulty BETWEEN 1 AND 5),
                what_worked TEXT,
                what_failed TEXT,
                free_notes TEXT,
                runes_used TEXT,
                items_built TEXT,
                summoners_used TEXT,
                kda TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            INSERT INTO champions (id, name, sheet_name, riot_key) VALUES (1, 'Aatrox', 'Aatrox', 'Aatrox');
            INSERT INTO champions (id, name, sheet_name, riot_key) VALUES (2, 'Darius', 'Darius', 'Darius');
        ").unwrap();
        conn
    }

    #[test]
    fn test_create_and_read_note() {
        let conn = setup_test_db();
        let input = NewNoteInput {
            champion_id: 1,
            champion_name: Some("Aatrox".into()),
            game_id: Some("GAME-101".into()),
            match_result: "win".into(),
            perceived_difficulty: 3,
            what_worked: Some("Short trades with E-W".into()),
            what_failed: Some("Greeded for tower".into()),
            free_notes: Some("Rush Executioner's".into()),
            runes_used: Some("PTA".into()),
            items_built: Some("Eclipse, Steelcaps".into()),
            summoners_used: Some("Flash, Ignite".into()),
            kda: Some("7/2/5".into()),
            created_at: None,
        };

        let note = create_note_handler(&conn, &input).unwrap();
        assert_eq!(note.match_result, "WIN");
        assert_eq!(note.perceived_difficulty, 3);
        assert_eq!(note.what_worked.as_deref(), Some("Short trades with E-W"));

        let notes = get_notes_by_champion_id_handler(&conn, 1).unwrap();
        assert_eq!(notes.len(), 1);
        assert_eq!(notes[0].id, note.id);
    }

    #[test]
    fn test_validation_errors() {
        let conn = setup_test_db();
        let invalid_res = NewNoteInput {
            champion_id: 1,
            champion_name: None,
            game_id: None,
            match_result: "INVALID".into(),
            perceived_difficulty: 3,
            what_worked: None,
            what_failed: None,
            free_notes: None,
            runes_used: None,
            items_built: None,
            summoners_used: None,
            kda: None,
            created_at: None,
        };
        assert!(create_note_handler(&conn, &invalid_res).is_err());

        let invalid_diff = NewNoteInput {
            champion_id: 1,
            champion_name: None,
            game_id: None,
            match_result: "WIN".into(),
            perceived_difficulty: 10,
            what_worked: None,
            what_failed: None,
            free_notes: None,
            runes_used: None,
            items_built: None,
            summoners_used: None,
            kda: None,
            created_at: None,
        };
        assert!(create_note_handler(&conn, &invalid_diff).is_err());
    }

    #[test]
    fn test_summary_calculation() {
        let conn = setup_test_db();
        for (res, diff) in [("WIN", 2), ("WIN", 4), ("LOSS", 4), ("REMAKE", 1)] {
            create_note_handler(&conn, &NewNoteInput {
                champion_id: 2,
                champion_name: None,
                game_id: None,
                match_result: res.into(),
                perceived_difficulty: diff,
                what_worked: None,
                what_failed: None,
                free_notes: None,
                runes_used: None,
                items_built: None,
                summoners_used: None,
                kda: None,
                created_at: None,
            }).unwrap();
        }

        let summary = get_notes_summary_handler(&conn, 2).unwrap();
        assert_eq!(summary.total_matches, 4);
        assert_eq!(summary.wins, 2);
        assert_eq!(summary.losses, 1);
        assert_eq!(summary.remakes, 1);
        assert_eq!(summary.winrate_percent, 66.7);
        assert_eq!(summary.avg_difficulty, 2.8);
    }
}
