# 00 Introdução e mapa do curso

## O que é o Python

Python é uma linguagem de programação **de alto nível**, **interpretada** e de **uso geral**. Foi criada por Guido van Rossum e lançada em 1991. É mantida por uma comunidade aberta, coordenada pela Python Software Foundation, e é gratuita.

- **Alto nível:** escreves o que queres fazer, sem te preocupares com memória ou com o processador.
- **Interpretada:** o programa é lido e executado por um programa chamado **interpretador**. Não há um passo de compilação separado que tenhas de gerir.
- **Uso geral:** serve para scripts de dois minutos e para sistemas grandes.
- **Legível:** a indentação faz parte da sintaxe, por isso o código tende a ter um aspeto uniforme.

Este curso usa **Python 3.13**. Tudo o que vês nas aulas foi executado nessa versão.

## Onde é usado

| Área | Exemplos de uso |
| --- | --- |
| Automação e scripts | Renomear ficheiros, processar folhas de cálculo, tarefas repetitivas |
| Web e APIs | Back-ends com Django, Flask ou FastAPI |
| Dados e ciência | Análise de dados, estatística, gráficos |
| Inteligência artificial | Aprendizagem automática e modelos de linguagem |
| Administração de sistemas | Ferramentas de linha de comandos, deploy, testes de infraestrutura |
| Ensino | Primeira linguagem em muitas escolas e universidades |

**NOTA:** o curso cobre a **linguagem** e a sua biblioteca padrão. As bibliotecas de dados, web ou IA assentam nestas bases, mas ficam fora do âmbito.

## Python vs outras linguagens

A comparação não é sobre qual é «melhor». Cada linguagem resolve bem problemas diferentes.

| Aspeto | Python | JavaScript | Java / C# | C |
| --- | --- | --- | --- | --- |
| Tipagem | Dinâmica | Dinâmica | Estática | Estática |
| Execução | Interpretada | Interpretada (JIT) | Compilada para bytecode | Compilada para código nativo |
| Blocos de código | Indentação | Chavetas `{ }` | Chavetas `{ }` | Chavetas `{ }` |
| Velocidade bruta | Mais lenta | Média | Alta | Muito alta |
| Rapidez de escrita | Muito alta | Alta | Média | Baixa |
| Uso típico | Scripts, dados, IA, back-end | Web (browser e servidor) | Aplicações empresariais | Sistemas, embebidos |

O mesmo programa mostra a diferença de verbosidade. Em Python, somar e mostrar o total de uma lista de despesas cabe em poucas linhas:

    valores = [12.5, 3.2, 40.0]
    print(sum(valores))

Saída:

    55.7

**ATENÇÃO:** Python é mais lento do que linguagens compiladas em cálculo intensivo. Para a esmagadora maioria das tarefas do dia a dia isso não se nota.

## Instalar o Python

Descarrega a versão 3.13 (ou mais recente) em `python.org/downloads`, ou usa o gestor de pacotes do teu sistema.

| Sistema | Como instalar | Comando para correr |
| --- | --- | --- |
| Windows | Instalador de `python.org`, ou `winget install Python.Python.3.13` | `python` (ou `py`) |
| macOS | Instalador de `python.org`, ou `brew install python@3.13` | `python3` |
| Linux (Debian/Ubuntu) | `sudo apt install python3 python3-venv python3-pip` | `python3` |
| Linux (Fedora) | `sudo dnf install python3` | `python3` |

**ATENÇÃO:** no instalador do Windows, marca a opção **Add python.exe to PATH** antes de carregares em *Install Now*. Sem ela, o terminal não encontra o comando `python`.

**NOTA:** em macOS e Linux, o comando `python` pode não existir ou apontar para outra versão. Usa `python3`. Nas aulas escrevemos `python`; troca por `python3` se for o teu caso.

## Verificar a instalação

Abre um terminal (PowerShell no Windows, Terminal no macOS e Linux) e escreve:

    python --version

Saída esperada (o último número pode variar):

    Python 3.13.0

Se aparecer «command not found» ou «não é reconhecido como um comando», o Python não está no `PATH`. Reinstala marcando a opção indicada acima, ou experimenta `py --version` (Windows) ou `python3 --version` (macOS e Linux).

## O REPL: Python em modo conversa

Se escreveres só `python`, entras no **REPL** (*Read, Eval, Print, Loop*). Ele lê uma linha, avalia-a, mostra o resultado e repete.

    >>> 2 + 3
    5
    >>> "café".upper()
    'CAFÉ'
    >>> total = 12.5 + 3.2
    >>> total
    15.7

- `>>>` é o prompt: indica que o Python espera um comando.
- Para sair: `exit()` ou `Ctrl+Z` e Enter (Windows), `Ctrl+D` (macOS e Linux).
- Também podes executar uma só instrução sem entrar no REPL: `python -c "print(2 + 3)"`.

**DICA:** usa o REPL como bloco de notas para experimentar. Se tens dúvida sobre o que uma linha faz, testa-a aí antes de a pores num ficheiro.

## Executar um ficheiro `.py`

Um programa é um ficheiro de texto com extensão `.py`. Cria um ficheiro `ola.py` com este conteúdo:

    descricao = "Café"
    valor = 1.5
    print("Despesa:", descricao, valor)

Corre-o no terminal, na pasta onde o guardaste:

    python ola.py

Saída:

    Despesa: Café 1.5

O Python executa o ficheiro de cima para baixo e termina. Para passar a outra pasta, usa o caminho: `python pasta/ola.py`.

**ATENÇÃO:** guarda os ficheiros em UTF-8 (o predefinido na maioria dos editores). Assim os acentos portugueses aparecem bem.

## Editor e VS Code

Podes escrever Python em qualquer editor de texto. Para estudar, recomendamos o **Visual Studio Code** (VS Code), gratuito e multiplataforma.

1. Instala o VS Code em `code.visualstudio.com`.
2. Abre a pasta do projeto com **File > Open Folder**.
3. Instala a extensão **Python** (da Microsoft) no separador *Extensions*.
4. Abre o ficheiro `.py` e carrega no botão de *Run Python File* (triângulo), ou usa o terminal integrado (`Ctrl+'`) e corre `python ficheiro.py`.
5. Se houver várias versões instaladas, escolhe a correta em **Python: Select Interpreter** (paleta de comandos, `Ctrl+Shift+P`).

**DICA:** habitua-te a correr os programas no terminal, mesmo que o editor tenha um botão. O terminal é igual em qualquer máquina e é onde vais trabalhar mais tarde.

## O projeto fio condutor: gestor de despesas

Ao longo do curso construímos, passo a passo, um **gestor de despesas pessoais**. O objeto central é a **Despesa**.

| Campo | Significado | Exemplo |
| --- | --- | --- |
| `descricao` | Texto livre a dizer em que gastaste | `"Almoço"` |
| `valor` | Quanto custou, em euros | `12.5` |
| `categoria` | Grupo da despesa | `"alimentação"` |
| `data` | Dia em que ocorreu | `2026-11-09` |

Cada módulo acrescenta uma peça: guardar valores (01), filtrar e somar (02), organizar em funções (03), listas e dicionários (04), ler e escrever ficheiros (05), separar em módulos (06), transformar `Despesa` numa classe (07), tratar erros e testar (08), escrever código idiomático (09) e usar a biblioteca padrão (10).

**NOTA:** não precisas de perceber já o código dos módulos seguintes. Por agora, basta conheceres o problema que vamos resolver.

## Percurso do curso

| Módulo | Título | O que aprendes |
| --- | --- | --- |
| 00 | Introdução | O que é o Python, instalação, REPL, primeiro programa |
| 01 | Fundamentos | Variáveis, tipos, operadores, entrada e saída |
| 02 | Controlo de fluxo | Condições, ciclos |
| 03 | Funções | Definir e reutilizar código, argumentos |
| 04 | Estruturas de dados | Listas, tuplos, dicionários, conjuntos |
| 05 | Strings e ficheiros | Texto, formatação, ler e escrever ficheiros |
| 06 | Módulos e ambientes | Importar, pacotes, ambientes virtuais, `pip` |
| 07 | Orientação a objetos | Classes, objetos, herança |
| 08 | Erros e testes | Exceções, depuração, testes automáticos |
| 09 | Python idiomático | Boas práticas, compreensões, estilo |
| 10 | Biblioteca padrão e ecossistema | Módulos úteis incluídos, bibliotecas externas |
| 11 | Exercícios práticos | Coleção de exercícios por módulo e projeto final |
| 12 | Cheat sheet | Resumo para consulta rápida |
| 13 | Gabarito | Soluções dos exercícios |
| 14 | Projetos por área | Automação, administração de sistemas, web e dados na prática |

## Glossário

| Termo | Significado |
| --- | --- |
| Interpretador | Programa que lê e executa o código Python |
| REPL | Modo interativo: lê, avalia, mostra e repete |
| Script | Ficheiro `.py` pensado para ser executado diretamente |
| Módulo | Ficheiro `.py` cujo código pode ser reutilizado noutro |
| Biblioteca padrão | Conjunto de módulos que vêm com o Python |
| `PATH` | Lista de pastas onde o sistema procura os comandos |
| Terminal | Janela onde escreves comandos de texto |
| Indentação | Espaços no início da linha que definem os blocos de código |
| Sintaxe | Regras de escrita da linguagem |
| PEP | *Python Enhancement Proposal*: documento que propõe uma mudança ou convenção |

## Como estudar

- **Escreve o código à mão.** Copiar e colar dá a sensação de perceber, sem a criar.
- **Executa tudo.** Altera os exemplos, parte-os de propósito e lê as mensagens de erro: dizem quase sempre o que está mal.
- **Pouco, mas todos os dias.** Trinta minutos diários valem mais do que uma maratona ao fim de semana.
- **Segue a ordem.** Cada módulo assume o anterior.
- **Constrói o projeto em paralelo.** Vai guardando o teu gestor de despesas numa pasta própria, e vê-o crescer.
- **Consulta a documentação oficial.** Habitua-te desde cedo, é a fonte mais fiável.

**PRATICAR:** instala o Python, confirma com `python --version`, abre o REPL, calcula `12.5 + 3.2`, e corre o teu `ola.py`. Quando tudo funcionar, estás pronto para o módulo 01.

## Fontes oficiais

- [The Python Tutorial](https://docs.python.org/3/tutorial/)
- [Using the Python Interpreter](https://docs.python.org/3/tutorial/interpreter.html)
- [Using Python on Windows](https://docs.python.org/3/using/windows.html)
- [Using Python on macOS](https://docs.python.org/3/using/mac.html)
- [Using Python on Unix platforms](https://docs.python.org/3/using/unix.html)
- [Download Python](https://www.python.org/downloads/)
- [Glossário do Python](https://docs.python.org/3/glossary.html)
- [PEP 20, The Zen of Python](https://peps.python.org/pep-0020/)
- [Getting Started with Python in VS Code](https://code.visualstudio.com/docs/python/python-tutorial)
