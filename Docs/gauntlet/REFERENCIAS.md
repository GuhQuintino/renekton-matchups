# Catálogo Canônico de Referências Visuais de Design (LoLTheory, DeepLoL & Lolalytics)

> **Projeto**: Renekton Champion Matchup  
> **Diretório de Ativos**: [`Docs/gauntlet/assets/references/`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/)  
> **Status**: ATIVO / CANÔNICO (Gauntlet Loop & Reference Scout)

Este documento consolida a análise técnica visual, decomposição de componentes, paletas de cores computadas (Hex) e diretrizes de UX extraídas das **10 referências oficiais de design** (coletadas de *LoLTheory*, *DeepLoL* e *Lolalytics D2+*) para nortear o design system e a implementação de ponta a ponta do **Renekton Champion Matchup**.

---

## 1. Catálogo Completo de Referências

| ID | Arquivo de Imagem | Plataforma | Foco Estratégico de Interface |
|---|---|---|---|
| **REF-01** | [`01_loltheory_client_overview_dashboard.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/01_loltheory_client_overview_dashboard.png) | LoLTheory | **Client Overview & LCU Automation**: Dashboard em standby, status LCU, sidebar de recomendações e switches de automação. |
| **REF-02** | [`02_champion_build_runes_skill_order.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/02_champion_build_runes_skill_order.png) | LoLTheory | **Champion Build & Skill Progression**: Árvore primária/secundária com nós iluminados, matriz 1-18 Q/W/E/R, full build numerada (1-6) e barra de tipo de dano. |
| **REF-03** | [`03_role_matrix_risk_threats_analytics.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/03_role_matrix_risk_threats_analytics.png) | LoLTheory | **Role Matrix & Risk Analytics**: Matriz 5x5 de probabilidade de rotas inimigas, score de risco de counter, flex risk e popover de maiores ameaças (*Highest Threats*). |
| **REF-04** | [`04_tactical_tips_card_list_tagged.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/04_tactical_tips_card_list_tagged.png) | LoLTheory | **Tagged Tactical Tips**: Lista de cards de conselhos de combate para Renekton, com filtro no topo e badges coloridas por categoria (*Básico, Avançado, Fase de Rota, Team Fight, Escaramuça, Fase Final do Jogo*). |
| **REF-05** | [`05_compact_stats_build_paths_skill_priority.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/05_compact_stats_build_paths_skill_priority.png) | LoLTheory | **Compact Stats & Skill Priority**: Prioridade de habilidades com taxa de vitória ($W > Q > E$), tabela compacta 1-15 com células azuis e itens situacionais (*Item 4 OR Item 5 OR Item 6*). |
| **REF-06** | [`06_lolalytics_runes_deep_matrix_analytics.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/06_lolalytics_runes_deep_matrix_analytics.png) | Lolalytics | **Deep Rune Matrix Analytics**: Matriz completa das 5 árvores com 3 métricas verticais por nó individual (*Win Rate, Pick Rate, Games*) e fragmentos de atributos (Stat Shards). |
| **REF-07** | [`07_lolalytics_overview_stats_starting_items.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/07_lolalytics_overview_stats_starting_items.png) | Lolalytics | **High-Elo Overview & Starting Builds**: Cabeçalho de estatísticas D2+, tier rank, taxas globais e combinações de itens iniciais. |
| **REF-08** | [`08_lolalytics_item_slots_winrates_boots.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/08_lolalytics_item_slots_winrates_boots.png) | Lolalytics | **Item Slots & Boots Winrates**: Grid tabular de opções de itens por slot (1º ao 5º item) e botas com volume amostral e taxa de vitória. |
| **REF-09** | [`09_lolalytics_counters_matchups_deltas.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/09_lolalytics_counters_matchups_deltas.png) | Lolalytics | **Matchups & Delta Win Rates**: Lista comparativa de counters com indicadores numéricos de Delta Win Rate, Lane Kill Rate e Vantagem de Ouro. |
| **REF-10** | [`10_lolalytics_power_curves_spikes_analytics.png`](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/10_lolalytics_power_curves_spikes_analytics.png) | Lolalytics | **Power Curves & Spike Timers**: Gráficos de Win Rate por duração de partida (0-20m, 20-25m, 25-30m, 35m+) e picos de poder do campeão. |

---

## 2. Análise Técnica Detalhada das Referências

---

### REF-01: Client Overview & Automation Dashboard (LoLTheory)

![REF-01: LoLTheory Client Overview](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/01_loltheory_client_overview_dashboard.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/01_loltheory_client_overview_dashboard.png`
- **Paleta de Cores**:
  - `bg-void`: `#070709` | `bg-surface`: `#0F1015` | `accent-gold`: `#FFAA00` | `winrate-pos`: `#22C55E` | `text-dim`: `#71717A`
- **Componentes-Chave**:
  1. **Top Nav**: Marca LoLTheory, abas "Campeão" / "Builds", botão dourado com borda fina.
  2. **Sidebar**: Tabela compacta com avatar, Win Rate (`+2.52%`) e pontuação calculada (`43.77`).
  3. **Standby State**: Feedback de espera da LCU com animação circular e mensagem direta.
  4. **Control Panel**: Switches/toggles em amarelo brilhante para automação de bans/picks.

---

### REF-02: Champion Build, Runes & Skill Progression (LoLTheory)

![REF-02: Champion Build & Runes](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/02_champion_build_runes_skill_order.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/02_champion_build_runes_skill_order.png`
- **Paleta de Cores**:
  - `bg-panel`: `#0B0C0E` | `gold-keystone`: `#F59E0B` | `resolve-green`: `#10B981` | `inactive-rune`: `#27272A` (opacidade 30%)
  - Barra de Dano: Físico `#3B82F6` (56%), Mágico `#EF4444` (41%), Verdadeiro `#E2E8F0` (3%)
- **Componentes-Chave**:
  1. **Team Composition (5v5)**: Matchup direto lado a lado por rota (Top, Jungle, Mid, Bot, Sup).
  2. **Full Rune Tree**: Nós secundários apagados e runa ativa iluminada com glow e cor original.
  3. **Full Build Numerada**: Itens de 1 a 6 com mini badges numéricas no canto superior.
  4. **Skill Matrix 1-18**: Grid completo de evolução nível a nível.

---

### REF-03: Role Matrix, Risk Score & Threats Popover (LoLTheory)

![REF-03: Role Matrix & Risk](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/03_role_matrix_risk_threats_analytics.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/03_role_matrix_risk_threats_analytics.png`
- **Paleta de Cores**:
  - `bg-card`: `#121316` | `danger-red`: `#EF4444` | `threat-orange`: `#F97316` | `text-primary`: `#F8FAFC`
- **Componentes-Chave**:
  1. **Score Formula**: Destaque `WR - Risk = Score`.
  2. **Potential Counter Risk**: Badges de campeões perigosos com ícone de rota e barra de gravidade vermelha/laranja.
  3. **Enemy Role Predictor (5x5)**: Matriz estatística por rota para detectar picks flexíveis (ex: Rumble Top 85% / Mid 15%).
  4. **Highest Threats Tooltip**: Popover flutuante escuro com as maiores ameaças na partida.

---

### REF-04: Tagged Tactical Tips & Combat Advice (LoLTheory)

![REF-04: Tagged Tactical Tips](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/04_tactical_tips_card_list_tagged.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/04_tactical_tips_card_list_tagged.png`
- **Paleta e Tags Coloridas**:
  - **`Básico`**: Fundo `#1E3A8A` / Texto `#60A5FA` (Azul)
  - **`Avançado`**: Fundo `#581C87` / Texto `#C084FC` (Roxo)
  - **`Fase de Rota`**: Fundo `#7F1D1D` / Texto `#F87171` (Vermelho)
  - **`Team Fight`**: Fundo `#831843` / Texto `#F472B6` (Magenta/Rosa)
  - **`Escaramuça`**: Fundo `#78350F` / Texto `#FBBF24` (Laranja/Âmbar)
  - **`Fase Final do Jogo`**: Fundo `#713F12` / Texto `#FDE047` (Amarelo Dourado)
- **Componentes-Chave**:
  1. Header com ícone de espadas cruzadas douradas e filtro no canto direito (`Tags: All`).
  2. Cards individuais com `border-radius: 8px`, `padding: 16px`, texto explicativo limpo e badges alinhadas à direita.

---

### REF-05: Compact Stats, Skill Priority & Build Paths (LoLTheory)

![REF-05: Compact Stats & Build Paths](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/05_compact_stats_build_paths_skill_priority.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/05_compact_stats_build_paths_skill_priority.png`
- **Paleta de Cores**:
  - `bg-dark`: `#0A0B0D` | `skill-blue`: `#0284C7` | `winrate-green`: `#22C55E`
- **Componentes-Chave**:
  1. **Skill Priority**: Ordem ($W > Q > E$) com badge verde de Win Rate e total de partidas.
  2. **Skill Grid 1-15**: Células com preenchimento ciano/azul para a ordem exata de evolução.
  3. **Core Build & Itens Situacionais**: Sequência de core com separador `>` e opções ramificadas com `OR` com win rates individuais.

---

### REF-06: Deep Rune Matrix Analytics (Lolalytics)

![REF-06: Lolalytics Deep Rune Matrix](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/06_lolalytics_runes_deep_matrix_analytics.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/06_lolalytics_runes_deep_matrix_analytics.png`
- **Origem**: Lolalytics Renekton Build (D2+ Tier)
- **Paleta de Cores**:
  - `header-cyan`: `#4E878C` / `#2DD4BF` | `winrate-emerald`: `#22C55E` | `pickrate-cyan`: `#38BDF8` | `games-gray`: `#94A3B8` | `low-winrate-red`: `#EF4444`
- **Padrões de Layout & UI**:
  - **Abas Superiores**: `Overview`, `Highest Win Rune Page`, `Most Picked Rune Page`.
  - **Matriz Vertical de 3 Métricas por Runa**:
    - **1ª linha (Verde/Vermelho)**: Taxa de Vitória exata da runa (`51.7%`, `52.0%`, `47.4%`).
    - **2ª linha (Azul Claro)**: Taxa de Escolha (`Pick Rate: 70.6%`, `28.8%`).
    - **3ª linha (Cinza/Branco)**: Volume Amostral (`Games: 31.543`, `42.442`).
  - **Matriz de Stat Shards**: Grade dos 3 fragmentos com as mesmas 3 métricas verticais.
- **Aplicação no Renekton Matchup**:
  - Permite ao jogador comparar instantaneamente o valor de runas alternativas (ex: PTA vs Conquistador vs Grasp) com precisão estatística de High Elo (D2+).

---

### REF-07: High-Elo Overview & Starting Builds (Lolalytics)

![REF-07: Lolalytics Overview & Starting Builds](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/07_lolalytics_overview_stats_starting_items.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/07_lolalytics_overview_stats_starting_items.png`
- **Origem**: Lolalytics Renekton Diamond 2+ Dataset
- **Paleta de Cores**:
  - Fundo Dark Slate: `#0F172A` | Borda Cyan/Teal: `#14B8A6` | Dourado Rank: `#EAB308`
- **Componentes-Chave**:
  1. **Overview KPI Cards**: Win Rate do campeão em relação à média do elo, Rank na Rota (ex: Top Tier 2), Pick Rate global e Ban Rate.
  2. **Starting Items Matrix**: Combinações de itens de abertura (ex: Doran's Blade + Potion vs Doran's Shield vs Long Sword + Refillable) com taxas de vitória e jogos.

---

### REF-08: Item Slots & Boots Winrates (Lolalytics)

![REF-08: Lolalytics Item Slots](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/08_lolalytics_item_slots_winrates_boots.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/08_lolalytics_item_slots_winrates_boots.png`
- **Origem**: Lolalytics Item Slot Progression
- **Paleta de Cores**:
  - Superfície Tabular: `#111827` | Borda: `#1F2937` | Realce: `#38BDF8`
- **Componentes-Chave**:
  1. **Item 1 (1st Core)**: Comparação entre Eclipse, Black Cleaver, Shojin, Stridebreaker com taxa de vitória no 1º item.
  2. **Item 2 & 3 (Powerspikes)**: Otimização de curva de dano/durabilidade.
  3. **Boots Matrix**: Taxa de vitória e prioridade entre Plated Steelcaps (Tabi), Mercury's Treads e Ionian Boots.

---

### REF-09: Matchups & Delta Win Rates (Lolalytics)

![REF-09: Lolalytics Matchups & Counters](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/09_lolalytics_counters_matchups_deltas.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/09_lolalytics_counters_matchups_deltas.png`
- **Origem**: Lolalytics Matchup & Counter System
- **Paleta de Cores**:
  - Vantagem Positiva: `#10B981` (Verde) | Desvantagem / Counter: `#EF4444` (Vermelho)
- **Componentes-Chave**:
  1. **Delta Win Rate ($\Delta$ WR)**: Diferença percentual de vitória contra o matchup específico comparado à média geral.
  2. **Lane Kill Rate**: Taxa de abates solo nos primeiros 15 minutos de fase de rotas.
  3. **Gold Advantage @ 15**: Média de vantagem ou desvantagem de ouro aos 15 minutos.

---

### REF-10: Power Curves & Spike Timers (Lolalytics)

![REF-10: Lolalytics Power Curves](file:///c:/Users/Gustavo/Desktop/Champion%20Matchup/Docs/gauntlet/assets/references/10_lolalytics_power_curves_spikes_analytics.png)

- **Arquivo Físico**: `Docs/gauntlet/assets/references/10_lolalytics_power_curves_spikes_analytics.png`
- **Origem**: Lolalytics Game Length & Power Progression
- **Paleta de Cores**:
  - Linha de Curva: `#06B6D4` (Ciano Glow) | Grid: `#334155`
- **Componentes-Chave**:
  1. **Win Rate vs Game Length**: Gráfico temporal demonstrando o pico de poder do Renekton no Early/Mid Game (15 a 25 min) e a transição para peel/frontline no Late Game (30+ min).
  2. **Tempo Médio de Fechamento de Itens**: Indicadores de minutos ideais para fechar 1º, 2º e 3º item.

---

## 3. Tokens Universais do Design System Consolidado

```css
/* Design System Oficial: LoLTheory + DeepLoL + Lolalytics */
:root {
  /* Canvas & Superfícies */
  --bg-void: #070709;
  --bg-surface: #0F1015;
  --bg-card: #121316;
  --bg-card-hover: #18191E;
  --bg-table-header: #141722;

  /* Bordas */
  --border-subtle: #23242B;
  --border-hover: #3F414D;
  --border-gold: #D4A017;
  --border-cyan: #2DD4BF;

  /* Acentos Shurima / LolTheory */
  --gold-primary: #D4A017;
  --gold-bright: #FFAA00;
  --gold-highlight: #F59E0B;

  /* Estatísticas & Métricas (Lolalytics) */
  --stat-winrate-pos: #22C55E;
  --stat-winrate-neg: #EF4444;
  --stat-pickrate: #38BDF8;
  --stat-games: #94A3B8;
  --stat-cyan-header: #2DD4BF;

  /* Tags de Dicas de Combate */
  --tag-basic-bg: #1E3A8A;
  --tag-basic-text: #60A5FA;
  --tag-advanced-bg: #581C87;
  --tag-advanced-text: #C084FC;
  --tag-laning-bg: #7F1D1D;
  --tag-laning-text: #F87171;
  --tag-teamfight-bg: #831843;
  --tag-teamfight-text: #F472B6;
  --tag-skirmish-bg: #78350F;
  --tag-skirmish-text: #FBBF24;
  --tag-lategame-bg: #713F12;
  --tag-lategame-text: #FDE047;
}
```

---

## 4. Diretrizes de Construção & Integração Gauntlet
1. **Gauntlet Builder**: Implementar os módulos de estatísticas aprofundadas, combinando a clareza visual dos cards e tags do LoLTheory com a riqueza e densidade analítica de 3 métricas verticais do Lolalytics.
2. **Gauntlet Critic**: Avaliar a interface renderizada comparando lado a lado com os 10 arquivos salvos em `Docs/gauntlet/assets/references/`.
