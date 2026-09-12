import json
import re

with open('src/data/matchups.json', 'r', encoding='utf-8') as f:
    matchups = json.load(f)

print(f"Total matchups: {len(matchups)}")

# Sample analysis of first 5 champions
for m in matchups[:5]:
    print(f"Champion: {m['championName']}")
    print(f"  Summary PT: {m.get('summaryPt', '')[:100]}...")
    tips = m.get('tips', [])
    print(f"  Tips count: {len(tips)}")
    if tips:
        print(f"  Tip 1: {tips[0].get('titlePt')} -> {tips[0].get('contentPt')[:80]}...")
        if len(tips) > 1:
            print(f"  Tip 2: {tips[1].get('titlePt')} -> {tips[1].get('contentPt')[:80]}...")
    print("-" * 50)
