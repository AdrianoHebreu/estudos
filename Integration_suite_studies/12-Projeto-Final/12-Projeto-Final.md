# Projeto final da Casa Nova Distribuição

Constrói uma integração de encomendas entre um portal, o SAP Integration Suite e um ERP simulado. A encomenda é confirmada pelo serviço que a regista. Uma notificação de stock pode seguir em separado para Azure. Vais entregar o desenho, uma prova do percurso local e, quando tiveres acesso, a prova de execução no tenant.

## Contrato e responsabilidades

| Componente | Responsabilidade | Identificador |
|---|---|---|
| Portal | Enviar pedido e consultar resultado incerto | orderId |
| iFlow | Validar, mapear e encaminhar | Correlação e registo de mensagem |
| ERP simulado | Guardar e deduplicar | externalId e erpId |
| Serviço de stock | Consumir confirmação em separado | Identificador de evento |

O portal envia um objeto com `orderId`, `sku` e `quantity`. A referência segue o padrão CN seguido de hífen e até doze algarismos. O SKU normalizado admite letras ASCII, algarismos e hífen, até 32 caracteres. A quantidade é um inteiro positivo até 2147483647. O ERP simulado aceita uma linha, recebe a referência como `externalId` e devolve `erpId`.

    Entrada do portal
    {"orderId":"CN-1001","sku":" c-01 ","quantity":2}

    Entrada do ERP
    {"externalId":"CN-1001","items":[{"sku":"C-01","quantity":2}]}

    Resposta de negócio
    {"externalId":"CN-1001","erpId":"ERP-1001","status":"accepted"}

O simulador devolve também `items` no corpo. O iFlow pode apresentar ao portal apenas os campos do contrato de resposta. Define um tempo-limite para o percurso inteiro e mantém uma consulta por referência para o caso em que o cliente não sabe se a escrita ocorreu.

## Construir o percurso local

1. Executa os testes Groovy no módulo 02 e compara o resultado de `NormalizarEncomenda.groovy` com `exemplos/pedido.json`.
2. Abre um terminal PowerShell em `12-Projeto-Final/exemplos` e executa `bun run erp.ts`. O simulador escuta apenas no endereço local e mantém registos em memória durante a execução.
3. Num segundo terminal, na mesma pasta, envia o pedido com o comando abaixo. Confirma o 201, o cabeçalho Location e a referência ERP.
4. Repete o mesmo pedido e confirma o 200 com o mesmo resultado. Altera a quantidade no corpo de uma cópia local do ficheiro e confirma o 409. Usa a consulta abaixo para confirmar que o original ficou gravado.
5. Corre `bun test erp.test.ts`. Os testes arrancam serviços em portas efémeras e verificam também rejeição de quantidade inválida e falha transitória antes da escrita. Termina o servidor manual com Ctrl+C quando acabares.

    curl.exe -i -H 'Content-Type: application/json' `
      --data-binary '@pedido.json' http://127.0.0.1:8765/orders
    curl.exe -i http://127.0.0.1:8765/orders/CN-1001

## Casos de aceitação

| Caso | Resultado esperado | Evidência |
|---|---|---|
| Primeira submissão válida | 201 e novo registo | Resposta e consulta |
| Repetição idêntica | 200 e mesma referência | Dois corpos iguais |
| Mesma chave com conteúdo diferente | 409 | Registo original preservado |
| Quantidade inválida | 400 na API do ERP | Consulta sem registo |
| Destino indisponível antes da escrita | 503 e indicação de espera | Consulta sem registo e nova tentativa |
| Resposta perdida após escrever | Consultar por referência | Ensaio de desenho e reconciliação |

Para reproduzir o 503 manualmente com uma chave ainda livre, envia o cabeçalho de laboratório `X-Lab-Fail: before-write` e depois envia o mesmo pedido sem esse cabeçalho. O cabeçalho serve os testes do simulador. Em produção, um cliente não controla o modo de falha de um sistema.

## Implementar no tenant

1. Cria o pacote Casa Nova e um iFlow de teste com HTTPS Sender. Documenta o caminho de entrada e a autenticação de laboratório.
2. Adiciona a normalização Groovy do módulo 02. Liga Request Reply a um HTTP Receiver para um destino HTTPS de teste autorizado. Configura URL e alias por ambiente.
3. Define os estados de retorno e o tratamento de exceções. Conforme o perfil e configuração, um erro HTTP do recetor pode virar exceção. Testa explicitamente o 409 e evita traduzi-lo em sucesso.
4. Publica, chama como cliente autorizado e liga a referência do pedido ao registo da mensagem. Executa os casos aplicáveis e guarda os resultados saneados.
5. Para o desenho Azure, propõe um evento estável e uma fila ou tópico para stock. Num sistema persistente, usa uma forma fiável de emitir após a confirmação do ERP, como uma outbox onde exista controlo da transação. Descreve a ação quando o processamento da notificação falhar.

**NOTA:** O simulador incluído é local. Para validar o percurso SAP até ao destino, precisas de um serviço de teste acessível ao runtime e dos controlos de acesso do ambiente. Mantém o laboratório local se não tiveres esse acesso.

## Grelha de avaliação

Marca cada critério como demonstrado, desenhado ou por verificar. Anexa uma evidência a cada resultado.

1. Contrato de entrada e saída com campos, formato e códigos.
2. Fluxo com fronteiras, responsabilidades e correlação.
3. Transformação valida e preserva a referência.
4. Repetição idêntica preserva um único efeito.
5. Conflito devolve resultado distinto de uma falha transitória.
6. Tempo-limite e resposta perdida têm estratégia de reconciliação.
7. Credenciais e configuração usam mecanismos do ambiente.
8. Operação tem pesquisa, sinal de alerta e responsável.
9. Notificação tem chave, política de confirmação e retoma.

## Exercícios

Entrega o exercício 34. Junta as evidências locais, o desenho do fluxo e a grelha. Se fizeste deploy, acrescenta o identificador saneado de execução e indica o perfil usado.

## Fontes oficiais

- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
- [Define Idempotent Process Call](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/define-idempotent-process-call)
- [Asynchronous Messaging Options](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/messaging)
