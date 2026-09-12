# -*- coding: utf-8 -*-
"""
Adversarial Empirical Verification Harness for M1 Gate 2 Remediation
Author: Challenger 1 (Roles: critic, specialist)
Objective: Rigorous stress-testing of Language Density, Macaronic/Untranslated Text, Special Characters, and SQLite Parity.
"""

import json
import os
import re
import sqlite3
import sys
import time
from typing import Dict, List, Any, Set, Tuple

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DATA_DIR = os.path.join(BASE_DIR, 'src', 'data')
DB_DIR = os.path.join(BASE_DIR, 'src-tauri', 'src', 'db')
DB_PATH = os.path.join(DB_DIR, 'champion_matchup.db')

# --- STOPWORD LEXICONS ---
# English grammatical function words (excluding Portuguese homographs like 'a', 'do', 'no', 'as', 'se', 'me')
EN_STOPWORDS: Set[str] = {
    'the', 'is', 'are', 'was', 'were', 'to', 'in', 'that', 'with', 'for', 'from',
    'they', 'be', 'been', 'being', 'have', 'has', 'had', 'or', 'you', 'your', 'it', 'its',
    'he', 'his', 'him', 'she', 'her', 'hers', 'their', 'theirs', 'them', 'when', 'which',
    'will', 'would', 'can', 'could', 'should', 'if', 'this', 'these', 'those', 'then',
    'there', 'than', 'into', 'up', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'once', 'here', 'why', 'how', 'any', 'both', 'each', 'few',
    'most', 'other', 'some', 'such', 'nor', 'not', 'only', 'own', 'same',
    'too', 'very', 'just', 'between', 'through', 'during',
    'above', 'below', 'about', 'against', 'while', 'where', 'because', 'down',
    'by', 'at', 'an', 'doing', 'does', 'did'
}

PT_STOPWORDS: Set[str] = {
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'para',
    'pra', 'com', 'sem', 'que', 'se', 'como', 'quando', 'onde', 'porque', 'por que',
    'ele', 'ela', 'eles', 'elas', 'dele', 'dela', 'deles', 'delas', 'seu', 'sua', 'seus',
    'suas', 'você', 'vocês', 'te', 'lhe', 'lhes', 'me', 'não', 'mais', 'muito',
    'muitos', 'muita', 'muitas', 'também', 'já', 'depois', 'antes', 'então', 'assim',
    'isso', 'isto', 'aquilo', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses',
    'essas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'ser', 'é', 'são', 'era', 'eram',
    'foi', 'foram', 'estar', 'está', 'estão', 'estava', 'estavam', 'ter', 'tem', 'têm',
    'tinha', 'tinham', 'fazer', 'faz', 'fazem', 'fez', 'fizeram', 'pode', 'podem',
    'podendo', 'deve', 'devem', 'devendo', 'ao', 'aos', 'à', 'às', 'outro', 'outra',
    'outros', 'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas', 'nossa', 'nosso', 'nossos',
    'nossas', 'nós', 'puder', 'quiser', 'houver', 'haver', 'há', 'num', 'numa', 'e', 'ou'
}

test_stats = {
    'total_asserts': 0,
    'passed': 0,
    'failed': 0,
    'failures': []
}

def c_assert(cond: bool, test_name: str, msg: str = ''):
    test_stats['total_asserts'] += 1
    if cond:
        test_stats['passed'] += 1
        print(f'  [PASS] {test_name}: {msg}')
    else:
        test_stats['failed'] += 1
        err = f'  [FAIL] {test_name}: {msg}'
        test_stats['failures'].append(err)
        print(err)

def run_tests():
    print('=' * 80)
    print('CHALLENGER 1: ADVERSARIAL LINGUISTIC DENSITY & INTEGRITY TEST HARNESS')
    print('=' * 80)

    # 1. LOAD DATA FILES
    print('\n>>> SUITE 1: JSON Datasets File Integrity')
    matchups_p = os.path.join(SRC_DATA_DIR, 'matchups.json')
    champions_p = os.path.join(SRC_DATA_DIR, 'champions.json')
    guides_p = os.path.join(SRC_DATA_DIR, 'guides.json')
    summaries_p = os.path.join(SRC_DATA_DIR, 'matchup-summaries.json')

    c_assert(os.path.exists(matchups_p), 'matchups.json exists')
    c_assert(os.path.exists(champions_p), 'champions.json exists')
    c_assert(os.path.exists(guides_p), 'guides.json exists')
    c_assert(os.path.exists(summaries_p), 'matchup-summaries.json exists')

    with open(matchups_p, 'r', encoding='utf-8') as f:
        matchups_data = json.load(f)
    with open(champions_p, 'r', encoding='utf-8') as f:
        champions_data = json.load(f)
    with open(guides_p, 'r', encoding='utf-8') as f:
        guides_data = json.load(f)
    with open(summaries_p, 'r', encoding='utf-8') as f:
        summaries_data = json.load(f)

    c_assert(len(matchups_data) == 170, f'matchups.json has 170 champions (actual: {len(matchups_data)})')
    c_assert(len(champions_data) == 170, f'champions.json has 170 champions (actual: {len(champions_data)})')
    c_assert(len(summaries_data) == 170, f'matchup-summaries.json has 170 summaries (actual: {len(summaries_data)})')
    c_assert(len(guides_data) == 8, f'guides.json has 8 guides (actual: {len(guides_data)})')

    # 2. LINGUISTIC DENSITY & STOPWORD RATIO ACROSS ALL 170 CHAMPIONS
    print('\n>>> SUITE 2: Global & Per-Champion Portuguese Linguistic Density')
    
    global_pt_words = []
    global_en_stopwords_found = []
    global_pt_stopwords_found = []

    per_champ_metrics = []
    low_ratio_champions = []

    for m in matchups_data:
        champ_name = m.get('championName', 'Unknown')
        sheet_name = m.get('sheetName', 'Unknown')
        
        champ_pt_texts = [
            m.get('summaryPt', ''),
            m.get('detailedNotesRawPt', '')
        ]
        for t in m.get('tips', []):
            champ_pt_texts.append(t.get('titlePt', ''))
            champ_pt_texts.append(t.get('contentPt', ''))

        full_champ_pt = ' '.join(champ_pt_texts)
        words = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", full_champ_pt.lower())
        
        total_w = len(words)
        en_stop_count = sum(1 for w in words if w in EN_STOPWORDS)
        pt_stop_count = sum(1 for w in words if w in PT_STOPWORDS)
        ratio = (pt_stop_count / en_stop_count) if en_stop_count > 0 else float('inf')
        
        global_pt_words.extend(words)
        global_en_stopwords_found.extend([w for w in words if w in EN_STOPWORDS])
        global_pt_stopwords_found.extend([w for w in words if w in PT_STOPWORDS])

        per_champ_metrics.append({
            'champion': champ_name,
            'sheet': sheet_name,
            'total_words': total_w,
            'en_stops': en_stop_count,
            'pt_stops': pt_stop_count,
            'ratio': ratio
        })

        if ratio < 20.0:
            low_ratio_champions.append((champ_name, ratio, en_stop_count, pt_stop_count))

    for g in guides_data:
        guide_texts = [g.get('titlePt', ''), g.get('descriptionPt', '')]
        for s in g.get('sections', []):
            guide_texts.append(s.get('titlePt', ''))
            guide_texts.append(s.get('contentPt', ''))
        g_full = ' '.join(guide_texts)
        g_words = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", g_full.lower())
        global_pt_words.extend(g_words)
        global_en_stopwords_found.extend([w for w in g_words if w in EN_STOPWORDS])
        global_pt_stopwords_found.extend([w for w in g_words if w in PT_STOPWORDS])

    tot_w = len(global_pt_words)
    tot_en_stops = len(global_en_stopwords_found)
    tot_pt_stops = len(global_pt_stopwords_found)
    global_ratio = (tot_pt_stops / tot_en_stops) if tot_en_stops > 0 else float('inf')
    en_pct = (tot_en_stops / tot_w * 100) if tot_w > 0 else 0
    pt_pct = (tot_pt_stops / tot_w * 100) if tot_w > 0 else 0

    print(f'  Total Portuguese Words Analyzed: {tot_w:,}')
    print(f'  Portuguese Stopwords:           {tot_pt_stops:,} ({pt_pct:.2f}%)')
    print(f'  English Stopwords:              {tot_en_stops:,} ({en_pct:.2f}%)')
    print(f'  Global PT to EN Ratio:          {global_ratio:.2f} : 1')

    c_assert(global_ratio >= 20.0, f'Global PT:EN Stopword Ratio >= 20:1 (actual: {global_ratio:.2f}:1)')
    c_assert(en_pct < 2.0, f'English Stopwords Percentage in PT body < 2.0% (actual: {en_pct:.2f}%)')
    c_assert(pt_pct > 35.0, f'Portuguese Stopwords Percentage in PT body > 35.0% (actual: {pt_pct:.2f}%)')
    c_assert(len(low_ratio_champions) == 0, f'Zero champions with PT:EN ratio < 20:1 (count: {len(low_ratio_champions)})')
    if low_ratio_champions:
        for lc in low_ratio_champions[:5]:
            print(f'    Low ratio champ: {lc[0]} (Ratio: {lc[1]:.2f}:1, EN: {lc[2]}, PT: {lc[3]})')

    # 3. ADVERSARIAL PATTERN MATCHING: MACARONIC PORTINGLISH & UNTRANSLATED PHRASES
    print('\n>>> SUITE 3: Adversarial Scan for Untranslated Phrases & Macaronic Patterns')
    
    banned_english_phrases = [
        r'\bis a very volatile match up\b',
        r'\bwithin the early stages\b',
        r'\bplay the match up optimally\b',
        r'\bbefore (?:he|she|they) outscales\b',
        r'\bwhen playing vs\b',
        r'\btry not to fight him with\b',
        r'\bfully stacked from the wave\b',
        r'\bas his ability to\b',
        r'\bhard win trocas\b',
        r'\bwhen (?:jax|renekton|darius|aatrox|fiora) walks in with\b',
        r'\bproviding us the ability to\b',
        r'\bburn .* mana and cds\b',
        r'\bcan be a very awkward match up\b',
        r'\bdepending on how good he is\b',
        r'\bopperate a lot differently\b',
        r'\bforcing you to optimally play\b',
        r'\bto a tee\b',
        r'\bwhen it comes to\b',
        r'\bit separates the skill level between\b',
        r'\bseems easy to do\b',
        r"\bmost people don't fully consider\b",
        r'\bmake sure to\b',
        r'\bin order to\b',
        r'\bkeep in mind that\b',
        r'\bwatch out for\b',
        r"\bdon't forget to\b",
        r'\byou should look to\b',
        r'\bwe can time our\b',
        r'\bwe should use our\b',
        r'\bis very apparent with\b'
    ]

    all_pt_corpus = []
    for m in matchups_data:
        all_pt_corpus.append((m['championName'], 'summaryPt', m.get('summaryPt', '')))
        all_pt_corpus.append((m['championName'], 'detailedNotesRawPt', m.get('detailedNotesRawPt', '')))
        for idx, t in enumerate(m.get('tips', [])):
            all_pt_corpus.append((m['championName'], f'tip_{idx+1}_title', t.get('titlePt', '')))
            all_pt_corpus.append((m['championName'], f'tip_{idx+1}_content', t.get('contentPt', '')))

    for g in guides_data:
        all_pt_corpus.append((g['category'], 'guide_desc', g.get('descriptionPt', '')))
        for s in g.get('sections', []):
            all_pt_corpus.append((g['category'], f"section_{s.get('sectionKey')}", s.get('contentPt', '')))

    phrase_violations = []
    for pattern in banned_english_phrases:
        compiled = re.compile(pattern, re.IGNORECASE)
        for entity_id, field, text in all_pt_corpus:
            m = compiled.search(text)
            if m:
                phrase_violations.append((entity_id, field, m.group(0), pattern))

    c_assert(len(phrase_violations) == 0, f'Zero Banned English Phrases / Macaronic Patterns in PT text (violations: {len(phrase_violations)})')
    if phrase_violations:
        for v in phrase_violations:
            print(f'    Violation detail: Champ/Guide={v[0]} Field={v[1]} Matched="{v[2]}" Pattern="{v[3]}"')

    corruption_patterns = [
        (r'__T\d+__', 'Masking placeholder token __T...__'),
        (r'\bTODO\b', 'TODO marker'),
        (r'\bFIXME\b', 'FIXME marker'),
        (r'\bundefined\b', 'JS undefined'),
        (r'\bnull\b', 'null string literal'),
        (r'\bNaN\b', 'NaN numeric error'),
        (r'\ufffd', 'Unicode replacement character \\ufffd (mojibake)'),
        (r'Ã[¡-¿]', 'UTF-8 Mojibake double encoding (e.g. Ã£, Ã©)')
    ]

    corruption_violations = []
    for pat, desc in corruption_patterns:
        compiled = re.compile(pat)
        for entity_id, field, text in all_pt_corpus:
            if compiled.search(text):
                corruption_violations.append((entity_id, field, desc))

    c_assert(len(corruption_violations) == 0, f'Zero Corruption / Masking / Mojibake Tokens in PT text (violations: {len(corruption_violations)})')
    if corruption_violations:
        for cv in corruption_violations[:5]:
            print(f'    Corruption sample: {cv}')

    # 4. COMPLEX CHAMPION NAMES & SPECIAL CHARACTERS INTEGRITY
    print('\n>>> SUITE 4: Complex Champion Names & Special Characters Integrity across 170 champions')
    
    complex_cases = [
        ('DR.Mundo', 'Dr. Mundo', 'DrMundo', 'Period / Abbreviation'),
        ("K'sante", "K'Sante", 'KSante', 'Apostrophe'),
        ('Kaisa', "Kai'Sa", 'Kaisa', 'Apostrophe in Name'),
        ("Kha'zix", "Kha'Zix", 'Khazix', 'Apostrophe'),
        ("Cho'Gath", "Cho'Gath", 'Chogath', 'Apostrophe'),
        ("Vel'Koz", "Vel'Koz", 'Velkoz', 'Apostrophe'),
        ("Rek'Sai", "Rek'Sai", 'RekSai', 'Apostrophe'),
        ("Bel'Veth", "Bel'Veth", 'Belveth', 'Apostrophe'),
        ("Kog'Maw", "Kog'Maw", 'KogMaw', 'Apostrophe'),
        ('LeBlanc', 'LeBlanc', 'Leblanc', 'CamelCase / Lowercase key'),
        ('Wukong', 'Wukong', 'MonkeyKing', 'Different Riot Key'),
        ('Renata', 'Renata Glasc', 'Renata', 'Extended Title'),
        ('Nunu', 'Nunu & Willump', 'Nunu', 'Ampersand in Name'),
        ('Jarvan IV', 'Jarvan IV', 'JarvanIV', 'Roman Numerals & Spaces'),
        ('Lee Sin', 'Lee Sin', 'LeeSin', 'Two words / Space'),
        ('Master Yi', 'Master Yi', 'MasterYi', 'Two words / Space'),
        ('Miss Fortune', 'Miss Fortune', 'MissFortune', 'Two words / Space'),
        ('Tahm Kench', 'Tahm Kench', 'TahmKench', 'Two words / Space'),
        ('Twisted Fate', 'Twisted Fate', 'TwistedFate', 'Two words / Space'),
        ('Xin Zhao', 'Xin Zhao', 'XinZhao', 'Two words / Space'),
        ('Aurelion Sol', 'Aurelion Sol', 'AurelionSol', 'Two words / Space'),
        ('Lillah', 'Lillia', 'Lillia', 'Typo in source CSV'),
        ('Millio', 'Milio', 'Milio', 'Typo in source CSV'),
        ('Nillah', 'Nilah', 'Nilah', 'Typo in source CSV')
    ]

    champ_by_sheet = {c['sheetName']: c for c in champions_data}
    matchup_by_sheet = {m['sheetName']: m for m in matchups_data}

    for sheet, exp_name, exp_key, cat in complex_cases:
        c_obj = champ_by_sheet.get(sheet)
        m_obj = matchup_by_sheet.get(sheet)
        
        c_assert(c_obj is not None, f'Champion "{sheet}" exists in champions.json ({cat})')
        if c_obj:
            c_assert(c_obj['name'] == exp_name, f'Champ "{sheet}" name matches "{exp_name}" (actual: "{c_obj.get("name")}")')
            c_assert(c_obj['riotKey'] == exp_key, f'Champ "{sheet}" riotKey matches "{exp_key}" (actual: "{c_obj.get("riotKey")}")')
            exp_icon = f'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/{exp_key}.png'
            c_assert(c_obj['iconUrl'] == exp_icon, f'Champ "{sheet}" iconUrl matches DDragon CDN (actual: "{c_obj.get("iconUrl")}")')

        if m_obj:
            c_assert(m_obj['championName'] == exp_name, f'Matchup "{sheet}" championName matches "{exp_name}" (actual: "{m_obj.get("championName")}")')
            c_assert(m_obj['riotKey'] == exp_key, f'Matchup "{sheet}" riotKey matches "{exp_key}" (actual: "{m_obj.get("riotKey")}")')

    # 5. ALL 170 CHAMPIONS STRUCTURAL & FIELD INTEGRITY
    print('\n>>> SUITE 5: Exhaustive 170 Champions Completeness & Tip Counts')
    
    total_tips_json = sum(len(m.get('tips', [])) for m in matchups_data)
    print(f'  Total tips across all 170 matchups in JSON: {total_tips_json}')
    c_assert(total_tips_json == 1698, f'Exact 1,698 tips across all matchups (actual: {total_tips_json})')

    empty_required_fields = 0
    for idx, m in enumerate(matchups_data):
        req_fields = [
            'championId', 'championName', 'riotKey', 'sheetName',
            'difficultyTier', 'difficultyRating', 'runesRecommendation',
            'startingItems', 'summonerSpells', 'abilityMaxOrder',
            'summaryPt', 'summaryEn', 'detailedNotesRawPt', 'detailedNotesRawEn',
            'tips'
        ]
        for f in req_fields:
            val = m.get(f)
            if val is None or (isinstance(val, str) and not val.strip()) or (isinstance(val, list) and len(val) == 0):
                empty_required_fields += 1
                print(f'    Empty field: Champ={m.get("championName")} Field={f}')

    c_assert(empty_required_fields == 0, f'Zero empty or null required fields across all 170 matchups (violations: {empty_required_fields})')

    # 6. SQLITE DATABASE EXHAUSTIVE PARITY & FORENSIC CHECKS
    print('\n>>> SUITE 6: SQLite Database Exhaustive Parity & Performance Check')
    c_assert(os.path.exists(DB_PATH), f'champion_matchup.db exists at {DB_PATH}')

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute('PRAGMA integrity_check;')
    integ = cur.fetchall()
    c_assert(integ == [('ok',)], f'SQLite PRAGMA integrity_check is ok (actual: {integ})')

    cur.execute('PRAGMA foreign_key_check;')
    fk_res = cur.fetchall()
    c_assert(len(fk_res) == 0, f'SQLite PRAGMA foreign_key_check reported 0 violations (actual: {len(fk_res)})')

    # Table counts
    cur.execute('SELECT COUNT(*) FROM champions;')
    db_champ_cnt = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM matchups;')
    db_matchup_cnt = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM matchup_tips;')
    db_tips_cnt = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM guide_sections;')
    db_guides_cnt = cur.fetchone()[0]

    c_assert(db_champ_cnt == 170, f'SQLite champions table has 170 rows (actual: {db_champ_cnt})')
    c_assert(db_matchup_cnt == 170, f'SQLite matchups table has 170 rows (actual: {db_matchup_cnt})')
    c_assert(db_tips_cnt == 1698, f'SQLite matchup_tips table has 1698 rows (actual: {db_tips_cnt})')
    c_assert(db_guides_cnt == 55, f'SQLite guide_sections table has 55 rows (actual: {db_guides_cnt})')

    # Cross-match JSON vs SQLite field by field
    cur.execute('''
        SELECT c.id, c.name, c.sheet_name, c.riot_key, m.difficulty_tier, m.difficulty_rating,
               m.runes_recommendation, m.starting_items, m.summoner_spells, m.ability_max_order,
               m.summary_pt, m.summary_en, m.detailed_notes_raw_pt, m.detailed_notes_raw_en
        FROM champions c
        JOIN matchups m ON m.champion_id = c.id
        ORDER BY c.id ASC;
    ''')
    db_rows = cur.fetchall()
    
    mismatch_cnt = 0
    for row in db_rows:
        cid, name, sheet, key, diff_tier, diff_rat, runes, items, summs, order, sum_pt, sum_en, det_pt, det_en = row
        jm = matchup_by_sheet.get(sheet)
        if not jm:
            mismatch_cnt += 1
            continue
        if (jm['championName'] != name or jm['riotKey'] != key or
            jm['difficultyTier'] != diff_tier or jm['difficultyRating'] != diff_rat or
            jm['runesRecommendation'] != runes or jm['startingItems'] != items or
            jm['summonerSpells'] != summs or jm['abilityMaxOrder'] != order or
            jm['summaryPt'] != sum_pt or jm['detailedNotesRawPt'] != det_pt):
            mismatch_cnt += 1
            print(f'    DB-JSON Mismatch for sheet: {sheet}')

    c_assert(mismatch_cnt == 0, f'100% Exact Parity between SQLite and JSON across all 170 records (mismatches: {mismatch_cnt})')

    # SQLite query latency stress benchmark
    latencies = []
    for i in range(1000):
        t0 = time.perf_counter()
        cid = (i % 170) + 1
        cur.execute('''
            SELECT c.name, m.difficulty_tier, m.summary_pt, t.title_pt, t.content_pt
            FROM champions c
            JOIN matchups m ON m.champion_id = c.id
            LEFT JOIN matchup_tips t ON t.matchup_id = m.id
            WHERE c.id = ?1;
        ''', (cid,))
        rows = cur.fetchall()
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0)

    avg_lat = sum(latencies) / len(latencies)
    latencies.sort()
    p95_lat = latencies[int(len(latencies) * 0.95)]
    print(f'  SQLite Query Latency over 1,000 iterations: Avg = {avg_lat:.4f} ms | P95 = {p95_lat:.4f} ms')
    c_assert(avg_lat < 1.0, f'SQLite Average Query Latency < 1.0 ms (actual: {avg_lat:.4f} ms)')
    c_assert(p95_lat < 2.0, f'SQLite P95 Query Latency < 2.0 ms (actual: {p95_lat:.4f} ms)')

    conn.close()

    # 7. SUMMARY
    print('\n' + '=' * 80)
    print(f'ADVERSARIAL HARNESS SUMMARY: {test_stats["passed"]} PASSED, {test_stats["failed"]} FAILED (Total Asserts: {test_stats["total_asserts"]})')
    print('=' * 80)

    if test_stats['failed'] == 0:
        print('>>> FINAL EMPIRICAL VERDICT: APPROVE <<<')
        return 0
    else:
        print('>>> FINAL EMPIRICAL VERDICT: REQUEST_CHANGES <<<')
        for f in test_stats['failures']:
            print(f)
        return 1

if __name__ == '__main__':
    sys.exit(run_tests())
