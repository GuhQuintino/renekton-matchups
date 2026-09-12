-- ============================================================================
-- SCHEMA DDL: CHAMPION MATCHUP DATABASE (RENEKTON ULTIMATE GUIDE)
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS champions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sheet_name TEXT NOT NULL,
    riot_key TEXT NOT NULL,
    riot_id INTEGER,
    title_pt TEXT,
    title_en TEXT,
    roles_json TEXT,
    icon_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matchups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    champion_id INTEGER NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
    difficulty_tier TEXT NOT NULL,
    difficulty_rating INTEGER NOT NULL,
    difficulty_raw TEXT NOT NULL,
    runes_recommendation TEXT NOT NULL,
    starting_items TEXT NOT NULL,
    summoner_spells TEXT NOT NULL,
    ability_max_order TEXT NOT NULL,
    summary_en TEXT,
    summary_pt TEXT,
    detailed_notes_raw_en TEXT,
    detailed_notes_raw_pt TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matchup_tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matchup_id INTEGER NOT NULL REFERENCES matchups(id) ON DELETE CASCADE,
    tip_number INTEGER NOT NULL,
    title_en TEXT NOT NULL,
    title_pt TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_pt TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS guide_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    section_key TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    title_en TEXT NOT NULL,
    title_pt TEXT NOT NULL,
    subtitle_en TEXT,
    subtitle_pt TEXT,
    content_en TEXT NOT NULL,
    content_pt TEXT NOT NULL,
    video_url TEXT,
    metadata_json TEXT
);

CREATE TABLE IF NOT EXISTS user_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    champion_id INTEGER NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
    game_id TEXT,
    match_result TEXT NOT NULL CHECK(match_result IN ('win', 'loss', 'remake')),
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

CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_champions_name ON champions(name);
CREATE INDEX IF NOT EXISTS idx_champions_riot_key ON champions(riot_key);
CREATE INDEX IF NOT EXISTS idx_matchups_champion_id ON matchups(champion_id);
CREATE INDEX IF NOT EXISTS idx_matchup_tips_matchup_id ON matchup_tips(matchup_id);
CREATE INDEX IF NOT EXISTS idx_guide_sections_category ON guide_sections(category, display_order);
CREATE INDEX IF NOT EXISTS idx_user_notes_champion_id ON user_notes(champion_id, created_at DESC);
