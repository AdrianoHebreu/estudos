// Índice TTL: o servidor apaga documentos expirados. Vê quanto tempo demora.
const s = db.getSiblingDB("m05").sessoes;
s.drop();
s.createIndex({ criado_em: 1 }, { expireAfterSeconds: 30 });
const agora = Date.now();
s.insertMany([
    { _id: "velha1", criado_em: new Date(agora - 120 * 1000) },   // já passou o prazo
    { _id: "velha2", criado_em: new Date(agora - 60 * 1000) },
    { _id: "nova",   criado_em: new Date(agora) }                 // só expira daqui a 30 s
]);
print("inseridos: " + s.countDocuments());
let ultimo = 3;
for (let seg = 5; seg <= 120 && ultimo > 0; seg += 5) {
    sleep(5000);
    const n = s.countDocuments();
    if (n !== ultimo) { print("aos " + seg + " s restam " + n + " " + JSON.stringify(s.find().toArray().map((d) => d._id))); ultimo = n; }
}
s.drop();
