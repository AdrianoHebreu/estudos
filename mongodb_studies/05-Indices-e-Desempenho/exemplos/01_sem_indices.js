// Ponto de partida: sem índices (além de _id), tudo é COLLSCAN.  mongosh --quiet 01_sem_indices.js
load("plano.js");
const e = db.getSiblingDB("m05").encomendas;
print(JSON.stringify(e.getIndexes()));
plano("numero = 77777", e.find({ numero: 77777 }));
plano("cliente_id = 5047", e.find({ cliente_id: 5047 }));
plano("pendentes com total >= 400, mais recentes primeiro",
      e.find({ estado: "pendente", total: { $gte: 400 } }).sort({ data_encomenda: -1 }));
