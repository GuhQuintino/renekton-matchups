import json

with open('src/data/matchups.json', 'r', encoding='utf-8') as f:
    matchups = json.load(f)

items_dist = {}
for m in matchups:
    item = m.get('startingItems', 'Desconhecido')
    items_dist[item] = items_dist.get(item, 0) + 1

for k, v in sorted(items_dist.items(), key=lambda x: x[1], reverse=True):
    print(f"{k}: {v} champions")
