// Gera dados sintéticos na base m05 (mongosh). LCG com semente fixa: resultados reproduzíveis.
// Uso: mongosh --quiet gerar_dados.js
const bd = db.getSiblingDB("m05");
bd.dropDatabase();

let semente = 42;
function aleatorio() {                       // devolve um número em [0, 1)
    semente = (semente * 1664525 + 1013904223) % 4294967296;
    return semente / 4294967296;
}
const inteiro = (n) => Math.floor(aleatorio() * n);
const escolher = (lista) => lista[inteiro(lista.length)];

const cidades = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Aveiro", "Setúbal", "Évora"];
const estados = ["entregue", "entregue", "entregue", "entregue", "entregue", "entregue", "entregue",
                 "enviada", "paga", "pendente", "cancelada"];
const etiquetas = ["oferta", "urgente", "presente", "empresa", "devolucao", "promocao", "fragil", "expresso"];
const inicio = new Date("2023-01-01T00:00:00Z").getTime();
const doisAnos = 2 * 365 * 24 * 3600 * 1000;

// 100 000 encomendas, inseridas em lotes de 10 000
for (let lote = 0; lote < 10; lote++) {
    const docs = [];
    for (let i = 0; i < 10000; i++) {
        const doc = {
            numero: lote * 10000 + i + 1,
            cliente_id: 1 + inteiro(20000),
            data_encomenda: new Date(inicio + inteiro(doisAnos)),
            estado: escolher(estados),
            cidade: escolher(cidades),
            total: Math.round((5 + aleatorio() * 495) * 100) / 100,
            etiquetas: Array.from({ length: 1 + inteiro(3) }, () => escolher(etiquetas))
        };
        if (aleatorio() < 0.02) doc.cupao = "PROMO" + inteiro(50);   // só 2 % têm cupão
        docs.push(doc);
    }
    bd.encomendas.insertMany(docs);
}

// 20 000 clientes (email único) e 20 000 produtos (texto para o índice de texto)
const clientes = [];
for (let i = 1; i <= 20000; i++) {
    clientes.push({ id: i, nome: "Cliente " + i, email: "cliente" + i + "@exemplo.pt", cidade: escolher(cidades) });
}
bd.clientes.insertMany(clientes);

const palavras = ["teclado", "rato", "monitor", "cabo", "carregador", "livro", "caneca", "candeeiro", "mochila", "auscultadores"];
const adjetivos = ["mecânico", "sem fios", "ergonómico", "compacto", "premium", "básico", "portátil"];
const produtos = [];
for (let i = 1; i <= 20000; i++) {
    const p = escolher(palavras), a = escolher(adjetivos);
    produtos.push({
        sku: "SKU-" + String(i).padStart(6, "0"),
        nome: p + " " + a + " " + i,
        descricao: "Um " + p + " " + a + " ideal para trabalho e estudo",
        preco: Math.round((3 + aleatorio() * 200) * 100) / 100
    });
}
bd.produtos.insertMany(produtos);

print("encomendas: " + bd.encomendas.countDocuments() + ", clientes: " + bd.clientes.countDocuments()
      + ", produtos: " + bd.produtos.countDocuments());
