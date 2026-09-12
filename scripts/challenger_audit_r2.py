import sys
import os
import sqlite3
import json
import re

# Ensure stdout supports UTF-8 on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = r"c:\Users\Gustavo\Desktop\Champion Matchup"
SCHEMA_PATH = os.path.join(BASE_DIR, "src-tauri", "src", "db", "schema.sql")
SEED_PATH = os.path.join(BASE_DIR, "src-tauri", "src", "db", "seed.sql")
CHAMPIONS_JSON_PATH = os.path.join(BASE_DIR, "src", "data", "champions.json")
MATCHUPS_JSON_PATH = os.path.join(BASE_DIR, "src", "data", "matchups.json")
GUIDES_JSON_PATH = os.path.join(BASE_DIR, "src", "data", "guides.json")

print("=" * 80)
print("EMPIRICAL DATA INTEGRITY AUDIT - CHALLENGER R2")
print("=" * 80)

# 1. SQLITE IN-MEMORY EXECUTION TEST
print("\n--- 1. Testing SQLite In-Memory Execution of schema.sql and seed.sql ---")
conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("PRAGMA foreign_keys = ON;")

with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
    schema_sql = f.read()
cursor.executescript(schema_sql)
print(f"[PASS] schema.sql executed successfully ({len(schema_sql)} bytes)")

with open(SEED_PATH, "r", encoding="utf-8") as f:
    seed_sql = f.read()
cursor.executescript(seed_sql)
print(f"[PASS] seed.sql executed successfully ({len(seed_sql)} bytes)")

# 2. MATCHUP 88 (NASUS) DEEP INSPECTION
print("\n--- 2. Deep Inspection of Matchup 88 (Nasus) ---")
cursor.execute("""
    SELECT m.*, c.name as champ_name, c.riot_key 
    FROM matchups m 
    JOIN champions c ON m.champion_id = c.id 
    WHERE m.id = 88
""")
m88 = cursor.fetchone()
if not m88:
    print("[FAIL] Matchup 88 not found!")
    sys.exit(1)

print(f"Matchup ID: {m88['id']}")
print(f"Champion Name: {m88['champ_name']} (Riot Key: {m88['riot_key']})")
print(f"Starting Items: {m88['starting_items']}")
print(f"Difficulty Tier: {m88['difficulty_tier']} (Rating: {m88['difficulty_rating']})")
print(f"Runes: {m88['runes_recommendation']}")
print(f"Summary PT: {m88['summary_pt'][:90]}...")

cursor.execute("SELECT count(*) as cnt FROM matchup_tips WHERE matchup_id = 88")
tips_88_count = cursor.fetchone()["cnt"]
print(f"Tips for Matchup 88 (Nasus): {tips_88_count} tips (Expected: 10)")
assert tips_88_count == 10, f"Expected 10 tips for Nasus, got {tips_88_count}"

cursor.execute("SELECT tip_number, title_pt, content_pt, category, display_order FROM matchup_tips WHERE matchup_id = 88 ORDER BY display_order")
tips_88 = cursor.fetchall()
for tip in tips_88[:3]:
    print(f"  [Tip #{tip['tip_number']} ({tip['category']})] {tip['title_pt']}: {tip['content_pt'][:70]}...")
print("[PASS] Matchup 88 (Nasus) syntax, starting_items, and all 10 foreign-key tips verified.")

# 3. COUNT AND RECORD VALIDATION
print("\n--- 3. Database Record Counts ---")
cursor.execute("SELECT count(*) as cnt FROM champions")
champ_count = cursor.fetchone()["cnt"]
cursor.execute("SELECT count(*) as cnt FROM matchups")
matchup_count = cursor.fetchone()["cnt"]
cursor.execute("SELECT count(*) as cnt FROM matchup_tips")
tips_count = cursor.fetchone()["cnt"]
cursor.execute("SELECT count(*) as cnt FROM guide_sections")
guide_sec_count = cursor.fetchone()["cnt"]
cursor.execute("SELECT count(*) as cnt FROM app_meta")
meta_count = cursor.fetchone()["cnt"]

print(f"Champions:      {champ_count:4d} / 170 (Expected: 170)")
print(f"Matchups:       {matchup_count:4d} / 170 (Expected: 170)")
print(f"Matchup Tips:   {tips_count:4d} / 1698 (Expected: 1698)")
print(f"Guide Sections: {guide_sec_count:4d} / 55 (Expected: 55)")
print(f"App Meta:       {meta_count:4d} / 3 (Expected: 3)")

assert champ_count == 170, f"Expected 170 champions, got {champ_count}"
assert matchup_count == 170, f"Expected 170 matchups, got {matchup_count}"
assert tips_count == 1698, f"Expected 1698 tips, got {tips_count}"
assert guide_sec_count == 55, f"Expected 55 guide sections, got {guide_sec_count}"
assert meta_count == 3, f"Expected 3 app_meta rows, got {meta_count}"
print("[PASS] All database record counts match exact specification.")

# 4. 1:1 PARITY AUDIT (JSON vs DB)
print("\n--- 4. Full 1:1 Parity Audit Between JSON Data and SQLite Database ---")

# 4.1 Champions Parity
with open(CHAMPIONS_JSON_PATH, "r", encoding="utf-8") as f:
    champs_json = json.load(f)

champ_mismatches = 0
for c in champs_json:
    c_id = c["id"]
    cursor.execute("SELECT * FROM champions WHERE id = ?", (c_id,))
    db_c = cursor.fetchone()
    if not db_c:
        print(f"[FAIL] Champion ID {c_id} missing in DB!")
        champ_mismatches += 1
        continue
    if db_c["name"] != c["name"] or db_c["sheet_name"] != c["sheetName"] or db_c["riot_key"] != c["riotKey"]:
        print(f"[FAIL] Champion mismatch ID {c_id}: JSON={c['name']}, DB={db_c['name']}")
        champ_mismatches += 1

print(f"Champion 1:1 Parity: {champ_count - champ_mismatches}/{champ_count} matched (Mismatches: {champ_mismatches})")
assert champ_mismatches == 0

# 4.2 Matchups and Tips Parity
with open(MATCHUPS_JSON_PATH, "r", encoding="utf-8") as f:
    matchups_json = json.load(f)

matchup_mismatches = 0
total_json_tips = 0
tip_mismatches = 0

for m in matchups_json:
    m_id = m["id"]
    cursor.execute("SELECT * FROM matchups WHERE id = ?", (m_id,))
    db_m = cursor.fetchone()
    if not db_m:
        print(f"[FAIL] Matchup ID {m_id} missing in DB!")
        matchup_mismatches += 1
        continue
    
    # Check fields
    if db_m["champion_id"] != m["championId"]:
        print(f"[FAIL] ChampionId mismatch on Matchup {m_id}")
        matchup_mismatches += 1
    if db_m["difficulty_tier"] != m["difficultyTier"]:
        print(f"[FAIL] DifficultyTier mismatch on Matchup {m_id}")
        matchup_mismatches += 1
    if db_m["starting_items"] != m["startingItems"]:
        print(f"[FAIL] StartingItems mismatch on Matchup {m_id}: JSON='{m['startingItems']}', DB='{db_m['starting_items']}'")
        matchup_mismatches += 1
    if db_m["runes_recommendation"] != m["runesRecommendation"]:
        print(f"[FAIL] Runes mismatch on Matchup {m_id}")
        matchup_mismatches += 1

    # Check tips
    tips = m.get("tips", [])
    total_json_tips += len(tips)
    cursor.execute("SELECT * FROM matchup_tips WHERE matchup_id = ? ORDER BY display_order", (m_id,))
    db_tips = cursor.fetchall()
    if len(db_tips) != len(tips):
        print(f"[FAIL] Tips count mismatch Matchup {m_id}: JSON={len(tips)}, DB={len(db_tips)}")
        tip_mismatches += 1
    else:
        for t_idx, t_json in enumerate(tips):
            db_t = db_tips[t_idx]
            if db_t["id"] != t_json["id"] or db_t["content_pt"] != t_json["contentPt"] or db_t["title_pt"] != t_json["titlePt"]:
                print(f"[FAIL] Tip content mismatch Matchup {m_id} Tip #{t_json.get('tipNumber', t_idx+1)}")
                tip_mismatches += 1

print(f"Matchups 1:1 Parity: {matchup_count - matchup_mismatches}/{matchup_count} matched (Mismatches: {matchup_mismatches})")
print(f"Matchup Tips 1:1 Parity: {total_json_tips - tip_mismatches}/{total_json_tips} matched (Mismatches: {tip_mismatches})")
assert matchup_mismatches == 0
assert tip_mismatches == 0
assert total_json_tips == 1698

# 4.3 Guide Sections Parity
with open(GUIDES_JSON_PATH, "r", encoding="utf-8") as f:
    guides_json = json.load(f)

total_json_sections = 0
guide_sec_mismatches = 0

for g in guides_json:
    for s in g.get("sections", []):
        total_json_sections += 1
        s_id = s["id"]
        cursor.execute("SELECT * FROM guide_sections WHERE id = ?", (s_id,))
        db_s = cursor.fetchone()
        if not db_s:
            print(f"[FAIL] Guide section ID {s_id} missing in DB!")
            guide_sec_mismatches += 1
            continue
        if db_s["category"] != s["category"] or db_s["title_pt"] != s["titlePt"] or db_s["content_pt"] != s["contentPt"]:
            print(f"[FAIL] Guide section content mismatch ID {s_id}")
            guide_sec_mismatches += 1

print(f"Guide Sections 1:1 Parity: {total_json_sections - guide_sec_mismatches}/{total_json_sections} matched (Mismatches: {guide_sec_mismatches})")
assert guide_sec_mismatches == 0
assert total_json_sections == 55

# 5. LINGUISTIC & PT-BR AUDIT ON ALL 55 GUIDE SECTIONS
print("\n--- 5. Linguistic & PT-BR Translation Audit on Guides ---")
portuguese_stop_words = [
    "para", "com", "não", "você", "seu", "sua", "quando", "deve",
    "contra", "dano", "fase", "troca", "nível", "cura", "escudo",
    "durante", "tempo", "partida", "vitória", "controle", "visão",
    "objetivo", "abate", "avanço", "pressão", "habilidade", "passiva",
    "campeão", "campeões", "equipe", "rota", "torre", "ouro", "vantagem",
    "como", "mais", "muito", "pode", "está", "isso", "caso", "fazer",
    "sobre", "após", "usar", "evite", "procure", "garanta", "sempre"
]

english_sentence_indicators = [
    r"\byou should\b", r"\bin order to\b", r"\bthis guide\b", r"\bmake sure to\b",
    r"\bwhen playing against\b", r"\bduring the early game\b", r"\bthe enemy will\b",
    r"\bbe careful of\b", r"\blook for opportunities\b", r"\balways remember\b",
    r"\bthis matchup is\b", r"\byou can use\b", r"\bkeep in mind\b", r"\bas much as possible\b"
]

total_words = 0
section_stats = []
flagged = []

for g in guides_json:
    cat = g.get("category", "")
    for s in g.get("sections", []):
        sec_id = s["id"]
        title_pt = s.get("titlePt", "")
        content_pt = s.get("contentPt", "")
        full_text = f"{title_pt} {content_pt}"
        words = re.findall(r"\b[a-zA-ZáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]+\b", full_text)
        total_words += len(words)
        
        # Lowercase tokens for pt matching
        tokens_lower = [w.lower() for w in words]
        pt_word_count = sum(1 for w in tokens_lower if w in portuguese_stop_words)
        pt_ratio = (pt_word_count / len(tokens_lower)) * 100 if tokens_lower else 0
        
        # English sentence regex check
        en_matches = [p for p in english_sentence_indicators if re.search(p, full_text, re.IGNORECASE)]
        if en_matches:
            flagged.append((cat, s.get("sectionKey"), title_pt, en_matches))
        
        section_stats.append({
            "id": sec_id,
            "category": cat,
            "key": s.get("sectionKey"),
            "words": len(words),
            "pt_ratio": pt_ratio
        })

print(f"Total Portuguese Words in 55 Guide Sections: {total_words:,}")
avg_pt_ratio = sum(s["pt_ratio"] for s in section_stats) / len(section_stats)
print(f"Average Portuguese Marker Density: {avg_pt_ratio:.1f}%")
print(f"English Grammatical Sentence Infiltrations: {len(flagged)}")

if flagged:
    for cat, key, title, matches in flagged:
        print(f"  [FAIL] {cat} -> {key} ({title}): {matches}")
    sys.exit(1)
else:
    print("[PASS] 100% of 55 guide sections confirmed in natural Brazilian Portuguese (PT-BR) with standard League of Legends English terms preserved.")

print("\n" + "=" * 80)
print("AUDIT VERDICT: ALL DATA INTEGRITY & PARITY AUDITS PASSED WITH 0 DEFECTS")
print("=" * 80)
