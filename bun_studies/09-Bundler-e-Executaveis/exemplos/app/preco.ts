export function formatarPreco(valor: number): string {
  return valor.toFixed(2).replace(".", ",") + " €";
}
export function iva(valor: number, taxa = 0.23): number {
  return Math.round(valor * taxa * 100) / 100;
}
export const NUNCA_USADA = "esta exportação não chega ao pacote (tree shaking)";
