"""Read concern e write concern com pymongo (replica set de 1 nó, porta 31060)."""
from pymongo import MongoClient
from pymongo.errors import WriteConcernError
from pymongo.read_concern import ReadConcern
from pymongo.write_concern import WriteConcern

client = MongoClient("mongodb://localhost:31060/?replicaSet=rs0", serverSelectionTimeoutMS=5000)
db = client["m06"]

# Os níveis podem ser definidos no cliente, na base de dados, na coleção ou na operação.
print("omissão do cliente :", client.write_concern.document, client.read_concern.document)

forte = db.get_collection("produtos", write_concern=WriteConcern(w="majority", j=True),
                          read_concern=ReadConcern("majority"))
print("coleção 'forte'    :", forte.write_concern.document, forte.read_concern.document)
r = forte.update_one({"id": 5}, {"$set": {"stock": 100}})
print("w=majority, j=True : acknowledged =", r.acknowledged)

# w=0: o servidor não confirma (fire and forget)
fogo = db.get_collection("produtos", write_concern=WriteConcern(w=0))
r = fogo.update_one({"id": 5}, {"$set": {"stock": 100}})
print("w=0                : acknowledged =", r.acknowledged, "| matched_count:", end=" ")
try:
    print(r.matched_count)
except Exception as e:
    print(type(e).__name__)

# Com um único nó, w=2 é impossível de cumprir
dois = db.get_collection("produtos", write_concern=WriteConcern(w=2, wtimeout=2000))
try:
    dois.update_one({"id": 5}, {"$set": {"stock": 100}})
except WriteConcernError as e:
    print("w=2                :", type(e).__name__, "code =", e.code, "|", e.details.get("codeName"))

client.close()
