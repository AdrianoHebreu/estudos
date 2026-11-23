# Padrões de integração e tratamento de erros

Uma encomenda pode seguir para o ERP, para revisão ou para rejeição. Um lote pode precisar de vários pedidos. A escolha dos passos depende de como queres tratar falhas, duplicados e respostas parciais. Vais desenhar estes percursos e verificar os casos negativos antes de acrescentar mais adaptadores.

## Encaminhar e dividir

O Router escolhe um percurso a partir de condições. Coloca um percurso predefinido para a situação em que nenhuma condição é aceite. Se transformaste a mensagem antes do Router, confirma que a condição usa o caminho do formato novo. Para evitar acoplamento entre formatos, podes primeiro guardar uma decisão de negócio em `route`.

Um Splitter transforma um lote em mensagens separadas. Os percursos são mais fáceis de observar se cada parte mantiver o mesmo identificador de lote e a sua própria chave. Um Gather é útil para juntar as partes do mesmo processamento. O Aggregator serve cenários de agregação por correlação, em que partes relacionadas podem chegar separadamente. Define condição de fecho, janela e tratamento de mensagens atrasadas.

| Situação | Passo ou estratégia | Decisão a tomar |
|---|---|---|
| Um pedido segue para uma de três filas | Router | Percurso predefinido |
| Um lote contém 20 encomendas | Splitter | Ordem e falhas parciais |
| Juntar o resultado das partes do lote | Gather | Estrutura da resposta |
| Juntar mensagens independentes | Aggregator | Correlação e término |
| Adiar o processamento | Fila JMS quando disponível | Repetição e operação |

## Classificar antes de repetir

| Falha | Exemplo | Ação |
|---|---|---|
| Validação | Quantidade zero | Rejeita com erro compreensível |
| Conflito de negócio | Mesma referência com outro SKU | Revisão ou resposta de conflito |
| Credencial inválida | 401 ou 403 no destino | Verifica acesso e configuração |
| Transitória | 429 ou 503 | Repetição limitada, se segura |
| Resultado incerto | Timeout depois de iniciar escrita | Consulta por chave antes de repetir |

Um Exception Subprocess pode intercetar erros do percurso aplicável. Guarda a correlação e uma categoria segura para diagnóstico. Escolhe a semântica de término e confirma no monitor o estado final. Responder sempre com sucesso pode ocultar que o destino falhou. Nos pedidos síncronos, devolve um código coerente com a falha e mantém a confirmação de negócio explícita.

## Idempotência e filas

Define uma chave estável como `portal:CN-1001`. Uma repetição da mesma entrada deve recuperar o resultado conhecido ou deixar o estado de negócio igual. Se a mesma chave for reutilizada para conteúdo diferente, trata-a como conflito. No módulo 12, o simulador demonstra ambas as situações.

Um Idempotent Process Call pode reduzir repetições dentro do fluxo, segundo o seu contrato. Ainda assim, uma falha entre a escrita no destino e a confirmação de sucesso pode deixar o resultado incerto. O destino deve, sempre que possível, impor a unicidade da referência. Com JMS, testa o caso em que um consumidor grava e falha antes de confirmar a mensagem. Mantém limites de tentativas e um procedimento de intervenção.

## Laboratório com três percursos

1. Cria uma propriedade `route` e começa com `aceitar`. Modela um Router com os ramos aceitar, rever e predefinido.
2. Usa condições não XML baseadas na propriedade conforme a sintaxe suportada. Dá um corpo diferente a cada ramo. Testa os três valores.
3. Num segundo fluxo, usa XML com dois elementos Order. Configura o Splitter sobre essa lista. Mantém a referência do lote e observa quantas mensagens passam pelo passo seguinte.
4. Introduz uma quantidade inválida numa das partes. Define e verifica se o cenário termina, agrega uma rejeição ou encaminha a parte para tratamento separado. Documenta o resultado esperado antes de publicar.
5. Para testar a estratégia de repetição localmente, executa os cenários 503 e duplicado do módulo 12. Um 503 simulado antecede a escrita. Acrescenta ao desenho o cenário em que a confirmação se perde depois da escrita.

    <Batch id="B-17">
      <Order id="CN-1001"><Quantity>2</Quantity></Order>
      <Order id="CN-1002"><Quantity>0</Quantity></Order>
    </Batch>

## Exercícios

Resolve os exercícios 10 a 12 no módulo 13. Inclui no desenho a responsabilidade de quem pode repetir uma mensagem e a decisão quando chega um duplicado.

## Fontes oficiais

- [Define Router](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/define-router)
- [Define Exception Subprocess](https://help.sap.com/docs/integration-suite/sap-integration-suite/define-exception-subprocess?q=Integration_Provisioner)
- [Define Idempotent Process Call](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/define-idempotent-process-call)
- [Handle Errors Gracefully](https://help.sap.com/docs/SAP_INTEGRATION_SUITE/sap-integration-suite/handle-errors-gracefully)
