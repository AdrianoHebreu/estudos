// Código que depende do relógio: ideal para mostrar tempo simulado.
export type EstadoEncomenda = "pendente" | "enviada" | "entregue" | "cancelada";

// Uma encomenda pendente há mais de 7 dias está atrasada (usa a data do sistema).
export function estaAtrasada(data_encomenda: string, estado: EstadoEncomenda): boolean {
  if (estado !== "pendente") return false;
  const dias = (Date.now() - new Date(data_encomenda).getTime()) / 86_400_000;
  return dias > 7;
}

// Agrupa chamadas seguidas numa só, depois de "espera" ms sem novas chamadas.
export function agrupar<A extends unknown[]>(fn: (...a: A) => void, espera: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...a: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), espera);
  };
}
