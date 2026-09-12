import urllib.request
import json

url = "https://ddragon.leagueoflegends.com/cdn/14.24.1/data/en_US/champion/Renekton.json"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        renek = data['data']['Renekton']
        print("Passive:", renek['passive']['image']['full'])
        for spell in renek['spells']:
            print(f"Spell {spell['id']}: {spell['name']} -> {spell['image']['full']}")
except Exception as e:
    print("Error fetching ddragon:", e)
