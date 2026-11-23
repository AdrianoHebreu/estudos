# Publicar e governar APIs

O portal precisa de enviar encomendas sem conhecer os detalhes do ERP. API Management pode fornecer um endereço estável, políticas de acesso e observação do tráfego. Cloud Integration resolve a transformação e a orquestração após essa fronteira.

## Da interface publicada ao destino

Um proxy recebe o pedido numa interface publicada e encaminha-o para um serviço de destino, que pode ser um iFlow HTTPS. As políticas inspecionam a mensagem e aplicam regras no percurso. Um produto agrupa APIs disponibilizadas a consumidores, quando esse mecanismo se aplica ao modelo de publicação. Uma aplicação de teste representa um consumidor e permite verificar o acesso e as métricas.

No contrato da Casa Nova, `POST /v1/orders` aceita `orderId`, `sku` e `quantity`. Documenta os pedidos válidos, a autenticação e as respostas. O proxy pode fazer validações de formato e impor limites. O fluxo faz a transformação e o ERP mantém as suas regras e a referência registada.

## Políticas de acesso e tráfego

| Política | Intenção | Caso de verificação |
|---|---|---|
| Verificar chave | Reconhecer a aplicação cliente | Chave ausente e chave revogada |
| OAuth e validação de token | Verificar identidade e autorização conforme o contrato | Token expirado ou scope errado |
| Quota | Limitar consumo por consumidor num intervalo | Ultrapassar o limite de teste |
| Spike Arrest | Limitar picos de tráfego | Rajada curta no ambiente de teste |
| Validação | Rejeitar pedidos fora do contrato | JSON inválido ou demasiado grande |

Uma chave de API identifica uma aplicação no cenário proposto. Para dados sensíveis, define autenticação e autorização adequadas e protege a ligação ao destino. Mantém credenciais em cabeçalhos ou configuração protegida conforme o contrato de autenticação. Evita URLs com segredos, pois podem ficar registadas.

## Laboratório de proxy

1. Escolhe um endpoint HTTPS de teste sob o teu controlo ou o destino de laboratório do guia oficial. Confirma primeiro que o contrato de destino responde.
2. Na capacidade API Management, cria a interface de teste e associa o destino. Usa um caminho distinto, por exemplo `/cn-treino/v1`.
3. Na abordagem clássica, adiciona a política Verify API Key no pedido, lendo o cabeçalho `x-api-key`. Publica a API e, se o teu ambiente usar produtos e aplicações, associa-a a um produto de treino e cria um consumidor.
4. Executa um pedido autorizado e outro com chave ausente. Confirma o código previsto pela configuração de erro e verifica que o destino não recebeu o pedido rejeitado.
5. Adiciona uma quota baixa para o consumidor de treino. Repete as chamadas em ritmo controlado e confirma a diferença entre uma rejeição no proxy e uma falha do destino.

O proxy e os passos exatos de publicação variam com o runtime e a capacidade ativada. Se não houver API Management no trial, faz uma verificação de mesa. Define os pedidos, a ordem das políticas e o resultado esperado em cada camada. Usa os cenários do simulador para observar os códigos de negócio do destino.

## Evoluir o contrato

Uma alteração compatível pode acrescentar um campo opcional que os clientes ignoram. Renomear um campo obrigatório exige uma transição negociada. Publica uma nova versão quando necessário, mede quem continua na versão antiga e acorda a data de retirada. Um contrato OpenAPI, como o do curso de Bun, ajuda a comparar as duas interfaces.

Confirma que a correlação chega ao proxy, ao iFlow e ao destino. Nos erros, usa um código estável para clientes e uma mensagem que não inclua tokens, URLs internos ou detalhes da infraestrutura.

## Exercícios

Resolve os exercícios 13 a 15 no módulo 13. Produz uma matriz que inclua sucesso, falta de credencial, quota excedida e falha do serviço de destino.

## Fontes oficiais

- [API Management](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/api-management)
- [Verify API Key](https://help.sap.com/docs/sap-api-management/sap-api-management/verify-api-key?q=certificate)
- [Create a Product](https://help.sap.com/docs/sap-api-management/sap-api-management/create-product)
