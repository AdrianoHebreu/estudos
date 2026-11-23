// bun:ffi: chamar funções de uma DLL do Windows sem escrever código nativo.
// Windows apenas: kernel32.dll e ucrtbase.dll existem em qualquer Windows 10/11.
import { dlopen, FFIType, suffix, ptr, CString, JSCallback, read } from "bun:ffi";

console.log("suffix das bibliotecas nesta plataforma:", suffix, "| platform:", process.platform);

// 1. kernel32: funções simples sem ponteiros
const k32 = dlopen("kernel32.dll", {
  GetCurrentProcessId: { args: [], returns: FFIType.u32 },
  GetTickCount64: { args: [], returns: FFIType.u64 },
  Sleep: { args: [FFIType.u32], returns: FFIType.void },
});
console.log("GetCurrentProcessId == process.pid ?", k32.symbols.GetCurrentProcessId() === process.pid);
const t0 = k32.symbols.GetTickCount64();
k32.symbols.Sleep(50);
console.log("GetTickCount64 avançou ~50 ms:", Number(k32.symbols.GetTickCount64() - t0) >= 45, "| tipo devolvido:", typeof t0);

// 2. ucrtbase: funções C com ponteiros. Uma string C tem de terminar em NUL (\0).
const crt = dlopen("ucrtbase.dll", {
  abs: { args: [FFIType.i32], returns: FFIType.i32 },
  strlen: { args: [FFIType.ptr], returns: FFIType.u64 },
  toupper: { args: [FFIType.i32], returns: FFIType.i32 },
  qsort: { args: [FFIType.ptr, FFIType.u64, FFIType.u64, FFIType.function], returns: FFIType.void },
  getenv: { args: [FFIType.ptr], returns: FFIType.cstring }, // cstring: o Bun lê o texto por ti
});
console.log("abs(-42):", crt.symbols.abs(-42), "| toupper('a'):", String.fromCharCode(crt.symbols.toupper(97)));
console.log("strlen('loja da Ana'):", crt.symbols.strlen(ptr(Buffer.from("loja da Ana\0"))));

// 3. Texto devolvido por C. O getenv da CRT lê o ambiente com que o processo arrancou:
//    uma variável criada depois com process.env não aparece.
const c = (nome: string) => ptr(Buffer.from(nome + "\0"));
const valor = crt.symbols.getenv(c("ESTUDO_BUN"));
console.log("getenv cstring ->", JSON.stringify(valor), "| typeof:", typeof valor);
process.env.ESTUDO_NOVA = "criada depois";
console.log("getenv de variável criada depois ->", crt.symbols.getenv(c("ESTUDO_NOVA")), "| process.env:", process.env.ESTUDO_NOVA);

// Com returns: ptr recebes o endereço e lês tu com CString
const crtPtr = dlopen("ucrtbase.dll", { getenv: { args: [FFIType.ptr], returns: FFIType.ptr } });
const endereco = crtPtr.symbols.getenv(c("ESTUDO_BUN"));
console.log("getenv ptr -> typeof:", typeof endereco, "| CString:", endereco ? String(new CString(endereco)) : null);
crtPtr.close();

// 4. JSCallback: uma função JavaScript chamada pelo código C (o qsort chama o comparador)
const numeros = new Int32Array([42, 7, 19, 3, 88, 1]);
const comparador = new JSCallback(
  (a: any, b: any) => read.i32(a) - read.i32(b),
  { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
);
crt.symbols.qsort(ptr(numeros), numeros.length, 4, comparador.ptr);
console.log("qsort com JSCallback:", Array.from(numeros));
comparador.close();

// 5. Erros comuns
try { dlopen("nao-existe-xyz.dll", { f: { args: [], returns: FFIType.void } }); } catch (e) { console.log("DLL inexistente:", (e as Error).message.slice(0, 60)); }
try { dlopen("kernel32.dll", { FuncaoQueNaoExiste: { args: [], returns: FFIType.void } }); } catch (e) { console.log("símbolo inexistente:", (e as Error).message.slice(0, 70)); }

k32.close();
crt.close();
