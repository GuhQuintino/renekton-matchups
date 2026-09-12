# Guia de Recursos Técnicos, APIs & Benchmarks Concorrentes (LoL Companion Ecosystem)

> **Projeto**: Renekton Champion Matchup  
> **Status**: ATIVO / CANÔNICO (Gauntlet Architecture & Reference Scout)  
> **Data de Atualização**: Agosto/2026

Este documento sintetiza o ecossistema completo de **APIs oficiais da Riot Games**, **endpoints locais da LCU**, **fontes de dados de metagame**, **CDNs de ativos de alta resolução** e uma **análise comparativa de benchmarks (apps concorrentes)** para orientar a arquitetura e expansão de funcionalidades do **Renekton Champion Matchup**.

---

## 1. Benchmarks Competitivos: Análise de Softwares & Plataformas de LoL

A tabela abaixo compara as principais ferramentas do ecossistema de League of Legends, destacando seus recursos únicos (*Fator "Uau"*) e como incorporá-los ao nosso projeto:

| Plataforma / Software | Tipo | Principais Recursos | Recursos Únicos ("Uau") | Aplicação no Renekton Matchup |
|---|---|---|---|---|
| **LoLTheory** | Desktop | Detecção LCU, Draft Helper, Matriz de Risco ($WR - Risk = Score$), Toggles de Automação de Bans. | Predição de rota inimiga (5x5) e popover de maiores ameaças (*Highest Threats*). | Layout escuro OLED base, predição de flex picks e filtros de dicas táticas com tags coloridas. |
| **DeepLoL** | Web / Tool | Análise de composição 5v5, estatísticas de sinergia entre campeões e rotas. | Cálculo de impacto de composição aliada vs inimiga. | Algoritmo de prioridade de matchups e detecção de composições favoráveis/desfavoráveis. |
| **Lolalytics** | Web (High-Elo) | Estatísticas profundas D2+/Master, matriz completa de runas, análise de itens por slot (1º ao 5º). | 3 métricas verticais por runa (*Win Rate, Pick Rate, Games*), $\Delta$ Win Rate e curvas de poder temporal. | Painel analítico aprofundado com comparação de runas alternativas e spikes por minuto. |
| **Blitz.gg** | Desktop (Electron) | Importação com 1 clique de runas/spells, overlay in-game com CS/min tracker e gold diff. | Sincronização automática e silenciosa com o client da Riot sem necessidade de clique. | Módulo Rust/Tauri de auto-injeção de runas e feitiços diretamente na LCU. |
| **Mobalytics** | Desktop / Web | Guias de combos com animações, Gamer Performance Index (GPI), radar de estilo de jogo. | Decomposição mecânica passo a passo de combos (ex: *Panther Doublecast*, *E-W-Tiamat-Q-E*). | Módulo dedicado de mecânicas e combos do Renekton com quebra de animação (*Animation Cancels*). |
| **Porofessor / Overwolf** | Desktop Overlay | Scouting de jogadores em tempo real durante o carregamento, timers de feitiços de invocador. | Tags comportamentais (*"Renekton OTP"*, *"Aggressive early"*, *"Vulnerable to ganks"*, *"Low CS"*). | Alertas táticos no matchup sobre tendências do oponente (ex: se joga passivo ou agressivo). |
| **U.GG** | Web / Desktop | Pro Builds atualizados hora a hora, matchups ordenados por vantagem de ouro aos 15 min (GD@15). | Filtro de partidas de jogadores profissionais (Zeus, 369, Bin, Faker) com itens e runas exatas. | Seção de "Pro Builds Recentes" com referências de jogadores de elite de Renekton. |
| **OP.GG** | Web / Desktop | Metagame da Coreia (KR High Elo), estatísticas consolidadas por patch, tier lists por elo. | Matriz de itens de abertura e evolução temporal de taxa de vitória por patch da Riot. | Comparativo de builds orientais vs ocidentais para matchups difíceis. |

---

## 2. APIs da Riot Games & Endpoints Técnicos

### 2.1 League Client Update (LCU) Local API
A LCU API roda localmente na máquina do jogador via HTTPS e WebSocket (`127.0.0.1:<port>`), utilizando autenticação Basic com credenciais lidas dinamicamente do arquivo `lockfile` do cliente de League of Legends.

- **Autenticação**: `Basic riot:<remotepassword>` (onde `remotepassword` é lido do `lockfile`).
- **Certificado SSL**: Auto-assinado pela Riot (`riotgames.pem` ou flag `danger_accept_invalid_certs(true)` em Rust/Reqwest).

#### Principais Endpoints LCU para o Renekton Matchup:

```http
# 1. Obter Fase Atual do Cliente (Lobby, Matchmaking, ChampSelect, InProgress, EndOfGame)
GET https://127.0.0.1:{port}/lol-gameflow/v1/gameflow-phase

# 2. Sessão em Tempo Real da Seleção de Campeões (Detecção de Picks, Bans e Matchup)
GET https://127.0.0.1:{port}/lol-champ-select/v1/session

# 3. Injeção Automática de Página de Runas (1-Click Rune Export)
POST https://127.0.0.1:{port}/lol-perks/v1/pages
PUT  https://127.0.0.1:{port}/lol-perks/v1/currentpage
# Payload de Exemplo:
{
  "name": "Renekton vs Jax (Matchup Auto)",
  "primaryStyleId": 8000,
  "subStyleId": 8400,
  "selectedPerkIds": [8005, 9111, 9104, 8299, 8444, 8451, 5008, 5008, 5002],
  "current": true
}

# 4. Configurar Feitiços de Invocador (Flash + Ignite / Flash + Teleport)
PATCH https://127.0.0.1:{port}/lol-champ-select/v1/session/my-selection
{
  "spell1Id": 4,  # Flash
  "spell2Id": 14  # Ignite (ou 12 para Teleport)
}

# 5. Aceitar Partida Automaticamente (Auto-Accept Queue)
POST https://127.0.0.1:{port}/lol-matchmaking/v1/ready-check/accept

# 6. WebSocket de Eventos em Tempo Real
WSS wss://127.0.0.1:{port}/
# Permite escutar eventos OnJsonApiEvent_lol_champ_select_v1_session instantaneamente sem polling!
```

---

### 2.2 Live Client Data API (Porta 2999 — In-Game Overlay)
Ativa exclusivamente enquanto a partida 3D está em execução (`League of Legends.exe`). Totalmente aprovada pela Riot Games para ferramentas de terceiros:

- **Endpoint Base**: `https://127.0.0.1:2999/liveclientdata/allgamedata`
- **Dados Disponíveis**:
  - `activePlayer`: Ouro atual, nível do campeão, atributos em tempo real (AD, Armadura, MR, CDR), pontuação de CS.
  - `allPlayers`: Lista completa dos 10 jogadores, itens comprados por cada um, feitiços de invocador e tempos de recarga.
  - `events`: Eventos de abates solo, mortes, torres destruídas, dragões e barões abatidos.
  - `gameData`: Tempo exato de jogo em segundos (`gameTime`).

---

### 2.3 CDNs de Ativos & Dados Estruturados

#### A. Data Dragon (DDragon — CDN Oficial Riot)
- **URL de Versões**: `https://ddragon.leagueoflegends.com/api/versions.json`
- **Fallback Canônico do Projeto**: `16.16.1`
- **Campeões**: `https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{champ}.png`
- **Itens**: `https://ddragon.leagueoflegends.com/cdn/{version}/img/item/{itemId}.png`
- **Feitiços de Invocador**: `https://ddragon.leagueoflegends.com/cdn/{version}/img/spell/{spellKey}.png`
- **Dicionário Completo de Dados**: `https://ddragon.leagueoflegends.com/cdn/{version}/data/pt_BR/champion/Renekton.json`

#### B. Community Dragon (CDragon — Raw Assets em Alta Resolução)
- **URL Base**: `https://raw.communitydragon.org/latest/`
- **Vantagens**: Fornece ícones de runas vetorizados em alta resolução, splash arts sem corte, ícones de perks com fundos transparentes e animações SVG.
- **Ícones de Perks**: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/`

#### C. Meraki Analytics API (Fórmulas Matemáticas Precisas de Habilidades)
- **URL**: `https://cdn.merakianalytics.com/riot/lol/resources/patches/`
- **Metadados**: Detalhes matemáticos das habilidades do Renekton (ratios de escalonamento de AD total vs bônus, dano por nível de habilidade, cooldowns com CDR, fórmulas de quebra de escudo do W empoderado e cura triplicada do Q com 50+ de fúria).

---

## 3. Ferramentas Open Source & Repositórios de Referência

1. **[Awesome League](https://github.com/CommunityDragon/awesome-league)**: A maior curadoria open source de bibliotecas, wrappers da Riot API e utilitários de LCU.
2. **[Rift Explorer](https://github.com/Pupix/rift-explorer)**: Ferramenta gráfica e interativa para inspecionar schemas e disparar requests de teste para todos os endpoints da LCU local em tempo real.
3. **[Kebs LCU Docs](https://lcu.kebs.dev/)**: O catálogo mais completo e atualizado de schemas e tipos da LCU e Riot Client.
4. **[LeagueAkari](https://github.com/LeagueAkari/LeagueAkari)**: Projeto open source moderno de toolkit LCU com arquitetura limpa em Rust/TypeScript, demonstrando auto-accept, auto-ban, importação de runas e detecção resiliente de processos.

---

## 4. Matriz de Recomendações de Novas Funcionalidades para o Renekton Matchup

| Módulo / Feature | Fonte de Dados / API | Valor Tático para o Jogador | Complexidade |
|---|---|---|---|
| **1-Click Auto Rune & Spell Import** | LCU API (`/lol-perks/v1/pages`) | O jogador clica em um botão e o app injeta as runas ideais e feitiços no client em < 100ms. | Média (Rust Tauri Command) |
| **Predição de Rota & Flex Risk (5x5)** | Heurística LoLTheory + Lolalytics | Identifica se o matchup do Top será contra um pick flexível (ex: Lucian, Gragas, Yasuo) e mostra as probabilidades. | Baixa (Frontend Component) |
| **Guia de Combos & Animation Cancels** | Mobalytics / Guia Renekton CSV | Exibe passo a passo as mecânicas com Fúria (Panther Combo, W-R Cancel, Doublecast E-Q). | Baixa (Frontend UI Cards) |
| **Tags de Dicas com Filtro Rápido** | CSV do Guia + LoLTheory Tagging | Filtro interativo de conselhos por fase de jogo (`Fase de Rota`, `Team Fight`, `Escaramuça`). | Concluído no Design System |
| **Matriz Profunda de Runas (3 Métricas)** | Lolalytics D2+ Dataset | Exibe taxa de vitória, taxa de escolha e total de jogos para cada runa individual. | Média (Data Integration) |
| **In-Game Item & Gold Tracker** | Live Client Data API (`:2999`) | Overlay opcional para monitorar spikes de ouro e cooldown de feitiços dos inimigos na partida. | Alta (Fase Futura) |
