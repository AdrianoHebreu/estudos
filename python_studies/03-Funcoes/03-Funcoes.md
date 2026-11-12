# 03 Funções

## Definir e chamar

Uma função dá um nome a um bloco de código reutilizável. Define-se com `def`, seguido do nome, dos parâmetros e de `:`; o corpo fica indentado.

    def iva(valor, taxa=0.23):
        """Devolve o valor do IVA."""
        return round(valor * taxa, 2)

    print(iva(100))                 # 23.0
    print(iva(100, 0.06))           # 6.0
    print(iva(taxa=0.13, valor=50)) # 6.5

- **Parâmetros** são os nomes na definição (`valor`, `taxa`); **argumentos** são os valores passados na chamada.
- `return` termina a função e devolve um valor. Sem `return` (ou com `return` sozinho), a função devolve `None`.
- Para devolver vários valores, devolve um *tuplo* e desempacota-o na chamada:

    def min_max(valores):
        return min(valores), max(valores)

    lo, hi = min_max([3, 9, 1])
    print(lo, hi)                   # 1 9

## Parâmetros posicionais, nomeados e por omissão

| Forma | Exemplo | Quando usar |
|---|---|---|
| Posicional | `iva(100, 0.06)` | Poucos argumentos, ordem óbvia |
| Nomeado | `iva(valor=100, taxa=0.06)` | Clareza; ordem livre |
| Por omissão | `def iva(valor, taxa=0.23)` | Valor típico que raramente muda |

Na definição, os parâmetros por omissão vêm **depois** dos obrigatórios.

### A armadilha do valor por omissão mutável

O valor por omissão é calculado **uma só vez**, quando o `def` é executado, e não a cada chamada. Com um objeto mutável (como uma lista), as chamadas partilham-no:

    def adicionar(desp, lista=[]):
        lista.append(desp)
        return lista

    print(adicionar("café"))        # ['café']
    print(adicionar("pão"))         # ['café', 'pão']
    print(adicionar.__defaults__)   # (['café', 'pão'],)

A solução habitual usa `None` como sentinela e cria o objeto dentro da função:

    def adicionar(desp, lista=None):
        if lista is None:
            lista = []
        lista.append(desp)
        return lista

    print(adicionar("café"))        # ['café']
    print(adicionar("pão"))         # ['pão']

**ATENÇÃO:** nunca uses `[]`, `{}` ou `set()` como valor por omissão. Números, strings, `None` e tuplos são imutáveis e seguros.

## `*args` e `**kwargs`

`*args` recolhe os argumentos posicionais a mais num **tuplo**; `**kwargs` recolhe os nomeados a mais num **dicionário** (estrutura que estudas no módulo 04: pares chave-valor).

    def total(*valores):
        return sum(valores)

    def registar(descricao, **extras):
        print(descricao, extras)

    print(total(1.5, 2, 3))         # 6.5
    registar("Jantar", valor=25, categoria="Restauração")
    # Jantar {'valor': 25, 'categoria': 'Restauração'}

A ordem na definição é: obrigatórios, `*args`, parâmetros só nomeados, `**kwargs`.

    def f(a, b, *args, c=1, **kw):
        print(a, b, args, c, kw)

    f(1, 2, 3, 4, c=5, x=6)         # 1 2 (3, 4) 5 {'x': 6}

Os mesmos asteriscos, **na chamada**, desempacotam uma sequência ou um dicionário:

    nums = [1, 2, 3]
    print(total(*nums))             # 6
    registar(**{"descricao": "Gasolina", "valor": 50})
    # Gasolina {'valor': 50}

## Parâmetros só posicionais (`/`) e só nomeados (`*`)

- Tudo o que está **antes** de `/` só pode ser passado por posição.
- Tudo o que está **depois** de `*` (ou de `*args`) só pode ser passado por nome.

    def dividir(a, b, /):
        return a / b

    dividir(10, 4)                  # 2.5
    dividir(a=10, b=4)
    # TypeError: dividir() got some positional-only arguments passed as keyword arguments: 'a, b'

    def criar(descricao, valor, *, categoria="Outros"):
        return f"{descricao} {valor} {categoria}"

    criar("Café", 1.2, categoria="Restauração")   # funciona
    criar("Café", 1.2, "Restauração")
    # TypeError: criar() takes 2 positional arguments but 3 were given

**DICA:** usa `*` para tornar opções (flags, categorias) obrigatoriamente nomeadas: `criar("Café", 1.2, True)` seria ilegível. Usa `/` quando o nome do parâmetro não faz parte da API pública.

## Âmbito: a regra LEGB

Quando o Python encontra um nome, procura-o por esta ordem:

| Nível | Significado |
|---|---|
| **L**ocal | Dentro da função atual |
| **E**nclosing | Em funções que a envolvem |
| **G**lobal | No nível do módulo (ficheiro) |
| **B**uilt-in | Nomes pré-definidos (`len`, `print`, ...) |

    x = "global"

    def ler():
        return x            # só lê: encontra o global

    def sombra():
        x = "local"         # cria um x novo, local
        return x

    print(ler(), sombra(), x)       # global local global

Atribuir a um nome dentro de uma função torna-o **local em toda a função**. Por isso isto falha:

    def erro():
        print(x)            # x é local (por causa da linha seguinte)...
        x = 1               # ...mas ainda não tem valor
    # UnboundLocalError: cannot access local variable 'x' where it is not associated with a value

Para **reatribuir** um nome de outro âmbito, declara-o:

    contador = 0

    def incrementar():
        global contador     # reatribui o global
        contador += 1

    def externa():
        n = 0
        def interna():
            nonlocal n      # reatribui o n da função envolvente
            n += 1
        interna(); interna()
        return n            # 2

**ATENÇÃO:** `global` torna o código difícil de testar e de seguir. Prefere receber valores por parâmetro e devolver resultados. Também não dês a variáveis o nome de built-ins (`len = 5` esconde `len` até fazeres `del len`).

## Funções são objetos

Em Python, uma função é um valor como outro qualquer: pode ser atribuída, guardada, passada como argumento e devolvida.

    def aplicar(fn, v):
        return fn(v)

    print(aplicar(str.upper, "abc"), aplicar(len, "abcd"))   # ABC 4

Funções que recebem ou devolvem funções chamam-se de **ordem superior**; `sorted(..., key=...)` é um exemplo.


## `lambda`

`lambda` cria uma função anónima de **uma só expressão**, devolvida automaticamente:

    quadrado = lambda n: n * n
    print(quadrado(4))              # 16

    desp = [("Renda", 600), ("Café", 1.2), ("Livro", 15)]
    print(sorted(desp, key=lambda d: d[1]))
    # [('Café', 1.2), ('Livro', 15), ('Renda', 600)]
    print(list(filter(lambda d: d[1] > 10, desp)))
    # [('Renda', 600), ('Livro', 15)]

**DICA:** `lambda` serve para funções curtas usadas uma vez (sobretudo em `key=`). Se precisas de nome, de várias linhas ou de docstring, usa `def`. Atribuir um `lambda` a um nome (`quadrado = ...`) é desencorajado pelo PEP 8; fica aqui só como demonstração.

## Closures

Uma **closure** é uma função interna que "lembra" variáveis da função que a criou, mesmo depois de esta terminar.

    def com_iva(taxa):
        def calcular(valor):
            return round(valor * (1 + taxa), 2)
        return calcular

    iva23 = com_iva(0.23)
    iva6 = com_iva(0.06)
    print(iva23(100), iva6(100))    # 123.0 106.0

Cada chamada a `com_iva` cria uma closure independente, com a sua `taxa`. Com `nonlocal`, a closure pode até guardar estado que muda entre chamadas.

**ATENÇÃO:** a closure guarda a **variável**, não o valor no momento da criação. Num ciclo isto surpreende:

    fs = [lambda: i for i in range(3)]
    print([f() for f in fs])        # [2, 2, 2]

    fs = [lambda i=i: i for i in range(3)]   # fixa o valor com um default
    print([f() for f in fs])        # [0, 1, 2]

## Docstrings e anotações de tipo

A **docstring** é a primeira instrução do corpo, uma string entre `"""`. Fica em `__doc__` e é usada por `help()` e pelos editores (convenções no PEP 257).

As **anotações de tipo** descrevem os tipos esperados; são documentação para pessoas e ferramentas.

    def media(valores: list[float]) -> float:
        """Calcula a média aritmética.

        Recebe uma lista de números e devolve a média.
        """
        return sum(valores) / len(valores)

    print(media.__annotations__)
    # {'valores': list[float], 'return': <class 'float'>}

**ATENÇÃO:** o Python **não verifica** as anotações em execução. `media(["a", "b"])` falha com `TypeError: unsupported operand type(s) for +: 'int' and 'str'`, e não com um erro de anotação. Para verificar tipos usam-se ferramentas externas (como `mypy` ou o verificador do teu editor).

## Recursão

Uma função recursiva chama-se a si própria. Precisa de um **caso base** (pára) e de um **passo recursivo** que se aproxima dele.

    def fatorial(n):
        if n <= 1:                  # caso base
            return 1
        return n * fatorial(n - 1)  # passo recursivo

    print(fatorial(5))              # 120

O Python limita a profundidade (por omissão, 1000 chamadas) para proteger a memória:

    import sys
    print(sys.getrecursionlimit())  # 1000

    def inf(n):
        return inf(n + 1)           # sem caso base
    # RecursionError: maximum recursion depth exceeded

**NOTA:** para percorrer sequências, um ciclo `for` é mais simples e rápido; reserva a recursão para problemas naturalmente recursivos (árvores, pastas dentro de pastas).

## Exercícios

**PRATICAR:** exercícios 9 a 12 do módulo 11 (parâmetros e valores por omissão, `*args`/`**kwargs`, closures, recursão).

## Fontes oficiais

- [Tutorial: definir funções](https://docs.python.org/3/tutorial/controlflow.html#defining-functions)
- [Tutorial: mais sobre funções](https://docs.python.org/3/tutorial/controlflow.html#more-on-defining-functions)
- [Referência: definições de funções](https://docs.python.org/3/reference/compound_stmts.html#function-definitions)
- [Âmbitos e espaços de nomes](https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces)
- [FAQ: valores por omissão partilhados](https://docs.python.org/3/faq/programming.html#why-are-default-values-shared-between-objects)
- [PEP 570: parâmetros só posicionais](https://peps.python.org/pep-0570/)
- [PEP 3102: parâmetros só nomeados](https://peps.python.org/pep-3102/)
- [PEP 257: convenções de docstrings](https://peps.python.org/pep-0257/)
- [PEP 484 e módulo typing: anotações de tipo](https://docs.python.org/3/library/typing.html)
