// Combinar tudo: gerar o relatório de vendas da loja, guardá-lo no S3 e servi-lo
// com um URL pré-assinado. O servidor usa a porta 35062 e pára no fim.
import { s3, redis } from "bun";
import { abrirLoja } from "./loja-db.ts";

const db = await abrirLoja();
const linhas = db.query(`
  SELECT p.id, p.nome, SUM(l.quantidade) AS unidades,
         ROUND(SUM(l.quantidade * l.preco_unitario), 2) AS receita
  FROM linhas_encomenda l
  JOIN encomendas e ON e.id = l.encomenda_id
  JOIN produtos p ON p.id = l.produto_id
  WHERE e.estado <> 'cancelada'
  GROUP BY p.id ORDER BY receita DESC, p.id
`).all() as { id: number; nome: string; unidades: number; receita: number }[];

const csv = ["id,produto,unidades,receita", ...linhas.map(l => `${l.id},${l.nome},${l.unidades},${l.receita.toFixed(2)}`)].join("\n") + "\n";
const chave = "relatorios/vendas-2025.csv";

// 1. Guardar no S3 com o tipo certo e a indicação de descarregar como ficheiro
const bytes = await s3.write(chave, csv, { type: "text/csv", contentDisposition: 'attachment; filename="vendas-2025.csv"' });
console.log("guardado no S3:", chave, bytes, "bytes |", (await s3.file(chave).stat()).type);

// 2. Servir: a rota 1 redireciona (Response com S3File), a rota 2 devolve o URL pré-assinado em JSON
const servidor = Bun.serve({
  port: 35062,
  hostname: "127.0.0.1",
  routes: {
    "/relatorio.csv": () => new Response(s3.file(chave)),
    "/api/relatorio/ligacao": async () => {
      await redis.incr("loja:descargas:relatorio"); // métrica de quantas ligações foram pedidas
      const url = s3.presign(chave, { expiresIn: 60 });
      return Response.json({ url, expiraEmSegundos: 60 });
    },
  },
});

const base = `http://127.0.0.1:${servidor.port}`;
const manual = await fetch(`${base}/relatorio.csv`, { redirect: "manual" });
console.log("sem seguir o redirect:", manual.status, new URL(manual.headers.get("location")!).pathname);
const seguido = await fetch(`${base}/relatorio.csv`);
console.log("a seguir o redirect:", seguido.status, seguido.headers.get("content-type"), "|", seguido.headers.get("content-disposition"));
console.log((await seguido.text()).trimEnd());

const { url } = (await (await fetch(`${base}/api/relatorio/ligacao`)).json()) as { url: string };
const direto = await fetch(url); // quem tem o URL descarrega sem credenciais, sem passar pelo nosso servidor
console.log("URL pré-assinado:", direto.status, (await direto.text()).split("\n")[1]);
console.log("sem assinatura:", (await fetch(url.split("?")[0])).status);
console.log("pedidos de ligação registados no Redis:", await redis.get("loja:descargas:relatorio"));

// 3. A mesma ideia ao contrário: URL pré-assinado de PUT para o cliente enviar um ficheiro
const envio = s3.presign("relatorios/nota.txt", { method: "PUT", expiresIn: 60, type: "text/plain" });
const put = await fetch(envio, { method: "PUT", body: "nota enviada pelo cliente", headers: { "content-type": "text/plain" } });
console.log("PUT pré-assinado:", put.status, "->", await s3.file("relatorios/nota.txt").text());

servidor.stop(true);
await s3.delete(chave);
await s3.delete("relatorios/nota.txt");
await redis.del("loja:descargas:relatorio");
redis.close();
db.close();
