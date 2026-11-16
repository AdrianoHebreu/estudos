"""Change streams (exigem replica set: porta 31060 do compose-replset.yml)."""
import threading
import time
from datetime import datetime, timezone

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:31060/?replicaSet=rs0", serverSelectionTimeoutMS=5000)
db = client["m06"]
db.alertas.drop()
eventos = []
pronto = threading.Event()


def ouvir():
    # O filtro (pipeline) corre no servidor: só chegam inserções e atualizações.
    pipeline = [{"$match": {"operationType": {"$in": ["insert", "update"]}}}]
    with db.alertas.watch(pipeline, full_document="updateLookup", max_await_time_ms=500) as stream:
        pronto.set()
        fim = time.time() + 4
        while time.time() < fim:
            alteracao = stream.try_next()      # devolve None se não houver novidades
            if alteracao:
                eventos.append(alteracao)
        eventos.append({"resume_token": stream.resume_token})


t = threading.Thread(target=ouvir)
t.start()
pronto.wait()

db.alertas.insert_one({"_id": 1, "produto_id": 6, "mensagem": "stock a zero", "visto": False})
db.alertas.update_one({"_id": 1}, {"$set": {"visto": True}})
db.alertas.insert_one({"_id": 2, "produto_id": 8, "mensagem": "stock baixo", "visto": False})
db.alertas.delete_one({"_id": 2})             # filtrado: não chega ao ouvinte
t.join()

for ev in eventos:
    if "operationType" in ev:
        print(ev["operationType"], "|", ev.get("documentKey"), "|", ev.get("fullDocument"))
    else:
        print("resume_token guardado:", bool(ev["resume_token"]))
db.alertas.drop()
client.close()
