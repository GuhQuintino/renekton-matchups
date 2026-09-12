#!/usr/bin/env python3
"""
Renekton Champion Matchup - Data Extraction, 5-Stage Neural Translation & SQLite Seeding Engine.
Extracts all 9 CSV files from Docs/Guia de Renekton/, performs high-fidelity neural translation
to Brazilian Portuguese (PT-BR) while strictly preserving English LoL terminology via token masking,
uses concurrent execution with persistent disk caching, and generates JSON datasets and a seeded SQLite database.
"""

import concurrent.futures
import csv
import json
import os
import re
import sqlite3
import sys
import threading
import time
import urllib.parse
import urllib.request
from typing import Dict, List, Any, Tuple, Optional

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(BASE_DIR, "Docs", "Guia de Renekton")
SRC_DATA_DIR = os.path.join(BASE_DIR, "src", "data")
DB_DIR = os.path.join(BASE_DIR, "src-tauri", "src", "db")
CACHE_FILE = os.path.join(BASE_DIR, "scripts", "translation_cache.json")

os.makedirs(SRC_DATA_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. GLOSSARY & PROTECTED LEAGUE OF LEGENDS TERMS
# -----------------------------------------------------------------------------

CHAMPION_SHEET_TO_RIOT = {
    'DR.Mundo': {'name': 'Dr. Mundo', 'riot_key': 'DrMundo'},
    "K'sante": {'name': "K'Sante", 'riot_key': 'KSante'},
    'Kaisa': {'name': "Kai'Sa", 'riot_key': 'Kaisa'},
    "Kha'zix": {'name': "Kha'Zix", 'riot_key': 'Khazix'},
    'Lillah': {'name': 'Lillia', 'riot_key': 'Lillia'},
    'Millio': {'name': 'Milio', 'riot_key': 'Milio'},
    'Nillah': {'name': 'Nilah', 'riot_key': 'Nilah'},
    'Renata': {'name': 'Renata Glasc', 'riot_key': 'Renata'},
    'Nunu': {'name': 'Nunu & Willump', 'riot_key': 'Nunu'},
    'Wukong': {'name': 'Wukong', 'riot_key': 'MonkeyKing'},
    "Cho'Gath": {'name': "Cho'Gath", 'riot_key': 'Chogath'},
    "Vel'Koz": {'name': "Vel'Koz", 'riot_key': 'Velkoz'},
    "Rek'Sai": {'name': "Rek'Sai", 'riot_key': 'RekSai'},
    'Jarvan IV': {'name': 'Jarvan IV', 'riot_key': 'JarvanIV'},
    'Lee Sin': {'name': 'Lee Sin', 'riot_key': 'LeeSin'},
    'Master Yi': {'name': 'Master Yi', 'riot_key': 'MasterYi'},
    'Miss Fortune': {'name': 'Miss Fortune', 'riot_key': 'MissFortune'},
    'Tahm Kench': {'name': 'Tahm Kench', 'riot_key': 'TahmKench'},
    'Twisted Fate': {'name': 'Twisted Fate', 'riot_key': 'TwistedFate'},
    'Xin Zhao': {'name': 'Xin Zhao', 'riot_key': 'XinZhao'},
    'Aurelion Sol': {'name': 'Aurelion Sol', 'riot_key': 'AurelionSol'},
    "Bel'Veth": {'name': "Bel'Veth", 'riot_key': 'Belveth'},
    "Kog'Maw": {'name': "Kog'Maw", 'riot_key': 'KogMaw'},
    'LeBlanc': {'name': 'LeBlanc', 'riot_key': 'Leblanc'},
}

PROTECTED_TERMS_RAW = [
    # Renekton specific abilities & mechanics
    "Cull the Meek", "Ruthless Predator", "Slice and Dice", "Dominus",
    "Empowered W", "Empowered Q", "Empowered E", "Empowered Auto", "Empowered AA",
    "E1", "E2", "Q1", "Q2", "W1", "W2", "R1", "R2",
    
    # Runes
    "PTA", "Press the Attack", "Conqueror", "Conq", "Electrocute", "Grasp of the Undying", "Grasp",
    "Fleet Footwork", "Second Wind", "Bone Plating", "Unflinching", "Demolish", "Overgrowth", "Revitalize",
    "Coup de Grace", "Last Stand", "Cut Down", "Triumph", "Presence of Mind", "Legend: Alacrity", "Legend: Tenacity",
    "Legend: Bloodline", "Legend: Haste", "Sudden Impact", "Taste of Blood", "Eyeball Collection", "Treasure Hunter",
    "Relentless Hunter", "Ultimate Hunter", "Magical Footwear", "Cosmic Insight", "Biscuits", "Biscuit Delivery",
    "Triple Tonic", "Time Warp Tonic", "Jack of All Trades", "Resolve", "Precision", "Domination", "Inspiration", "Sorcery",
    "Shield Bash", "Conditioning", "Scorch", "Gathering Storm", "Transcendence", "Manaflow Band", "Nimbus Cloak", "Nullifying Orb",
    
    # Summoner Spells
    "Flash", "Ignite", "Teleport", "TP", "Ghost", "Cleanse", "Exhaust", "Barrier", "Heal", "Smite",
    
    # Core Items & Builds Tier List Items
    "Eclipse", "Black Cleaver", "Death's Dance", "BoTRK", "Blade of the Ruined King", "Blade of The Ruined King", "Botrk", "BOTRK",
    "Hexdrinker", "Maw of Malmortius", "Doran's Blade", "Doran's Shield", "Doran's Ring", "Doran's",
    "Plated Steelcaps", "Mercury's Treads", "Merc Treads", "Stridebreaker", "Profane Hydra",
    "Ravenous Hydra", "Titanic Hydra", "Sterak's Gage", "Shojin", "Spear of Shojin",
    "Sundered Sky", "Guardian Angel", "Chempunk Chainsword", "Executioner's Calling", "Executioner's", "Executioner",
    "Bramble Vest", "Thornmail", "Force of Nature", "Kaenic Rookern", "Kaenic", "Spirit Visage",
    "Jak'Sho, The Protean", "Jak'Sho", "Heartsteel", "Warmog's Armor", "Randuin's Omen", "Randiun's Omen", "Ranidun's", "Randuins", "Frozen Heart",
    "Anathema's Chains", "Tiamat", "Ironspike Whip", "Serrated Dirk", "Phage", "Kindlegem",
    "Caulfield's Warhammer", "Pickaxe", "B.F. Sword", "Long Sword", "Cloth Armor",
    "Null-Magic Mantle", "Ruby Crystal", "Refillable Potion", "Health Potion", "Control Ward",
    "Stealth Ward", "Oracle Lens", "Trinity Force", "Goredrinker", "Tabi", "Mercs",
    "Experimental Hexplate", "Hexplate", "Voltaic Cyclosword", "Cyclosword",
    "Rapid Firecannon", "Rapid Fire Cannon", "Rapid Fire", "Youmuu's Ghostblade", "Ghostblade",
    "Serylda's Grudge", "Serylda", "Mortal Reminder", "Edge of Night",
    "Terminus", "Hullbreaker", "Dead Man's Plate", "Dead Man's", "Dead Mans",
    "Zeke's Convergence", "Zeke's", "Zekes", "Zhonya's Hourglass", "Zhonyas", "Zhonya",
    "Overlord's Bloodmail", "Overlord's", "Bloodthirster", "Lord Dominik's Regards", "LDR",
    "Hubris", "Opportunity", "Infinity Edge", "Navori", "Collector", "The Collector",
    "Essence Reaver", "Muramana", "Manamune", "Riftmaker", "Liandry's Torment", "Liandry's",
    "Rylai's", "Nashor's Tooth", "Guinsoo's Rageblade", "Kraken Slayer", "Statikk Shiv", "Phantom Dancer",
    "Symbiotic Soles", "Boots of Swiftness", "Sorcerer's Shoes", "Ionian Boots of Lucidity", "Lucidity Boots", "Berserker's Greaves",
    "JOAT",
    
    # Gameplay terms / jargon
    "ganks", "gank", "ganking", "freeze", "freezing", "proxy", "proxying", "waveclear", "poke", "poking",
    "all in", "all-in", "burst", "bursting", "snowball", "snowballing", "stat check", "stat checking",
    "CC", "hard CC", "soft CC", "AA", "AAs", "auto attack", "auto attacks", "CD", "CDs", "DPS", "CS",
    "wave", "waves", "early game", "mid game", "late game", "laning phase",
    "1v1", "2v2", "powerspike", "powerspikes", "short trade", "short trades",
    "extended trade", "extended trades", "heavy trade", "heavy trades",
    "disengage", "engage", "peel", "roam", "roaming", "skirmish", "skirmishes",
    "teamfight", "teamfights", "teamfighting", "dive", "diving", "tower dive", "tower diving",
    "level 1", "level 2", "level 3", "level 4", "level 5", "level 6",
    "spacing", "kiting", "kite", "tethering", "tether", "aggro", "minion aggro",
    "first blood", "slow push", "fast push", "crash", "crashing",
    "buffering", "attack buffering", "animation cancel", "animation cancels", "doublecast",
    "on-hit", "on-hit effect", "on-hit effects", "one-shot", "one-shots", "one shot", "one shots",
    "side lane", "side lanes", "top lane", "mid lane", "squishy", "squishies", "bruiser", "bruisers",
    
    # Champions
    "Renekton", "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Amumu", "Anivia", "Annie",
    "Aphelios", "Ashe", "Aurelion Sol", "Azir", "Bard", "Bel'Veth", "Blitzcrank", "Brand",
    "Braum", "Briar", "Caitlyn", "Camille", "Cassiopeia", "Cho'Gath", "Corki", "Darius",
    "Diana", "Dr. Mundo", "DR.Mundo", "Draven", "Ekko", "Elise", "Evelynn", "Ezreal",
    "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas",
    "Graves", "Gwen", "Hecarim", "Heimerdinger", "Hwei", "Illaoi", "Irelia", "Ivern",
    "Janna", "Jarvan IV", "Jax", "Jayce", "Jhin", "Jinx", "K'Sante", "K'sante", "Kai'Sa",
    "Kaisa", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen",
    "Kha'Zix", "Kindred", "Kled", "Kog'Maw", "LeBlanc", "Lee Sin", "Leona", "Lillia",
    "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Master Yi",
    "Milio", "Miss Fortune", "Mordekaiser", "Morgana", "Naafiri", "Nami", "Nasus", "Nautilus",
    "Neeko", "Nidalee", "Nilah", "Nocturne", "Nunu & Willump", "Nunu", "Olaf", "Orianna",
    "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus", "Rek'Sai",
    "Rell", "Renata Glasc", "Renata", "Riven", "Rumble", "Ryze", "Samira", "Sejuani",
    "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana", "Singed", "Sion", "Sivir",
    "Skarner", "Smolder", "Sona", "Soraka", "Swain", "Sylas", "Syndra", "Tahm Kench",
    "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere",
    "Twisted Fate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Vel'Koz",
    "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah",
    "Xerath", "Xin Zhao", "Yasuo", "Yone", "Yorick", "Yuumi", "Zac", "Zed", "Zeri",
    "Ziggs", "Zilean", "Zoe", "Zyra"
]

PROTECTED_TERMS = sorted(list(set(PROTECTED_TERMS_RAW)), key=lambda x: -len(x))

# -----------------------------------------------------------------------------
# 2. TITLE TRANSLATIONS DICTIONARY & HEURISTICS
# -----------------------------------------------------------------------------

TITLE_TRANSLATIONS = {
    # Tier List & Items
    "S TIER": "Nível S (S-Tier)",
    "A TIER": "Nível A (A-Tier)",
    "B TIER": "Nível B (B-Tier)",
    "C TIER": "Nível C (C-Tier)",
    "D TIER": "Nível D (D-Tier)",
    "Item Starts": "Itens Iniciais",
    "Item Tier List": "Tier List de Itens",
    "Boot Choices": "Escolha de Botas",
    "Renekton Builds": "Builds de Renekton",
    "About Me": "Sobre Mim",
    "How To Use The Spreadsheet": "Como Usar a Planilha",
    "Where Else To Find My Content": "Onde Encontrar Meu Conteúdo",
    "PTA OR CONQ?": "PTA ou Conqueror?",
    "Rune Setups": "Setups de Runas",
    "Renekton Runes": "Runas de Renekton",
    "Auto Attack Cancels": "Cancelamentos de Auto Ataque",
    "Double Casts and Animation Cancels": "Doublecasts e Cancelamento de Animações",
    "Q Animation Cancels": "Cancelamento de Animação do Q",
    "R Animation Cancels": "Cancelamento de Animação da Ult (R)",
    "Flash Buffering and On-Hit Effects": "Buffer com Flash e Efeitos On-Hit",
    "Q Buffering": "Buffer de Q",
    "Q Flash Interactions": "Interações de Q com Flash",
    "E Flash Interactions": "Interações de E com Flash",
    "E Mechanics": "Mecânicas de E (Slice and Dice)",
    "R Interactions": "Interações da Ult (R)",
    "Rune Interactions": "Interações de Runas",
    "All In Combos": "Combos de All-in",
    "Combos": "Combos",
    "Mechanics": "Mecânicas",
    "Mechanics and Combos": "Mecânicas e Combos",
    "Level 1 Ability Starts": "Início com Habilidade no Nível 1",
    "Top Lane Level 1 Ability Start": "Habilidade no Nível 1 na Top Lane",
    "Mid Lane Level 1 Ability Start": "Habilidade no Nível 1 na Mid Lane",
    "Ability Max Order": "Ordem de Evolução de Habilidades (Maxing)",
    "Top Lane Ability Max Match Ups": "Ordem de Max na Top Lane por Matchup",
    "Mid Lane Ability Max": "Ordem de Max na Mid Lane",
    "Fury Management": "Gerenciamento de Fúria",
    "Understanding Fury": "Compreendendo a Fúria",
    "Ways To Maintain Fury": "Maneiras de Manter a Fúria",
    "Practice Methods": "Métodos de Treino e Prática",
    "Ignite": "Ignite",
    "Teleport": "Teleport",
    "Flash": "Flash",
    "Ghost": "Ghost",
    "Exhaust": "Exhaust",
    "General Overview": "Visão Geral",
    
    # Matchup Tips
    "Level 1 Q Start": "Início com Q no Nível 1",
    "Level 1 E Start": "Início com E no Nível 1",
    "Level 1 W Start": "Início com W no Nível 1",
    "Level 1 Q or E Start": "Início no Nível 1 com Q ou E",
    "Level 1 E or Q Start": "Início no Nível 1 com E ou Q",
    "Level 1 E Start - PTA / Conq Proc": "Início no Nível 1 com E - Ativação de PTA / Conq",
    "Play For Level 2/3 Kill Angle": "Busque Ângulo de Kill no Nível 2/3",
    "Play For Level 2 Kill Angle": "Busque Ângulo de Kill no Nível 2",
    "Play For Level 3 Kill Angle": "Busque Ângulo de Kill no Nível 3",
    "Play For Level 6 All In": "Busque All-in no Nível 6",
    "Play For Level 6 Kill Angle": "Busque Ângulo de Kill no Nível 6",
    "Play For Sustain Early": "Jogue por Sustain no Early Game",
    "Play For Early Sustain": "Jogue por Sustain no Início",
    "Play For Ganks": "Jogue para Ganks",
    "Play For Gank Setup": "Jogue para Setup de Gank",
    "Play For Manaburn": "Jogue para Esgotar a Mana Inimiga",
    "Play Wave On Your Side": "Mantenha a Wave do seu Lado",
    "Play Waves Accordingly": "Gerencie as Waves Corretamente",
    "Play Around Wave Position": "Jogue de Acordo com a Posição da Wave",
    "Play Around His Passive": "Jogue em Torno da Passiva Dele",
    "Play Around Her Passive": "Jogue em Torno da Passiva Dela",
    "Play Around Their Passive": "Jogue em Torno da Passiva Deles",
    "Abuse Renekton's Early Game": "Abuse do Early Game do Renekton",
    "Abuse Renekton's R Powerspike": "Abuse do Powerspike da Ult (R) do Renekton",
    "Abuse Renekton R Powerspike": "Abuse do Powerspike da Ult (R) do Renekton",
    "Abuse Renekton Empowered W": "Abuse do W Fortalecido do Renekton",
    "Abuse Renekton W Shield Break": "Abuse da Quebra de Escudo do W do Renekton",
    "Abuse Renekton W Shieldbreak": "Abuse da Quebra de Escudo do W do Renekton",
    "Abuse Renekton Empowered Q": "Abuse do Q Fortalecido do Renekton",
    "Abuse Renekton Empowered E": "Abuse do E Fortalecido do Renekton",
    "Abuse Empowered Q / E": "Abuse do Q / E Fortalecido",
    "Abuse Empowered Q / E Trades": "Abuse de Trocas com Q / E Fortalecido",
    "Abuse Empowered Q/E": "Abuse do Q/E Fortalecido",
    "Abuse Empowered E": "Abuse do E Fortalecido",
    "Abuse Renekton Attack Buffering": "Abuse do Buffer de Ataque do Renekton",
    "Quick Trades": "Trocas Rápidas (Short Trades)",
    "Heavy Trades": "Trocas Pesadas (Heavy Trades)",
    "Short Trades": "Trocas Curtas",
    "Extended Trades": "Trocas Prolongadas",
    "Mid Game + Teamfighting Tips": "Dicas de Mid Game e Teamfights",
    "Midgame + Teamfighting Tips": "Dicas de Mid Game e Teamfights",
    "Teamfight Tips": "Dicas de Teamfight",
    "Mid Game Macro": "Macro de Mid Game",
    "Build Eclipse, Black Cleaver or BoTRK": "Build de Eclipse, Black Cleaver ou BoTRK",
    "Build Eclipse, Stridebreaker or Profane": "Build de Eclipse, Stridebreaker ou Profane Hydra",
    "Build BoTRK, Eclipse or Black Cleaver": "Build de BoTRK, Eclipse ou Black Cleaver",
    "Build Stridebreaker or Eclipse": "Build de Stridebreaker ou Eclipse",
    "Rush Plated Steelcaps": "Rush de Plated Steelcaps",
    "Rush Mercury Treads": "Rush de Mercury's Treads",
    "Rush Executioner's Calling": "Rush de Executioner's Calling",
    "Rush Bramble Vest": "Rush de Bramble Vest",
    "Rush Hexdrinker": "Rush de Hexdrinker",
    "3 Points Q > W Max": "3 Pontos no Q > Max W em seguida",
    "3 Points Q > E Max": "3 Pontos no Q > Max E em seguida",
    "Defend Your Minion Wave": "Defenda a sua Wave de Minions",
    "Defend First Minion Wave": "Defenda a Primeira Wave de Minions",
    "Respect Level 1 Cheese": "Respeite o Cheese de Nível 1",
    "Respect Early Level 1": "Respeite o Nível 1 no Início",
    "Respect His Passive": "Respeite a Passiva Dele",
    "Respect Her Passive": "Respeite a Passiva Dela",
    "Respect Their Passive": "Respeite a Passiva Deles",
    "Alcove Strat": "Estratégia do Alcove (Recuo no Arbusto Lateral)",
    "Bait Out Key Abilities": "Iscagem de Habilidades-Chave (Bait)",
    "Bait Out His CC": "Iscagem do CC Dele",
    "Bait Out Her CC": "Iscagem do CC Dela",
    "Space His Abilities": "Espaçamento das Habilidades Dele",
    "Space Her Abilities": "Espaçamento das Habilidades Dela",
}

# -----------------------------------------------------------------------------
# 3. 5-STAGE HYBRID TRANSLATION ENGINE WITH PERSISTENT CACHING
# -----------------------------------------------------------------------------

PRE_SUBSTITUTIONS = [
    (r"\btrade\b", "troca"),
    (r"\btrades\b", "trocas"),
    (r"\btrading\b", "trocas"),
    (r"\bmatch up\b", "confronto"),
    (r"\bmatchup\b", "confronto"),
    (r"\boutscale\b", "escalar melhor"),
    (r"\boutscales\b", "escala melhor"),
    (r"\boutscaled\b", "superado na escala"),
    (r"\bhard win\b", "vencer com facilidade"),
    (r"\bhard wins\b", "vence com facilidade"),
    (r"\bto a tee\b", "com perfeição"),
    (r"\bwalks in with\b", "avança usando"),
    (r"\blook to\b", "procure"),
    (r"\blooks to\b", "procura"),
    (r"\blooking to\b", "buscando"),
    (r"\btry to\b", "tente"),
    (r"\btrying to\b", "tentando"),
    (r"\bdisengage away from\b", "recuar e dar disengage de"),
    (r"\bkill angle\b", "ângulo de kill"),
    (r"\bkill angles\b", "ângulos de kill"),
    (r"\bshort trade\b", "troca curta (short trade)"),
    (r"\bshort trades\b", "trocas curtas (short trades)"),
    (r"\bextended trade\b", "troca prolongada (extended trade)"),
    (r"\bextended trades\b", "trocas prolongadas (extended trades)"),
    (r"\bheavy trade\b", "troca pesada (heavy trade)"),
    (r"\bheavy trades\b", "trocas pesadas (heavy trades)"),
    (r"\bpowerspike\b", "powerspike"),
    (r"\bpowerspikes\b", "powerspikes"),
    (r"\blaning phase\b", "fase de rotas (laning phase)"),
    (r"\bwaveclear\b", "waveclear"),
    (r"\bstat check\b", "stat check"),
    (r"\bstat checks\b", "stat checks"),
]

POST_SUBSTITUTIONS = [
    (r"\bonda de minions\b", "wave de minions"),
    (r"\bondas de minions\b", "waves de minions"),
    (r"\bonda\b", "wave"),
    (r"\bondas\b", "waves"),
    (r"\bnegociações\b", "trocas"),
    (r"\bnegociação\b", "troca"),
    (r"\bpartida\b", "confronto"),
    (r"\barmaduras\b", "armadura"),
    (r"\bqueimar mana\b", "esgotar a mana"),
    (r"\bgravar mana\b", "esgotar a mana"),
    (r"\bempilhado\b", "estacado"),
    (r"\bempilhada\b", "estacada"),
    (r"\bempilhados\b", "estacados"),
    (r"\bempilhadas\b", "estacadas"),
    (r"\bempilhar\b", "estacar"),
    (r"\bdo wave\b", "da wave"),
    (r"\bno wave\b", "na wave"),
    (r"\bum wave\b", "uma wave"),
    (r"\bdas waves\b", "das waves"),
    (r"\bfeitiço de invocador\b", "feitiço de invocador (Summoner Spell)"),
    (r"\bfeitiços de invocador\b", "feitiços de invocador (Summoner Spells)"),
    (r"\bDR\.Mundo\b", "Dr. Mundo"),
    (r"\bDR Mundo\b", "Dr. Mundo"),
    (r"\bmergulho na torre\b", "dive na torre"),
    (r"\bmergulho de torre\b", "tower dive"),
    (r"\bmergulhar na torre\b", "dar tower dive"),
    (r"\bforce luta\b", "forçar luta"),
    (r"\bforça luta\b", "forçar luta"),
    (r"\bestatísticas\b", "stats"),
    (r"\bcutuca\b", "dá poke em"),
    (r"\bcutucar\b", "pokear"),
    (r"\bRespeito\b", "Respeite"),
    (r"\bfase de rotas\b(?!\s*\(laning phase\))", "fase de rotas (laning phase)"),
    (r"\bUM NÍVEL\b", "Nível A (A-Tier)"),
    (r"\bNÍVEL S\b", "Nível S (S-Tier)"),
    (r"\bNÍVEL A\b", "Nível A (A-Tier)"),
    (r"\bNÍVEL B\b", "Nível B (B-Tier)"),
    (r"\bNÍVEL C\b", "Nível C (C-Tier)"),
    (r"\bNÍVEL D\b", "Nível D (D-Tier)"),
    (r"\bopções de inicialização\b", "escolha de botas"),
    (r"\bopção de inicialização\b", "escolha de bota"),
    (r"\bconstruções\b", "builds"),
    (r"\bconstrução\b", "build"),
    (r"\bbrutamontes\b", "bruisers"),
    (r"\bbrutamonte\b", "bruiser"),
    (r"\bpista lateral\b", "side lane"),
    (r"\bpistas laterais\b", "side lanes"),
    (r"\bpista superior\b", "top lane"),
    (r"\bpista do meio\b", "mid lane"),
    (r"\bpista interior\b", "mid lane"),
    (r"\blinha lateral\b", "side lane"),
    (r"\bao contato\b", "on-hit"),
    (r"\bao acertar\b", "on-hit"),
    (r"\bum tiro\b", "one-shot"),
    (r"\btiro único\b", "one-shot"),
    (r"\bCicloespada Voltaica\b", "Voltaic Cyclosword"),
    (r"\bCanhão de Fogo Rápido\b", "Rapid Firecannon"),
    (r"\bLança de Shojin\b", "Spear of Shojin"),
    (r"\bRancor de Serylda\b", "Serylda's Grudge"),
    (r"\bLembrança de Lorde Dominik\b", "Lord Dominik's Regards"),
    (r"\bLembrete Mortal\b", "Mortal Reminder"),
    (r"\bLimiar da Noite\b", "Edge of Night"),
    (r"\bForça da Natureza\b", "Force of Nature"),
    (r"\bForça da Trindade\b", "Trinity Force"),
    (r"\bAnjo Guardião\b", "Guardian Angel"),
    (r"\bQuebracascos\b", "Hullbreaker"),
    (r"\bCéu Dividido\b", "Sundered Sky"),
    (r"\bCouraça do Defunto\b", "Dead Man's Plate"),
    (r"\bSemblante Espiritual\b", "Spirit Visage"),
    (r"\bConvergência de Zeke\b", "Zeke's Convergence"),
    (r"\bAmpulheta de Zhonya\b", "Zhonya's Hourglass"),
    (r"\bArmadura de Sangue do Soberano\b", "Overlord's Bloodmail"),
    (r"\bSinal de Sterak\b", "Sterak's Gage"),
    (r"\bCutelo Negro\b", "Black Cleaver"),
    (r"\bDança da Morte\b", "Death's Dance"),
    (r"\bPresságio de Randuin\b", "Randuin's Omen"),
    (r"\bCoração Congelado\b", "Frozen Heart"),
    (r"\bCoração de Aço\b", "Heartsteel"),
    (r"\bArmadura de Warmog\b", "Warmog's Armor"),
    (r"\bCorrente de Anátema\b", "Anathema's Chains"),
    (r"\bColete Espinhoso\b", "Bramble Vest"),
    (r"\bArmadura de Espinhos\b", "Thornmail"),
    (r"\bEspada do Rei Destruído\b", "Blade of the Ruined King (BoTRK)"),
    (r"\bPlaca Hextec Experimental\b", "Experimental Hexplate"),
    (r"\bHexplate Experimental\b", "Experimental Hexplate"),
    (r"\bQuebrapassos\b", "Stridebreaker"),
    (r"\bHidra Profana\b", "Profane Hydra"),
    (r"\bHidra Titânica\b", "Titanic Hydra"),
    (r"\bHidra Raivosa\b", "Ravenous Hydra"),
    (r"\bFauce de Malmortius\b", "Maw of Malmortius"),
    (r"\bMandíbula de Malmortius\b", "Maw of Malmortius"),
    (r"\bLâmina Fantasma de Youmuu\b", "Youmuu's Ghostblade"),
    (r"\bLâmina Fantasma\b", "Ghostblade"),
    (r"\bEspada Quimiopunk\b", "Chempunk Chainsword"),
    (r"\bChamado do Carrasco\b", "Executioner's Calling"),
    (r"\bBotas Galvanizadas de Aço\b", "Plated Steelcaps"),
    (r"\bBotas Galvanizadas\b", "Plated Steelcaps"),
    (r"\bPassos de Mercúrio\b", "Mercury's Treads"),
    (r"\bBotas da Rapidez\b", "Boots of Swiftness"),
    (r"\bSapatos do Feiticeiro\b", "Sorcerer's Shoes"),
    (r"\bBotas Ionianas da Lucidez\b", "Ionian Boots of Lucidity"),
    (r"\bGrevas do Berserker\b", "Berserker's Greaves"),
    (r"\bSolas Simbióticas\b", "Symbiotic Soles"),
    (r"\bEspada Longa\b", "Long Sword"),
    (r"\bEspadão\b", "B.F. Sword"),
    (r"\bPicareta\b", "Pickaxe"),
    (r"\bMartelo de Guerra de Caulfield\b", "Caulfield's Warhammer"),
    (r"\bFava de Madeira\b", "Phage"),
    (r"\bFago\b", "Phage"),
    (r"\bPunhal Serrilhado\b", "Serrated Dirk"),
    (r"\bChicote de Ferro\b", "Ironspike Whip"),
    (r"\bCristal de Rubi\b", "Ruby Crystal"),
    (r"\bManto Anula-Magia\b", "Null-Magic Mantle"),
    (r"\bArmadura de Pano\b", "Cloth Armor"),
    (r"\bGema Ardente\b", "Kindlegem"),
    (r"\bPoção Refilável\b", "Refillable Potion"),
    (r"\bPoção de Vida\b", "Health Potion"),
    (r"\bSentinela de Controle\b", "Control Ward"),
    (r"\bSentinela Invisível\b", "Stealth Ward"),
    (r"\bLente do Oráculo\b", "Oracle Lens"),
    (r"\bLente Reveladora\b", "Oracle Lens"),
]

EN_STOPWORDS_CACHE_CHECK = {
    'the', 'is', 'are', 'was', 'were', 'to', 'in', 'that', 'with', 'for', 'from',
    'they', 'be', 'been', 'being', 'have', 'has', 'had', 'or', 'you', 'your', 'it', 'its',
    'he', 'his', 'him', 'she', 'her', 'hers', 'their', 'theirs', 'them', 'when', 'which',
    'will', 'would', 'can', 'could', 'should', 'if', 'this', 'these', 'those', 'then',
    'there', 'than', 'into', 'up', 'out', 'on', 'off', 'over', 'under', 'again', 'further'
}

PT_STOPWORDS_CACHE_CHECK = {
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'para',
    'pra', 'com', 'sem', 'que', 'se', 'como', 'quando', 'onde', 'porque', 'por que',
    'ele', 'ela', 'eles', 'elas', 'dele', 'dela', 'deles', 'delas', 'seu', 'sua', 'seus',
    'suas', 'você', 'vocês', 'te', 'lhe', 'lhes', 'me', 'não', 'mais', 'muito', 'também',
    'ser', 'é', 'são', 'era', 'foi', 'foram', 'estar', 'está', 'estão', 'ter', 'tem', 'têm',
    'fazer', 'faz', 'pode', 'podem', 'deve', 'devem', 'ao', 'aos', 'à', 'às'
}

def smart_chunk_text(text: str, max_chunk_chars: int = 1500) -> List[str]:
    """Smartly segments long text by paragraphs, lines, or sentences up to max_chunk_chars."""
    clean = text.strip()
    if not clean:
        return []
    if len(clean) <= max_chunk_chars:
        return [clean]

    # Split primarily by double newlines (paragraphs)
    paragraphs = [p.strip() for p in clean.replace('\r\n', '\n').split('\n\n') if p.strip()]
    
    atomic_units: List[Tuple[str, str]] = []
    for p in paragraphs:
        if len(p) <= max_chunk_chars:
            atomic_units.append((p, '\n\n'))
        else:
            # Sub-split long paragraph by single newlines
            lines = [l.strip() for l in p.split('\n') if l.strip()]
            for l in lines:
                if len(l) <= max_chunk_chars:
                    atomic_units.append((l, '\n'))
                else:
                    # Sub-split long lines by sentence boundaries
                    sentences = re.split(r'(?<=[.!?])\s+', l)
                    for s in sentences:
                        s = s.strip()
                        if s:
                            atomic_units.append((s, ' '))

    chunks: List[str] = []
    curr_chunk = ""
    
    for unit, sep in atomic_units:
        if not curr_chunk:
            curr_chunk = unit
        elif len(curr_chunk) + len(unit) + len(sep) <= max_chunk_chars:
            curr_chunk += sep + unit
        else:
            chunks.append(curr_chunk)
            curr_chunk = unit

    if curr_chunk:
        chunks.append(curr_chunk)

    return chunks

class TranslationEngine:
    def __init__(self, cache_file: str = CACHE_FILE):
        self.cache_file = cache_file
        self.cache: Dict[str, str] = {}
        self.lock = threading.RLock()
        self.load_cache()

    def load_cache(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.cache = json.load(f)
                
                # Purge stale/untranslated large cache entries
                keys_to_delete = []
                for k, v in self.cache.items():
                    if len(k) > 600:
                        words_v = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", v.lower())
                        en_c = sum(1 for w in words_v if w in EN_STOPWORDS_CACHE_CHECK)
                        pt_c = sum(1 for w in words_v if w in PT_STOPWORDS_CACHE_CHECK)
                        if (en_c > pt_c and len(words_v) > 30) or k.strip() == v.strip():
                            keys_to_delete.append(k)
                            
                for k in keys_to_delete:
                    del self.cache[k]
                    
                if keys_to_delete:
                    print(f"Purged {len(keys_to_delete)} stale/untranslated large cache entries.")
                    
                print(f"Loaded {len(self.cache)} translations from cache ({self.cache_file}).")
            except Exception as e:
                print(f"Warning: could not read cache file ({e}). Starting fresh.")
                self.cache = {}
        else:
            self.cache = {}

    def save_cache(self):
        with self.lock:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
            print(f"Saved {len(self.cache)} translations to cache.")

    def mask_text(self, text: str) -> Tuple[str, Dict[str, str]]:
        token_map = {}
        idx = 0
        t = text

        for pat, rep in PRE_SUBSTITUTIONS:
            t = re.sub(pat, rep, t, flags=re.IGNORECASE)

        for term in PROTECTED_TERMS:
            pattern = re.compile(rf'\b{re.escape(term)}\b', re.IGNORECASE)
            def repl(m):
                nonlocal idx
                token = f"__T{idx}__"
                token_map[token] = term
                idx += 1
                return token
            t = pattern.sub(repl, t)

        return t, token_map

    def unmask_text(self, translated: str, token_map: Dict[str, str]) -> str:
        t = translated
        # Handle possible space variations added by MT
        for token, orig in token_map.items():
            num = token.replace("__T", "").replace("__", "")
            t = re.sub(rf'__\s*T{num}\s*__', orig, t, flags=re.IGNORECASE)
            t = t.replace(token, orig)

        for pat, rep in POST_SUBSTITUTIONS:
            t = re.sub(pat, rep, t, flags=re.IGNORECASE)

        return t

    def _fetch_neural_translation(self, masked_text: str) -> str:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=" + urllib.parse.quote(masked_text)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=12) as res:
                    data = json.loads(res.read().decode('utf-8'))
                    translated_raw = "".join([x[0] for x in data[0] if x and x[0]])
                    return translated_raw
            except Exception as e:
                if attempt == 3:
                    print(f"Failed to translate after 4 attempts: {e}")
                    return masked_text
                time.sleep(0.4 * (attempt + 1))
        return masked_text

    def translate_single(self, text: str) -> str:
        clean = text.strip()
        if not clean:
            return ""

        with self.lock:
            if clean in self.cache:
                cached_val = self.cache[clean]
                for pat, rep in POST_SUBSTITUTIONS:
                    cached_val = re.sub(pat, rep, cached_val, flags=re.IGNORECASE)
                return cached_val

        masked, token_map = self.mask_text(clean)
        translated_raw = self._fetch_neural_translation(masked)
        final_pt = self.unmask_text(translated_raw, token_map)

        with self.lock:
            self.cache[clean] = final_pt

        return final_pt

    def warm_cache_concurrently(self, texts: List[str], max_workers: int = 10):
        unique_texts = [t.strip() for t in set(texts) if t and t.strip()]
        uncached = [t for t in unique_texts if t not in self.cache]
        
        if not uncached:
            print(f"All {len(unique_texts)} texts are already present in translation cache!")
            return

        print(f"Translating {len(uncached)} uncached texts in parallel ({max_workers} threads)...")
        t0 = time.perf_counter()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_text = {executor.submit(self.translate_single, t): t for t in uncached}
            done_count = 0
            for future in concurrent.futures.as_completed(future_to_text):
                done_count += 1
                if done_count % 50 == 0 or done_count == len(uncached):
                    print(f"  -> Progress: {done_count}/{len(uncached)} items translated...")
                    self.save_cache()
                    
        t1 = time.perf_counter()
        print(f"Finished concurrent translation in {t1 - t0:.2f}s!")
        self.save_cache()


GLOBAL_TRANSLATOR = TranslationEngine()

def translate_tip_title(title_en: str) -> str:
    """Translates tip title to PT-BR, matching known dictionary or applying heuristics."""
    clean = title_en.strip()
    if clean in TITLE_TRANSLATIONS:
        return TITLE_TRANSLATIONS[clean]

    for en_pattern, pt_pattern in TITLE_TRANSLATIONS.items():
        if en_pattern.lower() == clean.lower():
            return pt_pattern

    # Pattern matching for dynamic titles
    if clean.startswith("Level 1 ") and "Start" in clean:
        spell = clean.replace("Level 1 ", "").replace(" Start", "").strip()
        return f"Início no Nível 1 com {spell}"
    if clean.startswith("Abuse ") and ("Cooldown" in clean or "CD" in clean):
        target = clean.replace("Abuse ", "").replace(" Cooldown", "").replace(" CD", "").strip()
        return f"Abuse do Tempo de Recarga (CD) de {target}"
    if clean.startswith("Abuse "):
        target = clean.replace("Abuse ", "").strip()
        return f"Abuse de {target}"
    if clean.startswith("Respect ") and "Level 1" in clean:
        target = clean.replace("Respect ", "").strip()
        return f"Respeite o Nível 1 de {target}"
    if clean.startswith("Respect "):
        target = clean.replace("Respect ", "").strip()
        return f"Respeite {target}"
    if clean.startswith("Play Around "):
        target = clean.replace("Play Around ", "").strip()
        return f"Jogue em Torno de {target}"
    if clean.startswith("Bait Out "):
        target = clean.replace("Bait Out ", "").strip()
        return f"Iscagem de {target} (Bait)"
    if clean.startswith("Build "):
        items = clean.replace("Build ", "").strip()
        return f"Build de {items}"
    if clean.startswith("Rush "):
        item = clean.replace("Rush ", "").strip()
        return f"Rush de {item}"
    if clean.startswith("Space "):
        target = clean.replace("Space ", "").strip()
        return f"Espaçamento de {target}"

    # General translation via neural translator
    return GLOBAL_TRANSLATOR.translate_single(clean)

def translate_body_text(text: str) -> str:
    """Translates narrative body text to authentic PT-BR preserving LoL terms via smart chunking."""
    clean = text.strip()
    if not clean:
        return ""

    with GLOBAL_TRANSLATOR.lock:
        if clean in GLOBAL_TRANSLATOR.cache:
            val = GLOBAL_TRANSLATOR.cache[clean]
            words = re.findall(r"\b[a-zA-ZÀ-ÿ']+\b", val.lower())
            if words:
                en_c = sum(1 for w in words if w in EN_STOPWORDS_CACHE_CHECK)
                pt_c = sum(1 for w in words if w in PT_STOPWORDS_CACHE_CHECK)
                if pt_c >= en_c or len(words) < 20:
                    return GLOBAL_TRANSLATOR.translate_single(clean)

    if len(clean) <= 1500:
        return GLOBAL_TRANSLATOR.translate_single(clean)

    chunks = smart_chunk_text(clean, max_chunk_chars=1500)
    translated_chunks = []
    for c in chunks:
        trans = GLOBAL_TRANSLATOR.translate_single(c)
        translated_chunks.append(trans)

    final_pt = "\n\n".join(translated_chunks)
    with GLOBAL_TRANSLATOR.lock:
        GLOBAL_TRANSLATOR.cache[clean] = final_pt
    return final_pt

# -----------------------------------------------------------------------------
# 4. EXTRACTION AND PARSING LOGIC
# -----------------------------------------------------------------------------

def load_data_dragon_info() -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Loads Riot Data Dragon champion definitions (en_US and pt_BR)."""
    ver = "16.16.1"
    try:
        req_en = urllib.request.urlopen(f"https://ddragon.leagueoflegends.com/cdn/{ver}/data/en_US/champion.json", timeout=6)
        dd_en = json.loads(req_en.read().decode('utf-8'))['data']
        req_pt = urllib.request.urlopen(f"https://ddragon.leagueoflegends.com/cdn/{ver}/data/pt_BR/champion.json", timeout=6)
        dd_pt = json.loads(req_pt.read().decode('utf-8'))['data']
        print(f"Loaded Data Dragon v{ver} ({len(dd_en)} champions)")
        return dd_en, dd_pt
    except Exception as e:
        print(f"Warning: could not fetch Data Dragon online ({e}). Using local fallback metadata.")
        return {}, {}

def parse_difficulty(diff_str: str) -> Tuple[str, int, str]:
    """Parses difficulty tier and numeric rating from string like 'Medium - 5/10'."""
    raw = diff_str.strip()
    match = re.search(r'(\d+)\s*/\s*10', raw)
    rating = int(match.group(1)) if match else 5

    tier = 'Medium'
    if 'Very Hard' in raw or rating >= 10:
        tier = 'Very Hard'
    elif 'Hard' in raw or rating >= 8:
        tier = 'Hard'
    elif 'Easy' in raw or rating <= 3:
        tier = 'Easy'
    elif 'Medium' in raw:
        tier = 'Medium'

    return tier, rating, raw

def categorize_tip(title: str, content: str) -> str:
    """Categorizes a matchup tip into a standard category."""
    combined = (title + " " + content).lower()
    if "level 1" in combined or "start" in combined or "lvl 1" in combined or "first minion" in combined or "alcove" in combined:
        return "Level 1"
    elif "wave" in combined or "freeze" in combined or "crash" in combined or "proxy" in combined or "push" in combined:
        return "Wave Management"
    elif "trade" in combined or "spacing" in combined or "poke" in combined or "short trade" in combined or "q trade" in combined:
        return "Trading"
    elif "all in" in combined or "all-in" in combined or "kill angle" in combined or "level 6" in combined or "burst" in combined or "solo kill" in combined:
        return "All-in"
    elif "build" in combined or "rush" in combined or "item" in combined or "botrk" in combined or "cleaver" in combined or "steelcaps" in combined or "tabi" in combined or "mercs" in combined:
        return "Itemization"
    elif "teamfight" in combined or "mid game" in combined or "midgame" in combined or "macro" in combined or "roam" in combined or "flank" in combined:
        return "Teamfight"
    else:
        return "General"

def collect_all_translatable_texts() -> List[str]:
    """Scans all CSV files and collects every text piece to warm up the translation cache."""
    all_texts = []
    
    # 1. Match Up Sheet
    csv_path = os.path.join(DOCS_DIR, "The Ultimate Renekton Guide Spreadsheet - Match Up Sheet.csv")
    with open(csv_path, 'r', encoding='utf-8', errors='replace') as fp:
        rows = list(csv.reader(fp))
        
    for r in rows[9:]:
        if not r or not any(r) or not r[0].strip():
            continue
        summary_en = r[6].strip() if len(r) > 6 else ""
        detailed_notes_raw_en = r[7].strip() if len(r) > 7 else ""
        if summary_en:
            all_texts.append(summary_en)
        if detailed_notes_raw_en:
            all_texts.append(detailed_notes_raw_en)
            
        tips_raw = re.split(r'\n+(?=\(\d+\))', detailed_notes_raw_en)
        if len(tips_raw) <= 1 and not detailed_notes_raw_en.startswith('(1)'):
            tips_raw = re.split(r'(?=\(\d+\))', detailed_notes_raw_en)
            tips_raw = [t.strip() for t in tips_raw if t.strip()]
            
        for tip_str in tips_raw:
            match = re.match(r'^\((\d+)\)\s*([^\n\-–—]+?)\s*[-–—]\s*(.*)$', tip_str, re.DOTALL)
            if match:
                all_texts.append(match.group(2).strip())
                all_texts.append(match.group(3).strip())
            else:
                match2 = re.match(r'^\((\d+)\)\s*([^\n]+?)\n+(.*)$', tip_str, re.DOTALL)
                if match2:
                    all_texts.append(match2.group(2).strip())
                    all_texts.append(match2.group(3).strip())
                elif tip_str.strip():
                    all_texts.append(tip_str.strip())
                    
    # 2. General Guides
    guide_specs = [
        {'file': 'The Ultimate Renekton Guide Spreadsheet - Introduction.csv'},
        {'file': 'The Ultimate Renekton Guide Spreadsheet - FAQ.csv'},
        {'file': 'The Ultimate Renekton Guide Spreadsheet - Fury Management.csv'},
        {'file': 'The Ultimate Renekton Guide Spreadsheet - Ability Starts + Maxing.csv'},
        {'file': 'The Ultimate Renekton Guide Spreadsheet - Items + Builds.csv'},
        {'file': 'The Ultimate Renekton Guide Spreadsheet - Mechanics + Combos.csv'},
        {'file': 'The Ultimate Renekton Guide Spreadsheet - Runes.csv'},
        {'file': 'The Ultimate Renekton Guide Spreadsheet - Summoners.csv'}
    ]
    for spec in guide_specs:
        fpath = os.path.join(DOCS_DIR, spec['file'])
        if os.path.exists(fpath):
            with open(fpath, 'r', encoding='utf-8', errors='replace') as fp:
                grows = list(csv.reader(fp))
            current_content_en = []
            current_title_en = ""
            for gr in grows:
                if not gr or not any(gr):
                    continue
                line = " ".join(c.strip() for c in gr if c.strip())
                if not line or "< END OF PAGE >" in line:
                    continue
                if len(line) < 60 and not line.endswith('.') and (line.isupper() or line.istitle() or line.startswith('Level 1') or line.startswith('Q ') or line.startswith('W ') or line.startswith('E ') or line.startswith('R ') or 'TIER' in line or 'Start' in line or 'Combos' in line or 'Runes' in line or 'Teleport' in line or 'Ignite' in line or 'Flash' in line or 'Ghost' in line or 'Exhaust' in line):
                    if current_title_en and current_content_en:
                        body_en = "\n\n".join(current_content_en)
                        for chunk in smart_chunk_text(body_en, max_chunk_chars=1500):
                            all_texts.append(chunk)
                        current_content_en = []
                    current_title_en = line
                    all_texts.append(line)
                else:
                    current_content_en.append(line)
                    if len(line) <= 1500:
                        all_texts.append(line)
                    else:
                        for chunk in smart_chunk_text(line, max_chunk_chars=1500):
                            all_texts.append(chunk)
            if current_title_en and current_content_en:
                body_en = "\n\n".join(current_content_en)
                for chunk in smart_chunk_text(body_en, max_chunk_chars=1500):
                    all_texts.append(chunk)

    return all_texts

def parse_matchup_sheet(dd_en: Dict[str, Any], dd_pt: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Parses the main Match Up Sheet.csv containing all 170 champions."""
    csv_path = os.path.join(DOCS_DIR, "The Ultimate Renekton Guide Spreadsheet - Match Up Sheet.csv")
    with open(csv_path, 'r', encoding='utf-8', errors='replace') as fp:
        rows = list(csv.reader(fp))

    # Load specific matchup video cache
    video_cache = {}
    video_cache_path = os.path.join(BASE_DIR, "scripts", "matchup_videos_cache.json")
    if os.path.exists(video_cache_path):
        try:
            with open(video_cache_path, 'r', encoding='utf-8') as vf:
                video_cache = json.load(vf)
        except Exception as e:
            print(f"Warning: could not read video cache ({e})")

    header = rows[8]
    champ_rows = rows[9:]

    champions_list = []
    matchups_list = []

    for idx, r in enumerate(champ_rows, start=1):
        if not r or not any(r):
            continue

        sheet_name = r[0].strip()
        if not sheet_name:
            continue

        # Resolve Riot Data Dragon identity
        if sheet_name in CHAMPION_SHEET_TO_RIOT:
            display_name = CHAMPION_SHEET_TO_RIOT[sheet_name]['name']
            riot_key = CHAMPION_SHEET_TO_RIOT[sheet_name]['riot_key']
        else:
            display_name = sheet_name
            riot_key = sheet_name.replace(' ', '').replace("'", '')
            for k in dd_en:
                if k.lower() == riot_key.lower() or dd_en[k]['name'].lower() == sheet_name.lower():
                    riot_key = k
                    display_name = dd_en[k]['name']
                    break

        dd_info_en = dd_en.get(riot_key, {})
        dd_info_pt = dd_pt.get(riot_key, {})

        riot_id = int(dd_info_en.get('key', idx))
        title_en = dd_info_en.get('title', '')
        title_pt = dd_info_pt.get('title', '')
        roles = dd_info_en.get('tags', ['Fighter'])
        icon_url = f"https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/{riot_key}.png"

        champ_obj = {
            'id': idx,
            'name': display_name,
            'sheetName': sheet_name,
            'riotKey': riot_key,
            'riotId': riot_id,
            'titlePt': title_pt if title_pt else title_en,
            'titleEn': title_en,
            'roles': roles,
            'iconUrl': icon_url
        }
        champions_list.append(champ_obj)

        # Matchup Data
        diff_tier, diff_rating, diff_raw = parse_difficulty(r[1])
        runes = r[2].strip()
        starting_items = r[3].strip()
        summoners = r[4].strip()
        ability_max_order = r[5].strip()
        summary_en = r[6].strip()
        detailed_notes_raw_en = r[7].strip()
        video_raw = r[8].strip()

        # Specific matchup video resolution from cache / sheet
        video_info = video_cache.get(display_name, video_cache.get(sheet_name, {}))
        video_url = video_info.get('url', '')
        video_title = video_info.get('title', '')
        video_channel = video_info.get('channel', '')
        video_source = video_info.get('source', '')
        video_id = video_info.get('videoId', '')

        if not video_url:
            if "youtube.com" in video_raw.lower() or "youtu.be" in video_raw.lower():
                video_url = video_raw
                video_source = 'sheet_raw'

        # Parse Structured Tips
        tips_raw = re.split(r'\n+(?=\(\d+\))', detailed_notes_raw_en)
        if len(tips_raw) <= 1 and not detailed_notes_raw_en.startswith('(1)'):
            tips_raw = re.split(r'(?=\(\d+\))', detailed_notes_raw_en)
            tips_raw = [t.strip() for t in tips_raw if t.strip()]

        parsed_tips = []
        fury_tips = []
        tip_count = 0

        for t_idx, tip_str in enumerate(tips_raw, start=1):
            tip_str = tip_str.strip()
            if not tip_str:
                continue

            tip_count += 1
            match = re.match(r'^\((\d+)\)\s*([^\n\-–—]+?)\s*[-–—]\s*(.*)$', tip_str, re.DOTALL)
            if match:
                tip_num = int(match.group(1))
                title_en_tip = match.group(2).strip()
                content_en_tip = match.group(3).strip()
            else:
                match2 = re.match(r'^\((\d+)\)\s*([^\n]+?)\n+(.*)$', tip_str, re.DOTALL)
                if match2:
                    tip_num = int(match2.group(1))
                    title_en_tip = match2.group(2).strip()
                    content_en_tip = match2.group(3).strip()
                else:
                    tip_num = tip_count
                    title_en_tip = f"Dica {tip_num}"
                    content_en_tip = tip_str

            title_pt_tip = translate_tip_title(title_en_tip)
            content_pt_tip = translate_body_text(content_en_tip)
            category = categorize_tip(title_en_tip, content_en_tip)

            tip_obj = {
                'id': (idx * 100) + tip_count,
                'matchupId': idx,
                'tipNumber': tip_num,
                'titleEn': title_en_tip,
                'titlePt': title_pt_tip,
                'contentEn': content_en_tip,
                'contentPt': content_pt_tip,
                'category': category,
                'displayOrder': tip_count
            }
            parsed_tips.append(tip_obj)

            if "fury" in title_en_tip.lower() or "fúria" in title_pt_tip.lower() or "empowered" in title_en_tip.lower():
                fury_tips.append(content_pt_tip)

        # Look up high-fidelity strategic summary if available
        try:
            from synthesize_strategic_summaries import CHALLENGER_SUMMARIES
        except ImportError:
            CHALLENGER_SUMMARIES = {}

        if display_name in CHALLENGER_SUMMARIES:
            summary_pt = CHALLENGER_SUMMARIES[display_name]['pt']
            summary_en = CHALLENGER_SUMMARIES[display_name]['en']
        elif summary_en:
            summary_pt = translate_body_text(summary_en)
        else:
            if parsed_tips:
                summary_pt = f"Neste confronto contra {display_name}, o foco principal é dominar as trocas no início de jogo. {parsed_tips[0]['contentPt']}"
                summary_en = f"In this matchup against {display_name}, the main focus is controlling early game trades. {parsed_tips[0]['contentEn']}"
            else:
                summary_pt = f"Guia de confronto detalhado contra {display_name} para Renekton."
                summary_en = f"Detailed Renekton matchup guide against {display_name}."

        detailed_notes_raw_pt = translate_body_text(detailed_notes_raw_en)

        matchup_obj = {
            'id': idx,
            'championId': idx,
            'championName': display_name,
            'sheetName': sheet_name,
            'riotKey': riot_key,
            'difficultyTier': diff_tier,
            'difficultyRating': diff_rating,
            'difficultyRaw': diff_raw,
            'runesRecommendation': runes,
            'startingItems': starting_items,
            'summonerSpells': summoners,
            'abilityMaxOrder': ability_max_order,
            'iconUrl': icon_url,
            'roles': roles,
            'hasVideo': bool(video_url),
            'videoUrl': video_url,
            'videoId': video_id,
            'videoTitle': video_title,
            'videoChannel': video_channel,
            'videoSource': video_source,
            'summaryEn': summary_en,
            'summaryPt': summary_pt,
            'detailedNotesRawEn': detailed_notes_raw_en,
            'detailedNotesRawPt': detailed_notes_raw_pt,
            'tips': parsed_tips,
            'furyTips': fury_tips
        }
        matchups_list.append(matchup_obj)

    return champions_list, matchups_list

def parse_general_guides() -> List[Dict[str, Any]]:
    """Parses all 8 general guide CSVs into structured sections."""
    guide_specs = [
        {
            'category': 'introduction',
            'file': 'The Ultimate Renekton Guide Spreadsheet - Introduction.csv',
            'title_en': "Godrekton's Ultimate Renekton Guide",
            'title_pt': "Guia Definitivo de Renekton por Godrekton",
            'description_en': "Introduction about Godrekton (12 years of Renekton experience), guide usage and content channels.",
            'description_pt': "Introdução sobre Godrekton (12 anos de experiência com Renekton), como utilizar o guia e canais de conteúdo.",
            'video_url': "https://youtu.be/iHUZWZFHpCo"
        },
        {
            'category': 'faq',
            'file': 'The Ultimate Renekton Guide Spreadsheet - FAQ.csv',
            'title_en': "Renekton FAQ & Guide Questions",
            'title_pt': "Perguntas Frequentes (FAQ) sobre Renekton",
            'description_en': "Frequently asked questions: outscale myth, bruiser vs assassin playstyles, ranked climbing and practice routines.",
            'description_pt': "Perguntas frequentes: mito do outscale no late game, estilos bruiser vs assassino, subida de elo e rotinas de treino.",
            'video_url': ""
        },
        {
            'category': 'fury_management',
            'file': 'The Ultimate Renekton Guide Spreadsheet - Fury Management.csv',
            'title_en': "Fury Management Mastery",
            'title_pt': "Domínio de Gerenciamento de Fúria",
            'description_en': "Complete guide to Fury numbers, generation per ability, 50/100 thresholds, fury trade combos and maintenance.",
            'description_pt': "Guia completo sobre valores de Fúria, geração por habilidade, thresholds de 50 e 100, combos de fúria e manutenção em combate.",
            'video_url': ""
        },
        {
            'category': 'ability_starts_maxing',
            'file': 'The Ultimate Renekton Guide Spreadsheet - Ability Starts + Maxing.csv',
            'title_en': "Ability Starts & Maxing Orders",
            'title_pt': "Habilidade Inicial e Ordem de Evolução (Maxing)",
            'description_en': "Level 1 starts (Q vs W vs E for Top and Mid lane) and optimal skill maxing paths (Q>E>W vs Q3>W>E).",
            'description_pt': "Habilidade inicial no Nível 1 (Q vs W vs E para Top e Mid lane) e ordens ótimas de maxar (Q>E>W vs Q3>W>E).",
            'video_url': ""
        },
        {
            'category': 'items_builds',
            'file': 'The Ultimate Renekton Guide Spreadsheet - Items + Builds.csv',
            'title_en': "Items & Builds Tier List",
            'title_pt': "Itens, Builds e Tier List",
            'description_en': "Starting items, item tier list (S to D Tier), boot choices, and 3 full builds (Bruiser Core, Sustain, Lethality Assassin).",
            'description_pt': "Itens iniciais, tier list de itens (S a D Tier), escolha de botas e 3 builds completas (Bruiser Core, Sustentação, Assassino Letalidade).",
            'video_url': "https://www.youtube.com/watch?v=goGe2OUl0b8"
        },
        {
            'category': 'mechanics_combos',
            'file': 'The Ultimate Renekton Guide Spreadsheet - Mechanics + Combos.csv',
            'title_en': "Mechanics & Animation Cancels",
            'title_pt': "Mecânicas Avançadas e Cancelamento de Animações",
            'description_en': "Auto attack cancels, Hydra doublecasts, Q/W/E/R flash buffering and complete short trade & all-in combo repertoire.",
            'description_pt': "Cancelamentos de auto ataque, doublecasts com Hidra, interações de Q/W/E/R com Flash, e repertório completo de combos curtos e all-in.",
            'video_url': "https://www.youtube.com/watch?v=VWbLtKGjVc4"
        },
        {
            'category': 'runes',
            'file': 'The Ultimate Renekton Guide Spreadsheet - Runes.csv',
            'title_en': "Runes & Keystone Setups",
            'title_pt': "Runas e Páginas Otimizadas",
            'description_en': "Deep PTA vs Conqueror comparison, minor runes breakdown, and 6 specialized complete rune pages.",
            'description_pt': "Comparativo aprofundado PTA vs Conqueror, análise de runas menores e 6 páginas de runas especializadas.",
            'video_url': "https://www.youtube.com/watch?v=VWbLtKGjVc4&t=14s"
        },
        {
            'category': 'summoners',
            'file': 'The Ultimate Renekton Guide Spreadsheet - Summoners.csv',
            'title_en': "Summoner Spells Breakdown",
            'title_pt': "Feitiços de Invocador (Summoner Spells)",
            'description_en': "Detailed analysis of Ignite, Teleport (Season 16 shield mechanic), Flash, Ghost, and Exhaust with situational pros & cons.",
            'description_pt': "Análise detalhada de Ignite, Teleport (mecânica de escudo da Season 16), Flash, Ghost e Exhaust com prós e contras situacionais.",
            'video_url': ""
        }
    ]

    guides_output = []

    for g_idx, spec in enumerate(guide_specs, start=1):
        file_path = os.path.join(DOCS_DIR, spec['file'])
        with open(file_path, 'r', encoding='utf-8', errors='replace') as fp:
            rows = list(csv.reader(fp))

        sections = []
        sec_idx = 0

        current_title_en = ""
        current_content_en = []

        for r in rows:
            if not r or not any(r):
                continue
            line = " ".join(c.strip() for c in r if c.strip())
            if not line or "< END OF PAGE >" in line:
                continue

            if len(line) < 60 and not line.endswith('.') and (line.isupper() or line.istitle() or line.startswith('Level 1') or line.startswith('Q ') or line.startswith('W ') or line.startswith('E ') or line.startswith('R ') or 'TIER' in line or 'Start' in line or 'Combos' in line or 'Runes' in line or 'Teleport' in line or 'Ignite' in line or 'Flash' in line or 'Ghost' in line or 'Exhaust' in line):
                if current_title_en and current_content_en:
                    sec_idx += 1
                    body_en = "\n\n".join(current_content_en)
                    body_pt = translate_body_text(body_en)
                    title_pt = translate_tip_title(current_title_en)
                    sections.append({
                        'id': (g_idx * 100) + sec_idx,
                        'category': spec['category'],
                        'sectionKey': re.sub(r'[^a-z0-9_]', '', current_title_en.lower().replace(' ', '_'))[:30],
                        'displayOrder': sec_idx,
                        'titleEn': current_title_en,
                        'titlePt': title_pt,
                        'contentEn': body_en,
                        'contentPt': body_pt,
                        'videoUrl': spec['video_url'] if sec_idx == 1 else ""
                    })
                    current_content_en = []
                current_title_en = line
            else:
                if not current_title_en:
                    current_title_en = "Visão Geral"
                current_content_en.append(line)

        if current_title_en and current_content_en:
            sec_idx += 1
            body_en = "\n\n".join(current_content_en)
            body_pt = translate_body_text(body_en)
            title_pt = translate_tip_title(current_title_en)
            sections.append({
                'id': (g_idx * 100) + sec_idx,
                'category': spec['category'],
                'sectionKey': re.sub(r'[^a-z0-9_]', '', current_title_en.lower().replace(' ', '_'))[:30],
                'displayOrder': sec_idx,
                'titleEn': current_title_en,
                'titlePt': title_pt,
                'contentEn': body_en,
                'contentPt': body_pt,
                'videoUrl': spec['video_url'] if sec_idx == 1 else ""
            })

        guide_obj = {
            'category': spec['category'],
            'titleEn': spec['title_en'],
            'titlePt': spec['title_pt'],
            'descriptionEn': spec['description_en'],
            'descriptionPt': spec['description_pt'],
            'videoUrl': spec['video_url'],
            'sections': sections
        }
        guides_output.append(guide_obj)

    return guides_output

# -----------------------------------------------------------------------------
# 5. SQLITE DATABASE SEED GENERATION
# -----------------------------------------------------------------------------

def generate_sqlite_db_and_sql(champions: List[Dict[str, Any]], matchups: List[Dict[str, Any]], guides: List[Dict[str, Any]]):
    """Creates SQLite database and writes schema.sql & seed.sql."""
    db_path = os.path.join(DB_DIR, "champion_matchup.db")
    schema_path = os.path.join(DB_DIR, "schema.sql")
    seed_path = os.path.join(DB_DIR, "seed.sql")

    if os.path.exists(db_path):
        os.remove(db_path)

    schema_sql = """-- ============================================================================
-- SCHEMA DDL: CHAMPION MATCHUP DATABASE (RENEKTON ULTIMATE GUIDE)
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS champions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sheet_name TEXT NOT NULL,
    riot_key TEXT NOT NULL,
    riot_id INTEGER,
    title_pt TEXT,
    title_en TEXT,
    roles_json TEXT,
    icon_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matchups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    champion_id INTEGER NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
    difficulty_tier TEXT NOT NULL,
    difficulty_rating INTEGER NOT NULL,
    difficulty_raw TEXT NOT NULL,
    runes_recommendation TEXT NOT NULL,
    starting_items TEXT NOT NULL,
    summoner_spells TEXT NOT NULL,
    ability_max_order TEXT NOT NULL,
    summary_en TEXT,
    summary_pt TEXT,
    detailed_notes_raw_en TEXT,
    detailed_notes_raw_pt TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matchup_tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matchup_id INTEGER NOT NULL REFERENCES matchups(id) ON DELETE CASCADE,
    tip_number INTEGER NOT NULL,
    title_en TEXT NOT NULL,
    title_pt TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_pt TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS guide_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    section_key TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    title_en TEXT NOT NULL,
    title_pt TEXT NOT NULL,
    subtitle_en TEXT,
    subtitle_pt TEXT,
    content_en TEXT NOT NULL,
    content_pt TEXT NOT NULL,
    video_url TEXT,
    metadata_json TEXT
);

CREATE TABLE IF NOT EXISTS user_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    champion_id INTEGER NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
    game_id TEXT,
    match_result TEXT NOT NULL CHECK(match_result IN ('win', 'loss', 'remake')),
    perceived_difficulty INTEGER NOT NULL CHECK(perceived_difficulty BETWEEN 1 AND 5),
    what_worked TEXT,
    what_failed TEXT,
    free_notes TEXT,
    runes_used TEXT,
    items_built TEXT,
    summoners_used TEXT,
    kda TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_champions_name ON champions(name);
CREATE INDEX IF NOT EXISTS idx_champions_riot_key ON champions(riot_key);
CREATE INDEX IF NOT EXISTS idx_matchups_champion_id ON matchups(champion_id);
CREATE INDEX IF NOT EXISTS idx_matchup_tips_matchup_id ON matchup_tips(matchup_id);
CREATE INDEX IF NOT EXISTS idx_guide_sections_category ON guide_sections(category, display_order);
CREATE INDEX IF NOT EXISTS idx_user_notes_champion_id ON user_notes(champion_id, created_at DESC);
"""

    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(schema_sql)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.executescript(schema_sql)

    def sql_quote(val):
        if val is None:
            return 'NULL'
        escaped = str(val).replace("'", "''")
        return f"'{escaped}'"

    seed_statements = ["-- SEED DATA FOR CHAMPION MATCHUP DATABASE\nBEGIN TRANSACTION;\n"]

    # 1. Champions
    for c in champions:
        roles_json = json.dumps(c['roles'])
        cur.execute("""
            INSERT INTO champions (id, name, sheet_name, riot_key, riot_id, title_pt, title_en, roles_json, icon_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (c['id'], c['name'], c['sheetName'], c['riotKey'], c['riotId'], c['titlePt'], c['titleEn'], roles_json, c['iconUrl']))

        seed_statements.append(f"""INSERT INTO champions (id, name, sheet_name, riot_key, riot_id, title_pt, title_en, roles_json, icon_url)
VALUES ({c['id']}, {sql_quote(c['name'])}, {sql_quote(c['sheetName'])}, {sql_quote(c['riotKey'])}, {c['riotId']}, {sql_quote(c['titlePt'])}, {sql_quote(c['titleEn'])}, {sql_quote(roles_json)}, {sql_quote(c['iconUrl'])});""")

    # 2. Matchups & Tips
    total_tips = 0
    for m in matchups:
        cur.execute("""
            INSERT INTO matchups (id, champion_id, difficulty_tier, difficulty_rating, difficulty_raw,
                                  runes_recommendation, starting_items, summoner_spells, ability_max_order,
                                  summary_en, summary_pt, detailed_notes_raw_en, detailed_notes_raw_pt, video_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (m['id'], m['championId'], m['difficultyTier'], m['difficultyRating'], m['difficultyRaw'],
              m['runesRecommendation'], m['startingItems'], m['summonerSpells'], m['abilityMaxOrder'],
              m['summaryEn'], m['summaryPt'], m['detailedNotesRawEn'], m['detailedNotesRawPt'], m['videoUrl']))

        seed_statements.append(f"""INSERT INTO matchups (id, champion_id, difficulty_tier, difficulty_rating, difficulty_raw, runes_recommendation, starting_items, summoner_spells, ability_max_order, summary_en, summary_pt, detailed_notes_raw_en, detailed_notes_raw_pt, video_url)
VALUES ({m['id']}, {m['championId']}, {sql_quote(m['difficultyTier'])}, {m['difficultyRating']}, {sql_quote(m['difficultyRaw'])}, {sql_quote(m['runesRecommendation'])}, {sql_quote(m['startingItems'])}, {sql_quote(m['summonerSpells'])}, {sql_quote(m['abilityMaxOrder'])}, {sql_quote(m['summaryEn'])}, {sql_quote(m['summaryPt'])}, {sql_quote(m['detailedNotesRawEn'])}, {sql_quote(m['detailedNotesRawPt'])}, {sql_quote(m['videoUrl'])});""")

        for tip in m['tips']:
            total_tips += 1
            cur.execute("""
                INSERT INTO matchup_tips (id, matchup_id, tip_number, title_en, title_pt, content_en, content_pt, category, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (tip['id'], tip['matchupId'], tip['tipNumber'], tip['titleEn'], tip['titlePt'], tip['contentEn'], tip['contentPt'], tip['category'], tip['displayOrder']))

            seed_statements.append(f"""INSERT INTO matchup_tips (id, matchup_id, tip_number, title_en, title_pt, content_en, content_pt, category, display_order)
VALUES ({tip['id']}, {tip['matchupId']}, {tip['tipNumber']}, {sql_quote(tip['titleEn'])}, {sql_quote(tip['titlePt'])}, {sql_quote(tip['contentEn'])}, {sql_quote(tip['contentPt'])}, {sql_quote(tip['category'])}, {tip['displayOrder']});""")

    # 3. Guide Sections
    total_guide_sections = 0
    for g in guides:
        for s in g['sections']:
            total_guide_sections += 1
            cur.execute("""
                INSERT INTO guide_sections (id, category, section_key, display_order, title_en, title_pt, subtitle_en, subtitle_pt, content_en, content_pt, video_url, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (s['id'], s['category'], s['sectionKey'], s['displayOrder'], s['titleEn'], s['titlePt'], "", "", s['contentEn'], s['contentPt'], s['videoUrl'], "{}"))

            seed_statements.append(f"""INSERT INTO guide_sections (id, category, section_key, display_order, title_en, title_pt, subtitle_en, subtitle_pt, content_en, content_pt, video_url, metadata_json)
VALUES ({s['id']}, {sql_quote(s['category'])}, {sql_quote(s['sectionKey'])}, {s['displayOrder']}, {sql_quote(s['titleEn'])}, {sql_quote(s['titlePt'])}, '', '', {sql_quote(s['contentEn'])}, {sql_quote(s['contentPt'])}, {sql_quote(s['videoUrl'])}, '{{}}');""")

    # 4. App Meta
    cur.execute("INSERT INTO app_meta (key, value) VALUES ('db_version', '1.0.0'), ('champion_count', '170'), ('seed_timestamp', '2026-08-22T00:00:00Z')")
    seed_statements.append("""INSERT INTO app_meta (key, value) VALUES ('db_version', '1.0.0'), ('champion_count', '170'), ('seed_timestamp', '2026-08-22T00:00:00Z');""")
    seed_statements.append("COMMIT;\n")

    conn.commit()
    conn.close()

    with open(seed_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(seed_statements))

    print(f"SQLite DB seeded successfully: {len(champions)} champions, {len(matchups)} matchups, {total_tips} tips, {total_guide_sections} guide sections.")

# -----------------------------------------------------------------------------
# 6. MAIN PIPELINE EXECUTION
# -----------------------------------------------------------------------------

def main():
    print("=== Starting Renekton Champion Matchup 5-Stage Neural Translation & Seeding Pipeline ===")

    dd_en, dd_pt = load_data_dragon_info()

    print("1. Collecting all translatable texts across CSVs to warm translation cache...")
    all_texts = collect_all_translatable_texts()
    print(f"   -> Collected {len(all_texts)} total textual segments.")
    GLOBAL_TRANSLATOR.warm_cache_concurrently(all_texts, max_workers=10)

    print("2. Parsing Match Up Sheet (170 champions)...")
    champions, matchups = parse_matchup_sheet(dd_en, dd_pt)
    print(f"   -> Parsed {len(champions)} champions and {len(matchups)} matchups.")

    print("3. Parsing 8 General Guides...")
    guides = parse_general_guides()
    print(f"   -> Parsed {len(guides)} general guides with {sum(len(g['sections']) for g in guides)} sections.")

    print("4. Generating JSON Data artifacts in src/data/...")

    # 4.1 champions.json
    with open(os.path.join(SRC_DATA_DIR, "champions.json"), 'w', encoding='utf-8') as f:
        json.dump(champions, f, ensure_ascii=False, indent=2)

    # 4.2 matchups.json
    with open(os.path.join(SRC_DATA_DIR, "matchups.json"), 'w', encoding='utf-8') as f:
        json.dump(matchups, f, ensure_ascii=False, indent=2)

    # 4.3 matchup-summaries.json (lightweight for fast sidebar loading)
    summaries = []
    for m in matchups:
        summaries.append({
            'id': m['id'],
            'championId': m['championId'],
            'championName': m['championName'],
            'sheetName': m['sheetName'],
            'riotKey': m['riotKey'],
            'difficultyTier': m['difficultyTier'],
            'difficultyRating': m['difficultyRating'],
            'difficultyRaw': m['difficultyRaw'],
            'runesRecommendation': m['runesRecommendation'],
            'startingItems': m['startingItems'],
            'summonerSpells': m['summonerSpells'],
            'abilityMaxOrder': m['abilityMaxOrder'],
            'iconUrl': m['iconUrl'],
            'roles': m['roles'],
            'hasVideo': m['hasVideo'],
            'videoUrl': m.get('videoUrl', ''),
            'videoId': m.get('videoId', ''),
            'videoTitle': m.get('videoTitle', ''),
            'videoChannel': m.get('videoChannel', ''),
            'videoSource': m.get('videoSource', '')
        })
    with open(os.path.join(SRC_DATA_DIR, "matchup-summaries.json"), 'w', encoding='utf-8') as f:
        json.dump(summaries, f, ensure_ascii=False, indent=2)

    # 4.4 guides.json
    with open(os.path.join(SRC_DATA_DIR, "guides.json"), 'w', encoding='utf-8') as f:
        json.dump(guides, f, ensure_ascii=False, indent=2)

    print("5. Generating SQLite Database and SQL Seeds in src-tauri/src/db/...")
    generate_sqlite_db_and_sql(champions, matchups, guides)

    GLOBAL_TRANSLATOR.save_cache()
    print("=== Pipeline Complete! All datasets, SQLite DB, and Seeds generated successfully! ===")

if __name__ == '__main__':
    main()
