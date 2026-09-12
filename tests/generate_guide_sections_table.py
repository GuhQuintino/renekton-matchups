import json, re

with open('src/data/guides.json', 'r', encoding='utf-8') as f:
    guides = json.load(f)

EN_WORDS = {'the', 'is', 'are', 'was', 'to', 'in', 'that', 'with', 'for', 'from', 'they', 'have', 'has', 'you', 'your', 'it', 'its', 'he', 'his', 'her', 'their', 'when', 'which', 'will', 'would', 'can', 'could', 'should', 'this', 'there', 'than', 'into', 'out', 'over', 'under'}
PT_WORDS = {'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'para', 'com', 'sem', 'que', 'se', 'como', 'quando', 'ele', 'ela', 'seu', 'sua', 'você', 'não', 'mais', 'muito', 'também', 'já', 'depois', 'ser', 'é', 'são', 'ter', 'tem', 'fazer', 'faz', 'pode', 'podem', 'e', 'ou'}

print("| Category | Section Key | Title PT | Total Words | PT Words | EN Words | Ratio PT:EN | Status |")
print("|---|---|---|---|---|---|---|---|")

total_sections = 0
passed_sections = 0
failed_sections = 0

for g in guides:
    cat = g['category']
    for s in g['sections']:
        total_sections += 1
        skey = s['sectionKey']
        title_pt = s.get('titlePt', '')
        c_pt = s.get('contentPt', '')
        words = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", c_pt.lower())
        total_w = len(words)
        if total_w == 0:
            status = "EMPTY"
            print(f"| `{cat}` | `{skey}` | {title_pt} | 0 | 0 | 0 | N/A | EMPTY |")
            continue
            
        en_c = sum(1 for w in words if w in EN_WORDS)
        pt_c = sum(1 for w in words if w in PT_WORDS)
        ratio = (pt_c / en_c) if en_c > 0 else (pt_c if pt_c > 0 else 1.0)
        
        if en_c > pt_c and total_w > 50:
            status = "**FAIL (RAW ENGLISH)**"
            failed_sections += 1
        elif ratio < 2.0 and total_w > 50:
            status = "**WARN (LOW PT)**"
            failed_sections += 1
        else:
            status = "PASS"
            passed_sections += 1
            
        print(f"| `{cat}` | `{skey}` | {title_pt[:30]} | {total_w} | {pt_c} | {en_c} | {ratio:.2f}:1 | {status} |")

print(f"\nTotal Sections: {total_sections} | Passed: {passed_sections} | Failed: {failed_sections}")
