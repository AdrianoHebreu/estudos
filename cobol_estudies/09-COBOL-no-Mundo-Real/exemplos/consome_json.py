"""Le clientes.jsonl gerado por EXPORTA.COB (JSON GENERATE)."""
import json

with open("clientes.jsonl", encoding="ascii") as f:
    clientes = [json.loads(linha)["REG-CLIENTE"] for linha in f]
print(len(clientes), "clientes")
for c in clientes[:2] + clientes[-1:]:
    # o id perdeu os zeros; o email vazio veio como um espaco
    print(c["CLI-ID"], type(c["CLI-ID"]).__name__, repr(c["CLI-EMAIL"].strip()))
