<div align="center">

# 🐊 Renekton Matchups Desktop Tool

### *A Community Tribute to [Godrekton](https://www.youtube.com/@Godrekton) & [r/RenektonMains](https://www.reddit.com/r/RenektonMains/)*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Embedded-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Universal i18n](https://img.shields.io/badge/Language-English_%7C_Português-E0B15C)](#-universal-language-support)

<p align="center">
  <b>The ultimate offline & real-time companion app for Renekton Toplane OTPs and enthusiasts.</b><br/>
  Powered by Godrekton's 12+ years of mono-Renekton mastery and his legendary 170-champion matchup spreadsheet.
</p>

[Download Latest Release](https://github.com/GuhQuintino/renekton-matchups/releases) •
[Features](#-key-features) •
[Godrekton's Guides](#-godrektons-8-master-guides) •
[Installation & Build](#-build-from-source) •
[Versão em Português](#-sobre-o-projeto-em-português)

---

</div>

## 🌟 The Tribute

This application was engineered as a tribute to **Godrekton**, one of the most dedicated and knowledgeable Renekton one-tricks in League of Legends history (12+ years playing the Butcher of the Sands). His comprehensive Google Sheets guide covering all **170 matchups**, level 1 advantages, fury manipulation, and itemization has helped thousands of top laners climb the ladder.

- 📺 **YouTube**: [Godrekton's Official Channel](https://www.youtube.com/@Godrekton)
- 💬 **Reddit**: Join the discussion on [r/RenektonMains](https://www.reddit.com/r/RenektonMains/)

---

## ⚡ Key Features

### 🌐 Universal Language Support (English & Portuguese)
Switch seamlessly between **English (`en`)** and **Português do Brasil (`pt-br`)** with one click in the header. All 170 champion strategies, master guides, combo visualizers, item names, and UI elements adapt instantly with zero reloading.

### 🐊 Complete 170-Champion Matchup Database
- **Instant Search**: Sub-millisecond lookup by name or alias (e.g. *Mundo* $\rightarrow$ Dr. Mundo, *Wukong* $\rightarrow$ MonkeyKing).
- **3-Second Pre-Game Decision Bar**: Recommended Runes (PTA vs Conqueror), Summoner Spells (Ignite vs TP vs Ghost), Starting Items (D-Blade vs D-Shield vs Long Sword), and Skill Leveling path.
- **Difficulty Grading**: Ranked from 1/10 (Very Easy) to 10/10 (Extreme Nightmare) with Godrekton's exact tactical notes.

### 🔄 Real-Time League Client (LCU) & In-Game Detection
- **Auto LCU Sync**: Reads the League of Legends lockfile and Live Client Data API.
- **Picks & Bans Detection**: Automatically parses champion select, filters enemy team picks, and highlights probable Toplaners.
- **Live In-Game HUD**: Locks your lane opponent automatically at game start. Displays live game timer, opponent stats, level advantages, and a 1-click **Lane Swap** button for flex drafts (e.g. Yasuo mid / Yone top).
- **Game State Simulator**: Built-in simulator mode to test and explore all game phases (Champ Select, In-Game Level 3, Lane Swap, Post-Game) without needing an active League client running.

### 📝 Post-Game Match Notes & Performance Tracker
- Log tactical lessons directly into your local embedded **SQLite** database.
- Track match outcome (Win / Loss / Remake), felt difficulty rating (1 to 5 stars), what worked, mistakes made, KDA, and item build.
- Generates dynamic opponent-specific Winrate and average felt difficulty statistics.

### 🥋 Combos & Fury Visualizer
- Visual step-by-step combo sequence cards (The Panther Combo, Standard Short Trade, Level 3 All-In, Dive One-Shot, Fury Double Dash).
- Rage gauge management indicators showing when to hold, trigger, or split empowered abilities.

### 📊 Level 1 Advantage Tier List
- **5 Ability Start Tiers**: Q Start (Sustain & Wave Control), W Start (Bush Cheese & Auto-Reset), E Start (Level 1 All-In vs Darius/Tryndamere), E Alcove Start, and Situational Reactive Starts.
- **3 Item Start Tiers**: Doran's Shield Mandatory, Blade or Shield Flexible, Long Sword Rush.

### 🇰🇷 DeepLoL Live Korean Challenger Analytics
- Direct 1-click tab integrating live high-elo Korean OTP Renekton data, runes popularity, winrate trends, and matchup counter analytics.

### 🛡️ 100% Offline & Local-First Architecture
- All 170 matchups and 8 master guides are pre-seeded into an embedded SQLite engine.
- Zero network reliance: bundled SVG vector icon fallbacks ensure full offline operation.
- Compliant with Riot Games third-party developer policies: strictly read-only local API calls, zero memory modification.

---

## 📖 Godrekton's 8 Master Guides

Access Godrekton's complete compendium directly inside the app:

| Guide | Description |
|---|---|
| **1. Introduction & Mindset** | The philosophy of playing Renekton, lane tempo, and power spikes |
| **2. Renekton FAQ** | Answers to common OTP dilemmas, wave control, and teamfight positioning |
| **3. Runes Deep Dive** | When to take PTA, Conqueror, or Grasp of the Undying |
| **4. Mechanics & Combos** | Animation cancels, Panther Combo execution, and Ironspike/Tiamat weaves |
| **5. Summoner Spells** | Flash + Ignite vs Flash + Teleport vs Ghost matchups |
| **6. Builds & Itemization** | Core Bruiser vs Lethality vs Frontline Tank paths |
| **7. Ability Starts & Max Order** | When to max Q vs W vs E first and reactive level 1 skill points |
| **8. Fury Management** | Maintaining 50+ Fury, wave setup, and empowered ability priorities |

---

## 🛠️ Build from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (latest stable)
- Visual Studio C++ Build Tools (for Windows desktop target)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/GuhQuintino/renekton-matchups.git
cd renekton-matchups

# 2. Install dependencies
npm install

# 3. Run frontend in browser preview mode
npm run dev

# 4. Run native desktop app with live reload (Tauri + Rust)
npm run tauri:dev

# 5. Run full test suite (203 tests across all 4 tiers)
npm test

# 6. Build production executable installer
npm run tauri:build
```

The production installer will be generated in `src-tauri/target/release/bundle/nsis/`.

---

## 🏗️ Architecture & Tech Stack

```
champion-matchup/
├── src/                          # React 19 Frontend
│   ├── components/               # UI Components (HeroCard, MatchupTabs, InGameHUD, etc.)
│   │   ├── notes/                # Post-Game SQLite Notes System
│   │   ├── QuickInfoBar.tsx      # 3-Second Tactical Decision Bar
│   │   ├── CombosVisualizer.tsx  # Step-by-Step Fury Combo Visualizer
│   │   └── Header.tsx            # Live Phase Pill & Language Switcher
│   ├── i18n/                     # Universal Localization System
│   │   ├── translations/en.ts    # Complete English Translation Dictionary
│   │   ├── translations/pt-br.ts # Complete PT-BR Translation Dictionary
│   │   └── LanguageContext.tsx   # Reactive i18n Provider
│   ├── services/                 # LCU, Live Client Data, DB & Simulator Bridges
│   └── types/                    # Strict TypeScript Definitions
├── src-tauri/                    # Rust Backend & Native Host
│   ├── src/
│   │   ├── db/                   # Embedded SQLite Database Engine & Migrations
│   │   ├── lcu/                  # LoL Client Connector & Lockfile Discovery
│   │   ├── liveclient/           # Live Client Data Poller & Toplane Detector
│   │   └── main.rs               # Tauri v2 Command Dispatcher
│   └── Cargo.toml                # Rust Dependencies (tauri v2, rusqlite, reqwest)
└── tests/                        # 203 Automated Verification Tests
    ├── tier1_feature_coverage/   # Features F1 to F19
    ├── tier2_boundary_corner/    # B1 to B8 Robustness & Injection Edge Cases
    ├── tier3_cross_feature/      # Cross-Module Integration Flows
    └── tier4_real_world_scenarios/# Full Ranked Match End-to-End Simulations
```

---

## 🇧🇷 Sobre o Projeto (Em Português)

### O Tributo
Este aplicativo desktop foi criado como uma homenagem da comunidade ao **Godrekton**, mono Renekton há mais de 12 anos e autor da famosa planilha com 170 confrontos da rota superior. O objetivo é transformar todo o conhecimento estratégico da planilha em uma ferramenta nativa, ultrarrápida e moderna para auxiliar a comunidade global e brasileira.

### Destaques
- **Troca de Idioma em 1 Clique**: Suporte completo para Inglês e Português do Brasil com terminologia oficial do League of Legends.
- **Detecção Automática do LoL**: Sincroniza com o Cliente Riot e a Live Client Data API para identificar o adversário de lane no Top em tempo real.
- **HUD Durante a Partida**: Mostra vantagens de nível, cronômetro de jogo, dicas táticas instantâneas e botão de troca de lane.
- **Anotações Pós-Jogo em SQLite Local**: Registre o que funcionou e o que errou em cada confronto para gerar histórico e winrate pessoal por campeão.
- **Guias Completos do Godrekton**: 8 seções detalhadas de runas, combos cancel-animation, gerenciamento de fúria e builds.
- **Totalmente Offline**: Banco SQLite embutido com ícones vetoriais locais para funcionar mesmo sem conexão com a internet.

---

## ⚖️ Disclaimer

*Renekton Matchups Desktop Tool isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.*

*This tool exclusively uses official, local, read-only APIs provided by the League of Legends Client (LCU Lockfile and Live Client Data). It does NOT alter memory, inject code, or modify game files in any way.*

---

## 📄 License

Distributed under the [MIT License](LICENSE). Feel free to inspect, contribute, or fork!
