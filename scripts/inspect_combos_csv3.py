with open('Docs/Guia de Renekton/The Ultimate Renekton Guide Spreadsheet - Mechanics + Combos.csv', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, line in enumerate(lines[160:]):
    print(f"{i+161}: {line.strip()[:100]}")
