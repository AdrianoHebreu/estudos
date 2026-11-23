# Exercícios de SAP Integration Suite

Resolve os exercícios após leres o módulo correspondente. Guarda entradas, resultados e decisões. Quando não tiveres a capacidade SAP disponível, apresenta a simulação ou o desenho pedido com a evidência que faltaria recolher no tenant. As soluções estão no módulo 15.

## Cloud Integration e mensagens

1. Desenha Timer, Content Modifier e End. Usa o corpo do módulo 01. Indica em que passo existe uma mensagem e quando são escritos os valores constantes.
2. Guarda CN-1001 como propriedade, define Content-Type e troca o corpo. Apresenta uma tabela de corpo, cabeçalhos e propriedades antes e depois da troca.
3. O fluxo aparece iniciado, mas o monitor está vazio. Lista três verificações e diz como distingues uma execução nova da anterior.

## Transformações e Groovy

4. Aplica Groovy Ola a `{"sku":"c-01","quantity":2}`. Calcula o valor esperado de tamanho e explica o efeito nas chaves.
5. Mapeia CN-1001 com SKU em minúsculas e espaços. Repete com quantidade zero e com quantidade em texto. Regista a saída válida e as duas rejeições.
6. Transforma o XML de duas linhas com XSLT. Indica a estrutura obtida e compara o teste de cardinalidade com um exemplo de Message Mapping.

## Conectividade

7. Escolhe adaptadores para pedido web, serviço OData e arquivo por SFTP. Para cada caso, define sentido, autenticação e um teste negativo.
8. Configura em desenho um Request Reply HTTP. Inclui endereço, método e tempo-limite. Explica o que acontece se o destino gravar e a resposta se perder.
9. Desenha uma ligação a um SAP privado e indica a função do Cloud Connector, da autorização do sistema e da configuração do adaptador.

## Padrões e erros

10. Desenha um Router para aceitar, rever e rejeitar. Fornece um caso por ramo e marca o ramo predefinido.
11. Divide um lote de duas encomendas, uma inválida. Define a correlação de cada parte e escolhe como agregar a resposta.
12. Para 400, 409, 429, 503 e timeout com escrita incerta, define se repetes, com que chave e onde consultas o estado.

## API Management

13. Desenha um proxy para a API de encomendas e indica onde colocas autenticação e quota. Define como propagas correlação.
14. Monta uma tabela de pedidos com chave válida, chave ausente, quota excedida e destino indisponível. Define o resultado e se cada pedido chega ao destino.
15. O portal quer renomear sku para productCode. Propõe uma evolução de contrato e indica a evidência para retirar a versão anterior.

## Segurança e operação

16. Desenha as identidades de entrada, saída, operação e entrega. Associa cada uma a uma permissão e ao local onde a credencial fica.
17. O destino passou a devolver 401. Escreve uma sequência de diagnóstico, desde a pesquisa no monitor até à verificação do material de segurança.
18. Desenha o transporte para outro ambiente com dois parâmetros, uma verificação após a publicação e um critério de reversão.

## Eventos

19. Desenha um tópico e duas filas para encomenda aceite. Identifica produtor, consumidores e a chave estável do evento.
20. O consumidor de stock grava e falha antes da confirmação. Indica o que acontece à nova entrega e como preservas um único efeito.
21. Dois eventos de atualização chegam fora de ordem. Define campos e uma regra que evite substituir um estado novo por um antigo.

## B2B

22. Cria uma ficha MIG de aviso de expedição com cinco campos, cardinalidades e um código permitido.
23. Desenha uma MAG a partir da ficha anterior. Usa PCE na origem e EA no destino e indica como tratas um código desconhecido.
24. Dois parceiros usam versões diferentes. Define como escolhes o mapeamento e distingue confirmação de transporte de aceitação de negócio.

## Open Connectors

25. Escolhe entre Open Connectors, adaptador nativo ou HTTP direto para ler uma entidade SaaS. Escreve dois critérios e uma condição para mudar de opção.
26. Processa as duas páginas do módulo 09. Simula uma falha após gravar T-2 e antes do ponto de controlo. Mostra o estado após retoma.
27. Descreve uma rotação da identidade de leitura e o que fazes perante 401 e 429. Identifica os dados que registarias.

## Modernização e migração

28. Classifica as três interfaces da Casa Nova em avaliar migração, redesenhar e retirar. Identifica a informação que precisas de confirmar antes de decidir.
29. Escreve três casos de regressão e indica quais os campos que normalizas antes de comparar.
30. Desenha um corte reversível com uma execução paralela sem efeitos, um critério de interrupção e uma estratégia de reconciliação.

## SAP S4HANA Azure e IA

31. Substitui a API simulada por uma interface SAP em desenho. Indica onde procuras o contrato e como confirmas autenticação, paginação e escrita.
32. Modela uma notificação de stock para Azure. Inclui MessageId, consumidor, confirmação e retoma.
33. Define três respostas de um classificador de texto, uma aceitável, uma inválida e um timeout. Decide como o fluxo reage sem afetar a encomenda.

## Projeto final

34. Entrega o exercício do módulo 12 com contrato, mapa de fluxo, casos de teste e a grelha de nove critérios. Inclui uma prova da consulta após conflito e um desenho para recuperar de uma resposta perdida.

## Fontes oficiais

- [Build Your Integrations and APIs](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/centralized-developer-hub-38422de917ee40e1a47df0b368def295-1188)
- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
