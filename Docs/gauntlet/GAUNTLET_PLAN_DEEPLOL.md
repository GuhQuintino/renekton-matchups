# GAUNTLET PLAN: Mineracao e Integracao DeepLoL GG

## Chunk 1: Scraper/Minerador Assincrono DeepLoL (scripts/scrape_deeplol_matchups.py)
- Carrega a lista completa de campeoes com seus riotId de src/data/champions.json.
- Para cada campeao (Renekton ID = 58 vs Inimigo ID = riotId):
  - Faz fetch de https://b2c-api-cdn.deeplol.gg/matchup/matchup_tips?champion_id=58&enemy_champion_id={riotId}&language=en
  - Faz fetch de https://b2c-api-cdn.deeplol.gg/matchup/matchup_stats?champion_id=58&enemy_champion_id={riotId}
- Descarta campeoes onde levelAdvantage ou tips sao nulos/vazios.
- Normaliza levelAdvantage (lv1..lv6):
  - '유리' -> 'advantage'
  - '불리' -> 'disadvantage'
  - Outros -> 'neutral'
- Traduz tips para PT-BR mantendo termos de LoL em ingles (PTA, Conq, Empowered W, E dash, Sweet Spot, Wave, Freeze, Trade, etc.).
- Salva o resultado em src/data/deeplol_matchups.json e scripts/deeplol_mined.json.

## Chunk 2: Integracao com o Data Engine do Projeto
- Atualizar scripts/build_data_engine.py e scripts/enrich_matchups_data.py para mesclar os dados minerados do DeepLoL dentro de cada matchup em src/data/matchups.json e src/data/matchup-summaries.json.
- Garantir que cada matchup tenha um campo deepLol?: DeepLoLData.

## Chunk 3: Extensao de Tipagem TypeScript
- Atualizar src/types/matchup.ts com as interfaces LevelAdvantage, DeepLoLTip, DeepLoLStats e DeepLoLData.

## Chunk 4: Interface do Usuario (UI / UX LoLTheory + DeepLoL)
- Criar o componente src/components/DeepLoLAdvantageBar.tsx.
- Integrar este componente em MatchupTabs.tsx e QuickInfoBar / HeroCard.

## Chunk 5: Validacao e Testes Automatizados
- Criar script de validacao scripts/verify_deeplol_data.py.
- Rodar typecheck do TypeScript (npx tsc --noEmit).
- Testar build Vite (npm run build).
- Testar visualmente com Browser QA.
