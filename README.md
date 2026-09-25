# Ford SpecPulse

Ferramenta de inteligência competitiva automotiva para consultar fichas técnicas e comparar uma versão Ford com uma concorrente. Desafio 01 — Ford FIAP 2026; Sprint 3 de **Mobile Development and IoT**.

**Situação:** implementação em validação. A API Render responde; faltam integração de atributos livres, paginação completa, validação autenticada, conferência da Ranger Raptor e novo APK com a URL Render. Consulte também [a revisão de 25/09](docs/revisao-sprint-3.md). Consulte [a matriz da sprint](docs/sprint-3.md) e [os resultados de QA](docs/qa-sprint-3.md).

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

1. Entrar com conta de avaliação fornecida em canal privado pela equipe.
2. Em **Veículos**, buscar marca/modelo, abrir uma versão e escolher os atributos da ficha.
3. Em **Comparar**, selecionar marca, modelo/ano/mercado e versão Ford; repetir para a concorrente.
4. Selecionar atributos por categoria e gerar a comparação.
5. Consultar os dois valores por atributo, estados e fontes disponíveis; filtrar diferenças.
6. Salvar e reabrir pelo Histórico; excluir uma análise ou limpar a coleção com confirmação.
7. Abrir **Meu perfil** no Início para sair.

A API decide as permissões. Um 403 informa restrição de perfil e não é contornado. Cadastro não garante permissão de comparação. Nenhuma credencial administrativa permanente é publicada neste README; a equipe deve fornecer uma conta apropriada ao avaliador.

## Dados e limitações

Base atual: `https://ford-spec-pulse-api.onrender.com/api`.

[Contrato e extensão proposta](docs/contrato-api.md) descrevem endpoints, payload e dependências. Falhas de rede não produzem mocks. O app separa erros de resposta vazia e oferece nova tentativa. Tokens nativos migrados do AsyncStorage são removidos dali após armazenamento seguro; no web, sessão fica apenas em memória.

`0` e `false` são valores válidos. “Não informado” não significa ausência confirmada. Conflito e validação pendente permanecem explícitos. Unidades diferentes não produzem uma vantagem calculada no cliente. Sem fonte/data/critério de confiança fornecido, o app não inventa metadados nem percentuais.

A ficha individual reutiliza a taxonomia para manter ordem, nomes e categorias consistentes. A pesquisa livre fora dessa taxonomia **não está integrada**: o contrato individual já está publicado, mas falta conectá-lo ao mobile; a comparação livre também segue pendente. A UI informa essa limitação ao não encontrar um atributo. Células de comparação sem identidade de versão são rejeitadas até que o contrato de ordem seja comprovado.

O histórico guarda snapshots versionados, com data, seleção e nomes de versões, separados por usuário. Não é sincronizado remotamente. O registro global legado `lastComparison` não é atribuído a nenhuma conta, pois sua autoria é desconhecida. Arquivos inválidos geram erro recuperável e opção de limpeza.

[Validação Ranger Raptor](docs/validacao-ranger-raptor.md): referência complementar e consulta real pendentes. Uma referência oficial provisória não equivale à aprovação do caso.

## APK de release

```bash
npx eas-cli build --platform android --profile sprint3
```

Projeto [bbastos/FordSpecPulse_Mobile](https://expo.dev/accounts/bbastos/projects/FordSpecPulse_Mobile), pacote `com.brnbastos.fordspecpulse`, versão 1.1.0 / versionCode 2. Perfil `sprint3`: distribuição interna, APK, sem development client. A build embarca o bundle e deve iniciar sem Metro/Expo Go. Credenciais de assinatura são gerenciadas pelo EAS.

[Baixar APK anterior 1.1.0 (Railway)](https://expo.dev/artifacts/eas/dya-EUsGruyITWRiJCgos_F4zR6_hPlEK6NBXQkKpkI.apk) — instalado e iniciado no Android 16 sem Metro/Expo Go. **Este APK usa a URL Railway antiga e não corresponde à configuração Render atual; é necessário gerar e instalar uma nova build.** Identificação da build, checksum e evidências estão em [QA](docs/qa-sprint-3.md). Build concluída não equivale à validação dos fluxos autenticados.

## Estrutura

```text
src/app/                 Rotas, autenticação, catálogo, comparação e histórico
src/components/          Componentes compartilhados e seletores
src/constants/           Tokens visuais
src/services/auth.ts     Sessão, SecureStore, cliente HTTP e refresh
src/services/adapters.ts Normalização de especificações/comparação
src/services/history.ts  Persistência por usuário
src/services/specpulseApi.ts  Serviços de domínio e validação
src/store/               Estado da seleção e resultado atual
tests/                   Testes comportamentais, fixtures isoladas
docs/                    Matriz, contrato, validação e QA
assets/images/           Assets do produto
```

## Demonstração

Roteiro: abrir APK → entrar → consultar Ranger Raptor exata → escolher atributos → selecionar concorrente → comparar → ver fontes/diferenças → salvar → reabrir Histórico → sair. Demonstrar também vazio, rede indisponível e permissão negada. Capturas reais e limitações estão na [galeria](docs/screenshots/README.md). O vídeo de até seis minutos é exigência da Sprint 4; a demonstração das telas permanece parte da Sprint 3.
