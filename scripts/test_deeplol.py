import urllib.request
import json
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = https://www.deeplol.gg/llm?champion=58&enemy=266&position=top
headers = {
    User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36,
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8')
        print(fStatus: {response.status}, Length: {len(html)})
        
        match = re.search(r'<script id=__NEXT_DATA__ type=application/json>(.*?)</script>', html, re.DOTALL)
        if match:
            data = json.loads(match.group(1))
            print(Next.js buildId:, data.get(buildId))
            page_props = data.get(props, {}).get(pageProps, {})
            print(pageProps keys:, list(page_props.keys()))
            for k in page_props:
                val = page_props[k]
                if isinstance(val, (dict, list)):
                    dumped = json.dumps(val, ensure_ascii=False)
                    print(fKey: {k} -> {dumped[:300]}... (total len: {len(dumped)}))
                else:
                    print(fKey: {k} -> {val})
        else:
            print(No __NEXT_DATA__ found!)
            print(HTML snippet:, html[:1000])
except Exception as e:
    print(Error:, e)
