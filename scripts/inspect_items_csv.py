with open('Docs/Guia de Renekton/The Ultimate Renekton Guide Spreadsheet - Items + Builds.csv', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, line in enumerate(lines[:35]):
    print(f"{i+1}: {line.strip()[:100]}")
