# Segurança monitorização e entrega

Uma integração precisa de identidades separadas para o cliente que a chama, o fluxo que chama um destino e as pessoas que a operam. Vais preparar uma entrega com configuração própria por ambiente e um procedimento de diagnóstico que usa a referência da encomenda.

## Acessos e material de segurança

| Fronteira | Exemplo | Controlo |
|---|---|---|
| Cliente para iFlow | Portal invoca HTTPS Sender | Autenticação de entrada e papel adequado |
| iFlow para destino | Fluxo chama ERP | Credencial do destino por alias |
| Operação | Equipa consulta registos | Acesso de leitura necessário |
| Entrega | Processo publica artefacto | Identidade de implantação autorizada |

Para uma integração máquina a máquina, OAuth 2.0 client credentials pode ser adequado quando o runtime e o destino o suportam. Distingue o URL de token do endpoint da API. Confirma o destinatário do token, o papel e o fluxo de autenticação documentado. A API administrativa e o endpoint de um iFlow podem exigir planos ou permissões diferentes.

Guarda credenciais de saída no material de segurança associado ao ambiente, com um alias que o adaptador usa. Usa o keystore para o material criptográfico apropriado e confirma a cadeia de confiança do destino. Regista a data de expiração e ensaia a rotação no teste. Parâmetros externalizados podem indicar um endereço ou um alias. O valor secreto fica no mecanismo de credenciais.

## Monitorizar com correlação

Se o portal enviar `X-Correlation-Id`, valida ou gera o valor na fronteira e transporta-o para o destino em cabeçalhos permitidos. Regista também a referência de negócio e, quando disponível, o identificador da mensagem SAP. Cada um responde a uma pergunta diferente. Uma encomenda pode ter várias tentativas de processamento.

Começa no monitor com o intervalo de tempo, o nome do artefacto, o estado e o identificador. Para um erro técnico, confirma primeiro onde falhou a cadeia. Para uma falha de negócio, procura o estado na aplicação dona dos dados. Mede sucesso, rejeições de validação, falhas transitórias, atraso e acumulação de fila conforme o cenário.

**ATENÇÃO:** Usa Trace durante uma janela curta de laboratório com dados sintéticos. Os conteúdos capturados podem incluir informação sensível. Partilha apenas o necessário para diagnosticar.

## Transportar de teste para produção

1. Identifica a versão, a dependência de scripts, os endpoints e os aliases.
2. Configura de antemão a conectividade e os segredos no destino. Associa o processo aprovado de transporte à versão pretendida, por exemplo SAP Cloud Transport Management quando estiver configurado.
3. Publica no teste, executa o caso de sucesso e um caso de falha e regista as evidências.
4. Após publicação no ambiente de destino, valida estado, rota e um pedido de verificação autorizado.
5. Se falhar, suspende novas entradas quando necessário, verifica mensagens em trânsito e restaura a versão ou aplica a correção aprovada. Reconcilia efeitos já gravados no ERP.

## Laboratório com identidade e erro

Usa uma credencial de treino num recetor de teste autorizado. Configura um alias válido e confirma uma execução. Em ambiente isolado, faz uma segunda tentativa com um alias deliberadamente inexistente e compara o registo. Preenche a ficha com versão, horário, correlação, passo, categoria e ação. Sem tenant, faz a triagem sobre o quadro seguinte.

| Sintoma | Primeira verificação |
|---|---|
| 401 de entrada | Token e mecanismo de autenticação |
| 403 com identidade válida | Papel ou autorização para a operação |
| 401 no recetor | Alias e credencial do destino |
| Erro de TLS | Cadeia de confiança e nome do servidor |
| Alarme de atraso | Fila, destino e hora da última confirmação |

## Exercícios

Resolve os exercícios 16 a 18 no módulo 13. Inclui critérios claros para voltar à versão anterior e indica quem reconcilia pedidos em trânsito.

## Fontes oficiais

- [User Authentication and Authorization](https://help.sap.com/docs/integration-suite/sap-integration-suite/user-authentication-and-authorization)
- [Setting Up OAuth for Cloud Integration in Cloud Foundry](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/setting-up-oauth-for-cloud-integration-in-cloud-foundry?locale=en-US)
- [Security-Relevant Logging and Tracing](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/security-relevant-logging-and-tracing)
- [Monitor Message Processing](https://help.sap.com/docs/integration-suite/sap-integration-suite/monitor-message-processing?version=CLOUD)
