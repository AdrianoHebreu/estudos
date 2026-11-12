# -*- coding: utf-8 -*-
"""Renumera modulos finais para abrir espaco ao novo Modulo 13.

13-Projeto-Final-e-Exercicios  -> 14-Projeto-Final-e-Exercicios
14-Cheat-Sheet                 -> 15-Cheat-Sheet
15-Gabarito-dos-Exercicios     -> 16-Gabarito-dos-Exercicios

Renomeia as pastas (saida e content-source), atualiza module_num/module_dir/
filename_base dentro do JSON e apaga os .docx/.pptx antigos, que sao
regenerados a seguir com os nomes novos. E idempotente.

Uso:
  python renumerar_modulos.py
"""
import os
import json
import shutil

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CS = os.path.join(PROJECT_ROOT, 'content-source')

MAPA = [
    ('13-Projeto-Final-e-Exercicios', '14-Projeto-Final-e-Exercicios', '13', '14'),
    ('14-Cheat-Sheet', '15-Cheat-Sheet', '14', '15'),
    ('15-Gabarito-dos-Exercicios', '16-Gabarito-dos-Exercicios', '15', '16'),
]


def renomear(base, antigo, novo):
    src, dst = os.path.join(base, antigo), os.path.join(base, novo)
    if os.path.isdir(dst) and not os.path.isdir(src):
        return False  # ja renomeado
    if not os.path.isdir(src):
        return False
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    os.rename(src, dst)
    return True


def main():
    # do fim para o inicio, para nunca colidir com um nome ja existente
    for antigo, novo, num_antigo, num_novo in reversed(MAPA):
        mudou_out = renomear(PROJECT_ROOT, antigo, novo)
        mudou_cs = renomear(CS, antigo, novo)

        pasta_cs = os.path.join(CS, novo)
        if os.path.isdir(pasta_cs):
            for f in os.listdir(pasta_cs):
                if not f.endswith('.json'):
                    continue
                p = os.path.join(pasta_cs, f)
                d = json.load(open(p, encoding='utf-8'))
                if d.get('module_dir') == antigo or d.get('module_num') == num_antigo:
                    d['module_num'] = num_novo
                    d['module_dir'] = novo
                    if d.get('filename_base') == antigo:
                        d['filename_base'] = novo
                    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
                    novo_nome = os.path.join(pasta_cs, novo + '.json')
                    if p != novo_nome:
                        os.rename(p, novo_nome)

        # apagar documentos antigos (serao regerados com o nome novo)
        pasta_out = os.path.join(PROJECT_ROOT, novo)
        if os.path.isdir(pasta_out):
            for f in os.listdir(pasta_out):
                if f.startswith(antigo) and (f.endswith('.docx') or f.endswith('.pptx')):
                    os.remove(os.path.join(pasta_out, f))

        estado = 'renomeado' if (mudou_out or mudou_cs) else 'ja estava feito'
        print(f'{antigo} -> {novo}: {estado}')


if __name__ == '__main__':
    main()
