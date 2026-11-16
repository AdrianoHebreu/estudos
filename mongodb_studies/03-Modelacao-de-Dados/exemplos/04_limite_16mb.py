# Um documento acima de 16 MiB é recusado pelo driver antes de chegar ao servidor.
# Executar: python 04_limite_16mb.py   (precisa de: pip install pymongo, num ambiente virtual)
from pymongo import MongoClient
from pymongo.errors import DocumentTooLarge

db = MongoClient("mongodb://localhost:27117")["m03"]
print("maxBsonObjectSize:", db.client.admin.command("hello")["maxBsonObjectSize"])
try:
    db.teste_limite.insert_one({"blob": "x" * (17 * 1024 * 1024)})
except DocumentTooLarge as e:
    print(type(e).__name__, "-", e)
print("documentos guardados:", db.teste_limite.count_documents({}))
