// Bun.YAML, Bun.TOML (parse e stringify) e Bun.markdown
const yaml = `
loja:
  nome: Loja do Estudo
  iva: 0.23
  categorias: [Livros, Eletrónica, Casa]
  aberta: true
  fecho: ~
`;
const cfg = Bun.YAML.parse(yaml) as any;
console.log("YAML.parse    :", JSON.stringify(cfg));
console.log("YAML.stringify:\n" + Bun.YAML.stringify(cfg, null, 2));
console.log("YAML.stringify (uma linha):", JSON.stringify(Bun.YAML.stringify([{ id: 1, nome: "Ana" }])));
try { Bun.YAML.parse("a: [1, 2"); } catch (e: any) { console.log("YAML inválido :", e.name, "-", e.message.split("\n")[0]); }

const toml = `
nome = "Loja do Estudo"
stock_minimo = 10

[servidor]
porta = 35070
rotas = ["/produtos", "/encomendas"]
`;
const t = Bun.TOML.parse(toml) as any;
console.log("TOML.parse    :", JSON.stringify(t));
try { console.log("TOML.stringify:\n" + (Bun.TOML as any).stringify(t)); } catch (e: any) { console.log("TOML.stringify:", e.name, "-", e.message); }
try { Bun.TOML.parse("a = "); } catch (e: any) { console.log("TOML inválido :", e.name, "-", e.message.split("\n")[0]); }

// Outros formatos que o Bun 1.4.0 também traz (só confirmados com typeof)
console.log("JSON5/JSONL/JSONC:", typeof Bun.JSON5.parse, typeof Bun.JSONL.parse, typeof (Bun as any).JSONC.parse);

console.log("--- Bun.markdown ---");
const md = "# Aviso\n\nA **Loja** fecha às 18h. Ver [horário](https://exemplo.pt).\n\n- Livros\n- Casa\n";
console.log("html   :", JSON.stringify(Bun.markdown.html(md)));
console.log("ansi   :", JSON.stringify(Bun.markdown.ansi(md)).slice(0, 80) + "...");
console.log("render :", typeof Bun.markdown.render, "| react:", typeof Bun.markdown.react);

// ATENÇÃO: Bun.markdown.html NÃO sanitiza. HTML cru e links javascript: passam.
const hostil = "<script>alert(1)</script>\n\nolá <img src=x onerror=alert(1)> [x](javascript:alert(1))";
console.log("sem filtro   :", JSON.stringify(Bun.markdown.html(hostil)));
console.log("tagFilter    :", JSON.stringify(Bun.markdown.html(hostil, { tagFilter: true })));
console.log("escapeHTML antes:", JSON.stringify(Bun.markdown.html(Bun.escapeHTML(hostil))));
