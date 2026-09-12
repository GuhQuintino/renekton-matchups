import json
import re

with open('src/data/matchups.json', 'r', encoding='utf-8') as f:
    matchups = json.load(f)

starts = {'Q': [], 'W': [], 'E': [], 'E_Alcove': [], 'Situational': [], 'Unknown': []}

for m in matchups:
    name = m['championName']
    tips = m.get('tips', [])
    summary = m.get('summaryEn', '')
    found = None
    
    # Check first tip
    if tips:
        t0 = tips[0]
        title = t0.get('titleEn', '')
        content = t0.get('contentEn', '')
        # Also check all tips for "Level 1"
        for t in tips:
            ttitle = t.get('titleEn', '')
            tcontent = t.get('contentEn', '')
            if 'level 1' in ttitle.lower() or 'level 1' in tcontent.lower()[:30]:
                text = (ttitle + ' ' + tcontent).lower()
                if 'alcove' in text:
                    found = 'E_Alcove'
                    break
                elif 'situational' in text or 'counter' in text:
                    found = 'Situational'
                    break
                elif 'e start' in text or 'start e' in text:
                    found = 'E'
                    break
                elif 'w start' in text or 'start w' in text:
                    found = 'W'
                    break
                elif 'q start' in text or 'start q' in text:
                    found = 'Q'
                    break
    
    if not found:
        # Fallback check in summary
        slower = summary.lower()
        if 'start e' in slower or 'e start' in slower:
            found = 'E'
        elif 'start w' in slower or 'w start' in slower:
            found = 'W'
        elif 'start q' in slower or 'q start' in slower:
            found = 'Q'
        else:
            found = 'Unknown'
            
    starts[found].append(name)

for k, v in starts.items():
    print(f"=== {k} ({len(v)}) ===")
    print(", ".join(v[:25]))
    if len(v) > 25:
        print(f"... and {len(v)-25} more")
