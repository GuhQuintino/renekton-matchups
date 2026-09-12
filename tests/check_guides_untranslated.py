import json, sqlite3

with open('src/data/guides.json', 'r', encoding='utf-8') as f:
    guides = json.load(f)

for g in guides:
    for s in g['sections']:
        c_pt = s.get('contentPt', '')
        c_en = s.get('contentEn', '')
        if c_pt == c_en:
            print(f"EXACT SAME PT AND EN: Guide={g['category']} Section={s['sectionKey']}")
        elif len(c_pt) > 50 and 'the' in c_pt.lower().split() and 'is' in c_pt.lower().split():
            print(f"SUSPECT UNTRANSLATED: Guide={g['category']} Section={s['sectionKey']}")
            print(f"  Title PT: {s.get('titlePt')}")
            print(f"  Content PT preview: {c_pt[:200]}...\n")
