// Envia um aviso a um serviço externo (fictício: o domínio .invalid nunca resolve).
export async function enviarAviso(email: string, texto: string): Promise<{ id: string }> {
  const r = await fetch("https://avisos.exemplo.invalid/enviar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, texto }),
  });
  if (!r.ok) throw new Error(`serviço de avisos respondeu ${r.status}`);
  return (await r.json()) as { id: string };
}
