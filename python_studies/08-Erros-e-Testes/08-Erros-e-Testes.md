# 08 Erros e testes

## Tipos de erro e traceback

| Tipo | Quando acontece | Exemplo |
|---|---|---|
| **Erro de sintaxe** | Antes de correr: o código não é Python válido | `SyntaxError`, `IndentationError` |
| **Exceção** | Durante a execução: o código é válido, a operação falha | `ZeroDivisionError`, `ValueError`, `KeyError` |

Uma exceção não tratada imprime o **traceback**, a cadeia de chamadas até ao erro:

    def media(valores):
        return sum(valores) / len(valores)

    print(media([]))

Saída (caminhos abreviados):

    Traceback (most recent call last):
      File "a1.py", line 4, in <module>
        print(media([]))
      File "a1.py", line 2, in media
        return sum(valores) / len(valores)
    ZeroDivisionError: division by zero

**DICA:** lê o traceback **de baixo para cima**: a última linha diz *o quê* (tipo e mensagem), a linha de código por cima diz *onde*, as restantes mostram *quem chamou*.

Exceções comuns: `ValueError` (tipo certo, conteúdo errado), `TypeError`, `KeyError`/`IndexError` (ambas subclasses de `LookupError`), `AttributeError`, `FileNotFoundError`. Todas herdam de `Exception`.

## try / except / else / finally

    def ler_valor(texto):
        try:
            valor = float(texto)
        except ValueError:
            print(f"Valor inválido: {texto!r}")
            return None
        else:
            print("Conversão feita")
            return valor
        finally:
            print("A terminar leitura")

    print(ler_valor("12.5"))   # Conversão feita / A terminar leitura / 12.5
    print(ler_valor("abc"))    # Valor inválido: 'abc' / A terminar leitura / None

| Bloco | Corre quando |
|---|---|
| `try` | Sempre; contém o código que pode falhar |
| `except X` | O `try` levantou `X` (ou subclasse) |
| `else` | O `try` terminou **sem** exceção |
| `finally` | Sempre, mesmo com `return` pelo meio |

- Apanha só o que sabes tratar, e o mais específico possível. Vários tipos: `except (ValueError, TypeError) as erro:`.
- O primeiro `except` compatível ganha: põe os específicos antes dos genéricos.
- Mantém o `try` pequeno; o que usa o resultado vai para o `else`.

**ATENÇÃO:** evita `except:` sem tipo e `except Exception: pass`. Escondem bugs reais (o primeiro apanha até `KeyboardInterrupt`). Se apanhas tudo, regista o erro ou volta a levantá-lo.

## raise e exceções personalizadas

Para erros do teu domínio, cria uma hierarquia com uma classe-base:

    class ErroDespesa(Exception):
        """Base dos erros do gestor de despesas."""

    class ValorInvalido(ErroDespesa):
        def __init__(self, valor):
            super().__init__(f"valor inválido: {valor}")
            self.valor = valor

    class CategoriaDesconhecida(ErroDespesa):
        pass

    def validar(valor, categoria):
        if valor <= 0:
            raise ValorInvalido(valor)
        if categoria not in {"casa", "comida", "lazer"}:
            raise CategoriaDesconhecida(categoria)

    try:
        validar(-5, "casa")
    except ValorInvalido as e:
        print("ValorInvalido:", e, e.valor)   # ValorInvalido: valor inválido: -5 -5
    except ErroDespesa as e:
        print("Outro erro:", e)

**DICA:** herda de `Exception`, nunca de `BaseException`. Um `raise` simples dentro de um `except` **volta a levantar** a exceção atual: útil para registar e deixar subir.

## Encadeamento: raise ... from

    import json

    class ErroFicheiro(ErroDespesa):
        pass

    def carregar(texto):
        try:
            return json.loads(texto)
        except json.JSONDecodeError as e:
            raise ErroFicheiro("ficheiro de despesas corrompido") from e

    try:
        carregar("{mau")
    except ErroFicheiro as e:
        print(e)
        print("causa:", repr(e.__cause__))

Saída:

    ficheiro de despesas corrompido
    causa: JSONDecodeError('Expecting property name enclosed in double quotes: line 1 column 2 (char 1)')

| Forma | Atributo | Traceback mostra |
|---|---|---|
| `raise Novo from erro` | `__cause__` | «The above exception was the direct cause of...» |
| `raise Novo` dentro de `except` | `__context__` | «During handling of the above exception, another exception occurred» |
| `raise Novo from None` | `__suppress_context__` | Só o erro novo |

Usa `from e` para traduzir um erro de baixo nível (JSON, rede) num erro do teu domínio sem perder a causa.

## ExceptionGroup e except* (nota breve)

Desde o Python 3.11, vários erros independentes podem viajar num `ExceptionGroup`; `except*` apanha **os membros** de cada tipo:

    try:
        raise ExceptionGroup("falhas", [ValueError("a"), TypeError("b"), ValueError("c")])
    except* ValueError as grupo:
        print("ValueError:", [str(e) for e in grupo.exceptions])
    except* TypeError as grupo:
        print("TypeError:", [str(e) for e in grupo.exceptions])

Imprime `ValueError: ['a', 'c']` e `TypeError: ['b']`.

**NOTA:** num `except*` todos os blocos aplicáveis correm, e não se mistura `except` com `except*` no mesmo `try`. Aparece sobretudo em código concorrente; por agora basta saberes que existe.

## assert

`assert condição, mensagem` levanta `AssertionError` se a condição for falsa. Serve para **suposições do programador**, não para validar dados externos.

    def aplicar_desconto(preco, percentagem):
        assert 0 <= percentagem <= 100, f"percentagem fora do intervalo: {percentagem}"
        return preco * (1 - percentagem / 100)

    print(aplicar_desconto(50, 10))
    try:
        aplicar_desconto(50, 150)
    except AssertionError as e:
        print("AssertionError:", e)

O primeiro `print` mostra `45.0`; o segundo caso mostra `AssertionError: percentagem fora do intervalo: 150`.

**ATENÇÃO:** com `python -O` os `assert` são **removidos** (o mesmo código devolveria `-25.0` sem erro). Para validar entradas usa `if` + `raise`, como em `validar`. Reserva `assert` para invariantes internos e testes.

## logging básico

    import logging

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    log = logging.getLogger("despesas")

    log.debug("não aparece (nível DEBUG < INFO)")
    log.info("a carregar %d despesas", 3)
    log.warning("categoria %r desconhecida", "viagens")
    try:
        1 / 0
    except ZeroDivisionError:
        log.exception("falha no cálculo")

Saída (a hora varia; `log.exception` acrescenta o traceback a seguir):

    14:37:59 INFO despesas: a carregar 3 despesas
    14:37:59 WARNING despesas: categoria 'viagens' desconhecida
    14:37:59 ERROR despesas: falha no cálculo

Níveis, do mais baixo ao mais alto: `DEBUG`, `INFO`, `WARNING` (o nível por omissão), `ERROR`, `CRITICAL`.

- Um `getLogger(__name__)` por módulo; `basicConfig` **uma vez**, no ponto de entrada.
- Passa valores como argumentos (`"%d despesas", 3`), não com f-strings: só se formata se a mensagem for emitida.
- `log.exception(...)` dentro de um `except` regista a mensagem **e** o traceback.
- Para ficheiro: `basicConfig(..., handlers=[logging.FileHandler("app.log", encoding="utf-8")])`.

## Depuração com breakpoint() e pdb

Escreve `breakpoint()` onde queres parar; abre-se o depurador `pdb` nesse ponto:

    def total(valores):
        soma = 0
        for v in valores:
            breakpoint()
            soma += v
        return soma

    print(total([5, 7]))

Sessão (o que escreves vem depois de `(Pdb)`):

    > b4.py(4)total()
    -> breakpoint()
    (Pdb) p valores
    [5, 7]
    (Pdb) p soma
    0
    (Pdb) c

Comandos úteis: `p expr` (mostra valor), `n` (próxima linha), `s` (entra na função), `c` (continua), `l` (código à volta), `w` (pilha), `q` (sai).

`python -m pdb ficheiro.py` abre o depurador no ponto da exceção não tratada. `PYTHONBREAKPOINT=0 python programa.py` desativa todos os `breakpoint()` sem editar código.

## Testes com unittest

O `unittest` já vem com o Python: cada teste é um método `test_*` numa subclasse de `TestCase`. Código a testar, `despesas.py` (parte; `ErroDespesa` é a classe-base de acima, as importações — `json`, `dataclass`, `asdict`, `Path` — omitidas):

    @dataclass
    class Despesa:
        descricao: str
        valor: float
        categoria: str

        def __post_init__(self):
            if self.valor <= 0:
                raise ErroDespesa(f"valor inválido: {self.valor}")

    def total(despesas):
        return sum(d.valor for d in despesas)

    # guardar(despesas, caminho) e carregar(caminho): JSON com pathlib

Testes (`test_unittest_despesas.py`):

    import unittest
    from despesas import Despesa, ErroDespesa, total

    class TesteDespesa(unittest.TestCase):
        def setUp(self):
            self.lista = [Despesa("Pão", 1.5, "comida"), Despesa("Renda", 600, "casa")]

        def test_total(self):
            self.assertAlmostEqual(total(self.lista), 601.5)

        def test_valor_negativo(self):
            with self.assertRaises(ErroDespesa):
                Despesa("Erro", -1, "casa")


`python -m unittest -v test_unittest_despesas` termina com `Ran 3 tests` e `OK` (o terceiro teste, `test_lista_vazia`, verifica `total([]) == 0`). O `setUp` corre antes de **cada** teste; entre os `assert*` mais usados estão `assertEqual`, `assertTrue`, `assertIn`, `assertRaises` e `assertAlmostEqual` (floats).

## Testes com pytest

O **pytest** é o mais usado na prática: testes são funções simples com o `assert` normal, e uma falha mostra os valores envolvidos. Não vem com o Python; instala-o num ambiente virtual (módulo 06):

    python -m venv .venv
    .venv\Scripts\activate          # Linux/macOS: source .venv/bin/activate
    pip install pytest
    python -m pytest

Encontra ficheiros `test_*.py` e funções `test_*` (e também corre testes `unittest`).

    import pytest
    from despesas import Despesa, ErroDespesa, total, guardar, carregar

    def test_valor_invalido():
        with pytest.raises(ErroDespesa, match="valor inválido"):
            Despesa("Erro", 0, "casa")

    def test_que_falha():
        lista = [Despesa("Pão", 1.5, "comida"), Despesa("Renda", 600, "casa")]
        assert total(lista) == 100

Quando falha, o relatório explica porquê: `AssertionError: assert 601.5 == 100`, com o valor devolvido por `total(...)` e a linha do teste.

**DICA:** para floats, compara com `pytest.approx`: `assert 0.1 + 0.2 == pytest.approx(0.3)`.

### Parametrização, fixtures e tmp_path

A **parametrização** descreve os casos numa tabela; cada linha é um teste independente (`test_total_parametrizado[valores2-4.0]`). Uma **fixture** prepara dados e o teste pede-a pelo **nome do parâmetro**. A fixture embutida `tmp_path` dá uma pasta temporária (um `Path`) única por teste, ideal para testar ficheiros sem sujar o disco.

    @pytest.fixture
    def lista():
        return [Despesa("Pão", 1.5, "comida"), Despesa("Renda", 600, "casa")]

    def test_total(lista):
        assert total(lista) == pytest.approx(601.5)

    @pytest.mark.parametrize(
        "valores, esperado",
        [([], 0), ([10], 10), ([1.5, 2.5], 4.0)],
    )
    def test_total_parametrizado(valores, esperado):
        despesas = [Despesa("x", v, "outros") for v in valores]
        assert total(despesas) == esperado

    def test_guardar_e_carregar(lista, tmp_path):
        ficheiro = tmp_path / "despesas.json"
        guardar(lista, ficheiro)
        assert ficheiro.exists()
        assert carregar(ficheiro) == lista

Com tudo na mesma pasta, `python -m pytest -q` deu `1 failed, 9 passed` (o teste que falha é o de propósito); com `-k "not falha"`, `9 passed`, incluindo os 3 de `unittest`.

**NOTA:** testa o **comportamento**: o caminho feliz, os limites (lista vazia, zero) e os erros esperados.

## Exercícios

**PRATICAR:** exercícios 29 a 32 do módulo 11 (tratamento de exceções, exceção personalizada com encadeamento, logging e testes com pytest).

## Fontes oficiais

- [Erros e exceções (tutorial)](https://docs.python.org/3/tutorial/errors.html)
- [Exceções incorporadas](https://docs.python.org/3/library/exceptions.html)
- [A instrução assert](https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement)
- [logging](https://docs.python.org/3/library/logging.html) e [Logging HOWTO](https://docs.python.org/3/howto/logging.html)
- [pdb](https://docs.python.org/3/library/pdb.html) e [breakpoint()](https://docs.python.org/3/library/functions.html#breakpoint)
- [unittest](https://docs.python.org/3/library/unittest.html)
- [pytest](https://docs.pytest.org/en/stable/), [parametrização](https://docs.pytest.org/en/stable/how-to/parametrize.html), [fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html), [tmp_path](https://docs.pytest.org/en/stable/how-to/tmp_path.html)
