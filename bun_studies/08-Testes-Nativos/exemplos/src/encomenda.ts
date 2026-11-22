// Validação do corpo de uma nova encomenda: devolve a lista de erros, vazia se estiver tudo bem.
export type NovaEncomenda = {
  cliente_id: number;
  linhas: { produto_id: number; quantidade: number }[];
};

export type Resultado = { ok: true; valor: NovaEncomenda } | { ok: false; erros: string[] };

const inteiroPositivo = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 1;

export function validarEncomenda(entrada: unknown): Resultado {
  const erros: string[] = [];
  if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) {
    return { ok: false, erros: ["o corpo tem de ser um objeto"] };
  }
  const e = entrada as Record<string, unknown>;
  if (!inteiroPositivo(e.cliente_id)) erros.push("cliente_id: inteiro maior ou igual a 1");
  if (!Array.isArray(e.linhas) || e.linhas.length === 0) {
    erros.push("linhas: pelo menos 1 linha");
  } else {
    e.linhas.forEach((l, i) => {
      if (!inteiroPositivo(l?.produto_id)) erros.push(`linhas[${i}].produto_id: inteiro maior ou igual a 1`);
      if (!inteiroPositivo(l?.quantidade)) erros.push(`linhas[${i}].quantidade: inteiro maior ou igual a 1`);
    });
  }
  return erros.length ? { ok: false, erros } : { ok: true, valor: e as NovaEncomenda };
}
