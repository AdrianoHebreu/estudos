// Lê o bun.lock (JSONC: JSON com vírgulas finais) e mostra o que ficou instalado.
// Uso: bun 02-lock-resumo.ts caminho/para/bun.lock
const caminho = process.argv[2];
if (!caminho) {
  console.error("uso: bun 02-lock-resumo.ts <bun.lock>");
  process.exit(1);
}

const lock = Bun.JSONC.parse(await Bun.file(caminho).text()) as any;
console.log("lockfileVersion:", lock.lockfileVersion, "configVersion:", lock.configVersion);

console.log("\nworkspaces:");
for (const [pasta, ws] of Object.entries<any>(lock.workspaces)) {
  console.log(" ", pasta === "" ? "(raiz)" : pasta, "->", ws.name);
}

console.log("\npacotes:");
for (const [nome, entrada] of Object.entries<any[]>(lock.packages)) {
  // entrada[0] = "nome@versão" (ou nome@workspace:pasta), entrada[1] = registo, entrada[2] = metadados
  const [id, , meta] = entrada;
  const deps = Object.keys(meta?.dependencies ?? {});
  console.log(" ", nome.padEnd(16), id.padEnd(28), deps.length ? "depende de " + deps.join(", ") : "");
}
