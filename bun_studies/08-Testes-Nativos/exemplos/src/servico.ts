// Serviço que junta o cálculo, o repositório e as notificações.
import { totalComIva } from "./calculo.ts";
import { enviarAviso } from "./notificacoes.ts";
import type { RepositorioLoja } from "./repositorio.ts";

export async function confirmarEncomenda(repo: RepositorioLoja, id: number, email: string | null) {
  const total = totalComIva(repo.linhas(id));
  if (!email) return { total, avisado: false };
  await enviarAviso(email, `A tua encomenda ${id} custa ${total.toFixed(2)} euros com IVA.`);
  return { total, avisado: true };
}
