type Linha = { sku: string; quantity: number };
type Encomenda = { externalId: string; items: Linha[] };
type Registo = Encomenda & { erpId: string; status: "accepted" };

function objeto(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function lerEncomenda(data: unknown): Encomenda | null {
  if (!objeto(data) || typeof data.externalId !== "string" ||
      !/^CN-[0-9]{1,12}$/.test(data.externalId) ||
      !Array.isArray(data.items) || data.items.length !== 1) {
    return null;
  }

  const item: unknown = data.items[0];
  if (!objeto(item) || typeof item.sku !== "string" ||
      !/^[A-Z0-9-]{1,32}$/.test(item.sku) ||
      typeof item.quantity !== "number" || !Number.isInteger(item.quantity) ||
      item.quantity < 1 || item.quantity > 2147483647) {
    return null;
  }

  return {
    externalId: data.externalId,
    items: [{ sku: item.sku, quantity: item.quantity }],
  };
}

export function criarSimulador() {
  const registos = new Map<string, Registo>();

  return async (request: Request): Promise<Response> => {
    const { pathname } = new URL(request.url);
    if (request.method === "GET" && pathname === "/health") {
      return Response.json({ status: "ok" });
    }

    const referencia = /^\/orders\/(CN-[0-9]{1,12})$/.exec(pathname);
    if (request.method === "GET" && referencia) {
      const registo = registos.get(referencia[1]);
      return registo
        ? Response.json(registo)
        : Response.json({ error: "order_not_found" }, { status: 404 });
    }

    if (pathname !== "/orders") {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    if (request.method !== "POST") {
      return Response.json({ error: "method_not_allowed" }, {
        status: 405, headers: { Allow: "POST" },
      });
    }
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return Response.json({ error: "unsupported_media_type" }, { status: 415 });
    }

    let data: unknown;
    try {
      data = await request.json();
    } catch {
      return Response.json({ error: "invalid_json" }, { status: 400 });
    }
    const encomenda = lerEncomenda(data);
    if (!encomenda) {
      return Response.json({ error: "invalid_order" }, { status: 400 });
    }

    // Este cabeçalho pertence ao simulador. Pode simular indisponibilidade antes da escrita.
    if (request.headers.get("x-lab-fail") === "before-write") {
      return Response.json({ error: "unavailable" }, {
        status: 503, headers: { "Retry-After": "1" },
      });
    }

    const anterior = registos.get(encomenda.externalId);
    if (anterior) {
      const [original] = anterior.items;
      const [recebida] = encomenda.items;
      if (original.sku !== recebida.sku || original.quantity !== recebida.quantity) {
        return Response.json({ error: "order_conflict" }, { status: 409 });
      }
      return Response.json(anterior);
    }

    const registo: Registo = {
      ...encomenda, erpId: "ERP-" + encomenda.externalId.slice(3), status: "accepted",
    };
    const location = "/orders/" + encomenda.externalId;
    registos.set(encomenda.externalId, registo);
    return Response.json(registo, { status: 201, headers: { Location: location } });
  };
}

if (import.meta.main) {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 8765,
    fetch: criarSimulador(),
  });
  console.log("Simulador ERP disponível em " + server.url);
}
