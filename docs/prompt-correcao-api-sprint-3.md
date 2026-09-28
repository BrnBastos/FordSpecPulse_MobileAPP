# Prompt — completar os dados da API para a Sprint 3

Copie este documento para o agente que vai trabalhar no repositório da API. Forneça também a apresentação Ford e a evidência de consulta citadas abaixo.

## Objetivo

Corrigir as lacunas de dados da Ford Ranger Raptor para atender ao Desafio 01 da Sprint 3 de Mobile Development and IoT. A solução precisa retornar todas as especificações do slide de referência, preservando a compatibilidade com o **APK Android 1.2.1 já instalado**.

Trabalhe no backend, na taxonomia, nas fontes e na persistência. Não resolva as diferenças com valores fixos no aplicativo, respostas simuladas ou mudanças de permissão da conta. A conclusão depende de dados corretos e de consultas reais após a publicação, não apenas de testes com respostas controladas.

Toda documentação e comunicação deve estar em pt-BR. Preserve os nomes técnicos do contrato existente.

## Contexto e materiais

- API em uso: `https://ford-spec-pulse-api-r64e.onrender.com/api`.
- OpenAPI: `https://ford-spec-pulse-api-r64e.onrender.com/v3/api-docs`.
- Referência: **FORD_apresentacao (1).pdf**, página **13**, “RANGER RAPTOR”. A página **18** define a validação exigida.
- [Conferência completa](validacao-ranger-raptor.md).
- [Pedido e resposta reais de 26/09/2026](evidence/raptor-conferencia-slide-2026-09-26.json), incluindo o hash da apresentação.
- [Contrato consumido pelo aplicativo](contrato-api.md). Algumas seções descrevem verificações históricas; para os resultados mais recentes, consulte [QA](qa-sprint-3.md).

O app já consultou a API com uma conta de avaliação autorizada. Comparações com atributos do catálogo e somente com termos livres funcionaram; o problema identificado agora é a cobertura e a correção dos dados.

A documentação pública consultada não oferece edição de atributos ou especificações. Inspecione o repositório para localizar entidades, carga inicial, migrações, resolução de sinônimos e regras de consulta. Não suponha nomes de tabelas nem crie uma rota administrativa pública só para carregar esses dados.

## 1. Confirmar a referência antes de alterar a base

A identidade disponível no catálogo é:

```text
Marca: Ford
Modelo: Ranger Raptor
Versão: Raptor 3.0 V6 Biturbo Gasolina 4x4 Cabine Dupla
Ano-modelo: 2024
Mercado: BR
Veículo: vehicle-ford-ranger-raptor-2024
Versão: version-ford-ranger-raptor-raptor-3-0-v6-biturbo-gasolina-4x4-cabine-dupla-2024
```

O slide não explicita ano-modelo ou mercado. Confirme a correspondência com essa identidade antes de sobrescrever especificações. Não associe dados de outro ano a 2024 apenas para fazer o teste passar.

O preço está escrito literalmente como **“R$499.00”**. A formatação é ambígua: não interpretar automaticamente como R$ 499.000,00 nem como preço validado de R$ 499,00. Solicite esclarecimento ao responsável pela referência. Enquanto não houver confirmação, mantenha essa pendência explícita e não aprove a cobertura integral. Continue os itens independentes.

## 2. Corrigir a cobertura do slide

| Item | Conteúdo necessário da referência | Problema encontrado |
|---|---|---|
| Motor | V6 3.0L Nano biturbo | “Motor” não reconhecido; o nome da versão não substitui a especificação |
| Potência | 397 cv a 5.650 RPM | Valor presente, rotação ausente |
| Torque | 583 Nm a 3.500 RPM | Valor presente, rotação ausente |
| Transmissão | Automática de 10 velocidades e paddle shifters | Transmissão e paddle shifters não reconhecidos |
| Tração | 4WD | Termo não reconhecido na ficha |
| Amortecedores | Live Valve FOX Racing 2,5 polegadas | Suspensões citam FOX Live Valve 2.5, sem a designação completa |
| Aceleração de 0 a 100 km/h | 5,8 s | API retorna 5,9 s |
| Modos de condução | Normal, Sport, Escorregadio, Lama, Areia, Rock Crawl, Baja | Retorna apenas a quantidade 7 |
| Modos de volante | Normal, Sport, Conforto | Termo não reconhecido |
| Modos de escapamento | Normal, Silencioso, Sport, Baja | Termo não reconhecido |
| Modos de amortecedor | Normal, Sport, Baja | Termo não reconhecido |
| Faróis | Matrix LED | Termo não reconhecido |
| Rodas e pneus | Rodas de 17 polegadas; pneus 285/70 R17 AT | Pneus compatíveis; falta resposta para rodas |
| Preço | Confirmar o significado do texto “R$499.00” | Pedido não reconhecido e referência ambígua |

### Regras para implementar

- Cadastre atributos canônicos e sinônimos para os termos acima. Normalize acentos, caixa e espaços, mantendo `termoSolicitado` igual ao pedido recebido.
- Preserve IDs existentes. Não recrie veículos ou versões usados pelo APK para facilitar a carga.
- Mantenha valores numéricos comparáveis: 397 cv e 583 Nm podem continuar nos atributos atuais, com rotações em atributos próprios. Não troque números por frases sem revisar os consumidores existentes.
- Se “Modos de condução” representa uma contagem na modelagem atual, preserve essa informação e acrescente um atributo para a lista de nomes. O pedido pela lista deve devolver os nomes, não apenas 7. Evite sinônimos ambíguos entre contagem e lista.
- Podem ser usados atributos separados para transmissão, número de marchas e paddle shifters, desde que a consulta cubra o conteúdo completo e cada termo tenha significado claro.
- Exponha listas de modos como texto legível nos contratos atuais. O APK não aceita objetos ou arrays como valor de uma célula.
- Para aceleração, verifique a origem do 5,9 s e a identidade do veículo. Confirmada a aplicação do slide, registre 5,8 s com a fonte correta, preservando o histórico da alteração.
- Não remova os outros atributos já existentes nem altere dados da Hilux ou de outros veículos por consequência da carga da Raptor.
- Dados ausentes da concorrente devem continuar ausentes explicitamente; nunca copiar valores da Ford.

## 3. Preservar o contrato do APK 1.2.1

### Endpoints e catálogo

Mantenha a base HTTPS e estas rotas existentes:

```text
GET  /veiculos
GET  /veiculos/{id}
GET  /veiculos/{id}/versoes
GET  /versoes/{id}
GET  /versoes/{id}/especificacoes
GET  /atributos/taxonomia
POST /fichas-tecnicas/consultar
POST /comparacoes
```

O aplicativo carrega a taxonomia e as especificações da API; novos atributos não precisam de uma lista fixa no código mobile. Preserve os campos atuais da taxonomia, incluindo `id`, `canonicalName`, `category` e `synonyms` quando fornecidos.

As listas paginadas usam `{data, page, pageSize, total}`, com página inicial 1. Preserve totais e tamanhos coerentes, ordenação estável e IDs únicos. O app rejeita páginas repetidas, truncadas ou com metadados inconsistentes. Não mude para outro envelope de paginação.

### Consulta da ficha

O APK envia nomes, sem ano, mercado ou ID no corpo:

```json
{
  "marca": "Ford",
  "modelo": "Ranger Raptor",
  "versao": "Raptor 3.0 V6 Biturbo Gasolina 4x4 Cabine Dupla",
  "atributos": ["Motor", "Rotação de potência máxima", "Faróis"]
}
```

Preserve a resposta atual:

- `versaoId`, `marca`, `modelo`, `versao`, `anoModelo`, `mercado`, `consultadoEm` e `itens`.
- Em cada item: `termoSolicitado`, `codigoCanonico`, `nomeExibicao`, `categoria`, `valor`, `unidade`, `status`, `fonte` e `dataCaptura`, conforme o contrato.
- `valor` deve ser **string ou null**. Para `PRESENTE`, a string precisa ter conteúdo. O valor já formatado não recebe uma segunda unidade no app.
- Estados aceitos nessa rota: **`PRESENTE`, `NAO_INFORMADO`, `NAO_DISPONIVEL`, `ATRIBUTO_DESCONHECIDO`**. Não introduza novos estados obrigatórios, como `CONFLITO`, nessa resposta sem coordenar uma mudança mobile.
- Retorne exatamente um item por termo solicitado. Não omita termos desconhecidos, não duplique itens e não acrescente atributos que não foram pedidos. Suporte até 50 termos.

A identidade retornada precisa corresponder ao catálogo selecionado, incluindo ano e mercado. O app aceita slug no catálogo e UUID na ficha mediante igualdade da identidade completa; se o ID selecionado for UUID, exige igualdade do ID também.

**Limite importante:** se houver versões indistinguíveis por marca/modelo/nome e de anos ou mercados diferentes, o corpo atual não tem informação suficiente para desambiguar. Não escolha arbitrariamente uma delas. Investigue a modelagem e documente o caso; se for necessário exigir novos parâmetros, isso poderá exigir atualização do APK. Novos filtros opcionais não podem invalidar os pedidos atuais.

### Especificações e comparação

- Em especificações e células, preserve valores escalares: string, número, booleano ou null. Valores `0` e `false` são válidos.
- Os estados dessas rotas não são os mesmos da ficha livre. O adaptador atual reconhece `found`/`CONFIRMADO`, `not_informed`/`NAO_INFORMADO`, `not_available`, `conflict`/`CONFLITO` e `unknown_attribute`/`ATRIBUTO_DESCONHECIDO`. Preserve a correspondência existente; não propague `PRESENTE` indiscriminadamente para todas as rotas.
- Em `/comparacoes`, preserve `id`, `rows`, `summary`, `attributeId` nas linhas e `versionId` nas células. Não dependa da posição das células para identificar veículos.
- Ficha, especificações e comparação devem ler a mesma informação corrigida. Não atualize só um endpoint.
- Mantenha fontes e estados disponíveis nos campos já consumidos, incluindo `sourceLabel`, `sourceUrl`, `collectedAt` e `notes` nas células quando houver informação legítima. Não invente datas ou percentuais de confiança.
- A comparação deve continuar aceitando `attributeIds: []` com versões válidas e autorização. Esse é o fluxo já usado pelo APK para comparar somente termos livres: ele autoriza a operação em `/comparacoes` e depois consulta a ficha de cada versão.
- Não passe a exigir `requestedAttributes` em `/comparacoes`: esse campo existe na seleção local do aplicativo, mas não é enviado nesse POST.
- Preserve autenticação, renovação de sessão e permissões. A correção de dados não deve ampliar o acesso de perfis de consulta.

## 4. Fonte, migração e publicação

1. Registre a apresentação e a página 13 como fonte dos dados efetivamente obtidos nela. Não rotule esses valores como “Site Oficial Ford” se essa não foi a origem conferida.
2. Distinga data de importação, publicação da fonte e captura. Não atribua uma data desconhecida ao documento.
3. Faça a alteração persistente por migração ou mecanismo de carga apropriado ao projeto. A execução deve ser idempotente: repetir a carga não cria duplicatas nem apaga outros veículos.
4. Execute testes em ambiente de desenvolvimento/homologação antes de publicar. Registre como reverter a alteração e evite alterações destrutivas.
5. Publique usando o processo autorizado do projeto. Se não houver acesso ao ambiente Render, entregue a alteração pronta e informe exatamente o que falta para a publicação.
6. Invalide os caches do servidor afetados. Verifique que as respostas publicadas, e não apenas a base local, apresentam os dados novos.

## 5. Testes e critérios de aceite

### API

- Reexecute os **19 termos** do campo `request` da evidência anexada. Acrescente pedidos diretos para “Amortecedores” e para a lista nominal dos modos de condução, se forem atributos próprios.
- Faça uma matriz de cobertura das **14 linhas do slide**, incluindo os subitens. Nenhuma linha pode ser aprovada somente porque o termo foi reconhecido.
- Confira valores, unidades, detalhes, fonte e identidade. Rotação de potência e torque, nomes dos modos e paddle shifters precisam estar cobertos.
- Teste grafias com e sem acento, caixa e espaços diferentes, usando nomes canônicos e sinônimos.
- Teste atributo conhecido sem valor e termo desconhecido; ambos devem permanecer explícitos e distintos.
- Teste paginação com tamanho pequeno para cobrir a taxonomia ampliada e todas as especificações.
- Compare Raptor e Hilux com atributos antigos e novos. Confira identidade de cada célula, coerência com a ficha e ausência de valores inventados para a concorrente.
- Teste comparação somente livre, com `attributeIds: []`, e confirme que o perfil sem permissão continua recebendo a restrição.
- Teste a idempotência da carga e a preservação dos dados não relacionados.
- Adicione testes de regressão nos serviços reais do backend, sem alterar fixtures apenas para esconder falhas.

### APK existente

Use **FordSpecPulse-1.2.1.apk**, sem recompilar. Após a publicação, feche e reabra o app para iniciar novas consultas, pois dados já carregados podem estar em cache.

1. Entre com a conta de avaliação já autorizada.
2. Abra a Raptor e confira os novos atributos do catálogo.
3. Consulte os itens da referência e expanda as fontes.
4. Gere uma nova comparação mista e outra somente com termos livres.
5. Salve, feche/reabra o app e confira o histórico.

**Análises antigas são registros locais do resultado na data da consulta.** Elas não são atualizadas pela API; gere e salve uma nova análise para verificar a correção. Não apague o histórico do usuário como parte da atualização.

Se não houver acesso ao dispositivo ou ao APK, registre os testes nativos como pendentes, sem afirmar que passaram.

## 6. O que entregar ao concluir

- Alterações de código e migração/carga de dados, com testes executados e resultados.
- Matriz antes/depois das 14 linhas do slide, com fonte e pendências explícitas.
- Evidências sanitizadas de consultas à API publicada, sem senhas ou tokens.
- Identificação da versão/commit publicado e procedimento de reversão.
- Confirmação de compatibilidade com o APK 1.2.1 ou descrição precisa de qualquer mudança incompatível necessária.
- Documentação atualizada: a referência já foi recebida; não manter “slide não fornecido” como justificativa.

Não declare o requisito integralmente concluído enquanto houver dados exigidos ausentes, divergências sem resolução, identidade não confirmada ou preço sem esclarecimento.

## Resultado esperado para o aplicativo

As correções de dados, sinônimos, taxonomia e fontes podem chegar ao APK atual pela API, **sem alteração do código mobile**, desde que os contratos, identidades e a URL sejam preservados. O app já consulta esses dados dinamicamente.

Uma nova versão do APK só será necessária se a solução exigir mudança incompatível no contrato, parâmetros obrigatórios adicionais, outra URL ou uma correção de interface identificada nos testes. A intenção é concluir a correção no backend; a confirmação final vem da execução com o APK existente.
