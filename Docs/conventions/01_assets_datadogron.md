# Convenção de Ativos Visuais & Data Dragon (Asset Engine)

> **Versão de Referência**: `16.16.1` (Versão mais recente obtida dinamicamente da API da Riot Games: `https://ddragon.leagueoflegends.com/api/versions.json`).

---

## 1. Diretrizes de Versionamento

1. **Descoberta Dinâmica no Startup**:
   - O aplicativo deve consultar `https://ddragon.leagueoflegends.com/api/versions.json` durante a inicialização (`DataDragonService.init()`).
   - O patch mais recente (índice `0` do array retornado) deve ser adotado automaticamente e persistido em cache no `localStorage` por **24 horas**.
2. **Fallback Fixo Seguro**:
   - Caso o jogador esteja sem internet ou a API da Riot esteja inacessível, a versão padrão estrita do projeto é **`16.16.1`**.
   - Nunca utilizar versões obsoletas (ex: 13.x ou 14.x) nas constantes do projeto.

---

## 2. Padrão de URLs Canônicas do Data Dragon

Todos os componentes e serviços devem consumir a CDN pública da Riot Games através das seguintes rotas padronizadas:

| Tipo de Ativo | Estrutura da URL Canônica | Exemplo Real |
|---|---|---|
| **Retrato do Campeão (Square)** | `https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{riotKey}.png` | `.../cdn/16.16.1/img/champion/Renekton.png` |
| **Splash Art Completa** | `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{riotKey}_{skinIndex}.jpg` | `.../cdn/img/champion/splash/Renekton_0.jpg` |
| **Loading Screen (Slice)** | `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/{riotKey}_{skinIndex}.jpg` | `.../cdn/img/champion/loading/Renekton_0.jpg` |
| **Ícones de Itens** | `https://ddragon.leagueoflegends.com/cdn/{version}/img/item/{itemId}.png` | `.../cdn/16.16.1/img/item/1055.png` (Doran's Blade) |
| **Feitiços de Invocador** | `https://ddragon.leagueoflegends.com/cdn/{version}/img/spell/{spellKey}.png` | `.../cdn/16.16.1/img/spell/SummonerFlash.png` |
| **Runas & Perks** | `https://ddragon.leagueoflegends.com/cdn/img/{perkPath}` | `.../cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png` |
| **Habilidades do Renekton (Q/W/E/R)** | `https://ddragon.leagueoflegends.com/cdn/{version}/img/spell/{file}` | `.../cdn/16.16.1/img/spell/RenektonCleave.png` |
| **Passiva do Renekton (P)** | `https://ddragon.leagueoflegends.com/cdn/{version}/img/passive/{file}` | `.../cdn/16.16.1/img/passive/Renekton_Passive.png` |

---

## 3. Mapeamento de Chaves Canônicas da Riot (`CANONICAL_RIOT_KEYS`)

Campeões que contêm espaços, apóstrofos, pontuação ou nomes internos divergentes na API da Riot **devem** obrigatoriamente ser mapeados através da tabela canônica em `src/services/dataDragon.ts`:

- `Wukong` $\rightarrow$ `MonkeyKing`
- `Dr. Mundo` / `DR.Mundo` $\rightarrow$ `DrMundo`
- `Cho'Gath` $\rightarrow$ `Chogath`
- `Kai'Sa` $\rightarrow$ `Kaisa`
- `K'Sante` $\rightarrow$ `KSante`
- `Kha'Zix` $\rightarrow$ `Khazix`
- `LeBlanc` $\rightarrow$ `Leblanc`
- `Nunu & Willump` $\rightarrow$ `Nunu`
- `Renata Glasc` $\rightarrow$ `Renata`
- `Rek'Sai` $\rightarrow$ `RekSai`
- `Vel'Koz` $\rightarrow$ `Velkoz`
- `Jarvan IV` $\rightarrow$ `JarvanIV`
- `Lee Sin` $\rightarrow$ `LeeSin`
- `Master Yi` $\rightarrow$ `MasterYi`
- `Miss Fortune` $\rightarrow$ `MissFortune`
- `Tahm Kench` $\rightarrow$ `TahmKench`
- `Twisted Fate` $\rightarrow$ `TwistedFate`
- `Xin Zhao` $\rightarrow$ `XinZhao`
- `Aurelion Sol` $\rightarrow$ `AurelionSol`
- `Bel'Veth` $\rightarrow$ `Belveth`

---

## 4. Habilidades do Renekton (Arquivos Canônicos)

- **Q (Abater os Indefesos / Cull the Meek)**: `RenektonCleave.png`
- **W (Predador Impiedoso / Ruthless Predator)**: `RenektonPreExecute.png`
- **E (Fatiar e Cortar / Slice and Dice)**: `RenektonSliceAndDice.png`
- **R (Dominus)**: `RenektonReignOfTheTyrant.png`
- **P (Reinado da Fúria / Reign of Anger)**: `Renekton_Passive.png`

---

## 5. Resiliência Offline & Fallbacks SVG

1. Em caso de falha de carregamento (`onError`) ou flag `isOffline = true`, o aplicativo **nunca deve exibir ícones quebrados** ou espaços em branco.
2. O método `dataDragon.getOfflineSvgFallback(label, accentColor)` gera um data URI SVG em vetor sanitizado inline, estilizado no tema Dark/OLED com borda da cor do ativo:
   - Dourado/Ouro (`#D4A017`) para Campeões/Runas de Precisão
   - Esmeralda (`#10B981`) para Itens de Sustento/Runas de Determinação
   - Azul Celeste (`#38BDF8`) para Feitiços/Habilidades de Mobilidade
   - Rubro (`#EF4444`) para Dano/Combos de Fúria Máxima
