// Utilizador só para cópias de segurança: papéis integrados "backup" e "restore" na base admin.
// Em produção usa dois utilizadores diferentes (quem faz a cópia raramente precisa de restaurar).
const fs = require("fs");
const admin = db.getSiblingDB("admin");
admin.createUser({
  user: "copias",
  pwd: fs.readFileSync("/run/secrets/app_password", "utf8").trim(),
  roles: [{ role: "backup", db: "admin" }, { role: "restore", db: "admin" }]
});
printjson(admin.getUser("copias").roles);
