# Revisão da tarefa — 25/09/2026

Escopo desta revisão: conferir a implementação existente contra o prompt Sprint 3 e registrar o estado antes do commit. Preservada a alteração local da URL Railway para Render. Sem modo demo, novos cadastros ou alteração de permissões. Não é aprovação final da sprint.

## Pendências confirmadas

| Prioridade | Falta | Evidência e próximo passo |
|---|---|---|
| P0 | Atributos livres na ficha e comparação | `AttributePicker` permite somente taxonomia. OpenAPI agora publica `POST /api/fichas-tecnicas/consultar`, com termos livres e estados explícitos. Integrar a consulta individual, edição/remoção/deduplicação e decidir o caminho da comparação livre (o POST de comparação ainda recebe IDs). |
| P0 | Catálogo/ficha completos além da primeira página | `unwrapData` em `specpulseApi.ts` descarta `page`, `pageSize` e `total`. Os quatro endpoints de listas usam página 1 e tamanho 25 por padrão. Implementar paginação para veículos, versões, atributos e especificações e testar conjuntos maiores que uma página. |
| P0 | Validação autenticada e permissões | Render responde: `/v3/api-docs` HTTP 200; `/api/veiculos` sem token HTTP 401. Falta conta de avaliação. Testar login/refresh, consulta/comparação, 403, salvar duas análises, reiniciar, reabrir/excluir e trocar conta. Não houve uso de credenciais administrativas nem cadastro nesta revisão. |
| P0 | Ranger Raptor exata | Falta referência complementar e consulta autenticada para identificar ano/mercado/versão. Exemplos do OpenAPI não comprovam dados. Conferir todos os atributos do material do avaliador. |
| P0 | APK correspondente ao código atual | Build `0086b06a-1af3-4433-9d1e-606eec6190db` incorpora Railway; checkout usa Render. O manifesto antigo diverge em `eas.json` e `src/services/auth.ts`. Gerar novo APK após integrar/validar pendências e repetir instalação/fluxos, registrando hash e commit. |
| P1 | Evidências das telas autenticadas | Galeria atual cobre apenas login/cadastro/teclado. Capturar telas, estados de erro/vazio/seleção e demonstração completa com dados reais. |

## Verificações realizadas

- Leitura do prompt original, instruções `AGENTS.md`, matriz, contrato e documentação de QA.
- Inspeção dos serviços/adapters, sessão, histórico, seleção, resultado e configuração de entrega.
- OpenAPI real consultado: células possuem `versionId`; `customerProfileId` é opcional; consulta livre individual disponível; paginação documentada.
- `npm run typecheck`, `npm run lint`, `npm test`: aprovados (20 testes).
- Os checks anteriores de Expo Doctor mantêm dois avisos documentados; não foram executados novamente nesta revisão.
- Manifesto do APK anterior preservado sem recalcular hashes para mascarar a diferença de runtime.

O commit registra a implementação e estas lacunas. Não houve nova build nem teste autenticado nesta revisão; os artefatos de 21/09 continuam sendo evidência apenas daquele APK.
