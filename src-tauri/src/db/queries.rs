use rusqlite::{params, Connection, Result};
use crate::db::models::*;

pub fn get_champion_by_name(conn: &Connection, name: &str) -> Result<Option<Champion>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, sheet_name, riot_key, riot_id, title_pt, title_en, roles_json, icon_url, created_at
         FROM champions
         WHERE LOWER(name) = LOWER(?1) OR LOWER(sheet_name) = LOWER(?1) OR LOWER(riot_key) = LOWER(?1)
         LIMIT 1"
    )?;

    let mut rows = stmt.query(params![name])?;
    if let Some(row) = rows.next()? {
        Ok(Some(Champion {
            id: row.get(0)?,
            name: row.get(1)?,
            sheet_name: row.get(2)?,
            riot_key: row.get(3)?,
            riot_id: row.get(4)?,
            title_pt: row.get(5)?,
            title_en: row.get(6)?,
            roles_json: row.get(7)?,
            icon_url: row.get(8)?,
            created_at: row.get(9)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn get_all_matchups_summary(conn: &Connection) -> Result<Vec<MatchupSummary>> {
    let mut stmt = conn.prepare(
        "SELECT m.id, m.champion_id, c.name, c.sheet_name, c.riot_key,
                m.difficulty_tier, m.difficulty_rating, m.difficulty_raw,
                m.runes_recommendation, m.starting_items, m.summoner_spells,
                m.ability_max_order, c.icon_url,
                CASE WHEN m.video_url IS NOT NULL AND m.video_url != '' THEN 1 ELSE 0 END as has_video
         FROM matchups m
         JOIN champions c ON m.champion_id = c.id
         ORDER BY c.name ASC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(MatchupSummary {
            id: row.get(0)?,
            champion_id: row.get(1)?,
            champion_name: row.get(2)?,
            sheet_name: row.get(3)?,
            riot_key: row.get(4)?,
            difficulty_tier: row.get(5)?,
            difficulty_rating: row.get(6)?,
            difficulty_raw: row.get(7)?,
            runes_recommendation: row.get(8)?,
            starting_items: row.get(9)?,
            summoner_spells: row.get(10)?,
            ability_max_order: row.get(11)?,
            icon_url: row.get(12)?,
            has_video: row.get::<_, i64>(13)? == 1,
        })
    })?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r?);
    }
    Ok(list)
}

pub fn get_matchup_by_champion(conn: &Connection, champ_identifier: &str) -> Result<Option<MatchupDetail>> {
    let mut stmt = conn.prepare(
        "SELECT m.id, m.champion_id, c.name, c.sheet_name, c.riot_key,
                m.difficulty_tier, m.difficulty_rating, m.difficulty_raw,
                m.runes_recommendation, m.starting_items, m.summoner_spells,
                m.ability_max_order, m.summary_en, m.summary_pt,
                m.detailed_notes_raw_en, m.detailed_notes_raw_pt,
                m.video_url, c.icon_url
         FROM matchups m
         JOIN champions c ON m.champion_id = c.id
         WHERE LOWER(c.name) = LOWER(?1) OR LOWER(c.sheet_name) = LOWER(?1) OR LOWER(c.riot_key) = LOWER(?1)
         LIMIT 1"
    )?;

    let mut rows = stmt.query(params![champ_identifier])?;
    if let Some(row) = rows.next()? {
        let matchup_id: i64 = row.get(0)?;

        // Fetch structured tips
        let mut tip_stmt = conn.prepare(
            "SELECT id, matchup_id, tip_number, title_en, title_pt, content_en, content_pt, category, display_order
             FROM matchup_tips
             WHERE matchup_id = ?1
             ORDER BY display_order ASC"
        )?;

        let tip_rows = tip_stmt.query_map(params![matchup_id], |t_row| {
            Ok(MatchupTip {
                id: t_row.get(0)?,
                matchup_id: t_row.get(1)?,
                tip_number: t_row.get(2)?,
                title_en: t_row.get(3)?,
                title_pt: t_row.get(4)?,
                content_en: t_row.get(5)?,
                content_pt: t_row.get(6)?,
                category: t_row.get(7)?,
                display_order: t_row.get(8)?,
            })
        })?;

        let mut tips = Vec::new();
        for t in tip_rows {
            tips.push(t?);
        }

        Ok(Some(MatchupDetail {
            id: matchup_id,
            champion_id: row.get(1)?,
            champion_name: row.get(2)?,
            sheet_name: row.get(3)?,
            riot_key: row.get(4)?,
            difficulty_tier: row.get(5)?,
            difficulty_rating: row.get(6)?,
            difficulty_raw: row.get(7)?,
            runes_recommendation: row.get(8)?,
            starting_items: row.get(9)?,
            summoner_spells: row.get(10)?,
            ability_max_order: row.get(11)?,
            summary_en: row.get(12)?,
            summary_pt: row.get(13)?,
            detailed_notes_raw_en: row.get(14)?,
            detailed_notes_raw_pt: row.get(15)?,
            video_url: row.get(16)?,
            icon_url: row.get(17)?,
            tips,
        }))
    } else {
        Ok(None)
    }
}

pub fn get_general_guide(conn: &Connection, category_name: &str) -> Result<Option<GuideContent>> {
    let mut stmt = conn.prepare(
        "SELECT id, category, section_key, display_order, title_en, title_pt,
                subtitle_en, subtitle_pt, content_en, content_pt, video_url, metadata_json
         FROM guide_sections
         WHERE LOWER(category) = LOWER(?1)
         ORDER BY display_order ASC"
    )?;

    let rows = stmt.query_map(params![category_name], |row| {
        Ok(GuideSection {
            id: row.get(0)?,
            category: row.get(1)?,
            section_key: row.get(2)?,
            display_order: row.get(3)?,
            title_en: row.get(4)?,
            title_pt: row.get(5)?,
            subtitle_en: row.get(6)?,
            subtitle_pt: row.get(7)?,
            content_en: row.get(8)?,
            content_pt: row.get(9)?,
            video_url: row.get(10)?,
            metadata_json: row.get(11)?,
        })
    })?;

    let mut sections = Vec::new();
    for r in rows {
        sections.push(r?);
    }

    if sections.is_empty() {
        Ok(None)
    } else {
        let first_title_en = sections[0].title_en.clone();
        let first_title_pt = sections[0].title_pt.clone();
        let first_video = sections[0].video_url.clone();

        Ok(Some(GuideContent {
            category: category_name.to_string(),
            title_en: first_title_en,
            title_pt: first_title_pt,
            description_en: "".to_string(),
            description_pt: "".to_string(),
            video_url: first_video,
            sections,
        }))
    }
}

pub fn create_user_note(conn: &Connection, note: &NewNotePayload) -> Result<UserNote> {
    conn.execute(
        "INSERT INTO user_notes (
            champion_id, game_id, match_result, perceived_difficulty,
            what_worked, what_failed, free_notes, runes_used, items_built, summoners_used, kda
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            note.champion_id,
            note.game_id,
            note.match_result,
            note.perceived_difficulty,
            note.what_worked,
            note.what_failed,
            note.free_notes,
            note.runes_used,
            note.items_built,
            note.summoners_used,
            note.kda
        ],
    )?;

    let last_id = conn.last_insert_rowid();

    let mut stmt = conn.prepare(
        "SELECT n.id, n.champion_id, c.name, n.game_id, n.match_result, n.perceived_difficulty,
                n.what_worked, n.what_failed, n.free_notes, n.runes_used, n.items_built, n.summoners_used,
                n.kda, n.created_at, n.updated_at
         FROM user_notes n
         LEFT JOIN champions c ON n.champion_id = c.id
         WHERE n.id = ?1"
    )?;

    stmt.query_row(params![last_id], |row| {
        Ok(UserNote {
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
}

pub fn get_notes_by_champion(conn: &Connection, champ_name: &str) -> Result<Vec<UserNote>> {
    let mut stmt = conn.prepare(
        "SELECT n.id, n.champion_id, c.name, n.game_id, n.match_result, n.perceived_difficulty,
                n.what_worked, n.what_failed, n.free_notes, n.runes_used, n.items_built, n.summoners_used,
                n.kda, n.created_at, n.updated_at
         FROM user_notes n
         JOIN champions c ON n.champion_id = c.id
         WHERE LOWER(c.name) = LOWER(?1) OR LOWER(c.sheet_name) = LOWER(?1) OR LOWER(c.riot_key) = LOWER(?1)
         ORDER BY n.created_at DESC"
    )?;

    let rows = stmt.query_map(params![champ_name], |row| {
        Ok(UserNote {
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
    })?;

    let mut notes = Vec::new();
    for r in rows {
        notes.push(r?);
    }
    Ok(notes)
}

pub fn delete_user_note(conn: &Connection, note_id: i64) -> Result<bool> {
    let count = conn.execute("DELETE FROM user_notes WHERE id = ?1", params![note_id])?;
    Ok(count > 0)
}
