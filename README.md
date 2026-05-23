# Ford SpecPulse Mobile

Aplicativo mobile desenvolvido para a sprint de **Mobile Development and IoT**, usando **React Native com Expo**.

O projeto foi criado com base no desafio da Ford sobre **inteligência competitiva automotiva**. A ideia é ter um app simples e funcional para comparar veículos Ford com concorrentes, mostrando versões, atributos técnicos, vantagens, gaps e um resumo da análise.

---

## Integrantes

| Nome | RM |
|---|---:|
| Carlos Henrique | 558003 |
| Mauricio Alves | 556214 |
| Ian Monteiro | 558652 |
| Bruno Silva | 550416 |
| João Hoffmann | 550763 |

### Acesso para avaliação

Professor, para conseguir acessar todas as opções do app, utilize o acesso de administrador:

- **Login:** admin@ford.internal
- **Senha:** admin123

Contas com permissões menores podem acessar apenas parte do fluxo, porque a criação de comparações é limitada pela API backend em Java.

---

## Sobre o projeto

O **Ford SpecPulse Mobile** é um app pensado para ajudar na comparação de veículos e versões do mercado automotivo.

Comparar carros pode ser difícil porque cada montadora usa nomes diferentes para recursos parecidos, e algumas informações aparecem incompletas. Por isso, o app organiza esses dados de forma mais clara.

Com ele, o usuário consegue escolher uma versão Ford, escolher uma versão concorrente, selecionar atributos técnicos e gerar uma comparação com resumo, vantagens e pontos de atenção.

---

## Objetivo

O objetivo do app é transformar dados técnicos de veículos em uma análise simples e útil.

O foco não é apenas mostrar uma ficha técnica, mas ajudar o usuário a entender onde a Ford tem vantagem, onde existem gaps e quais dados ainda precisam de validação.

---

## Tecnologias usadas

- React Native
- Expo SDK 56
- Expo Router
- TypeScript
- Axios
- TanStack Query
- Zustand
- AsyncStorage
- Lucide React Native
- React Native SVG

---

## Principais funcionalidades

### Autenticação

O app possui login, cadastro, logout e rotas protegidas. Depois do login, as chamadas para a API usam token Bearer, com refresh token salvo localmente via **AsyncStorage**.

---

### Home

Tela inicial do app. Ela apresenta a proposta da solução e dá acesso rápido para explorar veículos ou criar uma comparação.

---

### Veículos

Tela onde o usuário consegue ver os veículos disponíveis.

Funcionalidades:

- listar veículos Ford e concorrentes;
- buscar por marca ou modelo;
- filtrar entre todos, Ford ou concorrentes;
- abrir os detalhes de um veículo.

---

### Detalhe do veículo

Mostra as informações principais do veículo selecionado, como marca, modelo, ano, mercado, segmento e versões disponíveis.

Cada versão aparece em um card com informações como motorização, tração, nível da versão e completude dos dados.

---

### Detalhe da versão

Mostra as especificações técnicas de uma versão.

Cada especificação pode ter um status:

| Status | Significado |
|---|---|
| Encontrado | A informação foi encontrada |
| Não disponível | Existe indicação de que o item não está disponível |
| Não informado | A fonte não confirma se existe ou não |
| Conflito | Existem informações divergentes |
| Validação pendente | O dado precisa ser revisado |

Um ponto importante é que o app não trata “não informado” como “não existe”. Isso evita conclusões erradas na comparação.

---

### Comparação

Essa é a parte principal do app.

O usuário escolhe:

1. uma versão Ford;
2. uma versão concorrente;
3. os atributos técnicos que quer comparar.

Depois disso, o app gera uma comparação com base nos dados selecionados.

---

### Resultado da comparação

Mostra o resultado da análise feita pelo app.

A tela apresenta:

- confiança da análise;
- resumo executivo;
- vantagens da Ford;
- gaps e riscos;
- matriz simples dos atributos comparados;
- alertas de validação.

A ideia é que o resultado seja fácil de entender, mesmo sem olhar apenas para uma tabela técnica.

---

### Histórico

A tela de histórico salva a última comparação feita pelo usuário.

Essa parte usa **AsyncStorage**, então o dado fica salvo localmente no dispositivo.

O usuário pode visualizar a última comparação ou limpar o histórico.

---

### Perfil e status da API

Mostra informações do usuário e o status da integração com a API.

A tela exibe:

- nome do usuário;
- e-mail;
- permissões;
- URL da API;
- status da autenticação;
- tecnologias principais usadas no projeto.

---

## Integração com API

O app foi preparado para consumir uma API externa em Java.

URL base usada no projeto:

```txt
https://ford-spec-pulse-api-production.up.railway.app/api
```

Endpoints principais usados:

```txt
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
GET /api/usuarios/me
GET /api/veiculos
GET /api/veiculos/:id/versoes
GET /api/versoes/:id/especificacoes
GET /api/atributos/taxonomia
POST /api/comparacoes
```

A URL pode ser alterada pela variável de ambiente `EXPO_PUBLIC_API_BASE_URL`.

Durante o desenvolvimento, alguns serviços mantiveram dados mockados como apoio. Para acessar todas as opções na versão atual, principalmente criar comparações, é necessário autenticar na API real com uma conta que tenha permissão.

---

## Fluxo principal do app

```txt
Login
→ Home
→ Veículos
→ Detalhe do veículo
→ Detalhe da versão
→ Comparar
→ Resultado
→ Histórico
```

Passo a passo:

1. O usuário abre o app e faz login.
2. Acessa a aba de veículos.
3. Escolhe um veículo.
4. Visualiza as versões.
5. Abre uma versão para ver detalhes.
6. Vai para a tela de comparação.
7. Escolhe uma versão Ford.
8. Escolhe uma versão concorrente.
9. Seleciona os atributos.
10. Gera a comparação.
11. Visualiza o resultado.
12. Salva no histórico.

---

## Estrutura do projeto

```txt
app/
  _layout.tsx
  login.tsx
  register.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    vehicles.tsx
    compare.tsx
    history.tsx
    profile.tsx
  vehicle/
    [id].tsx
  version/
    [id].tsx
  comparison-result.tsx

assets/
  images/
    specpulse-hero.png
    comparison-illustration.png
    empty-data.png

components/
  SpecPulseUI.tsx

constants/
  specpulseTheme.ts

services/
  specpulseApi.ts

store/
  comparisonStore.ts
```

---

## Explicando as pastas

### app

Contém as telas e rotas do aplicativo.

### components

Contém componentes reutilizáveis, como cards, botões, badges e estados de loading/vazio.

### constants

Contém cores, espaçamentos e padrões visuais.

### services

Contém a comunicação com a API.

### store

Contém o estado global usado na comparação.

### assets

Contém as imagens usadas no app.

---

## Como rodar

Instale as dependências:

```bash
npm install
```

Rode o projeto:

```bash
npx expo start
```

Depois, abra no Expo Go, simulador iOS ou emulador Android.

Também existem scripts por plataforma:

```bash
npm run android
npm run ios
npm run web
```

No Android, o script tenta usar um dispositivo conectado. Se não encontrar, ele inicia um emulador automaticamente. O AVD padrão é `FordSpecPulse_API_36`, mas é possível trocar usando `EXPO_ANDROID_AVD`.

---

## Dependências principais

Caso precise instalar manualmente:

```bash
npm install axios @tanstack/react-query zustand lucide-react-native
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-safe-area-context
npx expo install react-native-svg
```

---

## O que foi implementado no MVP

- Home com apresentação da solução;
- login e cadastro reais;
- rotas protegidas por sessão autenticada;
- refresh token e logout;
- listagem de veículos;
- busca e filtro simples;
- detalhe de veículo;
- detalhe de versão;
- especificações técnicas;
- tela de comparação;
- seleção de atributos;
- resultado da comparação;
- histórico local;
- tela de perfil;
- status da API e autenticação;
- navegação por abas;
- rotas dinâmicas;
- gerenciamento de estado;
- imagens para melhorar a interface.

---

## Requisitos atendidos

| Requisito | Como foi atendido |
|---|---|
| App mobile | Feito com React Native e Expo |
| Interface clara | Cards, abas, botões e imagens |
| Navegação | Expo Router com rotas protegidas |
| Consumo de API | Axios, TanStack Query e Bearer token |
| Estado global | Zustand |
| Armazenamento local | AsyncStorage |
| Dados externos | API Java publicada no Railway |
| Valor ao usuário | Comparação de veículos e análise de gaps |
| Relação com a Ford | Inteligência competitiva automotiva |

---

## Melhorias futuras

- comparação com mais concorrentes;
- exportação de relatório;
- gráficos mais avançados;
- alertas de mercado;
- revisão de qualidade dos dados;
- refinamento das permissões por usuário.

---

## Conclusão

O **Ford SpecPulse Mobile** é uma versão MVP de um app para inteligência competitiva automotiva.

Ele permite explorar veículos, visualizar versões, comparar atributos técnicos e entender de forma simples onde a Ford possui vantagens ou pontos que precisam de atenção.

A proposta foi criar um app simples, funcional, visualmente organizado e conectado ao contexto do desafio da Ford.
