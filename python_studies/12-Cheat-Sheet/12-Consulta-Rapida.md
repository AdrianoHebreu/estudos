# 12 Consulta rápida

## Tipos e conversões

| Tipo | Exemplo | Notas |
|---|---|---|
| `int` | `42` | Sem limite de tamanho |
| `float` | `8.5` | Binário: `0.1 + 0.2 != 0.3` |
| `str` | `"olá"` | Imutável, Unicode |
| `bool` | `True` | `0`, `""`, `[]`, `{}`, `None` são falsos |
| `None` | `None` | Ausência de valor; compara com `is` |
| `list` | `[1, 2]` | Mutável, ordenada |
| `tuple` | `(1, 2)` | Imutável |
| `dict` | `{"a": 1}` | Chave → valor, mantém ordem de inserção |
| `set` | `{1, 2}` | Sem repetidos, sem ordem |

Conversões: `int("5")`, `float("2.5")`, `str(10)`, `list("abc")`, `tuple([1, 2])`, `set([1, 1])`, `bool(x)`.

## Controlo de fluxo

    if x > 0:
        ...
    elif x == 0:
        ...
    else:
        ...

    for i, item in enumerate(itens, start=1):
        ...

    while condicao:
        ...

    match comando:
        case "sair":
            ...
        case _:
            ...

## Funções

    def somar(a, b=0, /, *args, escala=1, **kwargs):
        """Resumo numa linha."""
        return (a + b) * escala

    quadrado = lambda n: n * n

## Estruturas de dados

| Operação | Código |
|---|---|
| Fatia | `lst[1:4]`, `lst[::-1]` |
| Copiar | `lst.copy()`, `copy.deepcopy(x)` |
| Desempacotar | `a, *resto = lst` |
| Compreensão | `[x * 2 for x in lst if x > 0]` |
| Dicionário | `d.get("k", 0)`, `d.items()`, `d \| outro` |
| Ordenar | `sorted(lst, key=len, reverse=True)` |
| Contar | `Counter(lst).most_common(3)` |
| Agrupar | `defaultdict(list)` |

## Strings e ficheiros

    f"{valor:8.2f} {nome:<10} {n:>3} {pct:.1%}"
    "a,b".split(","), " x ".strip(), "-".join(lst)

    with open("dados.txt", encoding="utf-8") as f:
        for linha in f:
            ...

    from pathlib import Path
    Path("dados.txt").read_text(encoding="utf-8")

## Módulos e ambientes

    python -m venv .venv
    .venv\Scripts\Activate.ps1        # Windows PowerShell
    source .venv/bin/activate         # Linux/macOS
    pip install pacote
    pip freeze > requirements.txt
    pip install -r requirements.txt

## Classes

    from dataclasses import dataclass

    @dataclass(order=True)
    class Despesa:
        descricao: str
        valor: float

    class Filha(Base):
        def __init__(self, x):
            super().__init__(x)

## Erros e testes

    try:
        ...
    except (ValueError, KeyError) as erro:
        ...
    else:
        ...
    finally:
        ...

    raise MeuErro("mensagem") from erro

    pytest                 # corre todos os testes
    pytest -k nome -x      # filtra por nome, pára no primeiro falhanço

## Idiomático

| Padrão | Exemplo |
|---|---|
| Gerador | `(x * x for x in range(10))` |
| Context manager | `with open(...) as f:` |
| Decorador | `@functools.cache` |
| Type hints | `def f(xs: list[int]) -> int \| None:` |
| Desempacotar troca | `a, b = b, a` |

## Linha de comandos

| Comando | Para quê |
|---|---|
| `python ficheiro.py` | Executar um script |
| `python -m modulo` | Executar um módulo |
| `python -c "print(1)"` | Executar uma linha |
| `python -i ficheiro.py` | Executar e ficar no REPL |
| `python -m pip install x` | Garante o pip do mesmo Python |

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `ModuleNotFoundError` | Pacote não instalado ou ambiente virtual errado |
| `UnicodeDecodeError` | Faltou `encoding="utf-8"` ao abrir o ficheiro |
| `IndentationError` | Mistura de tabs e espaços |
| `TypeError: unhashable type` | Lista ou dicionário usado como chave |
| Lista "partilhada" entre variáveis | Atribuição não copia; usa `.copy()` |
| Default mutável a acumular | `def f(x=[])`; usa `None` e cria dentro |

## Exercícios

**PRATICAR:** usa esta página para resolver os exercícios do módulo 11 sem abrir a documentação.

## Fontes oficiais

- [Tutorial de Python](https://docs.python.org/3/tutorial/)
- [Referência da biblioteca padrão](https://docs.python.org/3/library/)
- [PEP 8](https://peps.python.org/pep-0008/)
