"""bulk_write, cursores e paginação (base m06, servidor partilhado)."""
from pymongo import DeleteOne, InsertOne, MongoClient, ReplaceOne, UpdateOne
from pymongo.errors import BulkWriteError

client = MongoClient("mongodb://localhost:27117", serverSelectionTimeoutMS=3000)
db = client["m06"]
produtos = db["produtos"]

# ---------- bulk_write: várias operações numa só ida ao servidor ----------
operacoes = [
    InsertOne({"id": 11, "nome": "Mochila", "categoria_id": 3, "preco": 39.9, "stock": 12}),
    UpdateOne({"id": 1}, {"$inc": {"stock": -2}}),
    UpdateOne({"id": 6}, {"$set": {"stock": 25}}),
    ReplaceOne({"id": 10}, {"id": 10, "nome": "Caneca de Cerâmica", "categoria_id": 3,
                            "preco": 7.0, "stock": 200}),
    DeleteOne({"id": 11}),
]
r = produtos.bulk_write(operacoes)   # ordered=True por omissão: executa pela ordem e pára no primeiro erro
print("inseridos:", r.inserted_count, "| encontrados:", r.matched_count,
      "| modificados:", r.modified_count, "| apagados:", r.deleted_count)

# Upserts em bloco: atualiza se existir, cria se não existir.
novos = [{"id": 12, "nome": "Rato Sem Fios", "categoria_id": 2, "preco": 19.9, "stock": 50},
         {"id": 1, "nome": "Romance Policial", "categoria_id": 1, "preco": 12.9, "stock": 35}]
r = produtos.bulk_write([UpdateOne({"id": d["id"]}, {"$set": d}, upsert=True) for d in novos])
print("upserts:", r.upserted_count, "| modificados:", r.modified_count, "| ids:", r.upserted_ids)

# ordered=True versus ordered=False perante um erro (índice único em id)
produtos.create_index("id", unique=True)
lote = [InsertOne({"id": 13, "nome": "A"}), InsertOne({"id": 1, "nome": "repetido"}),
        InsertOne({"id": 14, "nome": "B"})]
for ordenado in (True, False):
    try:
        produtos.bulk_write(lote, ordered=ordenado)
    except BulkWriteError as e:
        d = e.details
        print(f"ordered={ordenado}: inseridos={d['nInserted']}, erros={[w['index'] for w in d['writeErrors']]}")
    produtos.delete_many({"id": {"$in": [13, 14]}})
produtos.drop_index("id_1")

# ---------- Cursores ----------
cursor = produtos.find({}, {"_id": 0, "id": 1, "nome": 1}).sort("id", 1).batch_size(4)
print("tipo:", type(cursor).__name__, "| nada foi pedido ainda ao servidor")
primeiro = next(cursor)               # pede o 1.º lote (batch_size=4)
print("primeiro:", primeiro)
print("alive:", cursor.alive)
restantes = list(cursor)              # consome o resto
print("restantes:", len(restantes), "| alive:", cursor.alive)
cursor.close()                        # libertar cursores abandonados antes do fim

# with garante o fecho do cursor mesmo com break ou exceção
with produtos.find({"preco": {"$gt": 30}}, {"_id": 0, "nome": 1, "preco": 1}).sort("preco", -1) as c:
    for p in c:
        print("  caro:", p)
        break

# ---------- Paginação ----------
TAMANHO = 4
print("-- skip/limit")
for pagina in range(3):
    ids = [p["id"] for p in produtos.find({}, {"_id": 0, "id": 1}).sort("id", 1)
           .skip(pagina * TAMANHO).limit(TAMANHO)]
    print("página", pagina + 1, ids)

print("-- por intervalo (a partir do último id visto)")
ultimo, pagina = 0, 1
while True:
    ids = [p["id"] for p in produtos.find({"id": {"$gt": ultimo}}, {"_id": 0, "id": 1})
           .sort("id", 1).limit(TAMANHO)]
    if not ids:
        break
    print("página", pagina, ids)
    ultimo, pagina = ids[-1], pagina + 1

# Repor os dados desta demonstração
produtos.delete_one({"id": 12})
produtos.update_one({"id": 1}, {"$set": {"stock": 40}})
produtos.update_one({"id": 6}, {"$set": {"stock": 0}})
produtos.update_one({"id": 10}, {"$set": {"preco": 6.5}})
client.close()
