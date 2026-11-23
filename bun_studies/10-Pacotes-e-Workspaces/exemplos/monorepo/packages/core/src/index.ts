import isOdd from "is-odd";
import ms from "ms";

export const encomendaImpar = (id: number): boolean => isOdd(id);
export const prazoEntrega = (): number => ms("2 days");
export { formatarPreco } from "./preco.ts";
