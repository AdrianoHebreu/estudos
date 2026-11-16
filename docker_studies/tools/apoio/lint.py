import glob
import os
import re
import sys

pasta = sys.argv[1]
corrigir = len(sys.argv) > 2 and sys.argv[2] == "--fix"
os.chdir(os.path.join(r"C:\temp\Sites\studies", pasta))

it = re.compile(r"(?<![*\w])\*([^*\n]+?)\*(?![*\w])")
bold = re.compile(r"\*\*([^*\n]+?)\*\*")
problemas = 0

for f in sorted(glob.glob("[0-9][0-9]-*/*.md")):
    linhas = open(f, encoding="utf-8").read().split("\n")
    em_tabela = False
    n_cols = 0
    mudou = False
    for i, l in enumerate(linhas):
        if l.startswith("    "):
            continue
        # tabelas: nº de células deve coincidir com o cabeçalho
        if l.startswith("|"):
            cels = len(l.strip().strip("|").split("|"))
            if not em_tabela:
                em_tabela = True
                n_cols = cels
            elif cels != n_cols:
                print(f"{f}:{i+1}: tabela com {cels} células (cabeçalho tem {n_cols}): {l[:70]}")
                problemas += 1
        else:
            em_tabela = False
        novo = l
        if "```" in l:
            print(f"{f}:{i+1}: crases triplas")
            problemas += 1
        if l.startswith("#") and it.search(l):
            print(f"{f}:{i+1}: itálico em título: {l[:70]}")
            novo = it.sub(r"\1", l)
            problemas += 1
        elif "**" in l and it.search(l.replace("**", "")) is not None and re.search(r"\*\*[^*\n]*\*[^*\n]+\*[^*\n]*\*\*", l):
            print(f"{f}:{i+1}: itálico dentro de negrito: {l[:70]}")
            novo = it.sub(r"\1", l)
            problemas += 1
        for m in bold.finditer(novo):
            if "`" in m.group(1):
                print(f"{f}:{i+1}: código dentro de negrito: {m.group(0)[:60]}")
                novo = novo.replace(m.group(0), "**" + m.group(1).replace("`", "") + "**")
                problemas += 1
        if novo != l:
            linhas[i] = novo
            mudou = True
    if mudou and corrigir:
        open(f, "w", encoding="utf-8").write("\n".join(linhas))
print("problemas:", problemas, "(corrigidos)" if corrigir else "")
