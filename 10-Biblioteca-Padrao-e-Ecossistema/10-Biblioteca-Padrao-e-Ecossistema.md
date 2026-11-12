# 10 Biblioteca padrão e ecossistema

O Python vem com «baterias incluídas»: antes de instalares seja o que for, vê se a biblioteca padrão já resolve. Neste módulo percorres os módulos que mais vais usar no gestor de despesas e fechas com um mapa do ecossistema.

## pathlib: caminhos como objetos

`Path` representa um caminho e funciona igual em Windows, Linux e macOS. O operador `/` junta partes.

    from pathlib import Path
    base = Path("dados") / "despesas"
    base.mkdir(parents=True, exist_ok=True)
    ficheiro = base / "2026-11.txt"
    ficheiro.write_text("cafe;1.20\n", encoding="utf-8")
    print(ficheiro.name, ficheiro.stem, ficheiro.suffix)   # 2026-11.txt 2026-11 .txt
    print(ficheiro.with_suffix(".csv").name)                # 2026-11.csv
    print(sorted(p.name for p in base.glob("*.txt")))      # ['2026-11.txt']

Métodos úteis: `exists()`, `is_file()`, `read_text()`, `iterdir()`, `glob()`, `rglob()` (recursivo), `parent`, `unlink()`.

**DICA:** indica sempre `encoding="utf-8"` em `read_text` e `write_text`. Sem isso, o Python usa a codificação do sistema, que varia (no Windows pode não ser UTF-8).

## json: dados estruturados

`json.dumps` converte para texto, `json.loads` converte de volta. Para ficheiros há `dump` e `load`.

    import json
    dados = {"descricao": "Café", "valor": 1.2, "categoria": "comida", "data": "2026-11-09"}
    texto = json.dumps(dados, ensure_ascii=False, indent=2)
    volta = json.loads(texto)

Correspondência de tipos: `dict` ↔ objeto, `list`/`tuple` → array, `str`, `int`/`float`, `True`/`False` ↔ `true`/`false`, `None` ↔ `null`.

**ATENÇÃO:** o JSON não tem datas nem tuplos. `json.dumps(date(2026, 11, 9))` levanta `TypeError: Object of type date is not JSON serializable`: converte com `isoformat()` ao gravar e `date.fromisoformat()` ao ler. Chaves de dicionário viram sempre texto (`{1: "a"}` dá `{"1": "a"}`) e tuplos regressam como listas.

## csv: tabelas em texto

`DictWriter` e `DictReader` tratam do que é traiçoeiro (vírgulas e aspas dentro dos valores).

    import csv, io
    f = io.StringIO()
    w = csv.DictWriter(f, fieldnames=["descricao", "valor", "categoria", "data"])
    w.writeheader()
    w.writerow({"descricao": "Café, grande", "valor": 1.5, "categoria": "comida", "data": "2026-11-09"})
    print(f.getvalue())
    # descricao,valor,categoria,data
    # "Café, grande",1.5,comida,2026-11-09

Com ficheiros reais abre com `open(caminho, "w", newline="", encoding="utf-8")`. O `newline=""` evita linhas em branco a mais no Windows. Ao ler, tudo vem como texto: converte com `float(linha["valor"])`.

## datetime e zoneinfo

    from datetime import date, datetime, timedelta, timezone
    d = date(2026, 11, 9)
    print(d + timedelta(days=30))                         # 2026-12-09
    print(date.fromisoformat("2026-12-25") - d)           # 46 days, 0:00:00
    print(d.strftime("%d/%m/%Y"))                         # 09/11/2026
    print(datetime.strptime("09/11/2026", "%d/%m/%Y").date())   # 2026-11-09

`strftime` formata, `strptime` lê texto com um formato. Para fusos horários usa `zoneinfo` (biblioteca padrão desde o 3.9):

    from zoneinfo import ZoneInfo
    lisboa = ZoneInfo("Europe/Lisbon")
    a = datetime(2026, 7, 1, 12, 0, tzinfo=lisboa)
    print(a)                                              # 2026-07-01 12:00:00+01:00
    print(a.astimezone(ZoneInfo("America/New_York")))    # 2026-07-01 07:00:00-04:00
    print(a.astimezone(timezone.utc))                     # 2026-07-01 11:00:00+00:00

O mesmo fuso dá deslocações diferentes ao longo do ano: em 1 de janeiro de 2026 Lisboa está em UTC+0.

**ATENÇÃO:** datetimes *naive* (sem fuso) e *aware* (com fuso) não se comparam: levanta `TypeError: can't compare offset-naive and offset-aware datetimes`. Escolhe uma convenção (por exemplo, guardar em UTC e converter só para mostrar).

**NOTA:** no Windows, `zoneinfo` pode não encontrar a base de fusos do sistema; nesse caso instala o pacote `tzdata` (`pip install tzdata`).

## argparse: linha de comandos

    import argparse
    p = argparse.ArgumentParser(prog="despesas", description="Gestor de despesas")
    p.add_argument("descricao")
    p.add_argument("valor", type=float)
    p.add_argument("-c", "--categoria", default="geral")
    p.add_argument("-v", "--verboso", action="store_true")
    args = p.parse_args(["Café", "1.5", "-c", "comida", "-v"])
    print(args.descricao, args.valor, args.categoria, args.verboso)   # Café 1.5 comida True

Sem argumentos, `parse_args()` lê `sys.argv`. Passar uma lista, como acima, facilita os testes. O `-h` gera a ajuda sozinho e um valor inválido (`abc` para um `float`) termina com uma mensagem de erro e o código de saída 2 (`SystemExit`). Para comandos como `despesas add ...` usa `add_subparsers`.

## sqlite3: base de dados num ficheiro

O SQLite é uma base de dados completa, sem servidor. Com `":memory:"` vive só na memória, ideal para experimentar.

    import sqlite3
    con = sqlite3.connect(":memory:")
    con.execute("CREATE TABLE despesa (id INTEGER PRIMARY KEY, descricao TEXT, valor REAL, categoria TEXT, data TEXT)")
    with con:
        con.executemany(
            "INSERT INTO despesa (descricao, valor, categoria, data) VALUES (?, ?, ?, ?)",
            [("Café", 1.2, "comida", "2026-11-09"), ("Jantar", 18.5, "comida", "2026-11-10")])
    for linha in con.execute("SELECT categoria, SUM(valor) FROM despesa GROUP BY categoria"):
        print(linha)                                      # ('comida', 19.7)

- `with con:` faz *commit* no fim ou *rollback* se houver exceção. **Não** fecha a ligação: chama `con.close()` quando acabares.
- `con.row_factory = sqlite3.Row` permite aceder às colunas por nome (`linha["descricao"]`).

**ATENÇÃO:** nunca montes SQL com f-strings ou `+`. Usa sempre os marcadores `?`: o valor `"comida' OR '1'='1"` passado como parâmetro é só texto e não encontra nada, em vez de alterar a consulta (injeção de SQL).

## HTTP: urllib.request, requests e httpx

A biblioteca padrão faz pedidos HTTP com `urllib.request`. O exemplo seguinte foi executado contra um servidor local de teste, sem depender da rede:

    from urllib.request import urlopen, Request
    import json
    req = Request(url, headers={"User-Agent": "despesas/1.0"})
    with urlopen(req, timeout=5) as resposta:
        print(resposta.status, json.load(resposta))      # 200 {'ok': True}

Funciona, mas é de baixo nível. Na prática, quase toda a gente instala uma biblioteca de terceiros, dentro de um ambiente virtual (módulo 06):

    # python -m venv .venv  →  ativar  →  pip install requests httpx
    import requests
    r = requests.get(url, timeout=5)
    r.raise_for_status()           # levanta exceção em 4xx/5xx
    print(r.json())

    import httpx
    print(httpx.get(url, timeout=5.0).json())

Instalámos as duas num ambiente virtual temporário e executámo-las contra o mesmo servidor local, com o mesmo resultado. O `httpx` tem uma API muito parecida e acrescenta suporte para código assíncrono (`httpx.AsyncClient`).

**ATENÇÃO:** define sempre um `timeout`. O `requests` não tem timeout por defeito: um servidor que não responde pode bloquear o teu programa indefinidamente.

## Concorrência: threading, multiprocessing e asyncio

Há três modelos, e a escolha depende do tipo de trabalho. Trabalho **I/O-bound** passa o tempo à espera (rede, disco, base de dados). Trabalho **CPU-bound** passa o tempo a calcular.

| Modelo | Como funciona | Bom para | Custo |
|---|---|---|---|
| `threading` | várias *threads* no mesmo processo | I/O-bound, código bloqueante já existente | partilha memória: cuidado com condições de corrida |
| `multiprocessing` | vários processos, cada um com o seu interpretador | CPU-bound | arranque mais pesado; dados passam por serialização (*pickle*) |
| `asyncio` | uma só thread, tarefas cooperativas com `await` | muitas ligações I/O em simultâneo | todo o código tem de ser `async`/não bloqueante |

### O GIL, com cuidado

O CPython (a implementação habitual) tem, por defeito, o **GIL** (*Global Interpreter Lock*): um bloqueio que só deixa **uma thread de cada vez executar bytecode Python**. Consequências:

- Threads **não** aceleram trabalho CPU-bound em Python puro: só uma corre de cada vez.
- Threads **ajudam** em I/O-bound, porque o GIL é libertado enquanto uma thread espera pela rede ou pelo disco (o `time.sleep` também o liberta).
- O GIL **não** torna o teu código seguro: uma operação como `contador += 1` não é atómica e pode haver condições de corrida. Usa `threading.Lock` ou filas.
- É um pormenor do CPython, não da linguagem. O Python 3.13 introduziu uma compilação experimental sem GIL (*free-threaded*, PEP 703), que não é a predefinida. A instalação usada neste curso tem o GIL ativo (`sys._is_gil_enabled()` devolve `True`).

Exemplo com `concurrent.futures` (a API mais simples para threads e processos):

    import time
    from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

    def lento(n):
        time.sleep(0.5)          # simula I/O
        return n

    def cpu(n):
        return sum(i * i for i in range(n))

    if __name__ == "__main__":
        with ThreadPoolExecutor(3) as ex:
            print(list(ex.map(lento, [1, 2, 3])))      # [1, 2, 3] em ~0.5 s, não 1.5 s
        with ProcessPoolExecutor(2) as ex:
            print(list(ex.map(cpu, [10, 100])))        # [285, 328350]

**ATENÇÃO:** com `multiprocessing` no Windows (e no macOS) os processos filhos reimportam o ficheiro. Sem a guarda `if __name__ == "__main__":` o código de topo volta a correr em cada filho.

### asyncio

    import asyncio, time

    async def obter(nome, atraso):
        await asyncio.sleep(atraso)         # cede o controlo enquanto espera
        return f"{nome} pronto"

    async def main():
        t = time.perf_counter()
        r = await asyncio.gather(obter("a", 0.5), obter("b", 0.5), obter("c", 0.5))
        print(r, f"{time.perf_counter() - t:.1f}s")

    asyncio.run(main())
    # ['a pronto', 'b pronto', 'c pronto'] 0.5s

Três esperas de 0,5 s terminam em cerca de 0,5 s no total, numa só thread. O `await` marca os pontos onde outra tarefa pode avançar; uma chamada bloqueante (como `time.sleep` ou `requests.get`) dentro de uma função `async` pára tudo.

**DICA:** regra prática: muitas esperas por rede, `asyncio`; código bloqueante existente, `ThreadPoolExecutor`; cálculo pesado, `ProcessPoolExecutor`.

## Mapa do ecossistema

O PyPI (o repositório de pacotes usado pelo `pip`) tem centenas de milhares de projetos. Estes são os nomes mais conhecidos por área; consulta a documentação de cada um para versões e requisitos atuais.

| Área | Projetos | Para quê |
|---|---|---|
| Web | Flask | microframework simples e flexível |
| Web | FastAPI | APIs com *type hints*, validação e `async` |
| Web | Django | framework completa (ORM, administração, autenticação) |
| Dados | numpy | arrays numéricos e cálculo vetorial |
| Dados | pandas | tabelas (`DataFrame`), leitura de CSV/Excel, agregações |
| Testes | pytest | testes com menos cerimónia que `unittest` (módulo 08) |
| HTTP | requests, httpx | clientes HTTP |

No gestor de despesas, uma API poderia ser feita com FastAPI ou Flask, e um relatório mensal com pandas. Antes de adotares uma dependência, vê se a manutenção é ativa, se a licença serve e se a biblioteca padrão não chega: cada pacote é uma dependência a manter e a proteger.

**NOTA:** tudo o que se instala com `pip` deve ir para um ambiente virtual (módulo 06) e ficar registado num `requirements.txt` ou `pyproject.toml`.

## Exercícios

**PRATICAR:** faz os exercícios 37 a 40 do módulo 11 (pathlib e json, csv e datetime, argparse e sqlite3, asyncio).

## Fontes oficiais

- pathlib: https://docs.python.org/3/library/pathlib.html
- json: https://docs.python.org/3/library/json.html
- csv: https://docs.python.org/3/library/csv.html
- datetime: https://docs.python.org/3/library/datetime.html
- zoneinfo: https://docs.python.org/3/library/zoneinfo.html
- argparse: https://docs.python.org/3/library/argparse.html
- sqlite3: https://docs.python.org/3/library/sqlite3.html
- urllib.request: https://docs.python.org/3/library/urllib.request.html
- threading: https://docs.python.org/3/library/threading.html
- multiprocessing: https://docs.python.org/3/library/multiprocessing.html
- concurrent.futures: https://docs.python.org/3/library/concurrent.futures.html
- asyncio: https://docs.python.org/3/library/asyncio.html
- Python sem GIL (free-threading): https://docs.python.org/3/howto/free-threading-python.html
- PEP 703: https://peps.python.org/pep-0703/
- requests: https://requests.readthedocs.io/
- httpx: https://www.python-httpx.org/
- Flask: https://flask.palletsprojects.com/
- FastAPI: https://fastapi.tiangolo.com/
- Django: https://www.djangoproject.com/
- pandas: https://pandas.pydata.org/
- NumPy: https://numpy.org/
- pytest: https://docs.pytest.org/
