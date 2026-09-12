import json

with open('src/data/matchups.json', 'r', encoding='utf-8') as f:
    matchups = json.load(f)

for name in ['Teemo', 'Aatrox', 'Riven', 'Darius', 'Quinn']:
    m = next((x for x in matchups if x['championName'] == name), None)
    if m:
        print(f"=== {name} ===")
        print(f"  Level 1 Start: {m.get('level1Start')} ({m.get('level1ExplanationPt')})")
        print(f"  Win Condition: {m.get('winConditionPt')}")
        print(f"  Caution: {m.get('cautionPt')}")
        print()
