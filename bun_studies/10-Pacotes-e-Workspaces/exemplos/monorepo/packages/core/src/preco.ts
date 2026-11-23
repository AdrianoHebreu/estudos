export function formatarPreco(valor: number): string {
  return valor.toFixed(2).replace(".", ",") + " €";
}
