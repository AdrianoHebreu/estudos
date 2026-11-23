# Integração com SAP S/4HANA Azure e IA

O projeto precisa de registar encomendas, desacoplar notificações de stock e encaminhar para revisão casos cujo texto livre seja ambíguo. Vais atribuir cada função ao sistema adequado e distinguir o simulador do curso das interfaces de produção.

## Interfaces SAP S/4HANA

Consulta o catálogo da SAP para a edição e versão do S/4HANA em causa. Identifica a API de negócio, as entidades, o modelo de autenticação e como é feita a ativação. Estuda operações e exemplos de pedido. Nos endpoints OData, confirma versão, paginação, política de concorrência e requisitos de CSRF para escrita quando aplicáveis. Um evento SAP deve ser confirmado no catálogo e na configuração do ambiente conforme a edição.

O módulo 12 define uma API REST fictícia para exercitar o contrato e a idempotência. Ao substituir o simulador, escreve um mapa das entidades e dos códigos de erro do SAP, adiciona autenticação e corre os casos de aceitação num sistema de teste. Mantém a referência do portal de forma que a pesquisa de um pedido incerto seja possível.

## Ligar ao Azure

| Serviço | Papel possível | Decisão |
|---|---|---|
| Azure Logic Apps | Coordenar integrações com serviços Azure | Responsabilidade e limites da orquestração |
| Azure Service Bus | Desacoplar consumidores de encomendas | Fila, tópico e retoma |
| Azure Functions | Executar uma transformação ou ação isolada | Contrato, limites e autenticação |
| Azure Monitor | Observar a cadeia em Azure | Correlação, sinais e alertas |

Num desenho de referência, o portal obtém a confirmação do ERP através do iFlow. A notificação para o armazém segue em separado. Usa a mesma referência em ambas as vias e evita que um atraso na notificação altere a confirmação da escrita. A deteção de duplicados do Service Bus, quando configurada para o cenário, tem uma janela e critérios próprios. O consumidor mantém proteção para efeitos de negócio.

## IA com verificação antes de agir

Um classificador pode sugerir a categoria de um comentário, por exemplo atraso ou morada incompleta. Envia só os dados necessários, valida a forma da resposta e faz um encaminhamento para revisão se a resposta for inválida, estiver abaixo do limiar definido ou o serviço falhar. Valida com exemplos do domínio e mantém o resultado determinístico para o percurso principal.

Texto de terceiros é entrada de dados. O serviço de IA recebe tarefas predefinidas, sem controlo de credenciais, endereços ou operações de escrita. Um possível output do classificador aparece abaixo. O fluxo aceita apenas categorias previstas. Para testar a indisponibilidade localmente, substitui a resposta pelo caso de erro.

    {"category":"rever_morada","modelScore":0.62}

Uma pontuação não substitui a avaliação. Define um conjunto de validação, revê falsos positivos e conserva evidência adequada das decisões humanas. Quando mudares o modelo ou a instrução, volta a executar os casos que sustentam o limiar.

## Laboratório de arquitetura

1. Usa o simulador do módulo 12 para registar a encomenda. Aponta o identificador e o estado devolvidos.
2. Desenha o evento de confirmação para o Azure Service Bus. Dá ao evento uma chave e decide quando o consumidor confirma a mensagem.
3. Simula a resposta do classificador com categoria válida, categoria desconhecida e falha de serviço. Define se o atendimento segue para revisão sem impedir a gravação original.
4. Numa folha de decisão, liga cada interação à identidade, ao contrato, à rede e à evidência operacional. Marca o que depende de sistemas reais.

## Exercícios

Resolve os exercícios 31 a 33 no módulo 13. Inclui uma proposta para substituir o simulador por uma API SAP e uma alternativa operacional quando Azure ou IA estiverem indisponíveis.

## Fontes oficiais

- [SAP Business Accelerator Hub](https://api.sap.com/)
- [Business Events on SAP Business Accelerator Hub](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/8308e6d301d54584a33cd04a9861bc52/8cbf952e55364254be2da77aa1342aa5.html)
- [Asynchronous Messaging Options](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/messaging)
- [Azure Service Bus duplicate message detection](https://learn.microsoft.com/en-us/azure/service-bus-messaging/duplicate-detection)
