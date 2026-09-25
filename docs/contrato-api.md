# Contrato da API e pendências

Base: `https://ford-spec-pulse-api.onrender.com/api`. OpenAPI recuperado em 25/09/2026 (HTTP 200): [contrato publicado](https://ford-spec-pulse-api.onrender.com/v3/api-docs). Catálogo sem token respondeu HTTP 401; não houve validação autenticada.

- `POST /auth/login`, `/auth/register`, `/auth/refresh`: `accessToken`, `refreshToken`, `expiraEm`, `refreshExpiraEm`, `usuario {id,nome,email,perfil}`.
- `GET /veiculos`, `/veiculos/:id`, `/veiculos/:id/versoes`, `/versoes/:id`, `/versoes/:id/especificacoes`, `/atributos/taxonomia`.
- Listas: array ou `{data: []}`; formato inválido gera erro, nunca lista vazia fictícia.
- `POST /comparacoes`: `referenceVersionId`, `competitorVersionIds` (uma versão), `attributeIds`. O perfil fixo `urban_premium` foi removido: o OpenAPI o declara opcional.
- Resultado: `id`, `rows`, `summary`. As linhas solicitadas ausentes são mantidas. Células devem incluir `versionId`; `fordValue`/`competitorValue` explícitos também são aceitos. Células apenas posicionais geram erro até o contrato garantir a ordem. Nenhuma troca silenciosa de colunas.
- Não há conversão automática de unidades: unidades diferentes não geram rótulo de vantagem/paridade. `0` e `false` são válidos, ausência é explícita. Percentuais de confiança não aparecem sem critério validado.

## Contrato confirmado: pesquisa livre individual

O OpenAPI agora publica `POST /fichas-tecnicas/consultar` com `{marca, modelo, versao, atributos: string[]}` (até 50 atributos). Retorna `versaoId`, identificação/ano/mercado, `consultadoEm` e `itens` na ordem dos pedidos. Cada item inclui `termoSolicitado`, identidade canônica quando reconhecida, valor formatado, unidade, fonte, data e estado `PRESENTE`, `NAO_INFORMADO`, `NAO_DISPONIVEL` ou `ATRIBUTO_DESCONHECIDO`. O valor já é formatado; não anexar a unidade novamente.

**Ainda não integrado no mobile.** Usar esse contrato real para a ficha individual; a proposta histórica de `/pesquisas` abaixo foi superada. Não foram inventados IDs para enviar em `attributeIds`. A comparação ainda documenta apenas IDs de atributos; pesquisa livre comparativa requer decisão de integração e validação.

## Paginação e metadados

Veículos, versões, taxonomia e especificações usam `page` (inicial 1), `pageSize` (padrão 25), `total` e `data`. O cliente atual lê somente a primeira página e descarta os metadados: falta carregar páginas adicionais para garantir catálogo/ficha completos.

`CellDto` confirma `versionId`, mas não declara status nem fonte/data por célula. `SpecValueDto` fornece `sourceLabel`, `evidenceIds` e `updatedAt`; este último não comprova data de coleta. Resolver proveniência com endpoints de fontes/especificações quando necessário, sem inventar metadados.

## Proposta histórica pendente: comparação livre

Proposta mínima a alinhar com o backend (não implementada na API): adicionar `requestedAttributes: [{ clientKey, name }]` às consultas individuais e comparações, preservando `attributeIds` existentes. O servidor normaliza nomes/sinônimos, retorna o `clientKey`, identidade canônica quando encontrada, categoria, valor, unidade, estado, fonte e data. Solicitações sem evidência retornam `not_informed` e permanecem na resposta. Limites, autorização, validação e deduplicação devem ser definidos pelo servidor. A UI de cadastro livre só deve ser ativada após essa integração funcionar de ponta a ponta.

## Verificação necessária

Testar login/refresh com conta de avaliação, permissões reais, respostas/estados e metadados, catálogo Raptor e integração de atributos livres. A existência do contrato não comprova o funcionamento desses fluxos. Não elevar permissões no cliente.

### Request/response propostos para revisão do backend

Os exemplos abaixo são **propostas, não endpoints disponíveis nem respostas observadas**. Os campos entre `<...>` devem receber identidades reais do catálogo. O `clientKey` correlaciona o pedido livre; não é enviado como `attributeId` inventado.

Consulta individual proposta: `POST /pesquisas`.

```json
{
  "versionId": "<id real da versão>",
  "attributeIds": ["<id real da taxonomia>"],
  "requestedAttributes": [
    { "clientKey": "pedido-1", "name": "Ajuste elétrico do banco do passageiro" }
  ]
}
```

Extensão proposta de `POST /comparacoes`:

```json
{
  "referenceVersionId": "<id real da versão Ford>",
  "competitorVersionIds": ["<id real da concorrente>"],
  "attributeIds": ["<id real da taxonomia>"],
  "requestedAttributes": [
    { "clientKey": "pedido-1", "name": "Ajuste elétrico do banco do passageiro" }
  ]
}
```

Linha proposta para um pedido sem evidência em ambas as versões:

```json
{
  "clientKey": "pedido-1",
  "attributeId": null,
  "canonicalName": "Ajuste elétrico do banco do passageiro",
  "category": "comfort",
  "cells": [
    {
      "versionId": "<id real da versão Ford>",
      "value": null,
      "unit": null,
      "status": "not_informed",
      "sourceLabel": null,
      "sourceUrl": null,
      "collectedAt": null,
      "notes": null
    },
    {
      "versionId": "<id real da concorrente>",
      "value": null,
      "unit": null,
      "status": "not_informed",
      "sourceLabel": null,
      "sourceUrl": null,
      "collectedAt": null,
      "notes": null
    }
  ]
}
```

Quando o servidor reconhecer um sinônimo, deve retornar a identidade canônica, sem perder o `clientKey` de cada solicitação. A implementação cliente deverá permitir editar/remover pedidos, normalizar espaços/acentos para detectar duplicatas exatas e confirmar equivalências semânticas apenas com o catálogo/servidor. A autorização de comparação permanece no backend; a proposta não cria privilégios novos.

Aceite da extensão: criar um pedido fora da taxonomia, enviá-lo no processamento real, receber a linha correspondente para cada versão mesmo sem evidência, editar/remover e repetir sem duplicação. Testar comprimento/quantidade máximos definidos pelo servidor, entradas inválidas, 403, falha de rede e conflito. Esses aceites continuam pendentes.
