# 07 Orientação a objetos

Até aqui guardaste uma despesa num dicionário ou num tuplo. Funciona, mas os dados e as regras que lhes dizem respeito andam separados. Uma **classe** junta os dois: define que dados um objeto tem (**atributos**) e o que consegue fazer (**métodos**).

## Classes e instâncias

Uma classe é um molde. Cada **instância** é um objeto criado a partir dele. O método `__init__` corre ao criar a instância e prepara os seus atributos.

    from datetime import date

    class Despesa:
        moeda = "EUR"

        def __init__(self, descricao, valor, categoria, data):
            self.descricao = descricao
            self.valor = valor
            self.categoria = categoria
            self.data = data

        def formatar(self):
            return f"{self.data} {self.descricao}: {self.valor:.2f} {self.moeda}"

    d = Despesa("Café", 1.2, "comida", date(2026, 11, 9))
    print(d.formatar())

    # 2026-11-09 Café: 1.20 EUR

- `self` é a própria instância. Python passa-o automaticamente como primeiro argumento de cada método; tu escreves `d.formatar()` e ele recebe `d`.

**ATENÇÃO:** esquecer o `self` na definição (`def formatar():`) dá `TypeError: ... takes 0 positional arguments but 1 was given`. Esquecer o `self.` ao atribuir (`valor = valor`) cria só uma variável local e perde-se o dado.

## Atributos de instância e de classe

| Tipo | Onde se define | Partilha |
|---|---|---|
| Instância | `self.x = ...` dentro de `__init__` | Cada objeto tem o seu |
| Classe | No corpo da classe, fora dos métodos | Partilhado por todas as instâncias |

Ao ler `d.moeda`, o Python procura primeiro na instância e depois na classe. Ao atribuir `d.moeda = "USD"`, cria um atributo **só nessa instância** e a classe fica intacta:

    d2 = Despesa("Café", 1.2, "comida", date(2026, 11, 9))
    d.moeda = "USD"
    print(d.moeda, d2.moeda, Despesa.moeda)

    # USD EUR EUR

**ATENÇÃO:** um atributo de classe **mutável** (lista, dicionário) é partilhado por todos. Se `tags = []` estiver no corpo da classe, `a.tags.append("x")` aparece também em `b.tags`. Cria listas por instância dentro de `__init__`.

## Métodos de classe, estáticos e propriedades

| Decorador | Primeiro parâmetro | Quando usar |
|---|---|---|
| (nenhum) | `self`, a instância | Operar sobre os dados de um objeto |
| `@classmethod` | `cls`, a classe | Construtores alternativos |
| `@staticmethod` | nenhum | Função relacionada com a classe, sem precisar dela |
| `@property` | `self` | Aceder a um cálculo ou a um valor validado como se fosse atributo |

    class Despesa:
        def __init__(self, descricao, valor, categoria, data):
            self.descricao = descricao
            self.valor = valor          # passa pelo setter abaixo
            self.categoria = categoria
            self.data = data

        @classmethod
        def de_texto(cls, linha):
            descricao, valor, categoria, data = linha.split(";")
            return cls(descricao, float(valor), categoria, date.fromisoformat(data))

        @staticmethod
        def valor_valido(valor):
            return valor > 0

        @property
        def valor(self):
            return self._valor

        @valor.setter
        def valor(self, novo):
            if not self.valor_valido(novo):
                raise ValueError("o valor tem de ser positivo")
            self._valor = novo

        @property
        def ano(self):
            return self.data.year

    d = Despesa.de_texto("Café;1.2;comida;2026-11-09")
    print(d.ano)
    d.valor = -5

    # 2026
    # ValueError: o valor tem de ser positivo

Pontos a reter:

- `de_texto` usa `cls(...)` e não `Despesa(...)`: assim as subclasses herdam um construtor que cria o tipo certo.
- Uma propriedade **sem setter** é só de leitura: `d.ano = 2000` dá `AttributeError: property 'ano' of 'Despesa' object has no setter`.

## Métodos especiais

Os métodos com **dois sublinhados** de cada lado (*dunder*) ligam a tua classe à sintaxe da linguagem. Python chama-os por ti.

| Método | Chamado por | Para quê |
|---|---|---|
| `__repr__` | `repr(x)`, REPL, listas | Representação **para programadores**, idealmente recriável |
| `__str__` | `print(x)`, `str(x)`, f-strings | Texto **para utilizadores** |
| `__eq__` | `a == b` | Igualdade por valor |
| `__lt__` | `a < b`, `sorted(...)` | Ordenação |

    class Despesa:
        # ... __init__ e o resto como acima ...

        def __repr__(self):
            return f"Despesa({self.descricao!r}, {self.valor}, {self.categoria!r}, {self.data!r})"

        def __str__(self):
            return f"{self.descricao} ({self.valor:.2f} EUR)"

        def __eq__(self, outra):
            if not isinstance(outra, Despesa):
                return NotImplemented
            return (self.descricao, self.valor, self.categoria, self.data) == (
                outra.descricao, outra.valor, outra.categoria, outra.data)

        def __lt__(self, outra):
            return self.valor < outra.valor

    d = Despesa.de_texto("Café;2.5;comida;2026-11-09")
    outra = Despesa.de_texto("Almoço;9.5;comida;2026-11-09")
    print(repr(d))
    print(d)
    print(d == Despesa.de_texto("Café;2.5;comida;2026-11-09"), d == 5)
    print([x.descricao for x in sorted([outra, d])])

    # Despesa('Café', 2.5, 'comida', datetime.date(2026, 11, 9))
    # Café (2.50 EUR)
    # True False
    # ['Café', 'Almoço']

- Devolver `NotImplemented` (e não `False`) deixa o Python tentar o outro operando e, no fim, dar `False`.

**ATENÇÃO:** sem `__eq__`, `==` compara a identidade e duas despesas iguais dão `False`. Já definir `__eq__` sem `__hash__` torna a instância não *hashable*: `hash(x)` dá `TypeError: unhashable type`, e deixa de poder ser chave de dicionário ou elemento de `set`.

## Herança e super()

Uma subclasse herda atributos e métodos da classe base e pode redefini-los. `super()` chama a versão da classe base.

    class Despesa:
        def __init__(self, descricao, valor):
            self.descricao = descricao
            self.valor = valor
        def total(self):
            return self.valor

    class DespesaRecorrente(Despesa):
        def __init__(self, descricao, valor, meses):
            super().__init__(descricao, valor)
            self.meses = meses
        def total(self):
            return super().total() * self.meses

    r = DespesaRecorrente("Ginásio", 30, 12)
    print(r.total(), isinstance(r, Despesa), issubclass(DespesaRecorrente, Despesa))

    # 360 True True


## Composição

Herança modela «é um»; **composição** modela «tem um». Um `Gestor` **tem** despesas; não **é** uma despesa.

    class Gestor:
        def __init__(self):
            self.despesas = []
        def adicionar(self, d):
            self.despesas.append(d)
        def total(self):
            return sum(d.total() for d in self.despesas)

    g = Gestor()
    g.adicionar(Despesa("Café", 1.5))
    g.adicionar(r)
    print(g.total())

    # 361.5

## Dataclasses

Para classes que são sobretudo dados, `@dataclass` gera `__init__`, `__repr__` e `__eq__` a partir das anotações de tipo.

    from dataclasses import dataclass, field

    @dataclass(order=True)
    class Item:
        descricao: str
        valor: float
        categoria: str = "outros"
        etiquetas: list = field(default_factory=list)

    i = Item("Café", 1.2)
    print(i)
    print(i == Item("Café", 1.2), Item("A", 1) < Item("B", 1))

    # Item(descricao='Café', valor=1.2, categoria='outros', etiquetas=[])
    # True True


**ATENÇÃO:** `etiquetas: list = []` é recusado com `ValueError: mutable default <class 'list'> for field etiquetas is not allowed: use default_factory`. Usa `field(default_factory=list)`.

## Classes abstratas e duck typing

Uma classe abstrata (módulo `abc`) define um **contrato**: métodos que as subclasses são obrigadas a implementar. Não se pode instanciar.

    from abc import ABC, abstractmethod

    class Exportador(ABC):
        @abstractmethod
        def exportar(self, despesas): ...

    Exportador()

    # TypeError: Can't instantiate abstract class Exportador without an implementation for abstract method 'exportar'

    class ExportadorCsv(Exportador):
        def exportar(self, despesas):
            return "\n".join(f"{d.descricao};{d.valor}" for d in despesas)

Em Python, porém, o contrato nem sempre tem de ser formal. No **duck typing**, o que importa é o objeto ter o método certo, não a classe de que herda: «se anda como um pato e grasna como um pato, é um pato».

    class ExportadorJson:                     # não herda de Exportador
        def exportar(self, despesas):
            return str([{"d": d.descricao} for d in despesas])

    for e in (ExportadorCsv(), ExportadorJson()):
        print(e.exportar(g.despesas).replace("\n", " | "))
    print(isinstance(ExportadorJson(), Exportador))

    # Café;1.5 | Ginásio;30
    # [{'d': 'Café'}, {'d': 'Ginásio'}]
    # False

| Abordagem | Vantagem | Quando usar |
|---|---|---|
| Classe abstrata | Erro cedo se faltar um método; partilha código comum | Hierarquia tua, com várias implementações obrigadas a seguir o contrato |
| Duck typing | Sem acoplamento; qualquer objeto compatível serve | Código simples e flexível, ou quando não controlas as classes |

## Exercícios

**PRATICAR:** exercícios 25 a 28 do módulo 11 (classes e `__init__`, propriedades e métodos de classe, herança com classes abstratas e duck typing, dataclasses e composição).

## Fontes oficiais

- [Tutorial: Classes](https://docs.python.org/3/tutorial/classes.html)
- [Modelo de dados (métodos especiais)](https://docs.python.org/3/reference/datamodel.html)
- [`property`](https://docs.python.org/3/library/functions.html#property)
- [`dataclasses`](https://docs.python.org/3/library/dataclasses.html)
- [PEP 557 — Data Classes](https://peps.python.org/pep-0557/)
- [`abc` — Abstract Base Classes](https://docs.python.org/3/library/abc.html)
- [Glossário: duck-typing](https://docs.python.org/3/glossary.html#term-duck-typing)
