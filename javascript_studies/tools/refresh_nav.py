# -*- coding: utf-8 -*-
"""Reescreve os campos de navegacao (closing_message/next_label) e os titulos
de TODOS os ficheiros em content-source/, a partir de course_order.py.

E preciso sempre que a estrutura do curso muda (modulo novo, renumeracao):
o slide final de cada aula aponta para a aula/modulo seguinte, e essa ligacao
fica errada assim que a ordem muda.

Uso:
  python refresh_nav.py
"""
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from course_order import compute_nav, correct_titles

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CS = os.path.join(PROJECT_ROOT, 'content-source')


def main():
    nav = compute_nav()
    atualizados, desconhecidos = 0, []
    for dp, _dirs, fs in os.walk(CS):
        for f in sorted(fs):
            if not f.endswith('.json') or f.startswith('_raw_'):
                continue
            p = os.path.join(dp, f)
            with open(p, encoding='utf-8') as fh:
                d = json.load(fh)
            chave = (d['module_num'], d.get('lesson_num', ''))
            if chave not in nav:
                desconhecidos.append(f"{chave} ({f})")
                continue

            antes = (d.get('closing_message'), d.get('next_label'),
                     d.get('module_title'), d.get('title'))
            d['closing_message'], d['next_label'] = nav[chave]
            module_title, title = correct_titles(*chave)
            if module_title:
                d['module_title'] = module_title
            if title:
                d['title'] = title
            depois = (d['closing_message'], d['next_label'], d['module_title'], d['title'])

            if antes != depois:
                with open(p, 'w', encoding='utf-8') as fh:
                    json.dump(d, fh, ensure_ascii=False, indent=2)
                atualizados += 1

    print(f'{atualizados} ficheiro(s) atualizados com a navegacao/titulos corretos')
    if desconhecidos:
        print('sem entrada em course_order.FULL_ORDER (verificar):')
        for x in desconhecidos:
            print('  -', x)


if __name__ == '__main__':
    main()
