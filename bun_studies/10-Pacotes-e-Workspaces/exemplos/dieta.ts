// A «dieta»: o que quatro pacotes minúsculos do npm fazem, escrito só com o que o Bun e o JavaScript já trazem.
const eNumero = (v: unknown): boolean =>
  typeof v === "number"
    ? Number.isFinite(v)
    : typeof v === "string" && v.trim() !== "" && Number.isFinite(+v); // is-number

const eImpar = (n: number): boolean => Math.abs(n % 2) === 1; // is-odd (para inteiros)
const alinharEsq = (s: string | number, n: number, c = " "): string => String(s).padStart(n, c); // left-pad (com um só carácter de enchimento; com «xy» o left-pad repete o padrão a mais) (só com um carácter de enchimento: com «xy» o left-pad repete o padrão a mais)
const cumpre = (versao: string, intervalo: string): boolean => Bun.semver.satisfies(versao, intervalo); // semver.satisfies

console.log("eNumero:", [5, "5", "1e3", "abc", "", NaN, Infinity].map(eNumero).join(" "));
console.log("eImpar:", [1, 2, 7, -3, 0].map(eImpar).join(" "));
console.log("alinharEsq:", JSON.stringify(alinharEsq(42, 6, "0")));
console.log("cumpre:", cumpre("1.4.0", "^1.2.0"), cumpre("2.0.0", "^1.2.0"));
console.log("coral em hex (Bun.color):", Bun.color("coral", "hex"));
