// Custo dos índices na escrita, $indexStats e perfilador.
load("plano.js");
const bd = db.getSiblingDB("m05");
const e = bd.encomendas;
const cidades = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro"];
function lote(n) {
    return Array.from({ length: n }, (_, i) => ({ numero: i, cliente_id: i % 20000, estado: ["paga", "enviada", "entregue"][i % 3],
        cidade: cidades[i % 5], total: (i % 500) + 0.5, data_encomenda: new Date(1700000000000 + i * 60000) }));
}
const extra = [{ numero: 1 }, { cliente_id: 1 }, { estado: 1, total: 1 }, { cidade: 1, data_encomenda: -1 }, { total: 1 }];
function medir(com) {                    // devolve o tempo de inserir 20 000 documentos
    const c = bd.getCollection("custo"); c.drop();
    if (com) c.createIndexes(extra);
    const docs = lote(20000), t0 = Date.now();
    c.insertMany(docs, { ordered: false });
    const ms = Date.now() - t0; c.drop(); return ms;
}
const r0 = [], r5 = [];
for (let i = 0; i < 7; i++) { r0.push(medir(false)); r5.push(medir(true)); }
const mediana = (v) => v.slice().sort((a, b) => a - b)[3];
print("20 000 inserções, só _id:     " + r0.join(" ") + "  mediana " + mediana(r0) + " ms");
print("20 000 inserções, +5 índices: " + r5.join(" ") + "  mediana " + mediana(r5) + " ms");

print("--- perfilador");
bd.setProfilingLevel(2);
e.find({ total: { $lt: 5.3 } }).toArray();
e.find({ cliente_id: 5047 }).toArray();
bd.setProfilingLevel(0);
bd.system.profile.find({ ns: "m05.encomendas", op: "query" },
    { _id: 0, millis: 1, planSummary: 1, keysExamined: 1, docsExamined: 1, nreturned: 1 }).sort({ ts: 1 }).forEach(printjson);
bd.system.profile.drop();
bd.setProfilingLevel(1, { slowms: 20 });
printjson(bd.getProfilingStatus());
bd.setProfilingLevel(0);

print("--- $indexStats (acessos desde o arranque)");
e.aggregate([{ $indexStats: {} }, { $project: { _id: 0, name: 1, ops: "$accesses.ops" } }, { $sort: { ops: -1 } }]).forEach(printjson);
