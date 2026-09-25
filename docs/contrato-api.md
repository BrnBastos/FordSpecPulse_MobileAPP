# Contrato da API — versão 1.2.0

Base: `https://ford-spec-pulse-api.onrender.com/api`. O [OpenAPI publicado](https://ford-spec-pulse-api.onrender.com/v3/api-docs) foi recuperado em 25/09/2026 (HTTP 200). Catálogo e consulta de ficha sem token responderam HTTP 401. Uma conta temporária de QA foi cadastrada pelo fluxo normal (HTTP 201), com perfil padrão `SOMENTE_LEITURA`. Foram validadas leituras autenticadas na API e, no APK final, login, navegação, consulta livre, restauração da sessão, logout persistente após reinício e negação da comparação pelo perfil padrão.

## Sessão e catálogo

- `POST /auth/login`, `/auth/register`, `/auth/refresh`: `accessToken`, `refreshToken`, `expiraEm`, `refreshExpiraEm`, `usuario {id,nome,email,perfil}`.
- `GET /veiculos`, `/veiculos/:id`, `/veiculos/:id/versoes`, `/versoes/:id`, `/versoes/:id/especificacoes`, `/atributos/taxonomia`.
- `POST /comparacoes`: `referenceVersionId`, `competitorVersionIds` (uma versão no app), `attributeIds` e `customerProfileId` opcional. O perfil fixo `urban_premium` foi removido.
- Resultado: `id`, `rows`, `summary`. O cliente conserva as linhas solicitadas ausentes e exibe somente os atributos selecionados. Células são associadas por `versionId`; valores explícitos `fordValue`/`competitorValue` também são aceitos. Células apenas posicionais geram erro.
- Não há conversão automática de unidades nem vantagem inferida de um número maior. `0` e `false` são valores válidos. Estados ausentes são explícitos; percentuais de confiança não são apresentados sem critério validado.

## Paginação implementada

Veículos, versões, taxonomia e especificações retornam `{data, page, pageSize, total}`, com página inicial 1 e tamanho padrão 25. `pagination.ts` carrega todas as páginas, respeitando um tamanho menor informado pelo servidor. Arrays e envelopes legados `{data: []}` continuam aceitos como respostas completas na primeira chamada.

O carregamento valida metadados inteiros, número e tamanho da página, total estável, quantidade esperada e identidades únicas. Página repetida, resposta truncada, mudança de total/tamanho ou falha de rede gera erro; uma lista parcial não é devolvida como completa. Há um limite explícito de 1.000 páginas. A operação inteira verifica a sessão, impedindo combinar dados de contas diferentes. Especificações de outra versão são rejeitadas.

Na API real, foram encontrados 8 veículos, uma versão por veículo e 23 atributos. A paginação foi exercitada com tamanhos menores: veículos em três páginas (3/3/2), taxonomia em três (10/10/3) e especificações de cada uma das 8 versões em três (10/10/3). Os metadados e identidades corresponderam ao contrato, sem duplicações. As 16 consultas diretas de veículo/versão preservaram a identidade dos registros listados.

## Consulta livre implementada

`POST /fichas-tecnicas/consultar` recebe os nomes reais da seleção e até 50 atributos:

```json
{
  "marca": "<marca do catálogo>",
  "modelo": "<modelo do catálogo>",
  "versao": "<nome da versão do catálogo>",
  "atributos": ["Ajuste elétrico do banco do passageiro"]
}
```

Retorna `versaoId`, `marca`, `modelo`, `versao`, `anoModelo`, `mercado`, `consultadoEm` e `itens`. Cada item informa `termoSolicitado`, identidade canônica quando reconhecida, `valor` já formatado, unidade, fonte, data e estado. O cliente não anexa novamente a unidade ao valor formatado.

| Estado da API | Tratamento no app |
| --- | --- |
| `PRESENTE` | Valor confirmado; fonte e data quando fornecidas. |
| `NAO_INFORMADO` | Mantém a solicitação sem inventar valor. |
| `NAO_DISPONIVEL` | Indica ausência de especificação cadastrada; não comprova ausência do equipamento. |
| `ATRIBUTO_DESCONHECIDO` | Identifica atributo não reconhecido e conserva o pedido. |

É possível adicionar, editar e remover termos na ficha e na comparação. A seleção normaliza espaços, acentos e caixa para deduplicação; nomes e sinônimos conhecidos são associados à taxonomia. O limite combinado é de 50 atributos. Respostas são correlacionadas por `termoSolicitado`, independentemente da ordem; pedidos omitidos permanecem como não informados. Itens duplicados, extras, estados desconhecidos ou valores inválidos geram erro.

### Identidade da versão

O endpoint de ficha recebe nomes, sem parâmetros de ano ou mercado. Por isso, o cliente exige que marca, modelo, versão, ano e mercado retornados correspondam à seleção completa, além do vínculo entre versão e veículo. Se o ID selecionado for UUID, `versaoId` também deve ser idêntico. Quando o catálogo usa um slug e a ficha retorna UUID, a equivalência depende da identidade completa; não é aceita apenas pela semelhança do nome.

Uma resposta para outro ano/mercado é rejeitada. A desambiguação real desses casos ainda deve ser validada; se o servidor não resolver a seleção correta, precisará aceitar um identificador inequívoco ou filtros adicionais.

As fichas reais de Ranger Raptor e Hilux, ambas BR/2024, responderam HTTP 200 e confirmaram a combinação slug no catálogo/UUID na ficha, com identidade completa coincidente. A Raptor retornou 21 atributos presentes e 2 não informados; a Hilux, 23 presentes. Dois termos adicionais fora da taxonomia foram preservados como `ATRIBUTO_DESCONHECIDO` em ambas. A evidência da Raptor está em [Validação Ranger Raptor](validacao-ranger-raptor.md). Esses testes de leitura não substituem a conferência das telas e da comparação autorizada no APK.

Na interface Android, o termo “banco massageador” foi adicionado e consultado na Raptor; permaneceu visível como “Não informado” / “Atributo não reconhecido”. Categorias em português e expansão dos dados de fonte/data também foram verificadas no artefato final.

### Comparação de termos livres

O app primeiro valida a seleção Ford/concorrente e chama `POST /comparacoes` com IDs reais da taxonomia. Somente após a resposta autorizada consulta as duas fichas reais, uma por versão, e acrescenta as linhas dos termos livres ao resultado local. Um HTTP 403 interrompe o fluxo antes das consultas de ficha; a permissão de comparação continua sendo aplicada pelo backend.

Para uma seleção composta somente de termos livres, o POST envia `attributeIds: []`. O OpenAPI permite esse array sem mínimo e não o declara obrigatório. O APK enviou essa seleção para Raptor versus Hilux, mas o perfil `SOMENTE_LEITURA` recebeu a negação de permissão, exibida como “Seu perfil não tem permissão para esta ação.”. A operação bem-sucedida dessa combinação ainda exige conta autorizada. Nenhum ID artificial é enviado. `requestedAttributes` e as chaves `requested:<termo>` pertencem à seleção/histórico local; não são extensões inventadas do contrato de comparação.

A paridade entre termos livres exige o mesmo código canônico, ambos os valores confirmados e igualdade de unidade e valor. Nos demais casos, a diferença permanece indeterminada. O resumo é limitado aos atributos consultados, sem conclusões do servidor sobre atributos fora da seleção. Falhas em uma das fichas impedem apresentar a comparação como concluída. O histórico local conserva o resultado completo, inclusive os termos livres.

## Proveniência e validação restante

`CellDto` confirma `versionId`, mas não declara status nem fonte/data por célula. `SpecValueDto` fornece `sourceLabel`, `evidenceIds` e `updatedAt`; este último não comprova data de coleta. A ficha livre usa `fonte` e `dataCaptura` quando presentes. O app não fabrica metadados ausentes.

Os 42 testes automatizados cobrem o contrato cliente, paginação, consulta livre, sessão e histórico com respostas controladas. Leituras reais, consulta livre nativa, negação da comparação pelo perfil padrão, restauração da sessão e logout persistente foram verificados. Ainda faltam o resultado comparativo com conta autorizada, histórico preenchido, troca de conta/refresh reais, demonstração completa e a referência complementar da Ranger Raptor. O perfil não foi elevado para contornar restrições. Os registros de interface, permissões, vídeo parcial e instalação final estão em [QA da Sprint 3](qa-sprint-3.md).

As propostas anteriores de `POST /pesquisas` e de novos campos livres no POST de comparação foram superadas pela integração dos endpoints publicados descrita acima; não são requisitos do cliente atual.

### Disponibilidade e renovação de sessão — 1.2.1

Em 25/09, OpenAPI respondeu HTTP 200 no computador e no Android. Uma resposta inicial levou 16,61 s; o timeout comum é agora 30 s. O refresh da sessão de avaliação retornou HTTP 422: o cliente limpa essa sessão e volta ao login. Falhas temporárias (rede, timeout e 5xx) preservam a sessão; seus erros não são mais convertidos indevidamente em cancelamento. A rotação bem-sucedida de refresh permanece um aceite separado.
