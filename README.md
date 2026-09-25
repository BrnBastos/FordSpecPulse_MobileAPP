# Ford SpecPulse

Ferramenta de inteligência competitiva automotiva para consultar fichas técnicas e comparar uma versão Ford com uma concorrente. Desafio 01 — Ford FIAP 2026; Sprint 3 de **Mobile Development and IoT**.

**Situação:** versão 1.2.1 com atributos livres, paginação completa, logos das sete marcas do catálogo, fotos Ford e quatro imagens geradas locais. A escala nativa foi corrigida com contêineres proporcionais; telas, abas e seletores respeitam as áreas do sistema no topo e na base. Fontes e prompts em [assets](docs/assets.md). TypeScript, lint e 42 testes aprovados. Login, catálogo e consulta livre foram verificados no Android com conta temporária; o perfil padrão negou a comparação. O resultado completo, histórico preenchido e demonstração restante exigem conta autorizada. Falta a referência complementar da Ranger Raptor. Consulte [a matriz da sprint](docs/sprint-3.md) e [QA](docs/qa-sprint-3.md).

## Integrantes

| Nome | RM |
|---|---:|
| Carlos Henrique | 558003 |
| Mauricio Alves | 556214 |
| Ian Monteiro | 558652 |
| Bruno Silva | 550416 |
| João Hoffmann | 550763 |

## Executar

Node 20.19+ (validado com 20.20.2), npm e Android SDK/emulador ou dispositivo para validação nativa.

```bash
npm ci
cp .env.example .env.local
npm start
```

`npm run android` abre o fluxo de desenvolvimento Expo; não gera o APK final. A variável `EXPO_PUBLIC_API_BASE_URL` é pública e contém apenas a URL HTTPS do serviço. Nunca inserir segredos nela.

```bash
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo-doctor
npx expo export --platform android --output-dir dist/android
```

O lockfile fixa a instalação. A stack preserva Expo 56.0.4, React Native 0.85.3, React 19.2.3, Expo Router 56.2.6, TypeScript 6.0.3, TanStack Query, Axios e Zustand. Tokens nativos usam Expo SecureStore; histórico usa AsyncStorage. Há avisos conhecidos do Expo Doctor documentados em QA; não foi feita migração ampla de SDK.

## Uso

1. Entrar com uma conta fornecida pela equipe ou usar o cadastro; o backend define as permissões do perfil.
2. Em **Veículos**, buscar marca/modelo, abrir uma versão e escolher ou escrever os atributos. Usar **Consultar ficha** para executar a pesquisa livre.
3. Em **Comparar**, selecionar marca, modelo/ano/mercado e versão Ford; repetir para a concorrente.
4. Selecionar atributos por categoria ou adicionar termos livres, editar/remover pedidos e gerar a comparação (até 50 atributos).
5. Consultar os dois valores por atributo, estados e fontes disponíveis; filtrar diferenças.
6. Salvar e reabrir pelo Histórico; excluir uma análise ou limpar a coleção com confirmação.
7. Abrir **Meu perfil** no Início para sair.

A API decide as permissões. Um 403 informa restrição de perfil e não é contornado. Cadastro não garante permissão de comparação. Nenhuma credencial administrativa permanente é publicada neste README; a equipe deve fornecer uma conta apropriada ao avaliador.

## Dados e limitações

Base atual: `https://ford-spec-pulse-api.onrender.com/api`.

[Contrato da API](docs/contrato-api.md) descreve endpoints, payload e validações. Falhas de rede não produzem mocks. O app separa erros de resposta vazia e oferece nova tentativa. Tokens nativos migrados do AsyncStorage são removidos dali após armazenamento seguro; no web, sessão fica apenas em memória.

`0` e `false` são valores válidos. “Não informado” não significa ausência confirmada. Conflito e validação pendente permanecem explícitos. Unidades diferentes não produzem uma vantagem calculada no cliente. Sem fonte/data/critério de confiança fornecido, o app não inventa metadados nem percentuais.

A ficha individual e a comparação aceitam termos livres por meio de `/fichas-tecnicas/consultar`. Pedidos desconhecidos e dados ausentes permanecem visíveis; o valor formatado pelo servidor não recebe unidade duplicada. A comparação executa primeiro `/comparacoes`, respeitando suas permissões, e consulta uma ficha por veículo para os termos livres. Fichas reais e retenção de termo desconhecido foram verificadas; o resultado comparativo ainda depende de conta com permissão. A consulta livre confirma marca/modelo/versão/ano/mercado antes de exibir valores.

Veículos, versões, atributos e especificações carregam todas as páginas informadas pela API. Respostas parciais ou inconsistentes produzem erro com nova tentativa, sem exibir dados incompletos como ficha final.

O histórico guarda snapshots versionados, com data, seleção e nomes de versões, separados por usuário. Não é sincronizado remotamente. O registro global legado `lastComparison` não é atribuído a nenhuma conta, pois sua autoria é desconhecida. Arquivos inválidos geram erro recuperável e opção de limpeza.

[Validação Ranger Raptor](docs/validacao-ranger-raptor.md): identidade BR/2024 e 23 atributos consultados na API, com 21 presentes e 2 não informados. Falta o slide complementar para conferir a exatidão e a equivalência exigidas pelo avaliador. Uma página provisória do modelo 2026 não substitui essa referência.

## APK de release

APK atual: [FordSpecPulse-1.2.1.apk](artifacts/FordSpecPulse-1.2.1.apk) (arquivo local, ignorado pelo Git). Release final assinado usando Render, instalado no Android 16. O reinício a frio restaurou a sessão autenticada; após sair, novo reinício permaneceu no login. Checksum e verificações estão em [QA](docs/qa-sprint-3.md).

A cota gratuita de builds Android EAS foi esgotada. A alternativa local usa o mesmo perfil e assinatura:

```bash
ANDROID_HOME="$HOME/Library/Android/sdk" eas build --platform android --profile sprint3 --local --output artifacts/FordSpecPulse-1.2.1.apk
```

Requer Java 17, Android SDK/NDK e acesso à conta EAS para recuperar a assinatura. Nenhuma chave é incluída no repositório. O estado e o checksum da geração local estão em [QA](docs/qa-sprint-3.md).

```bash
npx eas-cli build --platform android --profile sprint3
```

Projeto [bbastos/FordSpecPulse_Mobile](https://expo.dev/accounts/bbastos/projects/FordSpecPulse_Mobile), pacote `com.brnbastos.fordspecpulse`, versão 1.2.1 / versionCode 4. Perfil `sprint3`: distribuição interna, APK, sem development client. A build embarca o bundle e deve iniciar sem Metro/Expo Go. Credenciais de assinatura são gerenciadas pelo EAS.

O APK anterior 1.1.0 usava Railway e foi substituído como entrega. Suas capturas e manifesto permanecem históricos. A build concluída não equivale à validação integral dos fluxos autenticados.

## Estrutura

```text
src/app/                 Rotas, autenticação, catálogo, comparação e histórico
src/components/          Componentes compartilhados e seletores
src/constants/           Tokens visuais
src/services/auth.ts     Sessão, SecureStore, cliente HTTP e refresh
src/services/adapters.ts Normalização de especificações/comparação
src/services/history.ts  Persistência por usuário
src/services/specpulseApi.ts  Serviços de domínio e validação
src/services/technicalSheets.ts  Pesquisa livre e validação de identidade
src/services/pagination.ts   Leitura completa e consistente de listas
src/store/               Estado da seleção e resultado atual
tests/                   Testes comportamentais, fixtures isoladas
docs/                    Matriz, contrato, validação e QA
assets/images/           Assets do produto
```

## Demonstração

Roteiro: abrir APK → entrar → consultar Ranger Raptor exata → escolher atributos → selecionar concorrente → comparar → ver fontes/diferenças → salvar → reabrir Histórico → sair. Demonstrar também vazio, rede indisponível e permissão negada. Capturas reais e limitações estão na [galeria](docs/screenshots/README.md). O vídeo de até seis minutos é exigência da Sprint 4; a demonstração das telas permanece parte da Sprint 3.

[Vídeo de consulta na versão anterior 1.2.0](artifacts/FordSpecPulse-1.2.0-consulta.mp4) — cerca de 20 segundos. É uma evidência parcial de consulta; não substitui a demonstração completa da sprint.

As duas ilustrações geradas são decorativas, locais e leves; [prompts e origem](docs/assets.md). As telas técnicas priorizam valores e mantêm fontes sob expansão.
