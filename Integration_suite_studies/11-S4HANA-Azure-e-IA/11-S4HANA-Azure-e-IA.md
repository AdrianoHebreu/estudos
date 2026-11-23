# Integração com SAP S/4HANA, Azure e IA

O projeto precisa de registar encomendas, desacoplar notificações de stock e encaminhar para revisão casos cujo texto livre seja ambíguo. Vais atribuir cada função ao sistema adequado, conhecer os adaptadores documentados para S/4HANA, Azure Service Bus e IA, e distinguir o simulador do curso das interfaces de produção.

**NOTA:** origem de cada afirmação. «Documentado» vem do repositório SAP-docs/btp-integration-suite (lido nesta revisão). «Método do curso» é desenho nosso, sem fonte SAP. «Por testar» é o que tens de confirmar no tenant. Não foi executado nada num tenant, nem contra um S/4HANA, um Azure ou um serviço de IA. A documentação lida descreve adaptadores genéricos para Azure: não descreve integrações Logic Apps, Functions ou Monitor, por isso essas ficam como ligações HTTPS genéricas, por testar.

## Mapa do módulo

| Função na Casa Nova | Sistema | Mecanismo documentado | Estado |
|---|---|---|---|
| Registar a encomenda no ERP | SAP S/4HANA | Adaptador OData V2 ou V4, IDoc, RFC ou ODC | Documentado, por testar |
| Notificar o armazém sem bloquear a encomenda | Azure Service Bus | Adaptador Azure Service Bus ou AMQP | Documentado, por testar |
| Triar texto livre ambíguo | Serviço de IA | Adaptador AI (variantes AICore-GenAIHub, Custom-OpenAI-REST, Custom-Claude-REST) | Documentado, por testar |
| Observar e depurar | Integration Suite | Funcionalidades de IA do próprio tenant | Documentado, por testar |

## Interfaces SAP S/4HANA

Consulta o catálogo da SAP para a edição e versão do S/4HANA em causa (SAP Business Accelerator Hub, nas fontes). Documentado: o Cloud Integration oferece vários canais de saída para sistemas SAP.

| Adaptador | Para quê | Detalhes documentados |
|---|---|---|
| OData V2 receiver | Serviços OData V2 (por exemplo de S/4HANA) | Só aceita payload em XML, tanto no corpo enviado como na resposta. Não suporta os parâmetros de pesquisa formato e contagem em linha. A resposta HTTP fica no cabeçalho camelhttpresponsecode |
| OData V4 receiver | Serviços OData V4 | Operações Create, Query, Update, Delete, Patch, Batch e Dynamic. O lote ($batch) tem limite de 2 MB de XML. Process in Pages exige um Looping Process Call |
| IDoc receiver | Trocar IDocs por SOAP | Um IDoc repetido com o mesmo SapMessageId e tipo de conteúdo Application/x-sap.doc é descartado pelo backend |
| RFC receiver | Chamar funções RFC de sistemas ABAP | Usa o Cloud Connector |
| ODC receiver | SAP Gateway OData Channel | Operações Create, Delete, Merge, Query, Read e Update |

### O que muda no desenho

O simulador do curso fala JSON. O adaptador OData V2 só fala XML: o iFlow precisa de converter o corpo (módulo 02, conversor de JSON para XML) e de converter a resposta de volta. Resume as diferenças que tens de planear:

| Campo do adaptador OData | Valores documentados | Quando usar |
|---|---|---|
| Address | URL do serviço V2 ou URI raiz do serviço V4 | Sempre, por ambiente (externalizado) |
| Proxy Type | Internet ou On-Premise (Location ID do Cloud Connector) | On-Premise para S/4HANA em rede privada |
| Authentication | None, Basic, Principal Propagation (só On-Premise), Client Certificate, OAuth2 Client Credentials, OAuth2 Password Credentials, OAuth2 SAML Bearer Assertion (V2); em V4, None, Basic, OAuth2 Client Credentials e Client Certificate | Menor privilégio: usa um utilizador técnico só com a API necessária |
| CSRF Protected | Ativo por omissão | Mantém ativo; em V4 exige HTTP Session Reuse na configuração do iFlow |
| Operation | Query, Create, Update, Merge, Read, Delete, Patch, Function Import, Dynamic (V2) | Dynamic lê o método de um cabeçalho ou propriedade |
| Resource Path | Escolhido no assistente Model Operation, ou dinâmico por expressão | Prefere o assistente |
| Timeout (V4) | Em minutos | Define sempre |

Na criação (POST), a chave primária pode ser gerada pelo backend: ou envias um valor fictício, ou envias o payload sem chave, conforme o backend aceita. Confirma o comportamento do teu serviço.

### Descobrir e publicar APIs

Documentado: o Developer Hub descobre APIs e eventos de sistemas de negócio registados na BTP. O administrador global agrupa os sistemas numa formation com uma subconta comum. Quem tem a role collection AuthGroup.Content.Admin vê os sistemas em Manage Content, Business Systems. As APIs do S/4HANA aparecem em consumption bundles, que juntam APIs e eventos acessíveis com as mesmas credenciais. Cria-se um produto a partir de um ou vários bundles, grava-se como rascunho ou publica-se.

Para o S/4HANA Cloud, o destino na BTP leva as propriedades x-correlation-id (com o formato sap.s4:communicationScenario: seguido do cenário, por exemplo SAP_COM_0316), x-system-type e x-system-id. Confirma o cenário de comunicação que a tua API exige.

Os eventos SAP confirmam-se no catálogo e na configuração do ambiente (ligação às fontes). O módulo 07 trata do transporte de eventos.

### Substituir o simulador

O módulo 12 define uma API REST fictícia para exercitar o contrato e a idempotência. Ao substituir o simulador, método do curso:

1. Escreve um mapa das entidades e dos códigos de erro SAP face ao contrato fictício (externalId, erpId e estados).
2. Acrescenta autenticação por ambiente com artefactos de segurança, não no iFlow.
3. Para escritas repetidas por IDoc, define SapMessageId a partir de um identificador estável (o padrão documentado mapeia SapMessageId a partir de um cabeçalho como SapMessageIdEx).
4. Corre os casos de aceitação num sistema de teste e mantém a referência do portal para que a pesquisa de um pedido incerto seja possível.

## Ligar ao Azure

Documentado: o Integration Suite tem adaptadores para Azure Service Bus, Azure Storage e Azure Cosmos DB, e adaptadores AMQP 1.0 (sobre TCP) para o Service Bus. Os adaptadores de Azure Service Bus estão no SAP Business Accelerator Hub e a disponibilidade depende do plano de serviço.

| Serviço | Papel possível | Mecanismo | Estado |
|---|---|---|---|
| Azure Service Bus | Desacoplar consumidores de encomendas | Adaptador Azure Service Bus (sender e receiver) ou AMQP | Documentado |
| Azure Storage | Ficheiros, filas e tabelas | Adaptador AzureStorage (blob, file share, queue, table) | Documentado |
| Azure Cosmos DB | Base de dados NoSQL | Adaptador Azure Cosmos DB (receiver) | Documentado |
| Logic Apps, Functions, Monitor | Orquestração, funções isoladas, observabilidade em Azure | Chamada HTTPS genérica ou AMQP; sem adaptador dedicado descrito | Por testar |

### O adaptador Azure Service Bus (receiver)

| Campo | Valores e notas |
|---|---|
| Hostname | Nome do espaço de nomes, por exemplo myservice.servicebus.windows.net |
| Authentication Type | Microsoft Entra ID (alias do Directory ID, do Application ID e do Client Secret, em Secure Parameter) ou Shared Access Signature (nome da política e alias da chave de acesso) |
| Maximum Reconnect Attempts e Connection Timeout | Tentativas e tempo por tentativa: o tempo total depende de ambos |
| Entity | Queue ou Topic (com Queue Name ou Topic Name) |
| Content Type | Application/JSON, Application/XML ou Text/Plain |
| Broker Properties | Correlation ID, Message ID, To, Reply To, Time To Live, Session ID, Reply To Session ID, Label/Subject, Partition Key e propriedades próprias com Key, Type e Value |

O sender (consumo de mensagens) acrescenta Polling Interval, Error Handling (Add to System Trace Logs, Changes iFlow Status to Error ou Create Error MPL), Subscription Name para tópicos, Max Messages Per Node (recomendado abaixo de 5000), Max Wait Time, Duplicate Check com intervalo e Failure Message Handling (Acknowledge, Defer, Keep and Process Again ou Move to Dead Letter Queue).

### Desenho de referência (método do curso)

Num desenho de referência, o portal obtém a confirmação do ERP através do iFlow. A notificação para o armazém segue em separado. Usa a mesma referência nas duas vias e evita que um atraso na notificação altere a confirmação da escrita.

| Elemento da notificação | Proposta | Porquê |
|---|---|---|
| Message ID | Derivado de orderId, por exemplo stock-CN-1001 | Estável entre repetições |
| Correlation ID | A referência da encomenda | Pesquisa ponta a ponta |
| Entidade | Tópico com subscrições por consumidor | Vários consumidores sem alterar o iFlow |
| Falha do consumidor | Dead Letter Queue ou Defer, com alerta | Não perder a mensagem |
| Duplicados | Deteção do Service Bus (com janela própria) mais proteção no consumidor | Dois níveis, porque a janela expira |

Num sistema persistente, emite a notificação só depois da confirmação do ERP, por uma forma fiável como uma outbox onde exista controlo da transação.

## IA no Integration Suite

Documentado: a IA no Integration Suite divide-se em funcionalidades do próprio tenant e em ligação a serviços de IA.

| Funcionalidade | Capacidade | O que faz |
|---|---|---|
| AI-assisted Error Resolution | Cloud Integration | Analisa mensagens falhadas e devolve Root Cause, First Failed Step e Suggested Solution |
| Flow Step Recommendations | Cloud Integration | Sugere os passos seguintes no editor; está sempre ativa |
| Generation of Integrations | Cloud Integration | Gera um iFlow a partir de uma descrição em inglês |
| Script Optimization | Cloud Integration | Revê scripts Groovy (botão Optimize) |
| Memory Profiling | Cloud Integration | Mostra indicadores de memória durante a simulação |
| Integration Content Migration Agent | Cloud Integration | Converte mapeamentos Java em Groovy (módulo 10) |
| Anomaly Detection, API Traffic Prediction, Conversational Analytics, OpenAPI generation | API Management | Deteção de desvios, previsões de volume, análise por linguagem natural e geração de especificações |
| MIG and MAG Proposals | Integration Advisor | Propostas de campos e de mapeamentos (módulo 08) |
| MCP server | Integration Cell | Expõe APIs ou RFC como ferramentas para agentes de IA |

Condições documentadas: as funcionalidades de IA exigem as edições Premium ou Enhanced e estão numa promoção gratuita até à versão de janeiro de 2027 (confirma o que acontece depois). O administrador do tenant ativa-as em Artificial Intelligence. Há quotas de utilização mensais (AI-assisted Error Resolution) e limites por minuto e de tamanho (Optimize recusa scripts acima de 50 KB; só funciona em scripts Groovy). A SAP avisa que a qualidade, o enviesamento e as alucinações são responsabilidade de quem verifica o resultado, e que não deves expor informação sensível nos scripts enviados.

### O adaptador AI (receiver)

Documentado: liga o iFlow ao Generative AI Hub (SAP AI Core) e a outros fornecedores, em três variantes, disponíveis no SAP Business Accelerator Hub.

| Campo | AICore-GenAIHub | Custom-Claude-REST |
|---|---|---|
| Address | Endereço do Generative AI Hub | Endereço do fornecedor (a documentação dá um exemplo) |
| Autenticação | OAuth2 Client Credentials (artefacto de segurança) | API Key Alias (artefacto de segurança) |
| Operação | Lista de operações do Hub, mais Orchestration Deployment ID e AI Resource Group | Entidades Messages, Message Batches, Models e Token Counting, com Create a Message como operação típica |
| Payload | Request Payload Source: Exchange Body ou UI Configurable | Idem, com Model, Messages (Role e Content) e Max Tokens |
| Tempos limite | Connection Timeout e Response Timeout, em milissegundos | Idem |
| Cabeçalhos | Request Headers e Response Headers separados por barra vertical; asterisco para todos | Idem |

A variante Custom-OpenAI-REST segue a mesma lógica com Category, Entity e Operation. Por testar: o catálogo de modelos muda com frequência e a documentação remete para uma SAP Note de disponibilidade.

### Verificar antes de agir (método do curso)

Um classificador pode sugerir a categoria de um comentário, por exemplo atraso ou morada incompleta. Envia só os dados necessários, valida a forma da resposta e encaminha para revisão se a resposta for inválida, estiver abaixo do limiar ou o serviço falhar. Texto de terceiros é dados de entrada, nunca instruções para o fluxo. O serviço de IA recebe tarefas predefinidas, sem controlo de credenciais, endereços ou operações de escrita. Um possível output do classificador:

    {"category":"rever_morada","modelScore":0.62}

O script seguinte aceita apenas categorias previstas e um limiar de pontuação, e sinaliza o destino do caso numa propriedade. Código Groovy não executado nesta revisão. O limiar 0.70 é um valor de exemplo, que deves calibrar com um conjunto de validação.

    import com.sap.gateway.ip.core.customdev.util.Message
    import groovy.json.JsonSlurper

    def Message processData(Message message) {
        def permitidas = ['atraso', 'rever_morada'] as Set
        double limiar = 0.70d
        String destino = 'revisao'
        String motivo
        try {
            def r = new JsonSlurper().parseText(message.getBody(String))
            def categoria = r?.category
            def pontuacao = r?.modelScore
            if (!(categoria instanceof String) || !permitidas.contains(categoria)) {
                motivo = 'categoria_invalida'
            } else if (!(pontuacao instanceof Number) || pontuacao.doubleValue() < limiar) {
                motivo = 'pontuacao_baixa'
            } else {
                destino = 'automatico'
                motivo = 'ok'
            }
        } catch (Exception e) {
            motivo = 'resposta_ilegivel'
        }
        message.setProperty('destinoCaso', destino)
        message.setProperty('motivoCaso', motivo)
        return message
    }

Resultado esperado para o exemplo acima: destinoCaso com o valor revisao e motivoCaso com pontuacao_baixa (0.62 está abaixo de 0.70). Define um conjunto de validação, revê falsos positivos e conserva evidência das decisões humanas. Quando mudares o modelo ou a instrução, volta a executar os casos que sustentam o limiar. Para a indisponibilidade, trata o timeout do adaptador e um erro HTTP como o mesmo destino revisao, sem impedir a gravação original.

## Laboratório de arquitetura

Resultado esperado: uma folha de decisão e três respostas do classificador processadas pelo script. Tudo por testar num tenant.

1. Usa o simulador do módulo 12 para registar a encomenda. Aponta o identificador e o estado devolvidos.
2. Desenha o evento de confirmação para o Azure Service Bus: preenche a tabela do desenho de referência e decide quando o consumidor confirma a mensagem (Acknowledge só depois de gravar o efeito).
3. Corre o script com três corpos constantes: categoria válida com pontuação 0.9, categoria desconhecida e corpo que não é JSON. Esperado: automatico com ok, revisao com categoria_invalida e revisao com resposta_ilegivel.
4. Numa folha de decisão, liga cada interação à identidade, ao contrato, à rede e à evidência operacional. Marca o que depende de sistemas reais.

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| OData V2 falha com um corpo JSON | O adaptador só suporta XML: converte antes e depois |
| Escrita OData falha por CSRF em V4 | HTTP Session Reuse na configuração do iFlow |
| Lote OData V4 recusado | Tamanho do payload: o limite documentado é 2 MB |
| IDoc duplicado no S/4HANA | O cabeçalho SapMessageId muda entre repetições |
| Service Bus recusa a ligação | Authentication Type, aliases de Secure Parameter e Hostname do espaço de nomes |
| Mensagens repetidas num tópico | Subscription Name, Duplicate Check e Failure Message Handling |
| A IA não está disponível | Edição do plano, ativação em Artificial Intelligence, quota mensal e role |
| Botão Optimize em falta | Script em modo de edição, ser Groovy e IA ativa |

## Exercícios

**PRATICAR:** resolve os exercícios 31 a 33 no módulo 13. Inclui uma proposta para substituir o simulador por uma API SAP e uma alternativa operacional quando Azure ou IA estiverem indisponíveis.

## Fontes oficiais

- [SAP Business Accelerator Hub](https://api.sap.com/)
- [Business Events on SAP Business Accelerator Hub](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/8308e6d301d54584a33cd04a9861bc52/8cbf952e55364254be2da77aa1342aa5.html)
- [Asynchronous Messaging Options](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/messaging)
- [Azure Service Bus duplicate message detection](https://learn.microsoft.com/en-us/azure/service-bus-messaging/duplicate-detection)
- [Azure Service Bus Receiver Adapter (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/azure-service-bus-receiver-adapter-e67db82.md)
- [AI Receiver Adapter (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/ai-receiver-adapter-66e89d2.md)
- [Artificial Intelligence (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/artificial-intelligence-6a6727c.md)
- [Configure the OData V2 Receiver Adapter (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/configure-the-odata-v2-receiver-adapter-c5c2e38.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0)
