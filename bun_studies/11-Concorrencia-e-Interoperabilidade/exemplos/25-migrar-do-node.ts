// Sinais que um projeto Node costuma verificar para saber em que runtime está
const eBun = "bun" in process.versions;
console.log("runtime:", eBun ? `Bun ${process.versions.bun}` : "Node");
console.log("process.version (fingida para compatibilidade):", process.version, "| process.release.name:", process.release.name);
console.log("process.versions.node:", process.versions.node, "| typeof Bun:", typeof Bun);
console.log("__dirname e __filename em ESM:", typeof __dirname, typeof __filename, "| import.meta.dirname:", typeof import.meta.dirname);
console.log("require em ESM:", typeof require, "| module:", typeof module);
console.log("import.meta.main:", import.meta.main, "| require.main === module:", require.main === module);
console.log("process.argv[0] é o executável do Bun:", process.argv[0] === process.execPath);
console.log("process.env.NODE_ENV por omissão:", process.env.NODE_ENV);
console.log("globais:", ["fetch", "structuredClone", "AbortController", "TextEncoder", "WebSocket", "Blob", "URLPattern", "navigator", "BroadcastChannel", "CompressionStream", "crypto", "performance", "queueMicrotask", "setImmediate", "Buffer", "process", "global", "WebAssembly"].map((g) => `${g}:${typeof (globalThis as any)[g] === "undefined" ? "NAO" : "sim"}`).join(" "));
