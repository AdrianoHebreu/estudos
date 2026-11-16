"""Transações multi-documento com pymongo.

Parte 1: servidor sem replica set (o partilhado, porta 27117) -> erro real.
Parte 2: replica set de 1 nó do compose-replset.yml (porta 31060) -> transações a funcionar.
Antes: python 00_preparar_loja.py "mongodb://localhost:31060/?replicaSet=rs0" m06
"""
import threading
import time
from datetime import datetime, timezone

from pymongo import MongoClient
from pymongo.read_concern import ReadConcern
from pymongo.write_concern import WriteConcern
from pymongo.errors import OperationFailure

# ---------- Parte 1: sem replica set ----------
print("=== Parte 1: servidor sem replica set ===")
solto = MongoClient("mongodb://localhost:27117", serverSelectionTimeoutMS=3000)
with solto.start_session() as s:       # a sessão cria-se sem problema
    try:
        with s.start_transaction():    # o erro só aparece na primeira operação dentro da transação
            solto["m06"].produtos.update_one({"id": 1}, {"$inc": {"stock": -1}}, session=s)
    except OperationFailure as e:
        print("OperationFailure code =", e.code, "|", e.details["codeName"])
        print(e)
solto.close()

# ---------- Parte 2: com replica set ----------
print("\n=== Parte 2: replica set rs0 ===")
client = MongoClient("mongodb://localhost:31060/?replicaSet=rs0", serverSelectionTimeoutMS=5000)
db = client["m06"]
client.admin.command("ping")
print("primário:", client.primary)


def stock(pid):
    return db.produtos.find_one({"id": pid})["stock"]


def criar_encomenda(session, cliente_id, itens, numero):
    """Corpo da transação. Pode ser executado mais do que uma vez (repetição automática):
    por isso só mexe na base de dados, sempre com session=session, e não tem efeitos fora dela."""
    db.encomendas.insert_one(
        {"id": numero, "cliente_id": cliente_id,
         "data_encomenda": datetime.now(timezone.utc), "estado": "pendente"}, session=session)
    for linha, (produto_id, quantidade) in enumerate(itens, start=1):
        p = db.produtos.find_one({"id": produto_id}, session=session)
        r = db.produtos.update_one({"id": produto_id, "stock": {"$gte": quantidade}},
                                   {"$inc": {"stock": -quantidade}}, session=session)
        if r.matched_count == 0:
            raise ValueError(f"stock insuficiente para o produto {produto_id}")
        db.linhas_encomenda.insert_one(
            {"id": numero * 10 + linha, "encomenda_id": numero, "produto_id": produto_id,
             "quantidade": quantidade, "preco_unitario": p["preco"]}, session=session)
    return numero


# 1) Sucesso: encomenda 100 com 2x produto 1 e 1x produto 5
print("stock antes     (1 e 5):", stock(1), stock(5))
with client.start_session() as s:
    n = s.with_transaction(lambda sess: criar_encomenda(sess, 1, [(1, 2), (5, 1)], 100))
print("commit da encomenda", n, "| stock depois:", stock(1), stock(5),
      "| linhas:", db.linhas_encomenda.count_documents({"encomenda_id": 100}))

# 2) Falha a meio: a 1.ª linha já baixou o stock, a 2.ª falha (produto 6 tem stock 0) -> rollback
print("\nstock antes     (1 e 6):", stock(1), stock(6))
try:
    with client.start_session() as s:
        s.with_transaction(lambda sess: criar_encomenda(sess, 2, [(1, 1), (6, 1)], 101))
except ValueError as e:
    print("erro:", e)
print("stock depois    (1 e 6):", stock(1), stock(6),
      "| encomenda 101 existe:", db.encomendas.count_documents({"id": 101}) == 1)

# 3) Isolamento: com snapshot, a transação não vê escritas feitas por outros depois de começar
print("\n--- snapshot ---")
with client.start_session() as s:
    with s.start_transaction(read_concern=ReadConcern("snapshot"),
                             write_concern=WriteConcern("majority")):
        dentro1 = db.produtos.find_one({"id": 10}, session=s)["stock"]
        db.produtos.update_one({"id": 10}, {"$inc": {"stock": -50}})   # fora da transação
        dentro2 = db.produtos.find_one({"id": 10}, session=s)["stock"]
        print("dentro da transação:", dentro1, "->", dentro2, "| fora:", stock(10))
db.produtos.update_one({"id": 10}, {"$set": {"stock": 200}})

# 4) Conflito de escrita: duas transações mexem no mesmo documento
print("\n--- conflito ---")
sa, sb = client.start_session(), client.start_session()
sa.start_transaction()
db.produtos.update_one({"id": 2}, {"$inc": {"stock": -1}}, session=sa)
sb.start_transaction()
try:
    db.produtos.update_one({"id": 2}, {"$inc": {"stock": -1}}, session=sb)
except OperationFailure as e:
    print("OperationFailure code =", e.code, "|", e.details["codeName"])
    print("TransientTransactionError:", e.has_error_label("TransientTransactionError"))
    sb.abort_transaction()
sa.commit_transaction()
print("stock produto 2:", stock(2), "(só a transação A foi aplicada)")
sa.end_session()
sb.end_session()

# 4b) with_transaction repete o corpo quando o erro é transitório (como o WriteConflict)
print("\n--- repetição automática ---")
tentativas = []


def baixar_um(sess):
    tentativas.append(1)
    db.produtos.update_one({"id": 3}, {"$inc": {"stock": -1}}, session=sess)


def tarefa():
    with client.start_session() as sess:
        sess.with_transaction(baixar_um)


bloqueio = client.start_session()
bloqueio.start_transaction()
db.produtos.update_one({"id": 3}, {"$inc": {"stock": -1}}, session=bloqueio)   # segura o documento
t = threading.Thread(target=tarefa)
t.start()
time.sleep(0.5)
bloqueio.commit_transaction()    # liberta o documento; a repetição seguinte já passa
t.join()
bloqueio.end_session()
print("o corpo correu", len(tentativas), "vezes (mais do que 1) | stock produto 3:", stock(3), "(10 - 2)")

# 5) Alternativa sem transação: um único documento é atómico
print("\n--- atomicidade num só documento ---")
r = db.produtos.update_one({"id": 8, "stock": {"$gte": 5}}, {"$inc": {"stock": -5}})
print("baixar 5 ao produto 8:", r.modified_count, "| stock:", stock(8))
r = db.produtos.update_one({"id": 8, "stock": {"$gte": 5}}, {"$inc": {"stock": -5}})
print("baixar mais 5       :", r.modified_count, "(sem stock suficiente, nada muda) | stock:", stock(8))

client.close()
