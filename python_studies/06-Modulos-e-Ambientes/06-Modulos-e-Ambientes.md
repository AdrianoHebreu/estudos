# 06 Módulos e ambientes

## Módulos: import e from-import

Um **módulo** é simplesmente um ficheiro `.py`. Quando o projeto cresce, separas o código em módulos e importas o que precisas.

    import math
    from math import sqrt
    from math import pi as PI
    import datetime as dt

    print(math.sqrt(16), sqrt(25), PI)
    print(dt.date(2026, 11, 9))

Saída:

    4.0 5.0 3.141592653589793
    2026-11-09

| Forma | Nome que passas a ter | Quando usar |
|---|---|---|
| `import modulo` | `modulo.coisa` | Por omissão: fica claro de onde vem cada nome |
| `import modulo as m` | `m.coisa` | Nomes longos ou convenções (`import datetime as dt`) |
| `from modulo import coisa` | `coisa` | Poucos nomes, usados muitas vezes |
| `from modulo import *` | tudo o que for público | Evita; polui o espaço de nomes e esconde a origem |

**DICA:** ordena os imports em três blocos separados por uma linha em branco: biblioteca padrão, bibliotecas de terceiros, o teu próprio código.

Um módulo é executado **uma só vez**, na primeira importação; as seguintes reutilizam o resultado guardado em `sys.modules`.

## `if __name__ == "__main__"`

Cada módulo tem uma variável `__name__`. Se o ficheiro for executado diretamente, vale `"__main__"`; se for importado, vale o nome do módulo.

    # solo.py
    print("__name__ =", __name__)
    if __name__ == "__main__":
        print("executado diretamente")

Executar `python solo.py` mostra:

    __name__ = __main__
    executado diretamente

Executar `python -c "import solo"` mostra apenas:

    __name__ = solo

Assim o mesmo ficheiro serve como biblioteca (quando importado) e como programa (quando executado). O padrão habitual é pôr a lógica numa função `main()`:

    # relatorio.py
    def main():
        print("A gerar relatório...")

    if __name__ == "__main__":
        main()

**NOTA:** um módulo importado não deve ter efeitos secundários (imprimir, ler ficheiros, ligar-se a bases de dados) fora de funções e deste bloco.

## Pacotes e `__init__.py`

Um **pacote** é uma pasta com módulos. Estrutura do gestor de despesas:

    projeto/
        app.py
        gestor/
            __init__.py
            modelos.py
            relatorio.py

- `__init__.py` marca a pasta como pacote regular e corre quando o pacote é importado pela primeira vez.
- Serve para definir a **interface pública** do pacote:

        # gestor/__init__.py
        from .modelos import Despesa

        __all__ = ["Despesa"]

Com isto, `app.py` pode escrever `from gestor import Despesa` em vez de `from gestor.modelos import Despesa`. Executei um pacote deste género e o `print` colocado no `__init__.py` apareceu uma única vez, mesmo com vários imports de submódulos.

**NOTA:** o Python também aceita pastas sem `__init__.py` (*namespace packages*). Para o teu código, cria sempre o `__init__.py`: é mais explícito e evita surpresas.

## Onde o Python procura módulos: `sys.path`

Ao ver `import x`, o Python procura por esta ordem: módulos já carregados (`sys.modules`), módulos embutidos e, por fim, as pastas listadas em `sys.path`.

    import sys
    for pasta in sys.path:
        print(pasta)

O que lá aparece depende da instalação, mas há sempre:

- a pasta do script que está a ser executado (ou a pasta atual, com `python -c` ou no modo interativo, onde aparece como `''`);
- a biblioteca padrão;
- a pasta `site-packages`, onde o `pip` instala pacotes de terceiros.

**ATENÇÃO:** como a pasta do script é a primeira, um ficheiro teu chamado `random.py` ou `json.py` **esconde** o módulo da biblioteca padrão com o mesmo nome. Evita nomes de módulos da biblioteca padrão.

Podes acrescentar pastas com `sys.path.append(...)` ou com a variável de ambiente `PYTHONPATH`, mas é um remendo. O caminho correto é instalar o teu projeto no ambiente (ver `pyproject.toml` mais abaixo).

## Imports absolutos e relativos

Dentro de um pacote tens duas formas de importar um irmão:

    # gestor/relatorio.py
    from gestor.modelos import Despesa   # absoluto
    from .modelos import Despesa         # relativo ao pacote atual
    from ..outro import coisa            # relativo, um nível acima

| Tipo | Vantagem | Limitação |
|---|---|---|
| Absoluto | Lê-se sem contexto; recomendado pelo guia de estilo | Quebra se renomeares o pacote de topo |
| Relativo | Sobrevive a renomeações; curto | Só funciona dentro de um pacote |

Os imports relativos só funcionam quando o módulo é carregado **como parte do pacote**. Se executares o ficheiro como script, falha:

    python gestor/relatorio.py

    ImportError: attempted relative import with no known parent package

A solução é executar como módulo, a partir da pasta que contém o pacote:

    python -m gestor.relatorio

**DICA:** `python -m pacote.modulo` coloca a pasta atual em `sys.path` e dá ao módulo o seu nome completo. Também podes criar um `gestor/__main__.py` e correr `python -m gestor`.

## Ambientes virtuais (`venv`)

Sem isolamento, todos os projetos partilham o mesmo `site-packages`, e duas aplicações podem precisar de versões diferentes da mesma biblioteca. Um **ambiente virtual** é uma pasta com o seu próprio interpretador e o seu próprio `site-packages`.

Criar (igual em todos os sistemas), dentro da pasta do projeto:

    python -m venv .venv

Isto cria `.venv/` com `pyvenv.cfg`, `Lib/site-packages` e, no Windows, uma pasta `Scripts/` com `python.exe`, `pip.exe` e os scripts de ativação (`Activate.ps1`, `activate.bat`). No Linux e macOS a pasta chama-se `bin/`.

| Sistema / terminal | Ativar | Desativar |
|---|---|---|
| Windows PowerShell | `.venv\Scripts\Activate.ps1` | `deactivate` |
| Windows cmd | `.venv\Scripts\activate.bat` | `deactivate` |
| Linux / macOS (bash, zsh) | `source .venv/bin/activate` | `deactivate` |

Testei a ativação no PowerShell: depois de ativar, `python` e `pip` passaram a apontar para dentro de `.venv`, e depois de `deactivate` voltaram ao Python global. Para confirmar em que ambiente estás:

    import sys
    print(sys.prefix)                       # pasta do ambiente ativo
    print(sys.prefix != sys.base_prefix)    # True dentro de um venv

**ATENÇÃO:** no Windows, o PowerShell pode recusar correr `Activate.ps1` por causa da política de execução de scripts. No meu teste não houve bloqueio, por isso não reproduzi o erro. Se te acontecer, a documentação do Python refere `Set-ExecutionPolicy` com âmbito `CurrentUser`; lê a documentação antes de alterares políticas de segurança. Alternativa sem ativar nada: chamar o interpretador do ambiente diretamente, `.venv\Scripts\python.exe -m pip ...`.

**DICA:** não precisas de ativar o ambiente para o usar: `.venv/bin/python script.py` (Linux/macOS) ou `.venv\Scripts\python.exe script.py` (Windows) já corre com as bibliotecas desse ambiente.

Não versiones a pasta `.venv` (põe-na no `.gitignore`): ela não é portátil. O que se partilha é a lista de dependências.

## pip e `requirements.txt`

O `pip` instala pacotes do PyPI. Usa sempre `python -m pip`, que garante que o `pip` pertence ao interpretador que queres:

    python -m pip install six==1.16.0
    python -m pip list
    python -m pip show six
    python -m pip uninstall six

Num venv acabado de criar, `pip list` mostra apenas o próprio `pip` (no meu teste, `pip 24.2`). Depois de instalar `six==1.16.0`, `pip freeze` devolveu:

    six==1.16.0

Guardar e reproduzir o ambiente:

    python -m pip freeze > requirements.txt
    python -m pip install -r requirements.txt

Desinstalei o pacote e reinstalei a partir do `requirements.txt`: o ambiente ficou igual.

| Especificador | Significado |
|---|---|
| `pacote==1.2.3` | Exatamente esta versão |
| `pacote>=1.2` | Esta versão ou superior |
| `pacote~=1.2` | Compatível: `>=1.2` e `<2.0` |
| `pacote` | Qualquer versão |

**NOTA:** `pip freeze` lista **tudo** o que está instalado, incluindo dependências indiretas. Para projetos pequenos serve; para projetos maiores, declara só as dependências diretas no `pyproject.toml`.

## `pyproject.toml` (introdução)

O `pyproject.toml` é o ficheiro de configuração standard de um projeto Python. Está em formato TOML, que o Python lê com o módulo `tomllib` (a partir da 3.11). Exemplo mínimo para o gestor de despesas:

    [project]
    name = "gestor-despesas"
    version = "0.1.0"
    description = "Gestor de despesas pessoais"
    requires-python = ">=3.13"
    dependencies = ["six>=1.16"]

    [project.scripts]
    gestor = "gestor.relatorio:main"

    [build-system]
    requires = ["setuptools>=68"]
    build-backend = "setuptools.build_meta"

- `[project]` descreve o projeto e as suas dependências.
- `[project.scripts]` cria um comando de terminal que chama uma função.
- `[build-system]` diz ao `pip` que ferramenta usar para construir o pacote.

Com a pasta `gestor/` ao lado do `pyproject.toml`, num venv novo:

    python -m pip install -e .

O `-e` (*editable*) instala o projeto ligado à pasta de código: alterações nos ficheiros refletem-se de imediato. No meu teste instalou `gestor-despesas 0.1.0` e `six`, e o comando `gestor` ficou disponível em `.venv\Scripts\` e imprimiu o resultado do `main()`. Fora da pasta do projeto, `import gestor` também funcionou, sem `sys.path` manual.

**NOTA:** o `setuptools` é só um dos *backends* possíveis; o `pyproject.toml` também aceita outros. Aqui ele é descarregado da internet na instalação.

## uv: uma alternativa

O `uv` é uma ferramenta da Astral que se propõe unificar a gestão de ambientes e dependências, e que trabalha com o `pyproject.toml`. A documentação oficial está em `docs.astral.sh/uv`.

**NOTA:** o `uv` não estava instalado na máquina onde testei este módulo, por isso não executei nenhum comando dele e não afirmo aqui o que faz em pormenor, nem velocidades. Consulta a documentação oficial antes de o usares. Tudo o que aprendeste (venv, pip, `pyproject.toml`) continua válido e é a base que o `uv` assume.

## Resumo

| Preciso de... | Uso |
|---|---|
| Reutilizar código entre ficheiros | `import` / `from ... import` |
| Ficheiro que é biblioteca e programa | `if __name__ == "__main__":` |
| Organizar vários módulos | Pacote com `__init__.py` |
| Correr um módulo de um pacote | `python -m pacote.modulo` |
| Isolar dependências | `python -m venv .venv` |
| Instalar e reproduzir | `python -m pip install -r requirements.txt` |
| Descrever o projeto | `pyproject.toml` |

## Exercícios

**PRATICAR:** exercícios 21 a 24 do módulo 11 (módulos e `__main__`, pacotes e imports relativos, ambientes virtuais com pip, e leitura de `pyproject.toml`).

## Fontes oficiais

- [Tutorial: módulos](https://docs.python.org/3/tutorial/modules.html)
- [`__main__`: ambiente de execução do código de topo](https://docs.python.org/3/library/__main__.html)
- [Sistema de import](https://docs.python.org/3/reference/import.html)
- [`sys.path`](https://docs.python.org/3/library/sys.html#sys.path)
- [`venv`: ambientes virtuais](https://docs.python.org/3/library/venv.html)
- [Instalar pacotes com pip e ambientes virtuais](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)
- [Formato do ficheiro de requisitos](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
- [Escrever o `pyproject.toml`](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/)
- [uv](https://docs.astral.sh/uv/)
