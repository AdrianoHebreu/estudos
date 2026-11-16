"""Aggregation com pymongo na base m04 do servidor de estudo (porta 27117, sem autenticação).

Em Python o pipeline é uma lista de dicionários. aggregate() devolve um cursor.
"""
from datetime import datetime, timezone

from pymongo import MongoClient

cliente = MongoClient("mongodb://localhost:27117")
db = cliente["m04"]

# 1) Receita por categoria, sem encomendas canceladas.
#    Começa pelas encomendas para o $match filtrar logo no início.
receita_por_categoria = [
    {"$match": {"estado": {"$ne": "cancelada"}}},
    {"$lookup": {"from": "linhas_encomenda", "localField": "id",
                 "foreignField": "encomenda_id", "as": "linha"}},
    {"$unwind": "$linha"},
    {"$lookup": {"from": "produtos", "localField": "linha.produto_id",
                 "foreignField": "id", "as": "produto"}},
    {"$unwind": "$produto"},
    {"$lookup": {"from": "categorias", "localField": "produto.categoria_id",
                 "foreignField": "id", "as": "categoria"}},
    {"$unwind": "$categoria"},
    {"$group": {"_id": "$categoria.nome",
                "unidades": {"$sum": "$linha.quantidade"},
                "receita": {"$sum": {"$multiply": ["$linha.quantidade",
                                                   "$linha.preco_unitario"]}}}},
    {"$set": {"receita": {"$round": ["$receita", 2]}}},
    {"$sort": {"receita": -1}},
]
print("Receita por categoria:")
for doc in db.encomendas.aggregate(receita_por_categoria):
    print(" ", doc)


# 2) Pipeline parametrizado: encomendas desde uma data, por estado.
def encomendas_por_estado(desde):
    return list(db.encomendas.aggregate([
        {"$match": {"data_encomenda": {"$gte": desde}}},
        {"$group": {"_id": "$estado", "n": {"$sum": 1}}},
        {"$sort": {"n": -1, "_id": 1}},
    ]))


# As datas vão como datetime com fuso, não como texto.
desde = datetime(2025, 4, 1, tzinfo=timezone.utc)
print("Encomendas desde 2025-04-01:", encomendas_por_estado(desde))

cliente.close()
