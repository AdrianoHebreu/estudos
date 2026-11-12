# -*- coding: utf-8 -*-
"""Le o resultado (JSON) do Workflow 'js-course-content' e escreve um ficheiro
content-source/<modulo>/<ficheiro>.json por cada aula/modulo, com
closing_message/next_label calculados a partir da ordem canonica do curso.

Uso:
  python assemble_course.py <resultado_workflow.json>
"""
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from course_order import compute_nav, correct_titles

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_SOURCE = os.path.join(PROJECT_ROOT, 'content-source')


def main():
    if len(sys.argv) < 2:
        print('uso: python assemble_course.py <resultado_workflow.json>')
        sys.exit(1)
    with open(sys.argv[1], encoding='utf-8') as fh:
        result = json.load(fh)

    lessons = result.get('lessons', [])
    failed = result.get('failed', [])
    nav = compute_nav()

    written = 0
    for lesson in lessons:
        key = (lesson['module_num'], lesson.get('lesson_num', ''))
        closing, next_label = nav.get(key, ('', ''))
        lesson['closing_message'] = closing
        lesson['next_label'] = next_label

        module_title, title = correct_titles(*key)
        if module_title:
            lesson['module_title'] = module_title
        if title:
            lesson['title'] = title

        out_dir = os.path.join(CONTENT_SOURCE, lesson['module_dir'])
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, lesson['filename_base'] + '.json')
        with open(out_path, 'w', encoding='utf-8') as fh:
            json.dump(lesson, fh, ensure_ascii=False, indent=2)
        written += 1
        print(f"escrito: {out_path}")

    print(f"\n{written} ficheiros de conteudo escritos em content-source/.")
    if failed:
        print(f"{len(failed)} unidades falharam no workflow e precisam de ser escritas manualmente: {failed}")


if __name__ == '__main__':
    main()
