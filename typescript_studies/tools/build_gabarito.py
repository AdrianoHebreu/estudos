# -*- coding: utf-8 -*-
"""Monta o Modulo 14 (Gabarito dos Exercicios) agregando os exercicios (com
solucao) de todos os ficheiros em content-source/, sem precisar de um agente:
o conteudo ja existe, isto e so formatacao/agregacao.

Uso:
  python build_gabarito.py [--out-root <pasta>]
"""
import sys
import os
import json
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docbuilder import DocBuilder
from pptxbuilder import PPTXBuilder
import style as S

MODULE_DIR = '14-Gabarito-dos-Exercicios'
MODULE_NUM = '14'
MODULE_TITLE = 'Gabarito dos Exercícios'


def load_all_lessons(content_source_root):
    lessons = []
    for root, _dirs, files in os.walk(content_source_root):
        base = os.path.basename(root)
        if base in (MODULE_DIR, '13-Cheat-Sheet'):
            continue
        for f in sorted(files):
            if f.endswith('.json') and not f.startswith('_raw_'):
                with open(os.path.join(root, f), encoding='utf-8') as fh:
                    lessons.append(json.load(fh))
    lessons.sort(key=lambda l: (l['module_num'], l.get('lesson_num', '')))
    return lessons


def build(project_root):
    content_source_root = os.path.join(project_root, 'content-source')
    lessons = load_all_lessons(content_source_root)

    docb = DocBuilder(
        module_label=f"MÓDULO {MODULE_NUM}",
        module_title=MODULE_TITLE,
        item_label='',
        item_title=MODULE_TITLE,
        subtitle='Soluções comentadas de todos os exercícios propostos ao longo do curso',
    )
    docb.objectives([
        'Use este módulo só depois de tentar resolver os exercícios sozinho — é nesse esforço que a aprendizagem acontece.',
        'As soluções apresentadas são uma proposta idiomática; podem existir outras formas corretas de resolver o mesmo exercício.',
        'Os exercícios estão agrupados pela mesma ordem dos módulos e aulas do curso.',
    ], label='Como usar este módulo:')

    stats_rows = []
    total_exercises = 0
    for lesson in lessons:
        exercises = lesson.get('exercises') or []
        if not exercises:
            continue
        module_num = lesson['module_num']
        module_title = lesson['module_title']
        docb.heading1(f"Módulo {module_num} — {module_title}")
        lesson_num = lesson.get('lesson_num', '')
        heading2_text = f"Aula {lesson_num} — {lesson['title']}" if lesson_num else lesson['title']
        docb.heading2(heading2_text)
        for i, ex in enumerate(exercises, 1):
            docb.heading2(f"{i}. {ex['title']} ({ex.get('difficulty', '')})")
            docb.paragraph(f"Enunciado: {ex['statement']}")
            docb.code_block(ex.get('solution_code', ''), caption='Solução:')
            if ex.get('solution_explanation'):
                docb.callout('NOTA', ex['solution_explanation'])
        total_exercises += len(exercises)
        stats_rows.append([f"{module_num} · {module_title}", str(len(exercises))])

    docb.summary([
        f"{total_exercises} exercícios resolvidos e explicados ao longo de todo o curso",
        'Cada solução inclui código idiomático e uma explicação curta do raciocínio',
        'Volte a este módulo sempre que quiser confirmar ou comparar uma abordagem',
    ], label='Resumo do Módulo')

    out_dir = os.path.join(project_root, MODULE_DIR)
    os.makedirs(out_dir, exist_ok=True)
    docb.save(os.path.join(out_dir, MODULE_DIR + '.docx'))

    pptxb = PPTXBuilder(module_label=f"MÓDULO {MODULE_NUM}", module_title=MODULE_TITLE)
    pptxb.cover_slide(
        tag_text=S.COURSE_TITLE,
        title=MODULE_TITLE,
        subtitle='Soluções comentadas de todos os exercícios do curso',
        footer_tag=f"MÓDULO {MODULE_NUM}",
    )
    pptxb.bullets_slide('Como Usar Este Módulo', [
        ('\U0001F914', 'Tente resolver sozinho antes de espreitar a solução'),
        ('\U0001F4A1', 'As soluções são uma proposta — pode haver outras corretas'),
        ('\U0001F5C2️', 'Organizado pela mesma ordem dos módulos do curso'),
    ])
    pptxb.table_slide('Exercícios por Módulo', ['Módulo', 'Exercícios'], stats_rows)
    pptxb.closing_slide('Fim do Curso — Parabéns!', 'Reveja o Módulo 13 (Cheat Sheet) sempre que precisar.',
                         f"MÓDULO {MODULE_NUM}", emoji='\U0001F3C6')
    pptxb.save(os.path.join(out_dir, MODULE_DIR + '.pptx'))

    print(f"Gabarito gerado: {out_dir} ({total_exercises} exercícios de {len(stats_rows)} unidades)")


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out-root', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    args = ap.parse_args()
    build(args.out_root)
