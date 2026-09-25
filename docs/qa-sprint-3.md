# QA — Sprint 3

Data: 21/09/2026. Base: `647cc0778ff49645f303cf62766fc5aec026bff3`, branch `develop`, alterações locais desta implementação. Não representa aprovação completa da sprint.

## Revisão de 25/09/2026

TypeScript, lint e os 20 testes passaram novamente no checkout atual. OpenAPI Render: HTTP 200; catálogo sem autenticação: HTTP 401. A indisponibilidade registrada em 21/09 refere-se à URL Railway. Ver [pendências atualizadas](revisao-sprint-3.md).

O APK abaixo pertence à implementação de 21/09 e usa Railway. O código/configuração atuais usam Render; **nova build e validação são pendentes**. O manifesto antigo é preservado como evidência daquele artefato e acusa divergência em `eas.json` e `src/services/auth.ts`, esperada após a troca de URL.

## Checks locais

| Verificação | Resultado |
|---|---|
| Instalação reproduzível (`npm ci`) | Aprovada, 869 pacotes instalados |
| TypeScript (`npm run typecheck`) | Aprovado |
| ESLint (`npm run lint`) | Aprovado, sem desabilitar regras |
| Comportamento (`npm test`) | 20 testes aprovados; adapters, estado, sessão e histórico; adapters nativos de armazenamento substituídos somente no runner de testes |
| Export web (`expo export --platform web`) | Aprovado; 17 rotas geradas. Não substitui validação Android |
| Bundle Android (`expo export`) | Aprovado; Hermes bundle gerado |
| `git diff --check` | Aprovado |
| Expo Doctor | 20/22; avisos de versões instaladas e regressão de memória Hermes no SDK 56 |
| `expo install --check` | Avisos de patches/minor recomendados; versões existentes preservadas |

Auditoria do lockfile: as versões de todas as dependências de produção preexistentes foram preservadas; a única adição de produção é `expo-secure-store 56.0.4`.

O Expo Doctor recomenda SDK 57/RN 0.86 para a correção Hermes. Não foi aplicada essa migração fora do escopo SDK 56. O ESLint foi fixado em `eslint-config-expo ~56.0.4` após detectar instalação inicial de configuração SDK 57.

## Matriz funcional

| Caso | Evidência atual | Resultado |
|---|---|---|
| Seleção e invalidação | Teste de troca de seleção mantendo concorrente/atributos | Aprovado em unidade; seleção real pendente |
| Identidade de células | Ordem invertida preserva Ford/concorrente; sem IDs rejeitado | Aprovado |
| Valores e unidade | Zero, false, null, conflito e unidades incompatíveis | Aprovado |
| Refresh | Timeout preserva sessão; concorrência faz um refresh; 401 limpa sessão | Aprovado com transporte de teste |
| Migração segura | Tokens migrados para SecureStore e removidos do storage legado | Aprovado com adapters nativos de teste |
| Persistência indisponível | Erro de gravação propagado; análise não aparece salva | Aprovado |
| POST duplicado | 401 não reenvia a comparação automaticamente | Aprovado |
| Logout | Refresh tardio não restaura sessão | Aprovado com transporte de teste |
| Histórico | Duas análises, deduplicação, reabertura, exclusão e conta B isolada | Aprovado com storage de teste |
| Histórico inválido | JSON corrompido e autoria divergente rejeitados | Aprovado |
| Login/cadastro real | Sem conta de avaliação fornecida; API indisponível | Pendente |
| Permissão 403 | Mensagem implementada, sem bypass | Integração pendente |
| Atributo livre | Extensão proposta; nenhuma implementação fictícia | Bloqueado por API |
| Ranger Raptor | Slide complementar e identidade na API ausentes | Bloqueado |
| Fluxo real comparação → salvar → reiniciar → reabrir | Depende de autenticação/API | Pendente |
| Capturas de todas as telas autenticadas | Depende do fluxo real | Pendente |

A aparência inicial não foi capturada antes das alterações. O browser de validação não pôde ser conectado neste ambiente; screenshots finais devem vir do APK no emulador.

## Android

Ambiente disponível: AVD Pixel_9, Android 16/API 36, arm64; resolução inicial 1080×2424 e densidade 420 (aproximadamente 411 dp). Sem dispositivo físico conectado.

Projeto EAS criado e vinculado de fato: `429a726f-9a7d-41d5-83f0-04218a0113c2`, conta `bbastos`. Perfil `sprint3`, pacote `com.brnbastos.fordspecpulse`, versão 1.1.0 / código 2.

Build anterior concluída (Railway): `0086b06a-1af3-4433-9d1e-606eec6190db` — [EAS](https://expo.dev/accounts/bbastos/projects/FordSpecPulse_Mobile/builds/0086b06a-1af3-4433-9d1e-606eec6190db).

[Baixar APK 1.1.0](https://expo.dev/artifacts/eas/dya-EUsGruyITWRiJCgos_F4zR6_hPlEK6NBXQkKpkI.apk). Cópia local: `artifacts/FordSpecPulse-1.1.0.apk` (ignorada pelo Git).

SHA-256: `488edeaf363067e74bb68451fa801589edf32adf55583f89638b818471eb23f6`.

O manifesto `release-source.sha256` identifica os 56 arquivos de runtime/configuração/assets enviados; verificado contra o checkout em 21/09, antes da alteração para Render. Executar `shasum -a 256 -c docs/release-source.sha256`. O manifesto identifica o runtime do APK anterior; o commit desta revisão contém a configuração Render posterior. Documentação e capturas posteriores não alteram o runtime.

Instalação limpa e abertura verificadas no Android 16, com Metro parado, sem porta 8081 e sem processo Expo Go. Login/cadastro e botões desabilitados com campos vazios foram verificados em 360 dp (densidade 480, fonte 1.3), 393 dp (440, fonte 1.0) e 412 dp (419, fonte 1.0). Cadastrar permanece acessível após rolagem com teclado aberto. Voltar dispensa o teclado; “Já tenho conta” retorna ao login. Capturas e resultados estão na [galeria](screenshots/README.md). Densidade e escala de fonte originais restauradas após os testes.

As builds intermediárias foram substituídas; a build identificada acima preserva a evidência de 21/09, mas precisa ser substituída para usar Render. A barra de status foi corrigida após a primeira instalação. Uma tentativa de login com dados de teste na build intermediária apresentou erro de conexão e reabilitou o botão; não comprova login real na build final. Nenhum cadastro de teste foi enviado.

Metadados do APK final em `apk-metadata.txt`: pacote e versão corretos, minSdk 24, targetSdk 36, ABIs arm64-v8a, armeabi-v7a, x86 e x86_64. As permissões herdadas dos módulos Expo incluem rede, vibração, armazenamento externo limitado a SDK 32, SYSTEM_ALERT_WINDOW e biometria; nenhuma solicitação de permissão apareceu nos fluxos públicos.

Abertura a frio também verificada com Wi-Fi e dados móveis desligados: o login renderiza sem conexão. Conectividade restaurada após o teste.

Geração, instalação e telas públicas verificadas. Fluxos autenticados, demonstração completa e novo APK Render permanecem pendentes.

## Roteiro de validação restante

1. Usar o OpenAPI Render recuperado, integrar paginação/atributos livres e obter conta de avaliação com permissão real.
2. Integrar `/fichas-tecnicas/consultar` no cliente e definir a comparação livre; validar ausência explícita.
3. Conferir todos os atributos do slide Raptor com versão/ano/mercado corretos.
4. Gerar e instalar novo APK Render; entrar; consultar; comparar; salvar duas análises; fechar/abrir; reabrir/excluir; trocar conta.
5. Repetir em larguras 360, 393 e 412 dp, fonte ampliada, teclado e botão voltar; capturar telas reais e erros/vazios.
6. Gravar a demonstração completa das telas após validar a integração; artefato e SHA-256 já registrados acima.
