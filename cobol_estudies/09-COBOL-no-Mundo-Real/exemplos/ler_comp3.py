"""Le produtos.bin (gerado por GERA_COMP3.COB) sem usar COBOL."""
import struct
from decimal import Decimal

TAM = 38  # 3 + 25 + 2 + 4 (COMP-3) + 4 (COMP)

def desempacota(dados, casas):
    """COMP-3: um digito por nibble; o ultimo nibble e o sinal (C/F +, D -)."""
    hexa = dados.hex()
    digitos, sinal = hexa[:-1], hexa[-1]
    valor = Decimal(int(digitos)).scaleb(-casas)
    return -valor if sinal == "d" else valor

with open("produtos.bin", "rb") as f:
    bruto = f.read()
print(len(bruto), "bytes,", len(bruto) // TAM, "registos")
total = Decimal(0)
for i in range(0, len(bruto), TAM):
    r = bruto[i:i + TAM]
    pid = int(r[0:3])
    nome = r[3:28].decode("ascii").rstrip()
    preco = desempacota(r[30:34], 2)
    stock = struct.unpack(">i", r[34:38])[0]   # COMP: big-endian
    if pid <= 3:
        print(pid, nome, r[30:34].hex(), preco, stock)
    total += preco * stock
print("valor total de stock:", total)
