# -*- coding: utf-8 -*-
"""Verificacao automatica de todo o conteudo do curso (nao usa agentes/tokens).

Faz quatro coisas:
  1. Compila cada bloco de codigo com `tsc --noEmit --strict` e reporta erros.
  2. Executa os exemplos autonomos (compilados para JS) e reporta os que
     rebentam ou nao terminam.
  3. Procura marcas de portugues do Brasil no texto e nos nomes em codigo.
  4. Procura markdown deixado por engano em campos de texto simples.

Diferenca importante em relacao ao curso de JavaScript: aqui muitos exemplos
mostram DE PROPOSITO codigo que o compilador rejeita, porque e esse o ponto da
aula. Esses blocos devem ter `// @ts-expect-error` na linha anterior, ou um
comentario comecado por `// ERRO:`, e sao entao contados como esperados.

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
TSC = os.path.join(PROJECT_ROOT, 'node_modules', '.bin', 'tsc.cmd')

SKIP_EXEC = re.compile(r'\b(import\s|export\s|require\(|document\.|window\.|fetch\(|localStorage|'
                       r'sessionStorage|process\.|addEventListener|querySelector|node:test|setInterval)')
BR = {r'\busu[áa]rio': 'utilizador', r'\barquivo': 'ficheiro', r'\bvoc[êe]\b': 'tratamento BR',
      r'\bsalvar\b': 'guardar', r'\bdeletar\b': 'apagar', r'\bgerenciar': 'gerir',
      r'\bcadastr': 'registo', r'\btela\b': 'ecrã', r'\bequipes?\b': 'equipa'}
MD = {'negrito **': re.compile(r'\*\*(?![\s*])[^*\n]{2,60}(?<![\s*])\*\*(?!\*)'),
      'cerca ```': re.compile(r'```'),
      'titulo #': re.compile(r'^#{1,6}\s+\S', re.M),
      'lista -': re.compile(r'^\s*[-*]\s+\S', re.M)}

# Blocos que mostram de proposito codigo que o compilador rejeita.
ERRO_INTENCIONAL = re.compile(r'@ts-expect-error|//\s*ERRO\b|//\s*Erro de compila', re.I)

# Exemplos cuja EXECUCAO falha de proposito (o erro em runtime e a licao).
ESPERADOS = {}


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


def nao_e_ts(code):
    l = code.lstrip()
    if l.startswith('<'):
        return 'HTML'
    try:
        json.loads(code)
        return 'JSON'
    except Exception:
        pass
    if re.search(r'^\s*"(name|version|compilerOptions|include|exclude|strict)":', code, re.M):
        return 'JSON'
    if re.match(r'^//\s*(tsconfig|package)\b', l):
        return 'JSON'
    linhas = [x.strip() for x in code.split('\n')
              if x.strip() and not x.strip().startswith('#') and not x.strip().startswith('//')]
    if linhas and all(re.match(r'^(npm|npx|node|tsc|git|cd|mkdir|ls|echo|curl|yarn|pnpm)\b', x) for x in linhas):
        return 'SHELL'
    cabecalhos = re.findall(r'^//\s*(?:ficheiro\b[:\s]*)?[\w./-]+\.(?:ts|tsx|mts|cts|js|mjs|cjs)\s*$'
                            r'|^//\s*(?:noutro|outro)\s+ficheiro\b', code, re.M)
    if len(cabecalhos) >= 2:
        return 'MULTI-FICHEIRO'
    if cabecalhos and re.search(r'^\s*(export|import)\b', code, re.M):
        return 'MULTI-FICHEIRO'
    if re.search(r'^//\s*dentro de\b', code, re.M):
        return 'EXCERTO'
    return None


def isolar(code):
    """Da a cada bloco o seu proprio ambito de modulo.

    Sem isto os blocos colidiriam: o tsc compila todos numa so chamada e, num
    ficheiro sem import/export, as declaracoes de topo vao para o ambito global.
    Duas aulas diferentes que declarem `const utilizador` dariam um falso erro
    de identificador duplicado. Acrescentar `export {}` torna cada ficheiro um
    modulo, com ambito proprio, e mantem a compilacao numa so chamada (rapida).
    """
    if re.search(r'^\s*(import|export)\b', code, re.M):
        return code
    return code + '\n\nexport {};\n'


def compilar(bs, scratch):
    """Compila todos os blocos numa so chamada (o tsc e lento a arrancar)."""
    mapa = {}
    for idx, (unit, onde, code) in enumerate(bs):
        if nao_e_ts(code):
            continue
        nome = f'b{idx}.ts'
        with open(os.path.join(scratch, nome), 'w', encoding='utf-8') as fh:
            fh.write(isolar(code))
        mapa[nome] = (unit, onde, code)

    if not mapa:
        return [], 0

    r = subprocess.run([TSC, '--noEmit', '--strict', '--target', 'es2022', '--module', 'es2022',
                        '--moduleResolution', 'bundler', '--skipLibCheck', '--pretty', 'false'] + list(mapa.keys()),
                       cwd=scratch, capture_output=True, text=True, encoding='utf-8', errors='replace')

    erros_por_ficheiro = {}
    for linha in (r.stdout or '').split('\n'):
        m = re.match(r'^(b\d+\.ts)\((\d+),(\d+)\): error (TS\d+): (.*)$', linha.strip())
        if m:
            erros_por_ficheiro.setdefault(m.group(1), []).append(
                (int(m.group(2)), m.group(4), m.group(5)))

    falhas = []
    for nome, (unit, onde, code) in mapa.items():
        erros = erros_por_ficheiro.get(nome, [])
        if not erros:
            continue
        linhas = code.split('\n')
        reais = []
        for num, cod, msg in erros:
            contexto = '\n'.join(linhas[max(0, num - 3):num])
            if ERRO_INTENCIONAL.search(contexto):
                continue  # o erro e a licao da aula
            reais.append(f'linha {num}: {cod} {msg[:70]}')
        if reais:
            falhas.append((unit, onde, reais[:2]))
    return falhas, len(mapa)


def executar(bs, scratch):
    falhas = []
    for idx, (unit, onde, code) in enumerate(bs):
        if nao_e_ts(code) or 'console.log' not in code or SKIP_EXEC.search(code):
            continue
        if ERRO_INTENCIONAL.search(code):
            continue
        with open(os.path.join(scratch, f'r{idx}.ts'), 'w', encoding='utf-8') as fh:
            fh.write(isolar(code))
        subprocess.run([TSC, '--target', 'es2022', '--module', 'es2022', '--skipLibCheck',
                        f'r{idx}.ts'],
                       cwd=scratch, capture_output=True, text=True, encoding='utf-8', errors='replace')
        gerado = os.path.join(scratch, f'r{idx}.js')
        if not os.path.exists(gerado):
            continue  # nao compilou: ja reportado na fase de compilacao
        destino = os.path.join(scratch, f'r{idx}.mjs')
        os.replace(gerado, destino)
        try:
            r = subprocess.run(['node', destino], capture_output=True, text=True,
                               encoding='utf-8', errors='replace', timeout=15)
        except subprocess.TimeoutExpired:
            falhas.append((unit, onde, 'NAO TERMINA (timeout 15s)'))
            continue
        if r.returncode != 0:
            linha = [x for x in (r.stderr or '').split('\n') if re.search(r'(Error|error):', x)]
            falhas.append((unit, onde, (linha[0] if linha else '').strip()[:100]))
    return falhas


def lingua_e_markdown():
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
    ap.add_argument('--scratch', default=os.path.join(os.environ.get('TEMP', '.'), 'ts_verify'))
    args = ap.parse_args()
    os.makedirs(args.scratch, exist_ok=True)

    if not os.path.exists(TSC):
        print(f'ERRO: tsc nao encontrado em {TSC} - corra "npm install" na raiz do curso')
        sys.exit(1)

    bs = blocos()
    ignorados = sum(1 for b in bs if nao_e_ts(b[2]))
    print(f'blocos de codigo: {len(bs)} ({ignorados} ignorados: JSON/HTML/shell/multi-ficheiro)')

    comp, n_comp = compilar(bs, args.scratch)
    print(f'\n[1] COMPILACAO (tsc --strict) sobre {n_comp} blocos: {len(comp)} com erro nao intencional')
    for u, o, errs in comp:
        print(f'    {u} | {o}')
        for e in errs:
            print(f'        {e}')

    exe = executar(bs, args.scratch)
    inesperadas = [(u, o, e) for u, o, e in exe if not esperado(u, o)]
    conhecidas = [(u, o, e) for u, o, e in exe if esperado(u, o)]
    print(f'\n[2] EXECUCAO: {len(inesperadas)} falha(s) por explicar')
    for u, o, e in inesperadas:
        print(f'    {u} | {o} | {e}')
    if conhecidas:
        print(f'    ({len(conhecidas)} falhas esperadas e documentadas)')

    br, md = lingua_e_markdown()
    print(f'\n[3] PORTUGUES DO BRASIL: {len(br)} ocorrencia(s)')
    for u, s, ex in br[:15]:
        print(f'    {u} | {s} | ...{ex}...')
    print(f'\n[4] MARKDOWN EM TEXTO SIMPLES: {len(md)} ocorrencia(s)')
    for u, n, ex in md[:15]:
        print(f'    {u} | {n} | ...{ex}...')

    print(f'\nPROBLEMAS POR RESOLVER: {len(comp) + len(inesperadas) + len(br) + len(md)}')


if __name__ == '__main__':
    main()
