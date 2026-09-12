# CARTÃO DE TAREFA GAUNTLET: LCU_PHASES (Conexão Automática & Telas Focadas por Fase)

## 1. Objetivo em 1 Frase
Transformar a praticidade do Renekton Champion Matchup com conexão automática e resiliente ao League of Legends (LCU/LiveClient) e dinamica fluida com 4 telas focadas por fase (Lobby/Estudo, Champ Select inteligente com probabilidade de Toplane e runas recomendadas, In-Game Live HUD com dicas rápidas e vídeos, e Pós-Jogo com extração automática de KDA e notas).

## 2. Por que Importa / Métrica Movida
Elimina 100% da fricção e ações manuais do jogador durante a fila e a partida: basta abrir o LoL e lockar Renekton para que toda a aplicação se adapte instantaneamente ao momento exato da partida, fornecendo as informações certas no segundo exato em que são necessárias.

## 3. Escopo IN e Escopo OUT
- **IN:**
  - Descoberta automática e resiliente do LCU via inspeção de processo (`LeagueClientUx.exe` com `--app-port` e `--remoting-auth-token`) e múltiplos diretórios de lockfile.
  - Mapeamento universal de Champion ID -> Nome Canônico em Rust e TypeScript.
  - Sincronização contínua via Tauri IPC (`get_game_state`) no hook `useGameState`.
  - **Fase 1 (Lobby / Desconectado / Estudo):** Navegação e busca em todos os 170 campeões, guias e tier lists.
  - **Fase 2 (Champ Select Screen):** Tela dedicada mostrando apenas os picks inimigos revelados, ordenados por probabilidade de irem Top contra Renekton, com runas completas recomendadas, feitiços e builds de Nível 1.
  - **Fase 3 (In-Game Live HUD):** Tela dedicada de partida com cronômetro ao vivo, dicas táticas resumidas de rota (Nível 1 a 6), cooldowns chave, e abas para Guia Completo e Vídeos do confronto.
  - **Fase 4 (Pós-Jogo Review):** Detecção de fim de partida com extração de KDA, resultado (Vitória/Derrota) e abertura do modal de anotações persistidas.
- **OUT:**
  - Injeções de memória ou DLLs no cliente do jogo (uso exclusivo e estrito das APIs REST oficiais da Riot: LCU e Live Client Data).

## 4. Pronto Técnico
- Tipos estritos em TypeScript (`GamePhase`, `ChampSelectState`, `InGameHUDState`, `PostGamePayload`).
- Backend Rust resiliente sem crashes ou timeouts bloqueantes (`reqwest` com timeouts curtos e fallbacks).
- 100% dos testes unitários e de integração passando no Vitest.
- Build do Vite (`npm run build`) e `cargo check` sem nenhum aviso ou erro.

## 5. Pronto de Experiência ("Uau")
- Transições de tela suaves e cinematográficas com visual Dark/OLED LoLTheory.
- Cartões com probabilidade de rota Top destacando o oponente mais provável.
- Badges de runas e feitiços de invocador estilizados em ouro hextech.
- HUD compacto in-game legível em um relance rápido durante a tela de carregamento e primeiros minutos de jogo.

## 6. Barra de Referência
- **Blitz.gg & Porofessor Desktop:** Detecção automática de fase e sugestão instantânea de runas.
- **LoLTheory & Mobalytics:** HUD escuro de alta legibilidade para estudo e partidas ao vivo.

## 7. Restrições
- 100% de conformidade com as diretrizes da Riot Games para aplicativos de terceiros.
- Polling leve com overhead de CPU < 0.5% em segundo plano.

## 8. Boundary de Parada
- Conexão funcional comprovada com o LoL aberto (resolvendo o "Desconectado").
- Testes automatizados cobrindo todas as 4 fases e cenários de transição.
- Julgamento formal adversarial pelo `gauntlet-critic` com veredito PASS e nota >= 2.5/3.0.
