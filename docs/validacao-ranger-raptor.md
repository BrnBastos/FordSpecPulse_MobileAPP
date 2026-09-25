# Ranger Raptor — dados reais consultados; referência pendente

O PDF `Ford_V2.pdf` (21 páginas), recebido em 21/09/2026, exige na página 5 a conferência das especificações de um slide de referência. As páginas 4–5 foram inspecionadas visualmente e não trazem essa tabela. O slide complementar continua pendente; esta consulta não representa aprovação do caso pelo avaliador.

## Identidade confirmada na API

Consulta autenticada realizada em 25/09/2026 com conta temporária de QA, perfil padrão `SOMENTE_LEITURA`, sem elevar permissões. Catálogo, consulta direta da versão, especificações e ficha retornaram HTTP 200.

- Marca/modelo: **Ford Ranger Raptor**.
- Ano-modelo/mercado: **2024 / BR**.
- Versão: **Raptor 3.0 V6 Biturbo Gasolina 4x4 Cabine Dupla**.
- ID do veículo: `vehicle-ford-ranger-raptor-2024`.
- ID da versão no catálogo: `version-ford-ranger-raptor-raptor-3-0-v6-biturbo-gasolina-4x4-cabine-dupla-2024`.
- UUID da ficha: `33333333-3333-3333-3333-000000000005`.
- Consulta da ficha: `2026-09-25T15:17:43.452395842Z` (UTC, informado pelo servidor).

O catálogo usa slug e a ficha usa UUID. Marca, modelo, nome da versão, ano e mercado coincidem integralmente entre as respostas. A lista de especificações preserva o ID do catálogo em todas as linhas. Foram recuperadas três páginas de 10, 10 e 3 itens, com total estável de 23 e sem atributos duplicados.

## 23 atributos retornados

Os valores e rótulos de fonte abaixo são declarações do backend. Não houve conferência externa das páginas de origem nem equivalência comprovada com o slide do avaliador. Os 21 valores presentes têm `dataCaptura` igual a `2026-09-23T01:14:55.648523Z`; os dois consumos vieram sem valor ou fonte.

| Atributo da API | Valor retornado | Estado da ficha | Fonte informada | Referência do avaliador |
| --- | --- | --- | --- | --- |
| Potencia maxima | 397 cv | PRESENTE | Site Oficial Ford | Pendente |
| Torque maximo | 583 Nm | PRESENTE | Site Oficial Ford | Pendente |
| Capacidade de carga | 652 kg | PRESENTE | Site Oficial Ford | Pendente |
| Capacidade de reboque | 2500 kg | PRESENTE | Site Oficial Ford | Pendente |
| Central multimidia | 12 pol | PRESENTE | Site Oficial Ford | Pendente |
| Quantidade de airbags | 6 | PRESENTE | Site Oficial Ford | Pendente |
| Controle de descida | Sim | PRESENTE | Site Oficial Ford | Pendente |
| Cilindrada do motor | 3 L | PRESENTE | Site Oficial Ford | Pendente |
| Velocidade maxima | 180 km/h | PRESENTE | Site Oficial Ford | Pendente |
| Aceleracao de 0 a 100 km/h | 5.9 s | PRESENTE | Site Oficial Ford | Pendente |
| Peso em ordem de marcha | 2475 kg | PRESENTE | Site Oficial Ford | Pendente |
| Pneus / medida | BFGoodrich All-Terrain T/A KO2 285/70 R17 | PRESENTE | Site Oficial Ford | Pendente |
| Suspensao dianteira | Independente duplo bracos com amortecedores FOX Live Valve 2.5 | PRESENTE | Site Oficial Ford | Pendente |
| Suspensao traseira | Multilink Watts Link com amortecedores FOX Live Valve 2.5 | PRESENTE | Site Oficial Ford | Pendente |
| Modos de conducao | 7 | PRESENTE | Site Oficial Ford | Pendente |
| Bloqueio diferencial dianteiro | Sim | PRESENTE | Site Oficial Ford | Pendente |
| Bloqueio diferencial traseiro | Sim | PRESENTE | Site Oficial Ford | Pendente |
| Altura livre do solo | 272 mm | PRESENTE | Site Oficial Ford | Pendente |
| Angulo de ataque | 32 graus | PRESENTE | Site Oficial Ford | Pendente |
| Angulo de saida | 24 graus | PRESENTE | Site Oficial Ford | Pendente |
| Painel digital | 12.4 pol | PRESENTE | Site Oficial Ford | Pendente |
| Consumo urbano | Não informado | NAO_INFORMADO | Não fornecida | Pendente |
| Consumo rodoviario | Não informado | NAO_INFORMADO | Não fornecida | Pendente |

Potência e torque também retornaram `397 cv` e `583 Nm` na lista de especificações. Os consumos urbano e rodoviário permanecem `NAO_INFORMADO`; não foram estimados. Dois pedidos adicionais, “Ajuste elétrico do banco do passageiro” e “Autonomia orbital QA”, foram usados somente para verificar retenção de termos fora da taxonomia: ambos retornaram `ATRIBUTO_DESCONHECIDO` e valor nulo. Eles não integram as 23 linhas de referência acima.

Respostas preservadas sem credenciais, tokens ou dados de usuário:

- [Ficha consultada, incluindo os dois termos de teste](evidence/ranger-raptor-2024-sheet.json).
- [Três páginas de especificações e identidade do catálogo](evidence/ranger-raptor-2024-specifications.json).

Essas evidências foram coletadas diretamente na API. A conferência da renderização no APK e as capturas correspondentes ficam em [QA da Sprint 3](qa-sprint-3.md).

## Referência provisória anterior — modelo 2026

A [página Ford Brasil para Raptor 3.0 V6 Bi-turbo 4WD AT 2026](https://www.ford.com.br/picapes/ranger-raptor/raptor-4wd-at/), consultada em 21/09/2026, informa motor 3.0 V6 biturbo a gasolina, 397 cv e 583 Nm. Ela descreve outro ano-modelo e não foi usada para aprovar os dados 2024 nem substituir a referência do avaliador. A coincidência de potência e torque não comprova equivalência entre as versões.

## Aceite restante

Receber o slide complementar, confirmar se o caso exigido corresponde à identidade 2024/BR encontrada e comparar cada atributo requerido — incluindo qualquer atributo ausente desta taxonomia — por valor, unidade, estado e fonte. Registrar diferenças sem corrigir dados por suposição. Nenhum veículo sintético foi criado no catálogo; os testes automatizados não comprovam exatidão automotiva.
