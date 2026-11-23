# Conectividade e adaptadores

Os adaptadores ligam as mensagens do iFlow aos sistemas que as enviam ou recebem. Antes de escolheres um adaptador, define o sentido da comunicação, o contrato do destino, a autenticação, os limites de tempo e o que fazer perante uma falha. Para a Casa Nova, o portal chama o SAP por HTTPS. O iFlow chama o simulador do ERP e devolve um resultado compreensível ao portal.

## Escolher pelo contrato

| Adaptador | Encaixa quando | Verifica antes do teste |
|---|---|---|
| HTTPS ou HTTP | Pedidos e respostas por URL | Método, TLS, autenticação e códigos |
| OData | Um serviço expõe entidades e operações OData | Versão, metadados, filtros e paginação |
| SOAP | O contrato é definido em WSDL | Operação, namespaces e SOAP Fault |
| SFTP | A troca ocorre por ficheiros | Diretório, chave do servidor e arquivo |
| Mail | Envio ou leitura de notificações | Conta, anexos e política de dados |
| IDoc | Documentos de negócio SAP | Tipo de IDoc, porta e confirmações |
| RFC | Chamada remota a função SAP permitida | Função, autorização e Cloud Connector |

Os sentidos suportados dependem do adaptador. Por exemplo, no padrão deste curso, o HTTPS Sender expõe um endpoint e o HTTP Receiver efetua a chamada de saída. Em ligação a um sistema privado, confirma se o adaptador suporta a opção on-premise e como a configuração do Cloud Connector expõe o sistema virtual, o recurso e a localização. O conector estabelece conectividade autorizada e a aplicação de destino continua a exigir autenticação adequada.

## Definir fronteiras HTTP

Uma integração de entrada deve aceitar um contrato pequeno. Por exemplo, o portal envia `POST` com JSON e um identificador de correlação. O fluxo autentica o cliente, valida os dados e só depois chama o destino. O endereço do destino é configuração do ambiente. Um campo do pedido nunca deve escolher um URL arbitrário.

A chamada de saída distingue o tempo para ligar ao destino, o tempo para obter resposta e a política global para o pedido. Mesmo que o cliente deixe de esperar, o ERP pode ter gravado a encomenda. Usa uma chave de idempotência e uma forma de consultar a referência antes de repetir um pedido que pode ter escrito dados.

## Laboratório HTTP

1. Inicia o simulador do módulo 12 e consulta `GET /health`. Usa essa rota para um primeiro teste sem escrita.
2. Para testar dentro do tenant, usa um endpoint HTTPS controlado acessível ao runtime. `127.0.0.1` no runtime SAP não aponta para o teu computador. Para um primeiro teste SAP sem servidor próprio, segue o serviço de exemplo do tutorial oficial.
3. Cria um novo iFlow com Timer, Request Reply e End. Liga o Request Reply a um recetor HTTP. Usa GET, o endpoint autorizado e os parâmetros de autenticação do ambiente.
4. Verifica o corpo e o código HTTP no monitor. Repete com um caminho inválido e regista a diferença. Consoante a configuração do adaptador, um código de erro pode ser convertido em exceção.
5. Passa para HTTPS Sender só depois de confirmares a chamada de saída. Testa a entrada com um cliente autorizado e envia apenas os cabeçalhos do contrato.

    curl.exe -i http://127.0.0.1:8765/health

## Paginação e ficheiros

Numa consulta OData paginada, segue a indicação de continuação devolvida pelo serviço dentro do domínio esperado. Para recolhas incrementais, guarda um ponto de controlo depois de persistir a página e trata a repetição de registos. Confirma a sintaxe dos filtros no serviço e a semântica das datas e fusos horários.

Em SFTP, acorda o nome, batimento, delimitador, codificação e momento em que o ficheiro está pronto. Uma opção é carregar com um nome temporário e renomear quando estiver completo. Só arquiva após sucesso e mantém um registo de ficheiros já processados. Para SOAP e IDoc, verifica separadamente o sucesso do transporte e a confirmação de negócio.

## Exercícios

Resolve os exercícios 7 a 9 no módulo 13. Inclui no teu registo o adaptador, o contrato, o tempo-limite e as condições em que repetir uma chamada é seguro.

## Fontes oficiais

- [Connectivity Options](https://help.sap.com/docs/integration-suite/sap-integration-suite/connectivity-options?q=Cloud+Integration)
- [Connectivity Options and Communication Security](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/connectivity-options-and-communication-security)
- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
