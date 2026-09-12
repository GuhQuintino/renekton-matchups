import json
import urllib.request
import ssl
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Origin': 'https://www.deeplol.gg',
    'Referer': 'https://www.deeplol.gg/'
}

RENEKTON_ID = 58

def fetch_json(url, retries=3, delay=0.5):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
                return json.loads(res.read().decode('utf-8'))
        except Exception as e:
            if attempt == retries - 1:
                return None
            time.sleep(delay * (attempt + 1))
    return None

def normalize_level_adv(ko_val):
    if not ko_val:
        return 'neutral'
    if '유리' in str(ko_val):
        return 'advantage'
    if '불리' in str(ko_val):
        return 'disadvantage'
    return 'neutral'

TITLE_TRANSLATIONS = {
    "Dodging Aatrox's Q Skill": "Desviando do Q do Aatrox",
    "Disabling Aatrox with Empowered W": "Anulando Aatrox com W Fortalecido",
    "Dodging and Countering Illaoi's E Skill": "Desviando e Punindo o E da Illaoi",
    "Utilizing W for Damage Trades": "Utilizando o W para Trocas Eficientes",
    "Playing Around Jax's E Counter Strike": "Jogando ao Redor do Contra-Ataque (E) do Jax",
    "Short Trades Against Darius": "Trocas Curtas Contra Darius",
    "Baiting Fiora's W Riposte": "Baitando o Ripostar (W) da Fiora",
    "Trading Around Camille's Passive Shield": "Trocar Considerando o Escudo da Passiva da Camille",
    "Kiting Garen's E Spin": "Kitar o Garen durante o Giro (E)",
    "Denying Gangplank's Barrels": "Destruindo os Barris do Gangplank",
    "Avoiding Sett's W True Damage": "Desviando do Dano Verdadeiro do W do Sett",
    "Punishing Riven After Her Q Cooldown": "Punindo a Riven no Cooldown do Q",
    "Respecting Olaf's Early All-In": "Respeitando o All-In Inicial do Olaf",
    "Interrupting Shen's Ultimate": "Interrompendo a Ultimate do Shen com W",
    "Abusing Level 3 Powerspike": "Aproveitar o Powerspike do Nível 3",
    "Wave Management and Fury Buildup": "Gerenciamento de Wave e Fúria",
    "Avoiding Mordekaiser's E Pull": "Desviando do Puxão (E) de Mordekaiser",
    "Dealing with Malphite's Poke": "Lidando com o Poke do Malphite",
    "Handling Teemo's Blind": "Lidando com a Cegueira do Teemo",
    "Managing Quinn's Vault": "Administrando o Salto (E) da Quinn",
    "Playing Against Jayce's Range": "Jogar controlando o Range do Jayce",
    "Surviving Vayne's Condemn": "Lidando com o Condenar da Vayne",
    "Fighting Yone in Melee Range": "Lutando Contra Yone no Range Melee",
    "Punishing Yasuo's Wind Wall": "Punindo a Parede de Vento do Yasuo",
    "Breaking Shields with Empowered W": "Destruindo Escudos com W Fortalecido",
    "Dominating Skirmishes with Dominus": "Dominando Lutas com Dominus (R)"
}

import urllib.parse

TRANSLATION_CACHE_FILE = 'scripts/deeplol_translation_cache.json'
translation_cache = {}
if os.path.exists(TRANSLATION_CACHE_FILE):
    try:
        with open(TRANSLATION_CACHE_FILE, 'r', encoding='utf-8') as f:
            translation_cache = json.load(f)
    except Exception:
        translation_cache = {}

def translate_to_pt(text, is_title=False):
    if not text:
        return ''
    if is_title and text in TITLE_TRANSLATIONS:
        return TITLE_TRANSLATIONS[text]
    if text in translation_cache:
        return translation_cache[text]
    
    try:
        q = urllib.parse.quote(text)
        url = f'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q={q}'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=5) as res:
            data = json.loads(res.read().decode('utf-8'))
            translated = ''.join([part[0] for part in data[0] if part and len(part) > 0 and part[0]])
            if translated:
                # Ajusta termos de LoL
                translated = translated.replace('W fortalecido', 'W Fortalecido (50+ Fúria)')
                translated = translated.replace('E skill', 'E (Slice and Dice)')
                translated = translated.replace('Q skill', 'Q (Cull the Meek)')
                translated = translated.replace('W skill', 'W (Ruthless Predator)')
                translated = translated.replace('R skill', 'R (Dominus)')
                translation_cache[text] = translated
                return translated
    except Exception:
        pass
    
    return text

def translate_tip(title, tip):
    t_pt = translate_to_pt(title, is_title=True)
    c_pt = translate_to_pt(tip, is_title=False)
    return t_pt, c_pt

def process_champion(champ):
    riot_id = champ.get('riotId')
    name = champ.get('name')
    if not riot_id or riot_id == RENEKTON_ID:
        return None
    
    tips_url = f'https://b2c-api-cdn.deeplol.gg/matchup/matchup_tips?champion_id={RENEKTON_ID}&enemy_champion_id={riot_id}&language=en'
    stats_url = f'https://b2c-api-cdn.deeplol.gg/matchup/matchup_stats?champion_id={RENEKTON_ID}&enemy_champion_id={riot_id}'
    
    tips_data = fetch_json(tips_url)
    stats_data = fetch_json(stats_url)
    
    has_valid_data = False
    level_adv = None
    tips_list = []
    stats_info = None
    
    if tips_data and isinstance(tips_data, dict):
        raw_adv = tips_data.get('levelAdvantage')
        raw_tips = tips_data.get('tips')
        
        if raw_adv and isinstance(raw_adv, dict):
            level_adv = {
                'lv1': normalize_level_adv(raw_adv.get('lv1')),
                'lv2': normalize_level_adv(raw_adv.get('lv2')),
                'lv3': normalize_level_adv(raw_adv.get('lv3')),
                'lv4': normalize_level_adv(raw_adv.get('lv4')),
                'lv5': normalize_level_adv(raw_adv.get('lv5')),
                'lv6': normalize_level_adv(raw_adv.get('lv6')),
            }
            if any(v != 'neutral' for v in level_adv.values()):
                has_valid_data = True
            
        if raw_tips and isinstance(raw_tips, list) and len(raw_tips) > 0:
            for item in raw_tips:
                t_en = (item.get('title') or '').strip()
                c_en = (item.get('tip') or '').strip()
                if t_en or c_en:
                    t_pt, c_pt = translate_tip(t_en, c_en)
                    tips_list.append({
                        'titleEn': t_en,
                        'titlePt': t_pt,
                        'contentEn': c_en,
                        'contentPt': c_pt
                    })
                    has_valid_data = True

    if stats_data and isinstance(stats_data, dict):
        by_pos = stats_data.get('stats_by_position') or {}
        top_stats = by_pos.get('Top') or by_pos.get('Middle') or (list(by_pos.values())[0] if by_pos else None)
        if top_stats:
            stats_info = {
                'sampleSize': top_stats.get('games', 0),
                'renektonWinRate': top_stats.get('my_win_rate', 0.0),
                'enemyWinRate': top_stats.get('enemy_win_rate', 0.0)
            }
            
    return {
        'championId': champ.get('id'),
        'championName': name,
        'riotId': riot_id,
        'hasData': has_valid_data,
        'levelAdvantage': level_adv,
        'tips': tips_list if tips_list else [],
        'stats': stats_info
    }

def main():
    print('Starting DeepLoL Matchup Scraper...')
    with open('src/data/champions.json', 'r', encoding='utf-8') as f:
        champions = json.load(f)
        
    print(f'Total champions to probe: {len(champions)}')
    
    results = {}
    valid_count = 0
    
    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = {executor.submit(process_champion, c): c for c in champions}
        for future in as_completed(futures):
            res = future.result()
            if res:
                results[res['championName']] = res
                if res['hasData']:
                    valid_count += 1
                    print(f"[FOUND] {res['championName']}: {res['levelAdvantage']} | Tips: {len(res['tips'])}")
                    
    print(f'Done! Found {valid_count} champions with DeepLoL LLM data out of {len(champions)}.')
    
    with open('src/data/deeplol_matchups.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    with open(TRANSLATION_CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(translation_cache, f, indent=2, ensure_ascii=False)
        
    print('Saved to src/data/deeplol_matchups.json and updated translation cache!')

if __name__ == '__main__':
    main()
