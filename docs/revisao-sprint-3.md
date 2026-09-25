# Revisão da tarefa — 25/09/2026

A versão **1.2.0 / código Android 3** implementa o plano: atributos livres, paginação completa e duas imagens geradas discretas. O APK local assinado usa Render. TypeScript, lint, 40 testes e exports Android/web foram aprovados.

## O que foi concluído

- Inclusão, edição, remoção e deduplicação de termos na ficha e comparação, até 50 atributos. Dados ausentes ou desconhecidos permanecem visíveis.
- Comparação com autorização do endpoint existente antes de consultar as duas fichas. `attributeIds: []` é permitido pelo esquema para seleção somente livre; sua operação autorizada ainda precisa de evidência nativa.
- Identidade completa de marca/modelo/versão/ano/mercado, com tratamento dos IDs slug/UUID; preservação de estados, valores, unidades e fontes disponíveis.
- Paginação de todos os quatro endpoints, sem devolver respostas truncadas, repetidas ou misturadas entre contas.
- Imagens locais no cabeçalho do login e histórico vazio; seleção compacta com busca, chips e expansão.
- Build local release após esgotamento da cota EAS cloud. Artefato, assinatura e manifestação das fontes em [QA](qa-sprint-3.md).

## Evidências reais

Uma conta temporária foi cadastrada pelo fluxo normal, com perfil padrão `SOMENTE_LEITURA`, sem alteração de permissões. A API retornou 8 veículos, 8 versões e 23 atributos. As 16 consultas diretas preservaram as identidades; paginação de veículos, taxonomia e especificações foi exercitada em múltiplas páginas.

As fichas da Ranger Raptor e Hilux BR/2024 responderam HTTP 200. A Raptor tem 21 valores presentes e dois consumos não informados; termos adicionais desconhecidos permaneceram na resposta. O [inventário Raptor](validacao-ranger-raptor.md) preserva as 23 linhas e evidências sanitizadas; a referência do avaliador continua ausente.

No APK, as telas públicas de login/cadastro, teclado/Voltar e botões vazios foram verificadas em 360/393/412 dp, incluindo fonte ampliada. Login real, Início, catálogo, veículo, versão, histórico vazio e perfil funcionaram. A consulta livre de “banco massageador” preservou o pedido como não reconhecido, com fonte expansível. A seleção Raptor versus Hilux foi mantida; gerar comparação com o perfil padrão apresentou “Seu perfil não tem permissão para esta ação.”, sem contornar a restrição.

O APK final foi instalado com sucesso e o reinício a frio restaurou a sessão. Logout seguido de encerramento forçado/reinício permaneceu no login; a negação da comparação somente livre foi repetida neste mesmo artefato. Categorias em português, fontes/datas, perfil traduzido e catálogo compacto foram conferidos; as capturas finais correspondentes foram atualizadas. Essa verificação autenticada não amplia os testes de três larguras para todas as telas internas. Um vídeo curto da consulta real foi gravado, como evidência parcial.

## Aceites ainda abertos

| Item | Próximo passo |
| --- | --- |
| Comparação autorizada no APK | Fornecer uma conta com permissão de comparação para testar resultado real, inclusive termos livres/mistos e `attributeIds: []`. Consulta livre e negação do perfil padrão já foram verificadas. |
| Histórico preenchido e sessão | Salvar duas análises reais, reiniciar, reabrir/excluir e confirmar isolamento entre contas e refresh real. Restauração da sessão e logout persistente após reinício aprovados; os testes automatizados cobrem as demais proteções. |
| Ranger Raptor versus referência | Receber o slide complementar e conferir todos os atributos requeridos, além de confirmar a equivalência com o caso BR/2024 encontrado. |
| Demonstração de todas as telas | Completar capturas de resultado e histórico preenchido e a demonstração integral com conta autorizada. O APK final já foi instalado e verificado, com hash registrado em QA. |

Os detalhes do contrato estão em [contrato-api.md](contrato-api.md). A API acessível e o APK instalado não substituem esses aceites.

## Histórico

A revisão `c3f6ba3` tinha 20 testes e encontrou atributos livres e paginação incompletos; ambos foram implementados nesta etapa. O APK 1.1.0 de 21/09 usava Railway e permanece apenas como evidência histórica. A entrega atual é 1.2.0/Render; não houve modo demo, alteração de perfil ou commit nesta etapa.
