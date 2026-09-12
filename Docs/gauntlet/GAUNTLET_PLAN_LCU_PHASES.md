# GAUNTLET PLAN: LCU_PHASES (Conexão Automática & Telas Focadas por Fase)

## 1. Visão Geral
Este plano estrutura a implementação da detecção automática e resiliente do League of Legends e o particionamento dinâmico do aplicativo em 4 telas focadas por fase (`LOBBY`, `CHAMP_SELECT`, `IN_GAME`, `POST_GAME`), com automação total a partir do momento em que o jogador escolhe Renekton.

## 2. Decomposição Rígida em Chunks

| Chunk | Módulo / Arquivos | Responsabilidade | Dependências |
|---|---|---|---|
| **Chunk 1** | `src-tauri/src/lcu/`, `src-tauri/src/commands/game_state.rs` | Detecção ultra-robusta de processo do LoL/lockfile no Windows, mapeamento universal de Champion ID -> Nome no Rust e extração de dados pós-jogo. | Nenhuma |
| **Chunk 2** | `src/hooks/useGameState.ts`, `src/services/lcu.ts`, `src/types/game.ts` | Sincronização via Tauri IPC (`invoke('get_game_state')`), modelo de probabilidades de rota Top e modos `LCU_AUTO`/`SIMULATOR`. | Chunk 1 |
| **Chunk 3** | `src/components/ChampSelectView.tsx` | Tela imersiva de Picks & Bans: apenas oponentes revelados, ordenação por probabilidade de Toplane, runas completas recomendadas, feitiços e builds Nível 1. | Chunk 2 |
| **Chunk 4** | `src/components/InGameHUDView.tsx` | Tela de Partida Ao Vivo / HUD de Confronto: dicas rápidas de rota, cooldowns chave, spikes de nível, toggle para Guia Completo e Vídeos. | Chunk 2 |
| **Chunk 5** | `src/App.tsx`, `src/components/Header.tsx`, `tests/` | Orquestração de fases no `App.tsx`, extração e preenchimento automático do modal pós-jogo, suíte de testes completa e validação de build. | Chunks 1-4 |

## 3. Critérios de Integração & Qualidade (Rubrica 6D)
- **D1 Funcionalidade:** Conexão comprovada com o cliente do LoL aberto (resolvendo "Desconectado"), transição automática de tela ao lockar Renekton, e fluxo de anotações pós-jogo com KDA extraído.
- **D2 Robustez:** Reconexão automática em caso de fechamento do LoL sem travar o aplicativo; tratamento gracioso de chamadas IPC e certificados SSL.
- **D3 Experiência ("Uau"):** Layouts dedicados e impecáveis para cada fase no estilo LoLTheory Dark, badges dourados de runas e transições suaves.
- **D4 Consistência:** Tipos estritos em TypeScript, Clean Architecture no Rust e no React, zero violações de linter.
- **D5 Performance:** Polling leve e não-bloqueante a cada 1.5s, tempo de renderização de telas < 16ms (60 FPS).
- **D6 Testabilidade:** Suíte de testes automatizados completa no Vitest cobrindo detecção de fases, probabilidades de rota e renderização.
