# Convenção de Arquitetura de Código & Padrões de Engenharia

Este documento especifica os padrões de engenharia de software para o frontend (TypeScript/React), backend (Rust/Tauri v2) e schemas de dados do projeto **Renekton Champion Matchup**.

---

## 1. Padrões de Frontend (TypeScript / React)

1. **Componentes Funcionais Estritos**:
   - Todo componente React deve ser digitado explicitamente como `React.FC<Props>`.
   - Props devem ser definidas em interfaces dedicadas (ex: `ChampSelectViewProps`).
2. **Nomenclatura**:
   - Componentes React: `PascalCase` (ex: `MatchupTabs.tsx`, `LoLIcon.tsx`).
   - Hooks: `camelCase` com prefixo `use` (ex: `useGameState.ts`, `useNotes.ts`).
   - Serviços e utilitários: `camelCase` (ex: `dataDragon.ts`, `toplaneProbabilities.ts`).
3. **Tipos e Interfaces**:
   - Centralizados no diretório `src/types/` (ex: `matchup.ts`, `champion.ts`, `game.ts`, `note.ts`).
   - Proibido o uso de `any` implícito ou tipagens frouxas.
4. **Manipulação de Estado e IPC**:
   - Todas as chamadas ao backend Rust devem ser encapsuladas em serviços ou hooks via `invoke('nome_do_comando', payload)`.
   - Sempre tratar falhas de IPC com `try/catch` e estados de fallback.

---

## 2. Padrões de Backend (Rust / Tauri v2)

1. **Estrutura Modular**:
   - `src-tauri/src/lcu/`: Detecção do cliente LoL, leitura de lockfile multi-disco e chamadas à API REST local do LCU.
   - `src-tauri/src/live_client/`: Polling e eventos da Live Client Data API durante a partida.
   - `src-tauri/src/db/`: Persistência local em SQLite para anotações do jogador.
   - `src-tauri/src/commands/`: Handlers dos comandos expostos ao Tauri IPC.
2. **Tratamento de Erros Resiliente**:
   - Comandos expostos via `#[tauri::command]` **devem retornar `Result<T, String>`**.
   - **Proibido o uso de `.unwrap()` ou `.expect()` que cause panic** no processo Tauri em produção.
3. **Serialização Serde**:
   - Todas as structs de transporte Rust $\leftrightarrow$ TypeScript devem utilizar `#[serde(rename_all = "camelCase")]` para manter conformidade perfeita com os nomes de propriedades no frontend.
4. **Detecção LCU Multi-Camada**:
   - Camada 1: Varredura de caminhos de lockfile em múltiplos discos (`C:`, `D:`, `E:`, `F:`).
   - Camada 2: Leitura de metadados do Riot Client (`RiotClientInstalls.json`).
   - Camada 3: Inspeção de linha de comando de processos em execução no Windows (`LeagueClientUx.exe`).

---

## 3. Schemas Canônicos de Dados (JSON / TypeScript)

### 3.1 Matchup Detail Schema (`src/types/matchup.ts`)
```typescript
export interface MatchupDetail {
  id: number;
  championId: number;
  championName: string;
  riotKey: string;
  difficultyTier: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  difficultyRating: number;        // 1 a 10
  difficultyRaw: string;           // ex: "Medium - 5/10"
  runesRecommendation: string;
  startingItems: string;
  summonerSpells: string;
  abilityMaxOrder: string;         // ex: "Q > E > W"
  level1Start?: 'Q' | 'W' | 'E' | 'E_ALCOVE' | 'SITUATIONAL';
  level1ExplanationPt?: string;
  level1ExplanationEn?: string;
  winConditionPt?: string;
  winConditionEn?: string;
  cautionPt?: string;
  cautionEn?: string;
  summaryPt: string;
  summaryEn: string;
  tips: MatchupTip[];
  furyTips?: string[];
  hasVideo: boolean;
  videoUrl?: string;
  videoId?: string;
  deepLol?: DeepLoLData;
}
```

### 3.2 DeepLoL AI Data Schema
```typescript
export interface DeepLoLData {
  hasData: boolean;
  levelAdvantage?: {
    lv1: 'advantage' | 'disadvantage' | 'neutral';
    lv2: 'advantage' | 'disadvantage' | 'neutral';
    lv3: 'advantage' | 'disadvantage' | 'neutral';
    lv4: 'advantage' | 'disadvantage' | 'neutral';
    lv5: 'advantage' | 'disadvantage' | 'neutral';
    lv6: 'advantage' | 'disadvantage' | 'neutral';
  };
  tips?: {
    titleEn: string;
    titlePt: string;
    contentEn: string;
    contentPt: string;
  }[];
  stats?: {
    sampleSize: number;
    renektonWinRate: number;
    enemyWinRate: number;
  };
}
```

---

## 4. Gestão de Build e Empacotamento Desktop

- **Frontend**: Vite + TypeScript + Tailwind CSS gerando saída estática em `dist/`.
- **Desktop Bundle**: Tauri v2 gerando executável portátil (`Renekton-Matchups.exe`) e instalador oficial (`Instalador-Renekton-Matchups.exe`).
- **Limpeza**: Antes de novos builds oficiais, executáveis antigos devem ser limpos com o script `scripts/clean-build.ps1` conforme a skill `build-and-package`.
