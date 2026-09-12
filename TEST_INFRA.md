# E2E Test Infra: Renekton Champion Matchup Tool

## Test Philosophy
- **Opaque-box, requirement-driven**: Testes verificam o comportamento do software contra os requisitos do usuário (R1 a R5), sem acoplamento a implementações internas.
- **Metodologia 4 Tiers + Tier 5**: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing + Adversarial Hardening.

---

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---|---|:---:|:---:|:---:|:---:|
| F1 | CSV Parsing & PT-BR Translation | R1, R5 | 5 | 5 | ✓ | ✓ |
| F2 | SQLite Database & Seeding (170 Champions) | R1 | 5 | 5 | ✓ | ✓ |
| F3 | LCU Connector & Champ Select Detection | R2 | 5 | 5 | ✓ | ✓ |
| F4 | Live Client Data & Lane Opponent Detector | R2 | 5 | 5 | ✓ | ✓ |
| F5 | Game State Simulator & Mock Control | R2 | 5 | 5 | ✓ | ✓ |
| F6 | LoLTheory UI & Color Contrast | R1, R3 | 5 | 5 | ✓ | ✓ |
| F7 | Live Status Header Transitions | R2, R5 | 5 | 5 | ✓ | ✓ |
| F8 | Instant Search & Dificulty Filters | R5 | 5 | 5 | ✓ | ✓ |
| F9 | Matchup Hero Card & Quick Info (3s Decision) | R3 | 5 | 5 | ✓ | ✓ |
| F10 | Detailed Notes (10-15 Tips) & Fury Tips | R3 | 5 | 5 | ✓ | ✓ |
| F11 | 8 General Guides Viewer (Runes, Combos, etc.) | R5 | 5 | 5 | ✓ | ✓ |
| F12 | Post-Game Notes CRUD (Win/Loss, 1-5 Stars) | R4 | 5 | 5 | ✓ | ✓ |
| F13 | Notes History per Champion & Date Sorting | R4 | 5 | 5 | ✓ | ✓ |
| F14 | Automatic Post-Game Trigger | R2, R4 | 5 | 5 | ✓ | ✓ |
| F15 | Data Dragon CDN Icon Resolver & Fallbacks | R3 | 5 | 5 | ✓ | ✓ |

---

## Test Architecture
- **Test Runner**: Vitest / Playwright / Node.js test harness.
- **Execution Command**: `npm test` ou `npm run test:e2e`
- **Output Format**: JUnit / TAP / Console com contadores de aprovação e relatório estruturado em `TEST_RESULTS.md`.

---

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|---|---|---|
| S1 | Partida Ranqueada Completa (Lobby -> Champ Select vs Aatrox -> In-Game Live Lock -> Vitória -> Anotação Pós-Jogo) | F3, F4, F7, F9, F10, F12, F13, F14 | Alta |
| S2 | Consulta Manual em Segundo Monitor (Busca Instantânea por "Darius", ver Quick Info, consultar aba de Fúria e Vídeo) | F1, F2, F6, F8, F9, F10, F15 | Média |
| S3 | Estudo Teórico Fora de Jogo (Navegação nos 8 Guias Gerais: Runas PTA vs Conq, Combos com E-AA-W-Q-E, FAQ) | F1, F2, F11, F6 | Média |
| S4 | Lane Swap & Detecção de Oponente Ambíguo (Inimigo pickou Yasuo e Yone; Live Client Data confirma Yasuo no Top aos 0:30s) | F3, F4, F5, F7, F9 | Alta |
| S5 | Gestão e Persistência de Anotações Históricas (Adição de 5 partidas contra Fiora com diferentes ratings e filtros) | F2, F12, F13, F8 | Média |
| S6 | Modo Offline sem Internet (Carregamento completo de matchups, guias, notas e ícones de fallback sem rede) | F2, F6, F9, F11, F15 | Média |

---

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥ 75 testes (5 por feature × 15 features)
- **Tier 2 (Boundary & Corner Cases)**: ≥ 75 testes (5 por feature)
- **Tier 3 (Cross-Feature Combinations)**: ≥ 15 testes de interação
- **Tier 4 (Real-World Scenarios)**: ≥ 6 cenários de uso real
- **Total Mínimo E2E**: ≥ 171 testes automatizados cobrindo 100% dos requisitos.
