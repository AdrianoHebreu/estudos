# -*- coding: utf-8 -*-
"""Junta ficheiros de conteudo em bruto (_raw_NN.json, escritos por agentes,
so com os campos de conteudo) com os metadados do curso, produzindo os
ficheiros finais de content-source/.

Os agentes so escrevem conteudo; a numeracao, os titulos e a navegacao vem
sempre de course_order.py, para nao depender de bookkeeping feito por agentes.

Uso:
  python merge_raw.py <module_dir>        # ex: 13-Objetos-Nativos-e-Utilitarios
"""
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from course_order import FULL_ORDER, compute_nav, slug_for

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CS = os.path.join(PROJECT_ROOT, 'content-source')


OBRIGATORIOS = ('subtitle', 'objectives', 'sections', 'exercises', 'summary')


def main():
    if len(sys.argv) < 2:
        print('uso: python merge_raw.py <module_dir>')
        sys.exit(1)
    module_dir = sys.argv[1]
    pasta = os.path.join(CS, module_dir)
    nav = compute_nav()

    entradas = [e for e in FULL_ORDER if e[1] == module_dir and e[3]]
    if not entradas:
        print(f'ERRO: {module_dir} nao tem aulas em course_order.FULL_ORDER')
        sys.exit(1)

    feitos, faltam = 0, []
    for module_num, _md, module_title, lesson_num, title in entradas:
        raw_path = os.path.join(pasta, f'_raw_{lesson_num}.json')
        if not os.path.exists(raw_path):
            faltam.append(lesson_num)
            continue
        with open(raw_path, encoding='utf-8') as fh:
            content = json.load(fh)

        em_falta = [c for c in OBRIGATORIOS if c not in content]
        if em_falta:
            print(f'  aula {lesson_num}: campos em falta {em_falta} - ignorada')
            faltam.append(lesson_num)
            continue

        slug = slug_for(module_num, lesson_num)
        if slug is None:
            print(f'  aula {lesson_num}: sem slug em course_order.SLUGS - ignorada')
            faltam.append(lesson_num)
            continue

        closing, next_label = nav[(module_num, lesson_num)]
        lesson = {
            'module_num': module_num,
            'module_title': module_title,
            'module_dir': module_dir,
            'lesson_num': lesson_num,
            'lesson_slug': slug,
            'kind': 'aula',
            'title': title,
            'filename_base': f'{lesson_num}-{slug}',
            'subtitle': content['subtitle'],
            'objectives_label': 'Nesta aula vai aprender:',
            'objectives': content['objectives'],
            'sections': content['sections'],
            'exercises': content.get('exercises') or [],
            'summary': content['summary'],
            'summary_label': 'Resumo da Aula',
            'closing_message': closing,
            'next_label': next_label,
        }
        destino = os.path.join(pasta, f'{lesson_num}-{slug}.json')
        with open(destino, 'w', encoding='utf-8') as fh:
            json.dump(lesson, fh, ensure_ascii=False, indent=2)
        os.remove(raw_path)
        secs, exs = len(lesson['sections']), len(lesson['exercises'])
        print(f'  aula {lesson_num}: {secs} seccoes, {exs} exercicios -> {lesson["filename_base"]}.json')
        feitos += 1

    print(f'\n{feitos} aula(s) integradas em {module_dir}/')
    if faltam:
        print(f'em falta: {faltam}')


if __name__ == '__main__':
    main()
