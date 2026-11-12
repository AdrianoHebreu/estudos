# 04 Estruturas de dados

## Quatro contentores, quatro usos

O Python traz quatro estruturas nativas para guardar coleções de valores. Escolher bem a estrutura é metade do trabalho.

| Tipo | Literal | Ordenado | Mutável | Repetidos | Usa-se para |
|---|---|---|---|---|---|
| `list` | `[1, 2, 3]` | sim | sim | sim | sequência que cresce e muda |
| `tuple` | `(1, 2, 3)` | sim | não | sim | registo fixo, devolver vários valores |
| `dict` | `{"a": 1}` | sim (ordem de inserção) | sim | chaves únicas | procurar valor por chave |
| `set` | `{1, 2, 3}` | não | sim | não | unicidade e operações de conjuntos |

No gestor de despesas, uma despesa é um `dict` (campos com nome), o conjunto das despesas é uma `list`, as categorias distintas são um `set`.

## Listas

    nomes = ["renda", "café", "luz"]
    nomes.append("gás")
    print(nomes)               # ['renda', 'café', 'luz', 'gás']
    print(nomes[0], nomes[-1]) # renda gás

Os índices começam em 0 e os negativos contam do fim. Os métodos principais:

| Método | Efeito |
|---|---|
| `append(x)` / `extend(it)` | junta um elemento / vários elementos ao fim |
| `insert(i, x)` | insere na posição `i` |
| `pop()` / `pop(i)` | remove e devolve o último / o da posição `i` |
| `remove(x)` | remove a primeira ocorrência de `x` |
| `sort()` / `reverse()` | ordena / inverte **no próprio objeto** |
| `count(x)` / `index(x)` | quantas vezes aparece / posição da primeira |

    n = [10, 20, 30, 40, 50, 60]
    n.extend([70]); n.insert(0, 5)
    print(n)                   # [5, 10, 20, 30, 40, 50, 60, 70]
    print(n.pop(), n.pop(0))   # 70 5

**ATENÇÃO:** `sort()`, `append()` e afins devolvem `None` e alteram a lista. Escrever `n = n.sort()` apaga a lista.

## Tuplos

Um tuplo é uma sequência **imutável**: depois de criado, não se altera.

    d = ("café", 1.2, "alimentação")
    print(d[1], len(d))        # 1.2 3
    d[1] = 2                   # TypeError: 'tuple' object does not support item assignment

Um tuplo de um só elemento precisa de vírgula: `(5,)` é um tuplo, `(5)` é só o inteiro 5 entre parênteses.

**NOTA:** os tuplos podem ser chaves de dicionário e elementos de conjuntos (as listas não), porque são imutáveis e, por isso, *hashable*.

## Dicionários

Um dicionário associa **chaves** a **valores**. A procura por chave é muito rápida.

    desp = {"descricao": "café", "valor": 1.2, "categoria": "alimentação"}
    print(desp["valor"])                  # 1.2
    print(desp.get("data"))               # None
    print(desp.get("data", "sem data"))   # sem data
    desp["data"] = "2026-11-09"           # cria ou substitui

- `d[chave]` levanta `KeyError` se a chave não existir; `d.get(chave, omissao)` não.
- `keys()`, `values()` e `items()` dão vistas sobre as chaves, valores e pares.
- `update(outro)` junta pares; `pop(chave)` remove e devolve; `setdefault(chave, v)` devolve o valor e, se a chave faltar, cria-a com `v`.

    for chave, valor in desp.items():
        print(chave, valor)

As chaves têm de ser *hashable* (strings, números, tuplos de imutáveis). Desde o Python 3.7 o dicionário mantém a ordem de inserção.

## Conjuntos

Um `set` guarda valores **únicos** e responde depressa a «este valor existe?».

    cats = {"alimentação", "casa", "alimentação"}
    print(len(cats))                      # 2
    print("casa" in cats)                 # True
    print({1, 2, 3} | {3, 4})             # {1, 2, 3, 4}  união
    print({1, 2, 3} & {3, 4})             # {3}           interseção
    print({1, 2, 3} - {3, 4})             # {1, 2}        diferença

**ATENÇÃO:** `{}` cria um **dicionário** vazio. Para um conjunto vazio usa `set()`.

## Slicing

A fatia `seq[inicio:fim:passo]` funciona em listas, tuplos e strings. O `fim` **não** é incluído, e qualquer parte pode ser omitida.

    n = [10, 20, 30, 40, 50, 60]
    print(n[1:4])      # [20, 30, 40]
    print(n[:2])       # [10, 20]
    print(n[-2:])      # [50, 60]
    print(n[::2])      # [10, 30, 50]
    print(n[::-1])     # [60, 50, 40, 30, 20, 10]
    print(n[1:99])     # [20, 30, 40, 50, 60]

**DICA:** fora dos limites, uma fatia nunca dá erro (devolve o que existir); um índice simples fora dos limites dá `IndexError`. Uma fatia cria sempre um **novo** objeto.

## Mutabilidade e cópias

Uma variável guarda uma **referência** para um objeto. Atribuir não copia:

    a = [1, 2, 3]
    b = a               # b aponta para a MESMA lista
    b.append(4)
    print(a, a is b)    # [1, 2, 3, 4] True

Para copiar usa `a.copy()`, `list(a)` ou `a[:]`. Mas isso é uma cópia **superficial** (*shallow*): copia o contentor, não os objetos lá dentro.

    c = a.copy()
    c.append(5)
    print(a, c)         # [1, 2, 3, 4] [1, 2, 3, 4, 5]

    x = [[1, 2], [3, 4]]
    y = x.copy()
    y[0].append(99)
    print(x)            # [[1, 2, 99], [3, 4]]  (a lista interna é partilhada!)

    import copy
    z = copy.deepcopy(x)
    z[0].append(7)
    print(x, z)         # [[1, 2, 99], [3, 4]] [[1, 2, 99, 7], [3, 4]]

`copy.deepcopy` copia tudo, recursivamente. Um tuplo é imutável, mas pode conter objetos mutáveis:

    t = ([1, 2], 3)
    t[0].append(9)
    print(t)            # ([1, 2, 9], 3)

**ATENÇÃO:** os tipos imutáveis (`int`, `float`, `str`, `tuple`, `frozenset`) nunca mudam no próprio objeto; os mutáveis (`list`, `dict`, `set`) mudam. Quando uma estrutura aparece «alterada sem razão», procura uma referência partilhada.

## Desempacotamento

Podes distribuir os elementos de uma sequência por variáveis numa só linha.

    desc, valor, cat = ("café", 1.2, "alimentação")
    primeiro, *meio, ultimo = [1, 2, 3, 4, 5]
    print(primeiro, meio, ultimo)    # 1 [2, 3, 4] 5

    a1, b1 = 1, 2
    a1, b1 = b1, a1                  # troca sem variável auxiliar
    print(a1, b1)                    # 2 1

Os mesmos mecanismos aparecem nos ciclos, com `enumerate` e `zip`:

    for i, nome in enumerate(nomes, start=1):
        print(i, nome)               # 1 renda, 2 café, ...
    for nome, v in zip(["a", "b"], [1, 2]):
        print(nome, v)               # a 1, b 2

O `*` também junta estruturas: `[*nomes, "água"]` cria uma lista nova, e `{**um, **dois}` (ou `um | dois`) junta dois dicionários, vencendo o último em caso de chaves repetidas.

## Comprehensions

Uma comprehension constrói uma lista, um dicionário ou um conjunto a partir de outra coleção, com filtro opcional.

    valores = [3.5, 12.0, 80.0, 1.2]
    print([v * 2 for v in valores if v > 3])      # [7.0, 24.0, 160.0]

    dados = [("café", 1.2, "alimentação"), ("renda", 600.0, "casa"),
             ("pão", 0.8, "alimentação"), ("luz", 45.0, "casa")]
    print({d[0]: d[1] for d in dados})
    # {'café': 1.2, 'renda': 600.0, 'pão': 0.8, 'luz': 45.0}
    print({d[2] for d in dados})                   # {'alimentação', 'casa'} (ordem não garantida)

| Forma | Resultado |
|---|---|
| `[expr for x in it if cond]` | lista |
| `{k: v for x in it}` | dicionário |
| `{expr for x in it}` | conjunto |

**DICA:** se a comprehension já precisa de mais de uma condição e de ciclos aninhados, um `for` normal é mais legível.

## Ordenar com `sorted` e `key`

`sorted(iteravel)` devolve uma **lista nova** ordenada e não altera o original (ao contrário de `list.sort()`). O argumento `key` diz por que valor comparar cada elemento; `reverse=True` inverte.

    print(sorted(dados, key=lambda d: d[1])[0])
    # ('pão', 0.8, 'alimentação')
    print(sorted(dados, key=lambda d: d[1], reverse=True)[:2])
    # [('renda', 600.0, 'casa'), ('luz', 45.0, 'casa')]
    print(sorted(dados, key=lambda d: (d[2], -d[1])))
    # categoria A-Z e, dentro dela, valor decrescente
    print(max(dados, key=lambda d: d[1]))          # ('renda', 600.0, 'casa')
    print(sorted(["b", "A", "c"], key=str.lower))  # ['A', 'b', 'c']

`lambda d: d[1]` é uma função minúscula e anónima (as funções completas estão no módulo 03). Devolver um tuplo na `key` ordena por vários critérios. A ordenação é **estável**: elementos iguais mantêm a ordem original.

## O módulo `collections`

    from collections import Counter, defaultdict, deque

- **`Counter`** conta ocorrências; aceita qualquer iterável.
- **`defaultdict`** cria um valor por omissão quando a chave falta, o que dispensa o `if chave in d`.
- **`deque`** é uma fila com extremidades rápidas; com `maxlen` guarda só os últimos N.

    cont = Counter(d[2] for d in dados)
    print(cont.most_common(1))       # [('alimentação', 2)]
    print(cont["inexistente"])       # 0

    tot = defaultdict(float)
    for desc, v, cat in dados:
        tot[cat] += v
    print(dict(tot))                 # {'alimentação': 2.0, 'casa': 645.0}

    ultimas = deque(maxlen=3)
    for desc, v, cat in dados:
        ultimas.append(desc)
    print(ultimas)                   # deque(['renda', 'pão', 'luz'], maxlen=3)

**NOTA:** ler uma chave em falta num `defaultdict` **cria-a** (`tot["nova"]` devolve `0.0` e passa a existir). Usa `in` para testar sem criar.

## Complexidade básica

A tabela mostra o custo típico (n = número de elementos), segundo a documentação da comunidade.

| Operação | `list` | `dict` / `set` | `deque` |
|---|---|---|---|
| Aceder por índice / chave | O(1) | O(1) | O(n) no meio |
| Pertença (`x in ...`) | O(n) | O(1) | O(n) |
| Juntar ao fim | O(1) | O(1) | O(1) |
| Inserir / remover no início | O(n) | n/a | O(1) |
| Ordenar | O(n log n) | n/a | n/a |

**DICA:** se fazes muitas vezes `x in lista` sobre uma lista grande, converte-a para `set` uma vez: a pertença passa de O(n) para O(1).

## Exercícios

**PRATICAR:** exercícios 13 a 16 do módulo 11 (listas e slicing, totais por categoria com dict e Counter, comprehensions e `sorted`, cópias e `deque`).

## Fontes oficiais

- [Estruturas de dados (tutorial)](https://docs.python.org/3/tutorial/datastructures.html)
- [Tipos embutidos: sequências, dict e set](https://docs.python.org/3/library/stdtypes.html)
- [Módulo collections](https://docs.python.org/3/library/collections.html)
- [Módulo copy](https://docs.python.org/3/library/copy.html)
- [Guia de ordenação](https://docs.python.org/3/howto/sorting.html)
- [Complexidade temporal (wiki)](https://wiki.python.org/moin/TimeComplexity)
