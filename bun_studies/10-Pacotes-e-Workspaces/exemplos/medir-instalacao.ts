// Mede o tempo de "bun install" com a cache vazia, cheia e com tudo já instalado.
// Segurança: cria uma pasta temporária com projeto E cache próprios (nunca toca em ~/.bun) e apaga-a no fim.
// Precisa de rede (descarrega 6 pacotes minúsculos do npm). Uso: bun medir-instalacao.ts [repetições]
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repeticoes = Number(process.argv[2] ?? 3);
const base = await mkdtemp(join(tmpdir(), "est-bn10-"));
const projeto = join(base, "projeto");
const cache = join(base, "cache");
await mkdir(projeto);

await Bun.write(
  join(projeto, "package.json"),
  JSON.stringify({
    name: "medir",
    version: "1.0.0",
    dependencies: { "is-odd": "^3.0.1", ms: "^2.1.3", "left-pad": "1.3.0" },
    devDependencies: { kleur: "^4.1.5", semver: "^7.6.0" },
  }),
);

async function instalar(): Promise<number> {
  const inicio = performance.now();
  const p = Bun.spawn([process.execPath, "install", "--no-progress", "--cache-dir", cache], {
    cwd: projeto,
    env: { ...process.env, BUN_INSTALL_CACHE_DIR: cache },
    stdout: "ignore",
    stderr: "ignore",
  });
  if ((await p.exited) !== 0) throw new Error("bun install falhou");
  return performance.now() - inicio;
}
const mediana = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const apagarNodeModules = () => rm(join(projeto, "node_modules"), { recursive: true, force: true });

try {
  const vazia: number[] = [], cheia: number[] = [], nada: number[] = [];
  for (let i = 0; i < repeticoes; i++) {
    await apagarNodeModules();
    await rm(cache, { recursive: true, force: true });
    vazia.push(await instalar()); // cache vazia: descarrega tudo (o bun.lock já existe a partir da 2.ª volta)
    await apagarNodeModules();
    cheia.push(await instalar()); // cache cheia: só liga os ficheiros
    nada.push(await instalar()); // node_modules completo: só verifica
  }
  console.log("mediana de", repeticoes, "execuções (ms, inclui o arranque do processo bun):");
  console.log(" cache vazia       ", mediana(vazia).toFixed(0));
  console.log(" cache cheia       ", mediana(cheia).toFixed(0));
  console.log(" nada para fazer   ", mediana(nada).toFixed(0));
} finally {
  await rm(base, { recursive: true, force: true });
}
