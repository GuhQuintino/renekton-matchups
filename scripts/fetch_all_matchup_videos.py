import sys
import os
import json
import re
import urllib.request
import urllib.parse
import time
import zipfile
import xml.etree.ElementTree as ET
import concurrent.futures

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX_PATH = os.path.join(BASE_DIR, "scripts", "spreadsheet.xlsx")
CACHE_FILE = os.path.join(BASE_DIR, "scripts", "matchup_videos_cache.json")
MATCHUPS_JSON_PATH = os.path.join(BASE_DIR, "src", "data", "matchups.json")

# 1. Extract links from XLSX Match Up Sheet
def extract_sheet_videos():
    with zipfile.ZipFile(XLSX_PATH, 'r') as z:
        target_sheet_file = "xl/worksheets/sheet11.xml"
        sheet_rels_file = "xl/worksheets/_rels/sheet11.xml.rels"
        
        hyperlink_map = {}
        if sheet_rels_file in z.namelist():
            sheet_rels = ET.fromstring(z.read(sheet_rels_file))
            for rel in sheet_rels:
                hyperlink_map[rel.attrib.get('Id')] = rel.attrib.get('Target')
                
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_xml = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_xml:
                shared_strings.append(''.join(node.text for node in si.iter() if node.text))
                
        sheet_xml = ET.fromstring(z.read(target_sheet_file))
        
        cell_hyperlinks = {}
        for elem in sheet_xml.iter():
            if elem.tag.endswith('hyperlink'):
                ref = elem.attrib.get('ref')
                r_id = elem.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                url = hyperlink_map.get(r_id, '')
                cell_hyperlinks[ref] = url

        sheet_videos = {}
        for row in sheet_xml.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_num = int(row.attrib.get('r'))
            if row_num >= 9:
                champ = ''
                col_i_link = ''
                col_i_text = ''
                for c in row.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    ref = c.attrib.get('r')
                    if ref.startswith('A'):
                        v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        if v is not None and v.text.isdigit():
                            champ = shared_strings[int(v.text)].strip()
                    if ref.startswith('I'):
                        col_i_link = cell_hyperlinks.get(ref, '').strip()
                        v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        if v is not None and v.text.isdigit():
                            col_i_text = shared_strings[int(v.text)].strip()
                            
                if champ:
                    sheet_videos[champ] = {
                        'link': col_i_link,
                        'text': col_i_text
                    }
        return sheet_videos

def search_youtube_for_champion(champ_name):
    # Queries to try
    queries = [
        f"renekton vs {champ_name} KR",
        f"renekton vs {champ_name} challenger",
        f"domisumreplay renekton vs {champ_name}"
    ]
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }

    for query in queries:
        url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(query)
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
                
            match = re.search(r'var ytInitialData = ({.*?});</script>', html)
            if not match:
                match = re.search(r'ytInitialData = ({.*?});', html)
                
            if match:
                data = json.loads(match.group(1))
                sections = data.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [])
                for sec in sections:
                    if 'itemSectionRenderer' in sec:
                        for item in sec['itemSectionRenderer'].get('contents', []):
                            if 'videoRenderer' in item:
                                vr = item['videoRenderer']
                                vid_id = vr.get('videoId')
                                title = vr.get('title', {}).get('runs', [{}])[0].get('text', '')
                                channel = vr.get('ownerText', {}).get('runs', [{}])[0].get('text', '')
                                
                                # Filter out shorts if possible or irrelevant videos
                                if vid_id and len(vid_id) == 11:
                                    # Ensure "renekton" is in title or channel
                                    title_lower = title.lower()
                                    if "renekton" in title_lower or "renekton" in channel.lower():
                                        return {
                                            'videoId': vid_id,
                                            'url': f"https://www.youtube.com/watch?v={vid_id}",
                                            'title': title,
                                            'channel': channel,
                                            'source': 'youtube_kr_challenger'
                                        }
                                    # Even if not explicitly in title, if first search result
                                    return {
                                        'videoId': vid_id,
                                        'url': f"https://www.youtube.com/watch?v={vid_id}",
                                        'title': title,
                                        'channel': channel,
                                        'source': 'youtube_kr_challenger'
                                    }
            # Fallback regex search
            video_ids = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', html)
            if video_ids:
                return {
                    'videoId': video_ids[0],
                    'url': f"https://www.youtube.com/watch?v={video_ids[0]}",
                    'title': f"Renekton vs {champ_name} KR Challenger Replay",
                    'channel': "KR Challenger",
                    'source': 'youtube_kr_challenger'
                }
        except Exception as e:
            # Short sleep and try next query
            time.sleep(0.5)
            continue
            
    return None

def main():
    print("1. Extracting sheet videos...")
    sheet_videos = extract_sheet_videos()
    print(f"   Found {len(sheet_videos)} champions in sheet.")
    for c, v in sheet_videos.items():
        if v['link']:
            print(f"   Sheet Video: {c} -> {v['link']}")

    # Load existing cache if exists
    cache = {}
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                cache = json.load(f)
            print(f"Loaded existing video cache with {len(cache)} entries.")
        except Exception as e:
            print(f"Could not load cache: {e}")

    # Load matchups from matchups.json
    with open(MATCHUPS_JSON_PATH, 'r', encoding='utf-8') as f:
        matchups = json.load(f)

    print(f"Processing video links for {len(matchups)} matchups...")
    
    # Identify what needs fetching
    to_fetch = []
    final_video_map = {}

    for m in matchups:
        cname = m['championName']
        sheet_info = sheet_videos.get(m.get('sheetName', cname), sheet_videos.get(cname, {}))
        
        sheet_link = sheet_info.get('link', '')
        if sheet_link and ("youtube.com" in sheet_link or "youtu.be" in sheet_link):
            # Sheet has specific author video!
            # Extract video ID
            vid_id = ""
            if "v=" in sheet_link:
                vid_id = sheet_link.split("v=")[1].split("&")[0]
            elif "youtu.be/" in sheet_link:
                vid_id = sheet_link.split("youtu.be/")[1].split("?")[0]

            final_video_map[cname] = {
                'videoId': vid_id,
                'url': sheet_link,
                'title': f"Guia de Matchup: Renekton vs {cname} (Godrekton)",
                'channel': "Godrekton",
                'source': 'godrekton_sheet'
            }
        elif cname in cache and cache[cname].get('url'):
            final_video_map[cname] = cache[cname]
        else:
            to_fetch.append(cname)

    print(f"{len(final_video_map)} matchups already resolved. {len(to_fetch)} matchups need YouTube search.")

    if to_fetch:
        print(f"Searching YouTube in parallel (5 threads) for {len(to_fetch)} champions...")
        
        def fetch_worker(c):
            res = search_youtube_for_champion(c)
            return c, res

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_champ = {executor.submit(fetch_worker, c): c for c in to_fetch}
            completed = 0
            for future in concurrent.futures.as_completed(future_to_champ):
                completed += 1
                c, res = future.result()
                if res:
                    final_video_map[c] = res
                    cache[c] = res
                    print(f" [{completed}/{len(to_fetch)}] {c}: {res['title'][:40]} ({res['channel']}) -> {res['url']}")
                else:
                    print(f" [{completed}/{len(to_fetch)}] {c}: No video found!")
                
                if completed % 10 == 0:
                    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                        json.dump(cache, f, ensure_ascii=False, indent=2)

    # Save final cache
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_video_map, f, ensure_ascii=False, indent=2)
    print(f"\nAll video mappings saved to {CACHE_FILE} (Total: {len(final_video_map)})")

if __name__ == "__main__":
    main()
