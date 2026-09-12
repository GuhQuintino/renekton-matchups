# Manual Mestre de Convenções do Projeto: Renekton Champion Matchup

> **Versão Oficial**: 2.0 (Alinhada ao Patch Riot `16.16.1` e ao Padrão Gauntlet Loop)  
> **Status**: ATIVO / CANÔNICO

Este documento consolida as diretrizes absolutas de desenvolvimento, ativos visuais, tradução bilíngue, design system e arquitetura para o projeto **Renekton Champion Matchup**.

---

## Índice Rápido
1. [Ativos Visuais & Data Dragon (16.16.1)](#1-ativos-visuais--data-dragon-16161)
2. [Glossário Gamer & Política de Tradução (PT-BR vs EN)](#2-glossário-gamer--política-de-tradução-pt-br-vs-en)
3. [Design System & Semântica Visual LoLTheory](#3-design-system--semântica-visual-loltheory)
4. [Padrões de Engenharia (TypeScript / Rust / Tauri v2)](#4-padrões-de-engenharia-typescript--rust--tauri-v2)
5. [Controle de Qualidade Gauntlet & Testes](#5-controle-de-qualidade-gauntlet--testes)

---

## 1. Ativos Visuais & Data Dragon (16.16.1)

### 1.1 Versionamento Dinâmico
- O sistema consulta `https://ddragon.leagueoflegends.com/api/versions.json` no startup e adota a versão mais recente (índice 0).
- Fallback embutido e canônico: **`16.16.1`**.
- Cache local em `localStorage` por 24 horas.

### 1.2 URLs Canônicas Riot CDN
- **Campeão (Square)**: `https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{riotKey}.png`
- **Splash Art**: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{riotKey}_{skinIndex}.jpg`
- **Loading Screen**: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/{riotKey}_{skinIndex}.jpg`
- **Itens**: `https://ddragon.leagueoflegends.com/cdn/{version}/img/item/{itemId}.png`
- **Feitiços de Invocador**: `https://ddragon.leagueoflegends.com/cdn/{version}/img/spell/{spellKey}.png`
- **Runas/Perks**: `https://ddragon.leagueoflegends.com/cdn/img/{perkPath}`
- **Habilidades Renekton**:
  - `Q`: `RenektonCleave.png`
  - `W`: `RenektonPreExecute.png`
  - `E`: `RenektonSliceAndDice.png`
  - `R`: `RenektonReignOfTheTyrant.png`
  - `P`: `Renekton_Passive.png` (na pasta `/img/passive/`)

### 1.3 Resiliência Offline
- Todo componente de imagem deve possuir handler de erro `onError` com fallback para `dataDragon.getOfflineSvgFallback(label, accentColor)`.

---

## 2. Glossário Gamer & Política de Tradução (PT-BR vs EN)

### 2.1 Termos Táticos Intocados em Inglês
Termos mecânicos, fases da wave e jargões de gameplay **permanecem sempre em inglês**, mesmo na interface em português:
- `Wave`, `Farm`, `CS`, `Trade / Trading`, `Engage`, `Disengage`, `Skirmish`, `Bait`, `Level / Lv`, `All-in`, `Freeze`, `Slow Push`, `Fast Push`, `Crash`, `Dive`, `Gapclose`, `Auto Attack / AA`, `Animation Cancel`, `Doublecast`, `Burst`, `Poke`, `Sustain`, `Powerspike`, `CC / Stun / Slow`, `Cooldown / CD`, `Kite`, `Peel`, `Proxy`, `Matchup`, `Proc`, `Roam`.

### 2.2 Nomes de Ativos de Jogo (Dual Mode)
- **Modo PT-BR**: Nomes oficiais da localização da Riot Games Brasil (*Lâmina de Doran, Escudo de Doran, Pressione o Ataque, Conquistador, Incendiar, Flash, Teleporte, Abater os Indefesos, Predador Impiedoso, Fatiar e Cortar, Dominus*).
- **Modo EN (Original)**: Nomes originais dos guias e do cliente internacional (*Doran's Blade, Doran's Shield, Press the Attack / PTA, Conqueror, Ignite, Flash, Teleport, Cull the Meek, Ruthless Predator, Slice and Dice, Dominus*).

---

## 3. Design System & Semântica Visual LoLTheory

- **Paleta Dark/OLED**: `#090A0C` (fundo principal), `#0F1015` (superfície interna), `#151821` (cartões), `#262B3D` (bordas sutis), `#3A4259` (borda hover).
- **Acentos Dourados**: `#D4A017` (Ouro Shurima), `#F59E0B` (Dourado de ação), `#F3B72C` (Realce).
- **Fúria do Renekton**:
  - `0 - 49`: Cinza `#94A3B8` / `#F8FAFC` (Básico / Neutro)
  - `50 - 99`: Dourado `#D4A017` / `#EAB308` (Empoderado / Stun 1.5s / Cura 3x / 35% Redução Armadura)
  - `100`: Rubro `#EF4444` (Fúria Máxima)
- **Cores das Habilidades**: Q (`#10B981`), W (`#EF4444`), E (`#38BDF8`), R (`#A855F7`).
- **Dificuldade**: Easy (`#10B981`), Medium (`#D4A017`), Hard (`#EA580C`), Very Hard (`#EF4444`).

---

## 4. Padrões de Engenharia (TypeScript / Rust / Tauri v2)

1. **Frontend**:
   - React 18 com TypeScript estrito (`React.FC<Props>`).
   - Tailwind CSS com classes semânticas.
   - Componente universal de ícones: `<LoLIcon />`.
2. **Backend**:
   - Rust com Tauri v2.
   - Comandos retornam `Result<T, String>` sem panics.
   - Serialização `#[serde(rename_all = "camelCase")]`.
   - Detecção LCU robusta em 3 camadas (lockfile multi-disco, metadados Riot Client, linha de comando do processo).

---

## 5. Controle de Qualidade Gauntlet & Testes

- Critério de Aprovação: Média $\ge$ 2.5/3.0 na Rubrica 6D e 0 Bloqueantes.
- Suíte automatizada com 100% de aprovação no Vitest:
  ```bash
  npm test -- --run
  ```
- Tipagem estrita validada:
  ```bash
  npx tsc --noEmit
  ```

---

*Para detalhamentos de cada módulo, consulte os arquivos em `Docs/conventions/`.*
