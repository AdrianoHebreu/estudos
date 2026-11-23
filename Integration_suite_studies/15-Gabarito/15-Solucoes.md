# Soluções dos exercícios de SAP Integration Suite

Compara o teu resultado com os critérios de cada solução. Desenhos alternativos podem ser válidos quando preservam o contrato, limitam falhas e permitem demonstrar os efeitos de negócio.

## Cloud Integration e mensagens

1. O Timer cria a execução. O Content Modifier coloca o corpo e metadados constantes na mensagem. O End conclui o percurso. O valor esperado é CN-1001 no exemplo.
2. Antes da troca, o corpo contém a encomenda e a propriedade contém CN-1001. Depois, o corpo pode conter uma confirmação e a propriedade mantém CN-1001. Content-Type descreve o formato efetivo em cada fronteira.
3. Verifica o evento Timer, a versão implantada e o filtro temporal do monitor. Ordena por hora e regista o identificador mais recente. Um deploy bem-sucedido só demonstra que a versão ficou disponível.

## Transformações e Groovy

4. Para o texto sem espaços `{"sku":"c-01","quantity":2}`, tamanho é 27. A saída é `{"SKU":"C-01","QUANTITY":2}`. Alterar o nome dos campos pode quebrar a desserialização no consumidor.
5. A saída tem externalId CN-1001 e uma linha C-01 com quantidade 2. O script preserva CN-1001 na propriedade orderId. Zero e a string 2 violam o contrato e geram rejeição.
6. O XSLT produz EntradaERP com referência CN-1001 e duas Linha. Testa também uma e zero linhas. Em Message Mapping, compara a ocorrência permitida na origem e no destino e assegura a criação de uma ocorrência alvo por item.

## Conectividade

7. HTTPS Sender recebe o pedido web. OData Receiver consulta o serviço. SFTP Receiver pode emitir o arquivo. Testa falta de autorização, filtro inválido e diretório ou chave de servidor incorretos, respetivamente.
8. O Request Reply usa URL do ambiente, método definido e tempo de espera compatível com o pedido original. Se a resposta se perder, consulta o destino por CN-1001 e só repete se a política e a chave preservarem a unicidade.
9. O Cloud Connector mapeia um recurso privado permitido para o ambiente BTP. O adaptador usa o endereço e o modo suportados. O sistema SAP valida a identidade e a autorização para a operação.

## Padrões e erros

10. A propriedade route vale aceitar ou rever nos percursos explícitos. Um valor ausente ou inesperado segue para rejeição predefinida. Testa os três percursos antes de adicionar efeitos ao destino.
11. Mantém B-17 como correlação e CN-1001 e CN-1002 como chaves individuais. Uma resposta possível agrega aceitação da primeira e rejeição da segunda. Documenta se o destino exige que o lote seja indivisível.
12. Corrige 400, reconcilia 409, trata 429 e 503 com repetição limitada quando o contrato o permite e consulta o estado após timeout incerto. Usa a mesma chave de negócio após cada tentativa.

## API Management

13. O proxy aplica políticas de entrada antes do iFlow. A transformação e a idempotência pertencem à cadeia de integração e ao destino. Valida a correlação e encaminha apenas cabeçalhos aprovados.
14. A chamada válida chega ao destino. Credencial em falta e quota excedida devem ser rejeitadas pelo proxy. A falha do destino resulta depois da passagem pelo proxy e deve aparecer como erro distinto.
15. Aceita a versão antiga durante a transição ou oferece uma nova versão. Acompanha o tráfego por cliente, anuncia a migração e retira a versão antiga quando os consumidores acordados comprovarem a mudança.

## Segurança e operação

16. Cliente, fluxo, operador e processo de entrega têm identidades e autorizações distintas. Configura o segredo de saída num alias do material de segurança. A entrega precisa de permissões para publicar. O operador pode ficar limitado à leitura.
17. Encontra a execução por correlação e identifica se o 401 vem do destino. Confirma alias, existência, expiração, destinatário do token e alterações recentes. Corrige no ambiente de teste e valida com uma tentativa autorizada.
18. Externaliza URL e alias. Instala o material e a confiança TLS no destino. Faz um pedido de verificação e reverte se houver falhas acima do critério acordado. Reconcilia as encomendas já processadas.

## Eventos

19. O produtor de confirmação publica em casanova/orders/accepted/v1. Uma fila para stock e outra para expedição subscrevem o tópico. O evento evt-cn-1001-01 mantém o mesmo identificador nas novas entregas.
20. O broker pode voltar a entregar. O consumidor verifica a chave num registo com unicidade ou numa transação que inclua o efeito. Se já foi processada, pode confirmar sem repetir o efeito.
21. Usa versão ou sequência por entidade e conserva a última aplicada. Se a sequência antiga chegar depois da nova, descarta conforme o contrato ou encaminha para revisão. Se faltar uma sequência necessária, tenta reconciliar com a fonte.

## B2B

22. Exemplo de MIG com referência de aviso e encomenda únicas e obrigatórias. Cada item tem SKU, quantidade positiva e unidade PCE. Define uma ou mais ocorrências de item.
23. Mapeia a referência para externalShipmentId, conserva a encomenda, valida a quantidade e traduz PCE para EA. Um código desconhecido fica para revisão com motivo explícito.
24. Identifica parceiro e versão a partir de campos ou configuração acordados. A confirmação técnica acusa receção ou validação de estrutura. A aceitação de negócio depende de verificações do ERP.

## Open Connectors

25. Open Connectors é uma opção se o catálogo cobrir a entidade e a autenticação pretendida. Se a operação ou um filtro faltar, avalia adaptador nativo ou HTTP com o contrato do fornecedor.
26. O ponto de controlo aponta para a segunda página enquanto ainda não tiver sido atualizado. Ao reler a página, T-2 já existe. Atualiza ou ignora pela mesma chave e avança o controlo após sucesso.
27. Cria uma identidade de substituição, valida leitura e retira a antiga após a troca. Diagnostica 401 antes de repetir. Para 429, espera conforme o contrato. Regista correlação e código, sem o segredo.

## Modernização e migração

28. Avalia a interface de stock porque ainda tem uma função. Redesenha encomendas para cobrir o comportamento exigido. Só retira a do portal após confirmar ausência de tráfego e obter validação do dono.
29. Compara uma entrada válida, uma rejeitada e uma repetida. Verifica contagens, chaves e resultado de negócio. Normaliza hora de execução e IDs técnicos dependentes do ambiente.
30. Compara uma saída paralela sem escrita, suspende a origem, confirma pendências e só depois muda a rota. Se houver divergência, volta à rota anterior após conhecer os efeitos já aplicados.

## SAP S4HANA Azure e IA

31. Pesquisa a API e edição no SAP Business Accelerator Hub e na documentação do ambiente. Confirma a versão OData, autenticação, ativação, exemplo de paginação e requisitos de escrita antes de testar.
32. Usa como MessageId um identificador estável do evento. Confirma após persistência pelo consumidor. Limita tentativas e define como recuperar mensagens para revisão. A deteção do broker tem uma janela configurada.
33. Categoria permitida com limiar validado encaminha para o percurso previsto. Categoria desconhecida ou timeout cria revisão com correlação. A escrita da encomenda mantém a confirmação independente.

## Projeto final

34. Uma solução passa o JSON do portal pelo script do módulo 02 e testa o destino com o simulador. Um POST válido cria ERP-1001. O POST repetido recupera o mesmo registo. O payload divergente recebe 409 e a consulta confirma quantidade 2. Perante resposta perdida, consulta CN-1001 e decide com base no estado. Usa os nove critérios para separar evidência local, evidência SAP e decisões documentadas.

## Fontes oficiais

- [Build Your Integrations and APIs](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/centralized-developer-hub-38422de917ee40e1a47df0b368def295-1188)
- [Define Idempotent Process Call](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/define-idempotent-process-call)
- [Azure Service Bus duplicate message detection](https://learn.microsoft.com/en-us/azure/service-bus-messaging/duplicate-detection)
