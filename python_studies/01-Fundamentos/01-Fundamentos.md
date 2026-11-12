# 01 Fundamentos

## Variáveis e nomes

Em Python, uma variável é um **nome** que aponta para um valor. A atribuição faz-se com `=` e não há declaração de tipo.

    descricao = "Café"
    valor = 1.20
    quantidade = 3
    pago = True
    nota = None

Regras para nomes:

- Letras, dígitos e `_`; não podem começar por dígito nem ser palavras reservadas (`if`, `for`, `class`, ...).
- Maiúsculas contam: `valor` e `Valor` são nomes diferentes.
- Convenção (PEP 8): `snake_case` para variáveis, `MAIUSCULAS` para constantes (`TAXA_IVA = 0.23`). Python não impede que reatribuas uma constante: é só convenção.

**DICA:** escolhe nomes que digam o que o valor representa (`valor_total`, não `vt`). No gestor de despesas, o nome é a melhor documentação.

Podes atribuir vários nomes de uma vez e trocar valores sem variável auxiliar:

    a, b = 1, 2
    a, b = b, a
    print(a, b)    # 2 1

## Tipos básicos

| Tipo | Exemplo | Para quê |
|---|---|---|
| `int` | `42`, `1_000_000` | Números inteiros, sem limite de tamanho |
| `float` | `1.20`, `1e3` | Números com parte decimal |
| `str` | `"Café"`, `'ola'` | Texto |
| `bool` | `True`, `False` | Verdadeiro ou falso |
| `NoneType` | `None` | Ausência de valor |

Usa `type()` para perguntar o tipo de um valor:

    print(type(descricao), type(valor), type(quantidade), type(pago), type(nota))
    # <class 'str'> <class 'float'> <class 'int'> <class 'bool'> <class 'NoneType'>

`None` representa "ainda não há valor" (por exemplo, uma despesa sem nota). Compara-o com `is None`, não com `==`.

    print(nota is None)    # True

**NOTA:** `bool` é um subtipo de `int`: `True + True` dá `2`. Raramente útil, mas explica algumas surpresas.

## Operadores

| Operador | Significado | Exemplo | Resultado |
|---|---|---|---|
| `+` `-` `*` | soma, subtração, produto | `3 * 4` | `12` |
| `/` | divisão (sempre `float`) | `7 / 2` | `3.5` |
| `//` | divisão inteira (arredonda para baixo) | `7 // 2` | `3` |
| `%` | resto | `7 % 2` | `1` |
| `**` | potência | `2 ** 10` | `1024` |
| `==` `!=` | igual, diferente | `3 != 4` | `True` |
| `<` `<=` `>` `>=` | comparação | `5 >= 5` | `True` |
| `and` `or` `not` | lógicos | `True and False` | `False` |
| `is` `is not` | mesma identidade | `nota is None` | `True` |

Os operadores de atribuição combinam operação e atribuição:

    total = 5
    total += 2        # total = total + 2
    print(total)      # 7

As comparações podem ser encadeadas: `1 < 2 < 3` é `True`. O `//` arredonda **para baixo**, também com negativos:

    print(-7 // 2)    # -4

`divmod(17, 5)` devolve quociente e resto de uma vez: `(3, 2)`.

**ATENÇÃO:** os `float` são binários e não representam exatamente certas decimais:

    print(0.1 + 0.2)             # 0.30000000000000004
    print(0.1 + 0.2 == 0.3)      # False
    print(round(0.1 + 0.2, 2))   # 0.3

Para dinheiro a sério existe `decimal` (módulo 10). Neste curso usamos `float` e `round()` por simplicidade.

### `and`, `or` e valores "falsos"

`and` e `or` devolvem um dos operandos, não necessariamente um `bool`. Valores considerados falsos: `0`, `0.0`, `""`, `None`, `False` e coleções vazias. Tudo o resto é verdadeiro.

    print(0 or "padrão")     # padrão
    print(1 and "x")         # x
    print(not 0)             # True

## Conversões

Converte explicitamente com `int()`, `float()`, `str()` e `bool()`:

    print(int("42"), float("3.50"), str(12.5))   # 42 3.5 12.5
    print(int(3.9), int(-3.9))                   # 3 -3
    print(bool(""), bool("0"), bool(0))          # False True False

- `int()` **trunca** (corta a parte decimal), não arredonda. Para arredondar usa `round()`.
- `round()` usa arredondamento "para o par mais próximo": `round(2.5)` é `2` e `round(3.5)` é `4`.
- `bool("0")` é `True`: qualquer texto não vazio é verdadeiro.
- Python nunca converte sozinho entre texto e número: `"5" + "5"` é `"55"`, e `"5" + 5` é erro.

    print("5" + "5", "5" * 3, int("5") + int("5"))   # 55 555 10

## print e input

`print()` escreve no ecrã; aceita vários valores, separados por espaço. `input()` lê uma linha de texto do teclado e devolve **sempre** `str`.

    quantidade = int(input("Quantidade: "))
    nome = input("Nome: ")
    print(f"{nome} x{quantidade}")

Com as respostas `4` e `Ana`, a última linha escreve `Ana x4`. Se o utilizador escrever `abc`, o `int()` falha com `ValueError` (tratar isso é assunto do módulo 08).

**DICA:** `print("a", "b", sep="-", end="!")` muda o separador e o fim de linha (por omissão, espaço e quebra de linha).

## f-strings

Uma f-string é um texto com prefixo `f`, onde `{expressão}` é substituído pelo valor. Depois de `:` indicas o formato.

    valor = 12.3456
    print(f"{descricao}: {valor:.2f} EUR")   # Café: 12.35 EUR

| Formato | Exemplo | Resultado |
|---|---|---|
| `.2f` | `f"{12.3456:.2f}"` | `12.35` |
| `,.2f` | `f"{1234567.891:,.2f}"` | `1,234,567.89` |
| `.1%` | `f"{0.256:.1%}"` | `25.6%` |
| `05d` | `f"{42:05d}"` | `00042` |
| `>6` `<6` `^6` | `f"{'ab':>6}"` | `    ab` (direita), `ab    ` (esquerda), `  ab  ` (centro) |

O formato `,` usa vírgula como separador de milhares e ponto como decimal, à americana. Para o formato português é preciso trabalho extra (módulo 05).

O sufixo `=` mostra a expressão e o valor, ótimo para depurar:

    print(f"{valor = }")    # valor = 12.3456

## Comentários

    # Comentário de linha inteira
    taxa = 0.23   # comentário no fim da linha

Python não tem comentários de bloco. Usa um `#` por linha. Comenta o **porquê**, não o óbvio: `x += 1  # soma 1` não ajuda ninguém.

## Tipagem dinâmica

Os nomes não têm tipo; os **valores** têm. Podes reatribuir um nome a um valor de outro tipo:

    x = 10
    print(type(x))    # <class 'int'>
    x = "dez"
    print(type(x))    # <class 'str'>

Isto dá flexibilidade, mas os erros de tipo só aparecem **em execução**. Python também é **fortemente tipado**: não mistura tipos incompatíveis sem conversão explícita. As anotações de tipo (`valor: float = 1.2`) existem, mas são só documentação para ferramentas; o interpretador ignora-as.

## Mutabilidade básica

Atribuir não copia o valor: o novo nome aponta para o **mesmo objeto**. Tipos como `int`, `float`, `str`, `bool` e `None` são **imutáveis**: não mudam depois de criados, e uma "alteração" cria um objeto novo.

    s = "abc"
    t = s
    t += "d"
    print(s, t)    # abc abcd

Já as listas (módulo 04) são **mutáveis**, e dois nomes para a mesma lista veem as mesmas alterações:

    a = [1, 2]
    b = a
    b.append(3)
    print(a, a is b)   # [1, 2, 3] True

    c = a.copy()       # cópia independente
    c.append(9)
    print(a, c)        # [1, 2, 3] [1, 2, 3, 9]

**ATENÇÃO:** `is` pergunta se são o mesmo objeto; `==` pergunta se têm o mesmo valor. Usa `==` para comparar valores e `is` só com `None`.

## Erros comuns

| Mensagem | Causa provável |
|---|---|
| `TypeError: can only concatenate str (not "int") to str` | Somaste texto com número (`"a" + 1`); converte com `str()` ou `int()` |
| `ValueError: invalid literal for int() with base 10: 'abc'` | O texto não é um inteiro; `int("3.5")` também falha, usa `int(float("3.5"))` |
| `ValueError: could not convert string to float: '1,5'` | Python só aceita ponto decimal |
| `NameError: name 'x_inexistente' is not defined` | Nome mal escrito ou usado antes da atribuição |
| `ZeroDivisionError: division by zero` | Divisão ou `%` por zero |
| `TypeError: 'str' object does not support item assignment` | Tentaste alterar um texto (`nome[0] = "b"`); strings são imutáveis |
| `TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'` | Usaste `None` numa conta |
| `SyntaxError: expected ':'` | Faltou `:` no fim de um `if`, `for` ou `def` |
| `SyntaxError: '(' was never closed` | Parêntese por fechar |
| `IndentationError: unexpected indent` | Indentação inconsistente |

**NOTA:** lê a mensagem de erro de baixo para cima: a última linha diz o tipo e a causa, e as anteriores dizem onde.

## Exercícios

**PRATICAR:** exercícios 1 a 4 do módulo 11 (variáveis e tipos, operadores e conversões, f-strings e formatação, mutabilidade e erros comuns).

## Fontes oficiais

- [Uma introdução informal ao Python](https://docs.python.org/3/tutorial/introduction.html)
- [Tipos embutidos](https://docs.python.org/3/library/stdtypes.html)
- [Modelo de dados (objetos, valores e tipos)](https://docs.python.org/3/reference/datamodel.html)
- [Entrada e saída, f-strings](https://docs.python.org/3/tutorial/inputoutput.html)
- [Mini-linguagem de formatação](https://docs.python.org/3/library/string.html#format-specification-mini-language)
- [PEP 8, guia de estilo](https://peps.python.org/pep-0008/)
