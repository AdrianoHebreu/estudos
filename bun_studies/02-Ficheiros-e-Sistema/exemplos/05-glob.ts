// Bun.Glob: padrões com scan (ficheiros reais) e match (texto)
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const raiz = await mkdtemp(join(tmpdir(), "bn02-")).then(p => p.replaceAll("\\", "/"));
for (const f of ["loja.sql", "dados/clientes.sql", "dados/produtos.sql", "dados/notas.txt",
                 "dados/.oculto.sql", "src/api/rotas.ts", "src/api/util.ts", "src/main.ts", "README.txt"]) {
  await Bun.write(`${raiz}/${f}`, "-- " + f + "\n");
}
await mkdir(`${raiz}/vazia`, { recursive: true });

async function lista(padrao: string, opcoes: object = {}) {
  const glob = new Bun.Glob(padrao);
  const r: string[] = [];
  for await (const f of glob.scan({ cwd: raiz, ...opcoes })) r.push(f.replaceAll("\\", "/"));  // no Windows o scan devolve barras invertidas
  return r.sort().join("  ");
}

console.log("*.sql              ", await lista("*.sql"));
console.log("**/*.sql           ", await lista("**/*.sql"));
console.log("**/*.sql (dot)     ", await lista("**/*.sql", { dot: true }));
console.log("src/**/*.ts        ", await lista("src/**/*.ts"));
console.log("{src,dados}/*.*    ", await lista("{src,dados}/*.*"));
console.log("dados/[cp]*.sql    ", await lista("dados/[cp]*.sql"));
console.log("*  (onlyFiles)     ", await lista("*"));
console.log("*  (todas as entradas)", await lista("*", { onlyFiles: false }));
console.log("**/*.ts, absolutos ", (await lista("**/*.ts", { absolute: true })).split("  ").map(p => p.slice(raiz.length + 1)).join("  "));

// match: só compara texto com o padrão, não toca no disco
const g = new Bun.Glob("**/*.{ts,tsx}");
for (const caminho of ["src/main.ts", "src/ui/App.tsx", "src/main.js", "README.txt"]) {
  console.log(`match ${caminho.padEnd(15)} ->`, g.match(caminho));
}

// scanSync existe para código síncrono
console.log("scanSync:", [...new Bun.Glob("*.txt").scanSync({ cwd: raiz })].join("  "));

await rm(raiz, { recursive: true, force: true });
