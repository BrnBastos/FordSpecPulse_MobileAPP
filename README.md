# Ford SpecPulse

Esse é o nosso app para a Sprint 3 de **Mobile Development and IoT**, no desafio Ford da FIAP. A ideia é consultar a ficha de um carro e comparar uma versão Ford com uma concorrente, escolhendo o que a gente quer analisar.

## Nosso grupo

| Nome | RM |
|---|---:|
| Carlos Henrique | 558003 |
| Mauricio Alves | 556214 |
| Ian Monteiro | 558652 |
| Bruno Silva | 550416 |
| João Hoffmann | 550763 |

## Para testar

Instale o arquivo **FordSpecPulse-1.2.1.apk** no celular Android ou no emulador. No celular, é só abrir o arquivo e permitir a instalação por essa origem, se o Android pedir. Depois, abra o app com internet e use esta conta:

- **Login:** `admin@ford.internal`
- **Senha:** `admin123`

**Use essa conta para testar a comparação.** O app também tem cadastro, mas uma conta nova pode receber apenas permissão de consulta, dependendo do perfil definido pela API.

O APK abre sozinho, sem Expo Go ou computador conectado. Ele fica em `artifacts/FordSpecPulse-1.2.1.apk` no projeto local. **Como o APK não vai para o Git, ele precisa ser anexado à entrega da disciplina.**

Se estiver usando ADB:

```bash
adb install -r artifacts/FordSpecPulse-1.2.1.apk
```

## Um passeio pelo app

1. Em **Veículos**, procure um modelo e abra a versão. Escolha os atributos ou escreva o que quer consultar e toque em **Consultar ficha**.
2. Em **Comparar**, escolha a versão Ford e a concorrente. Confira o ano e o mercado, selecione os atributos e toque em **Gerar comparação**. Dá para usar opções do catálogo e termos livres, até 50 por comparação.
3. No resultado, veja os valores lado a lado. Também dá para filtrar as diferenças e abrir **Fontes e observações**.
4. Toque em **Salvar análise** para guardar o resultado. Depois, entre no **Histórico** para abrir de novo ou excluir.
5. Para sair, abra **Meu perfil** na tela inicial e toque em **Sair da conta**.

Uma sugestão para testar é comparar a **Ranger Raptor 2024 BR** com a **Hilux SRX 2024 BR**, escolhendo torque e escrevendo “banco massageador”. Esse exemplo mostra tanto um valor disponível quanto um pedido que a base não reconhece.

**O histórico fica no dispositivo, separado por conta.** Os resultados salvos não mudam automaticamente quando os dados da API mudam. E “não informado” não quer dizer que o carro não tem aquele equipamento: quer dizer que não temos esse dado confirmado.

## Para rodar pelo código

Usamos React Native com Expo SDK 56 e TypeScript. Para abrir o projeto, tenha Node.js 20.19 ou superior, npm e o ambiente Android configurado. Nos testes, usamos Node.js 20.20.2.

```bash
npm ci
cp .env.example .env.local
npm run android
```

A API já está configurada no `.env.example`, pela variável `EXPO_PUBLIC_API_BASE_URL`:

```text
https://ford-spec-pulse-api.onrender.com/api
```

As consultas e comparações precisam de internet e da API disponível. Se a conexão falhar, o app mostra uma opção para tentar novamente.

Para gerar outro APK pelo EAS, com acesso ao projeto e à assinatura:

```bash
npx eas-cli build --platform android --profile sprint3
```

## Onde está cada coisa

| Pasta | O que tem |
|---|---|
| `src/app/` | Telas e navegação com Expo Router |
| `src/components/` | Componentes que as telas compartilham |
| `src/services/` | Comunicação com a API, autenticação e histórico |
| `src/store/` | Estado da comparação, usando Zustand |
| `assets/images/` | Imagens do app |
| `tests/` e `docs/` | Testes, capturas e documentação |

Usamos Axios e TanStack Query nas chamadas à API, SecureStore para a sessão no Android e AsyncStorage para o histórico.

## O que foi testado

O APK foi instalado no Android 16. Testamos entrada na conta, consulta, comparação com atributos do catálogo e livres, salvamento de duas análises, reinício do app, reabertura, exclusão e saída da conta. Também passaram **42 testes automatizados**, a checagem de TypeScript e o lint.

Para rodar as verificações:

```bash
npm run typecheck
npm run lint
npm test
```

## Para a entrega

Além deste repositório e do APK, deixamos uma [demonstração com as dez telas](docs/demonstracao-sprint-3.md) e os [resultados dos testes](docs/qa-sprint-3.md). O [guia de entrega](docs/entrega-sprint-3.md) reúne os arquivos, e a [matriz da Sprint 3](docs/sprint-3.md) relaciona o que foi feito aos requisitos da disciplina.

**Ainda falta conferir todos os atributos com o slide complementar da Ranger Raptor**, que não recebemos. A consulta real já foi testada, mas essa conferência específica continua pendente. Os detalhes estão na [validação da Raptor](docs/validacao-ranger-raptor.md).

[Contrato da API](docs/contrato-api.md) · [Créditos das imagens](docs/assets.md)
