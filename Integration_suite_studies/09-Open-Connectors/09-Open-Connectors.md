# Open Connectors e integração SaaS

A Casa Nova recebe pedidos de apoio numa aplicação SaaS. O objetivo é ler o estado de um pedido e associá-lo à referência da encomenda. Vais comparar o uso de um conector da SAP com uma chamada direta à API do fornecedor.

## Conector instância e recurso

Um conector oferece uma interface para um serviço suportado. A instância associa esse conector a uma ligação configurada, com a autenticação necessária. Um recurso é a operação ou entidade que a aplicação consome, como pedidos de apoio. Alguns recursos podem expor uma representação comum. Confirma os campos concretos e as operações suportadas pelo conector que escolheste.

| Opção | Benefício | Ponto a confirmar |
|---|---|---|
| Open Connectors | Interface e ligação geridas para SaaS suportado | Disponibilidade, versões e operação necessária |
| Adaptador nativo | Parâmetros específicos do sistema | Perfil e funcionalidades suportadas |
| HTTP direto | Controlo do contrato do fornecedor | Autenticação, paginação e manutenção |

Escolhe com um caso real. Uma interface comum facilita o consumo, mas uma operação avançada pode aparecer apenas na API original. Documenta dependências de duas camadas. O serviço do fornecedor pode alterar permissões ou limites e o conector pode ter o seu próprio ciclo de evolução.

## Configuração e leitura incremental

Usa uma identidade de treino com permissão de leitura. Guarda os valores de autenticação na administração do serviço e no mecanismo de gestão de segredos aprovado. Revê a expiração, a revogação e as permissões concedidas. Evita gravar respostas de serviços com informação pessoal no monitor.

Uma sincronização incremental guarda o último estado confirmado. Usa o token de continuação ou os parâmetros definidos pelo fornecedor. Se houver empate por data, preserva também uma chave estável ou usa uma pequena janela de sobreposição com eliminação de duplicados. Avança o ponto de controlo só depois de gravar a página com sucesso.

## Laboratório com duas páginas

1. Se o conector estiver disponível, seleciona um SaaS de treino. Cria uma instância com os direitos mínimos e faz uma chamada de leitura ao recurso de teste.
2. Identifica o limite da página e como obter a próxima. Executa duas chamadas, anota o identificador e valida o mapeamento para a referência interna.
3. Se a capacidade ou um fornecedor de treino não estiverem disponíveis, usa as respostas sintéticas abaixo. Guarda o cursor só após processar a primeira página. Repete a segunda página e confirma que `T-2` só fica registado uma vez.
4. Simula uma falha entre as duas páginas e define como retomas. Se houver 429, aplica a política limitada e respeita a indicação de espera quando existir. Se houver 401, verifica a identidade antes de repetir.

    Pagina A
    {"items":[{"id":"T-1","order":"CN-1001"}],"next":"p2"}

    Pagina B
    {"items":[{"id":"T-2","order":"CN-1002"}],"next":null}

Os nomes `items` e `next` pertencem à simulação. O contrato real pode usar outros campos ou cabeçalhos. Se um pedido de apoio for apagado no SaaS, define como detetar a remoção. Uma recolha apenas por data de alteração pode não apresentar eliminações.

## Exercícios

Resolve os exercícios 25 a 27 no módulo 13. Regista a escolha da interface, a autorização mínima e o algoritmo de retoma em caso de falha.

## Fontes oficiais

- [Feature Scope Description for SAP Integration Suite](https://help.sap.com/doc/e50e61e7b66c4b60ae5e88c00c01486a/CLOUD/en-US/FSD_IntegrationSuite.pdf)
- [Capabilities of SAP Integration Suite](https://help.sap.com/docs/integration-suite/sap-integration-suite/capabilities?locale=en-US)
