# Padrões de integração e tratamento de erros

Uma encomenda pode seguir para o ERP, para revisão ou para rejeição. Um lote pode precisar de vários pedidos. A escolha dos passos depende de como queres tratar falhas, duplicados e respostas parciais. Vais desenhar estes percursos e verificar os casos negativos antes de acrescentar mais adaptadores. No fim sabes escolher entre Router, Splitter, Gather e Multicast, terminar um Exception Subprocess com o evento certo, e dizer o que garante (e o que não garante) uma repetição ou uma chamada idempotente.

**NOTA:** Documentado significa resumo de páginas da documentação SAP (nomes em ISuite_Integrations_APIs/, no fim de cada secção). Os laboratórios desta aula são todos por testar no teu tenant: nenhum foi executado nesta revisão. Os nomes dos campos são os da documentação em inglês.

## Encaminhar com o Router

O Router escolhe um percurso a partir de condições. Documentado (define-router-d7fddbd.md):

| Aspeto | O que a documentação diz |
|---|---|
| Tipo de expressão | XML (XPath) ou Non-XML (cabeçalho, propriedade ou exceção) |
| Operadores Non-XML | igual, diferente, maior, menor, and, or, contains, not contains, in, not in, regex e not regex |
| Exemplo Non-XML | ${property.route} = 'aceitar' ou ${header.SenderId} regex '1.*' |
| Ramos | Usa o mesmo tipo de condição em todos os ramos: misturar XML e Non-XML faz a avaliação falhar |
| Ramo predefinido | Default Route; só conta o último ramo marcado como predefinido |
| Throw Exception | Opção do Router; com ela ativa, o ramo predefinido tem de terminar com Terminate Message |

Se transformaste a mensagem antes do Router, confirma que a condição usa o caminho do formato novo. Para evitar acoplamento entre formatos, guarda primeiro uma decisão de negócio na propriedade `route` e deixa o Router ler só essa propriedade.

## Dividir e juntar

| Passo | Comportamento (Documentado) | Decisão a tomar |
|---|---|---|
| General Splitter | Divide um lote em N mensagens, cada uma com os elementos envolventes (o envelope) do original | Útil quando o identificador do lote está no elemento raiz |
| Iterating Splitter | Divide sem copiar os elementos envolventes | Guarda o identificador do lote numa propriedade antes de dividir |
| Gather | Junta mensagens de rotas diferentes; formatos XML (igual ou diferente), texto simples ou qualquer; algoritmos Combine, Combine at XPath, Concatenate, Zip e Tar | Cabeçalhos e propriedades de passos anteriores não são agregados |
| Join | Reúne rotas de um Multicast antes de um Gather | Só reúne; não altera o conteúdo |
| Multicast | Envia cópias da mesma mensagem para várias rotas, em paralelo ou em sequência | Um Multicast por Integration Process; separa Router e Multicast em processos diferentes |
| Aggregator | Guarda mensagens relacionadas até o conjunto estar completo; correlação por XPath | Não é suportado num Local Integration Process nem num Exception Subprocess; define a condição de fecho |
| Fila JMS | Guarda a mensagem para processamento assíncrono | Repetição e operação (ver mais abaixo) |

Campos do General e do Iterating Splitter (Documentado):

| Campo | O que faz | Limites |
|---|---|---|
| XPath Expression | Caminho do elemento onde dividir, por exemplo /Batch/Order | Só caminhos absolutos ou relativos; os caracteres barra vertical, mais, asterisco, maior, igual, menor ou igual, parênteses retos e arroba não são suportados; não se divide por valor de um elemento |
| Grouping | Número de elementos por mensagem | 10 nós com grupos de 2 dão 5 mensagens |
| Streaming | Começa a processar antes de ter o lote completo em memória | Menos memória |
| Parallel Processing, Number of Concurrent Processes e Timeout (in s) | Processamento concorrente | Por omissão 10 processos (máximo 50) e 300 s; se o tempo esgotar, o Splitter para sem exceção e o resultado pode ficar incompleto |
| Stop On Exception | Pára o processamento se uma parte falhar | Ver a secção de erros |

Se o XPath não corresponder ao payload, o Splitter não gera nada e o fluxo termina com o estado Completed. O runtime acrescenta os cabeçalhos CamelSplitIndex (começa em 0), CamelSplitSize e CamelSplitComplete, que ajudam a nomear partes e a detetar a última. Num Local Integration Process, cada Splitter tem de ser fechado por um Gather.

Documentado: define-general-splitter-a6c1916.md, define-iterating-splitter-d61d6ec.md, define-gather-and-join-94ef1f2.md, define-multicast-17de3ea.md e define-aggregator-aa23816.md.

## Classificar antes de repetir

| Falha | Exemplo | Ação |
|---|---|---|
| Validação | Quantidade zero | Rejeita com erro compreensível |
| Conflito de negócio | Mesma referência com outro SKU | Revisão ou resposta de conflito |
| Credencial inválida | 401 ou 403 no destino | Verifica acesso e configuração |
| Transitória | 429 ou 503 | Repetição limitada, se segura |
| Resultado incerto | Timeout depois de iniciar escrita | Consulta por chave antes de repetir |

A documentação oferece a repetição como funcionalidade de vários componentes. Documentado:

| Mecanismo | Como repete | Limites |
|---|---|---|
| HTTP Receiver | Retry on Exception e Retry on Error Response, com lista de códigos HTTP | Máximo de 3 repetições e 60 s entre tentativas; o Exception Subprocess só é chamado depois de todas as repetições |
| JMS Sender | A fila repete a entrega no intervalo definido; Exponential Backoff duplica o intervalo | Não limita o número de repetições (usa o cabeçalho SAPJMSRetries num Exception Subprocess); Dead-Letter Queue só para erros de memória |
| SFTP e outros adaptadores de leitura | Alguns têm repetição nativa | Vê a página do adaptador |
| Remetente | O sistema que envia volta a tentar | Exige que o remetente tenha um mecanismo de repetição |

Para repetição desde o Integration Suite, a documentação propõe persistir a mensagem numa fila JMS (o remetente recebe logo um 202 Accepted) ou num Data Store com um segundo fluxo a reprocessar. Isto exige ativar a opção Message Queues na capacidade Cloud Integration (módulo 00).

Documentado: apply-the-retry-pattern-97789c9.md, http-receiver-adapter-2da452e.md e configure-the-jms-sender-adapter-161791b.md.

## Exception Subprocess

O Exception Subprocess apanha as exceções do processo onde está e começa sempre com um Error Start. Termina com um de três eventos, e o estado final no monitor depende dele (Documentado):

| Evento final | Estado da mensagem no monitor | Quando usar |
|---|---|---|
| End Message | Completed (pode definir um estado personalizado) | Responder com uma mensagem de erro personalizada ao remetente |
| Error End | Failed | Acrescentar informação ao registo e manter a falha visível |
| Escalation End | Escalated | Distinguir estas falhas numa pesquisa por estado |

Responder sempre com sucesso pode ocultar que o destino falhou. Nos pedidos síncronos, devolve um código coerente com a falha e mantém a confirmação de negócio explícita. Podes ler `${exception.message}` e `${exception.stacktrace}` dentro do subprocesso. Cuidados documentados:

- Dentro do Exception Subprocess não são suportados, entre outros, o Router, o Splitter, o Aggregator, outro Exception Subprocess e um Local Integration Process. A página sobre classificação de erros sugere usar o Router com a propriedade SAP_ErrorModelStepID: por testar como combinar as duas indicações no teu tenant.
- Não se apanham no processo principal as exceções de um Local Integration Process.
- Um erro de chave duplicada no Data Store Write não pode ser tratado pelo subprocesso, porque a transação é revertida.
- O registo continua em estado de erro mesmo que apanhes a exceção, a não ser que termines com End Message.
- Se o destino responde 200 com um erro no corpo, o erro tem de ser lido pelo fluxo (ver a página Handle Errors in Successful Responses).

Com um Splitter, combina Stop On Exception com o evento final (Documentado):

| Stop On Exception | Exception Subprocess | Resultado |
|---|---|---|
| Ativado | Nenhum, ou terminado com Error End | A unidade de trabalho falha de uma vez |
| Desativado | Nenhum, ou terminado com Message End | Processas o máximo de partes e tratas as erradas à parte |

Usa um Local Integration Process para o processamento de cada parte, com o seu Exception Subprocess. Se usas Gather a seguir, o subprocesso tem de produzir um XML válido, senão o Gather falha e a mensagem toda termina como Failed.

Documentado: define-exception-subprocess-690e078.md, handle-exceptions-ca95c61.md, handle-errors-gracefully-42c95f7.md, error-classification-3eada96.md e handle-exceptions-when-using-the-splitter-pattern-74e431c.md.

## Idempotência e qualidade de serviço

A documentação define níveis de qualidade de serviço: Best Effort, At Least Once (pode haver duplicados), At Most Once (pode não haver entrega) e Exactly Once (junção dos dois anteriores). A responsabilidade pelo resultado ponta a ponta é de quem desenha o fluxo, incluindo evitar efeitos de duplicados no recetor.

Define uma chave estável como `portal:CN-1001`. Uma repetição da mesma entrada deve recuperar o resultado conhecido ou deixar o estado de negócio igual. Se a mesma chave for reutilizada para conteúdo diferente, trata-a como conflito. No módulo 12, o simulador demonstra ambas as situações.

O Idempotent Process Call chama um Local Integration Process e regista o identificador da mensagem quando o subprocesso termina com sucesso. Documentado (define-idempotent-process-call-84c85d7.md):

| Campo | O que faz |
|---|---|
| Local Integration Process | O subprocesso a proteger |
| Message ID | O identificador a verificar; usa uma expressão de cabeçalho ou propriedade |
| Skip Process Call for Duplicates | Ativado por omissão: um duplicado não corre o subprocesso; desativado, corre sempre e podes testar ${property.CamelDuplicateMessage}='true' |

Limites documentados: os identificadores são apagados ao fim de 90 dias por omissão; a verificação está ligada à instância do passo (se apagares e refizeres o passo, o histórico desaparece); o subprocesso deve ser o mais simples possível. A própria documentação avisa que uma falha entre a escrita e a confirmação deixa o resultado incerto: o destino deve, sempre que possível, impor a unicidade da referência. Com JMS, testa o caso em que um consumidor grava e falha antes de confirmar a mensagem. Mantém limites de tentativas e um procedimento de intervenção.

Sobre JMS, a documentação indica: o acesso Exclusive garante ordem mas só um consumidor; Non-Exclusive permite paralelismo; o tipo não pode ser mudado depois de a fila ser criada; os recursos da instância de mensagens são limitados (recomenda-se concorrência entre 1 e 5). Fontes: jms-adapter-0993f2a.md e quality-of-service-2b9acb2.md.

## Laboratório com três percursos

Todo este laboratório é por testar. Escreve o resultado esperado antes de publicar.

1. Cria uma propriedade `route` num Content Modifier e começa com `aceitar`. Modela um Router com os ramos aceitar, rever e predefinido (rejeitar), todos com condição Non-XML: `${property.route} = 'aceitar'`, `${property.route} = 'rever'`. Dá a cada ramo um Content Modifier com um corpo diferente.
2. Testa os três valores (aceitar, rever e um valor desconhecido, por exemplo xpto). Resultado esperado: o valor desconhecido segue o ramo predefinido.
3. Num segundo fluxo, usa o XML abaixo. Antes do Splitter, guarda o identificador do lote numa propriedade com um Content Modifier do tipo XPath (`/Batch/@id`). Configura um General Splitter com XPath `/Batch/Order`. Observa quantas mensagens passam pelo passo seguinte e se cada uma mantém o elemento Batch com o id (resultado esperado: sim, com o General Splitter; repete com o Iterating Splitter e compara).
4. Num Local Integration Process, usa um Router com uma condição XML sobre cada parte, por exemplo `/Batch/Order/Quantity > 0`, e um ramo predefinido de rejeição. Fecha com um Gather (Incoming Format XML Same Format, Combine). Decide e documenta se a parte inválida termina o lote (Stop On Exception ativado), se agrega uma rejeição ou se é encaminhada para tratamento separado.
5. Acrescenta um Exception Subprocess ao Local Integration Process, terminando com Message End, que devolve um XML válido com a referência da parte. Compara o estado do registo com um subprocesso terminado em Error End.
6. Para testar a estratégia de repetição localmente, executa os cenários 503 e duplicado do módulo 12. Um 503 simulado antecede a escrita. No tenant, ativa Retry on Error Response no recetor HTTP com o código 503, 2 repetições e um intervalo de 5 s, e repete o teste. Acrescenta ao desenho o cenário em que a confirmação se perde depois da escrita.
7. Variante: envolve a chamada ao ERP num Idempotent Process Call com Message ID `portal:${property.orderId}` e envia duas vezes a mesma encomenda. Resultado esperado: a segunda não chega ao simulador.

    <Batch id="B-17">
      <Order id="CN-1001"><Quantity>2</Quantity></Order>
      <Order id="CN-1002"><Quantity>0</Quantity></Order>
    </Batch>

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| O Router lança erro de avaliação | Se misturaste condições XML e Non-XML nos ramos |
| Nenhum ramo é escolhido | Existe um ramo predefinido e é o último marcado? O valor da propriedade tem a grafia certa? |
| O Splitter não produz mensagens e o fluxo fica Completed | O XPath não corresponde ao payload (nomes, namespaces) |
| Só algumas partes aparecem no Gather | Timeout do processamento paralelo ou partes ignoradas por falha |
| O Gather falha depois de uma parte inválida | O Exception Subprocess não devolveu um XML válido |
| O monitor mostra Completed mas o destino falhou | O Exception Subprocess termina com End Message; usa Error End ou um estado personalizado |
| Dois registos para a mesma encomenda no ERP | A chave de idempotência, o ID do passo (foi refeito?) e se o destino impõe unicidade |
| A fila JMS enche | Intervalo de repetição, número de consumidores e se existe um limite de tentativas |

## Exercícios

**PRATICAR:** resolve os exercícios 10 a 12 no módulo 13. Inclui no desenho a responsabilidade de quem pode repetir uma mensagem e a decisão quando chega um duplicado.

## Fontes oficiais

- [Define Router](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/define-router)
- [Define Exception Subprocess](https://help.sap.com/docs/integration-suite/sap-integration-suite/define-exception-subprocess?q=Integration_Provisioner)
- [Define Idempotent Process Call](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/define-idempotent-process-call)
- [Handle Errors Gracefully](https://help.sap.com/docs/SAP_INTEGRATION_SUITE/sap-integration-suite/handle-errors-gracefully)
- [Define General Splitter (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/define-general-splitter-a6c1916.md)
- [Handle Exceptions When Using the Splitter Pattern (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/handle-exceptions-when-using-the-splitter-pattern-74e431c.md)
- [Quality of Service (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/quality-of-service-2b9acb2.md)
- [Configure the JMS Sender Adapter (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/configure-the-jms-sender-adapter-161791b.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0)
