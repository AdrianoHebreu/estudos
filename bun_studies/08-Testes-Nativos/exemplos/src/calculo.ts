// Funções puras da loja: fáceis de testar porque não dependem de nada externo.
export const IVA = 0.23;

export type Linha = { quantidade: number; preco_unitario: number };

// O dinheiro em vírgula flutuante precisa de arredondamento explícito.
export function arredondar(valor: number, casas = 2): number {
  const fator = 10 ** casas;
  return Math.round((valor + Number.EPSILON) * fator) / fator;
}

export function totalSemIva(linhas: Linha[]): number {
  return arredondar(linhas.reduce((soma, l) => soma + l.quantidade * l.preco_unitario, 0));
}

export function totalComIva(linhas: Linha[], taxa = IVA): number {
  if (taxa < 0 || taxa > 1) throw new RangeError(`taxa de IVA inválida: ${taxa}`);
  return arredondar(totalSemIva(linhas) * (1 + taxa));
}

export function formatarEuros(valor: number): string {
  return valor.toFixed(2).replace(".", ",") + " €";
}
