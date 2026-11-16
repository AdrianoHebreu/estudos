// Índices únicos, parciais e esparsos; tamanhos.
load("plano.js");
const bd = db.getSiblingDB("m05");
const e = bd.encomendas, c = bd.clientes;
print(c.createIndex({ email: 1 }, { unique: true }));
try { c.insertOne({ id: 99999, nome: "Duplicado", email: "cliente1@exemplo.pt" }); } catch (x) { print(x.message); }
try { c.createIndex({ cidade: 1 }, { unique: true }); } catch (x) { print(x.codeName); }

e.createIndex({ cupao: 1 }, { name: "cupao_completo" });
e.createIndex({ cupao: 1 }, { name: "cupao_esparso", sparse: true });
e.createIndex({ cupao: 1 }, { name: "cupao_parcial", partialFilterExpression: { cupao: { $exists: true } } });
e.createIndex({ data_encomenda: 1 }, { name: "data_completo" });
e.createIndex({ data_encomenda: 1 }, { name: "data_pendentes", partialFilterExpression: { estado: "pendente" } });
const t = e.stats().indexSizes;
["cupao_completo", "cupao_esparso", "cupao_parcial", "data_completo", "data_pendentes"]
    .forEach((n) => print(n + ": " + (t[n] / 1024).toFixed(0) + " KiB"));
const f = { estado: "pendente", data_encomenda: { $gte: ISODate("2024-12-01") } };
plano("pendentes recentes, índice parcial", e.find(f).hint("data_pendentes"));
plano("pendentes recentes, índice completo", e.find(f).hint("data_completo"));
plano("recentes de qualquer estado (sem estado na query)", e.find({ data_encomenda: f.data_encomenda }));
// Atenção: com hint num índice esparso o sort devolve menos documentos
print("sort por cupao, índice completo: " + e.find().sort({ cupao: 1 }).hint("cupao_completo").itcount() + " documentos");
print("sort por cupao, índice esparso:  " + e.find().sort({ cupao: 1 }).hint("cupao_esparso").itcount() + " documentos");
["cupao_completo", "cupao_parcial"].forEach((n) => e.dropIndex(n));
