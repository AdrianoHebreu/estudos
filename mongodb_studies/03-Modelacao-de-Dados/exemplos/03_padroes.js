// Executar com: mongosh --quiet m03 --file 03_padroes.js
// Pré-requisito: 01_remodelar_loja.js já executado (cria encomendas_v2).

print("=== Subset: só as 3 avaliações mais recentes dentro do produto");
db.avaliacoes.drop();
const vistos = [];
for (let i = 1; i <= 8; i++) {
    const av = { produto_id: 6, autor: "cliente" + i, nota: 3 + (i % 3), data: new Date(Date.UTC(2025, 5, i)) };
    db.avaliacoes.insertOne(av);                            // histórico completo, noutra coleção
    db.produtos.updateOne({ id: 6 }, {                      // cópia limitada dentro do produto
        $push: { ultimas_avaliacoes: { $each: [av], $sort: { data: -1 }, $slice: 3 } }
    });
}
const p6 = db.produtos.findOne({ id: 6 }, { _id: 0, nome: 1, "ultimas_avaliacoes.autor": 1 });
printjson(p6);
print("avaliacoes (coleção completa): " + db.avaliacoes.countDocuments({ produto_id: 6 }));

print("=== Bucket: histórico de preços em baldes de 3 alterações");
db.historico_precos.drop();
const precos = [12.9, 13.5, 13.9, 14.5, 14.2, 14.9, 15.5];
precos.forEach((preco, i) => {
    db.historico_precos.updateOne(
        { produto_id: 1, contagem: { $lt: 3 } },            // balde com espaço livre
        { $push: { alteracoes: { data: new Date(Date.UTC(2025, i, 1)), preco: preco } },
          $inc: { contagem: 1 } },
        { upsert: true }                                    // se não houver balde, cria um novo
    );
});
db.historico_precos.find({}, { _id: 0, produto_id: 1, contagem: 1, "alteracoes.preco": 1 }).forEach(d => printjson(d));

print("=== Computed: total guardado na encomenda");
db.encomendas_v2.updateMany({}, [
    { $set: {
        n_linhas: { $size: "$linhas" },
        total: { $round: [{ $sum: { $map: { input: "$linhas", as: "l",
                                            in: { $multiply: ["$$l.quantidade", "$$l.preco_unitario"] } } } }, 2] }
    } }
]);
db.encomendas_v2.find({ _id: { $in: [1, 5, 10] } }, { n_linhas: 1, total: 1 }).sort({ _id: 1 }).forEach(d => printjson(d));
// Manter o valor ao escrever: uma linha nova atualiza as linhas e o total na mesma operação atómica
db.encomendas_v2.updateOne({ _id: 12 }, {
    $push: { linhas: { produto_id: 5, nome: "Carregador USB-C", quantidade: 1, preco_unitario: 14.9 } },
    $inc: { n_linhas: 1, total: 14.9 }
});
printjson(db.encomendas_v2.findOne({ _id: 12 }, { n_linhas: 1, total: 1 }));

print("=== Extended reference: nome e cidade do cliente copiados para a encomenda");
db.clientes.find().forEach(c => {
    db.encomendas_v2.updateMany({ cliente_id: c.id }, { $set: { cliente: { id: c.id, nome: c.nome, cidade: c.cidade } } });
});
printjson(db.encomendas_v2.findOne({ _id: 1 }, { _id: 0, cliente_id: 1, cliente: 1 }));
print("encomendas de Lisboa, sem $lookup: " + db.encomendas_v2.countDocuments({ "cliente.cidade": "Lisboa" }));
// O preço a pagar: se o cliente mudar de nome, é preciso atualizar as cópias
db.clientes.updateOne({ id: 1 }, { $set: { nome: "Ana Ribeiro Silva" } });
print("na coleção clientes: " + db.clientes.findOne({ id: 1 }).nome +
      " | na encomenda 1 (cópia desatualizada): " + db.encomendas_v2.findOne({ _id: 1 }).cliente.nome);
db.clientes.updateOne({ id: 1 }, { $set: { nome: "Ana Ribeiro" } });   // repor
