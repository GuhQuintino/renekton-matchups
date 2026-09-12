import urllib.request, json, ssl, re
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
url = 'https://www.deeplol.gg/llm?champion=58&enemy=266&position=top'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req, context=ctx) as res:
    html = res.read().decode('utf-8')
    print('Status', res.status, 'Length', len(html))
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
    if m:
        d = json.loads(m.group(1))
        print('BuildId:', d.get('buildId'))
        print('pageProps keys:', list(d.get('props', {}).get('pageProps', {}).keys()))
        with open('scripts/deeplol_sample.json', 'w', encoding='utf-8') as fout:
            json.dump(d, fout, indent=2, ensure_ascii=False)
        print('Saved to scripts/deeplol_sample.json')
    else:
        print('No __NEXT_DATA__')
