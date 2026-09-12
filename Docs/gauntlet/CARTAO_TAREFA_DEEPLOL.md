# CARTÃO DE TAREFA: Mineração e Integração de Matchups DeepLoL GG

## 1. Contexto & Necessidade
O usuário descobriu uma fonte valiosa de dados estratégicos de League of Legends no site DeepLoL GG (https://www.deeplol.gg/llm).
Neste portal, existem resumos gerados por IA com duas informações estratégicas cruciais para o Renekton:
1. **Level Advantage Matrix (Níveis 1 ao 6)**: Indica para cada nível (1 a 6) se o confronto favorece o Renekton (Advantage / 유리) ou o adversário (Disadvantage / 불리).
2. **LLM Tactical Tips**: Tópicos cirúrgicos de micro e macro-jogo específicos do confronto (ex: desvio de skillshots, uso do Empowered W contra escudos/curas, janelas de all-in).
3. **Estatísticas Reais de Matchup**: Taxa de vitória e tamanho da amostra no Top.

Muitos confrontos no DeepLoL ainda estão em preparação (exibindo apenas 'LLM 요약 준비 중' ou retornando null). O objetivo é minerar todos os confrontos disponíveis, filtrar os incompletos, traduzir as dicas para PT-BR preservando termos de LoL em inglês, e exibir essas informações na UI de forma moderna e intuitiva.

## 2. Escopo
- Criar script automatizado em Python para consultar a API CDN do DeepLoL para todos os 170+ campeões do LoL.
- Processar os dados, converter status coreanos (유리 -> advantage, 불리 -> disadvantage).
- Traduzir títulos e dicas para PT-BR com terminologia técnica de Challenger.
- Integrar os dados ao banco de dados e data engine do aplicativo.
- Atualizar a UI do frontend (Level Advantage Bar 1-6 e Dicas LLM).

## 3. Critérios de Aceitação (Rubrica 6D)
- **D1 Funcionalidade**: Todos os campeões com dados no DeepLoL são minerados e exibidos corretamente. Campeões sem dados tratam o fallback com elegância.
- **D2 Robustez**: Scraper assíncrono com retries, timeouts, tratamento de erros de rede e formato JSON resiliente.
- **D3 Fator Uau**: Barra visual de Level Advantage com estilo dark LoLTheory/DeepLoL (neon teal para vantagem, slate escuro para desvantagem) e cards de dicas com badges destacadas.
- **D4 Consistência**: Tipagem TypeScript estrita e compatibilidade com os dados já existentes do Godrekton.
- **D5 Performance**: Carregamento instantâneo no frontend (<5ms) a partir do JSON pré-processado.
- **D6 Testabilidade**: Scripts de verificação e testes automatizados.
