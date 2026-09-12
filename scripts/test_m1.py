#!/usr/bin/env python3
"""
Unit and Integration Test Suite for Milestone 1 (M1: Core Data Engine & SQLite Seeding).
Validates completeness, structural integrity, translation fidelity, and SQLite query speed.
"""

import json
import os
import sqlite3
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DATA_DIR = os.path.join(BASE_DIR, "src", "data")
DB_DIR = os.path.join(BASE_DIR, "src-tauri", "src", "db")

passed_assertions = 0
failed_assertions = 0

def assert_true(condition: bool, message: str):
    global passed_assertions, failed_assertions
    if condition:
        passed_assertions += 1
        print(f"  [PASS] {message}")
    else:
        failed_assertions += 1
        print(f"  [FAIL] {message}")

def test_champions_dataset():
    print("\n--- Testing champions.json ---")
    champ_path = os.path.join(SRC_DATA_DIR, "champions.json")
    assert_true(os.path.exists(champ_path), "champions.json exists")
    
    with open(champ_path, 'r', encoding='utf-8') as f:
        champions = json.load(f)
        
    assert_true(len(champions) == 170, f"Contains exactly 170 champions (found: {len(champions)})")
    
    # Check champion fields
    ids = set()
    names = set()
    riot_keys = set()
    for c in champions:
        ids.add(c['id'])
        names.add(c['name'])
        riot_keys.add(c['riotKey'])
        assert_true(bool(c['name'] and c['sheetName'] and c['riotKey']), f"Champion {c['name']} has valid identifiers")
        assert_true(isinstance(c['roles'], list) and len(c['roles']) > 0, f"Champion {c['name']} has roles")
        assert_true(bool(c['iconUrl']), f"Champion {c['name']} has icon URL")
        
    assert_true(len(ids) == 170, "All champion IDs are unique (1..170)")
    assert_true(len(names) == 170, "All champion display names are unique")
    assert_true(len(riot_keys) == 170, "All Riot keys are unique")
    
    # Check specific edge-case champion normalizations
    dr_mundo = next((c for c in champions if c['sheetName'] == 'DR.Mundo'), None)
    assert_true(dr_mundo is not None and dr_mundo['name'] == 'Dr. Mundo' and dr_mundo['riotKey'] == 'DrMundo', "DR.Mundo normalized to Dr. Mundo / DrMundo")
    
    wukong = next((c for c in champions if c['sheetName'] == 'Wukong'), None)
    assert_true(wukong is not None and wukong['riotKey'] == 'MonkeyKing', "Wukong normalized to MonkeyKing Riot Key")
    
    ksante = next((c for c in champions if c['sheetName'] == "K'sante"), None)
    assert_true(ksante is not None and ksante['name'] == "K'Sante" and ksante['riotKey'] == 'KSante', "K'sante normalized to K'Sante / KSante")

def test_matchups_dataset():
    print("\n--- Testing matchups.json ---")
    matchup_path = os.path.join(SRC_DATA_DIR, "matchups.json")
    assert_true(os.path.exists(matchup_path), "matchups.json exists")
    
    with open(matchup_path, 'r', encoding='utf-8') as f:
        matchups = json.load(f)
        
    assert_true(len(matchups) == 170, f"Contains exactly 170 matchups (found: {len(matchups)})")
    
    total_tips = 0
    valid_tiers = {'Easy', 'Medium', 'Hard', 'Very Hard'}
    
    for m in matchups:
        assert_true(m['difficultyTier'] in valid_tiers, f"Matchup {m['championName']} valid difficulty tier ({m['difficultyTier']})")
        assert_true(1 <= m['difficultyRating'] <= 10, f"Matchup {m['championName']} rating in range 1-10 ({m['difficultyRating']})")
        assert_true(bool(m['runesRecommendation']), f"Matchup {m['championName']} has runes")
        assert_true(bool(m['startingItems']), f"Matchup {m['championName']} has starting items")
        assert_true(bool(m['summonerSpells']), f"Matchup {m['championName']} has summoner spells")
        assert_true(bool(m['abilityMaxOrder']), f"Matchup {m['championName']} has ability max order")
        assert_true(bool(m['summaryPt']), f"Matchup {m['championName']} has PT-BR summary")
        assert_true(bool(m['detailedNotesRawPt']), f"Matchup {m['championName']} has PT-BR detailed notes")
        
        tips = m['tips']
        total_tips += len(tips)
        for t in tips:
            assert_true(t['tipNumber'] >= 1, f"Tip {t['id']} has valid tipNumber")
            assert_true(bool(t['titlePt']), f"Tip {t['id']} has valid PT-BR title")
            assert_true(bool(t['contentPt']), f"Tip {t['id']} has valid PT-BR content")
            assert_true(t['category'] in {'Level 1', 'Trading', 'All-in', 'Wave Management', 'Itemization', 'Teamfight', 'General'}, f"Tip {t['id']} valid category")

    assert_true(total_tips >= 1690, f"Structured tips parsed across all champions (found: {total_tips})")

EN_STOPWORDS = {
    'the', 'is', 'are', 'was', 'were', 'to', 'in', 'that', 'with', 'for', 'as', 'from',
    'they', 'be', 'been', 'being', 'have', 'has', 'had', 'or', 'you', 'your', 'it', 'its',
    'he', 'his', 'him', 'she', 'her', 'hers', 'their', 'theirs', 'them', 'when', 'which',
    'will', 'would', 'can', 'could', 'should', 'if', 'this', 'these', 'those', 'then',
    'there', 'than', 'into', 'up', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'once', 'here', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'too', 'very', 'just', 'now'
}

PT_STOPWORDS = {
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'para',
    'pra', 'com', 'sem', 'que', 'se', 'como', 'quando', 'onde', 'porque', 'por que',
    'ele', 'ela', 'eles', 'elas', 'dele', 'dela', 'deles', 'delas', 'seu', 'sua', 'seus',
    'suas', 'você', 'vocês', 'te', 'lhe', 'lhes', 'me', 'nos', 'não', 'mais', 'muito',
    'muitos', 'muita', 'muitas', 'também', 'já', 'depois', 'antes', 'então', 'assim',
    'isso', 'isto', 'aquilo', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses',
    'essas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'ser', 'é', 'são', 'era', 'eram',
    'foi', 'foram', 'estar', 'está', 'estão', 'estava', 'estavam', 'ter', 'tem', 'têm',
    'tinha', 'tinham', 'fazer', 'faz', 'fazem', 'fez', 'fizeram', 'pode', 'podem',
    'podendo', 'deve', 'devem', 'devendo', 'ao', 'aos', 'à', 'às'
}

def test_translation_fidelity():
    print("\n--- Testing Translation Quality & LoL Term Preservation ---")
    matchup_path = os.path.join(SRC_DATA_DIR, "matchups.json")
    with open(matchup_path, 'r', encoding='utf-8') as f:
        matchups = json.load(f)
        
    # Check sample champions for proper English terms preservation in PT-BR text
    aatrox = next(m for m in matchups if m['championName'] == 'Aatrox')
    fiora = next(m for m in matchups if m['championName'] == 'Fiora')
    darius = next(m for m in matchups if m['championName'] == 'Darius')
    varus = next(m for m in matchups if m['championName'] == 'Varus')
    
    assert_true("PTA" in aatrox['runesRecommendation'] or "Conq" in aatrox['runesRecommendation'], "Aatrox runes preserve PTA / Conq")
    assert_true(any("Level 1" in t['titleEn'] or "Nível 1" in t['titlePt'] for t in aatrox['tips']), "Aatrox tips contain Level 1 translations")
    
    # Check LoL terms preserved in body text
    all_pt_text = " ".join([m['summaryPt'] + " " + m['detailedNotesRawPt'] for m in matchups])
    
    assert_true("Renekton" in all_pt_text, "Preserved 'Renekton' name")
    assert_true("Eclipse" in all_pt_text or "BoTRK" in all_pt_text or "Black Cleaver" in all_pt_text, "Preserved Core Items (Eclipse, BoTRK, Black Cleaver)")
    assert_true("PTA" in all_pt_text and "Conqueror" in all_pt_text, "Preserved Keystones (PTA, Conqueror)")
    assert_true("Flash" in all_pt_text and "Ignite" in all_pt_text and ("Teleport" in all_pt_text or "TP" in all_pt_text), "Preserved Summoners (Flash, Ignite, Teleport/TP)")
    assert_true("wave" in all_pt_text.lower() or "freeze" in all_pt_text.lower(), "Preserved Wave Management terms (wave, freeze)")
    assert_true("all-in" in all_pt_text.lower() or "short trade" in all_pt_text.lower() or "powerspike" in all_pt_text.lower(), "Preserved tactical terms (all-in, short trade, powerspike)")

def test_linguistic_density():
    print("\n--- Testing Rigorous Linguistic Density (>20:1 PT:EN Ratio) ---")
    import re
    matchup_path = os.path.join(SRC_DATA_DIR, "matchups.json")
    with open(matchup_path, 'r', encoding='utf-8') as f:
        matchups = json.load(f)
        
    all_pt = []
    for m in matchups:
        all_pt.append(m.get('summaryPt', ''))
        all_pt.append(m.get('detailedNotesRawPt', ''))
        for t in m.get('tips', []):
            all_pt.append(t.get('titlePt', ''))
            all_pt.append(t.get('contentPt', ''))
            
    full_text = " ".join(all_pt).lower()
    words = re.findall(r'\b[a-zA-ZÀ-ÿ\']+\b', full_text)
    total_words = len(words)
    en_count = sum(1 for w in words if w in EN_STOPWORDS)
    pt_count = sum(1 for w in words if w in PT_STOPWORDS)
    
    ratio = (pt_count / en_count) if en_count > 0 else 999.0
    en_pct = (en_count / total_words * 100) if total_words > 0 else 0
    pt_pct = (pt_count / total_words * 100) if total_words > 0 else 0
    
    print(f"  -> Total words analyzed: {total_words:,}")
    print(f"  -> Portuguese stopwords: {pt_count:,} ({pt_pct:.2f}%)")
    print(f"  -> English stopwords:    {en_count:,} ({en_pct:.2f}%)")
    print(f"  -> Ratio PT:EN:          {ratio:.2f} : 1")
    
    assert_true(total_words > 100_000, f"Analyzed exhaustive text corpus ({total_words:,} words)")
    assert_true(en_pct < 3.0, f"English stopwords strictly under 3.0% (actual: {en_pct:.2f}%)")
    assert_true(pt_pct > 30.0, f"Portuguese stopwords above 30.0% (actual: {pt_pct:.2f}%)")
    assert_true(ratio >= 20.0, f"Linguistic density ratio PT:EN exceeds 20.0 : 1 (actual: {ratio:.2f}:1)")

def test_guides_dataset():
    print("\n--- Testing guides.json ---")
    guide_path = os.path.join(SRC_DATA_DIR, "guides.json")
    assert_true(os.path.exists(guide_path), "guides.json exists")
    
    with open(guide_path, 'r', encoding='utf-8') as f:
        guides = json.load(f)
        
    assert_true(len(guides) == 8, f"Contains exactly 8 general guides (found: {len(guides)})")
    
    expected_categories = {
        'introduction', 'faq', 'fury_management', 'ability_starts_maxing',
        'items_builds', 'mechanics_combos', 'runes', 'summoners'
    }
    found_categories = {g['category'] for g in guides}
    assert_true(expected_categories == found_categories, f"All 8 expected guide categories present: {found_categories}")
    
    total_sections = 0
    for g in guides:
        assert_true(bool(g['titlePt']), f"Guide {g['category']} has PT title")
        assert_true(bool(g['descriptionPt']), f"Guide {g['category']} has PT description")
        assert_true(len(g['sections']) > 0, f"Guide {g['category']} has sections ({len(g['sections'])})")
        total_sections += len(g['sections'])
        for s in g['sections']:
            assert_true(bool(s['titlePt']), f"Section {s['id']} has titlePt")
            assert_true(bool(s['contentPt']), f"Section {s['id']} has contentPt")
            
    assert_true(total_sections >= 50, f"Total guide sections parsed (found: {total_sections})")

def test_sqlite_database_and_performance():
    print("\n--- Testing SQLite Database & Query Latency (<5ms) ---")
    db_path = os.path.join(DB_DIR, "champion_matchup.db")
    assert_true(os.path.exists(db_path), "champion_matchup.db binary file exists")
    
    db_size = os.path.getsize(db_path)
    assert_true(db_size > 100_000, f"Database size is healthy ({db_size / 1024:.1f} KB)")
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Test Table Counts
    cur.execute("SELECT COUNT(*) FROM champions")
    c_count = cur.fetchone()[0]
    assert_true(c_count == 170, f"Table champions has 170 rows (found: {c_count})")
    
    cur.execute("SELECT COUNT(*) FROM matchups")
    m_count = cur.fetchone()[0]
    assert_true(m_count == 170, f"Table matchups has 170 rows (found: {m_count})")
    
    cur.execute("SELECT COUNT(*) FROM matchup_tips")
    t_count = cur.fetchone()[0]
    assert_true(t_count == 1698, f"Table matchup_tips has 1698 rows (found: {t_count})")
    
    cur.execute("SELECT COUNT(*) FROM guide_sections")
    g_count = cur.fetchone()[0]
    assert_true(g_count == 55, f"Table guide_sections has 55 rows (found: {g_count})")
    
    # Foreign key test
    cur.execute("SELECT COUNT(*) FROM matchups m LEFT JOIN champions c ON m.champion_id = c.id WHERE c.id IS NULL")
    orphaned_matchups = cur.fetchone()[0]
    assert_true(orphaned_matchups == 0, "0 orphaned matchups (FK integrity valid)")
    
    cur.execute("SELECT COUNT(*) FROM matchup_tips t LEFT JOIN matchups m ON t.matchup_id = m.id WHERE m.id IS NULL")
    orphaned_tips = cur.fetchone()[0]
    assert_true(orphaned_tips == 0, "0 orphaned tips (FK integrity valid)")
    
    # Test User Notes CRUD
    cur.execute("""
        INSERT INTO user_notes (champion_id, match_result, perceived_difficulty, what_worked, what_failed, free_notes)
        VALUES (1, 'win', 4, 'Level 1 Q poke and freeze', 'Got ganked level 4', 'Rush Executioner against Aatrox')
    """)
    note_id = cur.lastrowid
    conn.commit()
    
    cur.execute("SELECT id, champion_id, match_result, perceived_difficulty FROM user_notes WHERE id = ?", (note_id,))
    note = cur.fetchone()
    assert_true(note is not None and note[2] == 'win' and note[3] == 4, "Created and retrieved test user note")
    
    cur.execute("DELETE FROM user_notes WHERE id = ?", (note_id,))
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM user_notes WHERE id = ?", (note_id,))
    deleted_count = cur.fetchone()[0]
    assert_true(deleted_count == 0, "Deleted test user note cleanly")
    
    # Benchmark 1000 Queries for Query Latency Test
    start_time = time.perf_counter()
    iterations = 1000
    
    for i in range(iterations):
        cid = (i % 170) + 1
        cur.execute("""
            SELECT m.id, c.name, m.difficulty_tier, m.difficulty_rating, m.runes_recommendation,
                   m.starting_items, m.summoner_spells, m.ability_max_order, m.summary_pt
            FROM matchups m
            JOIN champions c ON m.champion_id = c.id
            WHERE c.id = ?
        """, (cid,))
        row = cur.fetchone()
        
    elapsed_total = time.perf_counter() - start_time
    avg_latency_ms = (elapsed_total / iterations) * 1000
    
    print(f"  -> 1,000 queries executed in {elapsed_total*1000:.2f}ms (Average Latency: {avg_latency_ms:.3f}ms per query)")
    assert_true(avg_latency_ms < 5.0, f"Average query latency ({avg_latency_ms:.3f}ms) is strictly under 5ms requirement!")
    
    conn.close()

def main():
    print("=================================================================")
    print("RENEKTON MATCHUP TOOL - MILESTONE 1 VERIFICATION & INTEGRITY SUITE")
    print("=================================================================")
    
    test_champions_dataset()
    test_matchups_dataset()
    test_translation_fidelity()
    test_linguistic_density()
    test_guides_dataset()
    test_sqlite_database_and_performance()
    
    print("\n=================================================================")
    print(f"RESULTS: {passed_assertions} PASSED, {failed_assertions} FAILED")
    print("=================================================================")
    
    if failed_assertions > 0:
        sys.exit(1)
    else:
        print("ALL MILESTONE 1 INTEGRITY CHECKS PASSED WITH 100% SUCCESS!")
        sys.exit(0)

if __name__ == '__main__':
    main()
