import json, os

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Guides
with open(os.path.join(base, "src/data/guides.json"), "r", encoding="utf-8") as f:
    guides = json.load(f)
print(f"guides.json: {type(guides).__name__}, {len(guides)} items")
for i, g in enumerate(guides):
    cat = g.get("category", "?")
    secs = len(g.get("sections", []))
    print(f"  [{i}] {cat}: {secs} sections")

# Matchups
with open(os.path.join(base, "src/data/matchups.json"), "r", encoding="utf-8") as f:
    matchups = json.load(f)
print(f"\nmatchups.json: {type(matchups).__name__}, {len(matchups)} items")
if isinstance(matchups, list) and len(matchups) > 0:
    sample = matchups[0]
    print(f"  Keys: {list(sample.keys())}")
    print(f"  Sample champion: {sample.get('champion', sample.get('championName', '?'))}")

# Champions
with open(os.path.join(base, "src/data/champions.json"), "r", encoding="utf-8") as f:
    champs = json.load(f)
print(f"\nchampions.json: {type(champs).__name__}, {len(champs)} items")

# Matchup summaries
with open(os.path.join(base, "src/data/matchup-summaries.json"), "r", encoding="utf-8") as f:
    summaries = json.load(f)
print(f"\nmatchup-summaries.json: {type(summaries).__name__}, {len(summaries)} items")

# Check untranslated in items_builds
print("\n--- Checking items_builds translation ---")
for g in guides:
    if g.get("category") == "items_builds":
        for s in g.get("sections", []):
            key = s.get("sectionKey", "?")
            pt = s.get("contentPt", "")
            en = s.get("contentEn", "")
            if pt == en and len(pt) > 50:
                print(f"  UNTRANSLATED: {key} ({len(pt)} chars)")
            elif pt == en:
                print(f"  SAME (short): {key} ({len(pt)} chars)")
        break
