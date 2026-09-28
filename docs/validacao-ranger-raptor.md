# Ranger Raptor — conferência com o slide da Ford

Referência recebida em 26/09/2026: **FORD_apresentacao (1).pdf**, página **13**, “RANGER RAPTOR”. A página **18** pede que a solução entregue corretamente todas as especificações desse slide. A referência foi localizada; a conferência revelou diferenças e dados ausentes na API.

## Consulta realizada

A conta de avaliação autorizada consultou a API Render em 26/09/2026, usando o mesmo endpoint e formato de pedido do aplicativo: `POST /api/fichas-tecnicas/consultar`. A resposta autenticada foi bem-sucedida. Foram pedidos 19 termos para separar os componentes das 14 linhas do slide.

Identidade retornada: **Ford Ranger Raptor, Raptor 3.0 V6 Biturbo Gasolina 4x4 Cabine Dupla, 2024 / BR**. O slide não explicita ano-modelo ou mercado; essa equivalência não deve ser presumida apenas pela foto. O resultado abaixo compara o conteúdo fornecido com a versão disponível no catálogo.

## Conferência item por item

| Item | Referência do slide | Retorno atual | Resultado |
|---|---|---|---|
| Motor | V6 3.0L Nano biturbo | “Motor” não reconhecido; nome da versão informa 3.0 V6 biturbo, sem Nano | Incompleto |
| Potência | 397 cv a 5.650 RPM | 397 cv; rotação não reconhecida | Valor confere; falta rotação |
| Torque | 583 Nm a 3.500 RPM | 583 Nm; rotação não reconhecida | Valor confere; falta rotação |
| Transmissão | Automática de 10 velocidades e paddle shifters | Ambos os pedidos não reconhecidos | Ausente |
| Tração | 4WD | Pedido não reconhecido; o nome da versão contém 4x4 | Ausente na ficha consultada |
| Amortecedores | Live Valve FOX Racing 2,5 polegadas | Suspensões dianteira e traseira citam FOX Live Valve 2.5 | Compatível com a tecnologia e medida; falta designação Racing |
| Aceleração de 0 a 100 km/h | 5,8 s | 5,9 s | Divergente |
| Modos de condução | Normal, Sport, Escorregadio, Lama, Areia, Rock Crawl, Baja | 7 | Quantidade compatível; faltam os nomes |
| Modos de volante | Normal, Sport, Conforto | Pedido não reconhecido | Ausente |
| Modos de escapamento | Normal, Silencioso, Sport, Baja | Pedido não reconhecido | Ausente |
| Modos de amortecedor | Normal, Sport, Baja | Pedido não reconhecido | Ausente |
| Faróis | Matrix LED | Pedido não reconhecido | Ausente |
| Rodas e pneus | Rodas de 17 polegadas, pneus 285/70 R17 AT | Pneus BFGoodrich All-Terrain T/A KO2 285/70 R17; “Rodas” não reconhecido | Pneus compatíveis; falta resposta para rodas |
| Preço | Texto literal “R$499.00” | Pedido não reconhecido | Ausente; valor do slide precisa de esclarecimento |

O preço está escrito assim no próprio slide, não apenas na extração de texto. Não foi convertido para R$ 499.000 nem usado para substituir o preço do catálogo. A frase promocional sobre ser a picape mais rápida não foi tratada como medição técnica.

[Pedido e resposta reais, sem credenciais](evidence/raptor-conferencia-slide-2026-09-26.json). A evidência inclui o hash do PDF para identificar a referência usada. Os estados `ATRIBUTO_DESCONHECIDO` e os valores retornados foram preservados.

## O que precisa ser corrigido

1. Confirmar a identidade de ano/mercado do slide e esclarecer o preço.
2. Na API, completar a taxonomia e os sinônimos dos termos ausentes, cadastrar os valores e associar a fonte recebida. Incluir rotações, nomes dos modos e os demais detalhes da tabela.
3. Resolver o conflito de aceleração com a referência aplicável. Registrar a origem e não sobrescrever silenciosamente um dado de outro ano-modelo.
4. Publicar a correção da API e repetir a consulta acima e o percurso no APK. A ficha e a comparação devem apresentar os mesmos dados e manter a origem visível.

A documentação OpenAPI consultada não oferece criação/edição de atributos ou especificações. As rotas de alteração de usuários não resolvem essas lacunas. O repositório da API não foi localizado no ambiente; sua localização foi solicitada ao responsável.

**Aceite ainda aberto:** reprodução completa do slide. O aplicativo permite solicitar esses termos e mostra corretamente os estados recebidos, mas isso não satisfaz a exigência de retornar todas as especificações corretas. Nenhum valor fixo foi inserido no aplicativo para esconder a diferença da base.

## Evidências anteriores

A consulta de 25/09 registrou 23 atributos do catálogo, com 21 valores presentes e dois consumos não informados. Essa quantidade não comprova cobertura do slide agora recebido.

- [Ficha anterior](evidence/ranger-raptor-2024-sheet.json).
- [Especificações anteriores do catálogo](evidence/ranger-raptor-2024-specifications.json).
- [Testes e capturas do aplicativo](qa-sprint-3.md).

O arquivo `Ford.rar` também contém `FIAP-Ford - Data sheet_Desafio_01_v02.xlsx` e `vin_share_Desafio_02.xlsx`. A referência explícita para esta conferência é a página 13 da apresentação; a segunda planilha pertence ao outro desafio.
