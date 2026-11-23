// Bun.Transpiler: o transpilador do próprio Bun, exposto como API (transform, transformSync, scan, scanImports)
const t = new Bun.Transpiler({ loader: "ts" });

const fonte = `
import { validar } from "./validador.ts";
import type { Produto } from "./tipos.ts";
import fs, { readFileSync } from "node:fs";
export interface Linha { qtd: number; preco: number }
export enum Estado { Pendente, Entregue }
export const total = (ls: Linha[]): number => ls.reduce((s, l) => s + l.qtd * l.preco, 0);
const dinamico = await import("./extra.ts");
export default class Loja<T extends Produto> { constructor(private itens: T[] = []) {} }
`;

console.log("--- transformSync (TS -> JS, tipos removidos) ---");
console.log(t.transformSync(fonte));

console.log("--- scanImports (só os imports estáticos que ficam) ---");
console.log(t.scanImports(fonte));

console.log("--- scan (imports, exports) ---");
console.log(t.scan(fonte));

console.log("--- transform assíncrono e loader tsx ---");
const tsx = new Bun.Transpiler({ loader: "tsx", tsconfig: { compilerOptions: { jsx: "react", jsxFactory: "h" } } });
console.log(await tsx.transform(`const el = <li key={1}>{nome}</li>;`));

console.log("--- opções: minifyWhitespace, define, trimUnusedImports, target ---");
const t2 = new Bun.Transpiler({
  loader: "ts",
  minifyWhitespace: true,
  trimUnusedImports: true,
  define: { "process.env.NODE_ENV": '"production"' },
});
console.log(t2.transformSync(`import { a } from "./a.ts"; import { b } from "./b.ts"; export const x = process.env.NODE_ENV === "production" ? b : 1;`));

console.log("--- erro de sintaxe ---");
try { t.transformSync("const = ;"); } catch (e) { console.log((e as Error).constructor.name, "-", (e as any).message?.split("\n")[0] ?? e); }
