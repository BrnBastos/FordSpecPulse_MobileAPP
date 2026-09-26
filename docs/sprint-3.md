# Sprint 3 — Mobile Development and IoT

Versão **1.2.1 / código Android 4**, revisada em 26/09/2026. Código do aplicativo: commit `0aaf14e`. Escopo: Desafio 01 do `Ford_V2.pdf`, páginas 5 e 13.

## Requisitos expressos no PDF

| Requisito | Página | Implementação e evidência | Aceite restante |
|---|---:|---|---|
| Entrada com marca, modelo, versão e atributos definidos livremente | 5 | Seletores pesquisáveis e inclusão/edição/remoção de termos; consulta individual real verificada. | Percurso final aprovado em 26/09, incluindo comparação mista e somente livre. |
| Lista técnica padronizada, comparável e com ausências explícitas | 5 | Fichas com identidade, valores, unidades, estados e fontes; paginação completa; `0` e `false` preservados. | Conferir a cobertura dos atributos da referência Raptor. |
| Validação com as especificações do slide Ranger Raptor | 5 | Inventário real BR/2024 com 23 atributos, 21 presentes e 2 não informados. | **Pendente:** obter o slide de referência e confrontar todos os itens. |
| Aplicação final com os fluxos do desafio funcionando | 13 | Consulta, seleção, comparação e histórico implementados; 42 testes aprovados. | Comparação real, salvar/reiniciar/reabrir/excluir e logout aprovados no APK final. |
| Identidade visual consistente | 13 | Componentes compartilhados, tema Ford, quatro ilustrações geradas, sete logos, fotos Ford, escala das imagens e áreas seguras. | Dez telas e seletor conferidos no Android 16; evidências na galeria final. |
| Código organizado, README completo e demonstração visual de todas as telas | 13 | README, serviços separados, galeria e [roteiro por tela](demonstracao-sprint-3.md). | [Galeria final](demonstracao-sprint-3.md) completa com as dez telas, resultado real e histórico preenchido. |
| APK final via EAS ou equivalente, instalado e executado | 13 | APK assinado 1.2.1, build local equivalente, instalado no Android 16 sem Metro/Expo Go; checksum e fontes verificados. | Arquivo preparado para entrega conforme o canal da disciplina. |

[QA e evidências](qa-sprint-3.md) · [Raptor](validacao-ranger-raptor.md) · [Entrega](entrega-sprint-3.md).

## Cenários adicionais do prompt de implementação

Salvar duas análises, reiniciar/reabrir/excluir, testar troca de conta e refresh são cenários de aceite definidos no prompt de implementação. Não são itens literais da página 13. Ajudam a verificar os fluxos que o produto oferece.

O PDF pede APK e demonstração visual, mas não exige hospedagem pública, publicação na Play Store, validação iOS ou um vídeo de seis minutos para esta sprint. O vídeo de até seis minutos pertence à Sprint 4, página 19.

A conta usada anteriormente recebeu `SOMENTE_LEITURA` no cadastro normal e a comparação retornou HTTP 403. Não houve alteração de permissões nem simulação de resultados. Em 26/09, a conta original de avaliação foi autorizada pelo responsável e concluiu os fluxos de comparação e histórico no APK final.
