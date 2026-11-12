# 11 Exercícios práticos

Resolve os exercícios por ordem. Usa um repositório de prática e não ponhas credenciais ou dados de produção no contexto. O módulo 13 contém respostas orientadoras.

## Nível inicial

1. **Confirmar a instalação.** Mostra a versão e as opções gerais do CLI. Indica que comando te dá ajuda para um subcomando específico.
2. **Explorar sem editar.** Abre um projeto e pede uma descrição da sua estrutura sem alterações. Confirma o estado do Git depois.
3. **Melhorar um prompt.** Reescreve “corrige o login” para incluir o comportamento atual, o resultado esperado e a forma de validação.
4. **Separar CLI e TUI.** Explica a diferença entre <code>codex review</code> e <code>/review</code>.
5. **Inspecionar o diff.** Pede uma alteração pequena num ficheiro de teste. Mostra o diff e confirma que só a área esperada mudou.

## Modelos e esforço

6. **Escolher modelo.** Para uma extração repetível de nomes de ficheiros, escolhe modelo e esforço inicial. Justifica com a matriz do módulo 03.
7. **Diagnosticar um bug.** Para um erro sem reprodução clara que cruza três módulos, escolhe uma configuração e explica por que não começarias por Max ou Ultra.
8. **Comparar esforço.** Executa o mesmo pedido de leitura com esforço baixo e médio. Regista qualidade, tempo e diferença útil.
9. **Confirmar disponibilidade.** Usa <code>/model</code> e <code>/status</code> para descobrir os controlos reais da tua conta.

## Configuração e segurança

10. **Criar instruções de projeto.** Escreve um AGENTS.md com o comando de teste e uma convenção verdadeira do projeto.
11. **Usar um perfil.** Define um perfil local com modelo e esforço mais baixos. Inicia o CLI usando <code>--profile</code>.
12. **Ler limites.** Explica a diferença entre sandbox <code>read-only</code> e política de aprovação.
13. **Analisar um bloqueio.** Perante uma ação negada, lista as perguntas que deves responder antes de ampliar o acesso.
14. **Reconhecer risco.** Explica por que motivo <code>--yolo</code> não deve ser adicionado a um script genérico de desenvolvimento.

## Git e automação

15. **Rever o trabalho.** Usa <code>codex review --uncommitted</code> e verifica pelo menos uma observação diretamente no código.
16. **Executar sem TUI.** Corre um <code>codex exec</code> de leitura e guarda a última mensagem num ficheiro temporário.
17. **Ler JSONL.** Inicia <code>codex exec --json</code> e identifica o significado geral das linhas de evento.
18. **Retomar sessão.** Confirma o help local e escreve o comando para retomar a última execução.

## Integrações e exercício final

19. **Escolher uma extensão.** Para uma tarefa que necessita de consultar tickets privados, compara skill, MCP e plugin. Identifica a superfície que realmente acede aos dados.
20. **Planeamento paralelo.** Divide uma revisão de documentação em subtarefas que não dependem umas das outras. Define limites e formato da resposta.
21. **Final de ponta a ponta.** Escolhe um bug simples num repositório de teste. Explora, planeia, implementa, testa, revê diff e escreve um resumo. Não cries commit.

## Folha de registo

Para cada tentativa, regista:

| Campo | O que anotar |
|---|---|
| Tarefa | O que pediste |
| Modelo e esforço | Valores selecionados e controlos disponíveis |
| Permissões | Sandbox e política de aprovação |
| Resultado | O que mudou e que comandos foram executados |
| Verificação | Teste, diff e qualquer limite observado |

## Fontes oficiais

- [Modelos e disponibilidade no Codex](https://developers.openai.com/codex/models)
- [Referência de comandos do Codex CLI](https://developers.openai.com/codex/cli/reference)
- [Segurança, sandbox e aprovações](https://developers.openai.com/codex/security)
