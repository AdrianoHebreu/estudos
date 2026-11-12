# -*- coding: utf-8 -*-
"""Ordem canonica do Curso de TypeScript, com os titulos corretos (acentuados).

O curso assume que o aluno ja fez o Curso de JavaScript de A a Z
(C:\\temp\\Sites\\javascript_studies): nao reensina a linguagem base, foca-se no
sistema de tipos e no que o TypeScript acrescenta.

FULL_ORDER: (module_num, module_dir, module_title, lesson_num, title)
SLUGS: (module_num, lesson_num) -> slug usado no nome do ficheiro
"""

FULL_ORDER = [
    ("00", "00-Introducao", "Introdução", "", "Bem-vindo ao Curso de TypeScript"),

    ("01", "01-Fundamentos-de-Tipos", "Fundamentos de Tipos", "01", "Anotações de Tipo e Inferência"),
    ("01", "01-Fundamentos-de-Tipos", "Fundamentos de Tipos", "02", "Tipos Primitivos e Especiais: any, unknown e never"),
    ("01", "01-Fundamentos-de-Tipos", "Fundamentos de Tipos", "03", "Arrays, Tuplas e readonly"),
    ("01", "01-Fundamentos-de-Tipos", "Fundamentos de Tipos", "04", "União, Interseção e Tipos Literais"),
    ("01", "01-Fundamentos-de-Tipos", "Fundamentos de Tipos", "05", "Enums e as suas Alternativas"),

    ("02", "02-Objetos-Interfaces-e-Type-Aliases", "Objetos, Interfaces e Type Aliases", "01", "Tipar Objetos"),
    ("02", "02-Objetos-Interfaces-e-Type-Aliases", "Objetos, Interfaces e Type Aliases", "02", "interface vs type: quando usar cada um"),
    ("02", "02-Objetos-Interfaces-e-Type-Aliases", "Objetos, Interfaces e Type Aliases", "03", "Propriedades Opcionais, readonly e Index Signatures"),
    ("02", "02-Objetos-Interfaces-e-Type-Aliases", "Objetos, Interfaces e Type Aliases", "04", "Extensão e Composição de Tipos"),
    ("02", "02-Objetos-Interfaces-e-Type-Aliases", "Objetos, Interfaces e Type Aliases", "05", "Tipagem Estrutural e Excess Property Checks"),

    ("03", "03-Funcoes-Tipadas", "Funções Tipadas", "01", "Parâmetros e Tipos de Retorno"),
    ("03", "03-Funcoes-Tipadas", "Funções Tipadas", "02", "Parâmetros Opcionais, Default e Rest"),
    ("03", "03-Funcoes-Tipadas", "Funções Tipadas", "03", "Tipos de Função, Callbacks e this"),
    ("03", "03-Funcoes-Tipadas", "Funções Tipadas", "04", "Sobrecargas de Função"),

    ("04", "04-Narrowing-e-Type-Guards", "Narrowing e Type Guards", "01", "Narrowing: typeof, instanceof e in"),
    ("04", "04-Narrowing-e-Type-Guards", "Narrowing e Type Guards", "02", "Uniões Discriminadas"),
    ("04", "04-Narrowing-e-Type-Guards", "Narrowing e Type Guards", "03", "Type Predicates e Assertion Functions"),
    ("04", "04-Narrowing-e-Type-Guards", "Narrowing e Type Guards", "04", "Verificação de Exaustividade com never"),

    ("05", "05-Genericos", "Genéricos", "01", "Funções Genéricas"),
    ("05", "05-Genericos", "Genéricos", "02", "Interfaces e Classes Genéricas"),
    ("05", "05-Genericos", "Genéricos", "03", "Constraints e Tipos por Omissão"),
    ("05", "05-Genericos", "Genéricos", "04", "Inferência em Genéricos"),
    ("05", "05-Genericos", "Genéricos", "05", "Padrões Genéricos Úteis"),

    ("06", "06-Tipos-Avancados", "Tipos Avançados", "01", "keyof, typeof e Indexed Access Types"),
    ("06", "06-Tipos-Avancados", "Tipos Avançados", "02", "Conditional Types"),
    ("06", "06-Tipos-Avancados", "Tipos Avançados", "03", "Mapped Types"),
    ("06", "06-Tipos-Avancados", "Tipos Avançados", "04", "Template Literal Types"),
    ("06", "06-Tipos-Avancados", "Tipos Avançados", "05", "infer e Tipos Recursivos"),

    ("07", "07-Utility-Types", "Utility Types", "01", "Partial, Required e Readonly"),
    ("07", "07-Utility-Types", "Utility Types", "02", "Pick, Omit e Record"),
    ("07", "07-Utility-Types", "Utility Types", "03", "ReturnType, Parameters e Awaited"),
    ("07", "07-Utility-Types", "Utility Types", "04", "Criar os Seus Próprios Utility Types"),

    ("08", "08-Classes-e-Orientacao-a-Objetos", "Classes e Orientação a Objetos", "01", "Classes Tipadas e Modificadores de Acesso"),
    ("08", "08-Classes-e-Orientacao-a-Objetos", "Classes e Orientação a Objetos", "02", "Classes Abstratas e implements"),
    ("08", "08-Classes-e-Orientacao-a-Objetos", "Classes e Orientação a Objetos", "03", "Parameter Properties, Acessores e Membros Estáticos"),
    ("08", "08-Classes-e-Orientacao-a-Objetos", "Classes e Orientação a Objetos", "04", "Decorators"),

    ("09", "09-Modulos-tsconfig-e-Declaracoes", "Módulos, tsconfig e Declarações", "01", "Módulos em TypeScript"),
    ("09", "09-Modulos-tsconfig-e-Declaracoes", "Módulos, tsconfig e Declarações", "02", "tsconfig.json: as opções que interessam"),
    ("09", "09-Modulos-tsconfig-e-Declaracoes", "Módulos, tsconfig e Declarações", "03", "O Modo strict, opção a opção"),
    ("09", "09-Modulos-tsconfig-e-Declaracoes", "Módulos, tsconfig e Declarações", "04", "Declaration Files (.d.ts) e @types"),
    ("09", "09-Modulos-tsconfig-e-Declaracoes", "Módulos, tsconfig e Declarações", "05", "Compilar, Empacotar e Integrar no Ecossistema"),

    ("10", "10-TypeScript-no-Mundo-Real", "TypeScript no Mundo Real", "01", "Assincronismo Tipado: Promise e async/await"),
    ("10", "10-TypeScript-no-Mundo-Real", "TypeScript no Mundo Real", "02", "Consumir APIs com Segurança: unknown na Fronteira"),
    ("10", "10-TypeScript-no-Mundo-Real", "TypeScript no Mundo Real", "03", "Validação em Runtime de Dados Externos"),
    ("10", "10-TypeScript-no-Mundo-Real", "TypeScript no Mundo Real", "04", "Tratamento de Erros Tipado"),

    ("11", "11-Migracao-e-Boas-Praticas", "Migração e Boas Práticas", "01", "Migrar JavaScript para TypeScript"),
    ("11", "11-Migracao-e-Boas-Praticas", "Migração e Boas Práticas", "02", "Evitar any e Fugas de Tipo"),
    ("11", "11-Migracao-e-Boas-Praticas", "Migração e Boas Práticas", "03", "Ler e Resolver Erros do Compilador"),
    ("11", "11-Migracao-e-Boas-Praticas", "Migração e Boas Práticas", "04", "Testes e Ferramentas em TypeScript"),

    ("12", "12-Projeto-Final", "Projeto Final", "", "Projeto Final"),
    ("13", "13-Cheat-Sheet", "Cheat Sheet — Referência Rápida", "", "Cheat Sheet — Referência Rápida"),
    ("14", "14-Gabarito-dos-Exercicios", "Gabarito dos Exercícios", "", "Gabarito dos Exercícios"),
]

SLUGS = {
    ("01", "01"): "Anotacoes-de-Tipo-e-Inferencia",
    ("01", "02"): "Tipos-Primitivos-e-Especiais",
    ("01", "03"): "Arrays-Tuplas-e-readonly",
    ("01", "04"): "Uniao-Intersecao-e-Tipos-Literais",
    ("01", "05"): "Enums-e-Alternativas",

    ("02", "01"): "Tipar-Objetos",
    ("02", "02"): "Interface-vs-Type-Alias",
    ("02", "03"): "Opcionais-readonly-e-Index-Signatures",
    ("02", "04"): "Extensao-e-Composicao-de-Tipos",
    ("02", "05"): "Tipagem-Estrutural",

    ("03", "01"): "Parametros-e-Tipos-de-Retorno",
    ("03", "02"): "Opcionais-Default-e-Rest",
    ("03", "03"): "Tipos-de-Funcao-Callbacks-e-this",
    ("03", "04"): "Sobrecargas-de-Funcao",

    ("04", "01"): "Narrowing-typeof-instanceof-e-in",
    ("04", "02"): "Unioes-Discriminadas",
    ("04", "03"): "Type-Predicates-e-Assertion-Functions",
    ("04", "04"): "Exaustividade-com-never",

    ("05", "01"): "Funcoes-Genericas",
    ("05", "02"): "Interfaces-e-Classes-Genericas",
    ("05", "03"): "Constraints-e-Tipos-por-Omissao",
    ("05", "04"): "Inferencia-em-Genericos",
    ("05", "05"): "Padroes-Genericos-Uteis",

    ("06", "01"): "keyof-typeof-e-Indexed-Access",
    ("06", "02"): "Conditional-Types",
    ("06", "03"): "Mapped-Types",
    ("06", "04"): "Template-Literal-Types",
    ("06", "05"): "infer-e-Tipos-Recursivos",

    ("07", "01"): "Partial-Required-e-Readonly",
    ("07", "02"): "Pick-Omit-e-Record",
    ("07", "03"): "ReturnType-Parameters-e-Awaited",
    ("07", "04"): "Criar-Utility-Types",

    ("08", "01"): "Classes-Tipadas-e-Modificadores",
    ("08", "02"): "Classes-Abstratas-e-implements",
    ("08", "03"): "Parameter-Properties-e-Acessores",
    ("08", "04"): "Decorators",

    ("09", "01"): "Modulos-em-TypeScript",
    ("09", "02"): "tsconfig-Essencial",
    ("09", "03"): "O-Modo-strict",
    ("09", "04"): "Declaration-Files-e-types",
    ("09", "05"): "Compilar-e-Integrar",

    ("10", "01"): "Assincronismo-Tipado",
    ("10", "02"): "Consumir-APIs-com-Seguranca",
    ("10", "03"): "Validacao-em-Runtime",
    ("10", "04"): "Tratamento-de-Erros-Tipado",

    ("11", "01"): "Migrar-JavaScript-para-TypeScript",
    ("11", "02"): "Evitar-any-e-Fugas-de-Tipo",
    ("11", "03"): "Erros-do-Compilador",
    ("11", "04"): "Testes-e-Ferramentas",
}

_BY_KEY = {(m, l): (module_dir, module_title, title) for m, module_dir, module_title, l, title in FULL_ORDER}


def slug_for(module_num, lesson_num):
    return SLUGS.get((module_num, lesson_num))


def correct_titles(module_num, lesson_num):
    """Devolve (module_title, title) com acentuacao correta para a chave dada."""
    entry = _BY_KEY.get((module_num, lesson_num))
    if entry is None:
        return None, None
    _module_dir, module_title, title = entry
    return module_title, title


def label_for(entry):
    module_num, module_dir, module_title, lesson_num, title = entry
    if lesson_num:
        return f"Aula {lesson_num} \u2192 {title}"
    return f"M\u00f3dulo {module_num} \u2192 {title}"


def compute_nav():
    """Devolve dict keyed by (module_num, lesson_num) -> (closing_message, next_label)."""
    nav = {}
    for i, entry in enumerate(FULL_ORDER):
        module_num, module_dir, module_title, lesson_num, title = entry
        key = (module_num, lesson_num)
        if i + 1 < len(FULL_ORDER):
            nxt = FULL_ORDER[i + 1]
            if nxt[0] == module_num:
                closing = f"Vamos continuar para a Aula {nxt[3]}"
            else:
                closing = f"Vamos continuar para o M\u00f3dulo {nxt[0]}"
            next_label = label_for(nxt)
        else:
            closing = "Fim do Curso \u2014 Parab\u00e9ns!"
            next_label = ""
        nav[key] = (closing, next_label)
    return nav
