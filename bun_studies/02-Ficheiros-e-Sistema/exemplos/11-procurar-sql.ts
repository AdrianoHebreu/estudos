// A loja: procurar ficheiros .sql com Glob, contar instruções e chamar comandos externos
import { $ } from "bun";

const raiz = import.meta.dir + "/../../00-Introducao";
const encontrados: string[] = [];
for await (const f of new Bun.Glob("**/*.sql").scan({ cwd: raiz })) encontrados.push(f);
console.log("ficheiros .sql:", encontrados.map(f => f.replaceAll("\\", "/")));

for (const f of encontrados) {
  const texto = await Bun.file(`${raiz}/${f}`).text();
  const conta = (palavra: string) => texto.split("\n").filter(l => l.startsWith(palavra)).length;
  console.log(`${f.replaceAll("\\", "/")}: ${Bun.file(`${raiz}/${f}`).size} bytes, ${conta("CREATE TABLE")} tabelas, ${conta("INSERT INTO")} inserts`);
}

// Executar um comando externo, mas só se existir no sistema
const git = Bun.which("git");
if (git) {
  const versao = (await $`git --version`.text()).trim();
  console.log("git encontrado:", versao);
} else {
  console.log("git não está instalado; passo ao próximo");
}
const r = await $`git --no-such-flag`.nothrow().quiet();
console.log("git com opção inválida -> exitCode:", r.exitCode, "| stderr:", r.stderr.toString().split("\n")[0]);
