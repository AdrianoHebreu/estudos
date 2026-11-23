# Integração B2B e acordos com parceiros

Dois fornecedores enviam avisos de expedição. Ambos podem usar uma norma comum e escolher campos, códigos e repetições diferentes. O Integration Advisor ajuda a descrever essas escolhas e a desenhar o mapeamento; o Trading Partner Management liga os perfis e os acordos ao funcionamento do cenário B2B. Neste módulo vais ficar a saber que artefacto responde a que pergunta, desenhar a ficha de um aviso de expedição da Casa Nova e perceber como o acordo coloca isso a funcionar e como se monitoriza.

**NOTA:** este módulo foi escrito a partir da documentação oficial do Integration Advisor e do Trading Partner Management, sem execução no tenant. Cada afirmação traz o nome da página consultada. O que depende de capacidades ou licenças do teu tenant trial está marcado como «Por testar». A documentação de auditoria do Integration Advisor refere licenças de type systems, incluindo a expiração de uma licença de teste: confirma quais os type systems que tens disponíveis.

## O mapa do B2B no Integration Suite

| Capacidade | Onde fica o menu | Para quê |
|---|---|---|
| Integration Advisor | Discover, Type Systems; Design, MIGs, MAGs e Custom Type Systems | Descrever mensagens (MIG), mapeá-las (MAG) e gerar artefactos de runtime |
| Trading Partner Management | Design, B2B Scenarios; Monitor, B2B Scenarios | Perfis dos parceiros, templates e acordos, e monitorização de interchanges |
| Cloud Integration | Design, Integrations and APIs | Corre os fluxos que usam os artefactos gerados |

Segundo a documentação, o Integration Advisor usa uma abordagem de aprendizagem automática assente em conteúdo de outros utilizadores (crowd-based) e promete acelerar a criação de conteúdo B2B; o número de cerca de 60% vem de testes da própria SAP, por isso trata-o como indicação e não como garantia (Documentado, ISuite_Integration_Advisor: integration-advisor e overview-of-sap-integration-advisor).

## Da norma ao contrato implementado

| Artefacto | Pergunta a que responde | Exemplo Casa Nova |
|---|---|---|
| Type System | Qual é a estrutura de referência, mantida por uma entidade responsável | UN/EDIFACT, ASC X12, SAP IDoc |
| Message Implementation Guideline (MIG) | Que parte da mensagem usamos, num dado contexto de negócio | Aviso de expedição com os campos e códigos permitidos |
| Mapping Guideline (MAG) | Como traduzimos entre duas MIGs | Código e quantidade do fornecedor para o ERP |
| Perfil (profile) | Quem participa e como se identifica | Fornecedor Litorâneo |
| Agreement template e agreement | Que troca fazemos com este parceiro, em que condições | Aviso por AS2 com confirmação definida |

(Documentado, terminology-glossary-for-sap-integration-advisor e glossary-for-sap-trading-partner-management.)

### Type systems

A biblioteca de type systems reúne modelos de mensagem fornecidos pelas entidades que mantêm cada norma (por exemplo, o SAP IDoc é mantido pela SAP e o ASC X12 pela ANSI ASC X12). Cada type system tem mensagens, tipos complexos, tipos simples e listas de códigos (codelists). As normas listadas na documentação incluem EDI (ASC X12, EANCOM, Odette, Tradacoms, UN/EDIFACT, VDA, entre outras), XML (cXML, GS1 XML, RosettaNet, xCBL) e listas de códigos (ISO, GS1, UN/CEFACT); o UN/EDIFACT inclui a mensagem DESADV (aviso de expedição) (Documentado, library-of-type-systems e overview-of-b2b-standards).

Se a mensagem não existir na biblioteca (por exemplo, um formato proprietário), usas um **Custom Type System**, em Design: carregas um XSD ou WSDL e crias MIGs e MAGs sobre ele. Limites documentados (Documentado, custom-type-systems e limitations): o ficheiro de uma mensagem personalizada tem no máximo 10 MB e 20000 nós; só há um custom type system por tipo (XML, IDoc, SOA, codelists); não há suporte para xsd:include, xsd:any, nem para vários XSD com o mesmo namespace (juntas tudo num só ficheiro).

## A MIG: a ficha de uma mensagem

A MIG parte de uma mensagem do type system e descreve como ela é usada. Para criar: Design, MIGs, Create. O assistente tem estes passos (Documentado, creating-message-implementation-guidelines):

| Passo | O que escolhes ou preenches |
|---|---|
| Type System | O type system padrão ou um personalizado |
| Messages e Versions | A mensagem e a versão |
| Envelopes | O envelope (ou None); em cXML o envelope depende do tipo de mensagem |
| Sample Payload (opcional) | Um ficheiro ou um ZIP (até 25 ficheiros e 10 MB) que seleciona automaticamente os nós presentes |
| Node Selection | Nós a qualificar automaticamente, se o payload tiver os qualificadores |
| MIG Creation | Name, Direction (In, Out ou Both), Summary e pelo menos um valor de Business Context |

O sentido (Direction) é visto do ponto de vista B2B: se recebes o EDIFACT de um parceiro e o convertes num IDoc para o teu sistema, as duas MIGs são «In», porque o parceiro é o emissor lógico e a tua empresa a recetora.

Em cada nó (Documentado, working-with-a-node), podes editar:

| Propriedade | Para quê | Nota |
|---|---|---|
| Cardinality (min e max) | Quantas vezes o nó pode aparecer | Obrigatório é min 1; opcional é min 0 |
| Fixed Value | Um único valor possível | Entra na validação XML do payload |
| Example Values | Valores de exemplo | Usados na simulação com dados de exemplo |
| Qualifier | Valor de código que dá significado a um nó genérico | Ver abaixo |
| Primitive Type, Length, Format, Date Time Format | Tipo, tamanho e formato do campo | O Format é só documentação |
| XSD Patterns e XSD Assertions | Regras de validação adicionais | Entram nos XSD de runtime |
| Codelist e valores de código | Códigos permitidos | Definem o que a validação aceita |

Os **qualificadores** resolvem a ambiguidade de segmentos genéricos: um segmento de endereço serve para morada de entrega, de faturação ou de contacto, e o valor de código qualificador diz qual (Documentado, qualifying-nodes).

Ciclo de vida da MIG: nasce em Draft (versão 1.0); ao ativar (Activate) fica Active e já não se edita; editar uma MIG ativa cria uma versão Draft nova; ao ativar a seguinte, a anterior passa a Deprecated. Só há uma versão ativa e uma em rascunho de cada vez (Documentado, versioning-a-message-implementation-guideline). Podes simular a MIG com dados de exemplo ou com um payload teu (XML ou EDI de texto), e a simulação preenche cada folha com o valor de exemplo, o valor fixo, um código ou um valor fictício, por esta ordem (Documentado, simulating-message-implementation-guidelines).

**ATENÇÃO:** ao ativar uma MIG, a documentação diz que ela é enviada de forma anónima para o knowledge graph, para melhorar o serviço de propostas. Textos, exemplos e documentação não entram, mas propriedades de nós e seleções de códigos entram; nas MAGs, linhas de mapeamento, constantes e mapeamentos de códigos também entram. Se não queres partilhar, existe uma opção para desativar o serviço de propostas em Settings for MIGs and MAGs (Documentado, data-collection-for-knowledge-base). Não metas segredos em constantes.

## A MAG: do contrato de origem ao de destino

Uma MAG liga uma MIG de origem a uma MIG de destino. Há três tipos (Documentado, mapping-guidelines-mags e creating-standard-graphical-mapping-guidelines):

| Tipo | Como se define o mapeamento | Quando usar |
|---|---|---|
| Graphical MAG: Standard | Arrastas nós da origem para o destino e aplicas funções | O mapeamento base |
| Graphical MAG: Overlay | Camada sobre uma MAG base, para um parceiro ou projeto específico | Variações por parceiro sem duplicar tudo |
| XSLT MAG | Carregas um ficheiro XSLT já pronto | Mapeamento que já existe em XSLT |

Para criar uma standard: Design, MAGs, Create, Graphical MAG: Standard; escolhes a MIG de origem e a de destino e confirmas. Uma MAG standard fica com a etiqueta Base. Mapear um grupo de origem para um grupo de destino com max maior do que 1 cria uma instância do grupo de destino por cada instância de origem; mapear só folhas cria as instâncias a partir das folhas (Documentado, mapping-the-source-and-target-nodes).

### Código e unidade: o mapeamento de valores

Quando os dois nós têm listas de códigos, a MAG tem o separador Code Value Mapping: cada linha converte um código de origem num de destino, e as linhas são processadas de cima para baixo, com a regra mais específica primeiro. Podes definir um valor por omissão: ou passas o valor de origem tal como está, ou escolhes um código de destino. Linhas duplicadas, vazias ou sem código de destino são marcadas como erro (Documentado, code-value-mapping).

**NOTA:** a documentação consultada descreve só estes dois comportamentos por omissão (passar o valor ou escolher um código). Não descreve uma opção «rejeitar código desconhecido» no mapeamento. A rejeição, quando existir, vem da validação: os artefactos de runtime incluem validação de nós e de códigos suportados, a partir dos códigos escolhidos na MIG (Documentado, runtime-artifacts). Por isso, para a Casa Nova, rejeitar uma unidade desconhecida deve ser feito limitando os códigos na MIG. Se isto se comporta assim no teu tenant: por testar.

### Do desenho ao runtime

Em Export, a partir de uma MIG ou MAG, o Integration Advisor gera: esquemas de conversão de sintaxe (EDI para XML e o inverso), esquemas de validação, scripts de pré e pós-processamento, o XSLT principal do mapeamento e exemplos de teste (Documentado, exporting-runtime-artifacts). Num fluxo de EDI para IDoc, a documentação mostra a ordem dos passos do Cloud Integration: sender AS2, validar e analisar a troca EDI (gera confirmação), conversor de EDI para XML, pré-processamento dos qualificadores, validação alargada opcional, o XSLT da MAG, pós-processamento no destino e o recetor IDoc (Documentado, consuming-integration-advisor-artifacts-in-integration-flows). Os modelos de fluxo estão no pacote «EDI Integration Templates for SAP Integration Advisor» do SAP Business Accelerator Hub. Podes ainda simular a MAG com um payload de origem e, opcionalmente, um payload de destino esperado: o ecrã mostra o número de diferenças (Documentado, simulating-mapping-guidelines).

## Projeto de mapeamento da Casa Nova

O fornecedor envia a referência SHIP-42, a encomenda CN-1001 e duas unidades na sua unidade PCE. A Casa Nova guarda EA. A quantidade é um inteiro positivo, e a referência do aviso mantém-se disponível para reconciliação.

| Campo de origem | Campo alvo | Regra |
|---|---|---|
| shipmentReference | externalShipmentId | Obrigatório (min 1) e preservado |
| customerOrder | orderId | Obrigatório e preservado |
| supplierItem | sku | Mapeamento de códigos por parceiro |
| shippedQuantity | quantity | Inteiro positivo (tipo inteiro, e regra de validação) |
| quantityUnit | unit | Mapeamento de código: PCE passa a EA |

Estes nomes são campos de estudo e não nós reais de uma mensagem EDIFACT; no tenant, os nós vêm da mensagem escolhida (por exemplo DESADV) e tens de os identificar na estrutura. Regra de desenho para versões em paralelo: um parceiro pode continuar a enviar o contrato antigo durante a transição, por isso cada versão tem a sua MIG, a sua MAG e um acordo. Conservar um ficheiro rejeitado depende da política de retenção e das permissões.

## Trading Partner Management: perfis, templates e acordos

A ordem de trabalho documentada em Design, B2B Scenarios (Documentado, design-b2b-scenarios):

| Passo | O que é | Notas |
|---|---|---|
| Company Profile | A tua empresa, dona do tenant | Só há um por tenant; subsidiárias são perfis filhos |
| Trading Partner Profile | Um parceiro: contactos, Identifiers, Business Context, Systems, Certificates, Parameters, Security, Number Ranges | Identifiers identificam o parceiro de forma única (tipo de sistema, agência e esquema) |
| Communication Partner Profile | Perfil de um parceiro de comunicação, que podes incluir num template (opção Include Communication Partner) | Opcional |
| Agreement Template | Coreografia de transações, com valores por omissão | A SAP não fornece templates predefinidos |
| Agreement | Aplicação do template a um parceiro concreto | Ativa-se para enviar os dados ao Partner Directory |

Cada transação B2B (Business Transaction) define o padrão (uma via ou duas), o papel da tua empresa (Initiator ou Reactor), a comunicação do lado emissor, o passo de Interchange (por exemplo Empty Segment e Transaction Mode: Message ou Interchange, que decide se uma mensagem inválida rejeita só essa mensagem ou a troca inteira), a MIG, o mapeamento e o lado recetor (Documentado, creating-b2b-transactions). Ao criar um acordo, escolhes Copy from Template (o acordo tem as suas transações editáveis) ou Bind with Template (as transações ficam só de leitura e mudam quando o template muda) (Documentado, creating-agreement-latest-format).

**Versões do acordo (Documentado, versioning-in-trading-partner-management):** o rascunho (Draft) passa a versão numerada com Save as New Version (1.0, 2.0, ...); uma versão numerada é só de leitura, e para a mudar usas Copy as Draft. Existe no máximo um rascunho e cinco versões numeradas do mesmo artefacto. Ativar uma versão de um acordo coloca-a no Partner Directory e desativa a que estava ativa: só uma versão fica ativa de cada vez. A ativação tem dois modos: Default (não ativa segurança, grupos de identificadores nem regras personalizadas; falha se estiverem inativos) e Full (ativa tudo o que o acordo referencia) (Documentado, activating-a-trading-partner-agreement).

**ATENÇÃO:** o TPM usa só os 7 primeiros caracteres do tipo de mensagem para calcular o identificador no Partner Directory. Dois acordos com VDA4905:3 e VDA4905:4 geram o mesmo identificador e não podem estar ativos em simultâneo (Documentado, creating-b2b-transactions). Para versões em paralelo do mesmo tipo, planeia isto antes.

Os type systems suportados pelo TPM, segundo a documentação, incluem EDIFACT, EANCOM, Odette EDIFACT, VDA, X12, SAP IDoc, SAP SOAP (nuvem e on-premise), GS1 XML e Tradacoms; algumas variantes exigem a versão 2.0 do pacote «Cloud Integration - Trading Partner Management V2».

## Confirmar a receção, aceitar o negócio

A documentação distingue três coisas que não deves misturar:

| Nível | O que confirma | Onde aparece |
|---|---|---|
| Transporte | O documento chegou pelo canal (por exemplo AS2) | Adaptador e monitor do Cloud Integration |
| Confirmação funcional (functional acknowledgement) | O parceiro confirma a receção do interchange, como passo previsto na transação (nos canais AS2 há um campo próprio para isto) | Opção da transação; estado Waiting for Acknowledgment e categoria Acknowledgment Overdue no monitor B2B |
| Confirmação de aplicação | O sistema de destino aceitou o conteúdo (por exemplo stock e encomenda existentes) | Só se a transação a exigir; a documentação refere-a como opcional no passo de destino |

(Documentado, understanding-the-basic-concepts, creating-b2b-transactions e monitor-interchanges.) A aceitação de negócio não é um estado automático do TPM: depende de regras da Casa Nova, como stock, encomenda original e dados mestres.

## Monitorizar interchanges

Monitor, B2B Scenarios tem dois mosaicos. O de Interchanges mostra os interchanges atribuídos a um parceiro ou transação. O de Unassigned Interchanges mostra os que falharam na extração de metadados e por isso não têm documento de negócio associado. A retenção dos interchanges é de 90 dias (Documentado, monitor-b2b-scenarios).

| Categoria de erro | Significado provável | Onde olhar |
|---|---|---|
| Initial Decryption Failed | Falha na desencriptação à entrada | Certificados e chaves AS2 |
| Signature Validation Failed | Assinatura não validada | Certificado do parceiro no perfil |
| Agreement Configuration Access Failed | O fluxo não leu o acordo | Acordo ativo e Partner Directory |
| Interchange Validation Failed | O documento não cumpre a MIG | Payload face à MIG e códigos permitidos |
| Interchange Mapping Failed | Erro no XSLT ou nos dados | Simulação da MAG com o payload real |
| Interchange Transmission Failed | O destino não aceitou | Credenciais, rede e destino (módulos 06 e 03) |
| Acknowledgment Overdue | A confirmação esperada não chegou | Parceiro e prazos acordados |

(Documentado, monitor-unassigned-interchanges.) As ações de operação são Restart (volta ao Step 1b e repete o mapeamento, útil para erros de transformação), Retry (volta ao passo do recetor, sem repetir o mapeamento, útil para falhas de ligação) e Duplicate and Retry (só para interchanges Completed; cria uma cópia sem alterar o original). Exigem o destino B2BTPM_Reprocess_Endpoint, o papel B2bInterchangeOperate (incluído em PI_Business_Expert) e um motivo, e não se podem desfazer (Documentado, restart-or-retry-or-duplicate-and-retry-interchanges e monitor-interchanges). Ver payloads exige o papel B2bInterchangePayloadRead, que não vem incluído em nenhum role collection.

## Laboratório: MIG e MAG de aviso de expedição

**NOTA:** todo o laboratório é por testar: depende do Integration Advisor (e, no passo 5, do TPM) estar ativo no teu tenant e de haver um type system disponível.

1. Em Discover, Type Systems, abre UN/EDIFACT e procura a mensagem DESADV (ou outra do teu tenant). Em Design, MIGs, Create, escolhe a mensagem e uma versão, envelope None, sem payload de exemplo. Chama-lhe CN_MIG_Aviso_Origem, direção In, com um valor de Business Context.
2. No separador Structure, seleciona só os campos de que precisas (referência do aviso, encomenda, artigo, quantidade e unidade). Para a unidade, escolhe só os códigos PCE e EA na codelist. Marca os obrigatórios (cardinalidade min 1). Simula com dados de exemplo.
3. Cria a MIG de destino CN_MIG_Aviso_ERP (a partir de um IDoc ou de um custom type system com os cinco campos da Casa Nova). Ativa as duas MIGs.
4. Em Design, MAGs, Create, Graphical MAG: Standard, com as duas MIGs. Mapeia os campos da tabela. No mapeamento da unidade, abre o Code Value Mapping e acrescenta a linha PCE para EA. Simula com um payload válido, um sem referência e um com a unidade KGM. Regista o resultado de cada um.
5. Se tiveres TPM, esboça uma Company Profile e um Trading Partner Profile fictícios, cria um Agreement Template com uma transação e as duas MIGs e uma MAG, e vê quais os parâmetros de runtime que faltam antes de ativar. Não ativa com dados reais.

Resultado esperado (a confirmar): o payload válido produz uma linha com unit EA; o sem referência falha por obrigatório em falta; a unidade desconhecida é rejeitada se a MIG só aceitar os códigos escolhidos.

Sem estas capacidades, aplica a tabela a três fichas: uma entrada válida, uma sem referência e uma com unidade desconhecida. A primeira produz uma linha para o ERP; as outras duas ficam para correção com um código de motivo.

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| A MIG não mostra os campos que esperas | Se o nó foi selecionado na estrutura, e a versão e o envelope escolhidos |
| Não consigo editar a MIG | Está Active: cria uma versão Draft nova (Edit) |
| A simulação da MAG dá erro num nó | O diálogo de erro liga ao nó; verifica cardinalidade e tipo |
| A unidade desconhecida passou para o ERP | Valor por omissão do Code Value Mapping (passar o valor de origem) e os códigos permitidos na MIG |
| O custom XSD não carrega | Limites: 10 MB, 20000 nós, xsd:include, xsd:any, namespaces repetidos |
| A ativação do acordo falha | Modo Default com grupos de identificadores, segurança ou regras inativos; tenta Full ou ativa os referenciados |
| Dois acordos não ficam ativos ao mesmo tempo | Colisão do identificador do Partner Directory (7 primeiros caracteres do tipo de mensagem) |
| O interchange aparece como Unassigned | Falha na extração de metadados: vê a categoria de erro e o payload do interchange sem atribuição |
| Interchange Mapping Failed | Reproduz com a simulação da MAG; usa Restart depois de corrigir |
| Falha só no recetor | Retry em vez de Restart: o mapeamento está certo |

## Exercícios

**PRATICAR:** faz os exercícios 22 a 24 no módulo 13. Explica em que ponto confirmas a receção e em que ponto consideras o documento aceite pelo negócio.

## Fontes oficiais

- [Overview of SAP Integration Advisor](https://help.sap.com/docs/integration-suite/sap-integration-suite/overview-of-sap-integration-advisor?q=using+data+storage+features)
- [Creating Message Implementation Guidelines](https://help.sap.com/docs/integration-suite/isuite-integration-advisor/creating-message-implementation-guidelines?locale=en-US)
- [Working with Trading Partner Agreements](https://help.sap.com/docs/integration-suite/sap-integration-suite/creating-trading-partner-agreement?locale=en-US)
- [Code Value Mapping](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integration_Advisor/code-value-mapping-eb6dad8.md)
- [Mapping Guidelines (MAGs)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integration_Advisor/mapping-guidelines-mags-42124f4.md)
- [Versioning in Trading Partner Management](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Trading_Partner_Management/versioning-in-trading-partner-management-09685b7.md)
- [Monitor B2B Scenarios](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Trading_Partner_Management/monitor-b2b-scenarios-9dc75c8.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0).
