import os, re

base_dir = r"c:\Users\Gustavo\Desktop\Champion Matchup"
extensions = ('.json', '.html', '.ts', '.tsx', '.rs', '.sql', '.toml', '.md')

matches = []
for root, dirs, files in os.walk(base_dir):
    if any(ignore in root for ignore in ['node_modules', 'dist', '.git', 'target', '.agents', '.qatest']):
        continue
    for f in files:
        if f.endswith(extensions):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if re.search(r'loltheory|LoLTheory|LOLTheory', content, re.IGNORECASE):
                        matches.append(path)
            except Exception as e:
                pass

for m in matches:
    print(m)
