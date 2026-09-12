// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::Manager;

use champion_matchup::commands::{
    create_note_handler, delete_note_handler, get_note_by_id_handler,
    get_notes_by_champion_id_handler, get_notes_by_champion_name_handler,
    get_notes_summary_handler, update_note_handler, GameStateManager,
    NewNoteInput, NotesSummary, UpdateNoteInput, UserNoteRecord,
};
use champion_matchup::db::{self, models::*};
use champion_matchup::simulator::GameStateEvent;

/// Shared application state managed by Tauri
struct AppState {
    db_conn: Mutex<rusqlite::Connection>,
    game_state: GameStateManager,
}

// ─────────────────────────────── Game State Commands ───────────────────────────────

#[tauri::command]
async fn get_game_state(state: tauri::State<'_, AppState>) -> Result<GameStateEvent, String> {
    Ok(state.game_state.get_current_game_state().await)
}

#[tauri::command]
fn set_simulation_scenario(
    state: tauri::State<'_, AppState>,
    scenario: String,
    payload: Option<serde_json::Value>,
) -> Result<GameStateEvent, String> {
    state.game_state.set_simulation_scenario(&scenario, payload)
}

#[tauri::command]
fn set_simulation_state(
    state: tauri::State<'_, AppState>,
    scenario: String,
    payload: Option<serde_json::Value>,
) -> Result<(), String> {
    state.game_state.set_simulation_scenario(&scenario, payload)?;
    Ok(())
}

#[tauri::command]
fn manual_override_opponent(
    state: tauri::State<'_, AppState>,
    champion_name: String,
) -> Result<GameStateEvent, String> {
    Ok(state.game_state.manual_lane_swap(&champion_name))
}

// ─────────────────────────────── Matchup & Guide Commands ───────────────────────────────

#[tauri::command]
fn get_matchup_by_champion(
    state: tauri::State<'_, AppState>,
    champion_name: String,
) -> Result<Option<MatchupDetail>, String> {
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    db::queries::get_matchup_by_champion(&conn, &champion_name).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_matchups_summary(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<MatchupSummary>, String> {
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    db::queries::get_all_matchups_summary(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_general_guide(
    state: tauri::State<'_, AppState>,
    guide_key: String,
) -> Result<Option<GuideContent>, String> {
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    db::queries::get_general_guide(&conn, &guide_key).map_err(|e| e.to_string())
}

// ─────────────────────────────── Notes CRUD Commands ───────────────────────────────

#[tauri::command]
fn create_post_game_note(
    state: tauri::State<'_, AppState>,
    note: NewNoteInput,
) -> Result<UserNoteRecord, String> {
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    create_note_handler(&conn, &note)
}

#[tauri::command]
fn create_note(
    state: tauri::State<'_, AppState>,
    input: Option<NewNoteInput>,
    note: Option<NewNoteInput>,
) -> Result<UserNoteRecord, String> {
    let target = input.or(note).ok_or_else(|| "Missing note payload".to_string())?;
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    create_note_handler(&conn, &target)
}

#[tauri::command]
fn get_note(
    state: tauri::State<'_, AppState>,
    note_id: i64,
) -> Result<Option<UserNoteRecord>, String> {
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    get_note_by_id_handler(&conn, note_id)
}

#[tauri::command]
fn get_notes_by_champion(
    state: tauri::State<'_, AppState>,
    champion_id: Option<i64>,
    champion_name: Option<String>,
) -> Result<Vec<UserNoteRecord>, String> {
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    if let Some(id) = champion_id {
        get_notes_by_champion_id_handler(&conn, id)
    } else if let Some(ref name) = champion_name {
        get_notes_by_champion_name_handler(&conn, name)
    } else {
        Err("Either champion_id or champion_name must be provided".to_string())
    }
}

#[tauri::command]
fn update_note(
    state: tauri::State<'_, AppState>,
    note_id: i64,
    updates: Option<UpdateNoteInput>,
    input: Option<UpdateNoteInput>,
) -> Result<UserNoteRecord, String> {
    let payload = updates.or(input).ok_or_else(|| "Missing updates payload".to_string())?;
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    update_note_handler(&conn, note_id, &payload)
}

#[tauri::command]
fn delete_note(
    state: tauri::State<'_, AppState>,
    note_id: i64,
) -> Result<bool, String> {
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    delete_note_handler(&conn, note_id)
}

#[tauri::command]
fn get_notes_summary(
    state: tauri::State<'_, AppState>,
    champion_id: i64,
) -> Result<NotesSummary, String> {
    let conn = state.db_conn.lock().map_err(|e| format!("Lock error: {}", e))?;
    get_notes_summary_handler(&conn, champion_id)
}

// ─────────────────────────────── Main ───────────────────────────────

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Resolve DB path in app data directory
            let app_data = app
                .path()
                .app_data_dir()
                .expect("Failed to resolve app data dir");
            std::fs::create_dir_all(&app_data).ok();
            let db_path = app_data.join("champion_matchup.db");

            // Initialize SQLite with schema + seed
            let conn = db::init_db(&db_path)
                .map_err(|e| format!("Failed to init DB: {}", e))
                .expect("Database initialization failed");

            app.manage(AppState {
                db_conn: Mutex::new(conn),
                game_state: GameStateManager::new(),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Game state
            get_game_state,
            set_simulation_scenario,
            set_simulation_state,
            manual_override_opponent,
            // Matchup & Guide
            get_matchup_by_champion,
            get_all_matchups_summary,
            get_general_guide,
            // Notes CRUD
            create_post_game_note,
            create_note,
            get_note,
            get_notes_by_champion,
            update_note,
            delete_note,
            get_notes_summary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

