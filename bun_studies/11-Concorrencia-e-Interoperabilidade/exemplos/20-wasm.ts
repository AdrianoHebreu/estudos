// WebAssembly escrito à mão em bytes: sem ferramentas externas.
// Módulo com duas funções exportadas: soma(a, b) e fatorial(n) (i32, recursiva com if/else)
// O formato é: cabeçalho + secções [id, tamanho em bytes, conteúdo]. O ajudante calcula o tamanho.
const secao = (id: number, ...conteudo: number[]) => [id, conteudo.length, ...conteudo];
const texto = (s: string) => [s.length, ...new TextEncoder().encode(s)];

const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // cabeçalho: número mágico 00 61 73 6d + versão 1
  ...secao(1, 2,                                   // secção de tipos: 2 tipos
    0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,            //   tipo 0: (i32, i32) -> i32
    0x60, 0x01, 0x7f, 0x01, 0x7f),                 //   tipo 1: (i32) -> i32
  ...secao(3, 2, 0x00, 0x01),                      // secção de funções: func 0 tem o tipo 0, func 1 o tipo 1
  ...secao(7, 2,                                   // secção de exportações
    ...texto("soma"), 0x00, 0x00,                  //   "soma" -> função 0
    ...texto("fatorial"), 0x00, 0x01),             //   "fatorial" -> função 1
  ...secao(10, 2,                                  // secção de código: 2 corpos
    7, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,  // soma: (0 locais) local.get 0, local.get 1, i32.add, end
    23, 0x00,                                      // fatorial: 23 bytes, 0 locais
    0x20, 0x00, 0x41, 0x02, 0x48,                  //   local.get 0; i32.const 2; i32.lt_s   (n < 2 ?)
    0x04, 0x7f,                                    //   if (resultado i32)
    0x41, 0x01,                                    //     i32.const 1
    0x05,                                          //   else
    0x20, 0x00, 0x20, 0x00, 0x41, 0x01, 0x6b,      //     n, n - 1
    0x10, 0x01, 0x6c,                              //     call fatorial; i32.mul
    0x0b, 0x0b),                                   //   end (if), end (função)
]);

console.log("módulo válido?", WebAssembly.validate(bytes), "|", bytes.length, "bytes");
const modulo = await WebAssembly.compile(bytes);
console.log("exportações:", WebAssembly.Module.exports(modulo), "| importações:", WebAssembly.Module.imports(modulo));
const { exports } = await WebAssembly.instantiate(modulo);
const { soma, fatorial } = exports as { soma(a: number, b: number): number; fatorial(n: number): number };
console.log("soma(20, 22) =", soma(20, 22), "| fatorial(10) =", fatorial(10), "| fatorial(13) com overflow de i32 =", fatorial(13));
console.log("soma(2**31 - 1, 1) =", soma(2 ** 31 - 1, 1), "(i32 dá a volta)");

// Instanciação síncrona e módulo inválido
const inst = new WebAssembly.Instance(new WebAssembly.Module(bytes));
console.log("síncrono:", (inst.exports.soma as Function)(1, 2));
try { new WebAssembly.Module(new Uint8Array([1, 2, 3])); } catch (e) { console.log("inválido:", (e as Error).name); }

// Comparação de velocidade com JS (fatorial(12) repetido)
const N = 2_000_000;
const jsFat = (n: number): number => (n < 2 ? 1 : (n * jsFat(n - 1)) | 0);
const medir = (f: () => void) => { const t: number[] = []; for (let i = 0; i < 5; i++) { const a = performance.now(); f(); t.push(performance.now() - a); } return t.sort((a, b) => a - b)[2]; };
console.log(`fatorial(12) x ${N}: wasm ${medir(() => { for (let i = 0; i < N; i++) fatorial(12); }).toFixed(0)} ms | js ${medir(() => { for (let i = 0; i < N; i++) jsFat(12); }).toFixed(0)} ms`);
