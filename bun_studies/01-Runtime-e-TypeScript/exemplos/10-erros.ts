// Erros, stack traces e códigos de saída.
class ErroStock extends Error {
    constructor(public produtoId: number, public pedido: number, public disponivel: number) {
        super(`Stock insuficiente para o produto ${produtoId}: pedido ${pedido}, disponível ${disponivel}`);
        this.name = "ErroStock";
    }
}

const stock = new Map([[6, 0], [1, 40]]);

function reservar(produtoId: number, quantidade: number) {
    const disponivel = stock.get(produtoId) ?? 0;
    if (quantidade > disponivel) throw new ErroStock(produtoId, quantidade, disponivel);
    stock.set(produtoId, disponivel - quantidade);
}

process.on("exit", (codigo) => console.log("[exit] código =", codigo));

const modo = Bun.argv[2] ?? "uncaught";
reservar(1, 2);
console.log("reserva 1 ok; stock do 1 =", stock.get(1));

if (modo === "uncaught") reservar(6, 1);                 // exceção não tratada -> código 1
if (modo === "rejeicao") await Promise.reject(new ErroStock(6, 1, 0));
if (modo === "tratado") {
    try { reservar(6, 1); }
    catch (e) {
        console.error("capturado:", (e as Error).message);
        process.exit(4);                                  // código escolhido por nós
    }
}
