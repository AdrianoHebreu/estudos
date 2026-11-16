// Executar: docker exec -i est-mongo mongosh --quiet m03 < 01_remodelar_loja.js
// Pré-requisito: coleções planas importadas (categorias, clientes, produtos, encomendas, linhas_encomenda).
db.encomendas_v2.drop();

const produtos = {};
db.produtos.find().forEach(p => { produtos[p.id] = p; });

const docs = db.encomendas.find().sort({ id: 1 }).toArray().map(e => {
    const linhas = db.linhas_encomenda.find({ encomenda_id: e.id }).sort({ id: 1 }).toArray().map(l => ({
        produto_id: l.produto_id,
        nome: produtos[l.produto_id].nome,      // snapshot do nome no momento da compra
        quantidade: l.quantidade,
        preco_unitario: l.preco_unitario        // snapshot do preço no momento da compra
    }));
    return {
        _id: e.id,
        cliente_id: e.cliente_id,               // referência (o cliente continua na sua coleção)
        data_encomenda: e.data_encomenda,
        estado: e.estado,
        linhas: linhas
    };
});
db.encomendas_v2.insertMany(docs);

print("documentos em encomendas_v2: " + db.encomendas_v2.countDocuments());
printjson(db.encomendas_v2.findOne({ _id: 1 }));
