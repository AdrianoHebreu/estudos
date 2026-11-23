// A regra de negócio por linha. "custo" simula uma regra cara (verificação de risco, impostos por região...):
// quanto maior, mais CPU por linha. O resultado NÃO depende do custo, para a comparação ser justa.
export const IVA = 0.23;

export function valorLinha(quantidade: number, precoCent: number, custo: number): number {
  let cent = quantidade * precoCent;
  if (quantidade >= 5) cent = Math.round(cent * 0.95);   // desconto de volume
  cent = Math.round(cent * (1 + IVA));                    // com IVA, em cêntimos inteiros
  let x = cent | 0;
  for (let i = 0; i < custo; i++) x = (Math.imul(x, 31) + i) | 0; // trabalho extra simulado
  return x === 0x7fffffff ? cent + 1 : cent;              // quase nunca; impede o motor de apagar o ciclo
}

/** Soma por categoria num intervalo [de, ate) das colunas. Devolve Float64Array indexado pelo id da categoria. */
export function somarIntervalo(cat: Int32Array, qtd: Int32Array, preco: Int32Array, de: number, ate: number, custo: number) {
  const soma = new Float64Array(4);
  for (let i = de; i < ate; i++) soma[cat[i]] += valorLinha(qtd[i], preco[i], custo);
  return soma;
}
