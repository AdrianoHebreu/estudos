# Integração B2B e acordos com parceiros

Dois fornecedores enviam avisos de expedição. Ambos podem usar uma norma comum e escolher campos, códigos e repetições diferentes. Integration Advisor ajuda a descrever essas escolhas e o mapeamento. Trading Partner Management liga os perfis e acordos ao funcionamento do cenário B2B.

## Da norma ao contrato implementado

| Artefacto | Pergunta a que responde | Exemplo |
|---|---|---|
| Type System | Qual é a estrutura de referência | Versão de UN/EDIFACT |
| MIG | Que parte dessa estrutura usamos | Aviso de expedição com códigos permitidos |
| MAG | Como traduzimos entre duas MIGs | Código e quantidade para o ERP |
| Perfil | Quem participa e como se identifica | Fornecedor Litorâneo |
| Acordo | Que troca fazemos com este parceiro | Aviso com transporte e confirmação definidos |

A Message Implementation Guideline, ou MIG, descreve como uma mensagem é usada num contexto. Define os segmentos relevantes, o uso, os tipos, as cardinalidades e os valores permitidos. A Mapping Guideline, ou MAG, descreve transformações e correspondências de origem para destino. Usa uma MIG de origem e uma de destino coerentes com as versões negociadas.

Um acordo B2B documenta participantes, sentido da troca e condições de operação conforme o cenário. Uma confirmação técnica pode indicar que o documento chegou ou foi interpretado. A aceitação de negócio pode depender de stock, pedido original e dados mestres.

## Projeto de mapeamento

O fornecedor envia a referência `SHIP-42`, a encomenda `CN-1001` e duas unidades na sua unidade `PCE`. A Casa Nova guarda `EA`. Modela o mapa PCE para EA e rejeita uma unidade desconhecida. A coluna de quantidade usa um inteiro positivo. A referência do aviso mantém-se disponível para reconciliação.

| Campo de origem | Campo alvo | Regra |
|---|---|---|
| shipmentReference | externalShipmentId | Obrigatório e preservado |
| customerOrder | orderId | Obrigatório e preservado |
| supplierItem | sku | Tabela de equivalência por parceiro |
| shippedQuantity | quantity | Inteiro positivo |
| quantityUnit | unit | PCE passa a EA |

Define a estratégia para versões em paralelo. Um parceiro pode continuar a enviar o contrato antigo durante a transição. Liga a versão e o parceiro ao mapeamento e usa exemplos distintos no teste. Conservar um ficheiro rejeitado depende da política de retenção e das permissões.

## Laboratório de MIG e MAG

1. Se tiveres Integration Advisor, cria versões de treino para uma MIG de origem e outra de destino com Type Systems disponíveis.
2. Seleciona o conjunto mínimo de campos, marca os obrigatórios e define a cardinalidade. Regista as amostras válidas e as que faltam campos.
3. Cria uma MAG entre as duas guidelines. Mapeia o identificador e a quantidade e documenta a tradução do código de unidade.
4. Se Trading Partner Management estiver disponível, esboça um acordo de teste com perfis fictícios. Confirma qual o conteúdo de runtime necessário antes de o ativar.
5. Sem estas capacidades, aplica a tabela a três fichas. Usa uma entrada válida, uma sem referência e uma com unidade desconhecida. O primeiro resultado produz uma linha para o ERP. Os dois restantes ficam para correção com um código de motivo.

## Exercícios

Resolve os exercícios 22 a 24 no módulo 13. Explica em que ponto confirmas a receção e em que ponto consideras o documento aceite pelo negócio.

## Fontes oficiais

- [Overview of SAP Integration Advisor](https://help.sap.com/docs/integration-suite/sap-integration-suite/overview-of-sap-integration-advisor?q=using+data+storage+features)
- [Creating Message Implementation Guidelines](https://help.sap.com/docs/integration-suite/isuite-integration-advisor/creating-message-implementation-guidelines?locale=en-US)
- [Working with Trading Partner Agreements](https://help.sap.com/docs/integration-suite/sap-integration-suite/creating-trading-partner-agreement?locale=en-US)
