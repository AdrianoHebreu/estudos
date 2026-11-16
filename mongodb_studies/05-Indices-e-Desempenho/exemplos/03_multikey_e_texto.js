// Índices multikey (arrays), regra dos arrays paralelos e índice de texto.
load("plano.js");
const bd = db.getSiblingDB("m05");
const e = bd.encomendas, p = bd.produtos;
e.createIndex({ etiquetas: 1 });
plano("etiquetas = urgente (multikey)", e.find({ etiquetas: "urgente" }));
plano("etiquetas = urgente, COLLSCAN forçado", e.find({ etiquetas: "urgente" }).hint({ $natural: 1 }));
print("isMultiKey: " + e.find({ etiquetas: "urgente" }).explain().queryPlanner.winningPlan.inputStage.isMultiKey);
e.dropIndex("etiquetas_1");

e.createIndex({ cidade: 1, etiquetas: 1 });          // um só array no índice composto: permitido
plano("cidade + etiqueta (multikey composto)", e.find({ cidade: "Faro", etiquetas: "urgente" }));
const d = bd.paralelos; d.drop();
d.createIndex({ a: 1, b: 1 });
try { d.insertOne({ a: [1, 2], b: [3, 4] }); } catch (x) { print("erro: " + x.message.slice(0, 80)); }
d.drop();

print(p.createIndex({ nome: "text", descricao: "text" }, { name: "texto_produtos", default_language: "portuguese" }));
plano("$text teclado ergonómico", p.find({ $text: { $search: "teclado ergonómico" } }));
printjson(p.find({ $text: { $search: "teclado ergonómico" } }, { _id: 0, nome: 1, score: { $meta: "textScore" } })
           .sort({ score: { $meta: "textScore" } }).limit(2).toArray());
printjson(p.find({ $text: { $search: "\"teclado premium\" -rato" } }, { _id: 0, nome: 1 }).limit(2).toArray());
