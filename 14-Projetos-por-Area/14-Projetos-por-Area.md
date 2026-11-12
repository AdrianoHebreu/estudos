# 14 Projetos por área

No módulo 00 viste as áreas onde o Python é usado. Aqui vês quatro delas na prática, com um mini projeto cada, todos sobre o mesmo gestor de despesas do fio condutor. O código completo está em `14-Projetos-por-Area/projetos/`; cada secção explica as partes importantes e mostra a saída real.

| Área | Projeto | Dependências externas |
|---|---|---|
| Automação e scripts | Organizar recibos e resumir um CSV | Nenhuma |
| Administração de sistemas | CLI de verificações (disco, serviço, ambiente) | Nenhuma |
| Web e APIs | API de despesas com FastAPI | `fastapi`, `uvicorn` |
| Dados e ciência | Análise e gráfico com pandas | `pandas`, `matplotlib` |

**NOTA:** os projetos com dependências pedem um ambiente virtual próprio (módulo 06): `python -m venv .venv`, ativar e `pip install -r requirements.txt` dentro da pasta do projeto. As versões usadas nos testes estão indicadas em cada secção.

**ATENÇÃO:** são exemplos de estudo, pequenos de propósito. Antes de os usares a sério, falta tratamento de erros, autenticação (na API), persistência e testes mais completos.

## Automação e scripts

**Objetivo:** automatizar duas tarefas chatas do gestor de despesas: arrumar uma pasta de recibos por tipo e por mês, e resumir o CSV de despesas por categoria. Só biblioteca padrão (`pathlib`, `shutil`, `argparse`, `csv`).

Estrutura de ficheiros:

    automacao/
        organizar.py     # arruma recibos em <tipo>/<AAAA-MM>/
        resumo.py        # resumo do CSV por categoria
        despesas.csv     # dados de exemplo (fictícios)

### Parte 1: calcular o destino com pathlib

O destino de cada ficheiro depende da extensão e da data de modificação. O operador `/` junta caminhos sem te preocupares com `\` ou `/`.

    def destino(ficheiro: Path, raiz: Path) -> Path:
        mes = datetime.fromtimestamp(ficheiro.stat().st_mtime).strftime("%Y-%m")
        tipo = ficheiro.suffix.lower().lstrip(".") or "sem-extensao"
        return raiz / tipo / mes / ficheiro.name

### Parte 2: simular primeiro, mover depois

O script **só simula por omissão**: só move com `--aplicar`. Assim vês o plano antes de mexer em ficheiros reais. Também nunca sobrescreve um destino que já exista.

    for f in sorted(p for p in raiz.iterdir() if p.is_file()):
        alvo = destino(f, raiz)
        if alvo.exists():
            continue
        print(f"{'MOVER' if aplicar else 'SIMULAR'}: {f.name} -> {alvo.relative_to(raiz)}")
        if aplicar:
            alvo.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(f, alvo)

**ATENÇÃO:** `iterdir()` só lista o nível atual e o filtro `is_file()` ignora as pastas já criadas, por isso correr o script duas vezes não mexe no que já foi arrumado.

### Parte 3: resumir o CSV

`csv.DictReader` dá-te cada linha como dicionário. Linhas com valor inválido são avisadas no `stderr` e saltadas, em vez de rebentarem o script.

    grupos: dict[str, list[float]] = defaultdict(list)
    with caminho.open(encoding="utf-8", newline="") as f:
        for n, linha in enumerate(csv.DictReader(f), start=2):
            try:
                grupos[linha["categoria"].strip()].append(float(linha["valor"]))
            except (ValueError, KeyError, AttributeError):
                print(f"AVISO: linha {n} ignorada: {linha}", file=sys.stderr)

### Como executar

    python resumo.py despesas.csv
    python organizar.py C:\caminho\para\recibos            # só simula
    python organizar.py C:\caminho\para\recibos --aplicar  # move mesmo

### Saída real

Resumo (o CSV tem uma linha propositadamente inválida, `Livro,abc`):

    AVISO: linha 7 ignorada: {'descricao': 'Livro', 'valor': 'abc', 'categoria': 'Lazer', 'data': '2026-11-07'}
    Categoria       N     Total       %
    Alimentação     3     56.90   55.9%
    Transportes     2     36.90   36.2%
    Lazer           1      8.00    7.9%
    TOTAL           6    101.80

Organizar, testado numa pasta temporária fora do curso (com datas de modificação ajustadas com `touch`), primeiro em simulação e depois com `--aplicar`:

    SIMULAR: a.pdf -> pdf\2026-09\a.pdf
    SIMULAR: b.PDF -> pdf\2026-10\b.PDF
    SIMULAR: c.jpg -> jpg\2026-09\c.jpg
    SIMULAR: d.txt -> txt\2026-11\d.txt
    SIMULAR: e -> sem-extensao\2026-11\e
    5 ficheiro(s) a mover (simulação; usa --aplicar).

    MOVER: a.pdf -> pdf\2026-09\a.pdf
    ...
    5 ficheiro(s) movido(s).

**DICA:** `--simular` também é aceite, mas é o comportamento por omissão; serve apenas para tornar a intenção explícita em scripts agendados.

**DICA:** se a consola do Windows mostrar carateres estranhos (`Alimenta��o`), define `PYTHONIOENCODING=utf-8` antes de executar.

### Ideias para continuar

- Agendar o `organizar.py` com o Agendador de Tarefas do Windows (ou `cron`), sempre com `--aplicar` só depois de validares a simulação.
- Tratar duplicados: em vez de ignorar, acrescentar um sufixo (`recibo_1.pdf`) ou comparar o conteúdo com um hash (`hashlib`).
- Exportar o resumo para um ficheiro CSV ou JSON com `csv.writer` / `json.dump`, e filtrar por mês com `--mes 2026-11`.

## Administração de sistemas: uma ferramenta de linha de comandos

**Objetivo:** construir o `sysadmin`, uma ferramenta com subcomandos (`disco`, `servico`, `ambiente`) que devolve **códigos de saída** úteis em scripts e CI. No fio condutor do curso, podes usá-la para confirmar que há espaço para guardar o ficheiro de despesas e que a API do gestor responde. Só usa a biblioteca padrão.

### Estrutura de ficheiros

    projetos/sysadmin/
        sysadmin.py        # os três subcomandos e o ponto de entrada (86 linhas)

### Subcomando `disco`

`shutil.disk_usage` devolve total, usado e livre em bytes. Se a percentagem livre ficar abaixo do limiar, a função devolve `1`.

    def cmd_disco(args: argparse.Namespace) -> int:
        uso = shutil.disk_usage(args.caminho)
        livre_pct = uso.free / uso.total * 100
        print(f"{args.caminho}: total {uso.total / GIB:.1f} GiB, "
              f"livre {uso.free / GIB:.1f} GiB ({livre_pct:.1f}%)")
        if livre_pct < args.limiar:
            print(f"ALERTA: livre abaixo de {args.limiar:g}%")
            return 1
        print("OK")
        return 0

### Subcomando `servico`

Se o destino começa por `http://` ou `https://`, usa `urllib.request`; caso contrário, trata-o como `host:porta` e tenta uma ligação TCP com `socket`. As duas funções devolvem `None` em caso de sucesso, ou o motivo da falha.

    def verificar_url(url: str, timeout: float) -> str | None:
        try:
            with urllib.request.urlopen(url, timeout=timeout) as resposta:
                return None if resposta.status < 400 else f"HTTP {resposta.status}"
        except urllib.error.HTTPError as erro:
            return f"HTTP {erro.code}"
        except (urllib.error.URLError, TimeoutError, ValueError) as erro:
            return str(getattr(erro, "reason", erro))

**ATENÇÃO:** `urlopen` **levanta** `HTTPError` para 4xx e 5xx, em vez de devolver a resposta. Por isso o `except urllib.error.HTTPError` tem de vir **antes** de `URLError` (a sua classe-mãe).

### Subcomandos e ponto de entrada

`add_subparsers` cria um parser por subcomando; `set_defaults(func=...)` associa-lhe a função. O `main` limita-se a chamá-la e devolve o código de saída a `sys.exit`.

    sub = parser.add_subparsers(dest="comando", required=True)
    disco = sub.add_parser("disco", help="espaço livre num caminho")
    disco.add_argument("--limiar", type=float, default=10.0)
    disco.set_defaults(func=cmd_disco)

    def main(argv: list[str] | None = None) -> int:
        args = construir_parser().parse_args(argv)
        return args.func(args)

    if __name__ == "__main__":
        sys.exit(main())

**DICA:** `main(argv)` aceitar uma lista facilita os testes: `main(["servico", "localhost:8000"])` não precisa de processos externos.

### Como executar

    cd 14-Projetos-por-Area/projetos/sysadmin
    python sysadmin.py ambiente
    python sysadmin.py disco --limiar 10
    python -m http.server 8765 --directory pasta    # noutro terminal
    python sysadmin.py servico http://localhost:8765/
    python sysadmin.py servico localhost:8765

### Saída real

Testado com Python 3.13.0 no Windows 11, contra um `http.server` local (depois parado):

    $ python sysadmin.py ambiente
    Python 3.13.0 (CPython)
    Sistema: Windows 11 (AMD64)
    $ python sysadmin.py disco
    .: total 475.5 GiB, livre 33.6 GiB (7.1%)
    ALERTA: livre abaixo de 10%            # código de saída 1
    $ python sysadmin.py disco --limiar 5
    .: total 475.5 GiB, livre 33.4 GiB (7.0%)
    OK                                     # código de saída 0
    $ python sysadmin.py servico http://localhost:8765/
    http://localhost:8765/: ATIVO          # código de saída 0
    $ python sysadmin.py servico http://localhost:8765/nao-existe
    http://localhost:8765/nao-existe: EM BAIXO (HTTP 404)    # código de saída 1
    $ python sysadmin.py servico localhost:8765
    localhost:8765: ATIVO                  # código de saída 0

Com o servidor parado, as duas formas de `servico` devolvem `EM BAIXO ([WinError 10061] ...)` e código 1. Os valores de espaço dependem da tua máquina.

**DICA:** num script, usa o código de saída: `python sysadmin.py servico localhost:8765 || echo "reiniciar serviço"`. No PowerShell, consulta `$LASTEXITCODE`; no Bash, `$?`.

### Ideias para continuar

- Adiciona `--json` para imprimir o resultado em JSON e integrá-lo com outras ferramentas.
- Cria um subcomando `memoria` ou `processos` (a biblioteca padrão é limitada aqui; avalia o pacote `psutil`).
- Lê uma lista de serviços de um ficheiro JSON e verifica-os todos, devolvendo 1 se algum falhar.

## Web e APIs: API de despesas com FastAPI

**Objetivo:** expor o gestor de despesas através de HTTP. Vais construir uma pequena API com FastAPI, validar os dados com modelos pydantic e testá-la sem arrancar servidor.

Estrutura de ficheiros:

    api-web/
        main.py            # a API (44 linhas)
        test_main.py       # testes com TestClient + pytest
        requirements.txt   # versões instaladas

Dependências (instaladas num venv à parte): `fastapi 0.162.2`, `uvicorn 0.54.0`, `httpx 0.28.1`, `pytest 9.2.0` (o FastAPI trouxe `pydantic 2.14.3` e `starlette 1.10.0`).

### Os modelos

    class DespesaIn(BaseModel):
        descricao: str = Field(min_length=1)
        valor: float = Field(gt=0)
        categoria: str
        data: date

    class Despesa(DespesaIn):
        id: int

`DespesaIn` é o que o cliente envia; `Despesa` acrescenta o `id` gerado pelo servidor. O pydantic converte `"2026-11-05"` em `date` e rejeita valores inválidos automaticamente.

### Os endpoints

    @app.get("/despesas")
    def listar(categoria: str | None = None) -> list[Despesa]:
        return [d for d in DESPESAS if categoria is None or d.categoria == categoria]

    @app.post("/despesas", status_code=201)
    def criar(nova: DespesaIn) -> Despesa:
        despesa = Despesa(id=len(DESPESAS) + 1, **nova.model_dump())
        DESPESAS.append(despesa)
        return despesa

    @app.get("/total")
    def total() -> dict[str, float]:
        return {"total": round(sum(d.valor for d in DESPESAS), 2)}

O parâmetro `categoria` não está no caminho, por isso o FastAPI trata-o como *query string* opcional (`?categoria=lazer`). Os dados vivem na lista `DESPESAS`, em memória.

### O teste

    client = TestClient(main.app)

    def test_valor_invalido_da_422():
        r = client.post("/despesas", json={"descricao": "x", "valor": -1,
                                           "categoria": "a", "data": "2026-11-05"})
        assert r.status_code == 422

O `TestClient` chama a aplicação diretamente, sem rede nem porta.

### Como executar

    python -m venv .venv
    .venv\Scripts\activate
    pip install -r requirements.txt
    python -m pytest -q
    python -m uvicorn main:app --port 8765

Com o servidor a correr, a documentação interativa fica em `/docs` (não a abri nesta verificação).

### Saída real

`pytest`:

    2 passed, 1 warning in 0.75s

(O aviso diz que o `starlette.testclient` com `httpx` está obsoleto e sugere `httpx2`; não o testei.) Pedidos feitos com `curl` ao servidor real:

    GET /despesas
    [{"descricao":"Mercado","valor":42.5,"categoria":"alimentacao","data":"2026-11-02","id":1},{"descricao":"Metro","valor":1.8,"categoria":"transporte","data":"2026-11-03","id":2}]

    GET /despesas?categoria=transporte
    [{"descricao":"Metro","valor":1.8,"categoria":"transporte","data":"2026-11-03","id":2}]

    POST /despesas  {"descricao":"Cinema","valor":8,"categoria":"lazer","data":"2026-11-05"}
    {"descricao":"Cinema","valor":8.0,"categoria":"lazer","data":"2026-11-05","id":3} [201]

    GET /total
    {"total":52.3}

    POST /despesas  com valor -1
    {"detail":[{"type":"greater_than","loc":["body","valor"],"msg":"Input should be greater than 0","input":-1,"ctx":{"gt":0.0}}]} [422]

**DICA:** o `TestClient` partilha a lista `DESPESAS` entre testes. O teste acima conta as despesas antes e depois em vez de assumir uma lista vazia.

**ATENÇÃO:** o `id = len(DESPESAS) + 1` só serve enquanto nunca apagas nada. Com um `DELETE` terias ids repetidos; usa um contador próprio. Pára sempre o servidor (`Ctrl+C`) no fim, senão a porta fica ocupada.

**NOTA:** Flask e Django também servem para APIs, mas não os instalei nem testei aqui, por isso não faço comparações de desempenho nem de funcionalidades. Consulta a documentação oficial de cada um.

### Ideias para continuar

- Acrescentar `DELETE /despesas/{id}` e devolver 404 quando o id não existe.
- Guardar os dados num ficheiro JSON ou em SQLite (módulo `sqlite3`) para sobreviverem ao reinício.
- Acrescentar `GET /total?categoria=...` ou um resumo por categoria.

## Dados e ciência: analisar despesas com pandas e matplotlib

**Objetivo:** ler um CSV de despesas (40 linhas fictícias, de setembro a novembro de 2026), calcular totais por categoria e por mês, estatísticas básicas e gerar um gráfico de barras em PNG, sem abrir nenhuma janela.

Estrutura de ficheiros:

    analise-dados/
        analise.py                    # o script (52 linhas)
        despesas.csv                  # dados fictícios: data, descricao, valor, categoria
        despesas_por_categoria.png    # gráfico de exemplo (11 KB)
        requirements.txt              # pandas e matplotlib

### Carregar os dados

    def carregar(caminho: Path) -> pd.DataFrame:
        df = pd.read_csv(caminho, parse_dates=["data"])
        df["mes"] = df["data"].dt.to_period("M").astype(str)
        return df

`read_csv` devolve um `DataFrame` (uma tabela). Com `parse_dates`, a coluna `data` passa a ser data a sério, e `.dt.to_period("M")` extrai o mês (`2026-09`).

### Agrupar e somar

    por_categoria = df.groupby("categoria")["valor"].sum().sort_values(ascending=False)
    por_mes = df.groupby("mes")["valor"].sum()

`groupby` junta as linhas com o mesmo valor na coluna indicada e `sum()` soma cada grupo. O resultado é uma `Series`. As estatísticas saem de `df["valor"].agg(["count", "mean", "median", "min", "max"])`.

### Gráfico sem janela

    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(6, 3.5))
    ax.bar(por_categoria.index, por_categoria.values)
    fig.savefig(destino, dpi=80)
    plt.close(fig)

`Agg` é um backend que só desenha para ficheiros. Funciona em servidores e scripts sem ambiente gráfico. `plt.close(fig)` liberta a memória.

**ATENÇÃO:** chama `matplotlib.use("Agg")` **antes** de importar `pyplot`, senão o matplotlib pode já ter escolhido um backend com janela.

### Como executar

Dentro de um ambiente virtual (ver módulo 06), a partir da pasta do projeto:

    pip install -r requirements.txt
    python analise.py

Versões instaladas nesta execução: Python 3.13.0, pandas 3.1.1, matplotlib 3.11.2, numpy 2.5.4.

**DICA:** no Windows, se os carateres `€` e `ç` aparecerem estragados, define `PYTHONIOENCODING=utf-8` antes de executar.

### Saída real

    Total por categoria (€):
    categoria
    Casa           424.39
    Alimentação    276.70
    Lazer          256.02
    Transportes    131.49
    Saúde           70.96

    Total por mês (€):
    mes
    2026-09    382.35
    2026-10    404.76
    2026-11    372.45

    Estatísticas do valor:
    count     40.00
    mean      28.99
    median    26.94
    min        5.56
    max       66.95

    Gráfico guardado em despesas_por_categoria.png (11.4 KB)

(O script imprime ainda a média por categoria; omitida aqui por brevidade.) A média (28,99 €) fica acima da mediana (26,94 €): umas poucas despesas altas, como as da categoria Casa, puxam a média para cima.

O PNG de exemplo gerado está em `projetos/analise-dados/despesas_por_categoria.png`.

### Ideias para continuar

- Acrescenta um segundo gráfico com o total por mês e junta os dois numa figura com `plt.subplots(1, 2)`.
- Usa `df.pivot_table(index="mes", columns="categoria", values="valor", aggfunc="sum")` para ver a tabela cruzada mês × categoria.
- Aceita o caminho do CSV como argumento de linha de comandos com `argparse` (módulo 10) em vez de o fixar no código.

## Inteligência artificial

A inteligência artificial não tem aqui um projeto: para a usar bem é preciso uma base de estatística e de preparação de dados que está fora deste curso, e um exemplo curto passaria a ideia errada de que é só copiar código. Quando já dominares os módulos 00 a 10, estes são bons pontos de partida:

| Tema | Onde aprender |
|---|---|
| Aprendizagem automática clássica | [scikit-learn](https://scikit-learn.org/stable/) |
| Redes neuronais | [Tutoriais do PyTorch](https://pytorch.org/tutorials/) |
| Modelos de linguagem em aplicações | [Documentação da Anthropic](https://docs.anthropic.com/) |
| Modelos abertos e cursos práticos | [Hugging Face Learn](https://huggingface.co/learn) |
| Exercícios com dados reais | [Kaggle Learn](https://www.kaggle.com/learn) |
| Fundamentos teóricos | [Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course) |

**DICA:** o caminho natural é primeiro o projeto de dados desta aula (pandas), porque quase todo o trabalho em IA começa por limpar e perceber os dados.

## Exercícios

**PRATICAR:** adapta cada projeto: acrescenta um filtro por data à análise, um subcomando novo ao `sysadmin.py`, um endpoint `DELETE` à API e uma regra nova ao organizador de recibos.

## Fontes oficiais

- [pathlib](https://docs.python.org/3/library/pathlib.html)
- [argparse](https://docs.python.org/3/library/argparse.html)
- [FastAPI](https://fastapi.tiangolo.com/)
- [pandas](https://pandas.pydata.org/docs/)
- [Matplotlib](https://matplotlib.org/stable/)
