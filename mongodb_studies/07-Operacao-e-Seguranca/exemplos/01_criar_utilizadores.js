// Corre uma única vez, na primeira inicialização do contentor (docker-entrypoint-initdb.d).
// As palavras-passe lêem-se dos ficheiros de segredos montados pelo Compose.
const fs = require("fs");
const lerSegredo = (nome) => fs.readFileSync("/run/secrets/" + nome, "utf8").trim();
const loja = db.getSiblingDB("loja");

loja.createUser({
  user: "app_loja",
  pwd: lerSegredo("app_password"),
  roles: [{ role: "readWrite", db: "loja" }]   // ler e escrever só na base loja
});

loja.createUser({
  user: "leitor_loja",
  pwd: lerSegredo("leitor_password"),
  roles: [{ role: "read", db: "loja" }]        // só leitura, só na base loja
});

// dados de arranque para os testes
loja.produtos.insertMany([
  { id: 1, nome: "Romance Policial", preco: 12.9, stock: 40 },
  { id: 2, nome: "Livro de Receitas", preco: 18.5, stock: 25 }
]);
print("utilizadores criados: " + loja.getUsers().users.map(u => u.user).join(", "));
