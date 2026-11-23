# Consulta rápida de SAP Integration Suite

Escolhe passos e prepara a publicação ou o diagnóstico de um iFlow.

## Escolher o passo ou a capacidade

| Precisas de | Usa ou avalia |
|---|---|
| Alterar corpo, cabeçalho ou propriedade | Content Modifier |
| Transformar JSON ou XML | Groovy, Message Mapping ou XSLT |
| Escolher um percurso | Router com valor predefinido |
| Dividir um lote ou juntar mensagens | Splitter, Gather ou Aggregator |
| Chamar um serviço e usar a resposta | Request Reply e adaptador recetor |
| Governar acesso de clientes à API | API Management |
| Distribuir um facto a vários consumidores | Tópico e filas no Event Mesh |
| Definir mensagens e acordos B2B | MIG, MAG e Trading Partner Management |

## Triagem de uma falha

| Sinal | Próxima ação |
|---|---|
| Sem mensagem | Confirma o disparo, a janela e o filtro |
| 400 ou 409 | Verifica contrato ou conflito de negócio |
| 401 ou 403 | Verifica identidade, credencial e papel |
| 429 ou 503 | Decide se é seguro repetir e limita tentativas |
| Timeout de escrita | Consulta por referência antes de repetir |
| Duplicado | Confirma chave e efeito único no destino |

## Antes de publicar

Confirma versão, ambiente, URL, alias e permissões. Testa sucesso e falha. Define a referência de negócio e quem reconcilia pedidos.

## Exercícios

Escolhe uma falha da tabela. Compara com os exercícios 12, 17 e 34.

## Fontes oficiais

[Build Your Integrations and APIs](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/centralized-developer-hub-38422de917ee40e1a47df0b368def295-1188) e [Monitor Message Processing](https://help.sap.com/docs/integration-suite/sap-integration-suite/monitor-message-processing?version=CLOUD)
