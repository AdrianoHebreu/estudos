// Importar ficheiros como texto, caminho ou objeto, com import attributes (with { type }).
// Corre com bun run e, tal e qual, dentro de um executável (módulo mais abaixo).
import aviso from "./ativos/aviso.txt" with { type: "text" };
import logo from "./ativos/logo.svg" with { type: "file" };
import config from "./ativos/loja.toml" with { type: "toml" };
import produtos from "./ativos/produtos.json" with { type: "json" };
import { basename } from "node:path";

console.log("text :", JSON.stringify(aviso));
console.log("toml :", config);
console.log("json :", produtos.length, "produtos; o primeiro:", produtos[0].nome);

// type file: o import devolve um CAMINHO (texto). Para o conteúdo usa Bun.file.
console.log("file :", typeof logo, basename(logo));
const f = Bun.file(logo);
const bytes = await f.bytes();
console.log("       tamanho", f.size, "| tipo", f.type, "| começa por:", new TextDecoder().decode(bytes.slice(0, 4)));

// o mesmo ficheiro pode ser servido diretamente
const resposta = new Response(Bun.file(logo));
console.log("       Response:", resposta.headers.get("content-type"), (await resposta.arrayBuffer()).byteLength, "bytes");
