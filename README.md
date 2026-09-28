# Ford SpecPulse

App para consultar fichas técnicas e comparar um veículo Ford com um concorrente. Trabalho da **Sprint 3 de Mobile Development and IoT — FIAP, Desafio Ford 01**.

## Integrantes

| Nome | RM |
|---|---:|
| Carlos Henrique | 558003 |
| Mauricio Alves | 556214 |
| Ian Monteiro | 558652 |
| Bruno Silva | 550416 |
| João Hoffmann | 550763 |

## Passo a passo para testar

1. Na entrega da disciplina, baixe o anexo **FordSpecPulse-1.2.2.apk** para um celular Android. O APK é entregue como anexo, separado deste repositório.
2. Abra o arquivo baixado e permita a instalação por essa origem quando o Android solicitar. Toque em **Instalar**.
3. Abra **Ford SpecPulse**, com o celular conectado à internet. Não precisa de Expo Go. Entre com esta conta:

   **Login:** `admin@ford.internal`

   **Senha:** `admin123`

4. Em **Veículos**, procure **Ford Ranger Raptor**, ano **2024**, mercado **BR**. Abra a versão **Raptor 3.0 V6 Biturbo Gasolina 4x4 Cabine Dupla**, selecione **Torque maximo** e toque em **Consultar ficha**.
5. Vá para **Comparar**. Selecione essa mesma versão Ford e a concorrente **Toyota Hilux**, ano **2024**, mercado **BR**, versão **SRX 2.8 Diesel 4x4 Cabine Dupla**.
6. Selecione **Torque maximo**, digite **banco massageador** no campo de atributos e toque em **Adicionar atributo**. Depois, toque em **Gerar comparação**.
7. Confira os valores lado a lado e abra **Fontes e observações**. O termo “banco massageador” aparece como não reconhecido na base; isso não confirma que o equipamento está ausente no veículo.
8. Toque em **Salvar análise** e abra a aba **Histórico**. Feche e abra o app novamente, volte ao histórico e toque em **Abrir análise** para conferir o resultado salvo. Depois, volte ao histórico e toque em **Excluir análise**.
9. Volte ao **Início**, abra **Meu perfil** e toque em **Sair da conta**.

O histórico fica salvo no dispositivo, separado por conta. Consultas e comparações dependem de internet e da API disponível.

## Sobre a entrega

O trabalho reúne **código-fonte, APK instalável e [demonstração das dez telas](docs/demonstracao-sprint-3.md)**. O app foi feito com React Native, Expo SDK 56 e TypeScript. As telas ficam em `src/app`, os componentes em `src/components` e a integração com a API em `src/services`.

O APK 1.2.2 usa a nova API Render; instalação, login, ficha da Raptor e saída da conta foram testados no Android 16. Os fluxos completos de comparação, histórico após reinício e saída da conta foram testados na versão 1.2.1; a atualização muda o endereço do servidor. Também passaram 42 testes automatizados, a checagem de TypeScript e o lint. [Registro dos testes](docs/qa-sprint-3.md).

**Pendência:** o slide da Ranger Raptor já foi conferido. A API ainda retorna alguns dados incompletos e aceleração diferente da referência (5,9 s em vez de 5,8 s). Falta corrigir a base e repetir a validação. [Detalhes](docs/validacao-ranger-raptor.md).
