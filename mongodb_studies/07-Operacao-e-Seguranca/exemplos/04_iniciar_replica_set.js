// Corre uma vez, a partir do contentor "iniciar", já autenticado como admin.
// priority 2 no mongo1 faz dele o candidato preferido a primário no arranque.
try {
  printjson(rs.status().members.map(m => m.name + " " + m.stateStr));
} catch (e) {
  printjson(rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongo1:27017", priority: 2 },
      { _id: 1, host: "mongo2:27017" },
      { _id: 2, host: "mongo3:27017" }
    ]
  }));
}
