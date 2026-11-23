declare var self: Worker;
import { somarIntervalo } from "./calculo.ts";

// Recebe as colunas partilhadas (SharedArrayBuffer: não são copiadas) uma só vez
let cat: Int32Array, qtd: Int32Array, preco: Int32Array;
self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.tipo === "colunas") {
    cat = new Int32Array(m.cat); qtd = new Int32Array(m.qtd); preco = new Int32Array(m.preco);
    self.postMessage({ tipo: "pronto" });
  } else if (m.tipo === "somar") {
    self.postMessage({ tipo: "soma", soma: somarIntervalo(cat, qtd, preco, m.de, m.ate, m.custo) });
  } else if (m.tipo === "somar-copia") {
    // variante: a fatia vem copiada na mensagem (structured clone)
    self.postMessage({ tipo: "soma", soma: somarIntervalo(m.cat, m.qtd, m.preco, 0, m.cat.length, m.custo) });
  }
};
