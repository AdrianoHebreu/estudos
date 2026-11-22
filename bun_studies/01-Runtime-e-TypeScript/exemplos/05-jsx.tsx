// JSX sem React: o tsconfig.json manda o Bun chamar a nossa função h().
type Filhos = (string | number | No)[];
interface No { tag: string; props: Record<string, unknown>; filhos: Filhos }

function h(tag: string | Function, props: Record<string, unknown> | null, ...filhos: any[]): any {
    if (typeof tag === "function") return tag({ ...props, children: filhos });
    return { tag, props: props ?? {}, filhos: filhos.flat() };
}
const Fragment = (p: { children: any[] }) => p.children;

function html(n: any): string {
    if (Array.isArray(n)) return n.map(html).join("");
    if (typeof n !== "object") return String(n);
    const attrs = Object.entries(n.props).map(([k, v]) => ` ${k}="${v}"`).join("");
    return `<${n.tag}${attrs}>${n.filhos.map(html).join("")}</${n.tag}>`;
}

const Produto = ({ nome, preco }: { nome: string; preco: number }) => (
    <li class="produto">{nome}: {preco.toFixed(2)} EUR</li>
);

const lista = (
    <ul>
        <Produto nome="Romance Policial" preco={12.9} />
        <Produto nome="Caneca de Cerâmica" preco={6.5} />
    </ul>
);
console.log(html(lista));
