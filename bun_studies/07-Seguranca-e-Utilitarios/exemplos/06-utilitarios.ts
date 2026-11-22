// Pequenos utilitários de texto, comparação, formatação e versões
console.log("--- escapeHTML ---");
console.log(Bun.escapeHTML('<b onclick="x()">Tom & "Jerry" \'1\'</b>'));
console.log(Bun.escapeHTML(42 as any), Bun.escapeHTML(""));

console.log("--- deepEquals / deepMatch ---");
const p1 = { id: 4, nome: "Auscultadores Bluetooth", preco: 49.9, tags: ["audio", "bt"] };
const p2 = { id: 4, nome: "Auscultadores Bluetooth", preco: 49.9, tags: ["audio", "bt"] };
console.log("p1 === p2         :", p1 === p2);
console.log("deepEquals        :", Bun.deepEquals(p1, p2));
console.log("com campo extra   :", Bun.deepEquals(p1, { ...p2, stock: 30 }));
console.log("undefined vs ausente (não estrito):", Bun.deepEquals({ a: 1, b: undefined }, { a: 1 }));
console.log("undefined vs ausente (estrito)    :", Bun.deepEquals({ a: 1, b: undefined }, { a: 1 }, true));
console.log("deepMatch (subconjunto):", Bun.deepMatch({ id: 4, tags: ["audio"].concat("bt") }, { id: 4 }), Bun.deepMatch({ id: 4 }, p1));
console.log("NaN               :", Bun.deepEquals(NaN, NaN), Bun.deepEquals([1, [2]], [1, [2]]));

console.log("--- inspect ---");
console.log(Bun.inspect({ a: 1, b: [1, 2, 3] }));
console.log(Bun.inspect(new Map([["k", 1]])), Bun.inspect([1, "dois", null, undefined]));
console.log(Bun.inspect("texto"), Bun.inspect(12n), Bun.inspect(new Date(0)));
console.log(Bun.inspect({ preco: 49.9 }, { colors: true }).includes("\x1b[") ? "colors:true usa códigos ANSI" : "sem cores");
class Cliente { constructor(public nome: string, private nif: string) {}
  [Bun.inspect.custom]() { return `Cliente<${this.nome}>`; } }
console.log(Bun.inspect(new Cliente("Ana Ribeiro", "123456789")), "<- Bun.inspect.custom");

console.log("--- inspect.table ---");
const produtos = [
  { id: 1, nome: "Romance Policial", preco: 12.9, stock: 40 },
  { id: 6, nome: "Teclado Mecânico", preco: 79, stock: 0 },
  { id: 10, nome: "Caneca de Cerâmica", preco: 6.5, stock: 200 },
];
console.log(Bun.inspect.table(produtos));
console.log(Bun.inspect.table(produtos, ["id", "preco"]));

console.log("--- stringWidth / stripANSI ---");
const vermelho = "\x1b[31mErro\x1b[0m";
console.log("length vs stringWidth:", vermelho.length, Bun.stringWidth(vermelho), Bun.stringWidth(vermelho, { countAnsiEscapeCodes: true }));
console.log("acentos     :", "Eletrónica".length, Bun.stringWidth("Eletrónica"));
console.log("chinês      :", "你好".length, Bun.stringWidth("你好"));
console.log("emoji       :", "👍".length, Bun.stringWidth("👍"));
console.log("stripANSI   :", JSON.stringify(Bun.stripANSI(vermelho)));

console.log("--- color ---");
console.log(Bun.color("red", "hex"), Bun.color("#ff8800", "rgb"), Bun.color("hsl(210, 50%, 40%)", "hex"));
console.log(Bun.color([0, 128, 255], "css"), Bun.color({ r: 255, g: 0, b: 0, a: 0.5 }, "css"), JSON.stringify(Bun.color(0x00ff00, "{rgb}")));
console.log(JSON.stringify(Bun.color("coral", "ansi-16m")), JSON.stringify(Bun.color("coral", "ansi-256")), JSON.stringify(Bun.color("coral", "ansi-16")), Bun.color("não-é-cor", "hex"));

console.log("--- semver ---");
console.log("satisfies:", Bun.semver.satisfies("1.4.0", "^1.2.0"), Bun.semver.satisfies("2.0.0", "^1.2.0"), Bun.semver.satisfies("1.4.0", ">=1.0.0 <1.4.0"));
console.log("order    :", Bun.semver.order("1.4.0", "1.10.0"), Bun.semver.order("1.0.0", "1.0.0"), Bun.semver.order("2.0.0", "1.9.9"));
console.log("ordenar  :", ["1.10.0", "1.2.0", "1.9.1", "1.2.0-beta.1"].sort(Bun.semver.order));
console.log("pré-release satisfaz ^1.2.0?", Bun.semver.satisfies("1.3.0-beta.1", "^1.2.0"));
console.log("inválida :", Bun.semver.satisfies("não-é-versão", "^1.0.0"));
