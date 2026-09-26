# Revisão da entrega — 26/09/2026

Versão **1.2.1 / código Android 4**, aplicação no commit `0aaf14e`. Requisitos do PDF e cenários adicionais do prompt estão separados na [matriz da sprint](sprint-3.md).

## Concluído

- Seleção real de veículos/versões; termos livres editáveis; fichas padronizadas com ausências explícitas e fontes disponíveis.
- Paginação dos quatro catálogos, validação de identidade e autorização da comparação preservada.
- Histórico por usuário, com snapshots, reabertura e exclusão implementados.
- Quatro ilustrações geradas, sete logos, fotografias Ford, imagens proporcionais e áreas seguras nativas.
- Tratamento do refresh rejeitado com HTTP 422 e preservação da sessão em falhas temporárias; timeout de 30 segundos.
- TypeScript, lint e 42 testes aprovados. APK assinado instalado no Android 16, com checksum e manifesto das fontes registrados.
- Documentação atualizada, [roteiro de demonstração](demonstracao-sprint-3.md) e [instruções de entrega](entrega-sprint-3.md).

## Evidência e limites

As consultas reais anteriores retornaram oito veículos, oito versões e 23 atributos. A ficha Raptor tem 21 valores presentes e dois consumos não informados. A consulta livre manteve pedidos não reconhecidos. Login, consulta, restauração de sessão, logout e negação de comparação foram registrados na versão 1.2.0.

Na 1.2.1, foram verificados escala de imagens, áreas seguras, navegação por gestos/três botões, fonte ampliada e teclado. O APK final retornou ao login após rejeição do refresh. Em 26/09, a conta original de avaliação autorizada permitiu repetir o percurso no APK final: comparação mista e somente livre, duas análises salvas, reinício, reabertura, exclusão individual e logout. A galeria atual cobre as dez telas.

## Pendências para concluir o aceite do PDF

| Pendência | Dependência concreta | Trabalho necessário |
|---|---|---|
| Conferência exata da Ranger Raptor | Slide complementar com atributos, versão, ano e mercado de referência. | Confrontar cada item com a saída real e corrigir eventuais divergências na origem dos dados. |

O cadastro normal anterior forneceu perfil `SOMENTE_LEITURA`; a validação atual usou a conta de avaliação existente, sem elevar permissões. A referência complementar não foi localizada nos arquivos Ford examinados. Nenhum dado fictício foi acrescentado para preencher evidências ausentes.

Detalhes: [QA](qa-sprint-3.md), [contrato](contrato-api.md) e [validação Raptor](validacao-ranger-raptor.md).
