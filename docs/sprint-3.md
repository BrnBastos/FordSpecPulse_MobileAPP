# Sprint 3 — Mobile Development and IoT

Base auditada: branch `develop`, commit `647cc0778ff49645f303cf62766fc5aec026bff3`, árvore inicialmente limpa. Escopo: Desafio 01, sem declarar conclusão das demais disciplinas.

Fonte: `Ford_V2.pdf`, recebido em 21/09/2026, 21 páginas. Páginas 4–5 e 13 conferidas visualmente; página 5 exige atributos livres e Ranger Raptor; página 13 exige APK instalado e demonstração de todas as telas. Entrega 27/09; vídeo de até seis minutos pertence à Sprint 4 (página 19).

| Requisito | Estado inicial | Implementação / situação | Prioridade | Evidência de aceite | Dependência externa |
|---|---|---|---|---|---|
| Seleção real | Primeiro Ford/concorrente | Seletores pesquisáveis marca/modelo/versão, invalidação de resultado, validação no envio | P0 | Testes de estado; integração pendente | Catálogo API |
| Atributos livres | Apenas taxonomia | Busca/agrupamento; extensão contratual documentada, processamento livre bloqueado | P0 | `contrato-api.md` | Backend acessível e contrato |
| Ficha individual | Todos os dados sem filtro | Seleção de atributos e retenção de ausentes | P0 | Testes `requestedSpecifications` | Dados reais |
| Dados honestos | Mocks silenciosos | Mocks removidos; erros/retry; comparação sem identidade falha explicitamente | P0 | Testes de adapters | Contrato real de células |
| Sessão | AsyncStorage / timeout encerrava sessão | SecureStore, migração, refresh único, descarte de resposta tardia, navegação reativa | P0 | Testes de refresh/logout | Validação Android e conta |
| Ranger Raptor | Limited+/XLT em mocks | Nenhuma substituição; matriz pendente | P0 | `validacao-ranger-raptor.md` | Slide de referência e API |
| Permissões | README com conta administrativa | Sem bypass; mensagens 401/403; credenciais públicas removidas | P0 | Testes locais e inspeção | Conta de avaliação adequada |
| Android APK | Sem pacote/perfil | Pacote `com.brnbastos.fordspecpulse`, perfil `sprint3` | P0 | Build, instalação e fluxo registrados separadamente em QA | EAS/assinatura/API |
| Histórico | Um registro global | Coleção versionada por usuário, reabertura, deduplicação, exclusão | P1 | Testes de persistência/isolamento | Validação de reinício Android |
| UI | Template, textos técnicos, confiança sem critério | Quatro abas; Perfil no Início; tema claro; controles compartilhados; percentuais removidos das fichas/resultados | P1 | Login/cadastro capturados; demais telas pendentes | API/conta para telas autenticadas |
| Documentação | MVP e credenciais | README e matriz atualizados com pendências reais | P1 | Arquivos `docs/` | Evidências finais |

## Revisão de 25/09/2026

A API Render responde (OpenAPI 200, catálogo sem token 401). O contrato agora oferece consulta individual com atributos livres, ainda não integrada. Também foi identificada paginação não consumida pelo cliente (primeira página de 25 itens). O APK existente usa Railway e requer substituição. A matriz acima descreve a implementação inicial; estes achados atualizam suas dependências e mantêm os P0 abertos. Detalhes e próximos passos em [revisao-sprint-3.md](revisao-sprint-3.md).

## Auditoria externa de 21/09/2026

- `/v3/api-docs`: HTTP 502 (Application failed to respond).
- `/api/veiculos`: timeout após 15 segundos; nenhuma resposta HTTP.
- Nenhum backend Java localizado na árvore FIAP pesquisada. Consulta pública dos 31 repositórios da conta `BrnBastos` também não encontrou backend Ford/SpecPulse; apenas o aplicativo mobile. Isso não exclui repositórios privados ou de outros integrantes.
- Expo CLI: conta autenticada `bbastos`; nenhum projectId no checkout inicial. Projeto criado em `bbastos`, ID `429a726f-9a7d-41d5-83f0-04218a0113c2`; chave Android gerada no EAS.
- Android SDK 36 e AVD Pixel_9 disponíveis, inicialmente nenhum dispositivo iniciado.

Não marcar entrega como concluída enquanto houver P0 aberto. A configuração de build, a geração do APK e a validação do fluxo no APK são aceites diferentes.
