// TypeScript direto: não há passo de compilação
declare var self: Worker;
import { workerData, threadId } from "node:worker_threads";
interface Info { nome: string; preload: string; modo?: string; argv: string[]; workerData: unknown; threadId: number }
const info: Info = {
  nome: (self as any).name,
  preload: (globalThis as any).DO_PRELOAD,
  modo: process.env.MODO,
  argv: process.argv.slice(2),
  workerData,
  threadId,
};
self.postMessage(info);
