"""Importa produtos.dat (largura fixa) pelo layout do copybook."""
from decimal import Decimal

LAYOUT = [("id", 3), ("nome", 25), ("categoria_id", 2),
          ("preco", 7), ("stock", 5)]          # = PRODUTO.CPY
TAM = sum(t for _, t in LAYOUT)                # 42

def le_registo(linha):
    reg, pos = {}, 0
    for campo, tam in LAYOUT:
        reg[campo] = linha[pos:pos + tam]
        pos += tam
    reg["preco"] = Decimal(int(reg["preco"])).scaleb(-2)   # V99 implicito
    reg["nome"] = reg["nome"].rstrip()
    return reg

with open("produtos.dat", encoding="ascii") as f:
    linhas = [l.rstrip("\r\n") for l in f if l.strip()]
assert all(len(l) == TAM for l in linhas), "registo com tamanho errado"
regs = [le_registo(l) for l in linhas]
print(len(regs), "registos de", TAM, "bytes")
print(regs[0])
print("preco medio:", sum(r["preco"] for r in regs) / len(regs))
