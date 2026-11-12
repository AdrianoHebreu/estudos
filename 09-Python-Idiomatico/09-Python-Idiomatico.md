# 09 Python idiomático

Código «pythónico» não é código enigmático: é usar as ferramentas da linguagem para dizer o que queres de forma curta, legível e eficiente. Neste módulo usamos a lista `despesas` do gestor de despesas (`Despesa` com `descricao`, `valor`, `categoria`, `data`).

## Iteráveis e iteradores

Um **iterável** é qualquer objeto que podes percorrer com `for` (lista, `str`, `dict`, ficheiro). Um **iterador** é o objeto que, a cada `next()`, entrega o valor seguinte.

    it = iter([10, 20])
    print(next(it), next(it))   # 10 20
    next(it)                    # StopIteration

- `iter(x)` pede o iterador ao iterável (método `__iter__`); `next(it)` pede o valor seguinte (`__next__`).
- Quando acabam os valores, levanta-se `StopIteration`; o `for` apanha-a por ti e termina.
- Um iterador é iterável e devolve-se a si próprio (`iter(it) is it` dá `True`); uma lista não (`iter(lst) is lst` dá `False`).
- Um iterador **gasta-se**: depois de percorrido, não volta ao início.

Podes escrever um iterador à mão com uma classe que defina `__iter__` e `__next__`, mas raramente é preciso: os geradores fazem o mesmo em poucas linhas.

## Geradores

Uma função com `yield` devolve um **gerador**: um iterador que produz valores um de cada vez, retomando a execução onde parou.

    def ler_despesas(linhas):
        for linha in linhas:
            desc, valor = linha.split(";")
            yield desc, float(valor)

    g = ler_despesas(["Café;1.2", "Metro;40"])
    print(next(g))    # ('Café', 1.2)
    print(list(g))    # [('Metro', 40.0)]
    print(list(g))    # []  (já está esgotado)

Vantagem: nada é calculado até ser pedido, e a memória usada é constante. Isto permite sequências infinitas:

    def fib():
        a, b = 0, 1
        while True:
            yield a
            a, b = b, a + b

    from itertools import islice
    print(list(islice(fib(), 8)))   # [0, 1, 1, 2, 3, 5, 8, 13]

### Expressões geradoras

Têm a sintaxe de uma *list comprehension*, mas com parênteses, e não constroem a lista:

    total = sum(d.valor for d in despesas)      # 72.7
    sum(x * x for x in range(1_000_000))        # 333332833333500000, sem lista intermédia

**DICA:** quando uma expressão geradora é o único argumento de uma função, dispensa os parênteses extra (`sum(... for ...)`). Usa `[...]` só quando precisas mesmo da lista (para indexar, medir ou percorrer duas vezes).

**ATENÇÃO:** um gerador só se percorre uma vez. Se precisas dos dados duas vezes, converte com `list(...)` ou volta a chamar a função geradora.

## itertools essenciais

O módulo `itertools` junta peças para trabalhar com iteráveis sem criar listas intermédias.

| Função | Para quê | Exemplo |
|---|---|---|
| `islice(it, n)` | Fatiar qualquer iterável | `islice(fib(), 8)` |
| `count(inicio)` | Contador infinito | `islice(count(1), 3)` dá `1, 2, 3` |
| `chain(a, b)` | Juntar iteráveis em sequência | `chain([1, 2], [3])` dá `1, 2, 3` |
| `groupby(it, key)` | Agrupar **consecutivos** com a mesma chave | ver abaixo |
| `accumulate(it)` | Totais acumulados | `[1.2, 9.5, 22.0]` dá `1.2, 10.7, 32.7` |
| `pairwise(it)` | Pares vizinhos | `[1, 4, 9]` dá `(1, 4), (4, 9)` |
| `batched(it, n)` | Blocos de tamanho `n` (3.12+) | `range(5), 2` dá `(0, 1), (2, 3), (4,)` |
| `product(a, b)` | Produto cartesiano | `"ab", [1, 2]` dá 4 pares |
| `combinations(it, k)` | Combinações sem repetição | `"abc", 2` dá `ab, ac, bc` |
| `zip_longest(a, b, fillvalue=0)` | `zip` até ao mais comprido | `[1, 2], [9]` dá `(1, 9), (2, 0)` |

Totais por categoria com `groupby`:

    from itertools import groupby

    ordenadas = sorted(despesas, key=lambda d: d.categoria)
    for cat, grupo in groupby(ordenadas, key=lambda d: d.categoria):
        print(cat, round(sum(d.valor for d in grupo), 2))
    # comida 10.7
    # lazer 22.0
    # transporte 40.0

**ATENÇÃO:** `groupby` só agrupa elementos **seguidos**; por isso ordenas primeiro pela mesma chave. Sem `sorted`, a mesma categoria apareceria em vários grupos.

**NOTA:** `zip(a, b, strict=True)` levanta `ValueError` se os comprimentos diferirem, o que apanha erros silenciosos.

## Decoradores

Um **decorador** é uma função que recebe uma função e devolve outra, normalmente com comportamento extra à volta. A sintaxe `@nome` é açúcar para `f = nome(f)`.

    import functools, time

    def cronometrar(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ini = time.perf_counter()
            resultado = func(*args, **kwargs)
            print(f"{func.__name__}: {time.perf_counter() - ini:.6f} s")
            return resultado
        return wrapper

    @cronometrar
    def total_gasto(ds):
        """Soma os valores."""
        return sum(d.valor for d in ds)

    print(total_gasto(despesas))                       # 72.7
    print(total_gasto.__name__, total_gasto.__doc__)   # total_gasto Soma os valores.

**DICA:** usa sempre `@functools.wraps(func)` no `wrapper`. Sem ele, a função decorada passaria a chamar-se `wrapper` e perdia a docstring, o que estraga a depuração e a ajuda.

### Decoradores com argumentos

Precisas de uma camada extra: uma função que recebe os argumentos e devolve o decorador.

    def repetir(vezes):
        def decorador(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                for _ in range(vezes):
                    resultado = func(*args, **kwargs)
                return resultado
            return wrapper
        return decorador

    @repetir(2)
    def ola():
        print("olá")

`@repetir(2)` chama primeiro `repetir(2)`, que devolve `decorador`, e só depois aplica `decorador(ola)`.

**NOTA:** a biblioteca padrão traz decoradores prontos, como `functools.cache`, que memoriza os resultados de uma função (útil em funções puras e recursivas).

## Context managers

A instrução `with` garante que algo é **libertado** no fim, mesmo com erro: ficheiros, ligações, bloqueios. Qualquer objeto com `__enter__` e `__exit__` serve.

    class Cronometro:
        def __enter__(self):
            self.ini = time.perf_counter()
            return self
        def __exit__(self, tipo, valor, tb):
            self.dur = time.perf_counter() - self.ini
            return False    # False: não suprime a exceção

    with Cronometro() as c:
        sum(range(1000))
    print(c.dur)

O `__exit__` corre sempre. Se devolver `True`, a exceção é suprimida; com `False` (ou `None`) propaga-se.

### contextlib

Escrever a classe toda é pesado. Com `@contextmanager`, um gerador com **um** `yield` faz o mesmo:

    from contextlib import contextmanager, suppress

    @contextmanager
    def seccao(nome):
        print(f"entrar {nome}")
        try:
            yield nome
        finally:
            print(f"sair {nome}")

    with seccao("importar") as n:
        print("a trabalhar em", n)
    # entrar importar / a trabalhar em importar / sair importar

O código antes do `yield` é o `__enter__`; o valor do `yield` é o do `as`; o `finally` é o `__exit__`. Se o corpo do `with` falhar, o erro é relançado dentro do gerador, por isso o `try/finally` é essencial.

    with suppress(FileNotFoundError):    # ignora só este erro
        os.remove("nao_existe.txt")

## Type hints a sério

As anotações de tipo documentam e permitem que ferramentas verifiquem o código. **Em execução, o Python ignora-as**: `x: int = "texto"` corre sem erro.

    def encontrar(ds: list[Despesa], texto: str) -> Despesa | None:
        for d in ds:
            if texto in d.descricao:
                return d
        return None

- `list[int]`, `dict[str, float]`, `tuple[int, ...]`: usam-se os tipos nativos diretamente (sem `typing.List`).
- `X | None` indica «ou nada» (substitui `Optional[X]`); `int | str` indica uma de duas alternativas.
- `TypedDict` descreve a forma de um dicionário com chaves fixas:

        from typing import TypedDict

        class DespesaDict(TypedDict):
            descricao: str
            valor: float
            categoria: str

        d: DespesaDict = {"descricao": "Café", "valor": 1.2, "categoria": "comida"}

- `Protocol` define tipagem **estrutural** (*duck typing* verificável): serve qualquer objeto com a forma pedida, sem herança.

        from typing import Protocol

        class TemValor(Protocol):
            valor: float

        def somar(itens: list[TemValor]) -> float:
            return sum(i.valor for i in itens)

        print(somar(despesas))   # 72.7, porque Despesa tem o atributo valor

**NOTA:** quem verifica as anotações é uma ferramenta à parte, como o **mypy** (`pip install mypy`, depois `mypy ficheiro.py`). Não o executámos nesta aula; a ideia é corrê-lo no editor ou em CI antes de executar o código.

## EAFP vs LBYP

| Estilo | Lema | Exemplo |
|---|---|---|
| LBYP | *Look Before You Leap*: verificar antes | `if "valor" in dados: ...` |
| EAFP | *Easier to Ask Forgiveness than Permission*: tentar e tratar | `try: ... except KeyError: ...` |

    dados = {"valor": "12,5"}
    try:
        v = float(dados["valor"].replace(",", "."))
    except (KeyError, ValueError):
        v = 0.0
    print(v)   # 12.5

Python favorece EAFP: é mais curto, evita verificações duplicadas e não tem a condição de corrida de «verificar e depois usar» (um ficheiro pode desaparecer entre o `exists()` e o `open()`).

**ATENÇÃO:** apanha exceções **específicas** e mantém o `try` curto. Um `except:` vazio esconde bugs reais (módulo 08).

## PEP 8 e ferramentas

A **PEP 8** é o guia de estilo oficial. O essencial:

- 4 espaços por indentação; linhas até cerca de 79 a 88 caracteres.
- `snake_case` para funções e variáveis, `PascalCase` para classes, `MAIÚSCULAS` para constantes.
- Duas linhas em branco antes de funções e classes de topo; imports no início, um por linha.

Não precisas de decorar: usa ferramentas. O **black** reformata o código automaticamente; o **ruff** é um *linter* (e formatador) rápido que aponta imports não usados, variáveis inúteis e problemas de estilo.

    pip install ruff
    ruff check .          # procura problemas
    ruff format .         # formata

**NOTA:** estas ferramentas não foram executadas para esta aula; consulta a documentação para a configuração (`pyproject.toml`). Escolhe um formatador para o projeto e deixa o editor aplicá-lo ao guardar: acabam as discussões de estilo.

## Exercícios

**PRATICAR:** exercícios 33 a 36 do módulo 11 (geradores, itertools, decoradores e context managers com type hints).

## Fontes oficiais

- [Programação funcional: iteradores e geradores](https://docs.python.org/3/howto/functional.html)
- [itertools](https://docs.python.org/3/library/itertools.html)
- [functools](https://docs.python.org/3/library/functools.html)
- [contextlib](https://docs.python.org/3/library/contextlib.html)
- [typing](https://docs.python.org/3/library/typing.html)
- [PEP 8](https://peps.python.org/pep-0008/)
- [mypy](https://mypy.readthedocs.io/en/stable/)
- [ruff](https://docs.astral.sh/ruff/)
