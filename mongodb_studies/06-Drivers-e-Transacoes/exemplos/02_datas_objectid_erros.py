"""Datas, ObjectId e tratamento de erros com pymongo (base m06, servidor partilhado)."""
from datetime import date, datetime, timedelta, timezone

from bson import ObjectId
from bson.errors import InvalidId
from bson.codec_options import CodecOptions
from pymongo import MongoClient
from pymongo.errors import (BulkWriteError, DuplicateKeyError, OperationFailure,
                            ServerSelectionTimeoutError)

client = MongoClient("mongodb://localhost:27117", serverSelectionTimeoutMS=3000)
db = client["m06"]
db.registos.drop()

# ---------- Datas ----------
# O MongoDB guarda datas em UTC, com precisão de milissegundos.
agora = datetime(2026, 11, 13, 9, 30, 15, 123456, tzinfo=timezone.utc)
db.registos.insert_one({"_id": "d1", "criado_em": agora})
lido = db.registos.find_one({"_id": "d1"})["criado_em"]
print("gravado :", agora.isoformat())
print("lido    :", lido.isoformat(), "| tzinfo =", lido.tzinfo)   # naive por omissão, microssegundos perdidos

aware = db.get_collection("registos", codec_options=CodecOptions(tz_aware=True))
lido = aware.find_one({"_id": "d1"})["criado_em"]
print("tz_aware:", lido.isoformat())

# Um datetime com fuso é convertido para UTC ao gravar.
lisboa_verao = datetime(2026, 7, 1, 12, 0, tzinfo=timezone(timedelta(hours=1)))
db.registos.insert_one({"_id": "d2", "criado_em": lisboa_verao})
print("12:00+01:00 ->", aware.find_one({"_id": "d2"})["criado_em"].isoformat())

# date puro não é suportado: converte para datetime.
try:
    db.registos.insert_one({"_id": "d3", "dia": date(2026, 11, 13)})
except Exception as e:
    print(type(e).__name__ + ":", e)
db.registos.insert_one({"_id": "d3", "dia": datetime(2026, 11, 13, tzinfo=timezone.utc)})

# Filtrar por intervalo de datas
desde, ate = datetime(2026, 7, 1, tzinfo=timezone.utc), datetime(2026, 12, 1, tzinfo=timezone.utc)
print("entre julho e dezembro:",
      sorted(d["_id"] for d in db.registos.find({"criado_em": {"$gte": desde, "$lt": ate}})))

# ---------- ObjectId ----------
doc = {"nome": "teste"}
r = db.registos.insert_one(doc)
print("inserted_id:", r.inserted_id, "| o dict ganhou _id:", doc["_id"] == r.inserted_id)
oid = r.inserted_id
print("str:", str(oid), "| tamanho:", len(str(oid)), "| tipo:", type(oid).__name__)
print("generation_time:", oid.generation_time.isoformat())
print("find_one por texto sem converter:", db.registos.find_one({"_id": str(oid)}))
print("find_one com ObjectId(texto)   :", db.registos.find_one({"_id": ObjectId(str(oid))}) is not None)
try:
    ObjectId("isto-nao-e-um-id")
except InvalidId as e:
    print("InvalidId:", e)
print("ObjectId.is_valid:", ObjectId.is_valid("65a1b2c3d4e5f6a7b8c9d0e1"), ObjectId.is_valid("xyz"))
# ObjectIds de um intervalo de tempo: from_datetime
print("from_datetime:", ObjectId.from_datetime(datetime(2026, 1, 1, tzinfo=timezone.utc)))

# ---------- Erros ----------
db.clientes.create_index("email", unique=True)
try:
    db.clientes.insert_one({"id": 20, "nome": "Duplicado", "email": "ana.ribeiro@exemplo.pt"})
except DuplicateKeyError as e:
    print("DuplicateKeyError code =", e.code, "| chave:", e.details["keyValue"])

try:
    db.clientes.insert_many([{"id": 21, "nome": "X", "email": "x@exemplo.pt"},
                             {"id": 22, "nome": "Y", "email": "bruno.costa@exemplo.pt"},
                             {"id": 23, "nome": "Z", "email": "z@exemplo.pt"}])
except BulkWriteError as e:
    print("BulkWriteError: inseridos =", e.details["nInserted"], "| erros =",
          [(w["index"], w["code"]) for w in e.details["writeErrors"]])
print("depois do erro, ids 21 a 23 existem:",
      sorted(c["id"] for c in db.clientes.find({"id": {"$gte": 21}})))

try:    # um erro do servidor que não é de escrita: operador inexistente
    db.clientes.find_one({"id": {"$naoexiste": 1}})
except OperationFailure as e:
    print("OperationFailure code =", e.code, "|", e.details["codeName"])

db.clientes.delete_many({"id": {"$gte": 21}})
db.clientes.drop_index("email_1")
db.registos.drop()
client.close()

# Servidor inacessível: nenhuma porta escuta em 31069, por isso a seleção de servidor expira.
mau = MongoClient("mongodb://localhost:31069", serverSelectionTimeoutMS=1500)   # o construtor não liga
inicio = datetime.now()
try:
    mau.admin.command("ping")
except ServerSelectionTimeoutError as e:
    print("ServerSelectionTimeoutError após", round((datetime.now() - inicio).total_seconds(), 1), "s")
    print(str(e)[:110])
mau.close()
