import json, re

with open('src/data/matchups.json', 'r', encoding='utf-8') as f:
    matchups = json.load(f)
with open('src/data/guides.json', 'r', encoding='utf-8') as f:
    guides = json.load(f)

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
for m in matchups:
    all_pt_corpus.append((m['championName'], 'summaryPt', m.get('summaryPt', '')))
    all_pt_corpus.append((m['championName'], 'detailedNotesRawPt', m.get('detailedNotesRawPt', '')))
    for idx, t in enumerate(m.get('tips', [])):
        all_pt_corpus.append((m['championName'], f'tip_{idx+1}_title', t.get('titlePt', '')))
        all_pt_corpus.append((m['championName'], f'tip_{idx+1}_content', t.get('contentPt', '')))

for g in guides:
    all_pt_corpus.append((g['category'], 'guide_desc', g.get('descriptionPt', '')))
    for s in g.get('sections', []):
        all_pt_corpus.append((g['category'], f"section_{s.get('sectionKey')}", s.get('contentPt', '')))

for pattern in banned_english_phrases:
    compiled = re.compile(pattern, re.IGNORECASE)
    for entity_id, field, text in all_pt_corpus:
        m = compiled.search(text)
        if m:
            print(f"FOUND: Champ={entity_id} | Field={field} | Match='{m.group(0)}' | Pattern='{pattern}'")
            start = max(0, m.start()-60)
            end = min(len(text), m.end()+60)
            print(f"Context: ...{text[start:end]}...\n")
