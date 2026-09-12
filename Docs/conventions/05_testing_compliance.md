# Convenção de Testes, Qualidade & Conformidade Gauntlet

Este documento estabelece os padrões de validação, qualidade e verificação contínua do projeto **Renekton Champion Matchup** baseados no **Gauntlet Loop**.

---

## 1. Padrão de Qualidade Rubrica 6D

Toda entrega ou alteração no projeto deve ser avaliada contra os 6 Pilares da Rubrica Gauntlet. O critério de aprovação estrito é: **Média $\ge$ 2.5 / 3.0** e **ZERO BLOQUEANTES**.

### Os 6 Pilares:
1. **D1: Funcionalidade**: Escopo 100% coberto, casos de borda tratados (ex: campeões com nomes complexos, desconexão de LCU, partidas sem dados).
2. **D2: Robustez**: Zero panics no Rust, zero unhandled promise rejections no React, fallback para modo offline e tratamento de erros com logs claros.
3. **D3: Experiência / Uau**: Transições suaves, tema Dark/OLED LoLTheory polido, micro-interações, tooltips informativos bilíngues e fidelidade visual aos dados de alta performance.
4. **D4: Consistência**: Aderência rigorosa às convenções de código, tipagens estritas em TypeScript, nomenclatura canônica da Riot e glossário técnico em inglês.
5. **D5: Performance**: Carregamento instantâneo de matchups (<100ms), IPC assíncrono não-bloqueante, lazy loading de splashes pesadas e baixo consumo de memória.
6. **D6: Testabilidade**: Suíte de testes automatizados com execução determinística e 100% de sucesso em testes unitários, de integração e validação de dados.

---

## 2. Bloqueantes de Reprovação Automática (FAIL)

Qualquer um dos seguintes itens acarreta reprovação imediata:
- Erros de typecheck (`tsc --noEmit`) ou linter.
- Ícones quebrados ou URLs 404 do Data Dragon sem fallback SVG.
- Quebra de contrato de IPC entre Tauri e React.
- Tradução indevida de termos mecânicos (ex: traduzir *wave*, *farm*, *trade*, *skirmish*).
- Falha em qualquer um dos testes automatizados da suíte Vitest.

---

## 3. Estrutura da Suíte de Testes Automatizados

O projeto utiliza **Vitest** com `@testing-library/react` para o frontend e testes de dados. A suíte é organizada em:

- `tests/dataDragon.test.ts`: Validação de resolução de URLs, versões e chaves canônicas da Riot.
- `tests/conventions.test.ts`: Validação de regras de tradução, glossário tático, renderização de ícones e integridade dos schemas.
- `tests/runeRecommendations.test.ts`: Validação de recomendações de runas e árvores secundárias.
- `tests/toplaneProbabilities.test.ts`: Validação de classificação de probabilidade Toplane na Champ Select.
- `tests/notes.test.ts`: Validação de criação, edição e persistência de anotações pós-jogo.

---

## 4. Comandos de Verificação

Para auditar e certificar a conformidade do projeto:

```bash
# 1. Verificação de tipos TypeScript
npx tsc --noEmit

# 2. Execução da suíte completa de testes automatizados
npm test -- --run
```
