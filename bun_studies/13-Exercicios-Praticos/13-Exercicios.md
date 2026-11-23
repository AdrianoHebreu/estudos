# 13 Exercícios práticos

44 exercícios, quatro por módulo, mais um projeto final. Cada aula indica com **PRATICAR** os exercícios que lhe correspondem. Resolve-os com o Bun 1.4.0 (ou o que tiveres) e sem pacotes do npm. Dá a cada servidor a sua porta e confirma na tua versão, porque a documentação anda à frente. Só consultas o módulo 15 depois de tentares.

## Módulo 01 · Runtime e TypeScript

### Exercício 1 · Scripts e argumentos da loja

**Nível:** Iniciante

Cria uma pasta de trabalho com um ficheiro produtos.ts e um package.json. O programa recebe um preço mínimo como argumento (Bun.argv[2], por omissão 0), lista os produtos da loja com preço igual ou superior a esse mínimo por ordem decrescente de preço (id, nome e preço com duas casas) e usa estes códigos de saída: 0 se listou algo, 1 se não há nenhum produto nesse escalão, 2 se o argumento não é um número (a mensagem de erro vai para stderr com console.error). Usa os 10 produtos de 00-Introducao/dados/loja.sql.

No package.json cria o script caros (que corre o programa com o mínimo 30), o script check (mínimo 1000) e o script precheck (um echo). Responde, executando: o que imprime o bun run check e com que código termina? O precheck correu sozinho? E o que muda com bun run --silent caros?

### Exercício 2 · Que .env ganha?

**Nível:** Intermédio

Cria três ficheiros: .env (PORTA=3000, MOEDA=EUR, IVA=0.23), .env.local (PORTA=4000) e .env.production (MOEDA=USD e IVA=0.2). Escreve config.ts, que lê PORTA e IVA como números (com uma função que valida: se faltar ou não for número, escreve o erro em stderr e sai com código 1), lê a MOEDA e mostra o preço de 12.90 com IVA.

Antes de executares, prevê numa tabela os valores de PORTA, MOEDA e IVA nestas quatro execuções, e depois confirma-os: (a) bun run config.ts; (b) NODE_ENV=production; (c) NODE_ENV=test; (d) PORTA=5000 e NODE_ENV=production. Por fim corre IVA=abc bun run config.ts e verifica o código de saída.

### Exercício 3 · Relatório com aliases e dados importados

**Nível:** Intermédio

Monta um projeto com: src/produtos.ts (exporta os 10 produtos da loja com id, nome, categoria_id, preco e stock), categorias.json, loja.toml (com stock_minimo = 10) e um tsconfig.json com um alias @loja/* a apontar para ./src/*. Escreve relatorio.ts que importa os produtos pelo alias, as categorias do JSON e a configuração do TOML (sem fs, sem JSON.parse) e imprime, por categoria, o número de produtos, o valor em stock (preço vezes stock) e os produtos com stock abaixo do mínimo. Depois copia relatorio.ts, src, categorias.json e loja.toml para uma pasta sem tsconfig.json e regista a mensagem de erro que o Bun dá.

### Exercício 4 · Biblioteca e programa, e --watch contra --hot

**Nível:** Avançado

Parte A. Cria stock.ts que exporta abaixoDoMinimo(minimo) (devolve os nomes dos produtos com stock inferior ao mínimo) e que, só quando corre como programa principal (import.meta.main), lê o mínimo de Bun.argv (por omissão 10), imprime o resultado e sai com código 1 se houver produtos a repor, 0 se não. Cria resumo.ts, que importa a função, imprime import.meta.main e o nome do ficheiro de Bun.main (com basename de node:path), e chama abaixoDoMinimo(20). Mostra o que cada ficheiro imprime e o código de saída de cada um.

Parte B. Cria versao.ts (export const VERSAO = "v1") e vigia.ts, que importa a versão, mantém um contador em globalThis (com ??=), imprime a versão, o process.pid e o contador, e termina sozinho ao fim de 9 segundos (setTimeout com process.exit). Corre bun --watch vigia.ts em segundo plano (guarda o PID e termina só esse), espera que apareça a primeira linha e depois altera versao.ts duas vezes (com sed -i ou editando à mão) com 3 segundos de intervalo. Repete com --hot. Preenche uma tabela com PID e contador de cada linha e explica a diferença. Nota: o processo que lanças tem de ser terminado pelo teu PID, nunca por nome.

## Módulo 02 · Ficheiros e sistema

### Exercício 5 · Inserts por tabela

**Nível:** Iniciante

Lê o ficheiro 00-Introducao/dados/loja.sql com Bun.file e conta quantas instruções INSERT INTO existem para cada tabela. Escreve no terminal uma linha por tabela (nome e contagem), da tabela com mais inserts para a com menos, e uma última linha com o total. Corre o programa a partir da pasta do curso e confirma que o total é 59.

### Exercício 6 · Backup com Glob

**Nível:** Intermédio

Cria, numa pasta temporária (mkdtemp, no tmpdir do sistema), uma pasta origem com estes ficheiros: dados/clientes.sql, dados/produtos.sql, extra/.oculto.sql e notas.txt. Com Bun.Glob, procura os .sql primeiro sem a opção dot e depois com ela, e mostra as duas listas (com barras normais, mesmo no Windows). Copia todos os .sql encontrados para uma pasta backup, mantendo a estrutura de subpastas, com Bun.write(destino, Bun.file(origem)). No fim, volta a procurar na pasta backup e confirma que o tamanho de cada cópia é igual ao do original. Apaga a pasta temporária no fim.

### Exercício 7 · Mini-script com Bun.$

**Nível:** Intermédio

Com o Bun.$ e sem importar nada do node:child_process, faz um script que: (a) cria uma pasta saida dentro de uma pasta temporária; (b) escreve nela, com um redirecionamento, um ficheiro cujo nome é uma variável com o valor relatorio; rm -rf x (de propósito, um nome mal-intencionado) e cujo conteúdo é a linha Total: 7304.60; (c) lista a pasta e mostra o conteúdo do ficheiro; (d) tenta ler um ficheiro que não existe e mostra o código de saída e a mensagem de erro, primeiro com nothrow() e depois apanhando o erro com try e catch; (e) apaga a pasta temporária e confirma que já não existe. Explica porque é que o nome estranho não executou o rm.

### Exercício 8 · Processo filho com stdin

**Nível:** Avançado

Faz um programa que cria (com Bun.write, numa pasta temporária) um script filtro.ts que lê do stdin linhas no formato nome;preco, ignora as vazias e as inválidas (escrevendo um aviso no stderr) e no fim escreve quantos produtos leu e o total dos preços. O teu programa principal lança esse filtro com Bun.spawn e stdin, stdout e stderr em pipe, envia quatro linhas (uma delas inválida), fecha o stdin e mostra a saída, os avisos e o código de saída. Depois lança um segundo processo que nunca termina (um setInterval vazio), espera no máximo 500 ms por ele com Promise.race e Bun.sleep e, se esgotar o tempo, termina-o com o kill do objeto devolvido (nunca por nome do processo) e mostra o código de saída e o signalCode.

## Módulo 03 · Servidor HTTP

### Exercício 9 · Saudações com rotas

**Nível:** Iniciante

Cria um servidor com Bun.serve na porta 35032, só com a opção routes e um fetch de reserva. A rota /ola/:nome devolve JSON com a chave mensagem, no formato Olá, NOME! Se o pedido trouxer ?maiusculas=1, o nome vai em maiúsculas. Qualquer outro caminho devolve JSON com a chave erro e o estado 404. Arranca o servidor, faz três pedidos com fetch (um normal, um com um nome com espaço e acentos e com maiúsculas, e um a um caminho que não existe), imprime estado, Content-Type e corpo, e pára o servidor.

### Exercício 10 · Contador de visitas com cookies

**Nível:** Intermédio

Na porta 35033, cria a rota /visitas que lê o cookie visitas (por omissão 0), soma 1 e volta a gravá-lo com httpOnly e maxAge de uma hora. Responde com JSON {visitas: n}. Se o cookie não for um inteiro não negativo, lança um erro com estado 400 que o handler error converta em JSON. Simula um browser: guarda o Set-Cookie de cada resposta e reenvia-o no pedido seguinte; faz 3 visitas e depois um pedido com o cookie visitas=abc.

### Exercício 11 · Avisos de encomendas por WebSocket

**Nível:** Avançado

Na porta 35034, cria um servidor com um endpoint WebSocket em /ws, onde cada cliente se subscreve ao tópico encomendas, e uma rota POST /avisos que recebe {id, estado} e publica o aviso no tópico. Valida o estado (pendente, enviada, entregue ou cancelada): se for outro, responde 400 e não publiques nada. A resposta de sucesso devolve quantos subscritores o tópico tinha. Com o cliente WebSocket nativo, liga dois ouvintes, envia dois avisos válidos e um inválido, e mostra o que cada ouvinte recebeu.

### Exercício 12 · Uma rota nova na API documentada

**Nível:** Avançado

Parte de uma cópia da pasta loja-api (a cópia tem de manter a posição relativa do loja.sql do módulo 00). Acrescenta o endpoint GET /api/clientes, com o parâmetro de query opcional cidade (texto com pelo menos 2 caracteres), que devolve id, nome e cidade dos clientes (não devolvas o email: o Hugo tem email NULL e o mini validador não suporta nullable). Só podes mexer em rotas.ts e no loja.test.ts: o servidor.ts e o openapi.ts têm de ficar intactos. Mostra que o caminho aparece no /openapi.json com o parâmetro, que o filtro e a validação (cidade=L dá 400) funcionam, e que o bun test passa. Depois de acrescentares a rota, o teste que verifica a lista de caminhos tem de ser atualizado: diz porquê.

## Módulo 04 · Cliente e Web APIs

### Exercício 13 · Consultar a API da loja

**Nível:** Iniciante

Guarda o teu ficheiro ao lado de servidor-loja.ts (a pasta 04-Cliente-e-Web-APIs/exemplos) e arranca o servidor local com iniciar() no próprio script, parando-o no fim com server.stop(true). Escreve uma função obter que faz um GET, lança um Error com o estado HTTP quando a resposta não é ok e devolve o corpo em JSON e o valor do cabeçalho X-Total-Count. Com ela, pede os produtos da categoria 3 com preço máximo 30 (monta a query com URLSearchParams) e mostra-os do mais caro para o mais barato, com o preço com duas casas e o stock, mais uma linha com o valor total em stock (soma em cêntimos inteiros). Mostra depois a mensagem do erro ao pedir o produto 99 e o name e o code do erro ao ligar à porta 35049, onde ninguém escuta.

### Exercício 14 · Descarregar e comprimir em streaming

**Nível:** Intermédio

Pede /api/linhas.ndjson ao servidor local e divide o corpo em dois ramos com tee(). Num ramo, conta as linhas e os caracteres com TextDecoderStream, sem juntar o texto todo. No outro, comprime com CompressionStream("gzip") e escreve o resultado num ficheiro linhas.ndjson.gz numa pasta temporária (mkdtemp). Mostra o número de linhas, o de caracteres e o tamanho do ficheiro comprimido. Depois confirma que o ficheiro começa pelos bytes 1f 8b, descomprime-o com DecompressionStream e verifica que o texto tem o mesmo número de caracteres e que a primeira linha é o Romance Policial. Descarrega ainda /api/relatorio.csv com Bun.write e confirma que o valor devolvido é igual ao tamanho do ficheiro. Apaga a pasta temporária no fim. Sugestão: se o Bun.write com uma Response feita a partir de um stream teu não terminar, escreve com file.writer().

### Exercício 15 · Cliente WebSocket que reconecta

**Nível:** Intermédio

Escreve uma classe ClienteWs com enviar(mensagem), fechar() e a lista das mensagens recebidas. Se a ligação cair (evento close sem ter sido tu a fechar), tenta reconectar com espera que duplica a cada falha a partir de 50 ms e desiste ao fim de um máximo de tentativas configurável; ao ligar com sucesso, repõe o contador. Mensagens enviadas enquanto a ligação não está aberta ficam numa fila e são enviadas quando abrir. Testa contra o servidor local (ws://localhost:35040/ws): envia encomenda 1 antes de a ligação abrir, depois envia cair (o servidor corta a ligação com o código 1011), espera um instante e envia encomenda 2 e, já reconectado, encomenda 3. Mostra o número de ligações e as mensagens recebidas. Por fim, cria um segundo cliente para ws://localhost:35049/ws (sem servidor) com 3 tentativas e mostra as esperas e a desistência. Explica numa frase porque é que uma mensagem enviada logo a seguir a cair se pode perder.

### Exercício 16 · Limpar e enriquecer HTML com HTMLRewriter

**Nível:** Avançado

Descarrega /catalogo.html do servidor local e transforma a Response com um HTMLRewriter, sem bibliotecas: (a) remove os elementos script e os comentários; (b) torna absolutos (https://loja.exemplo.pt mais o caminho) os links que começam por barra e conta quantos mudaste; (c) para cada li com a classe produto, usa um handler assíncrono que pede /api/produtos/ID (o ID está no atributo data-id), acrescenta o atributo data-stock e um span com a classe stock no fim do li, com o texto «N em stock» ou «esgotado». Mostra o HTML final e confirma que já não há script nem comentário. Numa segunda passagem sobre o HTML resultante, extrai o nome de cada produto (só o texto próprio do li, sem o do link nem o do selo) e mostra a lista. Explica porque é que, no passo (c), tiveste de passar uma Response e não uma string.

## Módulo 05 · Bases de dados

### Exercício 17 · Relatório de clientes com bun:sqlite

**Nível:** Iniciante

Copia o loja.sql para uma pasta de trabalho e escreve relatorio.ts. O programa abre uma base em memória com bun:sqlite, carrega o loja.sql com db.exec e imprime, por ordem decrescente do valor gasto, uma linha por cliente com o nome, o número de encomendas e o total gasto em euros (quantidade vezes preco_unitario das linhas), sem contar as encomendas com o estado que passas como parâmetro nomeado ($excluir, com o valor cancelada). Soma o dinheiro em cêntimos inteiros e só divide por 100 ao imprimir. Depois responde, executando: (a) o que acontece se passares a chave sem o prefixo ({ excluir: "cancelada" })? (b) que code, errno e mensagem dá uma consulta a uma tabela que não existe (clientess)?

### Exercício 18 · Encomendar com transação

**Nível:** Intermédio

Escreve encomendar.ts com bun:sqlite, PRAGMA foreign_keys = ON e uma função encomendar(clienteId, itens) feita com db.transaction. A função cria a encomenda (estado pendente, data 2025-06-15), lê o preço de cada produto, abate o stock só se houver quantidade suficiente (UPDATE com AND stock >= $qtd e verificação de changes), insere as linhas e devolve o id da encomenda e o total em euros. Chama-a com uma encomenda válida, com um produto sem stock (o produto 6, o Teclado Mecânico, tem stock 0) e com um cliente que não existe (99). Depois de cada chamada imprime o número de encomendas e de linhas e o stock dos produtos 5 e 6, e mostra que as chamadas falhadas não deixaram nada para trás. Que code devolve o cliente inexistente e porque é que só aparece com o PRAGMA ligado?

### Exercício 19 · O mesmo código em três motores

**Nível:** Intermédio

Com os contentores est-bn05-pg (PostgreSQL 17) e est-bn05-mysql (MySQL 8.4) a correr (portas 35051 e 35052 em 127.0.0.1, palavra-passe fictícia na variável de ambiente BN05_PW), escreve faturacao.ts que recebe o motor (sqlite, postgres ou mysql) como argumento e é igual nos três exceto na ligação. Carrega o loja.sql com sql.file e calcula, por categoria, o número de encomendas, as unidades vendidas e o valor faturado, sem contar as encomendas canceladas (o estado vai como parâmetro). Imprime o typeof de cada coluna do resultado em bruto, normaliza com Number e arredondamento a duas casas e imprime um hash do JSON normalizado (Bun.hash). Mostra numa tabela os tipos em bruto de cada motor e confirma que o hash é igual nos três. No MySQL 8.4 a ligação por TCP falha à primeira: regista o erro e corrige-o.

### Exercício 20 · Rota de encomendas à prova de injeção

**Nível:** Avançado

Escreve um servidor Bun.serve (porta 35053, 127.0.0.1) com a rota GET /encomendas que consulta a tabela encomendas com Bun.sql. Aceita três parâmetros opcionais na query string: estado (um de pendente, enviada, entregue, cancelada), cliente (inteiro maior ou igual a 1) e ordem (id, data_encomenda ou cliente_id; descendente). Compõe o WHERE com fragmentos de sql e usa sql(ordem) para o ORDER BY depois de validar a coluna numa lista. Valores inválidos dão 400 com {erro: ...}. Confere as linhas devolvidas com um esquema de Encomenda (id e cliente_id inteiros, data_encomenda e estado texto) e corre-o em SQLite e PostgreSQL: no PostgreSQL a data chega como Date, converte-a para AAAA-MM-DD. Faz pedidos reais com fetch a estes casos: estado=pendente, estado=entregue&cliente=1&ordem=data_encomenda, um estado com o texto x' OR '1'='1, uma ordem com o texto id; DROP TABLE encomendas, e cliente=0. Parte B: desliga só a validação da lista de estados e repete o pedido com x' OR '1'='1: quantas linhas devolve e porquê? Termina o servidor com servidor.stop no fim.

## Módulo 06 · Redis e S3

### Exercício 21 · Limitador de pedidos e ranking de visitas

**Nível:** Iniciante

Com o contentor Redis do módulo 06 a correr e REDIS_URL definida, escreve uma função limitar(ip, limite, janelaMs) que usa INCR e, só quando o contador vale 1, PEXPIRE para abrir a janela. Devolve se o pedido é permitido e quantos restam. Testa com limite 5 e janela de 400 ms: 8 pedidos seguidos do mesmo IP (os 3 últimos negados), um segundo IP que não é afetado, o tempo que falta ao contador (PTTL) e, depois de esperar 450 ms, um pedido que volta a ser permitido. Depois regista as visitas aos produtos 3, 3, 5, 3, 10, 5, 5, 5 num conjunto ordenado com ZINCRBY, guarda os nomes dos produtos (lidos da base da loja com a loja-db.ts do módulo) num hash com hset e mostra os 3 mais vistos com o nome. Apaga todas as chaves que criaste.

### Exercício 22 · Alertas de stock com pub/sub e reserva com transação

**Nível:** Intermédio

Guarda o stock do produto 3 (6 unidades) num hash. Abre duas ligações subscritoras (duplicate) do canal loja:stock, que acumulam as mensagens que recebem. Escreve reservar(produtoId, qtd): numa ligação própria, usa WATCH no hash, lê o stock com HGET e, se chegar, abre um MULTI com HINCRBY negativo e um RPUSH para uma lista de reservas, e faz EXEC; se o EXEC devolver null (alguém alterou o stock entretanto), repete; se não chegar, faz UNWATCH e devolve «sem-stock». Quando o stock restante for 3 ou menos, publica um alerta JSON em loja:stock. Lança 10 reservas de 1 unidade em paralelo e mostra quantas deram certo, o stock final, o tamanho da lista e os alertas recebidos por cada subscritor. Retira um subscritor, publica uma mensagem e mostra a quantos subscritores chegou. Mostra também o erro de chamar get numa ligação em modo subscritor, e termina o processo sem ficar pendurado.

### Exercício 23 · Arquivo de encomendas no S3

**Nível:** Intermédio

Com o contentor S3 do módulo 06 e as variáveis S3_* definidas, guarda cada uma das 12 encomendas da loja (id, cliente, data, estado e o total calculado a partir das linhas) num objeto JSON encomendas/2025/NNN.json (número com 3 algarismos, tipo application/json), em paralelo, mais um objeto encomendas/indice.txt. Lista o prefixo encomendas/2025/ em páginas de 5 com maxKeys e startAfter, mostra quantas páginas foram precisas e a primeira e a última chave. Lê todos os objetos em paralelo com json() e soma o faturado das encomendas não canceladas em cêntimos inteiros. Lista o prefixo encomendas/ com delimiter para mostrar o ficheiro e a pasta, mostra o stat de um objeto, lê-o por um URL pré-assinado com fetch e mostra o erro (name e code) ao ler uma chave que não existe. No fim apaga tudo e confirma que não sobra nada.

### Exercício 24 · Relatório em streaming e URL pré-assinado em cache

**Nível:** Avançado

Gera em streaming, com o writer() de um S3File e partSize de 5 MB, um CSV movimentos.csv de 700 000 linhas (linha, produto_id, quantidade) e mostra o tamanho escrito, o do S3, o etag (o sufixo indica o número de partes) e o tipo. Arranca um Bun.serve na porta 35062 com a rota /api/movimentos/ligacao: procura o URL no Redis; se não existir, assina um novo com expiresIn de 3 segundos e guarda-o no Redis com TTL de 2 segundos; devolve o URL e se veio da cache. Faz dois pedidos seguidos (o 2.º tem de vir da cache e o URL tem de ser o mesmo) e conta quantas assinaturas foram feitas. Com o URL, mostra o que acontece a um HEAD e depois lê só os primeiros 28 bytes com um pedido Range (estado e Content-Range). Espera 2,2 s e confirma que o URL é novo; espera mais 1 s e mostra o estado de um GET com Range ao URL antigo e ao novo. Explica numa frase porque é que o TTL da cache é menor do que a validade do URL e porque é que o HEAD falhou. Pára o servidor e apaga o objeto e as chaves.

## Módulo 07 · Segurança e utilitários

### Exercício 25 · Custos e migração de palavras-passe

**Nível:** Iniciante

Escreve ex25.ts. Mede o hash e o verify (melhor de 5 execuções, com Bun.nanoseconds) da palavra-passe Estudo_2026! para cinco configurações: bcrypt com custo 4, 8 e 10, e argon2id com memoryCost 19456 e 65536 (timeCost 2 nos dois). Mostra o resultado com Bun.inspect.table e escolhe a configuração mais lenta cujo verify fique abaixo de 250 ms.

Depois simula uma migração: cria um Map de dois clientes com hashes bcrypt de custo 4 e escreve uma função login(email, palavraPasse) que verifica a palavra-passe e, se o login for bem-sucedido e o hash ainda não for argon2id com memoryCost 19456, grava um hash novo. Mostra o algoritmo guardado de cada cliente antes e depois de a Ana entrar e de o Bruno falhar o login.

### Exercício 26 · O mesmo hash por quatro vias, HMAC e alterações

**Nível:** Intermédio

Com os três primeiros produtos da loja convertidos para texto JSON, calcula o SHA-256 de quatro maneiras: Bun.CryptoHasher, crypto.subtle.digest, createHash do node:crypto e Bun.SHA256.hash. Confirma que dão o mesmo valor. Faz o mesmo com um HMAC-SHA256 (chave de estudo) em três vias: CryptoHasher com chave, createHmac e crypto.subtle com importKey e sign.

Altera um caractere do texto (stock 40 para 41) e mostra quantos dos 64 caracteres hexadecimais do hash coincidem na mesma posição, e se o HMAC antigo ainda serve para o texto alterado. Cria uma função etag(objeto) com Bun.hash.xxHash3 e verifica que objetos iguais dão o mesmo ETag e objetos diferentes não. Por fim mede (melhor de 3) o tempo de sha256, md5, xxHash3 e crc32 sobre 20 MB e explica para que serve cada um.

### Exercício 27 · Token com rotação de chaves, revogação e CSRF

**Nível:** Intermédio

Estende o token HMAC da lição para o formato cabeçalho.corpo.assinatura em base64url. O cabeçalho leva o kid da chave que assinou, o corpo leva sub, exp e jti (um UUID v7). Mantém um Map de chaves (k1 e k2) e uma chave atual. A assinatura cobre cabeçalho e corpo, e verificar devolve um texto: ok, formato inválido, chave desconhecida, assinatura inválida, expirado ou revogado.

Mostra, por esta ordem: um token da k1 válido; depois de passar a chave atual para k2, o token da k1 e um novo da k2 ambos válidos; depois de retirar a k1, só o da k2; depois de revogar o jti do da k2, revogado; um payload trocado; um token expirado (50 ms). Termina com Bun.CSRF: um token ligado à sessão da Ana deve validar só para a Ana.

### Exercício 28 · Exportar a loja em vários formatos e comprimir

**Nível:** Avançado

Com as 3 categorias e os 10 produtos da loja num único objeto, serializa-o em JSON compacto, JSON indentado, YAML (Bun.YAML.stringify com indentação 2) e TOML (Bun.TOML.stringify). Faz a ida e volta de cada formato (JSON.parse, Bun.YAML.parse, Bun.TOML.parse) e confirma com Bun.deepEquals em modo estrito que os dados são iguais aos originais.

Mostra com Bun.inspect.table uma linha por formato com os bytes, o tamanho com gzip e com zstd (níveis por omissão), a percentagem do gzip e a largura em colunas da primeira linha (Bun.stringWidth). Mostra as primeiras 7 linhas do TOML. Imprime depois os produtos com stock inferior a 20 só com as colunas id, nome e stock, e por fim um relatório de texto com os 3 primeiros produtos em que o nome é alinhado com Bun.stringWidth. Explica porque é que o JSON indentado, sendo o maior, é o que mais ganha com o gzip, e o que o TOML exige da raiz.

## Módulo 08 · Testes nativos

### Exercício 29 · Testes de um desconto por quantidade

**Nível:** Iniciante

Escreve a função totalComDesconto(quantidade, preco) num ficheiro à parte, importando o arredondar do src/calculo.ts do módulo 08. A linha ganha 0 por cento de desconto abaixo de 10 unidades, 5 por cento de 10 a 49 e 10 por cento a partir de 50, e o resultado é arredondado ao cêntimo. Uma quantidade que não seja um inteiro maior ou igual a 1, ou um preço que não seja maior que 0, lança RangeError com a mensagem quantidade inválida: N (ou preço inválido: N). Escreve os testes com test.each: uma tabela com os limites 1, 9, 10, 49, 50 e 200 unidades da Caneca de Cerâmica (6.50 euros) e outra com as entradas inválidas. Corre bun test e depois bun test --coverage, e confirma que a função fica com 100 por cento. Diz porque usaste toBeCloseTo ou toBe para os valores.

### Exercício 30 · Encomendas atrasadas com tempo simulado e mocks

**Nível:** Intermédio

Escreve avisarAtrasadas(encomendas, enviar), que usa o estaAtrasada do src/prazos.ts para escolher as encomendas pendentes há mais de 7 dias e chama enviar(cliente_id, texto) para cada uma, em sequência. Se o envio falhar, regista a encomenda em falhados e continua; se o envio não responder em 1000 ms, conta como falha. Devolve { enviados, falhados } com os ids. Testa, com as encomendas 1, 8, 9 e 12 do loja.sql: (a) a 5 de junho de 2025 só a 8 e a 9 são avisadas, com os argumentos certos e pela ordem certa; (b) a 20 de abril de 2025 ninguém é avisado; (c) uma falha no primeiro envio não impede os seguintes; (d) um envio que nunca responde falha ao fim de 1000 ms simulados, sem esperar um segundo a sério. Repõe o relógio e os timers num afterEach.

### Exercício 31 · Cancelar uma encomenda com SQLite em memória

**Nível:** Intermédio

Escreve cancelarEncomenda(db, id) sobre bun:sqlite: só se cancelam encomendas pendentes, o stock das linhas volta ao produto e o estado passa a cancelada, tudo numa transação. Uma encomenda que não exista ou que não esteja pendente lança Error com uma mensagem clara e não altera nada. Cada teste usa uma base nova (abrirLojaEmMemoria do src/repositorio.ts, fechada no afterEach). Testa: a encomenda 8 (stock dos produtos 1, 2 e 4 sobe 1, 2 e 1), a encomenda 1 (entregue: erro e nada muda), cancelar a mesma encomenda duas vezes, uma encomenda inexistente e, com toMatchInlineSnapshot, o stock dos produtos 1, 4 e 10 depois de cancelar a encomenda 12. Mostra o ficheiro de teste depois de o Bun preencher o snapshot.

### Exercício 32 · Um script de CI local

**Nível:** Avançado

Escreve ci.ts: corre o bun test com Bun.spawn (usa process.execPath, passa os argumentos recebidos e acrescenta --reporter=junit com um --reporter-outfile num ficheiro temporário), espera pelo fim, lê o XML, apaga-o e imprime uma linha com testes, falhas, saltados e passaram, mais uma linha FALHOU por cada teste falhado. Termina com o mesmo código de saída do bun test. Se o XML não existir (por exemplo, nenhum ficheiro de teste encontrado), diz-o e sai com código diferente de 0. Corre-o sobre 01-calculo e 06-tempo, sobre ./bug-real/bug.ts (falha de propósito) e sobre um nome que não existe, e mostra os três códigos de saída. Diz porque o XML é mais fiável do que ler a saída de texto do bun test.

## Módulo 09 · Bundler e executáveis

### Exercício 33 · Três variantes de um pacote para o browser

**Nível:** Iniciante

Escreve um programa pacote.ts que usa Bun.build com ficheiros virtuais (a opção files) para compilar um iva.ts com duas funções exportadas, comIva(valor, taxa) e semIva(valor, taxa), e um cliente.ts que importa só a comIva e lê uma constante global TAXA_IVA (declarada com declare const). Faz três builds com target browser: a primeira normal, a segunda com minify e a terceira com minify, define TAXA_IVA como 0.23 e sourcemap externo. Para cada uma imprime, numa linha, o tamanho em bytes do JavaScript, o tamanho do mapa (se existir), se o texto semIva aparece no resultado e se o valor 0.23 foi colado no código. Explica a diferença entre o tamanho do JavaScript na segunda e na terceira variante.

### Exercício 34 · Um plugin para ficheiros .sql, no bundler e no runtime

**Nível:** Intermédio

Escreve consultas.sql com dois blocos, cada um com uma linha de comentário -- nome: xxx seguida de uma consulta ao loja.sql (produtos com stock abaixo de 50, e o número de produtos por categoria), e comentários normais pelo meio. Escreve um BunPlugin (plugin-sql.ts) que: (a) faz com que import consultas from "./consultas.sql" devolva um array de objetos com nome e sql (a consulta numa só linha, sem comentários); (b) cria o módulo virtual loja:esquema, que exporta as tabelas do loja.sql (lê o ficheiro e procura CREATE TABLE). Escreve usar.ts, que importa as consultas e o esquema, abre o loja.sql em bun:sqlite (importado com type text) e corre as consultas. Corre o mesmo plugin de duas formas: com Bun.build (corre o resultado num processo à parte) e com Bun.plugin seguido de um import dinâmico. Atenção a um problema: o teu filtro /[.]sql$/ também apanha o loja.sql. Mostra o erro que isso provoca e resolve-o de uma forma que funcione nos dois modos.

### Exercício 35 · A CLI da loja num executável

**Nível:** Intermédio

Escreve loja-cli.ts com dois comandos, produtos (com a opção --categoria N) e encomenda ID. Embute o loja.sql e um ajuda.txt com import attributes, e usa node:util parseArgs para os argumentos. A variável de ambiente LOJA_FORMATO=json muda a saída de tabela para JSON. Uma encomenda inexistente escreve o erro em stderr e sai com código 2; um comando em falta mostra a ajuda e sai com código 1. Compila com bun build --compile --minify para uma pasta tua. Corre o executável com produtos --categoria 3, com LOJA_FORMATO=json encomenda 8, com encomenda 99 e sem argumentos, e mostra a saída e o código de saída de cada um. Mostra o tamanho do executável e confirma que corre noutra pasta (sem o loja.sql ao lado).

### Exercício 36 · Montra da loja: servidor, página e macros num só executável

**Nível:** Avançado

Faz uma montra: um servidor.ts com Bun.serve que serve uma página (HTML import com um web/index.html, um montra.ts em TypeScript para o browser e um montra.css), a rota /api/produtos (bun:sqlite em memória com o loja.sql embutido) e a rota /api/versao. Escreve duas macros em macros.ts: compiladoEm(), que devolve a data da build, e produtosNoSql(), que lê o loja.sql e conta as linhas INSERT INTO produtos. O montra.ts usa as duas para escrever um rodapé; o servidor.ts usa a compiladoEm() na /api/versao. Compila para um executável com --minify. Escreve verificar.ts, que arranca o executável com Bun.spawn numa porta tua, pede a página e os seus ficheiros JS e CSS, a API e a versão, mostra o início do JavaScript servido (a prova de que as macros já foram resolvidas na build) e termina só o processo que lançou. Diz porque é que o valor de /api/versao é o mesmo em todas as execuções do mesmo executável.

## Módulo 10 · Pacotes e workspaces

### Exercício 37 · Do intervalo à versão instalada

**Nível:** Iniciante

Numa pasta nova, fora da pasta do curso, define BUN_INSTALL_CACHE_DIR para uma pasta tua e confirma o caminho com bun pm cache. Cria um package.json com só o nome e a versão, e instala is-number@^5.0.0 e is-odd com um único bun add. Responde: (a) que versões de is-number ficaram instaladas e porquê (usa bun why is-number)? (b) o que diz o bun outdated? Corre depois bun update e bun update --latest is-number. Mostra o package.json final e a árvore de bun pm ls --all. Explica porque é que o bun update, sozinho, não mudou nada.

### Exercício 38 · Um gancho sob vigilância

**Nível:** Intermédio

Cria um pacote teu, pacote-com-gancho, com um postinstall inofensivo (por exemplo node marca.js, que escreve um ficheiro de texto dentro da própria pasta do pacote; podes partir de exemplos/gancho). Empacota-o com bun pm pack e instala o tarball num projeto novo com bun add, sempre com cache própria. Mostra: (a) o aviso de script bloqueado e a ausência do ficheiro; (b) o que lista o bun pm untrusted; (c) o que mudou no package.json depois de bun pm trust e a prova de que o script correu; (d) o que acontece numa reinstalação limpa e com --ignore-scripts. Explica porque é que o postinstall do próprio projeto correu e o da dependência não.

### Exercício 39 · Monorepo de dois pacotes com catálogo

**Nível:** Intermédio

Cria um monorepo com a raiz e dois pacotes: @est/lib (versão 2.1.0, exporta codigo(n), que devolve ENC- seguido de n com cinco algarismos, usando o left-pad) e @est/cli (versão 1.0.0, depende do @est/lib com `workspace:*` e imprime o código do número recebido). A versão do left-pad vive num catálogo da raiz (left-pad 1.3.0) e o @est/lib refere-a com catalog:. Mostra: (a) bun install e o cli a correr; (b) bun run --filter com um script teste nos dois pacotes e só num; (c) bun install --filter @est/lib e o que ficou instalado; (d) o package.json do @est/cli dentro do tarball de bun pm pack, a mostrar que o `workspace:*` virou a versão real; (e) o que diz bun why left-pad.

### Exercício 40 · Remendar o ms

**Nível:** Avançado

O ms 2.1.3 não percebe unidades em português: ms("2 dias") devolve undefined. Num projeto novo (cache própria) instala ms@2.1.3 e usa bun patch para que ms("2 dias") dê 172800000, aceitando dia e dias (um script remendar.ts pode fazer a edição). Gera o patch com bun patch --commit e mostra o patches/ms@2.1.3.patch e o que mudou no package.json. Depois apaga o node_modules e reinstala com --frozen-lockfile para provar que o patch persiste. Mostra que a cache original continua sem a alteração e diz porque é que não se deve editar node_modules/ms/index.js à mão sem o bun patch.

## Módulo 11 · Concorrência e interoperabilidade

### Exercício 41 · Um worker de IVA que falha

**Nível:** Iniciante

Escreve iva-worker.ts, um worker em TypeScript que recebe mensagens { nome, preco } e responde com { nome, comIva }, com 23 por cento de IVA e arredondado ao cêntimo. Se o preço for negativo, o worker lança RangeError com a mensagem preço negativo: NOME. No ficheiro principal cria o worker, envia o Romance Policial (12.90), a Caneca de Cerâmica (6.50), um produto com preço -1 e ainda um quarto produto válido. Mostra as respostas que chegam, apanha o evento error e imprime só a linha do erro, e espera pelo evento close para imprimir o código com que o worker fechou e quantas respostas chegaram. Explica porque o quarto produto não tem resposta.

### Exercício 42 · Receita por categoria com um pool e Atomics

**Nível:** Intermédio

Parte das 25 linhas de encomendas não canceladas da loja, como triplos (categoria, quantidade, preço em cêntimos), repetidas 4000 vezes (100 mil linhas). Calcula a receita sem IVA por categoria de duas formas: num ciclo sequencial e com 3 workers que recebem uma fatia das linhas cada um e somam todos no mesmo SharedArrayBuffer com Atomics.add (um Int32Array de 4 posições, posição = id da categoria, valor em cêntimos). Termina os workers com terminate(). Mostra, por categoria, o valor sequencial, o valor dos workers e se são iguais. Diz porque não bastava somar com um ++ normal na memória partilhada.

### Exercício 43 · Cotações por IPC entre processos Bun

**Nível:** Intermédio

Escreve cotacao.ts, um programa que corre como processo filho e responde, por process.send, a pedidos { id, produto, quantidade } com { id, total } (preço da tabela do produto vezes a quantidade, com 23 por cento de IVA, em euros com 2 casas): usa Romance Policial 12.90, Carregador USB-C 14.90 e Caneca de Cerâmica 6.50. Um produto desconhecido responde { id, erro }. O filho avisa o pai com { pronto: true } quando arranca e termina quando recebe a mensagem terminar. No principal lança o filho com Bun.spawn e a opção ipc, envia 3 pedidos (um deles com um produto desconhecido) depois do pronto, imprime cada resposta e, quando tiverem chegado as três, manda terminar o filho. No fim imprime o código de saída do filho. Não uses nenhuma biblioteca e não deixes o filho a correr.

### Exercício 44 · IVA em WebAssembly e dependências com o Bun.Transpiler

**Nível:** Avançado

Parte 1: escreve em bytes, sem ferramentas, um módulo WebAssembly que exporta iva(cent: i32): i32 = (cent * 123 + 50) / 100 (divisão inteira com sinal). Instancia-o e compara com Math.round(cent * 1.23) para os preços em cêntimos de 10 produtos da loja (1290, 1850, 2999, 4990, 1490, 7900, 2200, 8990, 3450 e 650), dizendo quantos diferem. Dica: o LEB128 com sinal precisa de 2 bytes para 123 e para 100. Parte 2: escreve dependencias.ts, que usa Bun.Transpiler.scanImports para listar, por módulo, todos os módulos importados (que não sejam caminhos relativos) pelos ficheiros .ts da própria pasta, e em que ficheiros aparecem. Cria um amostra.ts só para ser analisado (nunca executado) com imports de bun:sqlite, node:crypto, node:fs, um ficheiro local e um import dinâmico de node:zlib.

## Projeto final

### Exercício 45 · API da loja sem bibliotecas, documentada e em executável

**Nível:** Avançado

Constrói a API da loja só com o que o Bun traz, seguindo o módulo 12: SQLite com bun:sqlite, as cinco rotas com transação para criar encomendas, a documentação OpenAPI com Swagger UI gerada da mesma tabela de rotas, segurança básica, pelo menos 15 testes com cobertura e um executável único. A pasta não pode ter node_modules.

**PRATICAR:** faz o projeto por fases e usa a grelha do módulo 12 e a consulta rápida do módulo 14.
