#!/usr/bin/env python3
import json
import os
import sqlite3

BASE_DIR = r"c:\Users\Gustavo\Desktop\Champion Matchup"
SRC_DATA_DIR = os.path.join(BASE_DIR, "src", "data")
DB_DIR = os.path.join(BASE_DIR, "src-tauri", "src", "db")

champions_file = os.path.join(SRC_DATA_DIR, "champions.json")
matchups_file = os.path.join(SRC_DATA_DIR, "matchups.json")
guides_file = os.path.join(SRC_DATA_DIR, "guides.json")
schema_file = os.path.join(DB_DIR, "schema.sql")
seed_file = os.path.join(DB_DIR, "seed.sql")
db_file = os.path.join(DB_DIR, "champion_matchup.db")

champions = json.load(open(champions_file, encoding="utf-8"))
matchups = json.load(open(matchups_file, encoding="utf-8"))
guides = json.load(open(guides_file, encoding="utf-8"))
schema_sql = open(schema_file, encoding="utf-8").read()

def sql_quote(val):
    if val is None:
        return "NULL"
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

seed_statements = ["-- SEED DATA FOR CHAMPION MATCHUP DATABASE", "BEGIN TRANSACTION;"]

# 1. Champions
for c in champions:
    roles_json = json.dumps(c["roles"])
    seed_statements.append(
        f"INSERT INTO champions (id, name, sheet_name, riot_key, riot_id, title_pt, title_en, roles_json, icon_url) "
        f"VALUES ({c['id']}, {sql_quote(c['name'])}, {sql_quote(c['sheetName'])}, {sql_quote(c['riotKey'])}, {c['riotId']}, "
        f"{sql_quote(c['titlePt'])}, {sql_quote(c['titleEn'])}, {sql_quote(roles_json)}, {sql_quote(c['iconUrl'])});"
    )

# 2. Matchups & Tips
total_tips = 0
for m in matchups:
    seed_statements.append(
        f"INSERT INTO matchups (id, champion_id, difficulty_tier, difficulty_rating, difficulty_raw, "
        f"runes_recommendation, starting_items, summoner_spells, ability_max_order, "
        f"summary_en, summary_pt, detailed_notes_raw_en, detailed_notes_raw_pt, video_url) "
        f"VALUES ({m['id']}, {m['championId']}, {sql_quote(m['difficultyTier'])}, {m['difficultyRating']}, {sql_quote(m['difficultyRaw'])}, "
        f"{sql_quote(m['runesRecommendation'])}, {sql_quote(m['startingItems'])}, {sql_quote(m['summonerSpells'])}, {sql_quote(m['abilityMaxOrder'])}, "
        f"{sql_quote(m['summaryEn'])}, {sql_quote(m['summaryPt'])}, {sql_quote(m['detailedNotesRawEn'])}, {sql_quote(m['detailedNotesRawPt'])}, {sql_quote(m['videoUrl'])});"
    )

    for tip in m.get("tips", []):
        total_tips += 1
        seed_statements.append(
            f"INSERT INTO matchup_tips (id, matchup_id, tip_number, title_en, title_pt, content_en, content_pt, category, display_order) "
            f"VALUES ({tip['id']}, {tip['matchupId']}, {tip['tipNumber']}, {sql_quote(tip['titleEn'])}, {sql_quote(tip['titlePt'])}, "
            f"{sql_quote(tip['contentEn'])}, {sql_quote(tip['contentPt'])}, {sql_quote(tip['category'])}, {tip['displayOrder']});"
        )

# 3. Guide Sections
total_guide_sections = 0
for g in guides:
    for s in g.get("sections", []):
        total_guide_sections += 1
        seed_statements.append(
            f"INSERT INTO guide_sections (id, category, section_key, display_order, title_en, title_pt, subtitle_en, subtitle_pt, content_en, content_pt, video_url, metadata_json) "
            f"VALUES ({s['id']}, {sql_quote(s['category'])}, {sql_quote(s['sectionKey'])}, {s['displayOrder']}, {sql_quote(s['titleEn'])}, "
            f"{sql_quote(s['titlePt'])}, '', '', {sql_quote(s['contentEn'])}, {sql_quote(s['contentPt'])}, {sql_quote(s['videoUrl'])}, '{{}}');"
        )

# 4. App Meta
seed_statements.append("INSERT INTO app_meta (key, value) VALUES ('db_version', '1.0.0'), ('champion_count', '170'), ('seed_timestamp', '2026-08-22T00:00:00Z');")
seed_statements.append("COMMIT;\n")

full_seed_sql = "\n".join(seed_statements)

# Write seed.sql
with open(seed_file, "w", encoding="utf-8") as f:
    f.write(full_seed_sql)

print(f"Wrote seed.sql successfully with {len(seed_statements)} lines.")

# Recreate champion_matchup.db
if os.path.exists(db_file):
    os.remove(db_file)

disk_conn = sqlite3.connect(db_file)
disk_conn.executescript(schema_sql)
disk_conn.executescript(full_seed_sql)
disk_conn.close()
print("Re-seeded champion_matchup.db on disk successfully.")

# Validate on fresh in-memory SQLite DB
mem_conn = sqlite3.connect(":memory:")
mem_conn.executescript(schema_sql)
mem_conn.executescript(full_seed_sql)

cur = mem_conn.cursor()
c_count = cur.execute("SELECT COUNT(*) FROM champions").fetchone()[0]
m_count = cur.execute("SELECT COUNT(*) FROM matchups").fetchone()[0]
t_count = cur.execute("SELECT COUNT(*) FROM matchup_tips").fetchone()[0]
g_count = cur.execute("SELECT COUNT(*) FROM guide_sections").fetchone()[0]
meta_count = cur.execute("SELECT COUNT(*) FROM app_meta").fetchone()[0]

print("=== IN-MEMORY SQLITE VALIDATION RESULTS ===")
print(f"Champions count:      {c_count} / 170")
print(f"Matchups count:       {m_count} / 170")
print(f"Matchup tips count:   {t_count} / 1698")
print(f"Guide sections count: {g_count} / 55")
print(f"App meta count:       {meta_count} / 3")

# Check specifically Nasus (Matchup 88)
nasus_m = cur.execute("SELECT starting_items, summary_en, summary_pt FROM matchups WHERE id = 88").fetchone()
print(f"Nasus starting_items: {nasus_m[0]}")
print(f"Nasus summary_en starts with: {nasus_m[1][:60]}...")
nasus_tips_count = cur.execute("SELECT COUNT(*) FROM matchup_tips WHERE matchup_id = 88").fetchone()[0]
print(f"Nasus tips count:     {nasus_tips_count} / 10")

assert c_count == 170
assert m_count == 170
assert t_count == 1698
assert g_count == 55
assert meta_count == 3
assert nasus_tips_count == 10
assert nasus_m[0] == "Doran's Blade / Doran's Shield"

print("ALL ASSERTIONS PASSED! 100% CLEAN SQLITE EXECUTION!")
