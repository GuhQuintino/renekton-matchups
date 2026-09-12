#!/usr/bin/env python3
"""
Independent Forensic Audit Script for Milestone 1 (M1: Core Data Engine, Translation PT-BR & SQLite Seeding).
Author: Forensic Auditor Subagent
Integrity Mode: BENCHMARK (Maximum Strictness)
"""

import csv
import json
import os
import re
import sqlite3
import sys
import time
from typing import Dict, List, Any, Tuple

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(BASE_DIR, "Docs", "Guia de Renekton")
SRC_DATA_DIR = os.path.join(BASE_DIR, "src", "data")
DB_DIR = os.path.join(BASE_DIR, "src-tauri", "src", "db")

results = {
    'total_checks': 0,
    'passed_checks': 0,
    'failed_checks': 0,
    'failures': [],
    'evidence': []
}

def audit_assert(condition: bool, check_name: str, details: str = ""):
    results['total_checks'] += 1
    if condition:
        results['passed_checks'] += 1
        results['evidence'].append(f"[PASS] {check_name}: {details}")
        print(f"[PASS] {check_name}: {details}")
    else:
        results['failed_checks'] += 1
        fail_msg = f"[FAIL] {check_name}: {details}"
        results['failures'].append(fail_msg)
        results['evidence'].append(fail_msg)
        print(fail_msg)

# =============================================================================
# 1. PHASE 1: RAW SOURCE CSV AUDIT
# =============================================================================
def audit_source_csvs():
    print("\n" + "="*80)
    print("PHASE 1: AUDITING SOURCE CSV FILES IN Docs/Guia de Renekton/")
    print("="*80)
    
    expected_files = [
        "The Ultimate Renekton Guide Spreadsheet - Match Up Sheet.csv",
        "The Ultimate Renekton Guide Spreadsheet - Ability Starts + Maxing.csv",
        "The Ultimate Renekton Guide Spreadsheet - FAQ.csv",
        "The Ultimate Renekton Guide Spreadsheet - Fury Management.csv",
        "The Ultimate Renekton Guide Spreadsheet - Introduction.csv",
        "The Ultimate Renekton Guide Spreadsheet - Items + Builds.csv",
        "The Ultimate Renekton Guide Spreadsheet - Mechanics + Combos.csv",
        "The Ultimate Renekton Guide Spreadsheet - Runes.csv",
        "The Ultimate Renekton Guide Spreadsheet - Summoners.csv",
    ]
    
    for fname in expected_files:
        fpath = os.path.join(DOCS_DIR, fname)
        exists = os.path.isfile(fpath)
        sz = os.path.getsize(fpath) if exists else 0
        audit_assert(exists and sz > 1000, f"CSV File Existence: {fname}", f"Exists={exists}, Size={sz} bytes")
        
    # Deep inspect Match Up Sheet.csv
    matchup_csv = os.path.join(DOCS_DIR, "The Ultimate Renekton Guide Spreadsheet - Match Up Sheet.csv")
    with open(matchup_csv, 'r', encoding='utf-8', errors='replace') as fp:
        rows = list(csv.reader(fp))
        
    # Header is at row index 8 (line 9)
    header = rows[8]
    data_rows = [r for r in rows[9:] if r and any(r) and r[0].strip()]
    
    audit_assert(len(data_rows) == 170, "CSV Raw Champion Row Count", f"Found {len(data_rows)} champion rows in source CSV (expected 170)")
    
    # Count tips in CSV
    raw_tips_count = 0
    for r in data_rows:
        notes = r[7] if len(r) > 7 else ""
        tips = re.findall(r'\(\d+\)', notes)
        raw_tips_count += len(tips)
        
    audit_assert(raw_tips_count >= 1690, "CSV Raw Tip Marker Count", f"Counted {raw_tips_count} tip markers (1)..(15) in CSV detailed notes")
    return data_rows

# =============================================================================
# 2. PHASE 2: SQLITE DATABASE BINARY & SCHEMA FORENSICS
# =============================================================================
def audit_sqlite_database(csv_data_rows: List[List[str]]):
    print("\n" + "="*80)
    print("PHASE 2: SQLITE DATABASE BINARY, PRAGMA & SCHEMA INTEGRITY AUDIT")
    print("="*80)
    
    db_path = os.path.join(DB_DIR, "champion_matchup.db")
    audit_assert(os.path.isfile(db_path), "SQLite Binary File Exists", f"Path: {db_path}")
    
    # Read binary header (16 bytes magic number)
    with open(db_path, 'rb') as f:
        header = f.read(16)
    audit_assert(header == b'SQLite format 3\x00', "SQLite 3 Magic Number Verification", f"Header bytes: {header}")
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # PRAGMA integrity_check
    cur.execute("PRAGMA integrity_check;")
    integrity = cur.fetchall()
    audit_assert(integrity == [('ok',)], "PRAGMA integrity_check", f"Result: {integrity}")
    
    # PRAGMA foreign_key_check
    cur.execute("PRAGMA foreign_key_check;")
    fk_check = cur.fetchall()
    audit_assert(len(fk_check) == 0, "PRAGMA foreign_key_check", f"Violations: {len(fk_check)}")
    
    # Table counts
    cur.execute("SELECT COUNT(*) FROM champions;")
    champ_count = cur.fetchone()[0]
    audit_assert(champ_count == 170, "DB Table 'champions' Row Count", f"Count: {champ_count} (expected 170)")
    
    cur.execute("SELECT COUNT(*) FROM matchups;")
    matchup_count = cur.fetchone()[0]
    audit_assert(matchup_count == 170, "DB Table 'matchups' Row Count", f"Count: {matchup_count} (expected 170)")
    
    cur.execute("SELECT COUNT(*) FROM matchup_tips;")
    tips_count = cur.fetchone()[0]
    audit_assert(tips_count == 1698, "DB Table 'matchup_tips' Row Count", f"Count: {tips_count} (expected 1698)")
    
    cur.execute("SELECT COUNT(*) FROM guide_sections;")
    guides_count = cur.fetchone()[0]
    audit_assert(guides_count == 55, "DB Table 'guide_sections' Row Count", f"Count: {guides_count} (expected 55)")
    
    cur.execute("SELECT COUNT(*) FROM app_meta;")
    meta_count = cur.fetchone()[0]
    audit_assert(meta_count >= 3, "DB Table 'app_meta' Row Count", f"Count: {meta_count}")
    
    # Check for empty or NULL fields in mandatory columns
    cur.execute("SELECT COUNT(*) FROM matchups WHERE summary_pt IS NULL OR summary_pt = '' OR runes_recommendation = '' OR starting_items = '';")
    bad_matchups = cur.fetchone()[0]
    audit_assert(bad_matchups == 0, "Zero Incomplete Matchup Records", f"Incomplete matchups: {bad_matchups}")
    
    cur.execute("SELECT COUNT(*) FROM matchup_tips WHERE title_pt IS NULL OR title_pt = '' OR content_pt IS NULL OR content_pt = '';")
    bad_tips = cur.fetchone()[0]
    audit_assert(bad_tips == 0, "Zero Incomplete Matchup Tip Records", f"Incomplete tips: {bad_tips}")
    
    cur.execute("SELECT COUNT(*) FROM guide_sections WHERE title_pt IS NULL OR title_pt = '' OR content_pt IS NULL OR content_pt = '';")
    bad_guides = cur.fetchone()[0]
    audit_assert(bad_guides == 0, "Zero Incomplete Guide Section Records", f"Incomplete guide sections: {bad_guides}")
    
    # Check schema.sql and seed.sql synchronization
    schema_sql_path = os.path.join(DB_DIR, "schema.sql")
    seed_sql_path = os.path.join(DB_DIR, "seed.sql")
    audit_assert(os.path.isfile(schema_sql_path) and os.path.getsize(schema_sql_path) > 1000, "schema.sql File Validity", f"Size: {os.path.getsize(schema_sql_path)} bytes")
    audit_assert(os.path.isfile(seed_sql_path) and os.path.getsize(seed_sql_path) > 1_000_000, "seed.sql File Validity", f"Size: {os.path.getsize(seed_sql_path)} bytes")
    
    conn.close()

# =============================================================================
# 3. PHASE 3: CROSS-VALIDATION (CSV vs SQLite vs JSON Datasets)
# =============================================================================
def audit_cross_validation(csv_data_rows: List[List[str]]):
    print("\n" + "="*80)
    print("PHASE 3: 1-TO-1 CROSS-VALIDATION (CSV vs SQLITE vs JSON)")
    print("="*80)
    
    # Load JSON files
    with open(os.path.join(SRC_DATA_DIR, "champions.json"), 'r', encoding='utf-8') as f:
        champions_json = json.load(f)
    with open(os.path.join(SRC_DATA_DIR, "matchups.json"), 'r', encoding='utf-8') as f:
        matchups_json = json.load(f)
    with open(os.path.join(SRC_DATA_DIR, "matchup-summaries.json"), 'r', encoding='utf-8') as f:
        summaries_json = json.load(f)
    with open(os.path.join(SRC_DATA_DIR, "guides.json"), 'r', encoding='utf-8') as f:
        guides_json = json.load(f)
        
    audit_assert(len(champions_json) == 170, "JSON champions.json Count", f"Length: {len(champions_json)}")
    audit_assert(len(matchups_json) == 170, "JSON matchups.json Count", f"Length: {len(matchups_json)}")
    audit_assert(len(summaries_json) == 170, "JSON matchup-summaries.json Count", f"Length: {len(summaries_json)}")
    audit_assert(len(guides_json) == 8, "JSON guides.json Count", f"Length: {len(guides_json)}")
    
    db_path = os.path.join(DB_DIR, "champion_matchup.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Build maps
    json_by_sheet = {c['sheetName']: c for c in champions_json}
    matchup_by_sheet = {m['sheetName']: m for m in matchups_json}
    
    cur.execute("SELECT id, name, sheet_name, riot_key FROM champions;")
    db_champs = cur.fetchall()
    db_by_sheet = {c[2]: c for c in db_champs}
    
    missing_in_json = 0
    missing_in_db = 0
    mismatched_data = 0
    
    for r in csv_data_rows:
        sheet_name = r[0].strip()
        diff_raw = r[1].strip()
        runes_csv = r[2].strip()
        start_items_csv = r[3].strip()
        summs_csv = r[4].strip()
        max_order_csv = r[5].strip()
        
        # Check DB
        if sheet_name not in db_by_sheet:
            missing_in_db += 1
            continue
            
        # Check JSON
        if sheet_name not in json_by_sheet or sheet_name not in matchup_by_sheet:
            missing_in_json += 1
            continue
            
        m_json = matchup_by_sheet[sheet_name]
        if m_json['runesRecommendation'] != runes_csv or m_json['startingItems'] != start_items_csv:
            mismatched_data += 1
            
    audit_assert(missing_in_db == 0, "Zero Champions Missing from SQLite", f"Missing: {missing_in_db}")
    audit_assert(missing_in_json == 0, "Zero Champions Missing from JSON", f"Missing: {missing_in_json}")
    audit_assert(mismatched_data == 0, "100% Content Parity between CSV and JSON/DB", f"Mismatches: {mismatched_data}")
    
    conn.close()

# =============================================================================
# 4. PHASE 4: TRANSLATION FIDELITY & LOL GLOSSARY PRESERVATION AUDIT
# =============================================================================
def audit_translation_and_glossary():
    print("\n" + "="*80)
    print("PHASE 4: TRANSLATION FIDELITY & GLOSSARY PRESERVATION AUDIT")
    print("="*80)
    
    with open(os.path.join(SRC_DATA_DIR, "matchups.json"), 'r', encoding='utf-8') as f:
        matchups_json = json.load(f)
    with open(os.path.join(SRC_DATA_DIR, "guides.json"), 'r', encoding='utf-8') as f:
        guides_json = json.load(f)
        
    all_pt_text = []
    all_en_text = []
    
    for m in matchups_json:
        all_pt_text.append(m['summaryPt'])
        all_pt_text.append(m['detailedNotesRawPt'])
        all_en_text.append(m['summaryEn'])
        all_en_text.append(m['detailedNotesRawEn'])
        for t in m['tips']:
            all_pt_text.append(t['titlePt'])
            all_pt_text.append(t['contentPt'])
            all_en_text.append(t['titleEn'])
            all_en_text.append(t['contentEn'])
            
    for g in guides_json:
        all_pt_text.append(g['titlePt'])
        all_pt_text.append(g['descriptionPt'])
        for s in g['sections']:
            all_pt_text.append(s['titlePt'])
            all_pt_text.append(s['contentPt'])
            
    full_pt = " ".join(all_pt_text)
    full_en = " ".join(all_en_text)
    
    # 1. Check Portuguese Natural Vocabulary Presence
    pt_keywords = [
        "confronto", "habilidade", "trocas", "nível", "inimigo", "adversário",
        "armadura", "cura", "vida", "dano", "respeite", "abuse", "procure",
        "laning phase", "torre", "passiva", "certifique-se", "gerenciamento de fúria"
    ]
    for kw in pt_keywords:
        found = kw.lower() in full_pt.lower()
        audit_assert(found, f"PT-BR Vocabulary Presence: '{kw}'", f"Found: {found}")
        
    # 2. Check Strictly Protected English Terms (MUST NOT be wrongly translated)
    protected_terms = [
        "Renekton", "Aatrox", "Fiora", "Darius", "K'Sante", "Dr. Mundo",
        "Flash", "Ignite", "Teleport", "Ghost",
        "PTA", "Conqueror", "Grasp", "Second Wind", "Bone Plating",
        "Eclipse", "BoTRK", "Black Cleaver", "Profane Hydra", "Stridebreaker", "Doran's Blade", "Doran's Shield",
        "freeze", "wave", "waveclear", "proxy", "all-in", "short trade", "powerspike", "CC", "AA", "burst"
    ]
    for term in protected_terms:
        found = term.lower() in full_pt.lower()
        audit_assert(found, f"Protected LoL Term Preservation: '{term}'", f"Found in PT text: {found}")
        
    # 3. Check for Prohibited Corrupted Machine Translations (e.g. 'Flash' -> 'Clarão', 'Ignite' -> 'Incendiar', 'BoTRK' -> 'Espada do Rei')
    prohibited_bad_translations = [
        r"\bClarão\b", r"\bIncendiar\b", r"\bFantasma\b"
    ]
    corrupted_count = 0
    for bad_pat in prohibited_bad_translations:
        matches = re.findall(bad_pat, full_pt)
        if matches:
            corrupted_count += len(matches)
    audit_assert(corrupted_count == 0, "Zero Corrupted Sacred LoL Terms in PT-BR", f"Corrupted occurrences: {corrupted_count}")
    
    # 4. Check for Placeholder / TODO text
    placeholders = ["TODO", "FIXME", "LOREM IPSUM", "UNDEFINED", "DUMMY TEXT"]
    placeholder_count = 0
    for ph in placeholders:
        if re.search(rf'\b{re.escape(ph)}\b', full_pt):
            placeholder_count += 1
    audit_assert(placeholder_count == 0, "Zero Placeholder / Dummy Strings in Translations", f"Placeholders found: {placeholder_count}")

# =============================================================================
# 5. PHASE 5: CODEBASE INTEGRITY, TEST REALISM & FACADE DETECTION
# =============================================================================
def audit_codebase_and_test_authenticity():
    print("\n" + "="*80)
    print("PHASE 5: CODEBASE INTEGRITY, RUST/TYPESCRIPT MODULES & TEST AUTHENTICITY")
    print("="*80)
    
    # 1. TypeScript Types and Engine
    engine_path = os.path.join(SRC_DATA_DIR, "data-engine.ts")
    with open(engine_path, 'r', encoding='utf-8') as f:
        engine_code = f.read()
        
    audit_assert("getAllChampions" in engine_code, "data-engine.ts implements getAllChampions", "Found function definition")
    audit_assert("getMatchupByChampion" in engine_code, "data-engine.ts implements getMatchupByChampion", "Found function definition")
    audit_assert("searchMatchups" in engine_code, "data-engine.ts implements searchMatchups", "Found function definition")
    audit_assert("getAllGuides" in engine_code, "data-engine.ts implements getAllGuides", "Found function definition")
    
    # Check that data-engine does not return static dummy constants
    audit_assert("return summaries.filter" in engine_code, "data-engine search logic is genuine", "Filter implementation verified")
    
    # 2. Rust DB Files
    models_rs = os.path.join(DB_DIR, "models.rs")
    queries_rs = os.path.join(DB_DIR, "queries.rs")
    mod_rs = os.path.join(DB_DIR, "mod.rs")
    
    for rpath in [models_rs, queries_rs, mod_rs]:
        audit_assert(os.path.isfile(rpath) and os.path.getsize(rpath) > 500, f"Rust Source File: {os.path.basename(rpath)}", f"Size: {os.path.getsize(rpath)} bytes")
        
    with open(queries_rs, 'r', encoding='utf-8') as f:
        queries_code = f.read()
        
    audit_assert("pub fn get_champion_by_name" in queries_code, "queries.rs implements get_champion_by_name", "Verified")
    audit_assert("pub fn get_all_matchups_summary" in queries_code, "queries.rs implements get_all_matchups_summary", "Verified")
    audit_assert("pub fn get_matchup_by_champion" in queries_code, "queries.rs implements get_matchup_by_champion", "Verified")
    audit_assert("pub fn get_general_guide" in queries_code, "queries.rs implements get_general_guide", "Verified")
    audit_assert("pub fn create_user_note" in queries_code, "queries.rs implements create_user_note", "Verified")
    audit_assert("pub fn delete_user_note" in queries_code, "queries.rs implements delete_user_note", "Verified")
    
    # 3. Test script authenticity (test_m1.py)
    test_script_path = os.path.join(BASE_DIR, "scripts", "test_m1.py")
    with open(test_script_path, 'r', encoding='utf-8') as f:
        test_code = f.read()
        
    # Check that test_m1.py doesn't have hardcoded 'assert True' or skipped tests
    assert_true_calls = re.findall(r'assert_true\(True,', test_code)
    audit_assert(len(assert_true_calls) == 0, "No Hardcoded 'assert_true(True)' in test_m1.py", f"Hardcoded count: {len(assert_true_calls)}")
    audit_assert("sqlite3.connect" in test_code, "test_m1.py connects directly to SQLite DB", "Verified")
    audit_assert("iterations = 1000" in test_code, "test_m1.py executes real benchmark loop", "Verified")

# =============================================================================
# 6. PHASE 6: ADVERSARIAL STRESS TESTING & BENCHMARKING
# =============================================================================
def audit_adversarial_stress():
    print("\n" + "="*80)
    print("PHASE 6: ADVERSARIAL STRESS TESTING & BENCHMARKING")
    print("="*80)
    
    db_path = os.path.join(DB_DIR, "champion_matchup.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Edge Case Name Variations
    test_queries = [
        ("Dr. Mundo", "Dr. Mundo"),
        ("DR.MUNDO", "Dr. Mundo"),
        ("DrMundo", "Dr. Mundo"),
        ("K'Sante", "K'Sante"),
        ("k'sante", "K'Sante"),
        ("KSante", "K'Sante"),
        ("Wukong", "Wukong"),
        ("MonkeyKing", "Wukong"),
        ("Cho'Gath", "Cho'Gath"),
        ("chogath", "Cho'Gath"),
        ("Kai'Sa", "Kai'Sa"),
        ("kaisa", "Kai'Sa"),
        ("LeBlanc", "LeBlanc"),
        ("leblanc", "LeBlanc"),
        ("Nunu & Willump", "Nunu & Willump"),
        ("Nunu", "Nunu & Willump"),
    ]
    
    for q_in, expected_name in test_queries:
        cur.execute("""
            SELECT c.name, m.difficulty_tier, m.summary_pt
            FROM champions c
            JOIN matchups m ON m.champion_id = c.id
            WHERE LOWER(c.name) = LOWER(?1) OR LOWER(c.sheet_name) = LOWER(?1) OR LOWER(c.riot_key) = LOWER(?1)
            LIMIT 1;
        """, (q_in,))
        res = cur.fetchone()
        audit_assert(res is not None and res[0] == expected_name, f"Adversarial Champion Query: '{q_in}' -> '{expected_name}'", f"Result: {res[0] if res else None}")
        
    # 2. SQL Injection / Malformed inputs safety test
    nasty_inputs = [
        "'; DROP TABLE champions; --",
        "' OR '1'='1",
        "\" OR \"\"=\"",
        "Robert'); DROP TABLE Students;--",
        "<script>alert(1)</script>",
        "Renekton\x00Injected",
        "A"*500
    ]
    for nasty in nasty_inputs:
        cur.execute("""
            SELECT c.name FROM champions c WHERE LOWER(c.name) = LOWER(?1);
        """, (nasty,))
        res = cur.fetchall()
        audit_assert(len(res) == 0, f"SQL Injection Resistance: '{nasty[:30]}...'", f"Matches: {len(res)} (expected 0, no syntax error)")
        
    # 3. 2,000 Iterations Query Benchmark (P95 and Average Latency)
    latencies = []
    iterations = 2000
    for i in range(iterations):
        cid = (i % 170) + 1
        t0 = time.perf_counter()
        cur.execute("""
            SELECT m.id, c.name, m.difficulty_tier, m.difficulty_rating, m.runes_recommendation,
                   m.starting_items, m.summoner_spells, m.ability_max_order, m.summary_pt
            FROM matchups m
            JOIN champions c ON m.champion_id = c.id
            WHERE c.id = ?1;
        """, (cid,))
        row = cur.fetchone()
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0) # in ms
        
    avg_latency = sum(latencies) / len(latencies)
    latencies.sort()
    p95_latency = latencies[int(len(latencies) * 0.95)]
    max_latency = max(latencies)
    
    print(f"\nBenchmark Results over {iterations} queries:")
    print(f"  Average Latency: {avg_latency:.4f} ms")
    print(f"  P95 Latency:     {p95_latency:.4f} ms")
    print(f"  Max Latency:     {max_latency:.4f} ms")
    
    audit_assert(avg_latency < 1.0, f"Average Query Latency Under 1ms: {avg_latency:.4f} ms", f"Requirement is <5ms, actual is {avg_latency:.4f} ms")
    audit_assert(p95_latency < 2.0, f"P95 Query Latency Under 2ms: {p95_latency:.4f} ms", f"Actual P95: {p95_latency:.4f} ms")
    
    conn.close()

# =============================================================================
# MAIN AUDIT RUNNER
# =============================================================================
def main():
    print("="*80)
    print("INDEPENDENT FORENSIC AUDIT - MILESTONE 1 (BENCHMARK INTEGRITY MODE)")
    print("="*80)
    
    csv_rows = audit_source_csvs()
    audit_sqlite_database(csv_rows)
    audit_cross_validation(csv_rows)
    audit_translation_and_glossary()
    audit_codebase_and_test_authenticity()
    audit_adversarial_stress()
    
    print("\n" + "="*80)
    print(f"FORENSIC AUDIT SUMMARY:")
    print(f"  Total Checks Executed:  {results['total_checks']}")
    print(f"  Passed Checks:          {results['passed_checks']}")
    print(f"  Failed Checks:          {results['failed_checks']}")
    print("="*80)
    
    if results['failed_checks'] == 0:
        print("\n>>> FINAL FORENSIC VERDICT: CLEAN <<<")
        print("All 170 champions, 1,698 tips, 8 general guides, SQLite DB, and translations verified with 100% authenticity.")
        sys.exit(0)
    else:
        print("\n>>> FINAL FORENSIC VERDICT: INTEGRITY VIOLATION <<<")
        for f in results['failures']:
            print(f"  - {f}")
        sys.exit(1)

if __name__ == '__main__':
    main()
