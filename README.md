<div align="center">

# 🐊 Renekton Matchups Desktop Tool

### *A Community Tribute to [Godrekton](https://www.youtube.com/@Godrekton) & [r/RenektonMains](https://www.reddit.com/r/RenektonMains/)*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Release](https://img.shields.io/github/v/release/GuhQuintino/renekton-matchups?color=brightgreen&label=Windows%20Installer)](https://github.com/GuhQuintino/renekton-matchups/releases/latest)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Embedded-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Universal i18n](https://img.shields.io/badge/Language-English_%7C_Português-E0B15C)](#-universal-language-support)

<p align="center">
  <b>The offline & real-time companion app for Renekton Toplane OTPs and enthusiasts.</b><br/>
  Powered by Godrekton's 12+ years of mono-Renekton mastery and his legendary 170-champion matchup spreadsheet.
</p>

[📥 Download Easy Windows Installer](#-easy-installation-for-gamers-no-coding-required) •
[App Tutorial & Screenshots](#-how-to-use-the-app-visual-tutorial) •
[Community Note](#-honest-note-from-the-creator) •
[Features](#-key-features) •
[Godrekton's Guides](#-godrektons-8-master-guides) •
[Versão em Português](#-sobre-o-projeto-em-português)

---

</div>

## ⚠️ Honest Note from the Creator

> [!IMPORTANT]
> **Please Read Before Using:**
> - **The App is Far from Perfect**: I created this desktop tool purely out of love for Renekton and as a tribute to **Godrekton**. 
> - **I Have Zero Coding Experience**: This entire project was engineered utilizing **Artificial Intelligence**. Because I am not a professional software developer, there are rough edges, quirks, and areas that need improvement.
> - **Help from the Community is Needed and Wanted!**: This repository is **100% open-source**. If you are a developer, a designer, or an experienced Renekton player, **pull requests, bug fixes, issue reports, and feedback are very welcome!** Let's make this the ultimate tool for the community together.
> - **Current App State**:
>   - 🟢 **As a Matchup Study & Theory Tool: EXCELLENT.** Browsing all 170 matchups, studying Godrekton's exact tips, level 1 starts, runes, combos, item builds, and logging your personal post-game notes is blazing fast, beautiful, and completely offline.
>   - 🟡 **As a Live Pre-Game / In-Game Assistant: STILL EXPERIMENTAL.** Automatic League client detection (Champ Select parsing and Live In-Game HUD via Riot local API) works in many cases, but can still be unstable or desync depending on system conditions. Manual selection is always available as a stable fallback.

---

## 📥 Easy Installation for Gamers (No Coding Required!)

You **do NOT need** to install Node.js, Rust, Git, or write any commands. Simply install the pre-compiled application:

1. Go to the official **[Releases Page](https://github.com/GuhQuintino/renekton-matchups/releases/latest)**.
2. Download **`Instalador-Renekton-Matchups.exe`**.
3. Double-click the downloaded file and follow the standard Windows setup wizard (Next $\rightarrow$ Finish).
4. Launch **Renekton Matchups** from your Desktop shortcut or Windows Start Menu!

*(If Windows SmartScreen shows an alert, click "More info" $\rightarrow$ "Run anyway". The app is open-source and safe).*

---

## 📸 How to Use the App (Visual Tutorial)

### 1. Champion Search & Instant Filters
Quickly locate any matchup by typing the champion's name or alias (e.g. *Mundo* or *Wukong*). Filter champions by difficulty rating (*Easy, Medium, Hard, Extreme*) or view your starred favorites.

<div align="center">
  <img src="Docs/tutorial/01_champion_select_search.png" alt="Champion Search and Sidebar" width="800" />
</div>

---

### 2. Tactical Matchup Breakdown & 3-Second Pre-Game Decision
Before the game starts, get the critical setup within 3 seconds:
- **Primary & Secondary Runes** (e.g. PTA vs Conqueror)
- **Summoner Spells** (e.g. Flash + Ignite vs Flash + TP)
- **Starting Items** (D-Blade vs D-Shield vs Long Sword Rush)
- **Skill Priority & Level 1 Start**
- **Godrekton's Step-by-Step Strategic Notes** for the lane

<div align="center">
  <img src="Docs/tutorial/02_tactical_matchup_details.png" alt="Matchup Tactical Details" width="800" />
</div>

---

### 3. Godrekton's 8 Master Guides & Level 1 Tier List
Click the **"Guias Gerais / Master Guides"** or **"Level 1 Tier List"** buttons in the header to access Godrekton's deep-dive knowledge:
- Complete Runes Guide, Mechanics & Animation Cancels, Builds & Items, Fury Management, Summoner Spells, and the Level 1 Ability Starting Tier List.

<div align="center">
  <img src="Docs/tutorial/03_godrekton_master_guides.png" alt="Godrekton Master Guides" width="800" />
</div>

---

### 4. Post-Game Notes & Personal Winrate Tracker
Log your tactical takeaways after every match:
- Record your match result (**Win / Loss / Remake**).
- Rate felt difficulty from **1 to 5 stars**.
- Save notes on **what worked**, **mistakes made**, **KDA**, and **build**.
- Stored permanently in your local **SQLite** database to calculate your personal winrate against each specific champion over time!

<div align="center">
  <img src="Docs/tutorial/04_post_game_match_notes.png" alt="Post-Game Match Notes" width="800" />
</div>

---

### 5. High-Elo Analytics & Combos Visualizer
Explore high-elo Korean OTP tendencies, power spikes, winrate curves, and visual breakdown of Renekton combos (The Panther Combo, Short Trades, All-In sequences).

<div align="center">
  <img src="Docs/tutorial/05_combos_and_stats.png" alt="Combos and Analytics" width="800" />
</div>

---

## 🌟 The Tribute

This application was engineered as a tribute to **Godrekton**, one of the most dedicated and knowledgeable Renekton one-tricks in League of Legends history (12+ years playing the Butcher of the Sands). His comprehensive spreadsheet covering all **170 matchups**, level 1 advantages, fury manipulation, and itemization has helped thousands of top laners climb the ladder.

- 📺 **YouTube**: [Godrekton's Official Channel](https://www.youtube.com/@Godrekton)
- 💬 **Reddit**: Join the discussion on [r/RenektonMains](https://www.reddit.com/r/RenektonMains/)

---

## ⚡ Key Features

### 🌐 Universal Language Support (English & Portuguese)
Switch seamlessly between **English (`en`)** and **Português do Brasil (`pt-br`)** with one click in the header. All 170 champion strategies, master guides, combo visualizers, item names, and UI elements adapt instantly with zero reloading.

### 🐊 Complete 170-Champion Matchup Database
- **Instant Search**: Sub-millisecond lookup by name or alias.
- **3-Second Pre-Game Decision Bar**: Recommended Runes, Summoner Spells, Starting Items, and Skill Leveling path.
- **Difficulty Grading**: Ranked from 1/10 (Very Easy) to 10/10 (Extreme Nightmare) with Godrekton's exact tactical notes.

### 🔄 Real-Time League Client (LCU) & In-Game Detection *(Experimental)*
- **Auto LCU Sync**: Reads the League of Legends lockfile and Live Client Data API.
- **Picks & Bans Detection**: Automatically parses champion select, filters enemy team picks, and highlights probable Toplaners.
- **Live In-Game HUD**: Locks your lane opponent automatically at game start with a 1-click **Lane Swap** button for flex drafts.

### 📝 Post-Game Match Notes & Performance Tracker
- Log tactical lessons directly into your local embedded **SQLite** database.
- Track match outcome, felt difficulty rating, what worked, mistakes made, KDA, and item build.
- Generates dynamic opponent-specific Winrate and average felt difficulty statistics.

### 🛡️ 100% Offline & Local-First Architecture
- Pre-seeded embedded SQLite engine (`rusqlite`) and local SVG icon fallbacks.
- Strictly read-only local API calls, zero memory modification, compliant with Riot Games third-party policies.

---

## 📖 Godrekton's 8 Master Guides

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

## 🛠️ Build from Source (For Developers)

If you want to contribute, modify code, or compile from source:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (latest stable)
- Visual Studio C++ Build Tools

### Commands

```bash
# 1. Clone repository
git clone https://github.com/GuhQuintino/renekton-matchups.git
cd renekton-matchups

# 2. Install dependencies
npm install

# 3. Start development server (with native Tauri + Rust)
npm run tauri:dev

# 4. Run automated test suite (203 tests)
npm test

# 5. Build release installer
npm run tauri:build
```

---

## 🇧🇷 Sobre o Projeto (Em Português)

### ⚠️ Nota Sincera do Criador
> **Aviso Importante:**
> - **O app não está perfeito (longe disso)**: Criei essa ferramenta desktop como uma homenagem ao **Godrekton** e para ajudar os jogadores de Renekton.
> - **Não sou programador**: Fiz o projeto **utilizando 100% Inteligência Artificial**, sem conhecimento prévio de desenvolvimento de software. Por isso, podem existir bugs, imperfeições e detalhes para arrumar.
> - **A comunidade é muito bem-vinda para ajudar!**: O projeto é **100% código aberto**. Quem souber programar ou quiser colaborar com melhorias, fique à vontade para abrir Issues e enviar Pull Requests no GitHub!
> - **Estado do Aplicativo**:
>   - 🟢 **Para Estudo de Matchups e Teoria: MUITO BOM.** Consultar os 170 matchups, ver runas, itens iniciais, dicas do Godrekton, combos e salvar anotações pós-jogo no banco SQLite local funciona muito bem e é super rápido e offline.
>   - 🟡 **Para Uso Pré ou In-Game ao Vivo: AINDA EM DESENVOLVIMENTO.** A detecção automática no Champ Select e In-Game através da API local do LoL ainda é experimental e pode falhar ou desincronizar dependendo do computador.

### 📥 Instalação Fácil para Jogadores (Sem complicação)
1. Vá na aba de **[Releases](https://github.com/GuhQuintino/renekton-matchups/releases/latest)** aqui do GitHub.
2. Baixe o arquivo **`Instalador-Renekton-Matchups.exe`**.
3. Dê dois cliques no instalador e siga o assistente de instalação normal do Windows.
4. Abra o atalho criado na sua Área de Trabalho e pronto! Não precisa instalar Node, Rust ou rodar nada no terminal.

---

## ⚖️ Disclaimer

*Renekton Matchups Desktop Tool isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.*

*This tool exclusively uses official, local, read-only APIs provided by the League of Legends Client (LCU Lockfile and Live Client Data). It does NOT alter memory, inject code, or modify game files in any way.*

---

## 📄 License

Distributed under the [MIT License](LICENSE). Contributions, bug reports, and suggestions are warmly welcomed!
