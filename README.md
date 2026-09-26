# Ford SpecPulse

Aplicativo Android para consultar fichas técnicas e comparar veículos Ford com concorrentes, com atributos escolhidos pelo usuário e histórico de análises.

**FIAP · Mobile Development and IoT · Sprint 3 · Desafio Ford 01**

Versão **1.2.1** · Código Android **4**

## Integrantes

| Nome | RM |
|---|---:|
| Carlos Henrique | 558003 |
| Mauricio Alves | 556214 |
| Ian Monteiro | 558652 |
| Bruno Silva | 550416 |
| João Hoffmann | 550763 |

## Material para avaliação

| Item | Local |
|---|---|
| Código-fonte e instruções | Este repositório e README |
| Aplicativo instalável | `artifacts/FordSpecPulse-1.2.1.apk` |
| Demonstração das dez telas | [Galeria e roteiro](docs/demonstracao-sprint-3.md) |
| Requisitos da disciplina | [Matriz da Sprint 3](docs/sprint-3.md) |
| Testes e evidências | [Registro de validação](docs/qa-sprint-3.md) |

**O APK é um arquivo local e não está incluído no Git.** Anexe-o à entrega da disciplina junto do endereço do repositório e da demonstração. O [guia de entrega](docs/entrega-sprint-3.md) identifica o pacote completo e o checksum do APK.

## Instalar e acessar

1. Copie o APK para um celular Android e abra o arquivo. Autorize a instalação por essa origem, caso o sistema solicite.
2. Abra **Ford SpecPulse** com conexão à internet. O APK funciona sem Expo Go ou servidor de desenvolvimento.
3. Entre com a **conta de avaliação fornecida pela equipe**. Login e senha devem acompanhar a entrega em campo privado para o professor.

O cadastro também está disponível, mas a API define as permissões: uma conta nova pode ter acesso somente à consulta. Use a conta de avaliação para demonstrar a comparação completa.

Para instalar em um emulador ou dispositivo conectado por ADB:

```bash
adb install -r artifacts/FordSpecPulse-1.2.1.apk
```

## Como usar

1. **Consultar:** em **Veículos**, busque uma marca ou modelo, abra a versão e selecione atributos do catálogo ou escreva termos livres. Toque em **Consultar ficha**.
2. **Comparar:** na aba **Comparar**, selecione a versão Ford e a concorrente, conferindo modelo, ano e mercado. Escolha até 50 atributos e toque em **Gerar comparação**.
3. **Analisar:** confira os valores lado a lado, filtre diferenças e expanda **Fontes e observações**. Informações ausentes ou desconhecidas são identificadas na tela.
4. **Salvar:** toque em **Salvar análise**. No **Histórico**, reabra ou exclua resultados. As análises ficam neste dispositivo, separadas por conta, e não são atualizadas automaticamente.
5. **Sair:** acesse **Meu perfil** no Início e toque em **Sair da conta**.

**Exemplo para apresentação:** Ranger Raptor 2024 BR × Toyota Hilux SRX 2024 BR, usando “Torque maximo” e o termo livre “banco massageador”. Mostre os valores, o atributo não reconhecido, o salvamento e a reabertura pelo histórico.

## Executar o projeto

Pré-requisitos: Node.js 20.19 ou superior, npm e ambiente Android configurado. A versão usada na validação foi Node.js 20.20.2.

```bash
npm ci
cp .env.example .env.local
npm run android
```

A configuração `EXPO_PUBLIC_API_BASE_URL` aponta para:

```text
https://ford-spec-pulse-api.onrender.com/api
```

O comando acima inicia o ambiente de desenvolvimento. Para gerar um APK com o perfil de entrega, é necessário acesso ao projeto e à assinatura no EAS:

```bash
npx eas-cli build --platform android --profile sprint3
```

## Organização e tecnologias

React Native, Expo SDK 56, TypeScript e Expo Router. Integração HTTP com Axios e TanStack Query; estado com Zustand; sessão nativa em SecureStore e histórico em AsyncStorage.

| Pasta | Responsabilidade |
|---|---|
| `src/app/` | Telas e navegação |
| `src/components/` | Componentes visuais compartilhados |
| `src/services/` | API, autenticação, consultas e histórico |
| `src/store/` | Estado da comparação |
| `assets/images/` | Imagens e identidade visual |
| `tests/` e `docs/` | Testes e documentação da entrega |

## Validação e limitações

**42 testes aprovados**, além das verificações de TypeScript e lint. No APK final, instalado no Android 16, foram validados autenticação, consulta, comparação com atributos do catálogo e livres, duas análises salvas, persistência após reinício, reabertura, exclusão e saída da conta. A galeria registra as dez telas.

```bash
npm run typecheck
npm run lint
npm test
```

- Consultas e comparações dependem da API e de internet. Em falhas de conexão, o app permite tentar novamente.
- Dados ausentes não são tratados como ausência confirmada de equipamento; fontes e estados de validação disponíveis são exibidos.
- **Pendência de aceite:** falta o slide complementar da Ranger Raptor para conferir integralmente os atributos exigidos como referência. [Detalhes da conferência](docs/validacao-ranger-raptor.md).

[Contrato da API](docs/contrato-api.md) · [Origem e créditos das imagens](docs/assets.md)
