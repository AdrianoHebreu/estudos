# -*- coding: utf-8 -*-
"""Converte JSON de conteudo (content-source/) em .docx + .pptx finais.

Uso:
  python build_lesson.py <arquivo.json> [--out-root <pasta>]      # um ficheiro
  python build_lesson.py --all <pasta-content-source> [--out-root <pasta>]  # lote
"""
import sys
import os
import json
import argparse
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from docbuilder import DocBuilder
from pptxbuilder import PPTXBuilder
import style as S


def build_one(lesson, project_root):
    module_num = lesson['module_num']
    module_title = lesson['module_title']
    module_label = f"MÓDULO {module_num}"
    lesson_num = lesson.get('lesson_num') or ''
    item_label = f"Aula {lesson_num}" if lesson_num else ''

    docb = DocBuilder(
        module_label=module_label,
        module_title=module_title,
        item_label=item_label,
        item_title=lesson['title'],
        subtitle=lesson.get('subtitle', ''),
    )
    docb.objectives(lesson.get('objectives', []),
                     lesson.get('objectives_label', 'Nesta aula vai aprender:'))

    pptxb = PPTXBuilder(module_label=module_label, module_title=module_title,
                         item_label=item_label)
    pptxb.cover_slide(
        tag_text=S.COURSE_TITLE,
        title=lesson['title'],
        subtitle=lesson.get('subtitle', ''),
        footer_tag=module_label,
    )

    for sec in lesson.get('sections', []):
        heading = sec['heading']
        docb.heading1(heading)
        for para in sec.get('body', []):
            if para:
                docb.paragraph(para)
        code = sec.get('code') or ''
        if code.strip():
            docb.code_block(code)
        callout_kind = (sec.get('callout_kind') or 'NONE').upper()
        callout_text = sec.get('callout_text') or ''
        if callout_kind != 'NONE' and callout_text.strip():
            docb.callout(callout_kind, callout_text)
        headers = sec.get('table_headers') or []
        rows = sec.get('table_rows') or []
        if headers:
            docb.data_table(headers, rows)

        if code.strip():
            pptxb.code_slide(heading, code)
        if headers:
            note = f"+ {len(rows) - 7} linha(s) adicional(is) no documento Word" if len(rows) > 7 else None
            pptxb.table_slide(heading, headers, rows, note=note)
        if not code.strip() and not headers:
            if sec.get('slide_bullets'):
                bullets = [(b.get('icon', '•'), b['text']) for b in sec['slide_bullets']]
                pptxb.bullets_slide(heading, bullets)
            elif callout_kind != 'NONE' and callout_text.strip():
                pptxb.callout_slide(heading, callout_kind, callout_text)

    exercises = lesson.get('exercises') or []
    if exercises:
        docb.heading1('Exercícios')
        for i, ex in enumerate(exercises, 1):
            docb.exercise_block(i, ex['title'], ex.get('difficulty', 'Iniciante'),
                                  ex['statement'], ex.get('hint'))
        bullets = [('✍️', f"{ex['title']} ({ex.get('difficulty','')})")
                   for ex in exercises[:5]]
        pptxb.bullets_slide('Exercícios', bullets)

    summary = lesson.get('summary') or []
    if summary:
        docb.summary(summary, lesson.get('summary_label', 'Resumo da Aula'))

    pptxb.closing_slide(
        lesson.get('closing_message', 'Vamos continuar'),
        lesson.get('next_label', ''),
        module_label,
    )

    out_dir = os.path.join(project_root, lesson['module_dir'])
    os.makedirs(out_dir, exist_ok=True)
    base = lesson['filename_base']
    docb.save(os.path.join(out_dir, base + '.docx'))
    pptxb.save(os.path.join(out_dir, base + '.pptx'))
    return out_dir, base


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('path', nargs='?', help='ficheiro JSON individual')
    ap.add_argument('--all', metavar='DIR', help='pasta content-source para processar em lote')
    ap.add_argument('--out-root', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    args = ap.parse_args()

    jobs = []
    if args.all:
        for root, _dirs, files in os.walk(args.all):
            for f in sorted(files):
                if f.endswith('.json') and not f.startswith('_raw_'):
                    jobs.append(os.path.join(root, f))
    elif args.path:
        jobs.append(args.path)
    else:
        ap.error('indique um ficheiro JSON ou --all <pasta>')

    ok, failed = 0, []
    for jf in jobs:
        try:
            with open(jf, encoding='utf-8') as fh:
                lesson = json.load(fh)
            out_dir, base = build_one(lesson, args.out_root)
            print(f"OK  {jf} -> {out_dir}\\{base}.docx/.pptx")
            ok += 1
        except Exception as e:
            print(f"FAIL {jf}: {e}")
            traceback.print_exc()
            failed.append(jf)

    print(f"\n{ok} gerados, {len(failed)} falhas.")
    if failed:
        print("Falhas:")
        for f in failed:
            print(" -", f)
        sys.exit(1)


if __name__ == '__main__':
    main()
