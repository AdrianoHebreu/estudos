# -*- coding: utf-8 -*-
"""Gera o README.md de topo e um README.md por modulo, a partir do conteudo
final em content-source/. Puramente mecanico - sem chamadas a agentes.

Uso:
  python generate_readmes.py [--out-root <pasta>]
"""
import sys
import os
import json
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from course_order import FULL_ORDER

MODULE_ORDER = []
seen = set()
for module_num, module_dir, module_title, lesson_num, title in FULL_ORDER:
    if module_dir not in seen:
        seen.add(module_dir)
        MODULE_ORDER.append((module_num, module_dir, module_title))


def load_lesson(content_source_root, module_dir, filename_base):
    path = os.path.join(content_source_root, module_dir, filename_base + '.json')
    if not os.path.exists(path):
        return None
    with open(path, encoding='utf-8') as fh:
        return json.load(fh)


def module_readme(module_num, module_dir, module_title, entries, content_source_root):
    aulas = [e for e in entries if e[3]]
    lines = [f"# Módulo {module_num} — {module_title}", ""]
    if aulas:
        lines += ["| Aula | Título | Subtítulo | Ficheiros |", "|---|---|---|---|"]
        for _mn, _md, _mt, lesson_num, title in aulas:
            lesson = _find_lesson_by_num(content_source_root, module_dir, lesson_num)
            fname = lesson['filename_base'] if lesson else f"{lesson_num}-{title.replace(' ', '-')}"
            subtitle = lesson['subtitle'] if lesson else ''
            lines.append(f"| {lesson_num} | {title} | {subtitle} | `{fname}.docx` / `.pptx` |")
        lines.append("")
        lines.append("Cada aula tem um documento Word (`.docx`) com a teoria completa, exemplos e exercícios, "
                      "e um PowerPoint (`.pptx`) companheiro com um resumo visual da mesma aula.")
    else:
        lesson = load_lesson(content_source_root, module_dir, module_dir)
        subtitle = lesson['subtitle'] if lesson else ''
        lines += [subtitle, "", f"Ficheiros: `{module_dir}.docx` / `{module_dir}.pptx`"]
    return "\n".join(lines) + "\n"


def _find_lesson_by_num(content_source_root, module_dir, lesson_num):
    d = os.path.join(content_source_root, module_dir)
    if not os.path.isdir(d):
        return None
    for f in os.listdir(d):
        if f.startswith(lesson_num + '-') and f.endswith('.json'):
            with open(os.path.join(d, f), encoding='utf-8') as fh:
                return json.load(fh)
    return None


def top_readme(content_source_root):
    lines = [
        "# Curso de TypeScript de A a Z",
        "",
        "Material de estudo completo sobre TypeScript, das primeiras anotações de tipo aos genéricos, "
        "conditional types e migração de projetos reais. **Este curso parte do princípio de que já fez o "
        "Curso de JavaScript de A a Z**: não reensina a linguagem base, foca-se no sistema de tipos. Cada "
        "aula é um documento Word (`.docx`) independente, dentro da pasta do seu módulo.",
        "",
        "Cada aula tem também um `.pptx` companheiro — uma versão em slides da mesma aula, visual e "
        "resumida (ícones, tabelas, gráficos e blocos de código, sem parágrafos de texto), pensada para "
        "apresentar ou rever rapidamente. O Word continua a ser a referência completa; o PowerPoint é o "
        "resumo visual.",
        "",
        "## Como está organizado",
        "",
        "Os números das pastas indicam a ordem recomendada de estudo.",
        "",
        "| Pasta | Módulo | Conteúdo |",
        "|---|---|---|",
    ]
    descriptions = {
        "00-Introducao": "Porquê o TypeScript, o que muda em relação ao JavaScript e como preparar o ambiente",
        "01-Fundamentos-de-Tipos": "Anotações e inferência, any/unknown/never, arrays e tuplas, uniões e literais, enums",
        "02-Objetos-Interfaces-e-Type-Aliases": "Tipar objetos, interface vs type, opcionais e readonly, composição, tipagem estrutural",
        "03-Funcoes-Tipadas": "Parâmetros e retorno, opcionais/default/rest, tipos de função, sobrecargas",
        "04-Narrowing-e-Type-Guards": "typeof/instanceof/in, uniões discriminadas, type predicates, exaustividade com never",
        "05-Genericos": "Funções, interfaces e classes genéricas, constraints, inferência, padrões úteis",
        "06-Tipos-Avancados": "keyof e indexed access, conditional types, mapped types, template literal types, infer",
        "07-Utility-Types": "Partial, Required, Pick, Omit, Record, ReturnType, Awaited e como criar os seus",
        "08-Classes-e-Orientacao-a-Objetos": "Modificadores de acesso, classes abstratas, implements, parameter properties, decorators",
        "09-Modulos-tsconfig-e-Declaracoes": "Módulos, tsconfig.json, o modo strict, ficheiros .d.ts e @types, compilação",
        "10-TypeScript-no-Mundo-Real": "Assincronismo tipado, consumir APIs com unknown, validação em runtime, erros tipados",
        "11-Migracao-e-Boas-Praticas": "Migrar JS para TS, evitar any, ler erros do compilador, testes e ferramentas",
        "12-Projeto-Final": "Projeto prático que integra o sistema de tipos todo + desafios extra",
        "13-Cheat-Sheet": "Referência rápida com toda a sintaxe de tipos do curso",
        "14-Gabarito-dos-Exercicios": "Solução comentada de cada exercício proposto no curso",
    }
    for module_num, module_dir, module_title in MODULE_ORDER:
        lines.append(f"| `{module_dir}/` | {module_num} | {descriptions.get(module_dir, module_title)} |")

    lines += [
        "",
        "## Como estudar",
        "",
        "1. Siga a ordem numérica dos módulos 00 a 11 (teoria), aula a aula.",
        "2. Depois de cada aula, resolva os exercícios no final do próprio documento.",
        "3. Use o `.pptx` de cada aula como revisão rápida, antes ou depois de ler a teoria.",
        "4. Consolide tudo no **Módulo 12** com o projeto final.",
        "5. Use o **Módulo 13** como consulta rápida no dia a dia.",
        "6. Confirme o seu trabalho no **Módulo 14** só depois de tentar resolver sozinho.",
        "",
        "## Convenções usadas nos documentos",
        "",
        "- **Blocos de código** — exemplos em TypeScript para ler, compilar ou adaptar.",
        "- **DICA** — sugestões, atalhos e boas práticas opcionais.",
        "- **ATENÇÃO** — comportamentos que podem confundir ou operações arriscadas.",
        "- **NOTA** — contexto adicional ou detalhe técnico opcional.",
        "- **PRATICAR** — remete para os exercícios no final da aula.",
        "",
    ]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out-root', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    args = ap.parse_args()
    project_root = args.out_root
    content_source_root = os.path.join(project_root, 'content-source')

    with open(os.path.join(project_root, 'README.md'), 'w', encoding='utf-8') as fh:
        fh.write(top_readme(content_source_root))
    print('README.md (topo) escrito.')

    by_module = {}
    for entry in FULL_ORDER:
        by_module.setdefault(entry[1], []).append(entry)

    for module_num, module_dir, module_title in MODULE_ORDER:
        entries = by_module[module_dir]
        content = module_readme(module_num, module_dir, module_title, entries, content_source_root)
        out_dir = os.path.join(project_root, module_dir)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f"README.md escrito em {module_dir}/")


if __name__ == '__main__':
    main()
