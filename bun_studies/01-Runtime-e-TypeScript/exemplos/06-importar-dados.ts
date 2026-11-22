// JSON, TOML, texto e YAML importados como módulos: sem fs, sem JSON.parse, sem bibliotecas.
import categorias from "./dados/categorias.json";
import config, { envio } from "./dados/loja.toml";
import aviso from "./dados/aviso.txt";
import definicoes from "./dados/loja.yaml";
import dadosJson from "./dados/categorias.json" with { type: "json" };   // atributo explícito (opcional)

console.log("JSON :", categorias.map((c) => c.nome).join(", "));
console.log("TOML :", config.nome, "| envio grátis acima de", envio.gratis_acima_de, "EUR |", envio.transportadoras.join("/"));
console.log("TOML horário:", config.horario.map((h) => `${h.dia} ${h.abre}`).join("; "));
console.log("texto:", aviso.length, "caracteres | começa por:", aviso.slice(0, 30) + "...");
console.log("YAML :", definicoes);
console.log("JSON com atributo:", dadosJson.length, "categorias");

// Também há parsers para texto que já tens em memória.
console.log(Bun.TOML.parse('iva = 0.23\nmoeda = "EUR"'));
console.log(Bun.YAML.parse("categorias:\n  - Livros\n  - Casa"));
