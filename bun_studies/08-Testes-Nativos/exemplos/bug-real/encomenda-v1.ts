// Primeira versão (com bugs) da validação: o teste em bug.ts apanha-os.
export function validarEncomendaV1(e: any): string[] {
  const erros: string[] = [];
  if (!e.cliente_id) erros.push("cliente_id: obrigatório");
  if (!e.linhas) erros.push("linhas: obrigatório");
  for (const [i, l] of (e.linhas ?? []).entries()) {
    if (l.quantidade < 0) erros.push(`linhas[${i}].quantidade: tem de ser positiva`); // bug: 0 e 1.5 passam
  }
  return erros;
}
