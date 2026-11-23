// Inofensivo: escreve uma marca dentro da própria pasta do pacote.
require("node:fs").writeFileSync(__dirname + "/POSTINSTALL-CORREU.txt", "o postinstall correu em " + new Date().toISOString() + "\n");
console.log("[pacote-com-gancho] postinstall a correr");
