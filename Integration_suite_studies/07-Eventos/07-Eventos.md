# Eventos e mensageria

Quando o ERP aceita uma encomenda, stock e expedição precisam de reagir. O emissor pode publicar um facto e continuar a trabalhar. Os consumidores recebem-no ao seu ritmo. Vais desenhar tópicos, filas e confirmações e simular o que acontece quando a entrega é repetida.

## Eventos comandos e consultas

Uma consulta pede o estado atual. Um comando solicita uma ação, como reservar duas unidades. Um evento descreve um facto ocorrido, como encomenda aceite. A diferença ajuda a atribuir responsabilidades. A aplicação que aceitou a encomenda é dona do evento. A aplicação que recebe o evento decide como reagir.

Um tópico classifica a publicação. Uma fila retém mensagens para um consumidor ou grupo de consumidores conforme as regras do broker. Liga filas independentes ao tópico se stock e expedição precisarem cada um de uma cópia. Dois trabalhadores da mesma fila partilham o trabalho segundo as regras do serviço.

## Event Mesh e Advanced Event Mesh

O Event Mesh fornece capacidades de envio e consumo assíncrono na arquitetura apresentada pela SAP. SAP Integration Suite, advanced event mesh é uma oferta para arquiteturas distribuídas com brokers e gestão da malha. Confirma a oferta, a disponibilidade e os protocolos do ambiente antes de desenhar o cenário de implantação. Um nome semelhante no catálogo não garante que ambos estejam disponíveis no trial.

| Decisão | Exemplo de estudo |
|---|---|
| Convenção do tópico | casanova/orders/accepted/v1 |
| Identificador de evento | evt-cn-1001-01 |
| Identificador de negócio | CN-1001 |
| Consumidores | Fila de stock e fila de expedição |
| Evolução | Acrescentar campos opcionais em v1 |

A mensagem deve ter o mínimo necessário. Inclui um identificador estável de evento, tipo, versão, hora e referência. Se mais dados forem necessários, o consumidor pode consultá-los no serviço que os detém. Define como vais lidar com eventos fora de ordem e retidos durante vários dias.

    {
      "id": "evt-cn-1001-01",
      "type": "casanova.order.accepted.v1",
      "occurredAt": "2026-11-23T10:30:00Z",
      "orderId": "CN-1001"
    }

## Entrega e duplicados

Confirma uma mensagem depois de conseguires persistir o efeito ou a decisão. Se o processo morrer entre gravar e confirmar, o broker pode voltar a entregar. Usa uma restrição de unicidade ou um registo de processamento transacional no consumidor. Uma fila de falhas ou um processo equivalente deve guardar o motivo e um caminho de reprocessamento. Confirma os mecanismos reais do broker.

Quando a publicação resulta de uma escrita transacional, pondera uma outbox gravada com a mudança de negócio e publicada depois por um processo fiável. A outbox reduz a lacuna entre gravar uma encomenda e anunciar o evento. Pode continuar a haver repetição, pelo que o consumidor preserva a sua proteção.

## Laboratório de subscrição

1. Se tiveres Event Mesh disponível, usa um tópico isolado e duas filas de treino subscritas. Confirma o formato de nomes e as credenciais do serviço.
2. Publica um evento e verifica se ambos os consumidores o recebem. Regista o identificador e confirma depois de processar.
3. Repete com o mesmo identificador. Em cada consumidor, demonstra um efeito único. Se a política do ambiente permitir, simula uma falha antes da confirmação.
4. Sem broker, usa duas listas de entregas com o mesmo JSON. Introduz uma segunda cópia numa lista e usa uma chave por consumidor para decidir se cria nova tarefa. Ordena depois dois eventos por hora e discute o que fazer se chegarem ao contrário.

## Exercícios

Resolve os exercícios 19 a 21 no módulo 13. Desenha as ligações e guarda a tabela de mensagens, efeitos e confirmações.

## Fontes oficiais

- [Understanding the Event Mesh Capability in SAP Integration Suite](https://learning.sap.com/courses/integration-developer/understanding-the-event-mesh-capability-in-sap-integration-suite_a436e2ab-c040-412f-b05a-9f2f7b9d5cf2)
- [Discovering SAP Integration Suite Advanced Event Mesh](https://learning.sap.com/courses/introducing-event-driven-architecture/discovering-sap-integration-suite-advanced-event-mesh_d199487b-6dae-4c1f-a25a-ec33b4da531b)
