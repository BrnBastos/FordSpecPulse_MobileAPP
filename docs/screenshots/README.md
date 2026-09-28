# Capturas do aplicativo

## Versão 1.2.2 — nova API

[Entrada](1.2.2/login.png) · [Início autenticado](1.2.2/inicio.png). APK com novo endereço Render, instalado sobre a versão anterior. A galeria completa das telas abaixo é da 1.2.1, que tem a mesma interface.

## APK final 1.2.1 — percurso autorizado de 26/09

A [galeria completa das dez telas](../demonstracao-sprint-3.md) registra login, catálogo, ficha, comparação mista/somente livre, duas análises persistidas após reinício, reabertura, exclusão e logout. Capturas em `1.2.1-final/`, Android 16 / aproximadamente 411 dp / fonte 1.15. As seções abaixo preservam evidências anteriores e seus limites.

## Versão 1.2.1 — imagens e áreas seguras

APK release no Pixel_9 / Android 16. As imagens de 360 dp registram a revisão de proporção das imagens, antes da correção das áreas seguras. As capturas de Início em 412 dp / fonte 1.3 incluem as áreas seguras atualizadas.

| Verificação | Captura |
|---|---|
| Login / cadastro / teclado no APK final | [Login 360 dp](1.2.1/login-360dp-area-segura.png), [Login 412 dp](1.2.1/login-412dp-tres-botoes.png), [Cadastro](1.2.1/cadastro-360dp-area-segura.png), [Teclado](1.2.1/teclado-360dp-area-segura.png) |
| Início: gestos / três botões | [Gestos](1.2.1/inicio-412dp.png), [Três botões](1.2.1/inicio-412dp-tres-botoes.png) |
| Proporção das imagens em 360 dp | [Login](1.2.1/login-360dp.png), [Início](1.2.1/inicio-360dp.png), [Raptor](1.2.1/raptor-360dp.png), [Comparar](1.2.1/comparar-360dp.png) |
| Logos do catálogo e seletor | [Marcas](1.2.1/marcas-360dp.png), [Mais marcas](1.2.1/marcas-360dp-2.png), [Seletor](1.2.1/seletor-ford-360dp.png) |

[Resultados e limites](1.2.1/results.json). A revisão atual reproduziu HTTP 422 no refresh da sessão de avaliação; a API pública respondeu HTTP 200 também no Android. A correção encerra essa sessão inválida. As capturas antigas de catálogo não comprovam uma nova autenticação na build final. [QA e limites do aceite](../qa-sprint-3.md).

## Versão 1.2.0 — Render

As capturas em [1.2.0](1.2.0/) vêm do APK assinado instalado no Pixel_9 / Android 16, sem Metro ou Expo Go. Login/cadastro incluem três larguras, texto ampliado e teclado. Os resultados estão em [results.json](1.2.0/results.json). Os fluxos autenticados usam dados reais e uma conta temporária com perfil padrão de consulta; os limites de permissão são registrados em QA.

| Largura / fonte | Login | Cadastro | Teclado |
|---|---|---|---|
| 360 dp / 1.3 | [PNG](1.2.0/login-360dp.png) | [PNG](1.2.0/cadastro-360dp.png) | [PNG](1.2.0/teclado-360dp.png) |
| 393 dp / 1.0 | [PNG](1.2.0/login-393dp.png) | [PNG](1.2.0/cadastro-393dp.png) | [PNG](1.2.0/teclado-393dp.png) |
| 412 dp / 1.0 | [PNG](1.2.0/login-412dp.png) | [PNG](1.2.0/cadastro-412dp.png) | [PNG](1.2.0/teclado-412dp.png) |

As telas públicas e a consulta livre foram capturadas na primeira build 1.2.0. A recompilação final alterou apenas rótulos de perfil/categorias e o texto dos cartões de veículos. As capturas abaixo, exceto a consulta livre, foram renovadas com o APK final (`a8173fa3…f9db89c`).

| Fluxo autenticado | Evidência |
|---|---|
| Início após reinício | [PNG](1.2.0/inicio.png) |
| Catálogo e veículo | [Catálogo](1.2.0/veiculos.png), [Raptor](1.2.0/veiculo-raptor.png) |
| Ficha e procedência | [Ficha](1.2.0/ficha-raptor.png), [Fonte](1.2.0/ficha-fonte-confirmada.png) |
| Termo livre não reconhecido | [Consulta](1.2.0/ficha-atributo-livre.png), [Detalhe](1.2.0/ficha-fonte.png) |
| Restrição real de comparação | [Permissão](1.2.0/comparacao-permissao.png) |
| Histórico vazio e perfil | [Histórico](1.2.0/historico-vazio.png), [Perfil](1.2.0/perfil.png) |
| Logout persistido após reinício | [Login final](1.2.0/login-final-393dp.png) |

[Resultados autenticados](1.2.0/authenticated-results.json). [Vídeo local de consulta](../../artifacts/FordSpecPulse-1.2.0-consulta.mp4), aproximadamente 20 segundos, gravado no APK final. O vídeo cobre catálogo, Raptor, ficha e fonte; é uma prévia de revisão. Essas lacunas históricas foram cobertas pela galeria final 1.2.1 acima.

## Evidência histórica — 1.1.0

Build `0086b06a-1af3-4433-9d1e-606eec6190db`, instalada no Pixel_9 / Android 16. Capturas diretas do emulador, sem Metro/Expo Go. Campos exibem placeholders; nenhum cadastro foi enviado. Resultados automatizados: [results.json](results.json).

| Largura / fonte | Login | Cadastro | Cadastro com teclado e rolagem |
|---|---|---|---|
| 360 dp / 1.3 | [PNG](android-login-360dp.png) | [PNG](android-register-360dp.png) | [PNG](android-keyboard-360dp.png) |
| 393 dp / 1.0 | [PNG](android-login-393dp.png) | [PNG](android-register-393dp.png) | [PNG](android-keyboard-393dp.png) |
| 412 dp / 1.0 | [PNG](android-login-412dp.png) | [PNG](android-register-412dp.png) | [PNG](android-keyboard-412dp.png) |

A verificação inclui botões de envio desabilitados com campos vazios, ação acessível com teclado, dispensa do teclado pelo botão Voltar e retorno ao login pelo link.

As imagens históricas de 1.1.0 comprovam somente os fluxos públicos daquela versão.

## Idioma dos registros

Descrições e resultados de validação estão em português brasileiro. Chaves JSON, comandos, nomes de arquivos e identificadores técnicos são preservados. As respostas brutas da API e os metadados extraídos do APK mantêm o formato original para permitir auditoria.
