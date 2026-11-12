# 11 Exercícios práticos

Quarenta exercícios, quatro por módulo (01 a 10), mais um projeto final. Cada aula indica com **PRATICAR** os exercícios que lhe correspondem. Resolve-os num ficheiro `.py` teu e só consultas o módulo 13 depois de tentares.

## Módulo 01 · Fundamentos

### Exercício 1 · Ficha de uma despesa

**Nível:** Iniciante

Cria as variáveis `descricao` (`"Almoço"`), `valor` (`8.5`), `categoria` (`"Alimentação"`), `pago` (`True`) e `nota` (`None`). Imprime, numa só linha por variável, o nome do tipo de cada uma no formato `descricao: str` (usa `type(...).__name__`).

### Exercício 2 · Total com IVA

**Nível:** Iniciante

Uma despesa custa `45.90` sem IVA e a taxa é `0.23`. Calcula o valor do IVA e o total, arredondados a 2 casas decimais. Calcula ainda, com `divmod`, quantos euros inteiros e quantos cêntimos tem o total (por exemplo, `56.46` dá `56` euros e `46` cêntimos). Imprime os três resultados.

### Exercício 3 · Recibo formatado

**Nível:** Intermédio

Parte de `descricao = "Café"`, `quantidade = 3` e `preco = 1.2`, valores já com o tipo certo. Com uma única f-string por linha, imprime um recibo em que a descrição ocupa 10 posições alinhada à esquerda, a quantidade 3 posições alinhada à direita e o subtotal tem 2 casas decimais com 8 posições alinhado à direita. Imprime depois a percentagem que este subtotal representa de um orçamento de `20.0`, com uma casa decimal.

### Exercício 4 · Cópias, referências e erros

**Nível:** Intermédio

Parte de `despesas = [10.0, 20.0]` e `copia = despesas`. Acrescenta `5.0` a `copia` e mostra que `despesas` também mudou. Cria depois uma cópia verdadeiramente independente (`independente`), acrescenta-lhe `99.0` e mostra que `despesas` não mudou. Por fim, converte a resposta `"12,50"` (texto com vírgula decimal) para `float`, sem deixar o programa falhar: troca a vírgula por ponto com `.replace(",", ".")` antes de converter.

## Módulo 02 · Controlo de fluxo

### Exercício 5 · Classificar uma despesa

**Nível:** Iniciante

Tens `valor = 75.0` e `categoria = "Comida"`. Escreve um `if/elif/else` que imprima `Inválida` se o valor for menor ou igual a zero **ou** a categoria estiver vazia; caso contrário, `Pequena` (menos de 20), `Média` (de 20 até menos de 100) ou `Grande` (100 ou mais).

### Exercício 6 · Primeira despesa acima do limite

**Nível:** Intermédio

Dada a lista `valores = [12.5, 80, 3.2, 145, 45]` e `limite = 100`, percorre-a com `for`, somando os valores. Ao encontrar o primeiro acima do limite, imprime-o e sai do ciclo. Se nenhum passar o limite, imprime `Nenhuma acima do limite` (usa o `else` do ciclo). No fim imprime o total acumulado. Depois, com um `while`, calcula quantos meses são precisos para um gasto de 30 por mês atingir ou ultrapassar um orçamento de 100, e imprime os meses e o gasto final.

### Exercício 7 · Relatório numerado

**Nível:** Intermédio

Com `descs = ["Café", "Renda", "Cinema", "Livro"]` e `vals = [1.2, 800, 9.5, 15]`, usa `enumerate` e `zip` para imprimir uma linha por despesa, numerada a partir de 1, com a descrição alinhada à esquerda (8 caracteres) e o valor alinhado à direita com 2 casas decimais e o símbolo €. No fim imprime o total.

### Exercício 8 · Comandos e estados

**Nível:** Avançado

Percorre `["listar", "novo", "sair", "xpto", "ajuda"]` e, com `match/case`, imprime `A listar` para `listar`, `A adicionar` para `novo` ou `adicionar`, `Adeus` para `sair` e `Comando desconhecido: <comando>` para os restantes. Depois, para os valores 5 e 60, usa uma expressão condicional para obter o estado `alta` (valor igual ou superior a 50) ou `normal` e imprime-o junto do valor.

## Módulo 03 · Funções

### Exercício 9 · Registar uma despesa com parâmetros bem desenhados

**Nível:** Iniciante

Escreve `nova_despesa(descricao, valor, /, *, categoria="Outros", tags=None)` que devolve um tuplo `(descricao, valor, categoria, tags)`. `descricao` e `valor` só podem ser passados por posição; `categoria` só por nome. `tags` é uma lista que, quando não é dada, deve ser uma lista **nova** em cada chamada (evita a armadilha do default mutável); a função acrescenta-lhe sempre o texto `"novo"`. Mostra duas chamadas válidas e uma que provoque `TypeError`.

### Exercício 10 · Resumo flexível com `*args` e `**kwargs`

**Nível:** Intermédio

Escreve `resumo(*valores, **opcoes)`. Sem valores, devolve `"sem valores"`. Caso contrário devolve um texto como `3 despesas, total 35.50 EUR`. A opção `moeda` (por omissão `"EUR"`) muda a moeda; se `media=True`, acrescenta `, média X.XX`. Testa também a chamada com desempacotamento: `resumo(*[1, 2, 3], **{"media": True})`.

### Exercício 11 · Acumulador por categoria (closure)

**Nível:** Intermédio

Escreve `criar_contador_categoria(categoria)` que devolve uma função `adicionar(valor)`. Cada chamada soma `valor` ao total dessa categoria e devolve um texto como `Comida: 15.50`. Cada contador deve ter o seu total independente (usa `nonlocal`). Cria contadores para `"Comida"` e `"Casa"` e confirma que não se misturam.

### Exercício 12 · Recursão

**Nível:** Avançado

Sem usar `**`, `pow` nem ciclos, escreve recursivamente: (a) `potencia(base, exp)` para expoentes inteiros não negativos; (b) `soma_digitos(n)` que soma os dígitos de um inteiro não negativo (`2026` dá `10`); (c) `inverter(texto)` que inverte uma string. Identifica o caso base de cada uma.

## Módulo 04 · Estruturas de dados

### Exercício 13 · Lista de despesas e slicing

**Nível:** Iniciante

Parte de `despesas = [("renda", 600.0), ("café", 1.2), ("luz", 45.0), ("pão", 0.8), ("gás", 20.0)]`. Acrescenta `("cinema", 9.5)`, remove `("pão", 0.8)`, e mostra: as 3 despesas mais caras (sem alterar a lista original), as duas últimas despesas, e uma despesa sim, uma não (a partir da primeira).

### Exercício 14 · Totais por categoria

**Nível:** Intermédio

Dada uma lista de tuplos `(descricao, valor, categoria)`, calcula o total gasto em cada categoria com `defaultdict`, mostra a categoria com mais despesas com `Counter.most_common` e a categoria com o maior total (sugestão: `max` com `key`). Usa desempacotamento no ciclo.

### Exercício 15 · Comprehensions e sorted

**Nível:** Intermédio

Dada uma lista de dicionários com `descricao`, `valor` e `categoria`, usa comprehensions para obter: a lista das descrições com valor inferior a 10; um dicionário `descricao -> valor`; o conjunto das categorias (mostra-o ordenado). Depois, com `sorted` e `key`, obtém as 3 descrições mais caras e a ordem por categoria A-Z e, dentro de cada categoria, valor decrescente.

### Exercício 16 · Cópias, desempacotamento e deque

**Nível:** Avançado

Tens `original = [{"descricao": "café", "valor": 1.2}, {"descricao": "pão", "valor": 0.8}]`. Faz uma cópia superficial, altera o valor do primeiro dicionário na cópia e mostra que o original também mudou. Repõe o valor e repete com `copy.deepcopy`, mostrando que agora o original fica intacto. Separa o primeiro elemento do resto com desempacotamento (`*`). Por fim, percorre `["a", "b", "c", "d", "e"]` com um `deque(maxlen=3)` e mostra os elementos retidos.

## Módulo 05 · Strings e ficheiros

### Exercício 17 · Tabela de despesas formatada

**Nível:** Iniciante

Tens a lista `despesas = [("Almoço", 12.5, "Alimentação"), ("Autocarro", 1.9, "Transportes"), ("Cinema", 8.0, "Lazer")]`. Imprime uma linha por despesa no formato `descrição | valor € | CATEGORIA`, com a descrição alinhada à esquerda numa coluna cuja largura é a da descrição mais comprida (calculada, não escrita à mão), o valor alinhado à direita com 7 posições e 2 casas decimais, e a categoria em maiúsculas. Termina com uma linha `TOTAL` na mesma tabela, com a percentagem de alimentação no total (uma casa decimal). Por fim, mostra o número `1234567.5` no estilo português: `1 234 567,50`.

### Exercício 18 · Extrair movimentos de um extrato

**Nível:** Intermédio

Dadas as linhas de um extrato:

    linhas = [
        "2026-11-09 | CONTINENTE MATOSINHOS | -45,30 EUR",
        "2026-11-10 | SALARIO | 1.250,00 EUR",
        "linha inválida",
        "2026-11-11 | CAFE CENTRAL | -1,20 EUR",
    ]

usa uma expressão regular compilada, com grupos com nome, para extrair data, descrição e valor de cada linha. Ignora (e assinala com `ignorada: ...`) as linhas que não correspondem ao padrão. Converte a data para `dd/mm/aaaa`, a descrição para `Title Case` e o valor para `float` (atenção ao ponto de milhares e à vírgula decimal). Imprime cada movimento como tuplo e, no fim, a soma dos movimentos negativos.

### Exercício 19 · Totais por categoria a partir de um CSV

**Nível:** Intermédio

Cria (por código, numa pasta temporária de `tempfile.TemporaryDirectory()`) um ficheiro `despesas.csv`, em UTF-8 e separado por `;`, com o cabeçalho `descricao;valor;categoria` e as linhas `Almoço;12.50;Alimentação`, `Cinema;8.00;Lazer`, uma linha em branco e `Café;1.20;Alimentação`. Lê-o linha a linha com `with open(...)`, saltando o cabeçalho e as linhas vazias, e calcula o total por categoria. Escreve o resultado num segundo ficheiro `relatorio.txt`, uma categoria por linha, por ordem alfabética, com a categoria alinhada à esquerda em 12 posições e o total à direita em 8 posições com 2 casas decimais. Lê o relatório e imprime-o.

### Exercício 20 · Converter ficheiros de Latin-1 para UTF-8

**Nível:** Avançado

Numa pasta temporária, cria com `pathlib` os ficheiros `a.txt` (conteúdo `Almoço`), `b.txt` (conteúdo `Café`), ambos gravados em **Latin-1** com uma mudança de linha no fim, e `c.csv` (ignorado). Percorre apenas os `.txt` com `glob`, em ordem alfabética, lê cada um como Latin-1 e grava uma cópia em UTF-8 numa subpasta `utf8` (criada por ti). Para cada ficheiro, imprime `nome: bytes_antes -> bytes_depois`. Imprime a lista ordenada de nomes na subpasta e, por fim, confirma que a cópia de `a.txt` lida como UTF-8 devolve `Almoço`. Explica em comentário porque é que os tamanhos aumentam.

## Módulo 06 · Módulos e ambientes

### Exercício 21 · Módulo com `__main__`

**Nível:** Iniciante

Cria um módulo `utilidades.py` com a função `formatar_euros(valor)`, que devolve o valor com duas casas decimais, vírgula decimal e o símbolo `€` (por exemplo, `12,50 €`). Quando o ficheiro é executado diretamente, deve imprimir o resultado para `12.5`; quando é importado, não deve imprimir nada. Depois escreve um segundo ficheiro que o importe de duas formas (`import utilidades` e `from utilidades import formatar_euros as eur`) e use a função.

### Exercício 22 · Pacote com imports relativos

**Nível:** Intermédio

Cria o pacote `despesas` com três módulos: `modelos.py` (dataclass `Despesa` com `descricao`, `valor`, `categoria`), `calculos.py` (função `total_por_categoria(lista)` que devolve um dicionário categoria para total, importando `Despesa` com import **relativo**) e `__init__.py` (expõe `Despesa` e `total_por_categoria`). Acrescenta `__main__.py` que cria três despesas e imprime os totais. Executa-o com `python -m despesas`. Explica porque `python despesas/calculos.py` falharia.

### Exercício 23 · Ambiente virtual e pip

**Nível:** Intermédio

Escreve um script que, numa pasta temporária (`tempfile.TemporaryDirectory`), cria um ambiente virtual com `venv.create(..., with_pip=True)`, descobre o caminho do interpretador desse ambiente (atenção à diferença `Scripts`/`bin`), executa-o com `subprocess` para confirmar que `sys.prefix != sys.base_prefix` e lista os pacotes instalados com `pip list --format=freeze`. Imprime os dois resultados.

### Exercício 24 · Ler um `pyproject.toml`

**Nível:** Avançado

Com `tomllib`, lê um texto TOML com uma secção `[project]` (nome, versão e uma lista `dependencies`). Imprime o nome e a versão e gera um ficheiro `requirements-gerado.txt` com uma dependência por linha. Mostra o conteúdo do ficheiro no fim. Bónus: acrescenta uma verificação que termina com mensagem de erro se a chave `dependencies` não existir.

## Módulo 07 · Orientação a objetos

### Exercício 25 · A classe Despesa

**Nível:** Iniciante

Cria uma classe `Despesa` com os atributos de instância `descricao`, `valor` e `categoria`, e o atributo de classe `iva = 0.23`. Acrescenta:

- um método `com_iva()` que devolve o valor com IVA somado (arredondado a 2 casas);
- `__repr__`, para que `Despesa("Café", 2.0, "comida")` apareça assim no REPL;
- `__eq__`, para que duas despesas com os mesmos três atributos sejam iguais.

Mostra o resultado de `com_iva()` para uma despesa de 10.0 e de `==` entre duas despesas iguais e entre duas diferentes.

### Exercício 26 · Valor validado e construtor alternativo

**Nível:** Intermédio

Parte da classe do exercício anterior (podes copiá-la). Torna `valor` uma propriedade que levanta `ValueError("o valor tem de ser positivo")` se for zero ou negativo (também na criação). Acrescenta:

- um `@staticmethod` `valor_valido(valor)`, usado pelo setter;
- um `@classmethod` `de_texto(linha)` que lê `"Café;2.5;comida"` e devolve uma `Despesa`;
- `__lt__`, para ordenar despesas pelo valor.

Ordena uma lista de três despesas criadas com `de_texto` e mostra as descrições. Mostra também a mensagem de erro ao criar uma despesa com valor `-1`.

### Exercício 27 · Exportadores

**Nível:** Intermédio

Define uma classe abstrata `Exportador` com o método abstrato `exportar(despesas)` e o método concreto `cabecalho()`, que devolve o nome da classe. Cria `ExportadorTexto` (uma linha `descricao: valor` por despesa) e `ExportadorCsv` (`descricao;valor`). Cria ainda uma classe `ExportadorResumo` **sem herdar** de `Exportador`, cujo `exportar` devolve apenas a frase `N despesas`.

Mostra que `Exportador()` não pode ser instanciado e percorre os três exportadores num só ciclo (duck typing). Mostra o resultado de `isinstance` do `ExportadorResumo` com `Exportador`.

### Exercício 28 · Orçamento com dataclasses

**Nível:** Avançado

Usa `@dataclass(frozen=True, order=True)` para definir `Despesa` com `valor: float`, `descricao: str` e `categoria: str = "outros"` (por esta ordem, para que a ordenação seja pelo valor). Define depois uma classe `Orcamento` (dataclass normal) que **tem** uma lista de despesas (`field(default_factory=list)`) e um `limite: float`, com:

- `adicionar(despesa)`;
- uma propriedade `total`;
- `por_categoria()`, que devolve um dicionário categoria → total;
- uma propriedade `excedido`, verdadeira se o total passar do limite.

Mostra o `por_categoria()`, o valor de `excedido`, a maior despesa (`max`) e o erro obtido ao tentar alterar o `valor` de uma despesa.

## Módulo 08 · Erros e testes

### Exercício 29 · Leitura segura de valores

**Nível:** Iniciante

Escreve `ler_valor(texto)` que converte o texto num `float` (aceitando vírgula decimal, como `"12,50"`). Usa `try/except/else/finally`:

- se o texto não for um número, imprime `Valor inválido: <texto>` e devolve `None`;
- se o argumento não for texto (por exemplo `None`), imprime `Não é texto: ...` e devolve `None`;
- se o número for `<= 0`, imprime `O valor tem de ser positivo` e devolve `None`;
- em todos os casos imprime `-- fim de leitura --` no fim.

Testa com `"12,50"`, `"abc"`, `"-3"` e `None`.

### Exercício 30 · Erros do domínio com encadeamento

**Nível:** Intermédio

Define `ErroDespesa(Exception)` e a subclasse `ErroFicheiro`. Escreve `carregar_despesas(texto)` que recebe uma string JSON com uma lista de objetos `{"descricao": ..., "valor": ...}` e devolve uma lista de tuplos `(descricao, valor_float)`. Se o JSON for inválido, ou se faltar uma chave ou o valor não for numérico, levanta `ErroFicheiro` com `raise ... from e`. No ciclo de teste, imprime a mensagem e o nome do tipo da causa (`__cause__`).

### Exercício 31 · Logging em vez de print

**Nível:** Intermédio

Escreve `dividir_conta(total, pessoas)`. Configura o `logging` com nível `DEBUG` e formato `%(levelname)s %(name)s: %(message)s`, com um logger chamado `despesas`. A função regista em `DEBUG` os argumentos recebidos, em `INFO` a parte de cada pessoa (2 casas decimais) e, se `pessoas` for 0, usa `log.exception` e devolve `None`. Usa argumentos de logging (`%s`), não f-strings. Corre com `(90, 4)` e `(90, 0)`.

### Exercício 32 · Testar com pytest

**Nível:** Avançado

Tens o módulo `resumo.py` com `total_por_categoria(despesas)` (recebe `(categoria, valor)`, devolve um dicionário com os totais e levanta `ValueError` para valores negativos) e `exportar(totais, caminho)` (escreve linhas `categoria;valor` com 2 casas decimais, ordenadas por categoria). Cria o ambiente virtual, instala o pytest e escreve `test_resumo.py` com: uma fixture com despesas de exemplo, um teste parametrizado com pelo menos três casos (incluindo lista vazia), um teste com `pytest.raises(..., match=...)` e um teste de `exportar` que usa `tmp_path`. Corre `python -m pytest -v` e confirma que tudo passa.

## Módulo 09 · Python idiomático

### Exercício 33 · Gerador de despesas grandes
**Nível: Iniciante.** Usa a lista `despesas` da aula. Escreve um gerador `acima_de(despesas, minimo)` que, com `yield`, devolve a `descricao` de cada despesa cujo `valor` seja maior que `minimo`. Mostra o primeiro resultado com `next()` e o resto com `list()`. Depois calcula, com uma expressão geradora, o total gasto na categoria `"comida"`.

### Exercício 34 · Totais com itertools
**Nível: Intermédio.** Com `groupby`, constrói um dicionário `{categoria: total}` (totais arredondados a 2 casas). Lembra-te de ordenar antes. Depois ordena as despesas por `data` e usa `accumulate` para obter o total acumulado e `pairwise` para obter a diferença de valor entre cada despesa e a anterior.

### Exercício 35 · Decorador com argumentos
**Nível: Intermédio.** Escreve o decorador `tentar_novamente(tentativas)`: chama a função e, se levantar `ValueError`, tenta de novo (imprime `tentativa N falhou`). Na última tentativa deixa o erro propagar-se. Usa `functools.wraps` e prova que o nome e a docstring da função decorada se mantêm. Testa com uma função que falha duas vezes e depois funciona, e com outra que nunca funciona.

### Exercício 36 · Context manager e type hints
**Nível: Avançado.** Escreve com `@contextmanager` a função `medir(etiqueta: str, destino: dict[str, float]) -> Iterator[None]`, que guarda em `destino[etiqueta]` o tempo gasto no bloco `with`, mesmo se o bloco falhar. Define também um `Protocol` `TemValor` (atributo `valor: float`), um `TypedDict` `Resumo` (`total: float`, `n: int`) e a função `resumir(itens: Iterable[TemValor]) -> Resumo`. Chama `resumir(despesas)` dentro de `medir`.

## Módulo 10 · Biblioteca padrão e ecossistema

### Exercício 37 · Guardar e carregar despesas em JSON

**Nível:** Iniciante

Escreve `guardar(despesas, caminho)` e `carregar(caminho)`. Cada despesa é um dicionário com `descricao`, `valor`, `categoria` e `data` (um `date`). `caminho` é um `Path`. Requisitos:

- `guardar` cria as pastas em falta e grava em JSON UTF-8, convertendo a data para texto ISO.
- `carregar` devolve `[]` se o ficheiro não existir; caso contrário devolve as despesas com `data` de novo como `date`.
- Confirma que `carregar(caminho) == original` depois de gravar (usa uma pasta temporária).

### Exercício 38 · Totais por mês a partir de CSV

**Nível:** Intermédio

Dado um texto CSV com as colunas `descricao,valor,categoria,data` e datas no formato `dd/mm/aaaa`, escreve `totais_por_mes(ficheiro)` que recebe um objeto de ficheiro (por exemplo `io.StringIO`) e devolve um dicionário `{"2026-11": 3.0, ...}` com o total de cada mês. Imprime os meses por ordem, com duas casas decimais.

### Exercício 39 · CLI de despesas com argparse e sqlite3

**Nível:** Intermédio

Escreve `executar(argv, con)` com dois subcomandos: `add descricao valor [-c categoria]` (insere na tabela com `?`, dentro de `with con:`, e devolve `"registado"`) e `total` (devolve `"total: X.XX"`). Testa com uma base `":memory:"` e com um valor inválido (`abc`), capturando o `SystemExit` e mostrando o código de saída.

### Exercício 40 · Consultas concorrentes com asyncio

**Nível:** Avançado

Escreve uma corrotina `consultar(nome, atraso, sem)` que, dentro de um `asyncio.Semaphore`, espera `atraso` segundos e devolve `"<nome>: ok"`. Lança quatro consultas de 0,3 s com um semáforo de 2 através de `asyncio.gather` e mostra o tempo total (deve rondar 0,6 s). Depois usa `asyncio.timeout(0.2)` para cancelar uma consulta de 1 s e imprime `timeout` quando falhar.

## Projeto final

### Exercício 41 · Gestor de despesas em linha de comandos

**Nível:** Avançado

Constrói o gestor de despesas do curso como um pacote com um programa de linha de comandos. Requisitos:

- Uma `dataclass` `Despesa` (`descricao`, `valor`, `categoria`, `data`) com validação (valor positivo, descrição não vazia) que levanta uma exceção própria.
- Persistência em JSON (ou SQLite) com `pathlib` e `encoding="utf-8"`.
- Comandos `adicionar`, `listar` (filtro por categoria e por mês), `total` e `exportar` (CSV), com `argparse`.
- Um gerador que lê as despesas sem carregar tudo em memória, e pelo menos um decorador ou context manager teu.
- Anotações de tipo nas funções públicas.
- Ambiente virtual, `requirements.txt` ou `pyproject.toml`, e testes com `pytest` (pelo menos 6, incluindo casos de erro e `tmp_path`).

**PRATICAR:** faz primeiro o modelo e os testes, depois a persistência e só no fim a interface.
