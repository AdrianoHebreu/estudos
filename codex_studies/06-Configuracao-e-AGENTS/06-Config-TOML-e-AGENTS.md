# 06 Configuração TOML e AGENTS.md

O Codex tem dois mecanismos que se complementam: configuração técnica em TOML e instruções escritas em ficheiros AGENTS.md. A configuração escolhe predefinições e controlos; AGENTS.md explica ao agente como trabalhar naquele repositório.

## Onde vive a configuração

As predefinições pessoais ficam normalmente em:

    ~/.codex/config.toml

No Windows, a pasta de utilizador e a localização de CODEX_HOME determinam o caminho físico. A documentação do Codex é a referência para a localização efetiva da tua instalação.

Um repositório também pode incluir configuração local em:

    .codex/config.toml

O projeto tem de estar marcado como confiável antes de o Codex carregar a sua configuração local. A confiança protege-te de definições e código de hooks que possam ser introduzidos num repositório desconhecido.

## Precedência simplificada

Em geral, o valor explícito de maior prioridade ganha:

1. Flags e sobreposições passadas nesta invocação, como <code>-m</code> e <code>-c</code>.
2. Configuração local do projeto confiável, incluindo as pastas aplicáveis.
3. Perfil selecionado com <code>--profile</code>.
4. Configuração pessoal do utilizador.
5. Valores geridos pela conta, sistema e predefinições internas, quando aplicáveis.

As políticas de requisito da organização podem impor limites que uma configuração pessoal não consegue ultrapassar. Se uma definição parece ser ignorada, usa <code>/debug-config</code> ou consulta <code>config.toml</code> e os requisitos geridos.

## TOML mínimo

    model = "gpt-6.1-sol"
    model_reasoning_effort = "medium"
    approval_policy = "on-request"
    sandbox_mode = "workspace-write"

Este exemplo escolhe predefinições para um fluxo local. Os modelos e valores aceites dependem da conta e da versão do CLI.

Uma sobreposição para uma única execução pode ser passada no comando:

    codex -m gpt-6-luna -c 'model_reasoning_effort="low"'

O valor depois de <code>-c</code> é analisado como TOML quando possível. Aspas e espaços fazem parte da sintaxe: usa quoting apropriado à shell que tens aberta.

## Perfis

Um perfil permite guardar escolhas alternativas sem substituir a configuração normal. Para um perfil chamado fast, cria CODEX_HOME/fast.config.toml (normalmente ~/.codex/fast.config.toml) com:

    model = "gpt-6-luna"
    model_reasoning_effort = "low"

Ativa-o com:

    codex --profile fast

Usa perfis para combinações que repetes, como sessões de análise, testes locais ou revisão. Confirma sempre qual perfil está ativo em <code>/status</code>.

## AGENTS.md

AGENTS.md contém instruções de trabalho que o Codex deve ler ao abordar o repositório. Podes ter instruções na raiz do projeto e instruções mais específicas em subpastas. As instruções locais detalham o âmbito da pasta; não repitas regras globais em todos os ficheiros.

Um bom AGENTS.md responde a perguntas práticas:

- Como instalar dependências e executar a aplicação?
- Que comandos de lint, testes ou build são os mais relevantes?
- Que convenções de código e arquitetura têm de ser mantidas?
- Que diretórios são gerados e não devem ser editados manualmente?
- Que verificações devem acompanhar uma alteração?

Exemplo:

    # Instruções do repositório

    - Mantém os handlers HTTP finos e coloca a lógica de domínio em src/services.
    - Para alterar uma API, atualiza o teste em tests/api.
    - Executa npm run lint e o teste diretamente relacionado.
    - Não edites ficheiros em dist; são gerados por npm run build.

As instruções devem descrever regras verificáveis. Evita textos vagos como “escreve código perfeito” ou regras contraditórias sobre a mesma pasta.

O comando <code>/init</code> pode criar um esqueleto inicial. Revê cada linha gerada e corrige suposições antes de a guardar no repositório.

## Instruções, skills e memória

- **AGENTS.md** aplica orientação persistente a um repositório ou subdiretório.
- **Skill** guarda instruções especializadas e reutilizáveis num pacote com o respetivo ficheiro de instruções. Usa <code>/skills</code> ou invocação explícita quando disponível.
- **Memória** guarda preferências ou contexto entre sessões, se a funcionalidade estiver disponível e ativada.
- **Prompt** define o objetivo específico da tarefa atual.

Escolhe o âmbito mais pequeno que resolve o problema. Uma regra útil para um projeto pertence ao AGENTS.md do projeto. Um procedimento reutilizado em vários projetos encaixa melhor numa skill.

## Exercícios

1. Usa <code>/init</code> num projeto de teste e revê o ficheiro antes de o aceitar.
2. Acrescenta os comandos reais de teste e build ao AGENTS.md.
3. Cria um perfil de esforço baixo e seleciona-o com <code>--profile</code>.
4. Compara o modelo e esforço de <code>/status</code> com a configuração TOML.

## Fontes oficiais

- [Configuração do Codex](https://developers.openai.com/codex/config)
- [Referência de configuração](https://developers.openai.com/codex/config-reference)
- [Instruções AGENTS.md](https://developers.openai.com/codex/agent-configuration/agents-md)
- [Skills](https://developers.openai.com/codex/build-skills)
