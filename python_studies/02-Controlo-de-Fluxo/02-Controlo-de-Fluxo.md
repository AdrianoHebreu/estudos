# 02 Controlo de fluxo

Até aqui os programas corriam de cima a baixo, linha a linha. O **controlo de fluxo** permite decidir o que executar (condições) e repetir blocos (ciclos). Neste módulo usamos o gestor de despesas para classificar valores, percorrer despesas e interpretar comandos.

## Blocos e indentação

Em Python, um bloco é definido pela **indentação** (convenção: 4 espaços), não por chavetas. A linha que abre o bloco termina em `:`.

    valor = 85.0
    if valor > 100:
        print("Despesa alta")
    elif valor > 50:
        print("Despesa média")
    else:
        print("Despesa baixa")

Saída: `Despesa média`.

- `if` testa a primeira condição; `elif` (zero ou mais) as seguintes; `else` (opcional) apanha o resto.
- Só **um** ramo é executado: o primeiro cuja condição seja verdadeira.

**ATENÇÃO:** misturar tabs e espaços, ou indentar de forma inconsistente, dá `IndentationError`. Configura o editor para inserir 4 espaços.

## Truthiness: o que conta como verdadeiro

Qualquer valor pode ser usado numa condição. Python converte-o com `bool()`:

| Valor | `bool(valor)` |
|---|---|
| `0`, `0.0` | `False` |
| `""` (texto vazio) | `False` |
| `[]` (lista vazia) | `False` |
| `None`, `False` | `False` |
| `1`, `-3`, `"0"`, `" "`, `[0]` | `True` |

Regra: são falsos o zero, os vazios e `None`; tudo o resto é verdadeiro. Repara que `"0"` e `[0]` são verdadeiros, porque não estão vazios.

    descricao = ""
    if not descricao:
        print("Descrição em falta")

**DICA:** prefere `if not descricao:` a `if descricao == "":`. Mas para comparar com `None` usa `is None`, porque `0` e `""` também são falsos e podes querer distingui-los.

## Comparações e operadores lógicos

Os operadores de comparação são `==`, `!=`, `<`, `<=`, `>`, `>=`. Em Python podes **encadeá-los**:

    idade = 25
    print(18 <= idade < 65)   # True, equivale a 18 <= idade and idade < 65
    print(1 < 5 > 3)          # True

Para testar pertença usa `in`:

    categoria = "Casa"
    print(categoria == "Casa" or categoria == "Renda")   # True
    print(categoria in ("Casa", "Renda"))                # True, mais curto

Os operadores lógicos são `and`, `or` e `not`. Precedência: `not` primeiro, depois `and`, depois `or`. Em dúvida, usa parênteses.

    valor = 30
    categoria = "Comida"
    if valor > 0 and (categoria == "Comida" or categoria == "Casa"):
        print("válida")

### Curto-circuito e valores devolvidos

`and` e `or` param assim que o resultado é conhecido e **devolvem um dos operandos**, não necessariamente um booleano:

    print(0 or "padrão")        # padrão
    print("ola" and "mundo")    # mundo
    print(None or [] or "fim")  # fim

- `a or b` devolve `a` se for verdadeiro; senão devolve `b`.
- `a and b` devolve `a` se for falso; senão devolve `b`.

Um padrão frequente é o valor por omissão:

    nome = ""
    print(nome or "anónimo")    # anónimo

**ATENÇÃO:** `x == 1 or 2` não significa «x é 1 ou 2». Lê-se `(x == 1) or 2`, que é sempre verdadeiro. Escreve `x in (1, 2)`.

## O ciclo while

`while` repete o bloco enquanto a condição for verdadeira:

    saldo = 100
    while saldo > 0:
        saldo -= 30
        print("saldo", saldo)

Saída: `saldo 70`, `saldo 40`, `saldo 10`, `saldo -20`. A condição só é reavaliada no início de cada volta, por isso o último valor ficou negativo.

**ATENÇÃO:** se nada no corpo alterar a condição, o ciclo é infinito. Para interromper no terminal usa `Ctrl+C`.

## O ciclo for e range

`for` percorre os elementos de qualquer coisa iterável (texto, intervalos, e mais tarde listas e dicionários):

    for letra in "abc":
        print(letra, end=",")      # a,b,c,

`range` gera sequências de inteiros sem as guardar todas em memória:

| Chamada | Valores |
|---|---|
| `range(3)` | `0, 1, 2` |
| `range(2, 10, 3)` | `2, 5, 8` |
| `range(5, 0, -2)` | `5, 3, 1` |

O fim é **exclusivo**. `len(range(10))` é `10`. Para ver os valores: `list(range(2, 10, 3))` dá `[2, 5, 8]`.

Para somar as despesas de uma lista (as listas são estudadas no módulo 04; por agora basta saber percorrê-las):

    valores = [12.5, 80, 3.2, 45]
    total = 0
    for v in valores:
        total += v
    print(total)      # 140.7

**DICA:** usa `for` quando sabes o que percorrer e `while` quando repetes até uma condição mudar.

## break, continue e else em ciclos

- `break` sai do ciclo imediatamente.
- `continue` salta para a próxima volta.
- `else` num ciclo corre **só se o ciclo terminou sem `break`**.

Com a lista `valores` de cima:

    for v in valores:
        if v > 100:
            print("achei")
            break
    else:
        print("nenhuma acima de 100")

A saída é `nenhuma acima de 100`, porque nenhum valor passou o limite.

    for v in valores:
        if v < 10:
            continue
        print("grande", v)

Imprime `grande 12.5`, `grande 80` e `grande 45`. Um `while True` com `break` serve para repetir até algo acontecer:

    tentativas = 0
    while True:
        tentativas += 1
        if tentativas == 3:
            break
    print(tentativas)    # 3

**NOTA:** o `else` do ciclo lê-se como «se não encontrei nada». É útil em pesquisas, mas muita gente estranha-o: usa-o com um comentário.

## enumerate e zip (introdução)

`enumerate` dá o índice a par de cada elemento; `start` muda o primeiro número:

    descs = ["Café", "Renda", "Cinema"]
    for i, d in enumerate(descs, start=1):
        print(f"{i}. {d}")

Saída: `1. Café`, `2. Renda`, `3. Cinema`.

`zip` percorre várias sequências em paralelo:

    vals = [1.2, 800, 9.5]
    for d, v in zip(descs, vals):
        print(f"{d}: {v:.2f} €")

Saída: `Café: 1.20 €`, `Renda: 800.00 €`, `Cinema: 9.50 €`. Se as sequências tiverem tamanhos diferentes, o `zip` pára na mais curta: `list(zip([1, 2, 3], ["a", "b"]))` dá `[(1, 'a'), (2, 'b')]`.

Os dois combinam-se, com parênteses no par:

    for i, (d, v) in enumerate(zip(descs, vals), 1):
        print(i, d, v)

Saída: `1 Café 1.2`, `2 Renda 800`, `3 Cinema 9.5`.

## match/case

Desde o Python 3.10, `match` compara um valor com **padrões**. Não é só um `switch`: também desmonta estruturas.

    comando = "listar"
    match comando:
        case "listar":
            print("A listar")
        case "adicionar" | "novo":
            print("A adicionar")
        case _:
            print("Desconhecido")

- `|` junta alternativas; `_` é o caso por omissão (não liga nenhum nome).
- Um nome sozinho, como `y`, **captura** o valor em vez de o comparar.

Padrões de sequência e guardas (`if`):

    ponto = (0, 5)
    match ponto:
        case (0, 0):
            print("origem")
        case (0, y):
            print("eixo y", y)      # eixo y 5
        case (x, 0):
            print("eixo x", x)
        case _:
            print("outro")

    valor = 150
    match valor:
        case n if n > 100:
            print("alto", n)        # alto 150
        case _:
            print("normal")

Também funciona com listas, por exemplo para comandos com argumentos:

    match ["adicionar", "Café", 1.5]:
        case ["adicionar", descricao, valor]:
            print(descricao, valor)     # Café 1.5
        case ["listar"]:
            print("lista")

**ATENÇÃO:** `case Categoria:` com um nome simples nunca compara com uma variável existente; captura sempre e aceita tudo. Para comparar com constantes usa literais.

## Expressão condicional

Para escolher entre dois valores numa só linha:

    valor = 20
    tipo = "pequena" if valor < 50 else "grande"
    print(tipo)      # pequena

Lê-se «`pequena` se a condição, senão `grande`». É uma **expressão** (produz um valor), ao contrário do `if` que é uma instrução.

**DICA:** usa-a para escolhas simples. Com três ou mais ramos, um `if/elif/else` é mais legível.

## Erros comuns

| Sintoma | Causa provável |
|---|---|
| `SyntaxError: expected ':'` | Faltam os dois pontos no fim de `if`, `for`, `while`, `else` |
| `IndentationError` | Indentação inconsistente ou em falta |
| `SyntaxError` em `if a = 0:` | `=` atribui, `==` compara |
| Ciclo que nunca acaba | A condição do `while` nunca muda |
| `range(1, 5)` falta o 5 | O fim é exclusivo |

## Exercícios

**PRATICAR:** exercícios 5 a 8 do módulo 11 (classificar despesas, ciclos com `break`/`else`, `enumerate` e `zip`, `match` e expressão condicional).

## Fontes oficiais

- [Tutorial: mais ferramentas de controlo de fluxo](https://docs.python.org/3/tutorial/controlflow.html)
- [Referência: instruções compostas](https://docs.python.org/3/reference/compound_stmts.html)
- [Teste de valor lógico (truthiness)](https://docs.python.org/3/library/stdtypes.html#truth-value-testing)
- [Expressões condicionais](https://docs.python.org/3/reference/expressions.html#conditional-expressions)
- [enumerate](https://docs.python.org/3/library/functions.html#enumerate) e [zip](https://docs.python.org/3/library/functions.html#zip)
- [PEP 634: match/case](https://peps.python.org/pep-0634/) e [PEP 636: tutorial](https://peps.python.org/pep-0636/)
