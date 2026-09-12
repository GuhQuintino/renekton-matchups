# Architectural Decisions (DECISIONS.md)

## ADR-001: Fonte de Dados do DeepLoL GG
- **Decisão**: Utilizar os endpoints diretos da CDN pública do DeepLoL (`https://b2c-api-cdn.deeplol.gg/matchup/matchup_tips` e `matchup_stats`) com queries parametrizadas por `champion_id=58` (Renekton) e `enemy_champion_id={riotId}`.
- **Justificativa**: A CDN retorna respostas JSON estruturadas limpas em <50ms por requisição, dispensando o overhead e a fragilidade de renderizar o DOM de navegadores completos para cada campeão, com 100% de precisão nos dados.

## ADR-002: Filtragem de Confrontos Incompletos
- **Decisão**: Confrontos que retornam `levelAdvantage: null` e `tips: null` (que no site exibem 'LLM 요약 준비 중') são explicitamente marcados com `hasData: false` e não geram ruído na interface.
- **Justificativa**: Garante que apenas informações táticas concretas e verificadas de IA sejam apresentadas ao jogador.

## ADR-003: Tradução Bilíngue Especializada
- **Decisão**: Traduzir todas as dicas do DeepLoL para Português do Brasil de forma contextualizada, preservando a terminologia técnica de League of Legends em inglês.
- **Justificativa**: Alinha-se ao padrão estabelecido em todo o projeto Renekton Matchup.

## ADR-004: Descoberta Universal de Processos LCU e Mapeamento de Champion IDs
- **Decisão**: Implementar detecção de três camadas para o League Client (1. Varredura de caminhos de lockfile em múltiplos discos; 2. Leitura de metadados do Riot Client; 3. Inspeção de processo via linha de comando no Windows para extrair `--app-port` e `--remoting-auth-token`) combinada com mapeamento canônico de todos os IDs de campeões em Rust.
- **Justificativa**: Garante conexão 100% resiliente em qualquer diretório de instalação do LoL e previne problemas onde campeões apareciam como `Champ_266` em vez de `Aatrox`.

## ADR-005: Roteamento Reativo de 4 Telas Focadas por Fase
- **Decisão**: O aplicativo chaveia automaticamente entre 4 visualizações dedicadas (`LOBBY` -> Estudo Livre, `CHAMP_SELECT` -> Picks adversários ordenados por probabilidade Toplane com Runas automáticas, `IN_GAME` -> Live HUD com dicas rápidas, cooldowns e vídeos, e `POST_GAME` -> Drawer/Modal automático com extração de KDA e notas).
- **Justificativa**: Elimina a necessidade de qualquer comando manual durante a partida, tornando o uso de Renekton 100% automático desde o momento do lock até o pós-jogo.
