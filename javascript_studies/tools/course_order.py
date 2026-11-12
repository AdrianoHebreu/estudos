# -*- coding: utf-8 -*-
"""Ordem canonica de todo o curso (usada para calcular next_label/closing_message
e para gerar os READMEs), com os titulos corretos (com acentuacao). Serve tambem
para corrigir os titulos sem acentos usados no manifesto do Workflow (script em
JavaScript, onde os titulos foram escritos propositadamente em ASCII simples).

module_dir usa sempre ASCII (nomes de pasta), mas module_title/title aqui tem a
acentuacao correta em portugues europeu.
"""

FULL_ORDER = [
    ("00", "00-Introducao", "Introdução", "", "Bem-vindo ao Curso de JavaScript"),

    ("01", "01-Fundamentos-da-Linguagem", "Fundamentos da Linguagem", "01", "Sintaxe Básica e Comentários"),
    ("01", "01-Fundamentos-da-Linguagem", "Fundamentos da Linguagem", "02", "Variáveis: var, let e const"),
    ("01", "01-Fundamentos-da-Linguagem", "Fundamentos da Linguagem", "03", "Tipos de Dados e Tipagem Dinâmica"),
    ("01", "01-Fundamentos-da-Linguagem", "Fundamentos da Linguagem", "04", "Operadores"),
    ("01", "01-Fundamentos-da-Linguagem", "Fundamentos da Linguagem", "05", "Coerção e Comparação"),

    ("02", "02-Estruturas-de-Controlo", "Estruturas de Controlo", "01", "Condicionais: if, else e switch"),
    ("02", "02-Estruturas-de-Controlo", "Estruturas de Controlo", "02", "Operador Ternário e Curto-Circuito"),
    ("02", "02-Estruturas-de-Controlo", "Estruturas de Controlo", "03", "Loops: for, while e do...while"),
    ("02", "02-Estruturas-de-Controlo", "Estruturas de Controlo", "04", "for...of, for...in e Iteração"),
    ("02", "02-Estruturas-de-Controlo", "Estruturas de Controlo", "05", "break, continue e Labels"),

    ("03", "03-Funcoes", "Funções", "01", "Declarações, Expressões e Arrow Functions"),
    ("03", "03-Funcoes", "Funções", "02", "Parâmetros Default, Rest e o objeto arguments"),
    ("03", "03-Funcoes", "Funções", "03", "Escopo, Hoisting e Closures"),
    ("03", "03-Funcoes", "Funções", "04", "this, call, apply e bind"),
    ("03", "03-Funcoes", "Funções", "05", "Funções Recursivas e IIFE"),
    ("03", "03-Funcoes", "Funções", "06", "Programação Funcional Básica"),

    ("04", "04-Arrays-e-Colecoes", "Arrays e Coleções", "01", "Criação de Arrays e Métodos Básicos"),
    ("04", "04-Arrays-e-Colecoes", "Arrays e Coleções", "02", "Métodos de Iteração: map, filter, reduce e mais"),
    ("04", "04-Arrays-e-Colecoes", "Arrays e Coleções", "03", "Destructuring, Spread e Rest"),
    ("04", "04-Arrays-e-Colecoes", "Arrays e Coleções", "04", "Set, Map, WeakSet e WeakMap"),
    ("04", "04-Arrays-e-Colecoes", "Arrays e Coleções", "05", "Iteradores e o Protocolo Iterável"),
    ("04", "04-Arrays-e-Colecoes", "Arrays e Coleções", "06", "Generators"),

    ("05", "05-Objetos-e-Orientacao-a-Objetos", "Objetos e Orientação a Objetos", "01", "Object Literals, Propriedades e Métodos"),
    ("05", "05-Objetos-e-Orientacao-a-Objetos", "Objetos e Orientação a Objetos", "02", "Protótipos e Herança Prototipal"),
    ("05", "05-Objetos-e-Orientacao-a-Objetos", "Objetos e Orientação a Objetos", "03", "Classes (ES6)"),
    ("05", "05-Objetos-e-Orientacao-a-Objetos", "Objetos e Orientação a Objetos", "04", "Getters, Setters e Campos Privados"),
    ("05", "05-Objetos-e-Orientacao-a-Objetos", "Objetos e Orientação a Objetos", "05", "Mixins e Composição"),
    ("05", "05-Objetos-e-Orientacao-a-Objetos", "Objetos e Orientação a Objetos", "06", "Métodos Avançados de Object"),

    ("06", "06-Strings-e-Expressoes-Regulares", "Strings e Expressões Regulares", "01", "Métodos de String"),
    ("06", "06-Strings-e-Expressoes-Regulares", "Strings e Expressões Regulares", "02", "Template Literals e Tagged Templates"),
    ("06", "06-Strings-e-Expressoes-Regulares", "Strings e Expressões Regulares", "03", "Expressões Regulares: Fundamentos"),
    ("06", "06-Strings-e-Expressoes-Regulares", "Strings e Expressões Regulares", "04", "Regex Avançado"),

    ("07", "07-Assincronismo", "Assincronismo", "01", "Event Loop, Call Stack e Filas de Tarefas"),
    ("07", "07-Assincronismo", "Assincronismo", "02", "Callbacks e Callback Hell"),
    ("07", "07-Assincronismo", "Assincronismo", "03", "Promises"),
    ("07", "07-Assincronismo", "Assincronismo", "04", "async/await"),
    ("07", "07-Assincronismo", "Assincronismo", "05", "Fetch API e Consumo de Dados"),
    ("07", "07-Assincronismo", "Assincronismo", "06", "Generators Assíncronos e for await...of"),

    ("08", "08-Modulos-e-Ecossistema", "Módulos e Ecossistema", "01", "ES Modules: import e export"),
    ("08", "08-Modulos-e-Ecossistema", "Módulos e Ecossistema", "02", "CommonJS e Node.js"),
    ("08", "08-Modulos-e-Ecossistema", "Módulos e Ecossistema", "03", "NPM e Gestão de Pacotes"),
    ("08", "08-Modulos-e-Ecossistema", "Módulos e Ecossistema", "04", "Bundlers e Ferramentas de Build"),

    ("09", "09-Tratamento-de-Erros", "Tratamento de Erros", "01", "try, catch e finally"),
    ("09", "09-Tratamento-de-Erros", "Tratamento de Erros", "02", "Objetos Error e Erros Personalizados"),
    ("09", "09-Tratamento-de-Erros", "Tratamento de Erros", "03", "Padrões de Tratamento de Erros Assíncronos"),

    ("10", "10-DOM-e-APIs-do-Navegador", "DOM e APIs do Navegador", "01", "Selecionar e Manipular o DOM"),
    ("10", "10-DOM-e-APIs-do-Navegador", "DOM e APIs do Navegador", "02", "Eventos"),
    ("10", "10-DOM-e-APIs-do-Navegador", "DOM e APIs do Navegador", "03", "Formulários e Validação"),
    ("10", "10-DOM-e-APIs-do-Navegador", "DOM e APIs do Navegador", "04", "Web Storage e Outras APIs do Browser"),

    ("11", "11-JavaScript-Avancado", "JavaScript Avançado", "01", "Symbols e Well-Known Symbols"),
    ("11", "11-JavaScript-Avancado", "JavaScript Avançado", "02", "Proxy e Reflect"),
    ("11", "11-JavaScript-Avancado", "JavaScript Avançado", "03", "WeakMap, WeakSet e Gestão de Memória"),
    ("11", "11-JavaScript-Avancado", "JavaScript Avançado", "04", "Recursos Modernos: ES2020+"),

    ("12", "12-Padroes-de-Projeto-e-Boas-Praticas", "Padrões de Projeto e Boas Práticas", "01", "Padrões de Projeto em JavaScript"),
    ("12", "12-Padroes-de-Projeto-e-Boas-Praticas", "Padrões de Projeto e Boas Práticas", "02", "Clean Code e Convenções"),
    ("12", "12-Padroes-de-Projeto-e-Boas-Praticas", "Padrões de Projeto e Boas Práticas", "03", "Performance e Otimização"),
    ("12", "12-Padroes-de-Projeto-e-Boas-Praticas", "Padrões de Projeto e Boas Práticas", "04", "Testes e Depuração"),

    ("13", "13-Objetos-Nativos-e-Utilitarios", "Objetos Nativos e Utilitários", "01", "Datas: Date e Temporal"),
    ("13", "13-Objetos-Nativos-e-Utilitarios", "Objetos Nativos e Utilitários", "02", "JSON: Serializar e Desserializar"),
    ("13", "13-Objetos-Nativos-e-Utilitarios", "Objetos Nativos e Utilitários", "03", "Math e Number"),
    ("13", "13-Objetos-Nativos-e-Utilitarios", "Objetos Nativos e Utilitários", "04", "Intl: Internacionalização"),

    ("14", "14-Projeto-Final-e-Exercicios", "Projeto Final e Exercícios Consolidados", "", "Projeto Final e Exercícios Consolidados"),
    ("15", "15-Cheat-Sheet", "Cheat Sheet — Referência Rápida", "", "Cheat Sheet — Referência Rápida"),
    ("16", "16-Gabarito-dos-Exercicios", "Gabarito dos Exercícios", "", "Gabarito dos Exercícios"),
]

_BY_KEY = {(m, l): (module_dir, module_title, title) for m, module_dir, module_title, l, title in FULL_ORDER}


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
        return f"Aula {lesson_num} → {title}"
    return f"Módulo {module_num} → {title}"


def compute_nav():
    """Devolve dict keyed by (module_num, lesson_num) -> (closing_message, next_label)."""
    nav = {}
    for i, entry in enumerate(FULL_ORDER):
        module_num, module_dir, module_title, lesson_num, title = entry
        key = (module_num, lesson_num)
        if i + 1 < len(FULL_ORDER):
            nxt = FULL_ORDER[i + 1]
            same_module = nxt[0] == module_num
            if same_module:
                closing = f"Vamos continuar para a Aula {nxt[3]}"
            else:
                closing = f"Vamos continuar para o Módulo {nxt[0]}"
            next_label = label_for(nxt)
        else:
            closing = "Fim do Curso — Parabéns!"
            next_label = ""
        nav[key] = (closing, next_label)
    return nav
