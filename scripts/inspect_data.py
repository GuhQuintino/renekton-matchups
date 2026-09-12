import json

with open('src/data/matchups.json', 'r', encoding='utf-8') as f:
    matchups = json.load(f)

teemo = next((m for m in matchups if m['championName'] == 'Teemo'), None)
if teemo:
    print(f"=== TEEMO TIPS ({len(teemo['tips'])}) ===")
    for t in teemo['tips']:
        print(f"{t['tipNumber']}. {t['titleEn']} | {t['titlePt']}")
        print(f"   EN: {t['contentEn']}")
        print(f"   PT: {t['contentPt']}")
        print()

print("=== SAMPLE ABILITY MAX ORDERS IN MATCHUPS ===")
orders = set(m.get('abilityMaxOrder', '') for m in matchups)
print("Orders found in matchups:", orders)
