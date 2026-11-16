// Executar com: mongosh --quiet m03 --file 02_consultar_e_lookup.js
// Pré-requisito: 01_remodelar_loja.js já executado.

print("--- 1. Modelo plano: duas consultas para uma encomenda");
const e = db.encomendas.findOne({ id: 1 });
const ls = db.linhas_encomenda.find({ encomenda_id: 1 }).toArray();
print("encomenda " + e.id + " com " + ls.length + " linhas");

print("--- 2. Modelo remodelado: uma consulta");
const v2 = db.encomendas_v2.findOne({ _id: 1 });
print("encomenda " + v2._id + " com " + v2.linhas.length + " linhas");

print("--- 3. Pesquisa dentro do array (dot notation): encomendas com o produto 10");
printjson(db.encomendas_v2.find({ "linhas.produto_id": 10 }, { _id: 1 }).sort({ _id: 1 }).toArray());

print("--- 4. $lookup: juntar o cliente à encomenda");
db.encomendas_v2.aggregate([
    { $match: { _id: { $in: [1, 4] } } },
    { $lookup: { from: "clientes", localField: "cliente_id", foreignField: "id", as: "cliente" } },
    { $project: { estado: 1, "cliente.nome": 1, "cliente.cidade": 1 } }
]).forEach(d => printjson(d));

print("--- 5. $lookup com campo array: os produtos de uma encomenda");
db.encomendas_v2.aggregate([
    { $match: { _id: 3 } },
    { $lookup: { from: "produtos", localField: "linhas.produto_id", foreignField: "id", as: "produtos_atuais" } },
    { $project: { _id: 1, "produtos_atuais.nome": 1, "produtos_atuais.preco": 1 } }
]).forEach(d => printjson(d));

print("--- 6. Snapshot do preço: o produto 1 sobe de 12.9 para 14.5");
db.produtos.updateOne({ id: 1 }, { $set: { preco: 14.5 } });
printjson(db.produtos.findOne({ id: 1 }, { _id: 0, nome: 1, preco: 1 }));
printjson(db.encomendas_v2.findOne({ _id: 1 }, { _id: 0, "linhas.nome": 1, "linhas.preco_unitario": 1 }));
db.produtos.updateOne({ id: 1 }, { $set: { preco: 12.9 } });   // repor

print("--- 7. Atomicidade num só documento: estado e nova linha numa operação");
const r = db.encomendas_v2.updateOne(
    { _id: 8, estado: "pendente" },
    { $set: { estado: "enviada" },
      $push: { linhas: { produto_id: 10, nome: "Caneca de Cerâmica", quantidade: 1, preco_unitario: 6.5 } } }
);
print("matched=" + r.matchedCount + " modified=" + r.modifiedCount);
printjson(db.encomendas_v2.findOne({ _id: 8 }, { estado: 1, "linhas.produto_id": 1 }));
