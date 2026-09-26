# QA — Sprint 3 / versão 1.2.1

Documentação revisada em 26/09/2026; verificações de execução realizadas em 25 e 26/09/2026. Branch `develop`, implementação posterior à revisão `c3f6ba3`. O código e o APK atual usam Render. Este documento separa testes automatizados, consultas diretas à API e verificações no aplicativo; não declara aprovação integral da sprint.

## Atualização 1.2.1 — imagens e áreas seguras

- Sete logos do catálogo em cartões, detalhes e seletores; nomes permanecem em texto e marcas sem logo usam fallback neutro.
- Fotos Ranger/Raptor nas páginas correspondentes e dois novos banners gerados em Início/Comparar. Assets locais e créditos em [assets.md](assets.md).
- Corrigida a altura intrínseca de `Image`: frames 3:1 para banners; fotos preservam proporção com limite de 240 dp. Imagens internas têm largura e altura explícitas de 100%, usando `contain`.
- Áreas seguras no topo e na base; abas reservam o inset inferior e ajustam a altura ao tamanho do texto. Seletores medem os insets na própria janela modal.
- API pública verificada às 17:55 BRT de 25/09: OpenAPI HTTP 200 (16,61 s); revisão às 18:07 BRT: `/api/veiculos` sem credenciais HTTP 401 (0,26 s), OpenAPI HTTP 200 (0,27 s). Timeout comum elevado de 6 para 30 s. [Evidência](evidence/api-availability-2026-09-25.json).
- Refresh rejeitado com HTTP 422 limpa a sessão inválida; erros temporários preservam a sessão e o motivo original. O erro genérico de conexão reproduzido no emulador vinha desse refresh. A build final foi instalada e o retorno ao login após HTTP 422 foi confirmado nativamente.
- TypeScript, lint e 42 testes aprovados. Navegação por gestos e três botões verificada no Android 16 com aproximadamente 412 dp e fonte 1.3. Login, cadastro e ações alcançáveis acima do teclado também conferidos em 360 dp / fonte 1.3. O seletor modal foi conferido no APK final em 26/09, com a ação Fechar acima da navegação por gestos. iOS não foi validado.

### APK atual

[FordSpecPulse-1.2.1.apk](../artifacts/FordSpecPulse-1.2.1.apk), versão 1.2.1 / código Android 4, 111,073,141 bytes. SHA-256: `83cfa9d02fcfcce47fc7b74cdc337e40303090055d87365ff3b6012c51444af0`. Assinatura válida, Render embarcado, imagens locais e sem logging diagnóstico. [Metadados](apk-metadata-1.2.1.txt), [manifesto de 73 arquivos](release-source-1.2.1.sha256), [capturas](screenshots/README.md).

## Critérios e entrega

A [matriz](sprint-3.md) separa os itens literais do PDF dos cenários adicionais do prompt. [Demonstração por tela](demonstracao-sprint-3.md) e [instruções de entrega](entrega-sprint-3.md) organizam o material disponível; o aceite autorizado de 26/09 está registrado abaixo.

## Validação autorizada — 26/09/2026

APK final 1.2.1, Pixel_9 / Android 16, 1080 × 2424 px, densidade 420, fonte 1.15 e navegação por gestos. A conta original de avaliação foi usada com autorização explícita do responsável; login HTTP 200, perfil ADMINISTRADOR. Não houve alteração de perfil.

- Login nativo, Início, Perfil, catálogo, veículo Raptor, ficha e seleção Ford/concorrente aprovados.
- Comparação mista Raptor × Hilux: torque de 583 Nm e 500 Nm, respectivamente, conforme resposta real da API. O servidor não informou fonte nessa linha; a interface mostrou fonte não informada e validação pendente.
- O pedido livre “banco massageador” permaneceu visível nas duas versões como “Não informado / Atributo não reconhecido”.
- Comparação somente com esse termo livre também gerou resultado real após autorização em `/comparacoes`, sem atributo de catálogo selecionado (`attributeIds: []`).
- Duas análises foram salvas e permaneceram após encerramento/reinício. Reabertura aprovada; exclusão individual deixou a outra análise intacta. Logout persistiu após novo reinício.
- Galeria das dez telas renovada com o APK final.

[Galeria do APK final](demonstracao-sprint-3.md). Credenciais e tokens não fazem parte das evidências.

## Verificações anteriores — versão 1.2.0

As seções abaixo registram o aceite funcional e a build anterior; não substituem as verificações da atualização 1.2.1.

## Verificações técnicas

| Verificação | Resultado |
| --- | --- |
| TypeScript e ESLint | Aprovados, sem desabilitar regras. |
| Testes comportamentais | **40 aprovados**: sessão, histórico, seleção, valores/identidades, paginação e consulta livre. Transporte e armazenamento de teste ficam isolados do produto. |
| Exports Android e web | Aprovados; bundle Hermes e 17 rotas web. |
| Instalação reproduzível | `npm ci` concluído na build local, 869 pacotes. |
| Expo Doctor | 20/22; avisos de versões de pacotes e regressão de memória Hermes no SDK 56. |
| Auditoria npm da build | 25 vulnerabilidades reportadas: 1 baixa, 15 moderadas e 9 altas. Sem `audit fix --force` ou migração ampla de dependências. |

A stack permanece em Expo 56 / React Native 0.85. As versões de produção preexistentes foram preservadas; SecureStore foi acrescentado para tokens nativos. Os testes cobrem refresh concorrente, falha de rede sem encerramento indevido de sessão, descarte de respostas de outra conta, persistência isolada e erros de gravação. Também verificam listas com 53 itens, páginas repetidas/truncadas, termos duplicados/ausentes e identidade completa das fichas.

## APK e ambiente

- Arquivo local: [FordSpecPulse-1.2.0.apk](../artifacts/FordSpecPulse-1.2.0.apk), ignorado pelo Git.
- Pacote `com.brnbastos.fordspecpulse`, versão **1.2.0**, `versionCode` **3**.
- Assinatura, hash e dados do pacote: [metadados](apk-metadata-1.2.0.txt), [SHA-256](../artifacts/FordSpecPulse-1.2.0.apk.sha256).
- SHA-256 do APK final: `a8173fa37520cd911b036c31875cf890903c68042ce345abcd4aa8cfef9db89c` (110.282.052 bytes).
- Fontes embarcadas: [manifesto 1.2.0](release-source-1.2.0.sha256).
- AVD Pixel_9, Android 16/API 36, arm64; sem dispositivo físico.
- APK release com bundle local, minSdk 24, targetSdk 36, quatro ABIs, sem `DEBUGGABLE`. Bundle conferido com Render e sem Railway.

A cota mensal gratuita do EAS cloud foi esgotada. A build foi produzida localmente com EAS/prebuild e Gradle, usando a assinatura existente. O empacotamento excedeu o heap padrão de 2 GiB; a repetição com `-Xmx6g -XX:MaxMetaspaceSize=2g --max-workers=2` concluiu. Não há URL de uma nova build cloud: a entrega é o arquivo local.

A recompilação final de acabamento foi concluída, com assinatura v2 válida, hash acima e manifesto de 60 arquivos. O APK final foi instalado com `adb install -r` e aberto sem Metro/Expo Go. O reinício a frio restaurou a sessão autenticada. Categorias em português, informações de fonte/data, perfil traduzido e catálogo compacto foram conferidos nesta revisão final; as capturas correspondentes foram atualizadas.

## Consultas autenticadas na API real

A conta temporária de QA foi criada no cadastro normal (HTTP 201), com perfil padrão `SOMENTE_LEITURA`. Não houve alteração de perfil. Credenciais e tokens estão fora do repositório; evidências publicadas não contêm dados de usuário.

| Consulta | Resultado observado |
| --- | --- |
| OpenAPI / acesso sem token | OpenAPI HTTP 200; catálogo e ficha sem token HTTP 401. |
| Catálogo e identidades | 8 veículos e 8 versões BR/2024; 16 consultas diretas de veículo/versão coincidiram com as listas. |
| Paginação real | Veículos: 3/3/2 itens; taxonomia: 10/10/3; especificações de cada versão: 10/10/3. Totais estáveis e sem duplicações. |
| Taxonomia e especificações | 23 atributos e 23 especificações por versão, com identidades corretas. |
| Fichas Raptor / Hilux | HTTP 200; marca, modelo, versão, ano e mercado correspondem à seleção. Slug do catálogo e UUID da ficha tratados corretamente. |
| Ausência e termos livres | Raptor: 21 presentes e 2 consumos não informados; Hilux: 23 presentes. Dois termos adicionais desconhecidos permaneceram em ambas as respostas. |

O [inventário Raptor](validacao-ranger-raptor.md) contém todas as 23 linhas, valores, estados, fontes declaradas e respostas sanitizadas. Os dados são reais do serviço, mas ainda precisam ser conferidos contra o slide do avaliador.

## Verificações no APK

| Fluxo | Resultado atual |
| --- | --- |
| Login e cadastro | Layout, envio desabilitado com campos vazios, teclado, rolagem e botão Voltar aprovados em 360, 393 e 412 dp; 360 dp também com fonte 1.3. |
| Login autenticado | Aprovado com a conta temporária real. |
| Início, catálogo, veículo e versão | Navegação autenticada e conteúdo real verificados; categorias em português e expansão de fonte/data conferidas no APK final. |
| Histórico vazio e perfil | Telas autenticadas verificadas; ilustração local no estado vazio e nome de perfil traduzido. |
| Consulta livre pela interface | Atributo “banco massageador” adicionado e consultado na Raptor. Pedido preservado como “Não informado” / “Atributo não reconhecido”; expansão de fonte funcionou. |
| Seleção para comparação | “Usar como Ford” preservou a Raptor; Toyota/Hilux BR/2024 SRX selecionada como concorrente. |
| Comparação e permissões | Seleção somente livre enviada e repetida no APK final. O perfil `SOMENTE_LEITURA` recebeu “Seu perfil não tem permissão para esta ação.”; restrição respeitada, sem resultado fictício. |
| Salvar → reiniciar → reabrir/excluir | Testes automatizados aprovados; fluxo completo nativo ainda não registrado. |
| Reinício e sessão | Reinício a frio do APK final restaurou a sessão autenticada. Logout seguido de encerramento forçado/reinício permaneceu no login. Troca de conta e refresh protegidos em testes; validação real desses cenários ainda pendente. |
| Demonstração de todas as telas | Parcial; resultado de comparação e histórico preenchido dependem do fluxo autorizado. |

As [capturas atuais](screenshots/README.md) distinguem a versão 1.2.0 das imagens históricas. Os checks em três larguras e fonte ampliada cobrem as telas públicas; não representam uma aprovação de todas as telas autenticadas nessas larguras. A aprovação dos GETs ou da ficha diretamente na API não substitui os fluxos de comparação/histórico ainda pendentes.

[Vídeo de consulta no APK final](../artifacts/FordSpecPulse-1.2.0-consulta.mp4): 19,5722 segundos, 3.145.051 bytes. Evidência parcial de consulta real; não cobre todas as telas nem o fluxo completo da sprint.

## Aceite restante

- **PDF:** conferir a Ranger Raptor contra o slide complementar ainda não fornecido. Os 23 atributos existentes não garantem cobertura integral da referência.
- **QA adicional do prompt:** troca de conta com isolamento e renovação bem-sucedida de token ainda não foram repetidas nativamente nesta sessão; há cobertura automatizada. Restauração, logout e refresh rejeitado já foram verificados no APK final.

A demonstração de todas as telas da Sprint 3 está disponível na [galeria final](demonstracao-sprint-3.md). O vídeo de até seis minutos pertence à Sprint 4, página 19.

## Histórico — versão 1.1.0

A build EAS `0086b06a-1af3-4433-9d1e-606eec6190db`, de 21/09, usava Railway e teve 20 testes e verificações das telas públicas. A indisponibilidade HTTP 502/timeout daquele período não descreve o serviço Render atual. Seus metadados, `release-source.sha256` e capturas antigas são evidência somente da versão 1.1.0; foram substituídos como entrega pelo APK local 1.2.0.

Os achados de paginação e atributos livres ausentes na revisão `c3f6ba3` foram resolvidos no código atual. Permanecem apenas os aceites explicitamente listados acima.
