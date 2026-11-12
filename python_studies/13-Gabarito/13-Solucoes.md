# 13 Soluções e critérios

Soluções comentadas dos exercícios do módulo 11. Todas foram executadas com Python 3.13. Há sempre mais de uma solução correta: compara o comportamento, não o código.

## Módulo 01 · Fundamentos

### Exercício 1

    descricao = "Almoço"
    valor = 8.5
    categoria = "Alimentação"
    pago = True
    nota = None
    print(f"descricao: {type(descricao).__name__}")
    print(f"valor: {type(valor).__name__}")
    print(f"categoria: {type(categoria).__name__}")
    print(f"pago: {type(pago).__name__}")
    print(f"nota: {type(nota).__name__}")

Saída: `descricao: str`, `valor: float`, `categoria: str`, `pago: bool`, `nota: NoneType`. O `type()` devolve a classe e `__name__` dá o nome dela como texto.

### Exercício 2

    preco = 45.90
    taxa = 0.23
    iva = round(preco * taxa, 2)
    total = round(preco + iva, 2)
    euros, centimos = divmod(round(total * 100), 100)
    print(iva, total, euros, centimos)

Saída: `10.56 56.46 56 46`. Multiplicar por 100 e arredondar antes do `divmod` evita erros de representação dos `float`.

### Exercício 3

    descricao = "Café"
    quantidade = 3
    preco = 1.2
    subtotal = quantidade * preco
    print(f"{descricao:<10}{quantidade:>3}{subtotal:>8.2f}")
    print(f"{subtotal / 20.0:.1%}")

Saída: `Café        3    3.60` e `18.0%`. Os modificadores `<10`, `>3` e `>8.2f` definem largura e alinhamento, e `.1%` multiplica por 100 e acrescenta `%`.

### Exercício 4

    despesas = [10.0, 20.0]
    copia = despesas
    copia.append(5.0)
    print(despesas, despesas is copia)
    independente = despesas.copy()
    independente.append(99.0)
    print(despesas, independente)
    resposta = "12,50"
    print(float(resposta.replace(",", ".")))

Saída: `[10.0, 20.0, 5.0] True`, depois `[10.0, 20.0, 5.0] [10.0, 20.0, 5.0, 99.0]` e `12.5`. `copia = despesas` só cria outro nome para a mesma lista, enquanto `.copy()` cria um objeto novo; e `float("12,50")` falharia, por isso troca-se a vírgula por ponto.

## Módulo 02 · Controlo de fluxo

### Exercício 5

    valor = 75.0
    categoria = "Comida"
    if valor <= 0 or not categoria:
        print("Inválida")
    elif valor < 20:
        print("Pequena")
    elif valor < 100:
        print("Média")
    else:
        print("Grande")

Saída: `Média`. A validação vem primeiro; como só um ramo corre, os `elif` seguintes já assumem um valor válido.

### Exercício 6

    valores = [12.5, 80, 3.2, 145, 45]
    limite = 100
    total = 0
    for v in valores:
        if v > limite:
            print("Primeira acima do limite:", v)
            break
        total += v
    else:
        print("Nenhuma acima do limite")
    print("Total até aí:", total)

    orcamento = 100
    gasto = 0
    meses = 0
    while gasto < orcamento:
        gasto += 30
        meses += 1
    print(meses, gasto)

Saída: `Primeira acima do limite: 145`, `Total até aí: 95.7` e `4 120`. O `else` só correria sem `break`; o `while` repete até o gasto atingir 100.

### Exercício 7

    descs = ["Café", "Renda", "Cinema", "Livro"]
    vals = [1.2, 800, 9.5, 15]
    total = 0
    for n, (d, v) in enumerate(zip(descs, vals), start=1):
        print(f"{n}. {d:<8}{v:>8.2f} €")
        total += v
    print(f"Total: {total:.2f} €")

Saída: quatro linhas numeradas e `Total: 825.70 €`. O `zip` junta descrição e valor; o `enumerate` acrescenta o número, daí o par entre parênteses.

### Exercício 8

    for comando in ["listar", "novo", "sair", "xpto", "ajuda"]:
        match comando:
            case "listar":
                print("A listar")
            case "novo" | "adicionar":
                print("A adicionar")
            case "sair":
                print("Adeus")
            case _:
                print("Comando desconhecido:", comando)

    for valor in [5, 60]:
        estado = "alta" if valor >= 50 else "normal"
        print(valor, estado)

Saída: `A listar`, `A adicionar`, `Adeus`, duas linhas de comando desconhecido, depois `5 normal` e `60 alta`. O `_` apanha tudo o que não correspondeu antes.

## Módulo 03 · Funções

### Exercício 9

    def nova_despesa(descricao, valor, /, *, categoria="Outros", tags=None):
        if tags is None:
            tags = []
        tags.append("novo")
        return descricao, valor, categoria, tags

    print(nova_despesa("Café", 1.2))
    # ('Café', 1.2, 'Outros', ['novo'])
    print(nova_despesa("Renda", 600, categoria="Casa"))
    # ('Renda', 600, 'Casa', ['novo'])
    nova_despesa("Café", 1.2, "Casa")
    # TypeError: nova_despesa() takes 2 positional arguments but 3 were given

O `/` e o `*` fixam como cada parâmetro pode ser passado; `tags=None` com criação dentro da função dá uma lista nova em cada chamada (a segunda chamada não mostra `['novo', 'novo']`).

### Exercício 10

    def resumo(*valores, **opcoes):
        if not valores:
            return "sem valores"
        total = sum(valores)
        moeda = opcoes.get("moeda", "EUR")
        texto = f"{len(valores)} despesas, total {total:.2f} {moeda}"
        if opcoes.get("media"):
            texto += f", média {total / len(valores):.2f}"
        return texto

    print(resumo(10, 20.5, 5))                      # 3 despesas, total 35.50 EUR
    print(resumo(10, 20, moeda="USD", media=True))  # 2 despesas, total 30.00 USD, média 15.00
    print(resumo())                                 # sem valores
    print(resumo(*[1, 2, 3], **{"media": True}))    # 3 despesas, total 6.00 EUR, média 2.00

`valores` é um tuplo e `opcoes` um dicionário; `opcoes.get(chave, omissão)` lê uma opção sem falhar se faltar.

### Exercício 11

    def criar_contador_categoria(categoria):
        total = 0
        def adicionar(valor):
            nonlocal total
            total += valor
            return f"{categoria}: {total:.2f}"
        return adicionar

    comida = criar_contador_categoria("Comida")
    casa = criar_contador_categoria("Casa")
    print(comida(10))     # Comida: 10.00
    print(comida(5.5))    # Comida: 15.50
    print(casa(600))      # Casa: 600.00
    print(comida(1))      # Comida: 16.50

Cada chamada à função externa cria o seu próprio `total`; `nonlocal` permite à função interna reatribuí-lo.

### Exercício 12

    def potencia(base, exp):
        if exp == 0:                  # caso base
            return 1
        return base * potencia(base, exp - 1)

    def soma_digitos(n):
        if n < 10:                    # caso base: um só dígito
            return n
        return n % 10 + soma_digitos(n // 10)

    def inverter(texto):
        if len(texto) <= 1:           # caso base: vazio ou um carácter
            return texto
        return inverter(texto[1:]) + texto[0]

    print(potencia(2, 10), potencia(5, 0))      # 1024 1
    print(soma_digitos(2026), soma_digitos(7))  # 10 7
    print(inverter("python"))                   # nohtyp

Em cada passo o problema fica mais pequeno (`exp - 1`, `n // 10`, `texto[1:]`) até chegar ao caso base.

## Módulo 04 · Estruturas de dados

### Exercício 13

    despesas = [("renda", 600.0), ("café", 1.2), ("luz", 45.0), ("pão", 0.8), ("gás", 20.0)]
    despesas.append(("cinema", 9.5))
    despesas.remove(("pão", 0.8))
    ordenadas = sorted(despesas, key=lambda d: d[1], reverse=True)
    print(ordenadas[:3])    # [('renda', 600.0), ('luz', 45.0), ('gás', 20.0)]
    print(despesas[-2:])    # [('gás', 20.0), ('cinema', 9.5)]
    print(despesas[::2])    # [('renda', 600.0), ('luz', 45.0), ('cinema', 9.5)]

`sorted` devolve uma lista nova, por isso `despesas` mantém a ordem original. As fatias `[-2:]` e `[::2]` também criam objetos novos.

### Exercício 14

    from collections import Counter, defaultdict

    registos = [("café", 1.2, "alimentação"), ("renda", 600.0, "casa"), ("pão", 0.8, "alimentação"),
                ("luz", 45.0, "casa"), ("cinema", 9.5, "lazer"), ("jantar", 22.0, "alimentação")]
    totais = defaultdict(float)
    for _, valor, categoria in registos:
        totais[categoria] += valor
    print(dict(totais))     # {'alimentação': 24.0, 'casa': 645.0, 'lazer': 9.5}
    contagem = Counter(categoria for _, _, categoria in registos)
    print(contagem.most_common(1))   # [('alimentação', 3)]
    maior = max(totais, key=totais.get)
    print(maior, totais[maior])      # casa 645.0

O `defaultdict(float)` começa cada categoria a `0.0`. `max(totais, key=totais.get)` percorre as chaves e compara pelo valor associado.

### Exercício 15

    despesas = [{"descricao": "café", "valor": 1.2, "categoria": "alimentação"},
                {"descricao": "renda", "valor": 600.0, "categoria": "casa"},
                {"descricao": "pão", "valor": 0.8, "categoria": "alimentação"},
                {"descricao": "luz", "valor": 45.0, "categoria": "casa"},
                {"descricao": "cinema", "valor": 9.5, "categoria": "lazer"}]
    print([d["descricao"] for d in despesas if d["valor"] < 10])     # ['café', 'pão', 'cinema']
    print({d["descricao"]: d["valor"] for d in despesas})
    # {'café': 1.2, 'renda': 600.0, 'pão': 0.8, 'luz': 45.0, 'cinema': 9.5}
    print(sorted({d["categoria"] for d in despesas}))                # ['alimentação', 'casa', 'lazer']
    top3 = sorted(despesas, key=lambda d: d["valor"], reverse=True)[:3]
    print([d["descricao"] for d in top3])                            # ['renda', 'luz', 'cinema']
    ordem = sorted(despesas, key=lambda d: (d["categoria"], -d["valor"]))
    print([d["descricao"] for d in ordem])  # ['café', 'pão', 'renda', 'luz', 'cinema']

Cada comprehension corresponde ao seu literal (`[]`, `{k: v}`, `{}`). A `key` devolve um tuplo; o sinal `-` inverte a ordem só do valor.

### Exercício 16

    import copy
    from collections import deque

    original = [{"descricao": "café", "valor": 1.2}, {"descricao": "pão", "valor": 0.8}]
    superficial = original.copy()
    superficial[0]["valor"] = 99
    print(original[0]["valor"])      # 99  (o dicionário é partilhado)
    original[0]["valor"] = 1.2
    profunda = copy.deepcopy(original)
    profunda[0]["valor"] = 99
    print(original[0]["valor"], profunda[0]["valor"])   # 1.2 99
    primeira, *resto = original
    print(primeira["descricao"], len(resto))            # café 1
    ultimas = deque(maxlen=3)
    for d in ["a", "b", "c", "d", "e"]:
        ultimas.append(d)
    print(list(ultimas))             # ['c', 'd', 'e']

`copy()` só duplica a lista exterior, pelo que os dicionários continuam partilhados; `deepcopy` duplica tudo. O `deque` com `maxlen=3` descarta os elementos mais antigos.

## Módulo 05 · Strings e ficheiros

### Exercício 17

    despesas = [("Almoço", 12.5, "Alimentação"), ("Autocarro", 1.9, "Transportes"), ("Cinema", 8.0, "Lazer")]
    larg = max(len(d) for d, _, _ in despesas)
    for desc, valor, cat in despesas:
        print(f"{desc:<{larg}} | {valor:>7.2f} € | {cat.upper()}")
    total = sum(v for _, v, _ in despesas)
    print(f"{'TOTAL':<{larg}} | {total:>7.2f} € | {12.5/total:.1%} em alimentação")
    print(f"{1234567.5:,.2f}".replace(",", " ").replace(".", ","))

Saída: as três linhas alinhadas, `TOTAL     |   22.40 € | 55.8% em alimentação` e `1 234 567,50`. A largura vem de uma variável aninhada (`{larg}`) e a conversão para o estilo português troca primeiro a vírgula e depois o ponto, por esta ordem.

### Exercício 18

    import re
    linhas = [
        "2026-11-09 | CONTINENTE MATOSINHOS | -45,30 EUR",
        "2026-11-10 | SALARIO | 1.250,00 EUR",
        "linha inválida",
        "2026-11-11 | CAFE CENTRAL | -1,20 EUR",
    ]
    padrao = re.compile(r"(?P<data>\d{4}-\d{2}-\d{2}) \| (?P<desc>.+?) \| (?P<valor>-?[\d.]+,\d{2}) EUR")
    movs = []
    for linha in linhas:
        m = padrao.fullmatch(linha)
        if not m:
            print("ignorada:", linha)
            continue
        valor = float(m["valor"].replace(".", "").replace(",", "."))
        ano, mes, dia = m["data"].split("-")
        movs.append((f"{dia}/{mes}/{ano}", m["desc"].title(), valor))
    for mov in movs:
        print(mov)
    print(sum(v for _, _, v in movs if v < 0))

Saída: `ignorada: linha inválida`, os tuplos `('09/11/2026', 'Continente Matosinhos', -45.3)`, `('10/11/2026', 'Salario', 1250.0)`, `('11/11/2026', 'Cafe Central', -1.2)` e `-46.5`. O `fullmatch` garante que a linha toda corresponde, e o `\|` escapa a barra vertical.

### Exercício 19

    import tempfile
    from pathlib import Path
    with tempfile.TemporaryDirectory() as tmp:
        ent = Path(tmp) / "despesas.csv"
        ent.write_text("descricao;valor;categoria\nAlmoço;12.50;Alimentação\nCinema;8.00;Lazer\n\nCafé;1.20;Alimentação\n", encoding="utf-8")
        totais = {}
        with open(ent, encoding="utf-8") as fh:
            next(fh)
            for linha in fh:
                linha = linha.strip()
                if not linha:
                    continue
                _, valor, cat = linha.split(";")
                totais[cat] = totais.get(cat, 0) + float(valor)
        saida = Path(tmp) / "relatorio.txt"
        with open(saida, "w", encoding="utf-8") as fh:
            for cat, t in sorted(totais.items()):
                fh.write(f"{cat:<12}{t:>8.2f}\n")
        print(saida.read_text(encoding="utf-8"), end="")

Saída: `Alimentação    13.70` e `Lazer           8.00`. O `next(fh)` consome o cabeçalho, o `strip()` seguido de teste elimina a linha vazia, e a pasta temporária é apagada no fim do `with`.

### Exercício 20

    import tempfile
    from pathlib import Path
    with tempfile.TemporaryDirectory() as tmp:
        pasta = Path(tmp)
        (pasta / "a.txt").write_text("Almoço\n", encoding="latin-1")
        (pasta / "b.txt").write_text("Café\n", encoding="latin-1")
        (pasta / "c.csv").write_text("x", encoding="latin-1")
        destino = pasta / "utf8"
        destino.mkdir()
        for ficheiro in sorted(pasta.glob("*.txt")):
            texto = ficheiro.read_text(encoding="latin-1")
            novo = destino / ficheiro.name
            novo.write_text(texto, encoding="utf-8")
            print(f"{ficheiro.name}: {ficheiro.stat().st_size} -> {novo.stat().st_size} bytes")
        print(sorted(p.name for p in destino.iterdir()))
        print((destino / "a.txt").read_text(encoding="utf-8"), end="")
        # em UTF-8, «ç» e «é» ocupam 2 bytes em vez de 1 (em Latin-1)

Saída no Windows: `a.txt: 8 -> 9 bytes`, `b.txt: 6 -> 7 bytes`, `['a.txt', 'b.txt']` e `Almoço` (em Linux os tamanhos são 1 byte menores, porque a mudança de linha é só `\n`). Cada letra acentuada passa de 1 para 2 bytes ao mudar de Latin-1 para UTF-8, e o `glob("*.txt")` deixa o `c.csv` de fora.

## Módulo 06 · Módulos e ambientes

### Exercício 21

    # utilidades.py
    def formatar_euros(valor):
        return f"{valor:.2f} €".replace(".", ",")


    def main():
        print(formatar_euros(12.5))


    if __name__ == "__main__":
        main()

    # usar.py
    import utilidades
    from utilidades import formatar_euros as eur

    print(utilidades.formatar_euros(3))
    print(eur(1234.567))

Saída de `python utilidades.py`: `12,50 €`. Saída de `python usar.py`: `3,00 €` e `1234,57 €` (sem a linha do `main`, porque o bloco `__main__` não corre na importação). No Windows, se a consola não mostrar o `€`, define `PYTHONIOENCODING=utf-8`.

### Exercício 22

    # despesas/__init__.py
    from .modelos import Despesa
    from .calculos import total_por_categoria

    # despesas/modelos.py
    from dataclasses import dataclass


    @dataclass
    class Despesa:
        descricao: str
        valor: float
        categoria: str

    # despesas/calculos.py
    from .modelos import Despesa


    def total_por_categoria(lista: list[Despesa]) -> dict[str, float]:
        totais: dict[str, float] = {}
        for d in lista:
            totais[d.categoria] = totais.get(d.categoria, 0) + d.valor
        return totais

    # despesas/__main__.py
    from . import Despesa, total_por_categoria

    dados = [Despesa("café", 1.2, "comida"), Despesa("bilhete", 1.8, "transporte"), Despesa("almoço", 9.5, "comida")]
    print(total_por_categoria(dados))

`python -m despesas` (a partir da pasta que contém `despesas/`) imprime `{'comida': 10.7, 'transporte': 1.8}`. Executar `calculos.py` como script não define um pacote-pai, e o import relativo falha com `ImportError: attempted relative import with no known parent package`.

### Exercício 23

    import subprocess
    import sys
    import tempfile
    import venv
    from pathlib import Path

    with tempfile.TemporaryDirectory() as tmp:
        pasta = Path(tmp) / ".venv"
        venv.create(pasta, with_pip=True)
        if sys.platform == "win32":
            py = pasta / "Scripts" / "python.exe"
        else:
            py = pasta / "bin" / "python"
        codigo = "import sys; print(sys.prefix != sys.base_prefix)"
        print(subprocess.run([py, "-c", codigo], capture_output=True, text=True).stdout.strip())
        lista = subprocess.run([py, "-m", "pip", "list", "--format=freeze"], capture_output=True, text=True).stdout
        print(lista.strip().splitlines())

Saída obtida (Python 3.13.0 no Windows): `True` e `['pip==24.2']`. A versão do `pip` pode variar consoante a instalação. A pasta temporária (e o venv) é apagada no fim do `with`.

### Exercício 24

    import sys
    import tomllib

    TEXTO = """
    [project]
    name = "gestor-despesas"
    version = "0.1.0"
    requires-python = ">=3.13"
    dependencies = ["requests>=2.31", "rich"]
    """

    dados = tomllib.loads(TEXTO)
    projeto = dados["project"]
    if "dependencies" not in projeto:
        sys.exit("erro: falta a chave dependencies")
    print(projeto["name"], projeto["version"])
    with open("requirements-gerado.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(projeto["dependencies"]) + "\n")
    print(open("requirements-gerado.txt", encoding="utf-8").read(), end="")

Saída: `gestor-despesas 0.1.0`, depois `requests>=2.31` e `rich`. O `tomllib.loads` converte o TOML num dicionário normal, e a lista `dependencies` tem o mesmo formato de linhas de um `requirements.txt`.

## Módulo 07 · Orientação a objetos

### Exercício 25

    class Despesa:
        iva = 0.23

        def __init__(self, descricao, valor, categoria):
            self.descricao = descricao
            self.valor = valor
            self.categoria = categoria

        def com_iva(self):
            return round(self.valor * (1 + self.iva), 2)

        def __repr__(self):
            return f"Despesa({self.descricao!r}, {self.valor}, {self.categoria!r})"

        def __eq__(self, outra):
            if not isinstance(outra, Despesa):
                return NotImplemented
            return (self.descricao, self.valor, self.categoria) == (
                outra.descricao, outra.valor, outra.categoria)

    a = Despesa("Livro", 10.0, "lazer")
    print(a.com_iva())
    print(a == Despesa("Livro", 10.0, "lazer"), a == Despesa("Livro", 12.0, "lazer"))
    print(repr(a))

O `iva` é atributo de classe, partilhado por todas as instâncias. O `__eq__` compara os atributos e devolve `NotImplemented` para tipos diferentes.

### Exercício 26

    class Despesa:
        def __init__(self, descricao, valor, categoria):
            self.descricao = descricao
            self.valor = valor
            self.categoria = categoria

        @staticmethod
        def valor_valido(valor):
            return valor > 0

        @classmethod
        def de_texto(cls, linha):
            descricao, valor, categoria = linha.split(";")
            return cls(descricao, float(valor), categoria)

        @property
        def valor(self):
            return self._valor

        @valor.setter
        def valor(self, novo):
            if not self.valor_valido(novo):
                raise ValueError("o valor tem de ser positivo")
            self._valor = novo

        def __lt__(self, outra):
            return self.valor < outra.valor

    lista = [Despesa.de_texto(t) for t in ("Jantar;22;comida", "Café;2.5;comida", "Bilhete;7;transporte")]
    print([d.descricao for d in sorted(lista)])
    try:
        Despesa("Erro", -1, "x")
    except ValueError as e:
        print("Erro:", e)

O `__init__` atribui a `self.valor`, por isso o setter valida logo na criação. `sorted` só precisa de `__lt__`.

### Exercício 27

    from abc import ABC, abstractmethod

    class Exportador(ABC):
        @abstractmethod
        def exportar(self, despesas): ...

        def cabecalho(self):
            return type(self).__name__

    class ExportadorTexto(Exportador):
        def exportar(self, despesas):
            return "\n".join(f"{d[0]}: {d[1]}" for d in despesas)

    class ExportadorCsv(Exportador):
        def exportar(self, despesas):
            return "\n".join(f"{d[0]};{d[1]}" for d in despesas)

    class ExportadorResumo:
        def exportar(self, despesas):
            return f"{len(despesas)} despesas"

    despesas = [("Café", 2.5), ("Jantar", 22)]
    try:
        Exportador()
    except TypeError as e:
        print("Erro:", e)
    for e in (ExportadorTexto(), ExportadorCsv(), ExportadorResumo()):
        print(type(e).__name__, "->", e.exportar(despesas).replace("\n", " | "))
    print(isinstance(ExportadorResumo(), Exportador))
    print(ExportadorCsv().cabecalho())

As despesas são tuplos `(descrição, valor)` para manter o exercício curto. O `ExportadorResumo` funciona no ciclo por duck typing, mas não é um `Exportador`.

### Exercício 28

    from dataclasses import dataclass, field

    @dataclass(frozen=True, order=True)
    class Despesa:
        valor: float
        descricao: str
        categoria: str = "outros"

    @dataclass
    class Orcamento:
        limite: float
        despesas: list = field(default_factory=list)

        def adicionar(self, despesa):
            self.despesas.append(despesa)

        @property
        def total(self):
            return sum(d.valor for d in self.despesas)

        def por_categoria(self):
            totais = {}
            for d in self.despesas:
                totais[d.categoria] = totais.get(d.categoria, 0) + d.valor
            return totais

        @property
        def excedido(self):
            return self.total > self.limite

    o = Orcamento(limite=100)
    o.adicionar(Despesa(2.5, "Café", "comida"))
    o.adicionar(Despesa(60, "Jantar", "comida"))
    o.adicionar(Despesa(45, "Bilhete", "transporte"))
    print(o.por_categoria())
    print(o.total, o.excedido)
    print(max(o.despesas))
    try:
        o.despesas[0].valor = 3
    except Exception as e:
        print(type(e).__name__)

Com `order=True` os campos são comparados pela ordem declarada, por isso `valor` vem primeiro. O `Orcamento` usa composição: tem despesas, não herda delas. `frozen=True` faz a atribuição levantar `FrozenInstanceError`.

## Módulo 08 · Erros e testes

### Exercício 29

    def ler_valor(texto):
        try:
            valor = float(texto.replace(",", "."))
        except ValueError:
            print(f"Valor inválido: {texto!r}")
            return None
        except AttributeError:
            print(f"Não é texto: {texto!r}")
            return None
        else:
            if valor <= 0:
                print("O valor tem de ser positivo")
                return None
            return valor
        finally:
            print("-- fim de leitura --")

    for entrada in ["12,50", "abc", "-3", None]:
        print(ler_valor(entrada))

Resultado: `12.5`, `None` (com «Valor inválido: 'abc'»), `None` (valor positivo exigido) e `None` («Não é texto: None»), cada um seguido de `-- fim de leitura --`. `None.replace` levanta `AttributeError`, e o `finally` corre sempre, mesmo com `return` nos outros blocos.

### Exercício 30

    import json

    class ErroDespesa(Exception):
        """Base dos erros do gestor."""

    class ErroFicheiro(ErroDespesa):
        """Dados de despesas ilegíveis ou incompletos."""

    def carregar_despesas(texto):
        try:
            dados = json.loads(texto)
        except json.JSONDecodeError as e:
            raise ErroFicheiro("JSON inválido") from e
        try:
            return [(d["descricao"], float(d["valor"])) for d in dados]
        except (KeyError, TypeError, ValueError) as e:
            raise ErroFicheiro("despesa mal formada") from e

    casos = ['[{"descricao": "Pão", "valor": 1.5}]', '{mau', '[{"descricao": "Pão"}]']
    for texto in casos:
        try:
            print(carregar_despesas(texto))
        except ErroFicheiro as e:
            print(f"{e} (causa: {type(e.__cause__).__name__})")

Resultado: `[('Pão', 1.5)]`, `JSON inválido (causa: JSONDecodeError)` e `despesa mal formada (causa: KeyError)`. O `from e` preserva a causa original em `__cause__` e o chamador só precisa de apanhar `ErroFicheiro`.

### Exercício 31

    import logging

    logging.basicConfig(level=logging.DEBUG, format="%(levelname)s %(name)s: %(message)s")
    log = logging.getLogger("despesas")

    def dividir_conta(total, pessoas):
        log.debug("dividir_conta(total=%s, pessoas=%s)", total, pessoas)
        try:
            parte = total / pessoas
        except ZeroDivisionError:
            log.exception("nenhuma pessoa para dividir a conta")
            return None
        log.info("cada pessoa paga %.2f", parte)
        return parte

    dividir_conta(90, 4)
    dividir_conta(90, 0)

Resultado: `DEBUG despesas: dividir_conta(total=90, pessoas=4)`, `INFO despesas: cada pessoa paga 22.50`, depois o `DEBUG` da segunda chamada e `ERROR despesas: nenhuma pessoa para dividir a conta` seguido do traceback de `ZeroDivisionError` (escrito no stderr). `log.exception` só deve ser chamado dentro de um `except`.

### Exercício 32

    python -m venv .venv
    .venv\Scripts\activate
    pip install pytest

    # test_resumo.py
    import pytest
    from resumo import total_por_categoria, exportar

    @pytest.fixture
    def despesas():
        return [("casa", 600), ("comida", 20), ("comida", 5.5)]

    def test_total_por_categoria(despesas):
        assert total_por_categoria(despesas) == {"casa": 600, "comida": 25.5}

    @pytest.mark.parametrize(
        "entrada, esperado",
        [
            ([], {}),
            ([("lazer", 10)], {"lazer": 10}),
            ([("lazer", 10), ("lazer", 5)], {"lazer": 15}),
        ],
    )
    def test_casos(entrada, esperado):
        assert total_por_categoria(entrada) == esperado

    def test_valor_negativo():
        with pytest.raises(ValueError, match="negativo"):
            total_por_categoria([("casa", -1)])

    def test_exportar(despesas, tmp_path):
        ficheiro = tmp_path / "resumo.csv"
        exportar(total_por_categoria(despesas), ficheiro)
        assert ficheiro.read_text(encoding="utf-8") == "casa;600.00\ncomida;25.50"

Resultado: `6 passed` (1 + 3 parametrizados + 1 + 1). A parametrização gera um teste por linha, e `tmp_path` isola o ficheiro numa pasta temporária.

## Módulo 09 · Python idiomático

### Exercício 33

    def acima_de(despesas, minimo):
        for d in despesas:
            if d.valor > minimo:
                yield d.descricao

    g = acima_de(despesas, 5)
    print(next(g))    # Metro
    print(list(g))    # ['Almoço', 'Livro']
    print(sum(d.valor for d in despesas if d.categoria == "comida"))   # 10.7

O gerador retoma onde parou, por isso o `list(g)` só traz o que falta. A expressão geradora evita criar uma lista só para somar.

### Exercício 34

    from itertools import groupby, accumulate, pairwise

    def totais_por_categoria(ds):
        ordenadas = sorted(ds, key=lambda d: d.categoria)
        return {c: round(sum(d.valor for d in grupo), 2)
                for c, grupo in groupby(ordenadas, key=lambda d: d.categoria)}

    print(totais_por_categoria(despesas))
    # {'comida': 10.7, 'lazer': 22.0, 'transporte': 40.0}

    por_data = sorted(despesas, key=lambda d: d.data)
    print([round(t, 2) for t in accumulate(d.valor for d in por_data)])
    # [1.2, 41.2, 50.7, 72.7]
    print([b.valor - a.valor for a, b in pairwise(por_data)])
    # [38.8, -30.5, 12.5]

`groupby` só junta elementos consecutivos, daí o `sorted` com a mesma chave. O `accumulate` recebe uma expressão geradora, sem listas intermédias.

### Exercício 35

    import functools

    def tentar_novamente(tentativas):
        def decorador(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                for n in range(1, tentativas + 1):
                    try:
                        return func(*args, **kwargs)
                    except ValueError:
                        if n == tentativas:
                            raise
                        print(f"tentativa {n} falhou")
            return wrapper
        return decorador

    estado = {"n": 0}

    @tentar_novamente(3)
    def ler_valor(texto):
        """Converte texto em float."""
        estado["n"] += 1
        if estado["n"] < 3:
            raise ValueError("ainda não")
        return float(texto)

    print(ler_valor("4.5"), ler_valor.__name__, ler_valor.__doc__)
    # tentativa 1 falhou / tentativa 2 falhou / 4.5 ler_valor Converte texto em float.

O decorador com argumentos tem três níveis: argumentos, função, `wrapper`. O `raise` sem argumentos relança o erro original na última tentativa; com `n` a começar em `-10`, a função nunca funciona e o `ValueError` chega ao chamador.

### Exercício 36

    import time
    from contextlib import contextmanager
    from typing import Iterable, Iterator, Protocol, TypedDict

    class TemValor(Protocol):
        valor: float

    class Resumo(TypedDict):
        total: float
        n: int

    def resumir(itens: Iterable[TemValor]) -> Resumo:
        lista = list(itens)
        return {"total": round(sum(i.valor for i in lista), 2), "n": len(lista)}

    @contextmanager
    def medir(etiqueta: str, destino: dict[str, float]) -> Iterator[None]:
        ini = time.perf_counter()
        try:
            yield
        finally:
            destino[etiqueta] = time.perf_counter() - ini

    tempos: dict[str, float] = {}
    with medir("resumo", tempos):
        print(resumir(despesas))    # {'total': 72.7, 'n': 4}
    print(list(tempos))             # ['resumo']

O `finally` garante o registo do tempo mesmo com exceção (testado com um `RuntimeError`). `Despesa` serve como `TemValor` sem herdar de nada. O mypy não foi executado; as anotações não afetam a execução.

## Módulo 10 · Biblioteca padrão e ecossistema

### Exercício 37

    import json, tempfile
    from datetime import date
    from pathlib import Path

    def guardar(despesas, caminho):
        dados = [{**d, "data": d["data"].isoformat()} for d in despesas]
        caminho.parent.mkdir(parents=True, exist_ok=True)
        caminho.write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")

    def carregar(caminho):
        if not caminho.exists():
            return []
        dados = json.loads(caminho.read_text(encoding="utf-8"))
        return [{**d, "data": date.fromisoformat(d["data"])} for d in dados]

    destino = Path(tempfile.mkdtemp()) / "dados" / "despesas.json"
    original = [
        {"descricao": "Café", "valor": 1.2, "categoria": "comida", "data": date(2026, 11, 9)},
        {"descricao": "Metro", "valor": 1.8, "categoria": "transporte", "data": date(2026, 11, 10)},
    ]
    print(carregar(destino))
    guardar(original, destino)
    print(carregar(destino) == original)
    print(destino.suffix, destino.parent.name)

`write_text`/`read_text` com UTF-8 e `isoformat()`/`fromisoformat()` fazem a ida e volta; `mkdir(parents=True, exist_ok=True)` cria as pastas. O resultado `True` confirma que nada se perdeu.

### Exercício 38

    import csv, io
    from collections import defaultdict
    from datetime import datetime

    TEXTO = """descricao,valor,categoria,data
    Café,1.20,comida,09/11/2026
    Metro,1.80,transporte,10/11/2026
    Jantar,18.50,comida,02/12/2026
    """

    def totais_por_mes(ficheiro):
        totais = defaultdict(float)
        for linha in csv.DictReader(ficheiro):
            data = datetime.strptime(linha["data"], "%d/%m/%Y").date()
            totais[f"{data.year}-{data.month:02d}"] += float(linha["valor"])
        return dict(totais)

    for mes, total in sorted(totais_por_mes(io.StringIO(TEXTO)).items()):
        print(mes, f"{total:.2f}")

`DictReader` lê as linhas como dicionários, `strptime` interpreta `dd/mm/aaaa` e um `defaultdict(float)` acumula por chave `aaaa-mm`. Saída: `2026-11 3.00` e `2026-12 18.50`.

### Exercício 39

    import argparse, sqlite3

    def construir_parser():
        p = argparse.ArgumentParser(prog="despesas")
        sub = p.add_subparsers(dest="comando", required=True)
        add = sub.add_parser("add")
        add.add_argument("descricao")
        add.add_argument("valor", type=float)
        add.add_argument("-c", "--categoria", default="geral")
        sub.add_parser("total")
        return p

    def executar(argv, con):
        args = construir_parser().parse_args(argv)
        if args.comando == "add":
            with con:
                con.execute("INSERT INTO despesa (descricao, valor, categoria) VALUES (?, ?, ?)",
                            (args.descricao, args.valor, args.categoria))
            return "registado"
        total = con.execute("SELECT COALESCE(SUM(valor), 0) FROM despesa").fetchone()[0]
        return f"total: {total:.2f}"

    con = sqlite3.connect(":memory:")
    con.execute("CREATE TABLE despesa (id INTEGER PRIMARY KEY, descricao TEXT, valor REAL, categoria TEXT)")
    print(executar(["total"], con))
    print(executar(["add", "Café", "1.2", "-c", "comida"], con))
    print(executar(["add", "Jantar", "18.5"], con))
    print(executar(["total"], con))
    try:
        executar(["add", "x", "abc"], con)
    except SystemExit as e:
        print("código", e.code)

O código de saída 2 vem do `argparse` ao rejeitar `abc` como `float`. Os valores seguem como parâmetros `?`, e `COALESCE` devolve 0 numa tabela vazia. Saída: `total: 0.00`, `registado`, `registado`, `total: 19.70`.

### Exercício 40

    import asyncio, time

    async def consultar(nome, atraso, sem):
        async with sem:
            await asyncio.sleep(atraso)
            return f"{nome}: ok"

    async def main():
        sem = asyncio.Semaphore(2)
        tarefas = [consultar(f"banco{i}", 0.3, sem) for i in range(4)]
        t = time.perf_counter()
        print(await asyncio.gather(*tarefas))
        print(f"{time.perf_counter() - t:.1f}s")
        try:
            async with asyncio.timeout(0.2):
                await consultar("lento", 1, asyncio.Semaphore(1))
        except TimeoutError:
            print("timeout")

    asyncio.run(main())

O semáforo deixa correr 2 consultas de cada vez, logo 4 consultas de 0,3 s demoram cerca de 0,6 s. `asyncio.timeout` levanta `TimeoutError` quando o bloco excede o tempo.

## Projeto final · Exercício 41

O projeto é aberto, por isso não há uma única solução. Usa esta lista para te avaliares.

| Critério | Como confirmar |
|---|---|
| Modelo validado | `Despesa(descricao="", valor=-1, ...)` levanta a tua exceção |
| Persistência | Fechar e reabrir o programa mantém as despesas; acentos corretos |
| CLI | `python -m gestor --help` mostra os quatro comandos |
| Filtros e total | `listar --categoria Alimentação` e `total` coincidem com a soma feita à mão |
| Exportação | O CSV abre no Excel/editor com os acentos certos |
| Idiomático | Existe um gerador e um decorador ou context manager |
| Tipos | Funções públicas anotadas |
| Ambiente | Um colega recria o ambiente só com o ficheiro de dependências |
| Testes | `pytest` passa; há testes de erro e de ficheiros temporários |

**DICA:** se algum critério falhar, volta à aula do módulo correspondente (modelo: 07, persistência: 05 e 10, testes: 08, idiomático: 09, ambiente: 06).
