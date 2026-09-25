# Sprint 3 — Mobile Development and IoT

Estado da versão **1.2.0**, atualizado em 25/09/2026. Escopo: Desafio 01 — Ford, sem declarar conclusão das demais disciplinas.

Fonte: `Ford_V2.pdf`, recebido em 21/09/2026, 21 páginas. As páginas 4–5 e 13 foram conferidas visualmente. A página 5 descreve a consulta livre e o caso Ranger Raptor; a página 13 exige os fluxos funcionais, identidade visual, organização/documentação, demonstração de todas as telas e APK instalado. Entrega indicada: 27/09. O vídeo de até seis minutos pertence à Sprint 4, página 19.

| Requisito | Implementação atual | Evidência e aceite restante |
| --- | --- | --- |
| Seleção real de veículos/versões | Seletores pesquisáveis, marca/modelo/ano/mercado/versão e validação Ford/concorrente. | Catálogo e navegação verificados; Raptor versus Hilux selecionadas corretamente no APK. |
| Atributos livres e ficha individual | Adicionar, editar e remover termos, deduplicar e preservar ausentes; até 50 atributos. Usa o endpoint real de ficha. | Leituras autenticadas Raptor/Hilux aprovadas; consulta livre no APK manteve o termo desconhecido e sua fonte expansível. |
| Catálogo e ficha completos | Paginação de veículos, versões, taxonomia e especificações; rejeição de respostas inconsistentes. | 42 testes no total e paginação real com múltiplas páginas aprovada. |
| Comparação | Autorização por `/comparacoes`, seguida das duas fichas para termos livres; identidades, unidades e estados preservados. | Perfil padrão negou a ação no APK com mensagem de permissão. Falta conta autorizada para validar resultado real. |
| Sessão e histórico | SecureStore, refresh compartilhado, proteção contra respostas de outra conta; snapshots por usuário e reabertura/exclusão. | Login real, restauração da sessão, logout persistente após reinício e histórico vazio verificados; histórico preenchido depende do resultado autorizado. Troca de conta/refresh reais ainda pendentes. |
| Ranger Raptor | Identidade BR/2024 real, 23 atributos consultados: 21 presentes e 2 não informados. | [Matriz e evidências](validacao-ranger-raptor.md); falta slide complementar para conferir todos os requisitos do avaliador. |
| Identidade visual | Tema claro azul/navy, quatro abas, controles compartilhados, fontes sob expansão e duas imagens geradas locais. | Telas públicas em três larguras/fonte ampliada; Início, catálogo, veículo, versão, histórico vazio e perfil autenticados verificados. |
| Código e README | Serviços de sessão, paginação, fichas e histórico separados; contrato e instruções atualizados. | TypeScript, lint, 42 testes e exports aprovados; avisos de dependências documentados em QA. |
| APK instalado | Release local assinado 1.2.0/code 3, usando Render; cota EAS cloud esgotada. | APK final instalado e aberto sem Metro/Expo Go; reinício restaurou a sessão. [Metadados e QA](qa-sprint-3.md). |
| Demonstração de todas as telas | Galeria separa versão atual e histórico; vídeo curto da consulta real no APK final disponível. | Evidência parcial: faltam conclusão/capturas do fluxo autorizado de comparação e histórico preenchido. |

A conta temporária de QA foi criada pelo cadastro normal com perfil `SOMENTE_LEITURA`, sem alterar permissões. Os checks diretos da API e os checks do APK são registrados separadamente. Não há modo demo nem dados fictícios no produto.

A configuração, geração do APK, instalação e aprovação dos fluxos são aceites distintos. A sprint permanece parcialmente validada enquanto faltarem a referência Raptor e a demonstração dos fluxos pendentes. Consulte [QA](qa-sprint-3.md), [revisão atual](revisao-sprint-3.md) e [contrato](contrato-api.md).

## Histórico resumido

A implementação 1.1.0, de 21/09, usava Railway; suas falhas de conexão e capturas públicas não descrevem a versão atual. A revisão `c3f6ba3` identificou paginação e atributos livres ainda ausentes. Esses pontos foram implementados em 1.2.0 com o contrato Render e testados; os aceites abertos são os da matriz acima.
