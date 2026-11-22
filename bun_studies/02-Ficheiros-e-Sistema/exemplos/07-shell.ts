// Bun.$: o shell nativo e multiplataforma do Bun
import { $ } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";

const pasta = (await mkdtemp(join(tmpdir(), "bn02-"))).replaceAll("\\", "/");
const sql = pasta + "/loja.sql";
await Bun.write(sql, "CREATE TABLE a;\nINSERT 1;\nINSERT 2;\nINSERT 3;\n");

console.log("--- 1. executar, ler texto e linhas");
await $`echo Olá a partir do shell do Bun`.quiet().then(r => console.log("exitCode:", r.exitCode));
console.log(JSON.stringify(await $`cat ${sql}`.text()));
const linhas = (await $`cat ${sql}`.text()).trim().split("\n");
console.log("linhas:", linhas.length);
for await (const l of $`cat ${sql}`.lines()) if (l.startsWith("INSERT")) console.log(" ", l);
console.log(await $`echo ${'{"produto": "Caneca", "preco": 6.5}'}`.json());

console.log("--- 2. variáveis são escapadas");
const perigoso = "loja.sql; echo PERIGO";
console.log(JSON.stringify(await $`echo ${perigoso}`.text()));
console.log("escape:", $.escape(perigoso));

console.log("--- 3. pipes e redirecionamentos (embutidos: cat, echo, ls)");
await $`cat ${sql} > ${pasta}/copia.sql`;
await $`echo "-- fim" >> ${pasta}/copia.sql`;
console.log((await $`ls ${pasta}`.text()).trim().split("\n"));
console.log((await $`cat ${pasta}/copia.sql`.text()).trim().split("\n").at(-1));
console.log(JSON.stringify(await $`echo a b c | cat`.text()));

console.log("--- 4. erros e código de saída");
try {
  await $`ls ${pasta}/nao-existe`.quiet();
} catch (e: any) {
  console.log(e.constructor.name, "exitCode:", e.exitCode, "| stderr:", e.stderr.toString().trim().replace(pasta, "<pasta>"));
}
const r = await $`ls ${pasta}/nao-existe`.nothrow().quiet();
console.log("nothrow -> exitCode:", r.exitCode, "| stdout vazio:", r.stdout.length === 0);

console.log("--- 5. env, cwd e comandos encadeados");
console.log((await $`echo $PRODUTO`.env({ PRODUTO: "Teclado Mecânico" }).text()).trim());
console.log((await $`cd ${pasta} && ls`.text()).trim().split("\n"));
console.log((await $`pwd`.cwd(pasta).text()).trim() === pasta);
console.log((await $`false || echo plano B`.text()).trim());

console.log("--- 6. sem comandos externos: só os embutidos do Bun");
const so = await $`ls ${pasta}`.env({ PATH: "" }).text();
console.log("ls sem PATH:", so.trim().split("\n"));
const semPath = await $`wc -l ${sql}`.env({ PATH: "" }).nothrow().quiet();
console.log("wc sem PATH:", semPath.exitCode, semPath.stderr.toString().trim());

console.log("--- 7. executar o próprio bun");
console.log((await $`bun --version`.text()).trim());

console.log("--- 8. acentos no texto literal (Windows, Bun 1.4.0)");
console.log("literal   :", (await $`echo olá`.text()).trim());
console.log("interpolado:", (await $`echo ${"olá"}`.text()).trim());

await $`rm -rf ${pasta}`;
console.log("pasta removida:", !existsSync(pasta));
