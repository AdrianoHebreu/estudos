export const comIva = (preco: number, iva: number) => Math.round(preco * (1 + iva) * 100) / 100;
