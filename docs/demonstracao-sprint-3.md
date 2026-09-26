# Demonstração — Sprint 3

Aplicativo **1.2.1 / código Android 4**, capturado em 26/09/2026 no Pixel_9 / Android 16, sem Metro ou Expo Go. A galeria cobre as dez telas de conteúdo exigidas pela demonstração visual da página 13 do PDF. Todas as capturas abaixo usam o APK final, SHA-256 `83cfa9d02fcfcce47fc7b74cdc337e40303090055d87365ff3b6012c51444af0`.

## Percurso por tela

| Ordem | Tela / ação | Captura real |
|---:|---|---|
| 1 | Login após sair e reiniciar | [Login](screenshots/1.2.1-final/login.png) |
| 2 | Cadastro, sem enviar novo usuário | [Cadastro](screenshots/1.2.1-final/cadastro.png) |
| 3 | Início autenticado | [Início](screenshots/1.2.1-final/inicio.png) |
| 4 | Catálogo de veículos | [Veículos](screenshots/1.2.1-final/veiculos.png) |
| 5 | Detalhe da Ranger Raptor | [Veículo](screenshots/1.2.1-final/veiculo-raptor.png) |
| 6 | Versão e ficha técnica | [Ficha](screenshots/1.2.1-final/ficha-raptor.png) |
| 7 | Seleção de Ford, concorrente e atributos | [Comparar](screenshots/1.2.1-final/comparar-selecao.png), [Seletor](screenshots/1.2.1-final/seletor-area-segura.png), [Termo livre](screenshots/1.2.1-final/comparar-livre-selecao.png) |
| 8 | Resultado real, valores, estados e fontes | [Misto](screenshots/1.2.1-final/comparacao-resultado.png), [Fontes e ausências](screenshots/1.2.1-final/comparacao-fontes.png), [Somente livre](screenshots/1.2.1-final/comparacao-livre.png) |
| 9 | Histórico, persistência, reabertura e exclusão | [Duas análises](screenshots/1.2.1-final/historico-duas.png), [Após reinício](screenshots/1.2.1-final/historico-reinicio.png), [Reaberta](screenshots/1.2.1-final/historico-reaberto.png), [Após excluir uma](screenshots/1.2.1-final/historico-exclusao.png) |
| 10 | Perfil da conta de avaliação | [Perfil](screenshots/1.2.1-final/perfil.png) |

Os arquivos `_layout` são contêineres de navegação, não telas adicionais. Resolução: 1080 × 2424 px, densidade 420, fonte 1.15, navegação por gestos. A revisão não equivale a testar todas as telas em todas as larguras ou no iOS.

## Resultado do percurso

A conta original de avaliação foi usada com autorização explícita do responsável. Raptor BR/2024 e Hilux SRX BR/2024 foram comparadas com torque e “banco massageador”. A API retornou 583 Nm e 500 Nm para torque; o termo desconhecido permaneceu explícito nas duas versões. A comparação somente livre também passou. Duas análises foram salvas, persistiram após encerramento/reinício, uma foi reaberta e uma excluída individualmente. Logout persistiu após novo reinício.

A demonstração visual está completa; a conferência exata dos atributos contra o slide complementar Ranger Raptor continua pendente, pois essa referência não foi fornecida. [QA](qa-sprint-3.md) · [Entrega](entrega-sprint-3.md).

A [prévia gravada na 1.2.0](../artifacts/FordSpecPulse-1.2.0-consulta.mp4) cobre apenas consulta e é histórica. A galeria acima é a demonstração atual; não se trata de um vídeo completo. O limite de seis minutos do PDF pertence à Sprint 4.
