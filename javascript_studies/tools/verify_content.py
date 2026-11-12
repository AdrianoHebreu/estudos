# -*- coding: utf-8 -*-
"""Verificacao automatica de todo o conteudo do curso (nao usa agentes/tokens).

Faz quatro coisas:
  1. Valida a sintaxe de cada bloco de codigo com `node --check` (ESM e CJS).
  2. Executa os exemplos autonomos e reporta os que rebentam ou nao terminam.
  3. Procura marcas de portugues do Brasil no texto e nos nomes em codigo.
  4. Procura markdown deixado por engano em campos de texto simples.

Blocos que nao sao JavaScript (JSON, HTML, comandos de terminal) e blocos que
juntam varios ficheiros num so (com cabecalhos `// ficheiro.js`) sao ignorados
nas verificacoes de sintaxe, porque falham por construcao.

Uso:
  python verify_content.py [--scratch <pasta-temporaria>]
"""
import os
import re
import sys
import json
import argparse
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CS = os.path.join(PROJECT_ROOT, 'content-source')

SKIP_EXEC = re.compile(r'\b(import\s|export\s|require\(|document\.|window\.|fetch\(|localStorage|'
                       r'sessionStorage|process\.|addEventListener|querySelector|node:test|setInterval)')
BR = {r'\busu[áa]rio': 'utilizador', r'\barquivo': 'ficheiro', r'\bvoc[êe]\b': 'tratamento BR',
      r'\bsalvar\b': 'guardar', r'\bdeletar\b': 'apagar', r'\bgerenciar': 'gerir',
      r'\bcadastr': 'registo', r'\btela\b': 'ecrã', r'\bequipes?\b': 'equipa'}
MD = {'negrito **': re.compile(r'\*\*(?![\s*])[^*\n]{2,60}(?<![\s*])\*\*(?!\*)'),
      'cerca ```': re.compile(r'```'),
      'titulo #': re.compile(r'^#{1,6}\s+\S', re.M),
      'lista -': re.compile(r'^\s*[-*]\s+\S', re.M)}

# Exemplos que falham de proposito: demonstram o erro que estao a ensinar, ou
# dependem de um bloco anterior da mesma aula (e dizem-no num comentario).
ESPERADOS = {
    ('01-03', 'ex[1]'): 'demonstra que strings sao imutaveis (TypeError esperado)',
    ('03-03', 'sec[1]'): 'demonstra a zona morta temporal (ReferenceError esperado)',
    ('03-04', 'sec[6]'): 'demonstra a perda do contexto de this (TypeError esperado)',
    ('09-01', 'sec[4]'): 'demonstra erro assincrono que escapa ao try/catch',
    ('05-06', 'sec[0]'): 'freeze/seal: falha silenciosa so em modo nao-estrito (ver callout)',
    ('05-06', 'sec[3]'): 'writable:false: lanca TypeError em modo estrito (ver callout)',
    ('05-06', 'ex[0]'): 'freeze: lanca TypeError em modo estrito (ver callout)',
    ('05-06', 'ex[1]'): 'seal/freeze: lanca TypeError em modo estrito (ver callout)',
    ('15-00', 'sec[3]'): 'freeze: lanca TypeError em modo estrito (cheat sheet)',
    ('04-05', 'sec[4]'): 'continua o exemplo da seccao anterior da mesma aula',
    ('07-02', 'sec[4]'): 'continua o exemplo da seccao anterior da mesma aula',
    ('07-06', 'ex[3]'): 'reaproveita a solucao do exercicio anterior',
}


def esperado(unit, onde):
    return ESPERADOS.get((unit, onde.split(' ')[0]))


def blocos():
    out = []
    for dp, _d, fs in os.walk(CS):
        for f in sorted(fs):
            if not f.endswith('.json') or f.startswith('_raw_'):
                continue
            d = json.load(open(os.path.join(dp, f), encoding='utf-8'))
            unit = f"{d['module_num']}-{d.get('lesson_num') or '00'}"
            for i, s in enumerate(d.get('sections', [])):
                c = (s.get('code') or '').strip()
                if c:
                    out.append((unit, f"sec[{i}] {s['heading'][:40]}", c))
            for i, e in enumerate(d.get('exercises', [])):
                c = (e.get('solution_code') or '').strip()
                if c:
                    out.append((unit, f"ex[{i}] {e['title'][:40]}", c))
    return out


def nao_e_js(code):
    l = code.lstrip()
    if l.startswith('<'):
        return 'HTML'
    try:
        json.loads(code)
        return 'JSON'
    except Exception:
        pass
    if re.match(r'^//\s*[\w.-]+\.json\b', l) or re.search(r'^\s*"(name|version|type|scripts)":', code, re.M):
        return 'JSON'
    linhas = [x.strip() for x in code.split('\n')
              if x.strip() and not x.strip().startswith('#') and not x.strip().startswith('//')]
    if linhas and all(re.match(r'^(npm|npx|node|git|cd|mkdir|ls|echo|curl|yarn|pnpm)\b', x) for x in linhas):
        return 'SHELL'
    # varios ficheiros num so bloco: cabecalhos como "// algo.js",
    # "// ficheiro: algo.js", "// ficheiro algo.js" ou "// noutro ficheiro"
    cabecalhos = re.findall(r'^//\s*(?:ficheiro\b[:\s]*)?[\w./-]+\.(?:js|mjs|cjs)\s*$'
                            r'|^//\s*(?:noutro|outro)\s+ficheiro\b', code, re.M)
    if len(cabecalhos) >= 2:
        return 'MULTI-FICHEIRO'
    # bloco que define e importa o mesmo modulo (exemplo de modulos ES repartido)
    if cabecalhos and re.search(r'^\s*(export|import)\b', code, re.M):
        return 'MULTI-FICHEIRO'
    # excerto de um metodo de classe, assumido no texto ("// dentro de X:")
    if re.search(r'^//\s*dentro de\b', code, re.M):
        return 'EXCERTO'
    return None


def verificar_sintaxe(bs, scratch):
    falhas = []
    for idx, (unit, onde, code) in enumerate(bs):
        if nao_e_js(code):
            continue
        ok, err = False, ''
        for ext in ('mjs', 'cjs'):
            p = os.path.join(scratch, f's{idx}.{ext}')
            open(p, 'w', encoding='utf-8').write(code)
            r = subprocess.run(['node', '--check', p], capture_output=True, text=True,
                               encoding='utf-8', errors='replace')
            if r.returncode == 0:
                ok = True
                break
            linha = [x for x in (r.stderr or '').split('\n') if 'Error' in x]
            err = (linha[0] if linha else '')[:100]
        if not ok:
            falhas.append((unit, onde, err))
    return falhas


def verificar_execucao(bs, scratch):
    falhas = []
    for idx, (unit, onde, code) in enumerate(bs):
        if nao_e_js(code) or 'console.log' not in code or SKIP_EXEC.search(code):
            continue
        p = os.path.join(scratch, f'e{idx}.mjs')
        open(p, 'w', encoding='utf-8').write(code)
        try:
            r = subprocess.run(['node', p], capture_output=True, text=True,
                               encoding='utf-8', errors='replace', timeout=15)
        except subprocess.TimeoutExpired:
            falhas.append((unit, onde, 'NAO TERMINA (timeout 15s)'))
            continue
        if r.returncode != 0:
            linha = [x for x in (r.stderr or '').split('\n') if re.search(r'(Error|error):', x)]
            falhas.append((unit, onde, (linha[0] if linha else '').strip()[:100]))
    return falhas


def verificar_lingua_e_markdown():
    br_hits, md_hits = [], []
    for dp, _d, fs in os.walk(CS):
        for f in sorted(fs):
            if not f.endswith('.json') or f.startswith('_raw_'):
                continue
            d = json.load(open(os.path.join(dp, f), encoding='utf-8'))
            unit = f"{d['module_num']}-{d.get('lesson_num') or '00'}"
            textos = [d.get('subtitle', '')] + d.get('objectives', []) + d.get('summary', [])
            codigos = []
            for s in d.get('sections', []):
                textos += [s.get('heading', '')] + s.get('body', []) + [s.get('callout_text', '')]
                for r in (s.get('table_rows') or []):
                    textos += list(r)
                codigos.append(s.get('code', '') or '')
            for e in d.get('exercises', []):
                textos += [e.get('statement', ''), e.get('hint', ''), e.get('solution_explanation', '')]
                codigos.append(e.get('solution_code', '') or '')
            for t in textos + codigos:
                if not t:
                    continue
                for pat, sug in BR.items():
                    m = re.search(pat, t, re.I)
                    if m:
                        br_hits.append((unit, sug, t[max(0, m.start() - 30):m.start() + 40].replace('\n', ' ')))
            for t in textos:
                if not t:
                    continue
                for nome, pat in MD.items():
                    m = pat.search(t)
                    if m:
                        md_hits.append((unit, nome, t[max(0, m.start() - 25):m.start() + 40].replace('\n', ' ')))
    return br_hits, md_hits


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--scratch', default=os.path.join(os.environ.get('TEMP', '.'), 'js_verify'))
    args = ap.parse_args()
    os.makedirs(args.scratch, exist_ok=True)

    bs = blocos()
    ignorados = sum(1 for b in bs if nao_e_js(b[2]))
    print(f'blocos de codigo: {len(bs)} ({ignorados} ignorados: JSON/HTML/shell/multi-ficheiro)')

    sint = verificar_sintaxe(bs, args.scratch)
    print(f'\n[1] SINTAXE (node --check): {len(sint)} falha(s)')
    for u, o, e in sint:
        print(f'    {u} | {o} | {e}')

    exe = verificar_execucao(bs, args.scratch)
    inesperadas = [(u, o, e) for u, o, e in exe if not esperado(u, o)]
    conhecidas = [(u, o, e) for u, o, e in exe if esperado(u, o)]
    print(f'\n[2] EXECUCAO (exemplos autonomos): {len(inesperadas)} falha(s) por explicar')
    for u, o, e in inesperadas:
        print(f'    {u} | {o} | {e}')
    print(f'    ({len(conhecidas)} falhas esperadas e documentadas:)')
    for u, o, _e in conhecidas:
        print(f'      - {u} {o.split(" ")[0]}: {esperado(u, o)}')

    br, md = verificar_lingua_e_markdown()
    print(f'\n[3] PORTUGUES DO BRASIL: {len(br)} ocorrencia(s)')
    for u, s, ex in br[:15]:
        print(f'    {u} | {s} | ...{ex}...')
    print(f'\n[4] MARKDOWN EM TEXTO SIMPLES: {len(md)} ocorrencia(s)')
    for u, n, ex in md[:15]:
        print(f'    {u} | {n} | ...{ex}...')

    total = len(sint) + len(inesperadas) + len(br) + len(md)
    print(f'\nPROBLEMAS POR RESOLVER: {total}')


if __name__ == '__main__':
    main()
