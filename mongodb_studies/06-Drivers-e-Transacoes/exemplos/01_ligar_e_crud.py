"""Ligar com pymongo e fazer CRUD na coleção clientes (base m06, servidor partilhado)."""
import pymongo
from pymongo import MongoClient

print("pymongo", pymongo.version)

# Um único MongoClient por processo: gere o pool de ligações e a descoberta do servidor.
client = MongoClient(
    "mongodb://localhost:27117",
    maxPoolSize=20,                 # máximo de ligações no pool (por omissão 100)
    serverSelectionTimeoutMS=3000,  # quanto esperar por um servidor antes de falhar (omissão 30000)
    appname="curso-mongodb-m06",    # aparece nos logs e no currentOp do servidor
)
print("ping:", client.admin.command("ping"))
print("servidor:", client.server_info()["version"])
print("maxPoolSize:", client.options.pool_options.max_pool_size)

db = client["m06"]
clientes = db["clientes"]

# CREATE
r = clientes.insert_one({"id": 9, "nome": "Inês Falcão", "email": "ines.falcao@exemplo.pt",
                         "cidade": "Aveiro"})
print("insert_one:", r.inserted_id, r.acknowledged)
r = clientes.insert_many([
    {"id": 10, "nome": "João Sousa", "email": "joao.sousa@exemplo.pt", "cidade": "Porto"},
    {"id": 11, "nome": "Marta Reis", "email": "marta.reis@exemplo.pt", "cidade": "Porto"},
])
print("insert_many:", len(r.inserted_ids), "documentos")

# READ
print("find_one:", clientes.find_one({"id": 9}, {"_id": 0, "nome": 1, "cidade": 1}))
print("find_one sem resultado:", clientes.find_one({"id": 999}))
for c in clientes.find({"cidade": "Porto"}, {"_id": 0, "nome": 1}).sort("nome", 1):
    print("  Porto:", c["nome"])
print("count_documents:", clientes.count_documents({"cidade": "Lisboa"}))

# UPDATE
r = clientes.update_one({"id": 9}, {"$set": {"cidade": "Coimbra"}})
print("update_one:", r.matched_count, r.modified_count)
r = clientes.update_one({"id": 9}, {"$set": {"cidade": "Coimbra"}})   # mesmo valor
print("update_one repetido:", r.matched_count, r.modified_count)
r = clientes.update_many({"cidade": "Porto"}, {"$set": {"regiao": "Norte"}})
print("update_many:", r.matched_count, r.modified_count)
r = clientes.update_one({"id": 12}, {"$set": {"nome": "Rui Alves"}}, upsert=True)
print("upsert:", r.matched_count, r.modified_count, r.upserted_id)
depois = clientes.find_one_and_update(
    {"id": 12}, {"$set": {"cidade": "Viseu"}}, return_document=pymongo.ReturnDocument.AFTER)
print("find_one_and_update:", depois["nome"], depois["cidade"])
r = clientes.replace_one({"id": 12}, {"id": 12, "nome": "Rui Alves", "cidade": "Setúbal"})
print("replace_one:", r.matched_count, r.modified_count)

# DELETE
r = clientes.delete_one({"id": 9})
print("delete_one:", r.deleted_count)
r = clientes.delete_many({"id": {"$gte": 10}})
print("delete_many:", r.deleted_count)
print("restam:", clientes.count_documents({}))

client.close()   # liberta o pool; também funciona como "with MongoClient(...) as client"
