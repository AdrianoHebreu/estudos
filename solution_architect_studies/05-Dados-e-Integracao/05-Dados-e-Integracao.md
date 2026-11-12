# 05 Dados e integração

## Porque é que dados e integração são o centro do trabalho

Quase todos os problemas do caso **Casa Nova Distribuição** são problemas de dados e de ligação entre sistemas: o stock está no SAP mas o portal precisa dele em tempo real, o mesmo cliente existe em três sítios com três moradas, e as aplicações Delphi falam com o ERP por rotinas feitas à medida. Um arquiteto raramente decide **uma** base de dados; decide **onde cada dado vive, quem manda nele e como viaja** entre sistemas.

Este módulo tem duas metades: **dados** (onde guardar, como modelar, que consistência exigir) e **integração** (APIs, mensagens, ficheiros, e como ligar o SAP, o Delphi e os sistemas legados).

**NOTA:** os módulos 03 (estilos) e 04 (documentação) já te deram a forma de desenhar. Aqui escolhes as peças de dados e as ligações. A parte de cloud (serviços geridos, redes) aprofunda-se no 06 e a migração de legados no 11.

## Escolher o armazenamento de dados

A regra de partida: **escolhe pelo padrão de acesso, não pela moda**. Pergunta primeiro como os dados serão lidos e escritos (consulta por chave, junções, pesquisa de texto, percursos de relações, séries no tempo) e só depois procura o produto. A documentação de arquitetura da Azure descreve este método e lembra que um único repositório raramente serve todos os padrões, daí o termo **persistência poliglota** (vários modelos de dados na mesma solução).

| Modelo | Bom para | Cuidados | Exemplo Azure | Equivalente AWS |
|---|---|---|---|---|
| Relacional | Transações com várias linhas, junções, integridade, relatórios operacionais | Escalar na horizontal exige partição (*sharding*) | Azure SQL Database, Azure Database for PostgreSQL | Amazon RDS |
| Documento | Agregados em JSON cuja forma evolui, catálogos | Documentos que crescem; modelar para as consultas | Azure Cosmos DB for NoSQL | Amazon DynamoDB (chave-valor/documento) |
| Chave-valor | Leitura por chave com latência mínima: sessões, cache | Pouca capacidade de consulta por valor | Azure Managed Redis | Amazon ElastiCache |
| Coluna larga | Escritas em volume, dados esparsos, telemetria | Desenhar a chave da linha à partida | Azure Managed Instance for Apache Cassandra | Amazon Keyspaces |
| Grafo | Relações com profundidade variável: fraude, dependências | Exagero se as relações forem rasas | Extensões de grafo do SQL Server/Azure SQL | Amazon Neptune |
| Pesquisa | Texto livre, relevância, filtros por facetas | O índice é **cópia** dos dados, não a fonte | Azure AI Search | Amazon OpenSearch Service |
| Objeto/ficheiro | PDFs, imagens, cópias de segurança, *data lake* | Operações sobre o objeto inteiro | Azure Blob Storage | Amazon S3 |

**DICA:** a documentação Azure lista como antipadrões partilhar **uma base de dados entre vários microsserviços** (cria acoplamento) e usar o **índice de pesquisa como repositório principal**. Guarda ambos como alarmes.

Um **cache** (Azure Managed Redis, Amazon ElastiCache) não é fonte de verdade: guarda uma cópia rápida de dados que vivem noutro sítio. O padrão habitual é o **cache-aside**: a aplicação lê da cache; se falhar (cache miss), lê da base de dados, guarda na cache e devolve; ao alterar, escreve na base de dados e **invalida** a entrada da cache (por esta ordem).

    Leitura:   app -> cache? sim: devolve
                       não : app -> base de dados -> guarda na cache -> devolve
    Escrita:   app -> base de dados -> invalida a entrada na cache

**ATENÇÃO:** o cache-aside não garante consistência: entre a escrita e a próxima leitura pode haver leitura desatualizada. Define um tempo de expiração que corresponda à tolerância do negócio e não coloques dados sensíveis numa cache partilhada.

**NOTA:** a Azure indica o Azure Managed Redis como o serviço atual para este papel e documenta a migração a partir do Azure Cache for Redis. Confirma sempre o nome do produto no portal antes de o pôr num desenho.

## Modelação e consistência

**Modelar para relacional:** normalizas (cada facto num só sítio), usas chaves estrangeiras e escreves consultas com junções. **Modelar para documento:** agregas o que é lido em conjunto (uma encomenda com as suas linhas) e aceitas **duplicar** dados para ler depressa. Em ambos os casos, o erro típico é escolher o produto e só depois pensar nas consultas.

**Consistência** responde a: depois de escrever, quem lê vê já o valor novo? Nos sistemas distribuídos há um compromisso entre consistência, disponibilidade e latência. O Azure Cosmos DB expõe-no em **cinco níveis**, do mais forte ao mais fraco:

| Nível | Ideia | Quando |
|---|---|---|
| Strong | Lês sempre a última escrita confirmada | Saldos, reservas de stock críticas; custa latência de escrita |
| Bounded staleness | Atraso máximo definido (versões ou tempo) | Quase forte entre regiões |
| Session | Dentro da tua sessão lês as tuas escritas | O mais usado nas aplicações por utilizador |
| Consistent prefix | Nunca vês escritas fora de ordem | Sequências que têm de manter ordem |
| Eventual | Pode ler valor antigo; converge depois | Contadores, «gostos», dados tolerantes |

**DICA:** transforma a consistência em requisito mensurável (módulo 02): «o stock mostrado no portal pode estar desatualizado no máximo 30 segundos» é uma frase que um arquiteto consegue implementar e testar.

### Dados mestres

**Dados mestres** são os dados de referência partilhados por vários processos: clientes, artigos, fornecedores, tabelas de preços. Quando cada sistema guarda a sua cópia, surgem duplicados e divergências.

| Decisão | Opções |
|---|---|
| Quem é o **dono** (sistema de registo) de cada entidade? | Um só sistema por entidade (por exemplo, o SAP para artigos e clientes) |
| Como se propagam as alterações? | Eventos/mensagens a partir do dono; ou carga periódica |
| Como se identificam os mesmos registos em sistemas diferentes? | Chave de negócio partilhada ou tabela de correspondência |
| Quem pode alterar? | Só o dono; os outros sistemas só leem cópias |

**ATENÇÃO:** «sistema de registo» (onde se escreve) e «cópia para leitura» (onde se consulta depressa) são papéis diferentes. A maioria dos desenhos saudáveis tem **um** sistema de registo por entidade e várias cópias derivadas, nunca duas fontes de verdade em conflito.

## APIs: REST, GraphQL e gRPC

Uma API é o **contrato** entre quem fornece e quem consome. Desenhá-la bem poupa anos de remendos.

| Estilo | Modelo | Forças | Limites | Usa quando |
|---|---|---|---|---|
| REST | Recursos em URLs, verbos HTTP, normalmente JSON | Simples, universal, bom com *cache* HTTP e ferramentas | Vários pedidos para dados agregados; *over/under-fetching* | API pública ou de parceiros; o caso geral |
| GraphQL | Um endpoint, o cliente descreve os campos | O cliente pede só o que precisa; um pedido para vários recursos | Exige cuidado com custo das consultas e cache | Muitos clientes com necessidades diferentes (web, mobile) |
| gRPC | Contrato `.proto`, mensagens binárias (Protocol Buffers), código gerado | Compacto e rápido, contratos tipados, vários idiomas | Menos amigável para navegadores e para depurar à mão | Comunicação interna entre serviços |

O gRPC define serviços em ficheiros `.proto` e gera cliente e servidor em várias linguagens, o que o torna forte entre serviços internos em linguagens diferentes. O GraphQL tem o seu módulo próprio noutro curso; aqui o que importa é saber **quando** escolhê-lo.

### Contratos e versionamento

Escreve o contrato **antes** do código: com a especificação **OpenAPI** descreves REST num ficheiro (recursos, parâmetros, respostas, erros) que gera documentação, simulações (mocks), testes e clientes. É a forma de equipas diferentes trabalharem em paralelo.

Boas práticas de REST que a documentação da Azure destaca:

- URLs com **substantivos** (recursos), não verbos: `/encomendas/123`, não `/obterEncomenda`.
- `GET` lê; `PUT` substitui e **tem de ser idempotente** (repetir o mesmo pedido não altera o resultado); `POST` e `PATCH` não são garantidamente idempotentes.
- Códigos de estado HTTP coerentes e erros com um formato único.
- Paginação nas coleções, para não devolver milhares de linhas.

Versionar serve para **evoluir sem partir quem já consome**. A Azure descreve quatro abordagens:

| Abordagem | Exemplo | Nota |
|---|---|---|
| Na URL | `/v2/encomendas` | Simples e favorável à *cache*; a mais comum |
| Parâmetro de pesquisa | `/encomendas?versao=2` | O mesmo recurso mantém a URL |
| Cabeçalho | `Api-Version: 2` | URLs limpas; exige que o cliente envie o cabeçalho |
| Tipo de média | `Accept: application/vnd.casanova.v2+json` | Mais fino; mais complexo de usar |

**DICA:** a melhor versão é a que não precisas de criar. Acrescentar campos opcionais é compatível; remover ou mudar o significado de um campo é uma **alteração que parte** e justifica versão nova com período de convivência anunciado.

Na empresa, um **gateway de APIs** (por exemplo, Azure API Management, Amazon API Gateway) centraliza autenticação, limites de utilização e publicação das APIs. A segurança em si fica para o módulo 07.

## Mensageria

Na integração **síncrona** o chamador espera pela resposta; na **assíncrona** envia uma mensagem e segue em frente. A mensageria desacopla no tempo (produtor e consumidor não têm de estar ligados ao mesmo tempo) e **nivela a carga**: os picos acumulam-se numa fila em vez de derrubar o serviço.

| Conceito | Significado | Exemplo |
|---|---|---|
| **Fila** (queue) | Ponto a ponto: cada mensagem é processada por **um** consumidor; vários consumidores competem (competing consumers) | Pedidos de faturação a processar |
| **Tópico** (topic) | Publicação-subscrição: cada subscrição recebe **uma cópia** | «Encomenda criada» para stock, faturação e notificações |
| **Mensagem** | Dados com contrato entre produtor e consumidor; espera-se uma ação | Comando «reservar stock» |
| **Evento** | Notificação de que algo aconteceu; quem publica não espera resultado | «Stock do artigo X mudou» |

A Azure oferece três serviços com papéis diferentes:

| | Azure Service Bus | Azure Event Grid | Azure Event Hubs |
|---|---|---|---|
| Propósito | Mensagens empresariais transacionais | Encaminhamento reativo de eventos | Ingestão e streaming em grande volume |
| Ordem | FIFO com sessões | Sem garantia | Por partição |
| Duplicados | Deteção disponível | Não | Não |
| Entrega | Pelo menos uma vez | Pelo menos uma vez | Pelo menos uma vez |
| Equivalente AWS | Amazon SQS e SNS | Amazon EventBridge | (streaming, fora do âmbito deste módulo) |

Os três oferecem entrega **pelo menos uma vez**: a mesma mensagem **pode chegar duas vezes**. Isto obriga a duas decisões de desenho.

**Idempotência.** Um consumidor é idempotente se processar a mesma mensagem duas vezes produz o mesmo resultado que uma. Técnicas: guardar o identificador das mensagens já tratadas e ignorar repetições; usar operações naturalmente idempotentes («definir stock = 40» e não «subtrair 2»); no envio, usar um identificador controlado pela aplicação (derivado do processo de negócio, como o número da encomenda) para que o Service Bus detete duplicados. A deteção de duplicados do Service Bus está disponível nos escalões Standard e Premium (não no Basic), com janela de 10 minutos por omissão, entre 20 segundos e 7 dias.

**Ordem.** Garantir ordem global custa desempenho. Normalmente só precisas de ordem **dentro de uma entidade** (as mensagens de uma mesma encomenda): usa sessões no Service Bus, ou um grupo de mensagens numa fila FIFO da AWS. As filas standard do Amazon SQS fazem o melhor esforço de ordem e entregam pelo menos uma vez.

**Mensagens que falham.** Uma mensagem que nunca é processada com sucesso (mensagem «veneno») não pode bloquear a fila: a **fila de mensagens não entregues** (dead-letter queue) recebe-a para inspeção e reenvio. Combina com repetições limitadas e com alerta operacional (módulo 08).

**Consistência entre base de dados e mensagem.** Gravar a encomenda **e** publicar o evento são duas operações: se uma falhar, ficam desalinhadas. O padrão **outbox transacional** grava o evento na mesma transação que a encomenda e um processo à parte publica-o. Existem guias da Azure para este padrão (ver fontes).

**DICA:** mensagens grandes (um PDF) não devem viajar na fila: guarda o ficheiro em armazenamento de objetos e envia só a referência (padrão claim check).

## Padrões de integração

O catálogo de referência é o livro *Enterprise Integration Patterns* (EIP), com padrões como canal de mensagens, tradutor, encaminhador e agregador. Não precisas de os decorar: precisas de reconhecer o problema e saber que já tem nome.

| Estilo | Como funciona | Quando | Risco |
|---|---|---|---|
| Pedido-resposta síncrono (API) | O chamador espera | Consulta imediata, o utilizador está à espera | Acoplamento: se o outro lado cai, tu caís |
| Mensagens/eventos assíncronos | Fila ou tópico entre os sistemas | Processos que toleram atraso, picos de carga | Duplicados, ordem, depuração mais difícil |
| Transferência de ficheiros | Um sistema exporta, outro importa (CSV, XML) | Sistemas antigos, grandes volumes em lote | Atraso, formatos frágeis, falhas silenciosas |
| Base de dados partilhada | Dois sistemas leem as mesmas tabelas | Quase nunca | Acoplamento forte ao esquema; evita |
| ETL/ELT | Mover e transformar dados para análise | Relatórios, armazém de dados | Latência; não serve para operações em tempo real |

**ETL vs ELT:** no ETL (extrair, transformar, carregar) a transformação acontece **antes** de carregar, num motor próprio; no ELT carregas primeiro e transformas **dentro** do destino, que tem de ter capacidade para isso (típico em data warehouses e lakehouses). Escolhe ETL quando o destino é limitado ou há regras complexas ou de auditoria antes de carregar; ELT quando o destino é elástico e queres guardar os dados em bruto. Serviços: Azure Data Factory/Fabric Data Factory (Azure), AWS Glue.

**NOTA:** ETL/ELT é integração **analítica**. A integração operacional (a encomenda do portal chegar ao SAP) faz-se por APIs ou mensagens.

**Orquestração.** Para fluxos com vários passos entre sistemas, ferramentas de integração (como Azure Logic Apps) ligam serviços com conectores. Procedimentos que têm de ser desfeitos se um passo falhar usam o padrão **saga** (transações compensatórias).

## Integrar o SAP

O SAP é o sistema de registo de stock, encomendas e clientes. A regra de ouro: **não integres contra as tabelas**; usa as interfaces suportadas.

| Aspeto | O que verifiquei na documentação oficial |
|---|---|
| Protocolos | Na documentação do ambiente ABAP do SAP S/4HANA Cloud, os protocolos disponíveis para comunicação de entrada e saída são **OData, HTTP, RFC e SOAP**; o serviço escolhido no cenário de comunicação determina o protocolo |
| SAP Integration Suite | Plataforma de integração do SAP na BTP, com capacidades que incluem **Cloud Integration**, **API Management**, **Event Mesh** e **Integration Advisor** |
| Event Mesh | Permite publicar e consumir eventos entre aplicações |

**O que NÃO está confirmado aqui:** a disponibilidade e a configuração de **BAPI**, **IDoc** e **RFC** na versão exata do SAP da empresa (on-premises ou private cloud diferem do ambiente cloud). Estas interfaces são antigas e muito usadas no SAP; confirma com a equipa SAP e na documentação da **tua** versão o que existe e como se autoriza. Também não verifiquei quais serviços OData existem para stock ou encomendas: consulta o catálogo de APIs do SAP (SAP Business Accelerator Hub) e a ajuda oficial.

**ATENÇÃO:** quem fala com o SAP não é o arquiteto: é a equipa SAP/Basis. Leva requisitos concretos (volume, latência, autenticação) e pergunta o que a versão deles suporta. Nunca assumas que uma interface existe porque existe noutra versão.

Padrões práticos para o caso:

- **Leitura frequente (stock no portal):** não consultes o SAP a cada pedido; mantém uma **cópia de leitura** (cache ou base de dados) atualizada por eventos ou carga frequente.
- **Escrita (encomenda para o SAP):** publica a encomenda numa fila; um conector chama a interface do SAP; o SAP confirma; o consumidor é idempotente.
- **Camada intermédia:** uma plataforma de integração ou API própria isola o resto dos sistemas dos detalhes SAP.

## Aplicações Delphi

As aplicações Delphi de balcão da Casa Nova ligam-se hoje diretamente a bases de dados e ao SAP por rotinas feitas à medida. Duas opções de integração:

| Opção | Ideia | Nota |
|---|---|---|
| Cliente REST | A aplicação Delphi chama as novas APIs (JSON sobre HTTP) | O RAD Studio inclui uma biblioteca de cliente REST; confirma a versão e componentes na documentação da Embarcadero |
| Camada de dados | A aplicação deixa de falar com tabelas e passa a falar com uma API ou serviço de dados | É aqui que entra a camada anti-corrupção (abaixo) |

**ATENÇÃO:** o que **não verifiquei**: detalhes técnicos de FireDAC, componentes REST e autenticação concreta no teu Delphi (o site da documentação da Embarcadero recusou a verificação automática). Confirma na documentação da tua versão antes de prometeres prazos.

A decisão estrutural importa mais que o componente: **as aplicações Delphi não devem conhecer o SAP nem os esquemas de outros sistemas**; devem conhecer **uma API estável** da Casa Nova. Assim, trocas o que está por trás sem reescrever o balcão.

## Sistemas legados e camada anti-corrupção (introdução)

Um sistema legado traz o seu modelo de dados, nomes e protocolos. Se os novos serviços os adotarem, o desenho moderno fica **corrompido** pelo antigo. A **camada anti-corrupção** (ACL) é um tradutor entre os dois mundos: o novo sistema usa sempre o seu modelo; a ACL converte de e para o modelo legado.

    Novo serviço (modelo Casa Nova)
            |
            v
    [ Camada anti-corrupção ]  traduz modelos, valida, regista erros
            |
            v
    SAP / Delphi / ficheiros (modelo legado)

Segundo a documentação da Azure, pode ser um componente dentro da aplicação ou um serviço independente; acrescenta latência e **mais um componente a operar**; deve concentrar-se na **tradução** (sem regras de negócio) e convém decidir se é permanente ou se desaparece quando o legado for retirado. Pode ser síncrona ou assíncrona (com mensagens). O padrão aprofunda-se no módulo 11, em conjunto com a migração gradual (strangler).

## Exemplo trabalhado: stock em tempo real e encomendas online

**Requisitos (módulo 02):** o stock mostrado no portal pode estar desatualizado no máximo 30 s; uma encomenda nunca se perde nem se duplica; o SAP não pode ser sobrecarregado.

    Portal web --> API de catálogo/stock --> cache (stock por artigo)
                                                 ^
    SAP --(evento "stock alterado")--> tópico --> atualizador --> base de leitura
    Portal --(POST /v1/encomendas, com identificador)--> API de encomendas
         API grava na sua base + outbox --> fila "encomendas" --> conector SAP
         conector SAP: idempotente, DLQ para falhas, ordem por encomenda

| Dado | Armazenamento | Porquê |
|---|---|---|
| Artigos, clientes (mestres) | SAP é o sistema de registo; cópia de leitura no portal | Um só dono; leitura rápida |
| Encomendas em curso | Relacional (ex.: Azure SQL Database) | Transações e integridade |
| Stock exibido | Cache (Azure Managed Redis) + base de leitura | 30 s de tolerância; poupa o SAP |
| Pesquisa de produtos | Índice de pesquisa (ex.: Azure AI Search) | Texto livre e filtros; só cópia |
| Faturas em PDF | Armazenamento de objetos (Blob Storage) | Ficheiros grandes, baratos |

Decisões registadas (como ADR, módulo 04): consistência **eventual com limite de 30 s** para o stock; APIs REST versionadas na URL para o portal e parceiros; Service Bus para encomendas (transações, sessões, deteção de duplicados); Delphi consome as APIs através de uma camada de acesso própria.

## Modelo reutilizável: perguntas-guia para dados e integração

**Para cada dado:** quem é o dono? Quem lê, com que frequência e com que latência aceitável? Que consistência é aceitável? Quanto cresce? Quanto tempo se guarda (RGPD, módulo 07)?

**Para cada integração:**

1. É consulta ou comando? É evento ou mensagem?
2. O chamador precisa mesmo da resposta já? (se não, assíncrono)
3. O que acontece se o outro lado estiver em baixo uma hora?
4. A operação é idempotente? Como se evitam duplicados?
5. É necessária ordem? Dentro de que âmbito?
6. Quem é o dono do contrato e como se versiona?
7. Como se vê que falhou (registos, alertas, fila de falhas)?
8. Há um sistema legado no caminho? Precisa de camada anti-corrupção?

## Depende da empresa

- **Equipa pequena:** menos peças. Uma base relacional bem desenhada e uma fila resolvem muito; evita seis tecnologias de dados que ninguém sabe operar.
- **Dimensão e volume:** a deteção de duplicados, os níveis de consistência e as filas com sessões só compensam a partir de certo volume e criticidade.
- **Cultura de SAP:** em muitas empresas o SAP é gerido por uma equipa à parte, com o seu calendário de alterações; a integração tem de caber nesse processo.
- **Política de dados:** algumas organizações exigem que cada dado tenha dono formal (governação de dados); noutras isso não existe e começas tu.
- **Fornecedor cloud:** os conceitos mantêm-se; só os nomes dos serviços mudam.

## Erros comuns

- Escolher o armazenamento pelo produto da moda, sem partir dos padrões de acesso.
- Várias fontes de verdade para o mesmo dado, sem dono.
- Usar o índice de pesquisa ou a cache como repositório principal.
- Partilhar uma base de dados entre serviços ou integrar diretamente nas tabelas de outro sistema.
- Assumir que a mensagem chega **uma** vez e pela ordem certa.
- Esquecer a fila de mensagens com falhas e a monitorização.
- Mudar um contrato de API sem versão nem aviso aos consumidores.
- Tornar tudo síncrono: a disponibilidade final é o produto das disponibilidades de todos os sistemas em cadeia.
- Pôr regras de negócio na camada anti-corrupção em vez de só tradução.
- Prometer prazos de integração com o SAP sem ouvir a equipa que o gere.

## Ligação às certificações

No **AZ-305**, o armazenamento de dados é um **domínio próprio**. Na página oficial de competências (versão de abril de 2026) o domínio «Design data storage solutions» agrupa: dados relacionais (escolher solução, escalões de serviço, escalabilidade, proteção), dados semiestruturados e não estruturados (escolher a solução, equilibrar funcionalidade, desempenho e custo, proteção e durabilidade) e **integração de dados** (soluções de integração e de análise de dados). Os temas de mensagens, eventos, integração de APIs e cache aparecem no domínio de **infraestrutura**, em «Design an application architecture» (messaging architecture, event-driven architecture, API integration, caching solution). A página oficial indica as percentagens de cada domínio: confirma-as lá, pois mudam.

| Tema do módulo | Serviço Azure principal | Equivalente AWS |
|---|---|---|
| Relacional | Azure SQL Database / PostgreSQL / MySQL | Amazon RDS |
| Documento e chave-valor | Azure Cosmos DB, Azure Managed Redis | DynamoDB, ElastiCache |
| Objetos e ficheiros | Azure Blob Storage | Amazon S3 |
| Pesquisa | Azure AI Search | Amazon OpenSearch Service |
| Mensagens e eventos | Service Bus, Event Grid, Event Hubs | SQS e SNS, EventBridge |
| APIs | Azure API Management | Amazon API Gateway |
| Integração de dados | Azure Data Factory / Fabric | AWS Glue |

**DICA:** o AZ-305 pede que **recomendes** com base em requisitos (consistência, custo, escala). Treina a justificação escrita: é exatamente o que fazes nos exercícios.

## Exercícios

**PRATICAR:** faz os exercícios **17** (escolher armazenamento), **18** (desenhar o contrato de uma API), **19** (analisar um desenho de mensagens) e **20** (integrar SAP, Delphi e legado com camada anti-corrupção) do módulo 15, e confere com as soluções no módulo 17.

## Fontes oficiais

- [Azure: Understand data models (data store models)](https://learn.microsoft.com/azure/architecture/data-guide/technology-choices/understand-data-store-models)
- [Azure Cosmos DB: níveis de consistência](https://learn.microsoft.com/azure/cosmos-db/consistency-levels)
- [Azure Managed Redis: visão geral](https://learn.microsoft.com/azure/redis/overview)
- [Padrão Cache-Aside](https://learn.microsoft.com/azure/architecture/patterns/cache-aside)
- [Boas práticas de desenho de APIs web (Azure)](https://learn.microsoft.com/azure/architecture/best-practices/api-design)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [gRPC: introdução](https://grpc.io/docs/what-is-grpc/introduction/)
- [Azure Service Bus: visão geral](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview)
- [Azure Service Bus: deteção de duplicados](https://learn.microsoft.com/azure/service-bus-messaging/duplicate-detection)
- [Comparação Event Grid, Event Hubs e Service Bus](https://learn.microsoft.com/azure/service-bus-messaging/compare-messaging-services)
- [Padrão Transactional Outbox (Cosmos DB)](https://learn.microsoft.com/azure/architecture/databases/guide/transactional-outbox-cosmos)
- [Padrão Claim Check](https://learn.microsoft.com/azure/architecture/patterns/claim-check)
- [Padrão Anti-Corruption Layer](https://learn.microsoft.com/azure/architecture/patterns/anti-corruption-layer)
- [ETL e ELT (Azure Architecture Center)](https://learn.microsoft.com/azure/architecture/data-guide/relational-data/etl)
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- [SAP: What is SAP Integration Suite](https://help.sap.com/docs/integration-suite/sap-integration-suite/what-is-sap-integration-suite)
- [SAP: Event Mesh](https://help.sap.com/docs/integration-suite/sap-integration-suite/event-mesh)
- [SAP: ABAP Integration and Connectivity (S/4HANA Cloud)](https://help.sap.com/doc/92f2c1b209a243639a63769070b0dd58/s4hana_cloud/en-US/6e28a25c7dcd4aa395328b1784736547.pdf)
- [Guia de estudo do exame AZ-305](https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-305)
- [Amazon SQS: filas standard](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html)
- [Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [Amazon ElastiCache](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)
- [Amazon OpenSearch Service](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html)
- [Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
- [Amazon EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html)
- [AWS Glue](https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html)
- [Amazon SNS](https://docs.aws.amazon.com/sns/latest/dg/welcome.html)
- [Amazon Neptune](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html)
- [Amazon Keyspaces](https://docs.aws.amazon.com/keyspaces/latest/devguide/what-is-keyspaces.html)
