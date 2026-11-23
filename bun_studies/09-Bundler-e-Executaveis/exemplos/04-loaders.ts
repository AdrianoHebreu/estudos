import { extname } from "node:path";
// Loaders: o que o Bun faz a cada tipo de ficheiro que importas. Para cada ficheiro de ativos/ compila-se
// um import mínimo (ficheiro virtual, opção files) e mostra-se o código gerado e os ficheiros extra.
const ficheiros = ["produtos.json", "loja.toml", "loja.yaml", "aviso.txt", "estilo.css", "logo.svg", "produtos.csv"];

console.log("ficheiro".padEnd(15), "código gerado para o import".padEnd(58), "ficheiros extra");
for (const nome of ficheiros) {
  const r = await Bun.build({
    entrypoints: ["./entrada.ts"],
    files: { "./entrada.ts": `import x from "./ativos/${nome}"; console.log(x);` },
    throw: false,
  });
  if (!r.success) {
    console.log(nome.padEnd(15), "FALHOU:", r.logs.map((l) => l.message).join("; "));
    continue;
  }
  const codigo = await r.outputs[0].text();
  const linha = codigo.split("\n").find((l) => l.startsWith("var ")) ?? "(sem var)";
  const extra = r.outputs.filter((o) => o.kind !== "entry-point").map((o) => o.kind + " " + extname(o.path));
  console.log(nome.padEnd(15), linha.slice(0, 56).padEnd(58), extra.join(", ") || "-");
}

// A opção loader muda o tratamento por extensão. Mensagem real da 1.4.0 com um nome inválido:
try {
  await Bun.build({ entrypoints: ["./app/cli.ts"], loader: { ".csv": "binary" as never } });
} catch (e) {
  console.log("\nloader inválido:", (e as Error).message);
}

// Os loaders servem também para tratar uma extensão como outra
const r = await Bun.build({
  entrypoints: ["./entrada.ts"],
  files: { "./entrada.ts": 'import x from "./ativos/produtos.csv"; console.log(x);' },
  loader: { ".csv": "text" },
});
console.log("csv como text   :", (await r.outputs[0].text()).split("\n").find((l) => l.startsWith("var "))!.slice(0, 70));
