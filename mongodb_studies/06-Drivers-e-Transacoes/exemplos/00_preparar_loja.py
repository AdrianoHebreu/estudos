"""Prepara as coleções produtos e clientes da loja (valores do fio condutor do curso).

Uso:  python 00_preparar_loja.py [URI] [base]
Por omissão liga ao servidor partilhado (27117) e à base m06.
"""
import sys
from datetime import datetime, timezone

from pymongo import MongoClient

uri = sys.argv[1] if len(sys.argv) > 1 else "mongodb://localhost:27117"
base = sys.argv[2] if len(sys.argv) > 2 else "m06"

PRODUTOS = [
    (1, "Romance Policial", 1, 12.9, 40), (2, "Livro de Receitas", 1, 18.5, 25),
    (3, "Atlas Mundial", 1, 29.99, 10), (4, "Auscultadores Bluetooth", 2, 49.9, 30),
    (5, "Carregador USB-C", 2, 14.9, 100), (6, "Teclado Mecânico", 2, 79.0, 0),
    (7, "Candeeiro de Mesa", 3, 22.0, 15), (8, "Conjunto de Panelas", 3, 89.9, 8),
    (9, "Manta de Sofá", 3, 34.5, 20), (10, "Caneca de Cerâmica", 3, 6.5, 200),
]
CLIENTES = [
    (1, "Ana Ribeiro", "ana.ribeiro@exemplo.pt", "Lisboa", (2024, 1, 15)),
    (2, "Bruno Costa", "bruno.costa@exemplo.pt", "Porto", (2024, 2, 3)),
    (3, "Carla Mendes", "carla.mendes@exemplo.pt", "Braga", (2024, 3, 21)),
    (4, "Diogo Pires", "diogo.pires@exemplo.pt", "Lisboa", (2024, 5, 9)),
]

with MongoClient(uri, serverSelectionTimeoutMS=3000) as client:
    db = client[base]
    for nome in ("produtos", "clientes", "encomendas", "linhas_encomenda"):
        db[nome].drop()
    db.produtos.insert_many(
        {"id": i, "nome": n, "categoria_id": c, "preco": p, "stock": s}
        for i, n, c, p, s in PRODUTOS)
    db.clientes.insert_many(
        {"id": i, "nome": n, "email": e, "cidade": ci,
         "data_registo": datetime(*d, tzinfo=timezone.utc)}
        for i, n, e, ci, d in CLIENTES)
    print(base, "->", db.produtos.count_documents({}), "produtos,",
          db.clientes.count_documents({}), "clientes")
