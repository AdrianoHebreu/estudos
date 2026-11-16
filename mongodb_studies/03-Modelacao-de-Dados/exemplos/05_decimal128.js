// Executar com: mongosh --quiet m03 --file 05_decimal128.js
db.precos.drop();

print("--- 1. double: a aritmética binária introduz erros de arredondamento");
db.precos.insertOne({ _id: "double", a: 0.1, b: 0.2, preco: 1.1, qtd: 3 });
printjson(db.precos.aggregate([{ $project: { soma: { $add: ["$a", "$b"] }, total: { $multiply: ["$preco", "$qtd"] } } }]).toArray()[0]);

print("--- 2. Decimal128: aritmética decimal exata");
db.precos.insertOne({ _id: "decimal", a: Decimal128("0.1"), b: Decimal128("0.2"), preco: Decimal128("1.1"), qtd: 3 });
printjson(db.precos.aggregate([{ $match: { _id: "decimal" } },
    { $project: { soma: { $add: ["$a", "$b"] }, total: { $multiply: ["$preco", "$qtd"] } } }]).toArray()[0]);

print("--- 3. Somar dez vezes 0.1, passo a passo ($reduce)");
db.precos.insertOne({ _id: "dez", d: Array(10).fill(0.1), c: Array(10).fill(Decimal128("0.1")) });
const somar = campo => ({ $reduce: { input: campo, initialValue: 0, in: { $add: ["$$value", "$$this"] } } });
printjson(db.precos.aggregate([{ $match: { _id: "dez" } },
    { $project: { _id: 0, double: somar("$d"), decimal: somar("$c") } }]).toArray()[0]);
print("$sum sobre 10 000 documentos com 0.1 (double): " + (() => {
    db.soma.drop();
    db.soma.insertMany(Array.from({ length: 10000 }, () => ({ v: 0.1 })));
    const r = db.soma.aggregate([{ $group: { _id: null, s: { $sum: "$v" } } }]).toArray()[0].s;
    db.soma.drop();
    return r;
})());

print("--- 4. Converter preços de double para Decimal128");
db.conv.drop();
db.conv.insertMany(db.produtos.find({ id: { $in: [1, 3] } }, { _id: 0, id: 1, preco: 1 }).toArray());
printjson(db.conv.aggregate([{ $sort: { id: 1 } }, { $project: { _id: 0, id: 1,
    original: "$preco",
    direto: { $toDecimal: "$preco" },                    // converte o double diretamente
    via_texto: { $toDecimal: { $toString: "$preco" } }   // converte a representação decimal mais curta
} }]).toArray());
db.conv.drop();
db.precos.drop();

print("--- 5. Totais das encomendas da loja em double: algum tem ruído antes de arredondar?");
const ruido = db.encomendas_v2.aggregate([
    { $project: { total: { $sum: { $map: { input: "$linhas", as: "l", in: { $multiply: ["$$l.quantidade", "$$l.preco_unitario"] } } } } } },
    { $match: { $expr: { $ne: ["$total", { $round: ["$total", 2] }] } } }
]).toArray();
print("encomendas com ruído: " + ruido.length + " de " + db.encomendas_v2.countDocuments());
