with open('Docs/Guia de Renekton/The Ultimate Renekton Guide Spreadsheet - Mechanics + Combos.csv', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

print(f"Total lines in Mechanics + Combos: {len(lines)}")
for i, line in enumerate(lines[:60]):
    print(f"{i+1}: {line.strip()[:100]}")
