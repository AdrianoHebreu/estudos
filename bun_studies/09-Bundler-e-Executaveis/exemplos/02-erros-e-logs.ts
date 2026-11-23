// Quando a build falha: por omissão Bun.build lança (AggregateError); com throw: false devolve success false.
import { basename } from "node:path";

const falhas = ["./erros/falta.ts", "./erros/sintaxe.ts"];

for (const entrada of falhas) {
  console.log("==", entrada);
  try {
    await Bun.build({ entrypoints: [entrada] });
    console.log("não lançou");
  } catch (e) {
    console.log("lançou:", (e as Error).name, "| erros:", (e as AggregateError).errors.length);
  }

  const r = await Bun.build({ entrypoints: [entrada], throw: false });
  console.log("success:", r.success, "| outputs:", r.outputs.length);
  for (const log of r.logs) {
    // cada entrada de logs é um BuildMessage (ou um ResolveMessage, nos imports que falham)
    const p = log.position;
    console.log(" ", log.constructor.name, log.level, "|", log.message, "|", basename(p!.file), `${p!.line}:${p!.column}`, "|", p!.lineText);
  }
}
