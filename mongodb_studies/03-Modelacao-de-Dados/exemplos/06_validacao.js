// Executar com: mongosh --quiet m03 --file 06_validacao.js
// Pré-requisito: coleções planas importadas (usa uma cópia de produtos).
const esquema = {
    bsonType: "object",
    required: ["id", "nome", "preco", "stock"],
    properties: {
        id:    { bsonType: "int" },
        nome:  { bsonType: "string", minLength: 1 },
        preco: { bsonType: "decimal", minimum: 0 },
        stock: { bsonType: "int", minimum: 0 }
    }
};
function tentar(rotulo, fn) {
    try { fn(); print(rotulo + ": aceite"); }
    catch (e) { print(rotulo + ": erro " + e.code + " - " + e.message); }
}

print("=== 1. Coleção nova com validador (strict, error)");
db.pv.drop();
db.createCollection("pv", { validator: { $jsonSchema: esquema }, validationLevel: "strict", validationAction: "error" });
tentar("preço double", () => db.pv.insertOne({ id: 1, nome: "Romance Policial", preco: 12.9, stock: 40 }));
tentar("stock negativo", () => db.pv.insertOne({ id: 2, nome: "Atlas", preco: Decimal128("29.99"), stock: NumberInt(-1) }));
tentar("falta o nome", () => db.pv.insertOne({ id: 3, preco: Decimal128("5.00"), stock: NumberInt(1) }));
tentar("documento válido", () => db.pv.insertOne({ id: 4, nome: "Caneca", preco: Decimal128("6.50"), stock: NumberInt(8) }));

print("=== 2. Detalhe do erro (errInfo) para um preço double");
try { db.pv.insertOne({ id: 5, nome: "Lápis", preco: 1.5, stock: NumberInt(3) }); }
catch (e) { printjson(e.errInfo.details.schemaRulesNotSatisfied); }

print("=== 3. collMod: acrescentar o validador a uma coleção que já tem dados");
db.pm.drop(); db.ps.drop();
db.pm.insertMany(db.produtos.find({}, { _id: 0 }).toArray());
db.ps.insertMany(db.produtos.find({}, { _id: 0 }).toArray());
const invalidos = db.pm.countDocuments({ $nor: [{ $jsonSchema: esquema }] });
print("documentos que já violam o esquema (preço é double): " + invalidos);
db.runCommand({ collMod: "pm", validator: { $jsonSchema: esquema }, validationLevel: "moderate" });
db.runCommand({ collMod: "ps", validator: { $jsonSchema: esquema }, validationLevel: "strict" });
tentar("moderate: atualizar documento antigo inválido", () => db.pm.updateOne({ id: 1 }, { $set: { stock: 41 } }));
tentar("strict: atualizar documento antigo inválido ", () => db.ps.updateOne({ id: 1 }, { $set: { stock: 41 } }));
tentar("moderate: inserir documento novo inválido  ", () => db.pm.insertOne({ id: 99, nome: "X", preco: 1.5, stock: 1 }));

print("=== 4. validationAction warn: aceita e regista no log");
db.runCommand({ collMod: "pm", validationAction: "warn", validationLevel: "strict" });
tentar("warn: inserir documento inválido", () => db.pm.insertOne({ id: 98, nome: "Y", preco: 1.5, stock: NumberInt(1) }));
const linhas = db.adminCommand({ getLog: "global" }).log.map(l => JSON.parse(l)).filter(l => l.msg === "Document would fail validation");
print("entradas no log com a mensagem 'Document would fail validation': " + linhas.length);
if (linhas.length) print("nível " + linhas[linhas.length - 1].s + ", coleção " + linhas[linhas.length - 1].attr.namespace);

print("=== 5. Opções guardadas na coleção");
printjson(db.getCollectionInfos({ name: "pm" })[0].options.validationAction + " / " + db.getCollectionInfos({ name: "pm" })[0].options.validationLevel);

print("=== 6. bypassDocumentValidation");
db.runCommand({ collMod: "ps", validationAction: "error" });
printjson(db.runCommand({ insert: "ps", documents: [{ id: 97, nome: "Z", preco: 1.5, stock: 1 }], bypassDocumentValidation: true }).n);
["pv", "pm", "ps"].forEach(c => db[c].drop());
