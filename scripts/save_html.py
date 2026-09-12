import urllib.request, ssl, re, json
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request('https://www.deeplol.gg/llm?champion=58&enemy=266&position=top', headers:{'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req, context=ctx) as res:
    content = res.read().decode('utf-8')
with open('scripts/deeplol_html.txt', 'w', encoding='utf-8') as f:
    f.write(content)
print('File saved, checking scripts:')
scripts = re.findall(r'<script[^>]*src="['"]([^'"]+)['"]', content)
for sc in scripts:
    print('-', sc)
