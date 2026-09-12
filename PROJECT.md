# Project: Renekton Champion Matchup Desktop Tool (Tauri v2 + React + SQLite)

## Architecture
A aplicação é uma ferramenta desktop de alta performance construída sobre **Tauri v2** (Rust backend + React 19 / TypeScript frontend + TailwindCSS) e **SQLite local**, projetada para rodar em segundo monitor durante partidas de League of Legends com estética escura inspirada no **LoLTheory.gg**.

### Camadas do Sistema:
1. **Backend Rust / Tauri v2 Core**:
   - `lcu_connector`: Descoberta de lockfile da Riot, autenticação e leitura de Champ Select e Gameflow.
   - `live_client`: Polling da Live Client Data API (`127.0.0.1:2999`) e algoritmo determinístico de identificação do oponente de lane.
   - `simulator`: Motor de simulação de estados de partida (Desconectado, Lobby, Champ Select, In-Game, Pós-Jogo) para testes e desenvolvimento offline.
   - `db_service`: Gerenciamento do SQLite local (matchups, notas de usuário, guias gerais).
   - `ipc_bridge`: Comandos e eventos Tauri expostos para o frontend React.

2. **Frontend React / TypeScript (LoLTheory UI)**:
   - `components/header`: Barra de status de conexão em tempo real + seletor de modo simulador/manual.
   - `components/sidebar`: Lista de campeões virtualizada com busca instantânea (<10ms) e filtros por dificuldade.
   - `components/matchup`: Visualizador principal de matchup com Quick Info Bar (decisão em 3s: Runas, Feitiços, Ordem Q>E>W, Itens) e abas detalhadas (Resumo, Notas Passo-a-Passo, Dicas de Fúria, Vídeos).
   - `components/notes`: Sistema de anotações pós-partida estruturadas (Win/Loss, Dificuldade 1-5 estrelas, O que funcionou, O que não funcionou, Notas livres) com histórico persistido em SQLite.
   - `components/guides`: Navegador para os 8 guias gerais do Godrekton (Runas, Feitiços, Combos/Mecânicas, Itens/Builds, Gerenciamento de Fúria, FAQ, Introdução).
   - `services/datadragon`: Resolução de assets CDN da Riot (ícones de campeões, itens, runas, feitiços) com fallback offline.

---

## Feature Inventory
Todas as funcionalidades mapeadas dos requisitos originais (R1 a R5):

| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| F1 | CSV Parser & Translation Pipeline | Parser dos 9 CSVs do Godrekton e tradução para PT-BR com termos de LoL em inglês | M1 | R1, R5 |
| F2 | SQLite Database & Seeding | Banco de dados SQLite local com 170 matchups, guias gerais e schema de notas | M1 | R1 |
| F3 | LCU API Connector & Lockfile Discovery | Conexão automática com o cliente LoL (Picks/Bans e Champ Select) | M2 | R2 |
| F4 | Live Client Data & Lane Opponent Detector | Detecção in-game com 100% de certeza do oponente de lane do Renekton | M2 | R2 |
| F5 | Game State Simulator & Mock Engine | Simulador de estados de partida para testes determinísticos sem LoL | M2 | R2 |
| F6 | LoLTheory Dark UI & Layout | Estética ultra-dark (#090A0C, acentos #D4A017, tipografia limpa) | M3 | R1, R3 |
| F7 | Live Detection Status Header | Header com indicador de estado do jogo em tempo real e alternador de modo | M3 | R2, R5 |
| F8 | Sidebar com Busca Instantânea e Filtros | Busca instantânea (<10ms) e filtros por dificuldade e favoritos | M3 | R5 |
| F9 | Matchup Hero Card & Quick Info Bar | Card de destaque + barra rápida (Runas, Itens, Feitiços, Ordem de Habilidades) | M3 | R3 |
| F10 | Abas de Conteúdo Detalhado & Vídeos | Resumo traduzido, 10-15 dicas numeradas, gerenciamento de fúria e links YouTube | M3 | R3 |
| F11 | Visualizador dos 8 Guias Gerais | Abas para Runas, Itens, Combos, Feitiços, Fúria, FAQ e Introdução | M3 | R5 |
| F12 | Sistema de Anotações Pessoais (CRUD) | Formulário pós-jogo (Win/Loss, rating 1-5, o que funcionou/não funcionou) | M4 | R4 |
| F13 | Histórico de Partidas por Campeão | Timeline de anotações passadas persistidas em SQLite ordenadas por data | M4 | R4 |
| F14 | Gatilho Automático Pós-Jogo | Detecção de fim de partida e abertura automática do modal de anotações | M4 | R2, R4 |
| F15 | Integração com Data Dragon CDN | Resolução e cache de ícones de campeões, itens, runas e feitiços da Riot | M3 | R3 |
| F16 | E2E Test Suite Pass (Tiers 1-4) | 100% de aprovação na suíte de testes ponta-a-ponta opaque-box | M5 | Acceptance |
| F17 | Adversarial Hardening (Tier 5) | Testes de estresse, robustez e verificação adversarial contra edge cases | M5 | Acceptance |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Core Data Engine & SQLite Seeding | Parser de CSVs, tradução PT-BR, banco SQLite com 170 matchups e guias | none | PLANNED |
| M2 | Game State Engine & LCU / Live Client & Mock | Leitura de lockfile, APIs Riot LCU/LiveClient, detecção de lane e Mock Simulator | M1 | PLANNED |
| M3 | Frontend LoLTheory UI & Matchup Viewer | Design System dark, Header em tempo real, Sidebar de busca, Quick Info, Guias e Data Dragon | M1, M2 | PLANNED |
| M4 | Structured Post-Game Notes & Storage | Sistema CRUD de anotações de partidas em SQLite, modal pós-jogo e histórico | M1, M3 | PLANNED |
| M5 | Final Milestone: E2E Test Pass & Hardening | Aprovação de 100% dos testes E2E Tiers 1-4 e testes adversariais Tier 5 | M1, M2, M3, M4 | PLANNED |

---

## Interface Contracts

### Backend ↔ Frontend IPC Commands (Tauri / Rust)
- `get_matchup_by_champion(champion_name: String) -> MatchupDetail`
- `get_all_matchups_summary() -> Vec<MatchupSummary>`
- `get_general_guide(guide_key: String) -> GuideContent`
- `get_game_state() -> GameStateEvent`
- `set_simulation_state(scenario: String, payload: Option<Value>) -> Result<(), String>`
- `create_post_game_note(note: NewNotePayload) -> Result<NoteRecord, String>`
- `get_notes_by_champion(champion_name: String) -> Vec<NoteRecord>`
- `delete_note(note_id: i64) -> Result<(), String>`

### GameStateEvent Schema
```typescript
interface GameStateEvent {
  phase: 'DISCONNECTED' | 'LOBBY' | 'CHAMP_SELECT' | 'IN_GAME' | 'POST_GAME';
  connected: boolean;
  game_time_seconds?: number;
  my_champion?: string;
  opponent_champion?: string;
  opponent_confidence?: number; // 0 a 100
  potential_opponents?: string[];
  match_id?: string;
}
```

---

## Code Layout
```
c:\Users\Gustavo\Desktop\Champion Matchup\
├── src/                          # Frontend React + TypeScript
│   ├── components/               # Componentes UI (Header, Sidebar, MatchupCard, QuickInfo, Notes, Guides)
│   ├── hooks/                    # Hooks (useGameState, useMatchup, useNotes, useSearch)
│   ├── services/                 # Serviços (api/ipc, dataDragon, simulator)
│   ├── types/                    # Definições de tipos TypeScript
│   ├── data/                     # Dados estáticos / seeding pré-compilados
│   ├── App.tsx                   # Componente raiz
│   └── index.css                 # Tailwind e temas LoLTheory
├── src-tauri/                    # Backend Rust Tauri v2
│   ├── src/
│   │   ├── db/                   # SQLite schema, queries e seeding
│   │   ├── lcu/                  # Lockfile reader, LCU client, WebSocket
│   │   ├── live_client/          # LiveClientData API poller e lane detector
│   │   ├── simulator/            # Engine de mock/simulação
│   │   ├── commands/             # Handlers IPC para o frontend
│   │   └── main.rs               # Ponto de entrada Tauri
│   ├── tauri.conf.json           # Configuração do Tauri v2
│   └── Cargo.toml                # Dependências Rust
├── scripts/                      # Scripts de automação, parsing de CSVs e testes
├── tests/                        # Suíte de testes E2E e unitários
└── Docs/                         # Planilhas e referências
```
