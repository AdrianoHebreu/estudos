// Índices simples, compostos, regra ESR e prefixo.
load("plano.js");
const e = db.getSiblingDB("m05").encomendas;
e.createIndex({ numero: 1 });
e.createIndex({ cliente_id: 1 });
plano("numero = 77777 (com índice)", e.find({ numero: 77777 }));
plano("cliente_id = 5047 (com índice)", e.find({ cliente_id: 5047 }));

// Igualdade (estado) + ordenação (data) + intervalo (total): a ordem ESR
const q = () => e.find({ estado: "pendente", total: { $gte: 400 } }).sort({ data_encomenda: -1 });
e.createIndex({ estado: 1, total: 1, data_encomenda: -1 }, { name: "estado_total_data" });   // E, R, S
e.createIndex({ estado: 1, data_encomenda: -1, total: 1 }, { name: "estado_data_total" });   // E, S, R
plano("sem limit, escolha do planeador", q());
plano("sem limit, hint estado_total_data (E R S)", q().hint("estado_total_data"));
plano("sem limit, hint estado_data_total (E S R)", q().hint("estado_data_total"));
const ql = () => q().limit(20);
plano("limit 20, hint estado_total_data (E R S)", ql().hint("estado_total_data"));
plano("limit 20, hint estado_data_total (E S R)", ql().hint("estado_data_total"));

// Prefixo: o índice serve consultas só pelos primeiros campos
plano("só estado (prefixo)", e.find({ estado: "pendente" }).hint("estado_data_total"));
plano("só total (sem o prefixo)", e.find({ total: { $gte: 400 } }));
