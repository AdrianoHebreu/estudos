// Consultas cobertas e regex com e sem âncora.
load("plano.js");
const bd = db.getSiblingDB("m05");
const e = bd.encomendas, c = bd.clientes;
e.createIndex({ cliente_id: 1, total: 1 }, { name: "cliente_total" });
plano("projeção com _id e total", e.find({ cliente_id: 5047 }, { total: 1 }));
plano("projeção _id:0, só campos do índice", e.find({ cliente_id: 5047 }, { _id: 0, cliente_id: 1, total: 1 }));
plano("projeção com campo fora do índice", e.find({ cliente_id: 5047 }, { _id: 0, cliente_id: 1, total: 1, estado: 1 }));
plano("coberta + sort", e.find({ cliente_id: 5047 }, { _id: 0, cliente_id: 1, total: 1 }).sort({ total: -1 }));

c.createIndex({ nome: 1 });
plano("regex sem âncora /Cliente 123/", c.find({ nome: /Cliente 123/ }));
plano("regex ancorada /^Cliente 123/", c.find({ nome: /^Cliente 123/ }));
plano("regex ancorada mas com /i", c.find({ nome: /^cliente 123/i }));
printjson(c.find({ nome: /^Cliente 123/ }).explain().queryPlanner.winningPlan.inputStage.indexBounds);
