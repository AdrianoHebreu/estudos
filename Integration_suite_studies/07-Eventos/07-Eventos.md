# Eventos e mensageria

Quando o ERP aceita uma encomenda, stock e expedição precisam de reagir. O emissor pode publicar um facto e continuar a trabalhar, e cada consumidor recebe-o ao seu ritmo. Neste módulo vais desenhar o tópico, as filas e a configuração do Event Mesh para a Casa Nova, perceber o que a plataforma garante na entrega (e o que fica por tua conta) e simular uma entrega repetida.

**NOTA:** este módulo foi escrito a partir da documentação oficial do Event Mesh no SAP Integration Suite, sem execução no tenant. Cada afirmação técnica indica a página consultada. O Event Mesh pode não estar ativo no teu trial: o que depende disso está marcado como «Por testar». Os nomes de tópicos, filas e eventos da Casa Nova são convenção de estudo e não nomes impostos pela SAP.

## Eventos, comandos e consultas

Uma consulta pede o estado atual. Um comando solicita uma ação, como reservar duas unidades. Um evento descreve um facto ocorrido, como encomenda aceite. A aplicação que aceitou a encomenda é dona do evento; quem o recebe decide como reagir. A documentação define o evento como uma mudança de estado e a mensagem como o veículo que comunica esse evento (Documentado, ISuite_Event_Mesh: what-are-events). Os padrões de troca são três (Documentado, message-exchange-patterns):

| Padrão | Como funciona | Exemplo Casa Nova |
|---|---|---|
| Publicação e subscrição | Cada consumidor recebe a sua cópia da mensagem | Encomenda aceite chega a stock e a expedição |
| Ponto a ponto | Só um consumidor processa a mensagem | Fila de trabalho de uma tarefa única |
| Pedido e resposta | Dois canais ponto a ponto: um para o pedido, outro para a resposta | Consulta de disponibilidade |

A documentação diz que a maioria dos eventos usa publicação e subscrição.

## As ofertas de eventos do Integration Suite

| Oferta | O que é, segundo a documentação | Quando pensar nela |
|---|---|---|
| Event Mesh (capacidade do Integration Suite) | Um único broker, para volumes de eventos baixos a moderados | Este módulo |
| Advanced Event Mesh | Malha distribuída com vários brokers, para volumes altos | Quando o volume e a cobertura crescem |
| SAP Event Mesh (serviço autónomo, plano default) | Oferta anterior, com guia de migração | Não pode coexistir com a capacidade no mesmo subaccount |

(Documentado, event-mesh-bridge, troubleshooting-for-event-mesh e migration-from-event-mesh-...) Há uma ponte (bridge) que liga o broker da capacidade à rede do Advanced Event Mesh, para trocar eventos sem abandonar o broker atual. A documentação avisa que não há paridade um para um com o SAP Event Mesh autónomo (Documentado, event-mesh-scope). Um nome semelhante no catálogo não garante que as duas ofertas estejam no teu trial: por testar.

## Preparar o broker e o message client

Sequência documentada (initiating-the-message-broker, configure-a-message-client, service-descriptor-syntax):

| Passo | Onde | Detalhe |
|---|---|---|
| 1. Ativar a capacidade | Integration Suite, Activating and Managing Capabilities | Pré-requisito |
| 2. Iniciar o broker | Configure, Event Mesh, botão Activate | Uma só vez; exige o role collection EventMeshAdmin; mostra as especificações do broker |
| 3. Criar o message client | Cockpit BTP, serviço SAP Integration Suite Event Mesh, plano message-client | Exige as entitlements do plano no subaccount; recebe um descritor JSON |
| 4. Criar o binding | Menu da instância, Create Service Binding | Entrega as credenciais OAuth client credentials para as aplicações |

O descritor de serviço (service descriptor) define o namespace e as regras de publicação e de subscrição. Pontos da documentação:

- Sem regras no descritor, o cliente não pode publicar nem consumir.
- Os filtros de publicação de tópicos e filas devem começar por o teu namespace, por exemplo `${namespace}/*`.
- Um cliente sem namespace pode observar, publicar e consumir nas filas de outros clientes: recomenda-se um namespace por cliente.
- Recomenda-se publicar em tópicos e não diretamente em filas.

Exemplo para a Casa Nova, adaptado do exemplo da documentação (não executado nesta revisão):

    {
      "namespace": "casanova/estudo",
      "rules": {
        "topicRules": {
          "publishFilter": ["${namespace}/*"],
          "subscribeFilter": ["${namespace}/*"]
        },
        "queueRules": {
          "publishFilter": ["${namespace}/*"],
          "subscribeFilter": ["${namespace}/*"]
        }
      },
      "resources": { "units": 10 }
    }

**ATENÇÃO:** a capacidade Event Mesh do Integration Suite e o serviço Event Mesh autónomo (plano default) não podem coexistir no mesmo subaccount. Se a ativação falhar, é a primeira coisa a verificar (Documentado, troubleshooting-for-event-mesh).

Papéis: EventMeshAdmin gere o broker, as filas e as subscrições e monitoriza; EventMeshDeveloper gere filas e subscrições e monitoriza; EventMeshBusinessExpert permite ver payloads no monitor (Documentado, tasks-and-permissions-in-event-mesh e monitor-event-mesh).

## Tópicos e filas

Um **tópico** classifica o evento; é uma cadeia de segmentos separados por barras. Uma **fila** é o ponto onde o broker guarda as mensagens até o consumidor as confirmar; liga-se a tópicos através de **subscrições**. Regras de nomes documentadas (topic-naming-syntax, create-a-queue):

| Objeto | Regras |
|---|---|
| Tópico | Até 150 caracteres, entre 2 e 20 segmentos, sem segmentos vazios, caracteres alfanuméricos, sublinhado, ponto e hífen; a barra só como separador |
| Wildcard de tópico | Asterisco para uma subárvore, só no fim do nome; sinal de mais para um segmento completo |
| Fila | Até 164 caracteres; alfanuméricos, sublinhado, ponto e hífen; barra só como separador |

**NOTA:** a página «What Are Topics and Topic Subscriptions» dá o exemplo `sports/*/scores`, com o asterisco no meio, enquanto a página de sintaxe diz que o asterisco só vale no fim. Não uses wildcards a meio sem testar no teu broker: por testar.

Parâmetros de uma fila no assistente Create Queue (Documentado, create-a-queue):

| Campo | Para quê | Valor por omissão ou limite |
|---|---|---|
| Access type | NON EXCLUSIVE: vários consumidores, round-robin. EXCLUSIVE: um só consumidor de cada vez | Escolhes tu |
| Queue Size | Tamanho da fila em bytes | Por omissão e máximo: 1,5 GB |
| Message Size | Dados máximos por mensagem | Por omissão e máximo: 1 MB |
| Max Unacknowledged Messages Per Consumer | Limiar de mensagens por confirmar; acima dele não há novas entregas | Indicas tu |
| Max Redelivery Count | Máximo de tentativas de reentrega antes de purgar | 0 por omissão (repete até ao fim do TTL); máximo 255 |
| Dead Message Queue | Fila para onde vão as mensagens que esgotam as reentregas ou o TTL | Tem de existir antes |
| Max Time-to-live | Tempo máximo na fila sem ser consumida | 7 dias por omissão e máximo; depois a fila purga a mensagem |

Para uma subscrição de tópico: Configure, Event Mesh, separador Queues, escolhe a fila, separador Subscriptions, Create, indica o nome ou o padrão (Documentado, create-a-topic-subscription). Desenho da Casa Nova:

| Elemento | Valor de estudo |
|---|---|
| Namespace do message client | casanova/estudo |
| Tópico | casanova/estudo/orders/accepted/v1 |
| Fila de stock | casanova/estudo/q.stock (NON EXCLUSIVE, subscrita ao tópico) |
| Fila de expedição | casanova/estudo/q.expedicao (subscrita ao mesmo tópico) |
| Dead Message Queue | casanova/estudo/q.dlq, criada primeiro |
| Identificador do evento | evt-cn-1001-01 |
| Identificador de negócio | CN-1001 |

Cada fila subscrita ao mesmo tópico recebe a sua cópia; dois trabalhadores da mesma fila NON EXCLUSIVE partilham o trabalho em round-robin. Numa fila EXCLUSIVE só um consumidor recebe de cada vez, o que é a base para qualquer garantia de ordem; que garantias concretas o broker do Event Mesh dá nesse caso não vem na documentação consultada: por testar.

Limites do broker (Documentado, event-mesh-scope): mensagem de 1 MB no máximo, spool total de 2 GB, 200 ligações, 600 produtores e 600 consumidores (no máximo 3 de cada por ligação), 250 filas e 3000 subscrições de tópicos.

## O conteúdo do evento

A mensagem deve ter o mínimo necessário: identificador estável do evento, tipo, versão, hora e referência de negócio. Se o consumidor precisar de mais dados, consulta-os no serviço que os detém. Evolui o contrato acrescentando campos opcionais; quando o contrato partir, publica um tópico novo (por exemplo com v2 no nome).

    {
      "id": "evt-cn-1001-01",
      "type": "casanova.order.accepted.v1",
      "occurredAt": "2026-11-23T10:30:00Z",
      "orderId": "CN-1001"
    }

## Protocolos de publicação e consumo

| Protocolo | Recomendado para (documentação) | Notas |
|---|---|---|
| AMQP 1.0 sobre WebSocket | Mensagens de negócio fiáveis entre aplicações empresariais | SAP fornece uma implementação de referência em npm |
| MQTT 3.1.1 sobre WebSocket | Dispositivos limitados ou aplicações fora da nuvem, como o SAP S/4HANA | QoS 0 (no máximo uma vez) e 1 (pelo menos uma vez) |
| HTTP (REST) | Integração leve com ferramentas web | Protegido por OAuth bearer; a consumir exige o cabeçalho x-qos (0 ou 1) |

(Documentado, publish-and-consume-events.) Para usar as APIs REST, obténs primeiro o token: na service binding do message client, na secção «saprestmgw», estão clientid, clientsecret e o endpoint do token; acrescentas `?grant_type=client_credentials&response_type=token` ao endpoint e fazes um POST com autenticação básica (clientid e clientsecret) (Documentado, authenticate-your-rest-api-requests).

Entre o Cloud Integration e o broker, usa-se o adaptador AMQP (WebSocket, AMQP 1.0, porta 443, caminho `/protocols/amqp10ws`, autenticação OAuth2 Client Credentials com um artefacto do módulo 06). O receiver tem Destination Type (Queue ou Topic) e Destination Name no formato `queue:nome` ou `topic:nome`, Delivery (persistente ou não) e Expiration Period; limites: 50 ligações por instância de serviço e 1000 por subaccount, pelo que se recomenda uma instância por fila (Documentado, ISuite_Integrations_APIs: amqp-receiver-for-sap-event-mesh e amqp-sender-for-sap-event-mesh). Para o Advanced Event Mesh existe um adaptador próprio, com protocolo SMF, que depende do plano do serviço (advanced-event-mesh-adapter).

## Entrega, confirmação e duplicados

O ciclo de vida de uma mensagem numa fila (Documentado, queues): o produtor envia a mensagem garantida, o broker guarda-a, entrega-a ao consumidor se estiver online (ou retém-na), o consumidor confirma depois de processar e o broker remove-a.

| Situação | O que acontece | O que fazes |
|---|---|---|
| Consumidor confirma e processa | Mensagem removida da fila | Nada |
| Consumidor falha antes de confirmar | O broker volta a entregar (Delivery Count aumenta, Redelivered fica verdadeiro) | Garante que o efeito é único (idempotência) |
| Reentregas esgotadas ou TTL expirado | Vai para a Dead Message Queue, se existir; senão é purgada | Define a DMQ e quem a trata |
| Webhook com QoS 1 sem resposta 2XX | O Event Mesh volta a tentar com intervalos crescentes (começa aos 15 minutos, até uma vez por dia) | O webhook deve responder 2XX só depois de gravar |

Confirma uma mensagem depois de conseguires persistir o efeito ou a decisão. Duplicados têm duas respostas complementares: no consumidor, uma restrição de unicidade ou um registo de processamento transacional pela chave do evento; no Cloud Integration, o passo Idempotent Process Call, que recebe um Message ID e, com Skip Process Call for Duplicates selecionado, descarta repetições (Documentado, idempotent-process-call-handles-duplicates). No lado dos produtores, quando a publicação resulta de uma escrita na base de dados, uma outbox (tabela gravada na mesma transação e publicada depois por um processo fiável) reduz a lacuna entre gravar e anunciar; é um padrão geral e não uma funcionalidade documentada do Event Mesh.

Eventos fora de ordem: a documentação do broker não promete ordem entre consumidores de uma fila NON EXCLUSIVE. Uma regra de desenho para o estado: guardar no evento um número de versão ou a hora de ocorrência e só aplicar a atualização se for mais recente do que a guardada (proposta nossa, por testar com dados fictícios).

## Webhooks

Um webhook entrega as mensagens de uma fila a um consumidor REST, quase em tempo real e sem polling. Configura-se dentro de um message client (Documentado, create-a-webhook-subscription e handshake-and-its-status):

| Campo | Valores e comportamento |
|---|---|
| Queue | Obrigatória; as mensagens da fila são reencaminhadas |
| Quality of Service | 0: uma só tentativa, sem esperar confirmação. 1: pelo menos uma vez, com confirmação por resposta 2XX e novas tentativas |
| Exempt Handshake | Só ativa se não quiseres o pedido de handshake prévio |
| On Premise | Com Location ID do Cloud Connector; exige saída HTTPS na porta 443 para `*.eventmesh.integration.cloud.sap` |
| Content Type | Usado só se a mensagem não trouxer um; se não houver nenhum, aplica-se application/json |
| Authentication | None, Basic, OAuth 2.0 (client credentials ou com X.509), API Key ou certificado X.509 |

O Event Mesh envia no máximo 18 mensagens em paralelo para o webhook; com 18 por confirmar, pára de consumir da fila até haver confirmações. Antes de entregar, faz um handshake: um OPTIONS com o cabeçalho WebHook-Request-Origin; o webhook tem de responder com WebHook-Allowed-Origin igual ao valor recebido (ou asterisco). O estado do handshake é Not Initiated, Requested, Completed, Failed ou Exempted.

## Laboratório: um tópico, duas filas

**NOTA:** todo o laboratório é por testar: precisa da capacidade Event Mesh ativa no tenant e do role collection EventMeshAdmin.

1. Cria o message client com o descritor acima e o binding. Em Configure, Event Mesh, cria primeiro a fila de DLQ e depois duas filas, stock e expedição, NON EXCLUSIVE, com Max Redelivery Count 3 e a DLQ como Dead Message Queue.
2. Em cada fila, separador Subscriptions, Create, com o tópico casanova/estudo/orders/accepted/v1.
3. Em Test, Event Mesh, Publish Messages, escolhe Topic, o message client e o tópico, Content-Type application/json e o JSON do evento. Publica.
4. Em Test, Event Mesh, Consume Messages, consome da fila de stock e vê as Message Properties; depois da fila de expedição. Resultado esperado: as duas filas receberam o mesmo evento, evt-cn-1001-01.
5. Publica o mesmo JSON uma segunda vez. Em Monitor, Event Mesh, separador Queues, vê Messages Queued, Delivery Count e se a mensagem está Redelivered. Em cada consumidor, usa o campo id como chave de deduplicação: o segundo evento não cria nova tarefa.
6. Se a política permitir, simula uma falha antes da confirmação (não confirmar) e observa o Delivery Count.

Sem broker: usa duas listas de entregas com o mesmo JSON, acrescenta uma segunda cópia a uma lista, e decide, com uma chave por consumidor, se cria nova tarefa. Ordena dois eventos por hora e discute o que fazes se chegarem ao contrário.

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| A ativação do Event Mesh falha | Existência do serviço SAP Event Mesh autónomo (plano default) no mesmo subaccount |
| O menu Event Mesh não aparece | Role collections atribuídos ao utilizador e novo início de sessão |
| O cliente não consegue publicar | Regras do descritor e se o tópico começa pelo namespace |
| Mensagem publicada mas não chega à fila | Subscrição na fila e padrão do tópico (sintaxe e wildcards) |
| Mensagens acumulam-se numa fila | Consumidores ligados, Unacknowledged Messages e o limiar por consumidor |
| O consumidor recebe a mesma mensagem várias vezes | Delivery Count e Redelivered; o consumidor confirma antes de falhar? A chave de idempotência existe? |
| O webhook não recebe nada | Handshake Status (Failed: o WebHook-Allowed-Origin não coincide) e se o webhook responde 2XX |
| A API de subscrições devolve 404 | Fila inexistente, subscrição não associada à fila, ou nomes sem codificação de URL (a barra como %2F) |

## Exercícios

**PRATICAR:** faz os exercícios 19 a 21 no módulo 13. Desenha as ligações e guarda a tabela de mensagens, efeitos e confirmações.

## Fontes oficiais

- [Understanding the Event Mesh Capability in SAP Integration Suite](https://learning.sap.com/courses/integration-developer/understanding-the-event-mesh-capability-in-sap-integration-suite_a436e2ab-c040-412f-b05a-9f2f7b9d5cf2)
- [Discovering SAP Integration Suite Advanced Event Mesh](https://learning.sap.com/courses/introducing-event-driven-architecture/discovering-sap-integration-suite-advanced-event-mesh_d199487b-6dae-4c1f-a25a-ec33b4da531b)
- [Create A Queue](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Event_Mesh/create-a-queue-95357fa.md)
- [Topic Naming Syntax](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Event_Mesh/topic-naming-syntax-62460b8.md)
- [Service Descriptor Syntax](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Event_Mesh/service-descriptor-syntax-b70eaad.md)
- [Create a Webhook Subscription](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Event_Mesh/create-a-webhook-subscription-e120b8b.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0).
