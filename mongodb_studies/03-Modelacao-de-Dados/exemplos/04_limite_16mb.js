// Executar com: mongosh --quiet m03 --file 04_limite_16mb.js
db.grande.drop();

const linha = { produto_id: 1, nome: "Romance Policial", quantidade: 1, preco_unitario: 12.9 };
print("tamanho de uma linha: " + bsonsize(linha) + " bytes");

function encomendaCom(n) {
    return { _id: 1, cliente_id: 1, linhas: Array.from({ length: n }, () => linha) };
}
[100, 10000, 100000, 300000].forEach(n => {
    const mb = bsonsize(encomendaCom(n)) / (1024 * 1024);
    print(n + " linhas -> " + mb.toFixed(2) + " MiB");
});

print("limite do servidor (maxBsonObjectSize): " + db.hello().maxBsonObjectSize + " bytes");
print("--- inserir um documento acima de 16 MiB (o mongosh recusa-o no cliente)");
try {
    db.grande.insertOne(encomendaCom(300000));
} catch (e) {
    print(e.name + ": " + e.message);
}

print("--- inserir um documento abaixo do limite");
const r = db.grande.insertOne(encomendaCom(100000));
print("inserido: " + r.acknowledged);

print("--- crescer um documento existente com $push até ultrapassar o limite");
try {
    for (let i = 0; i < 5; i++) {
        db.grande.updateOne({ _id: 1 }, { $push: { linhas: { $each: Array.from({ length: 50000 }, () => linha) } } });
        print("passo " + (i + 1) + " OK, linhas: " + db.grande.aggregate([{ $project: { n: { $size: "$linhas" } } }]).toArray()[0].n);
    }
} catch (e) {
    print(e.name + ": " + e.message);
}
db.grande.drop();
