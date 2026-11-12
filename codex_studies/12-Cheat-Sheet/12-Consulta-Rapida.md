# 12 Consulta rápida

## Começar e diagnosticar

    codex --version
    codex --help
    codex login
    codex doctor
    codex

## Modelo e esforço

No TUI, usa <code>/model</code> para escolher um modelo e esforço disponível. Confirma com <code>/status</code>.

    codex -m gpt-6.1-sol -c 'model_reasoning_effort="high"'

## Tarefa curta interativa

    codex -C . "Corrige o caso de token expirado e executa o teste relevante"

Prompt útil: objetivo + contexto + limites + evidência de aceitação.

## Analisar sem editar

    codex exec --sandbox read-only "Explica a origem deste erro sem alterar ficheiros"

## Execução automatizada

    codex exec --json "Resume a alteração do ramo"
    codex exec --output-last-message resumo.txt "Resume este projeto"
    codex exec resume --last "Continua e corre o teste"

Consulta <code>codex exec --help</code> para opções que a versão instalada reconhece.

## Revisão e Git

    git status --short
    git diff --check
    git diff
    codex review --uncommitted
    codex review --base main

## Configuração mínima

    model = "gpt-6.1-sol"
    model_reasoning_effort = "medium"
    approval_policy = "on-request"
    sandbox_mode = "workspace-write"

Confirma os valores aceites pela conta e pelo CLI. Perfis são selecionados com <code>--profile nome</code>; sobreposições pontuais usam <code>-c chave=valor</code>.

## Comandos slash mais usados

| Tarefa | Comando |
|---|---|
| Escolher modelo e esforço | <code>/model</code> |
| Ver sessão e limites | <code>/status</code> |
| Planeamento | <code>/plan</code> |
| Ler alterações | <code>/diff</code> |
| Revisão | <code>/review</code> |
| Compactar contexto | <code>/compact</code> |
| Ver permissões | <code>/permissions</code> |
| Ver servidores MCP | <code>/mcp</code> |
| Selecionar skills | <code>/skills</code> |
| Sair | <code>/quit</code> ou <code>/exit</code> |

## Segurança

- Começa com o sandbox mínimo que permite realizar a tarefa.
- Inspeciona comandos que apagam dados, acedem à rede ou chamam scripts externos.
- Não uses <code>--yolo</code> para evitar pausas normais.
- Lê o diff e confirma os testes antes de integrar alterações.
- Usa <code>codex --help</code> e a referência oficial para resolver diferenças de versão.

## Modelos num relance

| Perfil de tarefa | Começa por |
|---|---|
| Extração ou edição pequena e definida | GPT-6 Luna, esforço baixo |
| Desenvolvimento diário com várias etapas | GPT-6.1 Sol, esforço médio |
| Diagnóstico complexo ou tarefa com ambiguidades | GPT-6.1 Sol ou Astra, esforço alto |
| Análise exigente com elevada importância de qualidade | GPT-6 Astra, esforço elevado ou Max se disponível |
| Partes independentes que beneficiam de paralelo | Ultra se o seletor atual o apresentar |

Estas são recomendações práticas. Confirma os controlos efetivamente disponíveis com <code>/model</code>.

Para Luna, a orientação atual do Codex sugere High como ponto de partida. Em tarefas mecânicas e claras, podes experimentar <code>low</code> se a opção estiver disponível e se a qualidade continuar suficiente.

## Fontes oficiais

- [Modelos e disponibilidade no Codex](https://developers.openai.com/codex/models)
- [Referência de comandos do Codex CLI](https://developers.openai.com/codex/cli/reference)
- [Referência de configuração do Codex](https://developers.openai.com/codex/config-reference)
