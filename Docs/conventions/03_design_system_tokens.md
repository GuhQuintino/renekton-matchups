# Convenção de Design System & Tokens Visuais (LoLTheory Dark/OLED)

Este documento define os tokens visuais, paleta de cores, tipografia e diretrizes de interface do usuário para o projeto **Renekton Champion Matchup**.

---

## 1. Paleta de Cores Base (Dark/OLED LoLTheory)

A interface utiliza um tema escuro de alto contraste inspirado na estética premium do cliente de League of Legends e nas plataformas *LoLTheory* e *DeepLoL*:

| Nome do Token | Valor Hex | Uso Principal |
|---|---|---|
| `--bg-void` | `#090A0C` | Fundo principal da aplicação / canvas externo |
| `--bg-surface` | `#0F1015` | Superfície de cartões internos e barras superiores |
| `--bg-card` | `#151821` | Cartões interativos, seções e modais |
| `--border-subtle` | `#262B3D` | Bordas padrão de cartões e divisores |
| `--border-hover` | `#3A4259` | Destaque de borda ao passar o mouse (`hover`) |
| `--gold-primary` | `#D4A017` | Cor primária Shurima / Ouro de Renekton / Keystone |
| `--gold-bright` | `#F59E0B` | Dourado brilhante para realces, botões de ação e itens |
| `--gold-light` | `#F3B72C` | Dourado claro para textos de destaque e efeitos glow |
| `--emerald-win` | `#10B981` | Taxas de vitória positivas, vantagens táticas e cura |
| `--ruby-danger` | `#EF4444` | Avisos de perigo, stun de W, dano massivo e desvantagens |
| `--sky-ability` | `#38BDF8` | Habilidades de mobilidade (E), feitiços de invocador e links |
| `--purple-dominus`| `#A855F7` | Ultimate Dominus (R) e habilidades transcendentais |
| `--text-primary` | `#F8FAFC` | Texto principal / títulos (quase branco) |
| `--text-secondary`| `#CBD5E1` | Corpo de texto e descrições |
| `--text-muted` | `#94A3B8` | Metadados, subtítulos e labels auxiliares |
| `--text-faint` | `#64748B` | Textos desativados e contadores secundários |

---

## 2. Semântica Visual da Fúria do Renekton (Barra de Recursos)

A mecânica de Fúria (*Fury*) é o coração do gameplay do Renekton e deve ser refletida visualmente na interface de acordo com a seguinte escala:

- **0 a 49 Fúria (Neutro / Não Empoderado)**:
  - Cor: `#94A3B8` (Cinza Claro) / `#F8FAFC`
  - Borda: `#262B3D`
  - Significado: Habilidades em modo básico (sem bônus de dano ou efeitos adicionais).
- **50 a 99 Fúria (Empoderado / Ponto Ótimo)**:
  - Cor: `#D4A017` (Ouro) / `#EAB308`
  - Borda: `#D4A017` com glow dourado suave
  - Significado: Habilidades empoderadas disponíveis (Stun 1.5s no W, Cura 3x no Q, Redução de Armadura 35% no E).
- **100 Fúria (Fúria Máxima / Overheat)**:
  - Cor: `#EF4444` (Rubro / Fúria Sangrenta)
  - Borda: `#DC2626` com pulso de sombra vermelha
  - Significado: Capacidade de encadear duas habilidades fortalecidas consecutivas com Dominus.

---

## 3. Cores Semânticas das Habilidades

Cada habilidade possui identidade cromática exclusiva:
- **Q (Abater os Indefesos)**: Verde Esmeralda (`#10B981`) — Simboliza corte em área e cura.
- **W (Predador Impiedoso)**: Vermelho Rubro (`#EF4444`) — Simboliza ferocidade, quebra de escudos e stun.
- **E (Fatiar e Cortar)**: Azul Celeste (`#38BDF8`) — Simboliza agilidade, dash duplo e quebra de armadura.
- **R (Dominus)**: Roxo Cósmico (`#A855F7` / `#C084FC`) — Simboliza fúria transcendental e forma ascendente.
- **Auto-Ataque (AA)**: Branco Titânio (`#F8FAFC`) com caixa em `#151821`.

---

## 4. Classificação de Dificuldade de Matchups

| Tier | Faixa de Nota (1 a 10) | Cor do Badge | Cor de Borda e Fundo |
|---|---|---|---|
| **Easy** | 1 a 3 | `#10B981` (Verde) | Fundo `bg-[#062E22]`, Borda `border-[#059669]` |
| **Medium** | 4 a 6 | `#D4A017` (Ouro) | Fundo `bg-[#2E1E05]`, Borda `border-[#D97706]` |
| **Hard** | 7 a 8 | `#EA580C` (Laranja) | Fundo `bg-[#381308]`, Borda `border-[#EA580C]` |
| **Very Hard** | 9 a 10 | `#EF4444` (Vermelho) | Fundo `bg-[#2F0909]`, Borda `border-[#DC2626]` |

---

## 5. Tipografia & Hierarquia de Texto

- **Família Tipográfica**: `Inter, system-ui, -apple-system, sans-serif`.
- **Família Monospaçada (Timers, Fúria, Níveis, KDA)**: `JetBrains Mono, Menlo, Monaco, monospace`.
- **Tamanhos e Pesos**:
  - Título de Página / Matchup: `text-2xl` a `text-3xl`, `font-black`, `tracking-tight`.
  - Títulos de Seção: `text-sm` a `text-base`, `font-extrabold`, `uppercase`, `tracking-wider`.
  - Corpo / Descrições: `text-xs` a `text-sm`, `leading-relaxed`, `text-[#CBD5E1]`.
  - Badges e Metadados: `text-[10px]` a `text-[11px]`, `font-bold`, `font-mono`.
