# Cloud Integration e o percurso da mensagem

Vais construir mentalmente e, se tiveres um tenant, no editor, um iFlow que cria uma encomenda fictícia. Vais depois localizar a sua execução. A distinção entre o artefacto, o estado do runtime e o registo de uma mensagem é a base para diagnosticar fluxos mais complexos.

## Pacote artefacto e execução

Um pacote agrupa artefactos de integração. Um iFlow é um desses artefactos e descreve a sequência de eventos, passos e ligações. O editor guarda o desenho. O deploy publica uma versão para execução no runtime. Uma alteração guardada no editor só afeta o que corre depois de ser publicada com sucesso.

O evento inicial decide como a mensagem entra. Um Timer cria a execução a partir de um relógio. Num fluxo com HTTPS, um sistema remetente chama o endpoint e o adaptador recebe o pedido. Um adaptador recetor comunica com o destino, por exemplo via HTTP. Num passo Request Reply, o fluxo recebe a resposta para continuar a processá-la.

## Corpo cabeçalhos e propriedades

| Parte | Função | Exemplo |
|---|---|---|
| Corpo | Dados processados pelo fluxo | JSON da encomenda |
| Cabeçalhos | Metadados usados nos passos e adaptadores | Content-Type ou correlação |
| Propriedades de troca | Estado interno para passos seguintes | orderId ou tamanho |

Usa uma propriedade para reter um identificador original se o passo seguinte mudar o corpo. Um cabeçalho pode propagar-se para fora conforme o adaptador e a configuração. Define o que aceitas ou envias na fronteira. Não copies todos os cabeçalhos de entrada para um serviço terceiro.

Um Content Modifier permite configurar o corpo, cabeçalhos e propriedades de forma declarativa. Define valores constantes para a primeira experiência. Quando mudares para valores derivados de uma mensagem, confirma a linguagem de expressão e a presença do campo antes de depender dele.

## Ler o Groovy Ola

O ZIP de referência contém um modelo BPMN XML com extensão `.iflw`, um ficheiro `script1.groovy` e metadados do artefacto. O percurso liga o evento inicial Timer ao Content Modifier, ao passo de script e ao evento End. O script mede o comprimento do texto, guarda-o como a propriedade `tamanho` e coloca o corpo em maiúsculas.

Um ZIP de iFlow é um pacote de desenho. Podes usá-lo para saber que passos e scripts foram configurados. O resultado observado vem do registo de execução. O registo anterior do teste do Groovy Ola descreve o corpo original antes do script e o corpo transformado antes do End.

## Laboratório com Timer

1. Cria o pacote de treino Casa Nova e um iFlow CN01 Mensagem. Abre-o em edição.
2. No Integration Process, configura um Start Timer para iniciar uma vez no deploy, conforme as opções do perfil. Liga o Timer a um Content Modifier e depois ao End.
3. No Content Modifier, define o corpo como constante com o JSON abaixo. Cria a propriedade `orderId` com `CN-1001` e o cabeçalho `Content-Type` com `application/json`.
4. Guarda e publica no ambiente de teste. Confirma o estado do artefacto. Aguarda a execução e procura o iFlow nas mensagens processadas.
5. Se precisares de ver o conteúdo por passo, usa Trace por instantes com dados fictícios. Num Timer que corre no deploy, prepara o Trace e volta a disparar o laboratório de forma controlada. Usa o horário e o identificador da execução para distinguir a tentativa nova da antiga.
6. Termina a experiência com o nível de log habitual. Se a execução anterior reportar um desenho diferente do atual, confirma a versão e a hora do deploy.

    {"orderId":"CN-1001","sku":"C-01","quantity":2}

**NOTA:** Sem tenant, desenha as três formas em papel e escreve corpo, cabeçalho e propriedade em colunas separadas. Preenche o estado antes e depois do Content Modifier. No módulo seguinte vais simular a transformação em Groovy.

## Diagnosticar o primeiro fluxo

| Observação | Pista a verificar |
|---|---|
| O editor mostra a alteração, mas a execução ainda tem valores antigos | Confirma a versão publicada e o horário |
| Foi publicado, mas não há mensagem no monitor | Confirma o disparo, a janela temporal e o filtro |
| Existe registo, mas não vês o corpo | Confirma nível de log, permissões e execução selecionada |
| Vês o corpo antigo antes do Content Modifier | Compara com o estado antes do passo seguinte |

## Exercícios

Faz os exercícios 1 a 3 no módulo 13. Guarda o desenho, uma tabela do estado da mensagem e uma nota com o identificador da execução ou com o percurso simulado.

## Fontes oficiais

- [Creating an Integration Flow](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/creating-integration-flow?locale=en-us)
- [Getting Started with Integration Flow Design Guidelines](https://developers.sap.com/tutorials/btp-integration-suite-design-guidelines?embed=full)
- [Message Processing Logs](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/message-processing-logs)
