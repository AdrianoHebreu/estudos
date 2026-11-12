# -*- coding: utf-8 -*-
"""Reconstroi os ficheiros content-source/*.json a partir do journal.jsonl do
Workflow, sem depender do valor de retorno final (que so existe quando o
workflow termina).

Para cada unidade usa o resultado da fase de revisao quando ja existir; caso
contrario usa o da fase de autoria. Pode ser corrido varias vezes: a cada nova
revisao concluida, voltar a correr atualiza os ficheiros correspondentes.

Uso:
  python recover_from_journal.py <journal.jsonl> <script-do-workflow.js>
"""
import sys
import os
import re
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from course_order import compute_nav, correct_titles

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_SOURCE = os.path.join(PROJECT_ROOT, 'content-source')

# O manifesto do Workflow foi escrito antes de existir o Modulo 13 novo:
# estes modulos foram renumerados depois (ver renumerar_modulos.py).
REMAP = {'13': ('14', '14-Projeto-Final-e-Exercicios'),
         '14': ('15', '15-Cheat-Sheet'),
         '15': ('16', '16-Gabarito-dos-Exercicios')}

MODULE_RE = re.compile(r"\{num:'(\d\d)', dir:'([^']+)', title:'([^']*)', lessons:\[")
LESSON_RE = re.compile(r"\{num:'(\d\d)', slug:'([^']+)', title:'((?:[^'\\]|\\.)*)', brief:")
SPECIAL_RE = re.compile(r"\{num:'(\d\d)', dir:'([^']+)', title:'([^']*)', kind:'([^']+)', brief:")


def parse_manifest(script_path):
    """Devolve {key: metadata} com key = 'MM-LL' (aulas) ou 'MM-00' (especiais)."""
    with open(script_path, encoding='utf-8') as fh:
        src = fh.read()

    items = {}
    # blocos de modulo: do inicio de cada modulo ate ao proximo
    module_starts = [(m.start(), m) for m in MODULE_RE.finditer(src)]
    for idx, (pos, m) in enumerate(module_starts):
        end = module_starts[idx + 1][0] if idx + 1 < len(module_starts) else len(src)
        block = src[pos:end]
        module_num, module_dir, module_title = m.group(1), m.group(2), m.group(3)
        for lm in LESSON_RE.finditer(block):
            lesson_num, slug = lm.group(1), lm.group(2)
            items[f"{module_num}-{lesson_num}"] = {
                'module_num': module_num,
                'module_dir': module_dir,
                'module_title': module_title,
                'lesson_num': lesson_num,
                'lesson_slug': slug,
                'title': lm.group(3),
                'kind': 'aula',
                'filename_base': f"{lesson_num}-{slug}",
            }

    for sm in SPECIAL_RE.finditer(src):
        module_num, module_dir, module_title, kind = sm.group(1), sm.group(2), sm.group(3), sm.group(4)
        if module_num in REMAP:
            module_num, module_dir = REMAP[module_num]
        items[f"{sm.group(1)}-00"] = {
            'module_num': module_num,
            'module_dir': module_dir,
            'module_title': module_title,
            'lesson_num': '',
            'lesson_slug': '',
            'title': module_title,
            'kind': kind,
            'filename_base': module_dir,
        }
    return items


def parse_journal(journal_path):
    """Devolve {unit_key: (stage, content)} escolhendo 'revisao' sobre 'autoria'."""
    key_to_label = {}
    results = {}
    with open(journal_path, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if obj.get('type') == 'started':
                key_to_label[obj['key']] = obj.get('label', '')
            elif obj.get('type') == 'result':
                results[obj['key']] = obj.get('result')

    best = {}
    for key, content in results.items():
        label = key_to_label.get(key, '')
        if ':' not in label or not isinstance(content, dict):
            continue
        stage, unit = label.split(':', 1)
        if unit not in best or (stage == 'revisao' and best[unit][0] == 'autoria'):
            best[unit] = (stage, content)
    return best


def main():
    if len(sys.argv) < 3:
        print('uso: python recover_from_journal.py <journal.jsonl> <script-do-workflow.js>')
        sys.exit(1)
    journal_path, script_path = sys.argv[1], sys.argv[2]

    manifest = parse_manifest(script_path)
    best = parse_journal(journal_path)
    nav = compute_nav()

    written, revistas, so_autoria, sem_metadata = 0, 0, 0, []
    for unit, (stage, content) in sorted(best.items()):
        meta = manifest.get(unit)
        if not meta:
            sem_metadata.append(unit)
            continue

        module_num, lesson_num = meta['module_num'], meta['lesson_num']
        module_title, title = correct_titles(module_num, lesson_num)
        closing, next_label = nav.get((module_num, lesson_num), ('', ''))
        kind = meta['kind']

        lesson = {
            'module_num': module_num,
            'module_title': module_title or meta['module_title'],
            'module_dir': meta['module_dir'],
            'lesson_num': lesson_num,
            'lesson_slug': meta['lesson_slug'],
            'kind': kind,
            'title': title or meta['title'],
            'filename_base': meta['filename_base'],
            'subtitle': content.get('subtitle', ''),
            'objectives_label': ('Nesta aula vai aprender:' if kind == 'aula'
                                 else 'Este módulo inclui:' if kind == 'projeto'
                                 else 'Este cheat sheet cobre:'),
            'objectives': content.get('objectives', []),
            'sections': content.get('sections', []),
            'exercises': content.get('exercises', []) or [],
            'summary': content.get('summary', []),
            'summary_label': 'Resumo da Aula' if kind == 'aula' else 'Resumo',
            'closing_message': closing,
            'next_label': next_label,
            '_stage': stage,
        }

        out_dir = os.path.join(CONTENT_SOURCE, meta['module_dir'])
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, meta['filename_base'] + '.json'), 'w', encoding='utf-8') as fh:
            json.dump(lesson, fh, ensure_ascii=False, indent=2)
        written += 1
        if stage == 'revisao':
            revistas += 1
        else:
            so_autoria += 1

    print(f"{written} unidades escritas em content-source/")
    print(f"  {revistas} ja revistas tecnicamente, {so_autoria} apenas com a autoria inicial")
    esperadas = set(manifest.keys())
    em_falta = sorted(esperadas - set(best.keys()))
    if em_falta:
        print(f"  em falta ({len(em_falta)}): {', '.join(em_falta)}")
    if sem_metadata:
        print(f"  sem metadata no manifesto: {sem_metadata}")


if __name__ == '__main__':
    main()
