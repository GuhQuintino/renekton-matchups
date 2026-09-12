import json, re

with open('src/data/matchups.json', 'r', encoding='utf-8') as f:
    matchups = json.load(f)

EN_WORDS = {'the', 'is', 'are', 'was', 'to', 'in', 'that', 'with', 'for', 'from', 'they', 'have', 'has', 'you', 'your', 'it', 'its', 'he', 'his', 'her', 'their', 'when', 'which', 'will', 'would', 'can', 'could', 'should', 'this', 'there', 'than', 'into', 'out', 'over', 'under'}
PT_WORDS = {'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'para', 'com', 'sem', 'que', 'se', 'como', 'quando', 'ele', 'ela', 'seu', 'sua', 'você', 'não', 'mais', 'muito', 'também', 'já', 'depois', 'ser', 'é', 'são', 'ter', 'tem', 'fazer', 'faz', 'pode', 'podem', 'e', 'ou'}

print("=== CHECKING ALL 170 MATCHUPS FOR UNTRANSLATED CONTENT ===")
bad_matchups = []
for m in matchups:
    cname = m['championName']
    # Check summary
    s_pt = m.get('summaryPt', '')
    w_sum = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", s_pt.lower())
    en_s = sum(1 for w in w_sum if w in EN_WORDS)
    pt_s = sum(1 for w in w_sum if w in PT_WORDS)
    if en_s > pt_s and en_s > 5:
        bad_matchups.append((cname, 'summaryPt', len(w_sum), pt_s, en_s, s_pt[:100]))
        
    # Check detailed notes
    d_pt = m.get('detailedNotesRawPt', '')
    w_det = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", d_pt.lower())
    en_d = sum(1 for w in w_det if w in EN_WORDS)
    pt_d = sum(1 for w in w_det if w in PT_WORDS)
    if en_d > pt_d and en_d > 10:
        bad_matchups.append((cname, 'detailedNotesRawPt', len(w_det), pt_d, en_d, d_pt[:100]))
        
    # Check tips
    for idx, t in enumerate(m.get('tips', [])):
        t_pt = t.get('contentPt', '')
        w_tip = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", t_pt.lower())
        en_t = sum(1 for w in w_tip if w in EN_WORDS)
        pt_t = sum(1 for w in w_tip if w in PT_WORDS)
        if en_t > pt_t and en_t > 5:
            bad_matchups.append((cname, f'tip_{idx+1}', len(w_tip), pt_t, en_t, t_pt[:100]))

print(f"Total Matchup Violations Found: {len(bad_matchups)}")
for bm in bad_matchups[:10]:
    print(f"  {bm[0]} | {bm[1]} | Words={bm[2]} | PT={bm[3]} | EN={bm[4]} | Snippet: {bm[5]}")
