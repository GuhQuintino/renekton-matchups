import os
import sys
import json
import time
import subprocess
import requests
import asyncio
import websockets
from io import BytesIO
from PIL import Image

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
TARGET_URL = "http://localhost:1420/"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "Docs", "tutorial")

async def run_automation():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Start Chrome headless
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        "--window-size=1280,820",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-extensions",
        f"--user-data-dir={os.environ.get('TEMP', '.')}\\chrome_demo_profile"
    ]
    
    print("Launching Chrome...")
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)
    
    try:
        # Get target websocket URL
        res = requests.get("http://localhost:9222/json/version", timeout=5)
        ws_url = res.json()["webSocketDebuggerUrl"]
        print(f"Connected to Chrome CDP: {ws_url}")
        
        async with websockets.connect(ws_url, max_size=50*1024*1024) as ws:
            # Create a target page
            req_id = 1
            
            async def send_cmd(method, params=None):
                nonlocal req_id
                req_id += 1
                payload = {"id": req_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(payload))
                while True:
                    msg = await ws.recv()
                    data = json.loads(msg)
                    if data.get("id") == req_id:
                        return data.get("result", {})
            
            # Create new target
            target = await send_cmd("Target.createTarget", {"url": TARGET_URL})
            target_id = target["targetId"]
            print(f"Created page target: {target_id}")
            
            # Connect to page target
            page_ws_url = f"ws://localhost:9222/devtools/page/{target_id}"
            async with websockets.connect(page_ws_url, max_size=50*1024*1024) as page_ws:
                page_req_id = 1
                
                async def page_cmd(method, params=None):
                    nonlocal page_req_id
                    page_req_id += 1
                    payload = {"id": page_req_id, "method": method, "params": params or {}}
                    await page_ws.send(json.dumps(payload))
                    while True:
                        msg = await page_ws.recv()
                        data = json.loads(msg)
                        if data.get("id") == page_req_id:
                            return data.get("result", {})
                
                await page_cmd("Page.enable")
                await page_cmd("Runtime.enable")
                await page_cmd("Emulation.setDeviceMetricsOverride", {
                    "width": 1280,
                    "height": 820,
                    "deviceScaleFactor": 1,
                    "mobile": False
                })
                
                print("Waiting for page load...")
                await asyncio.sleep(2)
                
                captured_frames = []
                
                async def snap(label=None):
                    res = await page_cmd("Page.captureScreenshot", {"format": "png"})
                    data = res.get("data")
                    if data:
                        import base64
                        raw = base64.b64decode(data)
                        img = Image.open(BytesIO(raw))
                        if label:
                            p = os.path.join(OUTPUT_DIR, f"{label}.png")
                            img.save(p)
                            print(f"Saved snapshot: {p}")
                        captured_frames.append(img)
                        return img
                    return None

                async def eval_js(script):
                    res = await page_cmd("Runtime.evaluate", {"expression": script, "returnByValue": True})
                    return res.get("result", {}).get("value")
                
                # Frame 1: Home page / Aatrox default
                print("Capturing Frame 1: Initial View")
                await snap("01_live_app_overview")
                await asyncio.sleep(0.5)
                
                # Search for Darius
                print("Typing 'Darius' in search...")
                await eval_js("""
                    const search = document.querySelector('input[type="text"]');
                    if (search) {
                        search.value = 'Darius';
                        search.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                """)
                await asyncio.sleep(0.6)
                await snap()
                
                # Select Darius
                print("Selecting Darius...")
                await eval_js("""
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const dariusBtn = buttons.find(b => b.innerText.includes('Darius'));
                    if (dariusBtn) dariusBtn.click();
                """)
                await asyncio.sleep(0.6)
                await snap("02_darius_matchup_details")
                await asyncio.sleep(0.4)
                await snap()
                
                # Switch tab to Combos & Mechanics
                print("Clicking Combos Tab...")
                await eval_js("""
                    const tabs = Array.from(document.querySelectorAll('button'));
                    const combosTab = tabs.find(t => t.innerText.includes('Combos') || t.innerText.includes('Mecânica'));
                    if (combosTab) combosTab.click();
                """)
                await asyncio.sleep(0.6)
                await snap("03_combos_visualizer")
                await asyncio.sleep(0.4)
                await snap()
                
                # Toggle Language to English / Portuguese
                print("Toggling Language...")
                await eval_js("""
                    const btns = Array.from(document.querySelectorAll('button'));
                    const langBtn = btns.find(b => b.innerText.includes('PT-BR') || b.innerText.includes('EN'));
                    if (langBtn) langBtn.click();
                """)
                await asyncio.sleep(0.6)
                await snap("04_language_switched")
                await asyncio.sleep(0.4)
                await snap()

                # Open 8 Master Guides Modal
                print("Opening Master Guides...")
                await eval_js("""
                    const btns = Array.from(document.querySelectorAll('button'));
                    const guidesBtn = btns.find(b => b.innerText.includes('Guias') || b.innerText.includes('Guides') || b.innerText.includes('Master'));
                    if (guidesBtn) guidesBtn.click();
                """)
                await asyncio.sleep(0.8)
                await snap("05_godrekton_master_guides_open")
                await asyncio.sleep(0.5)
                await snap()

                # Close Modal
                await eval_js("""
                    const closeBtns = Array.from(document.querySelectorAll('button'));
                    const xBtn = closeBtns.find(b => b.innerText.includes('Close') || b.innerText.includes('Fechar') || b.querySelector('svg'));
                    // press Escape or click backdrop
                    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true });
                    document.dispatchEvent(escEvent);
                """)
                await asyncio.sleep(0.6)
                
                # Open Tier Lists Modal
                print("Opening Tier List Modal...")
                await eval_js("""
                    const btns = Array.from(document.querySelectorAll('button'));
                    const tierBtn = btns.find(b => b.innerText.includes('Tier') || b.innerText.includes('Level 1'));
                    if (tierBtn) tierBtn.click();
                """)
                await asyncio.sleep(0.8)
                await snap("06_level1_tier_list_open")
                await asyncio.sleep(0.4)
                await snap()
                
                # Close Modal
                await eval_js("""
                    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true });
                    document.dispatchEvent(escEvent);
                """)
                await asyncio.sleep(0.5)

                # Clear search to show all
                await eval_js("""
                    const search = document.querySelector('input[type="text"]');
                    if (search) {
                        search.value = '';
                        search.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                """)
                await asyncio.sleep(0.5)
                await snap("07_search_cleared_all_170")
                await asyncio.sleep(0.4)
                await snap()
                
                # Create Animated GIF
                if captured_frames:
                    print(f"Compiling {len(captured_frames)} frames into animated GIF...")
                    gif_path = os.path.join(OUTPUT_DIR, "renekton_app_demo.gif")
                    # Resize frames for web optimization (width 960)
                    optimized_frames = []
                    for f in captured_frames:
                        w, h = f.size
                        ratio = 960 / float(w)
                        new_h = int(float(h) * float(ratio))
                        resized = f.resize((960, new_h), Image.Resampling.LANCZOS)
                        optimized_frames.append(resized.convert('P', palette=Image.Palette.ADAPTIVE, colors=128))
                    
                    # Durations: hold longer on key frames
                    durations = [800, 400, 1000, 500, 1000, 500, 900, 400, 1200, 600, 1200, 500, 900, 400]
                    while len(durations) < len(optimized_frames):
                        durations.append(600)
                    durations = durations[:len(optimized_frames)]
                    
                    optimized_frames[0].save(
                        gif_path,
                        save_all=True,
                        append_images=optimized_frames[1:],
                        optimize=True,
                        duration=durations,
                        loop=0
                    )
                    size_mb = os.path.getsize(gif_path) / (1024 * 1024)
                    print(f"Successfully generated {gif_path} ({size_mb:.2f} MB)")
                
    finally:
        print("Terminating Chrome...")
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(run_automation())
