// Correr com o utilizador admin:
//   docker exec est-mg07-auth mongosh --quiet "mongodb://admin:<palavra-passe>@localhost:27017/?authSource=admin" /exemplos/02_papeis_e_utilizadores.js
const loja = db.getSiblingDB("loja");

// 1. Quem sou eu e que papéis tenho?
printjson(db.getSiblingDB("admin").runCommand({ connectionStatus: 1, showPrivileges: false }).authInfo);

// 2. Papel à medida: só pode ler produtos e atualizar o stock (privilégios por ação e coleção)
loja.createRole({
  role: "gestor_stock",
  privileges: [
    { resource: { db: "loja", collection: "produtos" }, actions: ["find", "update"] }
  ],
  roles: []
});

// 3. Utilizador com esse papel e mais nada (sem palavra-passe no código: vem de fora)
const fs = require("fs");
loja.createUser({
  user: "armazem",
  pwd: fs.readFileSync("/run/secrets/app_password", "utf8").trim(),
  roles: [{ role: "gestor_stock", db: "loja" }]
});

// 4. Mudar papéis depois de criado
loja.grantRolesToUser("armazem", [{ role: "read", db: "loja" }]);
loja.revokeRolesFromUser("armazem", [{ role: "read", db: "loja" }]);

// 5. Ver o resultado
printjson(loja.getUsers().users.map(u => ({ user: u.user, roles: u.roles })));
printjson(loja.getRole("gestor_stock", { showPrivileges: true }).privileges);
