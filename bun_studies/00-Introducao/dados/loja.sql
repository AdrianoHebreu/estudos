CREATE TABLE categorias (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE clientes (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    cidade VARCHAR(50),
    data_registo DATE NOT NULL
);

CREATE TABLE produtos (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria_id INTEGER NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias (id)
);

CREATE TABLE encomendas (
    id INTEGER PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    data_encomenda DATE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);

CREATE TABLE linhas_encomenda (
    id INTEGER PRIMARY KEY,
    encomenda_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (encomenda_id) REFERENCES encomendas (id),
    FOREIGN KEY (produto_id) REFERENCES produtos (id)
);

INSERT INTO categorias (id, nome) VALUES (1, 'Livros');
INSERT INTO categorias (id, nome) VALUES (2, 'Eletrónica');
INSERT INTO categorias (id, nome) VALUES (3, 'Casa');

INSERT INTO clientes (id, nome, email, cidade, data_registo) VALUES (1, 'Ana Ribeiro', 'ana.ribeiro@exemplo.pt', 'Lisboa', '2024-01-15');
INSERT INTO clientes (id, nome, email, cidade, data_registo) VALUES (2, 'Bruno Costa', 'bruno.costa@exemplo.pt', 'Porto', '2024-02-03');
INSERT INTO clientes (id, nome, email, cidade, data_registo) VALUES (3, 'Carla Mendes', 'carla.mendes@exemplo.pt', 'Braga', '2024-03-21');
INSERT INTO clientes (id, nome, email, cidade, data_registo) VALUES (4, 'Diogo Pires', 'diogo.pires@exemplo.pt', 'Lisboa', '2024-05-09');
INSERT INTO clientes (id, nome, email, cidade, data_registo) VALUES (5, 'Eva Martins', 'eva.martins@exemplo.pt', 'Coimbra', '2024-06-30');
INSERT INTO clientes (id, nome, email, cidade, data_registo) VALUES (6, 'Filipe Lopes', 'filipe.lopes@exemplo.pt', 'Porto', '2024-08-12');
INSERT INTO clientes (id, nome, email, cidade, data_registo) VALUES (7, 'Graça Nunes', 'graca.nunes@exemplo.pt', 'Faro', '2024-10-01');
INSERT INTO clientes (id, nome, email, cidade, data_registo) VALUES (8, 'Hugo Teixeira', NULL, 'Lisboa', '2024-11-20');

INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (1, 'Romance Policial', 1, 12.90, 40);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (2, 'Livro de Receitas', 1, 18.50, 25);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (3, 'Atlas Mundial', 1, 29.99, 10);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (4, 'Auscultadores Bluetooth', 2, 49.90, 30);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (5, 'Carregador USB-C', 2, 14.90, 100);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (6, 'Teclado Mecânico', 2, 79.00, 0);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (7, 'Candeeiro de Mesa', 3, 22.00, 15);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (8, 'Conjunto de Panelas', 3, 89.90, 8);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (9, 'Manta de Sofá', 3, 34.50, 20);
INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (10, 'Caneca de Cerâmica', 3, 6.50, 200);

INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (1, 1, '2025-01-10', 'entregue');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (2, 2, '2025-01-18', 'entregue');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (3, 1, '2025-02-02', 'entregue');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (4, 3, '2025-02-14', 'cancelada');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (5, 4, '2025-03-05', 'entregue');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (6, 2, '2025-03-22', 'enviada');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (7, 5, '2025-04-01', 'enviada');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (8, 1, '2025-04-15', 'pendente');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (9, 6, '2025-04-20', 'pendente');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (10, 4, '2025-05-03', 'entregue');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (11, 3, '2025-05-12', 'enviada');
INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (12, 2, '2025-06-01', 'pendente');

INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (1, 1, 1, 2, 12.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (2, 1, 5, 1, 14.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (3, 2, 4, 1, 49.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (4, 3, 2, 1, 18.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (5, 3, 10, 4, 6.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (6, 4, 8, 1, 89.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (7, 5, 6, 1, 79.00);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (8, 5, 5, 2, 14.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (9, 6, 3, 1, 29.99);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (10, 6, 7, 2, 22.00);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (11, 7, 9, 1, 34.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (12, 7, 10, 2, 6.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (13, 8, 1, 1, 12.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (14, 8, 2, 2, 18.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (15, 8, 4, 1, 49.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (16, 9, 7, 1, 22.00);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (17, 10, 5, 3, 14.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (18, 10, 10, 6, 6.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (19, 11, 8, 1, 89.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (20, 11, 9, 2, 34.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (21, 12, 4, 2, 49.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (22, 12, 1, 3, 12.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (23, 12, 10, 1, 6.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (24, 2, 5, 1, 14.90);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (25, 9, 10, 2, 6.50);
INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (26, 6, 1, 1, 12.90);
