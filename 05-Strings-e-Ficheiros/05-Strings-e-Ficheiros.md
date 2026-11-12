# 05 Strings e ficheiros

## Strings são sequências imutáveis de texto

Uma `str` é uma sequência de **carateres Unicode**. Indexa-se e fatia-se como uma lista, mas **não se altera no sítio**: todos os métodos devolvem uma string nova.

    nome = "Mercado"
    print(nome[0], nome[-1], nome[1:4], nome[::-1])    # M o erc odacreM
    nome[0] = "x"    # TypeError: 'str' object does not support item assignment

## Métodos de str mais usados

    texto = "  Almoço no Café Central  "
    texto.strip()                        # 'Almoço no Café Central'
    texto.strip().upper()                # 'ALMOÇO NO CAFÉ CENTRAL'
    texto.strip().title()                # 'Almoço No Café Central'
    texto.strip().replace("Café", "Restaurante")
    "pão,leite,ovos".split(",")          # ['pão', 'leite', 'ovos']
    "um dois  três".split()              # ['um', 'dois', 'três'] (separa por qualquer espaço)
    " | ".join(["pão", "leite", "ovos"]) # 'pão | leite | ovos'
    "2026-11-09".split("-")              # ['2026', '11', '09']

| Método | O que faz |
|---|---|
| `strip()`, `lstrip()`, `rstrip()` | Remove espaços (ou os carateres indicados) nas pontas |
| `lower()`, `upper()`, `title()`, `capitalize()` | Muda a capitalização |
| `split(sep)`, `splitlines()` | Parte em lista |
| `sep.join(lista)` | Junta uma lista de strings |
| `startswith()`, `endswith()` | Testa o início ou o fim |
| `find(x)` / `index(x)` | Posição de `x`; `find` dá `-1` se não existir, `index` levanta `ValueError` |
| `count(x)` | Quantas vezes `x` aparece |
| `replace(a, b)` | Substitui todas as ocorrências |
| `isdigit()`, `isalpha()` | Testa o conteúdo (`"4.2".isdigit()` é `False`) |
| `zfill(n)`, `ljust`, `rjust`, `center` | Preenche até uma largura |
| `partition(sep)`, `removeprefix()`, `removesuffix()` | Divide numa vez só; remove prefixo ou sufixo |

**DICA:** para juntar muitos pedaços, constrói uma lista e usa `"".join(lista)`. É mais claro e mais rápido do que somar strings num ciclo.

**ATENÇÃO:** `"Café".index("z")` levanta `ValueError: substring not found`. Quando a ausência é normal, usa `find` ou o operador `in`.

## f-strings e especificadores de formato

Uma f-string avalia expressões entre chavetas. Depois de `:` vem o **especificador de formato**: `[alinhamento][largura][,][.precisão][tipo]`.

    descricao, valor = "Almoço", 12.5
    f"{descricao}: {valor} €"            # 'Almoço: 12.5 €'
    f"{valor:.2f}"                       # '12.50'
    f"{1234567.891:,.2f}"                # '1,234,567.89'
    f"{valor:>10.2f}|{valor:<10.2f}|{valor:^10.2f}|"
    f"{42:05d}"                          # '00042'
    f"{0.256:.1%}"                       # '25.6%'
    f"{descricao:*^15}"                  # '****Almoço*****'
    f"{valor=}"                          # 'valor=12.5' (útil para depurar)

| Especificador | Significado |
|---|---|
| `<`, `>`, `^` | Alinha à esquerda, à direita, ao centro |
| `10` | Largura mínima de 10 carateres |
| `.2f` | Float com 2 casas decimais |
| `,` | Separador de milhares |
| `%` | Multiplica por 100 e acrescenta `%` |
| `05d` | Inteiro com zeros à esquerda |

A largura também pode vir de uma variável, e as datas aceitam códigos de `strftime`:

    from datetime import date
    largura = 12
    f"{descricao:>{largura}}"            # '      Almoço'
    f"{date(2026, 11, 9):%d/%m/%Y}"      # '09/11/2026'

Uma tabela alinhada para o gestor de despesas:

    despesas = [("Almoço", 12.5, "Alimentação"), ("Autocarro", 1.9, "Transportes"), ("Cinema", 8.0, "Lazer")]
    print(f"{'Descrição':<12}{'Valor':>8}  Categoria")
    for desc, val, cat in despesas:
        print(f"{desc:<12}{val:>8.2f}  {cat}")
    print(f"{'Total':<12}{sum(v for _, v, _ in despesas):>8.2f}")

Saída:

    Descrição      Valor  Categoria
    Almoço         12.50  Alimentação
    Autocarro       1.90  Transportes
    Cinema          8.00  Lazer
    Total          22.40

### str.format e o operador %

`str.format` usa o mesmo mini-idioma, mas com a string e os valores separados. É útil quando o modelo vem de fora (ficheiro, base de dados); em código novo, prefere f-strings:

    "{} custou {:.2f} €".format("Almoço", 12.5)      # 'Almoço custou 12.50 €'
    "{0} {1} {0}".format("a", "b")                   # 'a b a'
    "{nome} tem {n}".format(nome="Rita", n=3)        # 'Rita tem 3'
    "{d} {v:.1f}".format(**{"d": "Café", "v": 1.2})  # 'Café 1.2'

## Unicode e encoding

O Python 3 separa dois conceitos:

- `str`: texto, uma sequência de **pontos de código** Unicode (`ord("é")` é `233`).
- `bytes`: dados em bruto. Passar de um ao outro exige um **encoding**: `str.encode()` e `bytes.decode()`.

    "Almoço €".encode("utf-8")          # b'Almo\xc3\xa7o \xe2\x82\xac'  (11 bytes para 8 carateres)
    b"Almo\xc3\xa7o".decode("utf-8")    # 'Almoço'
    "Almoço".encode("latin-1")          # b'Almo\xe7o'  (1 byte por letra acentuada)
    "€".encode("latin-1")               # UnicodeEncodeError: ... ordinal not in range(256)
    "Almoço".encode("utf-8").decode("ascii")   # UnicodeDecodeError: 'ascii' codec can't decode byte 0xc3
    "Almoço".encode("utf-8").decode("latin-1") # 'AlmoÃ§o'  (o clássico texto «estragado»)

O **UTF-8** é o encoding que deves usar por omissão: cobre todo o Unicode e é o padrão da web. Quando um acento aparece como `Ã§` ou `Ã©`, houve bytes UTF-8 lidos como Latin-1 ou cp1252. Quando aparece `�`, houve bytes que não eram válidos no encoding indicado.

O parâmetro `errors` controla o que acontece perante carateres impossíveis:

    "Almoço €".encode("ascii", errors="replace")   # b'Almo?o ?'
    "Almoço".encode("ascii", errors="ignore")      # b'Almoo'  (perde dados em silêncio)

Há ainda uma subtileza: o mesmo texto pode ter duas representações. `"café"` (4 carateres) e `"cafe\u0301"` (5, com acento combinado) parecem iguais mas `==` dá `False`. `unicodedata.normalize("NFC", texto)` uniformiza-os.

### Acentos no Windows

No Windows, o encoding **por omissão** de `open()` é o da localização do sistema, tipicamente `cp1252` em Portugal (`locale.getencoding()` mostra-o). Um ficheiro escrito sem `encoding` no Windows e lido noutra máquina (ou no Linux) pode ficar com os acentos trocados. Na consola, `sys.stdout.encoding` indica como o `print` converte o texto: se vires erros do tipo `UnicodeEncodeError` ao imprimir, define `PYTHONIOENCODING=utf-8` ou usa o terminal moderno do Windows.

**ATENÇÃO:** escreve **sempre** `encoding="utf-8"` em `open()`, `read_text()` e `write_text()`. O Python 3.13 continua a usar o encoding da localização quando o omites (o PEP 686 propõe mudar isso em versões futuras). Ser explícito torna o código igual em qualquer sistema.

## Expressões regulares com re

Uma **expressão regular** descreve um padrão de texto. Escreve-as em strings **cruas** (`r"..."`), para que a `\` não seja interpretada pelo Python antes de chegar ao módulo `re`.

    import re
    t = "Almoço 12,50€ em 2026-11-09; Cinema 8€ em 2026-11-10"
    re.search(r"\d{4}-\d{2}-\d{2}", t)          # <re.Match object; span=(17, 27), match='2026-11-09'>
    re.search(r"\d{4}-\d{2}-\d{2}", t).group()  # '2026-11-09'
    re.findall(r"\d{4}-\d{2}-\d{2}", t)         # ['2026-11-09', '2026-11-10']
    re.findall(r"(\d+(?:,\d+)?)€", t)           # ['12,50', '8']  (devolve só o grupo)
    re.sub(r"(\d{4})-(\d{2})-(\d{2})", r"\3/\2/\1", t)   # datas em dd/mm/aaaa
    re.split(r"[;,]\s*", "a, b;c")              # ['a', 'b', 'c']

| Elemento | Significado |
|---|---|
| `\d`, `\w`, `\s` | Dígito, letra/dígito/`_`, espaço (em Unicode, `\w` apanha `ã` e `é`) |
| `.` | Qualquer carater, exceto mudança de linha |
| `*`, `+`, `?` | 0 ou mais, 1 ou mais, 0 ou 1 |
| `{n}`, `{n,m}` | Exatamente `n`; entre `n` e `m` |
| `[abc]`, `[^abc]` | Um dos carateres; qualquer carater **menos** esses |
| `( )`, `(?: )`, `(?P<nome> )` | Grupo com captura; sem captura; com nome |

As funções principais:

| Função | Quando usar |
|---|---|
| `re.search` | Procura o padrão em qualquer ponto; devolve um `Match` ou `None` |
| `re.match` | Só no **início** da string |
| `re.fullmatch` | A string **inteira** tem de corresponder |
| `re.findall` | Lista de todas as ocorrências |
| `re.finditer` | Iterador de objetos `Match` |
| `re.sub` | Substitui (aceita `\1` e funções) |

Os grupos com nome tornam o código legível, e `re.compile` evita repetir o padrão:

    m = re.search(r"(?P<ano>\d{4})-(?P<mes>\d{2})-(?P<dia>\d{2})", t)
    m.group("ano"), m.groupdict(), m.span()
    # ('2026', {'ano': '2026', 'mes': '11', 'dia': '09'}, (17, 27))

    pad = re.compile(r"(?P<desc>[^\W\d]+) (?P<valor>\d+(?:,\d+)?)€")
    for x in pad.finditer(t):
        print(x["desc"], float(x["valor"].replace(",", ".")))
    # Almoço 12.5
    # Cinema 8.0

**ATENÇÃO:** `*` e `+` são **gananciosos**: `re.findall(r"a.*c", "abcabc")` devolve `['abcabc']`. Com `*?` ou `+?` ficam mínimos: `re.findall(r"a.*?c", "abcabc")` dá `['abc', 'abc']`.

**ATENÇÃO:** `re.match(r"\d+", "abc 12")` devolve `None`, porque `match` só olha para o início. Quase sempre queres `search` ou `fullmatch`.

**DICA:** para tarefas simples (`startswith`, `split`, `replace`) os métodos de `str` são mais claros do que uma regex. Usa `re` quando o padrão tem variantes.

## Ler e escrever ficheiros

A forma correta é o gestor de contexto `with`, que **fecha o ficheiro** mesmo que ocorra um erro:

    from pathlib import Path
    caminho = Path("despesas.csv")

    with open(caminho, "w", encoding="utf-8") as fh:
        fh.write("descricao;valor;categoria\n")
        fh.write("Almoço;12.50;Alimentação\n")
        print("Café;1.20;Alimentação", file=fh)
        fh.writelines(["Cinema;8.00;Lazer\n", "Autocarro;1.90;Transportes\n"])

| Modo | Efeito |
|---|---|
| `"r"` | Leitura (omissão); erro se o ficheiro não existir |
| `"w"` | Escrita; **apaga** o conteúdo anterior |
| `"a"` | Acrescenta ao fim |
| `"x"` | Cria; `FileExistsError` se já existir |
| `"b"` | Binário (`"rb"`, `"wb"`): lê e escreve `bytes`, sem encoding |
| `"+"` | Leitura e escrita |

**ATENÇÃO:** `"w"` apaga sem avisar. Se o ficheiro não deve ser substituído, usa `"x"` ou `"a"`.

Para ler há várias formas. A melhor para ficheiros grandes é iterar **linha a linha**, porque só uma linha está em memória de cada vez:

    with open(caminho, encoding="utf-8") as fh:
        for n, linha in enumerate(fh, start=1):
            print(n, linha.rstrip("\n"))

    with open(caminho, encoding="utf-8") as fh:
        print(repr(fh.read(10)))        # 'descricao;'  (10 carateres)
        # fh.read() lê tudo; fh.readline() lê uma linha; fh.readlines() devolve a lista de linhas

Somar a coluna dos valores, saltando o cabeçalho:

    total = 0.0
    with open(caminho, encoding="utf-8") as fh:
        next(fh)                          # salta o cabeçalho
        for linha in fh:
            desc, valor, cat = linha.rstrip("\n").split(";")
            total += float(valor)
    print(f"{total:.2f}")                 # 23.60 (com as 4 linhas acima)

**NOTA:** no modo texto, `"\n"` é convertido para a mudança de linha do sistema: no Windows, `\r\n` fica gravado em disco. Ao ler, volta sempre a `"\n"`. Em modo `"rb"` vês os bytes reais (`b'...categoria\r\nAlm...'`).

Se o ficheiro não existir, `open` levanta `FileNotFoundError`; se o encoding estiver errado, `UnicodeDecodeError`. O tratamento de erros fica para o módulo 08. Para ler com `utf-8-sig` ficheiros vindos do Excel, que começam com um BOM (`b'\xef\xbb\xbf'`), usa `encoding="utf-8-sig"`.

## pathlib: caminhos como objetos

O módulo `pathlib` trata caminhos como objetos, com o operador `/` para os juntar, e funciona igual no Windows e no Linux (sem te preocupares com `\` ou `/`):

    from pathlib import Path
    base = Path("dados")
    f = base / "despesas.csv"           # dados\despesas.csv no Windows
    f.name, f.stem, f.suffix, f.parent.name   # ('despesas.csv', 'despesas', '.csv', 'dados')
    f.exists(), f.is_file(), base.is_dir()
    f.with_suffix(".txt").name          # 'despesas.txt'
    base.mkdir(exist_ok=True)
    sorted(p.name for p in base.glob("*.csv"))

Para ficheiros pequenos, os atalhos poupam o `with`:

    nota = base / "nota.txt"
    nota.write_text("Olá, mundo\n", encoding="utf-8")
    print(nota.read_text(encoding="utf-8"), end="")
    nota.stat().st_size                 # tamanho em bytes
    nota.unlink()                       # apaga o ficheiro

## Exercícios

**PRATICAR:** exercícios 17 a 20 do módulo 11 (formatação com f-strings, expressões regulares, ler e escrever ficheiros, pathlib e encoding).

## Fontes oficiais

- [Métodos de str](https://docs.python.org/3/library/stdtypes.html#string-methods)
- [Mini-linguagem de formatação](https://docs.python.org/3/library/string.html#formatspec)
- [HOWTO Unicode](https://docs.python.org/3/howto/unicode.html)
- [Módulo re](https://docs.python.org/3/library/re.html) e [HOWTO de expressões regulares](https://docs.python.org/3/howto/regex.html)
- [Ler e escrever ficheiros (tutorial)](https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files)
- [open()](https://docs.python.org/3/library/functions.html#open)
- [Módulo pathlib](https://docs.python.org/3/library/pathlib.html)
- [PEP 686: UTF-8 por omissão](https://peps.python.org/pep-0686/)
