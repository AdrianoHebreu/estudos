// Intervalos semver: o que ^, ~ e versões exatas aceitam (Bun.semver, Bun 1.4.0).
const casos: [string, string][] = [
  ["^1.2.3", "1.9.0"],
  ["^1.2.3", "2.0.0"],
  ["~1.2.3", "1.2.9"],
  ["~1.2.3", "1.3.0"],
  ["^0.2.3", "0.2.9"],
  ["^0.2.3", "0.3.0"],
  ["^0.0.3", "0.0.4"],
  ["1.2.3", "1.2.3"],
  [">=1.0.0 <2.0.0", "1.5.0"],
  ["1.x", "1.7.0"],
  ["^1.0.0", "1.5.0-beta.1"],
];

console.log("intervalo".padEnd(18), "versão".padEnd(14), "aceita?");
for (const [intervalo, versao] of casos) {
  console.log(intervalo.padEnd(18), versao.padEnd(14), Bun.semver.satisfies(versao, intervalo));
}

// order: -1, 0 ou 1. Compara por números, não por texto.
console.log("order 1.10.0 vs 1.9.0:", Bun.semver.order("1.10.0", "1.9.0"));
console.log("order 1.0.0-beta vs 1.0.0:", Bun.semver.order("1.0.0-beta", "1.0.0"));
