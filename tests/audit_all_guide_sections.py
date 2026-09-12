import json, re

with open('src/data/guides.json', 'r', encoding='utf-8') as f:
    guides = json.load(f)

EN_WORDS = {'the', 'is', 'are', 'was', 'to', 'in', 'that', 'with', 'for', 'from', 'they', 'have', 'has', 'you', 'your', 'it', 'its', 'he', 'his', 'her', 'their', 'when', 'which', 'will', 'would', 'can', 'could', 'should', 'this', 'there', 'than', 'into', 'out', 'over', 'under'}
PT_WORDS = {'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'para', 'com', 'sem', 'que', 'se', 'como', 'quando', 'ele', 'ela', 'seu', 'sua', 'você', 'não', 'mais', 'muito', 'também', 'já', 'depois', 'ser', 'é', 'são', 'ter', 'tem', 'fazer', 'faz', 'pode', 'podem', 'e', 'ou'}

print("=== AUDIT OF ALL 55 GUIDE SECTIONS IN guides.json ===")
for g in guides:
    cat = g['category']
    for s in g['sections']:
        skey = s['sectionKey']
        c_pt = s.get('contentPt', '')
        words = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", c_pt.lower())
        if not words:
            print(f"[EMPTY] Guide={cat} Section={skey}")
            continue
        en_c = sum(1 for w in words if w in EN_WORDS)
        pt_c = sum(1 for w in words if w in PT_WORDS)
        ratio = (pt_c / en_c) if en_c > 0 else 999.0
        
        status = "PASS" if (ratio > 2.0 and pt_c > en_c) else "FAIL (UNTRANSLATED / ENGLISH)"
        if "FAIL" in status or en_c > 10:
            print(f"[{status}] Guide={cat} | Section={skey} | Words={len(words)} | PT={pt_c} | EN={en_c} | Ratio={ratio:.2f}:1")
            print(f"  Snippet: {c_pt[:150]}...\n")
