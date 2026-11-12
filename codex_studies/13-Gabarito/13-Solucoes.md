# 13 Soluções comentadas

As respostas abaixo descrevem uma solução possível. A versão do CLI e o projeto podem exigir pequenas adaptações.

## Nível inicial

1. Usa <code>codex --version</code> e <code>codex --help</code>. Para detalhes, acrescenta <code>--help</code> ao subcomando, por exemplo <code>codex exec --help</code>.
2. Indica no prompt que não queres alterações. Confirma com <code>git status --short</code> antes e depois.
3. Uma resposta possível: “Investiga por que motivo o login falha quando o token expira. Não alteres ficheiros. Indica o fluxo, os ficheiros relevantes e que teste reproduziria o problema.”
4. <code>codex review</code> inicia uma revisão não interativa a partir do terminal; <code>/review</code> chama a revisão dentro do TUI.
5. Lê <code>/diff</code> ou <code>git diff</code>, verifica ficheiros novos com <code>git status --short</code> e compara cada mudança com o pedido.

## Modelos e esforço

6. GPT-6 Luna com esforço baixo é um ponto de partida razoável para uma extração bem delimitada. Se os nomes exigirem interpretação e houver exceções, sobe para médio ou experimenta GPT-6.1 Sol.
7. GPT-6.1 Sol com esforço alto é um ponto de partida para seguir um bug por vários módulos. Começa sem Max ou Ultra porque ainda não há evidência de que o caso precise do custo e latência adicionais. Ultra faz sentido se houver investigações independentes.
8. Mantém o prompt, o modelo e a qualidade esperada. Regista o tempo e a diferença verificável no resultado. Aumenta o esforço só se o ganho for útil.
9. <code>/model</code> mostra escolhas disponíveis no cliente. <code>/status</code> confirma a sessão selecionada; a disponibilidade pode variar por conta e organização.

## Configuração e segurança

10. Regista o comando de teste real e convenções confirmadas lendo o projeto. Evita declarar comandos que não existem.
11. Cria um perfil no diretório Codex com modelo e esforço, por exemplo <code>fast.config.toml</code>, e inicia com <code>codex --profile fast</code>. Confirma o valor ativo.
12. <code>read-only</code> limita escrita através do sandbox. A política de aprovação define quando o CLI pausa para pedir autorização. Uma política sem pausas pode continuar confinada pelo sandbox; os dois controlos não são equivalentes.
13. Confirma o comando completo, recursos que pode tocar, efeito de rede ou eliminação, existência de alternativa read-only e se a tarefa precisa desse acesso.
14. <code>--yolo</code> desliga sandbox e aprovações. Um script genérico pode assim executar ações destrutivas fora da área prevista, por isso usa-o apenas num executor isolado e especificamente endurecido.

## Git e automação

15. Seleciona alterações não commitadas com <code>codex review --uncommitted</code>. Verifica uma observação no ficheiro e linha correspondentes, depois executa o teste que valida o comportamento.
16. Uma forma possível: <code>codex exec -o resposta.txt "Resume a estrutura deste projeto"</code>. Verifica se o ficheiro foi criado no diretório esperado e lê o conteúdo.
17. <code>--json</code> escreve eventos JSONL, um evento por linha. Não trates o fluxo inteiro como um único objeto JSON. Um consumidor deve tolerar tipos desconhecidos e falhas de execução.
18. Confirma <code>codex exec resume --help</code>. A forma documentada para a sessão mais recente é <code>codex exec resume --last</code>, com uma instrução opcional.

## Integrações e exercício final

19. A skill ensina o fluxo; MCP fornece ligação a ferramentas/dados externos; o plugin empacota capacidades instaláveis. Como os tickets são privados, o acesso ao sistema de tickets é a decisão central. Usa apenas uma ligação autorizada e com âmbito mínimo.
20. Divide, por exemplo, a revisão de três diretórios independentes. Pede a cada parte referências de ficheiros, problemas concretos e dúvidas. Reserva a integração e a verificação final para a sessão principal.
21. Um resultado completo inclui: estado Git inicial, pedido delimitado, teste executado, diff revisto, ficheiros alterados e limites. Se um teste não correu, assinala-o como não executado.

## Projeto final

Uma boa execução poderia seguir esta sequência:

    git status --short
    codex -C . "Investiga o erro de validação no formulário X. Não alteres ficheiros; identifica a causa provável e o teste relevante."

Depois de rever a investigação, pede a alteração:

    Corrige apenas o caso identificado. Mantém o contrato atual para pedidos válidos, ajusta o teste que reproduz a falha e executa-o. No fim, resume a alteração e limitações.

Fecha a tarefa com:

    git diff --check
    git diff
    git status --short
    codex review --uncommitted

Esta sequência separa investigação de execução, exige uma validação e torna o efeito no repositório visível.

## Critério para autoavaliação

Considera a tarefa concluída quando consegues explicar:

- qual modelo e esforço escolheste e porquê;
- que permissões estavam ativas;
- o que mudou;
- que verificação executaste;
- o que ficou por confirmar.

## Fontes oficiais

- [Modelos e disponibilidade no Codex](https://developers.openai.com/codex/models)
- [Referência de comandos do Codex CLI](https://developers.openai.com/codex/cli/reference)
- [Segurança, sandbox e aprovações](https://developers.openai.com/codex/security)
