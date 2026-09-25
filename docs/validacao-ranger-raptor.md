# Validação Ranger Raptor — pendente

O PDF `Ford_V2.pdf` (21 páginas), recebido em 21/09/2026, exige na página 5 a conferência de todas as especificações de um slide de referência. As páginas 4–5 foram inspecionadas visualmente e não trazem essa tabela. O slide complementar continua pendente.

## Identidade

- Veículo obrigatório: Ford Ranger Raptor. Limited+, XLT e outras versões não substituem o caso.
- ID/ano/mercado/versão da API: não confirmados. Railway retornou 502/timeout em 21/09; em 25/09, Render respondeu e exigiu autenticação no catálogo. Exemplos Raptor no OpenAPI não comprovam registros reais.
- Referência provisória encontrada: [Ford Brasil, Raptor 3.0 V6 Bi-turbo 4WD AT 2026](https://www.ford.com.br/picapes/ranger-raptor/raptor-4wd-at/), consultada em 21/09/2026. A página identifica 397 cv e 583 Nm. Esses dados não comprovam equivalência com a versão exigida pelo avaliador.

| Atributo | Referência provisória | Origem | Resultado do app | Conferência |
|---|---|---|---|---|
| Motor | 3.0 V6 biturbo a gasolina | Página oficial acima | Não consultado | Pendente |
| Potência | 397 cv | Página oficial acima | Não consultado | Pendente |
| Torque | 583 Nm | Página oficial acima | Não consultado | Pendente |
| Todos os demais atributos do slide | Material complementar ausente | Avaliador | Não consultado | Bloqueado |

Não foi criado um veículo sintético no catálogo. Os testes de valores ausentes/conflitos estão isolados em `tests/` e não comprovam exatidão automotiva. Assim que o slide e a API estiverem disponíveis: identificar a versão exata, preencher uma linha para cada atributo da referência, comparar valores/unidades/estados/fontes no APK, registrar screenshot e resultado individual, documentar diferenças sem corrigir valores por suposição.
