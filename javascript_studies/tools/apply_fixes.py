# -*- coding: utf-8 -*-
"""Correcoes manuais de conteudo, aplicadas de forma idempotente.

Existe para que `recover_from_journal.py` possa voltar a correr (por exemplo,
para integrar versoes revistas) sem perder correcoes ja feitas a mao. Cada
correcao verifica primeiro se ja esta aplicada.

Cada entrada documenta o problema que resolve, encontrado por verificacao
automatica (node --check e execucao real dos exemplos).

Uso:
  python apply_fixes.py
"""
import os
import re
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CS = os.path.join(PROJECT_ROOT, 'content-source')


def carregar(rel):
    p = os.path.join(CS, rel)
    with open(p, encoding='utf-8') as fh:
        return p, json.load(fh)


def guardar(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=2)


def fix_05_06():
    """pt-PT: 'usuario' -> 'utilizador'; e tornar explicito que freeze/seal so
    falham em silencio em modo nao-estrito (num modulo ES lancam TypeError)."""
    rel = '05-Objetos-e-Orientacao-a-Objetos/06-Metodos-Avancados-de-Object.json'
    p, d = carregar(rel)
    mudou = []

    n = 0
    for s in d['sections']:
        if s.get('code') and re.search(r'\busuario', s['code']):
            n += len(re.findall(r'\busuario', s['code']))
            s['code'] = re.sub(r'\busuario', 'utilizador', s['code'])
    for e in d['exercises']:
        if e.get('solution_code') and re.search(r'\busuario', e['solution_code']):
            n += len(re.findall(r'\busuario', e['solution_code']))
            e['solution_code'] = re.sub(r'\busuario', 'utilizador', e['solution_code'])
    if n:
        mudou.append(f'{n}x "usuario" -> "utilizador"')

    aviso = ('Em modo não-estrito (por exemplo, na consola do browser) as alterações a um objeto '
             'congelado ou selado falham em silêncio, como nos exemplos desta aula. Dentro de um módulo ES, '
             'de uma classe ou com "use strict", a mesma atribuição lança TypeError. O objeto fica protegido '
             'nos dois casos — muda apenas a forma como a falha se manifesta.')
    alvo = next((s for s in d['sections'] if 'isFrozen' in s['heading'] or 'isSealed' in s['heading']), None)
    if alvo is None and len(d['sections']) > 1:
        alvo = d['sections'][1]
    if alvo is not None and 'modo não-estrito' not in (alvo.get('callout_text') or ''):
        if (alvo.get('callout_kind') or 'NONE') == 'NONE':
            alvo['callout_kind'] = 'ATENCAO'
            alvo['callout_text'] = aviso
            mudou.append('callout ATENCAO sobre modo estrito')

    for e in d['exercises']:
        if 'selado' in e['title'].lower() and 'congelado' in e['title'].lower():
            if 'não-estrito' not in e.get('solution_explanation', ''):
                txt = e['solution_explanation'].rstrip()
                if not txt.endswith('.'):
                    txt += '.'
                e['solution_explanation'] = txt + (
                    ' Nota: as atribuições e o delete falham em silêncio porque o exemplo corre em modo '
                    'não-estrito; num módulo ES ou com "use strict" cada uma delas lançaria TypeError, mas os '
                    'valores finais seriam os mesmos.')
                mudou.append('ressalva de modo estrito no exercicio selado/congelado')

    if mudou:
        guardar(p, d)
    return '05-06', mudou


def fix_12_02():
    """Dois blocos declaravam o mesmo identificador duas vezes (exemplo 'antes'
    e 'depois'), o que da SyntaxError a quem copia o bloco inteiro."""
    rel = '12-Padroes-de-Projeto-e-Boas-Praticas/02-Clean-Code-e-Convencoes.json'
    p, d = carregar(rel)
    mudou = []

    for s in d['sections']:
        code = s.get('code') or ''
        if code.count('function processarPedido(') > 1:
            code = code.replace('function processarPedido(pedido) {\n  if (!pedido.itens',
                                'function processarPedidoAntes(pedido) {\n  if (!pedido.itens', 1)
            s['code'] = code
            mudou.append('processarPedido duplicado -> processarPedidoAntes')
        if 'const registarAcesso = criarContadorDeAcessos();' in code and 'function registarAcesso(' in code:
            s['code'] = code.replace('const registarAcesso = criarContadorDeAcessos();\nregistarAcesso();',
                                     'const registarAcessoEncapsulado = criarContadorDeAcessos();\n'
                                     'registarAcessoEncapsulado();')
            mudou.append('registarAcesso duplicado -> registarAcessoEncapsulado')

    if mudou:
        guardar(p, d)
    return '12-02', mudou


def fix_07_01():
    """A solucao do exercicio de microtask starvation reagendava-se para sempre:
    o processo nunca terminava. Falta uma condicao de paragem."""
    rel = '07-Assincronismo/01-Event-Loop-Call-Stack-e-Filas-de-Tarefas.json'
    p, d = carregar(rel)
    mudou = []
    for e in d.get('exercises', []):
        code = e.get('solution_code') or ''
        if 'repetir()' in code and 'LIMITE_DE_REPETICOES' not in code:
            antes = 'let contador = 0;\n\nfunction repetir() {\n  contador++;\n'
            if antes in code:
                e['solution_code'] = code.replace(antes,
                    'let contador = 0;\nconst LIMITE_DE_REPETICOES = 20000;\n\n'
                    'function repetir() {\n  contador++;\n'
                    '  if (contador >= LIMITE_DE_REPETICOES) {\n'
                    '    return; // condicao de paragem: sem ela o programa nunca termina\n  }\n')
                mudou.append('condicao de paragem no exercicio de microtask starvation')
    if mudou:
        guardar(p, d)
    return '07-01', mudou


def fix_04_05():
    """O bloco usa a classe IntervaloNumerico definida na seccao anterior sem o
    dizer: quem copia so este bloco recebe um ReferenceError."""
    rel = '04-Arrays-e-Colecoes/05-Iteradores-e-Protocolo-Iteravel.json'
    p, d = carregar(rel)
    mudou = []
    for s in d['sections']:
        code = s.get('code') or ''
        if ('new IntervaloNumerico(' in code
                and 'class IntervaloNumerico' not in code
                and 'secção anterior' not in code):
            s['code'] = ('// Continua o exemplo da secção anterior: reutiliza a classe\n'
                         '// IntervaloNumerico, que implementa Symbol.iterator.\n') + code
            mudou.append('nota de continuacao no exemplo de IntervaloNumerico')
    if mudou:
        guardar(p, d)
    return '04-05', mudou


def main():
    for fn in (fix_05_06, fix_12_02, fix_07_01, fix_04_05):
        unidade, mudou = fn()
        if mudou:
            print(f'{unidade}: aplicado -> ' + '; '.join(mudou))
        else:
            print(f'{unidade}: ja estava corrigido (nada a fazer)')


if __name__ == '__main__':
    main()
