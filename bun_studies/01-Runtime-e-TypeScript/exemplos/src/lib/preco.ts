export const IVA = 0.23;
export const comIva = (preco: number) => Math.round(preco * (1 + IVA) * 100) / 100;
