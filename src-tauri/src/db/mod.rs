pub mod models;
pub mod queries;

use rusqlite::{Connection, Result};
use std::path::Path;

pub const EMBEDDED_SCHEMA: &str = include_str!("schema.sql");
pub const EMBEDDED_SEED: &str = include_str!("seed.sql");

pub fn init_db<P: AsRef<Path>>(db_path: P) -> Result<Connection> {
    let exists = db_path.as_ref().exists();
    let conn = Connection::open(db_path)?;

    conn.execute_batch("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;")?;

    if !exists {
        conn.execute_batch(EMBEDDED_SCHEMA)?;
        conn.execute_batch(EMBEDDED_SEED)?;
    }

    Ok(conn)
}

pub fn init_in_memory_db() -> Result<Connection> {
    let conn = Connection::open_in_memory()?;
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;
    conn.execute_batch(EMBEDDED_SCHEMA)?;
    conn.execute_batch(EMBEDDED_SEED)?;
    Ok(conn)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_in_memory_db_clean_seed() {
        let conn = init_in_memory_db().expect("Failed to initialize in-memory database from embedded seed");

        let champ_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM champions", [], |row| row.get(0))
            .expect("Failed to count champions");
        assert_eq!(champ_count, 170);

        let matchup_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM matchups", [], |row| row.get(0))
            .expect("Failed to count matchups");
        assert_eq!(matchup_count, 170);

        let tips_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM matchup_tips", [], |row| row.get(0))
            .expect("Failed to count tips");
        assert_eq!(tips_count, 1698);

        let guides_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM guide_sections", [], |row| row.get(0))
            .expect("Failed to count guide sections");
        assert_eq!(guides_count, 55);

        // Explicitly verify Matchup 88 (Nasus)
        let nasus_starting_items: String = conn
            .query_row(
                "SELECT starting_items FROM matchups WHERE id = 88",
                [],
                |row| row.get(0),
            )
            .expect("Failed to get Nasus matchup starting items");
        assert_eq!(nasus_starting_items, "Doran's Blade / Doran's Shield");

        let nasus_tips: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM matchup_tips WHERE matchup_id = 88",
                [],
                |row| row.get(0),
            )
            .expect("Failed to count Nasus tips");
        assert_eq!(nasus_tips, 10);
    }
}

