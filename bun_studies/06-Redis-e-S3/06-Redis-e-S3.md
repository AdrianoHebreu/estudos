# 06 Redis e S3

Neste módulo falas com dois serviços que quase toda a aplicação web acaba por usar: o Redis (memória partilhada e muito rápida: cache, contadores, filas, mensagens) e o S3 (armazenamento de objetos: relatórios, imagens, cópias de segurança). O Bun traz um cliente nativo para cada um (Bun.redis e Bun.s3), sem ioredis nem @aws-sdk. Todas as saídas foram obtidas com o Bun 1.4.0 no Windows 11 (Git Bash), contra contentores Docker. A documentação online descreve a 1.4.5: onde a 1.4.0 difere, digo-o em notas «Na 1.4.0». Os exemplos usam as portas 35060 a 35069.

## O que substitui

| Biblioteca ou hábito do npm | Funcionalidade nativa |
|---|---|
| ioredis, redis (node-redis) | Bun.redis e new RedisClient |
| @aws-sdk/client-s3, @aws-sdk/s3-request-presigner | Bun.s3 e new S3Client (file, write, list, presign) |
| @aws-sdk/lib-storage (upload em partes) | s3.file(chave).writer() |
| aws4, aws-sigv4 (assinar pedidos) | s3.presign() |
| Criar buckets, copiar objetos, políticas | Não existe na 1.4.0: usa a consola ou a CLI do servidor |

## O ambiente: dois contentores

Precisas do Docker Desktop aberto. Os contentores deste módulo têm o prefixo est-bn06-, portas só em 127.0.0.1 no intervalo 35060 a 35069 e volumes com nome. As palavras-passe são fictícias e vão por variáveis de ambiente: nunca as escrevas num ficheiro do curso.

    export REDIS_PASSWORD=escolhe-uma-palavra-passe-ficticia
    export S3_ACCESS_KEY_ID=chave-de-estudo
    export S3_SECRET_ACCESS_KEY=segredo-de-estudo-ficticio

    docker run -d --name est-bn06-redis -p 127.0.0.1:35060:6379 \
      -v est-bn06-redis-data:/data -e REDIS_PASSWORD redis:8 \
      sh -c 'exec redis-server --requirepass "$REDIS_PASSWORD"'

    docker run -d --name est-bn06-s3 -p 127.0.0.1:35061:9000 \
      -v est-bn06-s3-data:/data \
      -e RUSTFS_ACCESS_KEY="$S3_ACCESS_KEY_ID" -e RUSTFS_SECRET_KEY="$S3_SECRET_ACCESS_KEY" \
      rustfs/rustfs:1.0.6

Redis: usei a imagem oficial redis:8 (servidor 8.10.3). A imagem usa /data como diretório de trabalho (não declara VOLUME), e monto lá um volume com nome para o Docker nunca criar um anónimo. Troquei-a depois por valkey/valkey:8 (servidor 8.1.12) e os exemplos 01 a 04, 07 e 11 deram os mesmos resultados: o RedisClient do Bun também fala com o Valkey. Um volume com dados do Redis 8 não arranca no Valkey (Can't handle RDB format version 15): usa volumes separados.

S3: a escolha óbvia seria o MinIO, mas verifiquei que o repositório minio/minio no GitHub está arquivado («THIS REPOSITORY IS NO LONGER MAINTAINED»), que a página da imagem minio/minio no Docker Hub dá 404 e que o manifesto é recusado. Escolhi o RustFS (imagem oficial rustfs/rustfs, licença Apache 2.0, descrito como alternativa ao MinIO): um único contentor, uma imagem de 349 MB em disco, credenciais por RUSTFS_ACCESS_KEY e RUSTFS_SECRET_KEY, porta 9000 para a API S3. Fixei a versão 1.0.6 porque o projeto é novo e muda depressa. Corre como utilizador não-root (UID 10001) e a imagem já prepara o /data para ele, por isso o volume com nome funciona sem chown.

Falta o bucket. O Bun 1.4.0 não cria buckets (S3Client não tem essa operação). A imagem traz a CLI rc do próprio RustFS:

    docker exec -e S3_ACCESS_KEY_ID -e S3_SECRET_ACCESS_KEY est-bn06-s3 sh -c \
      'rc alias set local http://127.0.0.1:9000 "$S3_ACCESS_KEY_ID" "$S3_SECRET_ACCESS_KEY" && rc bucket create local/est-bn06'

O Bun lê as variáveis de ambiente (nenhum ficheiro .env é preciso):

    export REDIS_URL=redis://:$REDIS_PASSWORD@127.0.0.1:35060
    export S3_ENDPOINT=http://127.0.0.1:35061 S3_BUCKET=est-bn06 S3_REGION=us-east-1

Para arrumar no fim: docker rm -f -v est-bn06-redis est-bn06-s3, docker volume rm est-bn06-redis-data est-bn06-s3-data e docker rmi redis:8 rustfs/rustfs:1.0.6 (só se mais ninguém usar as imagens). Nunca uses prune: apaga o que não é teu.

**NOTA:** a documentação diz que o cliente Redis suporta servidores 7.2 ou superiores, e a ordem de leitura é REDIS_URL, depois VALKEY_URL, por fim redis://localhost:6379. Confirmei: com só VALKEY_URL definida funciona; com as duas definidas, a REDIS_URL ganha. Se não houver nenhuma, tenta a porta 6379 (e falha, se ninguém lá estiver).

## Redis: ligar e comandos de texto

Bun.redis é um cliente já criado, que lê o REDIS_URL. Para outro servidor cria new RedisClient(url, opções). A ligação só é aberta no primeiro comando (ou em connect()). Exemplo completo: exemplos/01-redis-basico.ts.

    import { redis, RedisClient } from "bun";
    redis === Bun.redis;                      // true
    redis.connected;                          // false (ainda sem comandos)
    await redis.ping();                       // PONG, e agora connected é true
    await redis.set("est:produto:3:nome", "Atlas Mundial");
    await redis.get("est:produto:3:nome");    // "Atlas Mundial"
    await redis.get("est:nao-existe");        // null
    await redis.exists("est:nao-existe");     // false (o exists devolve boolean)
    await redis.getBuffer("est:produto:3:nome");   // <Buffer 41 74 6c 61 ...>

O valor é sempre texto: guardas o número 10 e o get devolve "10" (um string). O que o Redis devolve como inteiro (incr, ttl, del, hlen) chega como number. Os contadores são atómicos:

    await redis.set("est:stock:3", 10);
    await redis.incr("est:stock:3");          // 11
    await redis.decr("est:stock:3");          // 10
    await redis.incrby("est:stock:3", 5);     // 15

### Expiração

Uma chave pode desaparecer sozinha. É a base de qualquer cache. As opções do SET vão como argumentos de texto a seguir ao valor.

    await redis.set("est:sessao", "ativa", "EX", 100);   // OK, expira em 100 s
    await redis.ttl("est:sessao");            // 100 (segundos); pttl dá milissegundos
    await redis.expire("est:sessao", 5);      // muda para 5 s
    await redis.persist("est:sessao");        // 1: deixa de expirar, e o ttl passa a -1
    await redis.ttl("est:nao-existe");        // -2 (a chave não existe)
    await redis.set("est:x", "y", "NX", "PX", 50);  // NX: só se não existir, PX: em milissegundos

O ttl devolve -1 para uma chave sem expiração e -2 para uma que não existe. No exemplo, a chave de 50 ms já era null 80 ms depois.

## Hashes, listas, conjuntos e ordenados

Exemplo completo: exemplos/02-redis-estruturas.ts. Um hash é um objeto plano (campos e valores de texto). O hset aceita pares nome/valor ou um objeto, e o hgetall devolve um objeto sem protótipo, com todos os valores em texto.

    await redis.hset("est:p:3", "nome", "Atlas Mundial", "preco", "29.99");  // 2 campos novos
    await redis.hset("est:p:3", { stock: 10 });                              // 1
    await redis.hget("est:p:3", "nome");                 // "Atlas Mundial"
    await redis.hmget("est:p:3", ["nome", "x"]);         // ["Atlas Mundial", null]
    await redis.hgetall("est:p:3");                      // { nome, preco: "29.99", stock: "10" }
    await redis.hincrby("est:p:3", "stock", -3);         // 7

As listas funcionam como filas ou pilhas (rpush e lpop dão uma fila; lpush e lpop dão uma pilha). Os conjuntos não têm repetidos e permitem interseção e união. Os conjuntos ordenados guardam uma pontuação por membro, e servem para rankings.

    await redis.rpush("est:l", "b", "c", "d");           // 3 (o tamanho)
    await redis.lrange("est:l", 0, -1);                  // ["b", "c", "d"]
    await redis.lpop("est:vazia");                       // null
    await redis.sadd("est:tags:3", "livros", "mapas");   // 2 (repetido dá 0)
    await redis.sismember("est:tags:3", "mapas");        // true
    await redis.zadd("est:top", 3, "Atlas", 1, "Romance");
    await redis.zrange("est:top", 0, -1, "WITHSCORES");  // [["Romance", 1], ["Atlas", 3]]

**NOTA:** com WITHSCORES o resultado vem em pares aninhados (o cliente fala RESP3). A 1.4.0 tem mais de 250 métodos com nome; para o resto há o send(), mais abaixo.

## Pub/sub

O Redis também é um canal de mensagens: quem publica não sabe quem escuta, e as mensagens não ficam guardadas (quem não estiver subscrito perde-as). Exemplo completo: exemplos/03-redis-pubsub.ts. A documentação marca o pub/sub como experimental.

    const publicador = new RedisClient(process.env.REDIS_URL);
    const subscritor = await publicador.duplicate();     // 2.ª ligação, mesma configuração
    await subscritor.subscribe("loja:encomendas", (mensagem, canal) => {
      console.log(canal, "->", mensagem);
    });
    await publicador.publish("loja:encomendas", JSON.stringify({ id: 13 }));   // 1
    await publicador.publish("loja:stock", "baixo");                           // 0

O publish devolve quantos subscritores receberam a mensagem (1 no primeiro caso, 0 no canal sem ninguém). Um cliente que subscreve fica em modo subscritor: só aceita subscribe, unsubscribe, pubsub e ping. Qualquer outro comando é rejeitado:

    get no subscritor: ERR_REDIS_INVALID_STATE
    RedisClient.prototype.get cannot be called while in subscriber mode.

Por isso o duplicate(): uma ligação para escutar e outra para o resto. Faz unsubscribe() antes de close(): na 1.4.0 um cliente fechado ainda subscrito deixou o processo a correr para sempre (testei duas vezes; com unsubscribe terminou). **Na 1.4.0:** a documentação lista também o psubscribe (subscrição por padrão), mas ao chamá-lo com um callback, como o subscribe, recebi TypeError ERR_INVALID_ARG_TYPE. Não consegui usá-lo, por isso usa canais exatos.

## Pipelining, send() e transações

O cliente envia comandos em lote sem esperar pelas respostas (pipelining automático). Para aproveitá-lo não ponhas await em cada comando, dispara-os juntos (exemplo 03).

    await Promise.all(Array.from({ length: 1000 }, (_, i) => redis.set(`est:p${i}`, String(i))));
    // 1000 SET em paralelo: 14 ms. Os mesmos 1000 em série, com await em cada um: 1230 ms.

O mesmo teste com enableAutoPipelining: false deu 7 ms: no meu ambiente a opção não fez diferença visível. Não prometo um ganho que não medi.

O send(comando, argumentos) corre qualquer comando, até os que não têm método. Os argumentos vão sempre num array de texto. Exemplo completo: exemplos/04-redis-send-e-transacoes.ts.

    await redis.send("RPUSH", ["est:fila", "a", "b"]);
    await redis.send("OBJECT", ["ENCODING", "est:fila"]);     // "listpack"

Os erros do servidor chegam como RedisError com code ERR_REDIS_SERVER_ERROR e a mensagem do Redis (WRONGTYPE Operation against a key holding the wrong kind of value; ERR unknown command; ERR wrong number of arguments).

Não há método para transações: usam-se MULTI e EXEC por send(), como diz a documentação (Transactions require raw commands). Cada comando responde QUEUED e o EXEC devolve os resultados todos de uma vez, ou DISCARD cancela.

    const tx = await redis.duplicate();
    await tx.send("MULTI", []);                                   // OK
    await tx.send("SET", ["est:saldo", "100"]);                   // QUEUED
    await tx.send("INCRBY", ["est:saldo", "-30"]);                // QUEUED
    await tx.send("EXEC", []);                                    // ["OK", 70]

**ATENÇÃO:** nunca faças MULTI no cliente partilhado (Bun.redis). É uma só ligação: um get de outro pedido que passe no meio da transação recebe QUEUED em vez do valor (reproduzi: o get alheio devolveu QUEUED). Abre sempre uma ligação própria com duplicate().

## Erros de ligação e reconexão

Exemplo completo: exemplos/05-redis-erros-de-ligacao.ts. Os erros reais:

| Situação | Erro (code) e mensagem |
|---|---|
| Sem palavra-passe | ERR_REDIS_AUTHENTICATION_FAILED: NOAUTH HELLO must be called with the client already authenticated... |
| Palavra-passe ou utilizador errados | ERR_REDIS_AUTHENTICATION_FAILED: WRONGPASS invalid username-password pair or user is disabled. |
| Porta fechada | ERR_REDIS_CONNECTION_CLOSED: Max reconnection attempts reached |
| URL com protocolo errado | erro síncrono no construtor: Expected url protocol to be one of redis, valkey, rediss, valkeys, redis+tls, redis+unix, redis+tls+unix |

**ATENÇÃO:** com a configuração por omissão uma porta fechada só falha ao fim de 20 tentativas com espera crescente: medi 31,2 segundos até o get rejeitar. Em produção define maxRetries e connectionTimeout. Com maxRetries 2 falhou em 155 ms. **Na 1.4.0:** a documentação diz que, depois da última tentativa, error.cause é o erro dessa tentativa. Na 1.4.0 medi cause igual a undefined: só tens o code e a mensagem.

A reconexão é automática (autoReconnect, por omissão ligado). O exemplo 06 pára e volta a arrancar o contentor a meio de um pedido (só funciona com o teu contentor est-bn06-redis). O comando pedido com o servidor em baixo (ligado: false) ficou na fila e devolveu o valor certo quando a ligação voltou, ao fim de 1418 ms.

Com enableOfflineQueue: false o comando falha logo (ERR_REDIS_CONNECTION_CLOSED: Connection is closed and offline queue is disabled), e tens de chamar connect() antes do primeiro comando, senão o próprio primeiro falha. **Na 1.4.0:** o onclose não foi chamado quando o servidor caiu (só ao chamar close()), enquanto o onconnect foi chamado em cada ligação. Não uses o onclose para detetar quedas.

## Redis na loja: cache, visitas e fila

Exemplo completo: exemplos/07-loja-redis.ts, com a base da loja em SQLite (bun:sqlite, módulo 05) a servir de base lenta.

A cache de leitura (cache-aside): lê do Redis; se for null, lê da base e guarda com TTL; ao alterar, apaga a chave.

    async function obterProduto(id: number) {
      const chave = `loja:produto:${id}`;
      const emCache = await redis.get(chave);
      if (emCache !== null) return JSON.parse(emCache);
      const produto = db.query("SELECT id, nome, preco, stock FROM produtos WHERE id = ?").get(id);
      if (produto) await redis.set(chave, JSON.stringify(produto), "EX", 30);
      return produto;
    }
    // leitura 1: base | leituras 2 e 3: cache | TTL restante: 30 s | leituras na base: 1
    // alterarPreco(3, 24.99) faz UPDATE e redis.del(chave): a leitura seguinte vai à base e vê 24.99

Não guardes o que não existe (o produto 99 não cria chave), senão qualquer pessoa enche a cache com chaves inúteis. O TTL é a rede de segurança: se alguma escrita se esquecer de invalidar, o erro dura no máximo 30 s.

O contador de visitas usa incr, que é atómico: 50 pedidos em paralelo ao produto 3 deram exatamente 50, sem perder nenhum. Um conjunto ordenado dá o ranking dos mais vistos:

    for (const id of [3, 3, 5, 3, 10, 5]) await redis.zincrby("loja:top", 1, String(id));
    await redis.zrevrange("loja:top", 0, 2, "WITHSCORES");   // [["3", 3], ["5", 2], ["10", 1]]

A fila simples: o produtor faz rpush e o trabalhador faz blpop, que espera até haver um item (ou até ao tempo indicado, e então devolve null). O blpop bloqueia a ligação, por isso o trabalhador usa a sua (duplicate()): num teste, um ping no mesmo cliente ficou à espera enquanto o blpop esperava.

    const item = await trabalhador.blpop("loja:fila", 1);    // ["loja:fila", '{"encomendaId":13}'] ou null
    // processadas pela ordem de chegada: [13, 14, 15]

Esta fila perde o item se o trabalhador morrer depois do blpop: para filas fiáveis há os streams (xadd e xreadgroup, que o cliente tem), que não verifiquei neste módulo.

## S3: ligar e escolher o bucket

Bun.s3 é um cliente já criado que lê S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_BUCKET, S3_REGION e S3_SESSION_TOKEN (com AWS_* como alternativa) do ambiente. Para outro bucket ou serviço cria new S3Client({ accessKeyId, secretAccessKey, endpoint, bucket, region }). Sem endpoint o destino é a AWS (a região por omissão é us-east-1); com um servidor compatível indicas o endpoint e o Bun usa endereços do tipo caminho (http://127.0.0.1:35061/est-bn06/chave). Se faltar tudo:

    S3Error ERR_S3_MISSING_CREDENTIALS | Missing S3 credentials. 'accessKeyId', 'secretAccessKey', 'bucket', and 'endpoint' are required

**Na 1.4.0:** as propriedades do cliente (s3.bucket, s3.endpoint) vêm undefined; só o ficheiro tem bucket. Segundo a documentação o Bun lê as variáveis na inicialização e não de process.env, por isso alterá-las depois não tem efeito.

## S3File: um BunFile na nuvem

s3.file(chave) devolve uma referência preguiçosa (nenhum pedido até precisares) que estende Blob, como Bun.file. Exemplo completo: exemplos/08-s3-basico.ts.

    const f = s3.file("exemplos/ola.txt");
    await f.exists();                                  // false
    await f.write("Olá, S3!", { type: "text/plain" }); // 9 (bytes escritos)
    await f.text();                                    // "Olá, S3!"
    await f.stat();                                    // { etag, lastModified, size: 9, type: "text/plain;charset=utf-8" }
    await s3.size("exemplos/ola.txt");                 // 9
    await f.slice(4).text();                           // ", S3!" (o pedido usa o cabeçalho Range)
    await s3.file("exemplos/produto-3.json").json();   // { id: 3, nome: "Atlas Mundial" }
    await Bun.write(s3.file("exemplos/bw.txt"), "via Bun.write");   // 13
    await f.delete();                                  // unlink é o mesmo

O f.size síncrono é NaN (o tamanho precisa de um pedido): usa stat() ou s3.size(). O slice conta bytes, não carateres: f.slice(0, 3).text() deu «Ol» seguido do carácter de substituição, porque cortou o á a meio. O type de um write fica no objeto e volta no stat() e no cabeçalho Content-Type. O write aceita também Buffer, Blob, Response e streams.

**NOTA:** a listagem devolve no máximo 1000 objetos por pedido. Com prefix filtras, com maxKeys e startAfter paginas, e com delimiter as «pastas» (o S3 só tem chaves com barras) vêm em commonPrefixes:

    const l = await s3.list({ prefix: "exemplos/" });  // { keyCount: 3, isTruncated: false, contents: [{ key, eTag, size, lastModified, storageClass }] }
    await s3.list({ prefix: "exemplos/", delimiter: "/" });   // commonPrefixes: [{ prefix: "exemplos/sub/" }]

**Na 1.4.0:** a documentação descreve o delete como Promise de void; na 1.4.0 devolve true (também quando a chave não existe). O exists() devolve false e o delete() não falha para chaves inexistentes.

## Uploads grandes e streaming

O f.writer() devolve um escritor que envia ao S3 em partes (multipart upload) à medida que escreves, sem teres o ficheiro todo em memória. Exemplo completo: exemplos/10-s3-streaming-e-multiparte.ts.

    const w = grande.writer({ partSize: 5 * 1024 * 1024, queueSize: 3, retry: 2 });
    for (let i = 0; i < 12; i++) { w.write(umMegabyte); await w.flush(); }
    await w.end();
    // 12582912 bytes em 486 ms, etag "1894e60e...-3"  (o sufixo -3 são 3 partes de 5 MB)

Já um write() de um buffer de 12 MB de uma vez foi um único PUT (etag sem sufixo). Para ler, grande.stream() é um ReadableStream (leu 12 MB em 351 blocos) e o slice lê só um intervalo. O Bun.write copia entre disco e S3 nos dois sentidos. **Na 1.4.0:** nestas cópias e no writer.end() o valor devolvido foi 0 (os dados chegaram: comparei os textos). Não uses esse número como tamanho. O endereço s3://bucket/chave também funciona no fetch e no Bun.file, mas com S3_BUCKET definida o fetch devolveu NoSuchKey (o bucket é contado duas vezes); prefere s3.file().

## URLs pré-assinados e Response com S3File

presign() é síncrono: assina localmente (AWS Signature V4) um URL temporário que dá acesso a uma única chave, sem credenciais e sem pedido de rede. Por omissão é um GET que expira em 86400 segundos (24 horas, confirmado).

    const url = s3.presign("relatorios/vendas-2025.csv", { expiresIn: 60 });
    // http://127.0.0.1:35061/est-bn06/relatorios/vendas-2025.csv?X-Amz-Algorithm=...&X-Amz-Expires=60&X-Amz-Signature=...
    s3.presign("novo.txt", { method: "PUT", expiresIn: 60, type: "text/plain" });   // para o cliente enviar

Os métodos aceites são GET, PUT, DELETE e HEAD (outro dá ERR_S3_INVALID_METHOD). Medi os dois falhanços: um URL expirado dá 403 com Request has expired, e um com a assinatura adulterada dá 400 AuthorizationQueryParametersError. Sem a parte da assinatura (só o caminho) dá 403, e o método faz parte da assinatura: um HEAD com um URL assinado para GET também dá 403.

Uma Response com um S3File no corpo é um redirecionamento: o Bun responde 302 com um Location que é um URL pré-assinado. Na 1.4.0 esse URL expira em 900 segundos (X-Amz-Expires=900). O ficheiro nunca passa pelo teu servidor, o que poupa memória e largura de banda.

**ATENÇÃO:** o URL aponta para o endpoint que configuraste. O cliente tem de conseguir chegar-lhe: um endpoint interno (nome de um contentor, localhost de outra máquina) funciona para ti e falha para o browser de quem descarrega.

## Juntar tudo: o relatório da loja no S3

Exemplo completo: exemplos/11-loja-relatorio-s3.ts. Calcula as vendas por produto (encomendas não canceladas), guarda o CSV no S3 com o tipo e o nome de ficheiro certos, e serve-o de duas maneiras num Bun.serve na porta 35062 (parado no fim com server.stop):

    await s3.write(chave, csv, { type: "text/csv", contentDisposition: 'attachment; filename="vendas-2025.csv"' });
    routes: {
      "/relatorio.csv": () => new Response(s3.file(chave)),
      "/api/relatorio/ligacao": async () => {
        await redis.incr("loja:descargas:relatorio");
        return Response.json({ url: s3.presign(chave, { expiresIn: 60 }), expiraEmSegundos: 60 });
      },
    }

Resultado real:

    guardado no S3: relatorios/vendas-2025.csv 314 bytes | text/csv
    sem seguir o redirect: 302 /est-bn06/relatorios/vendas-2025.csv
    a seguir o redirect: 200 text/csv | attachment; filename="vendas-2025.csv"
    4,Auscultadores Bluetooth,4,199.60  (a mais vendida) ... 3,Atlas Mundial,1,29.99
    URL pré-assinado: 200 | sem assinatura: 403 | pedidos de ligação no Redis: 1
    PUT pré-assinado: 200 -> nota enviada pelo cliente

O Redis fica com as métricas e o S3 com o ficheiro. Para não assinar um URL novo a cada pedido, guarda-o no Redis com um TTL um pouco menor do que o expiresIn: é o exercício 24.

**NOTA:** o SQLite soma decimais em vírgula flutuante, por isso o exemplo arredonda (ROUND e toFixed). Peculiaridades do Windows neste módulo: só o tmpdir() com barras invertidas, que o exemplo 10 troca por barras normais.

## Exercícios

**PRATICAR:** faz os exercícios 21 a 24 do módulo 13 (Exercícios), que consolidam este módulo: um limitador de pedidos e um ranking com Redis, notificações com pub/sub e transações, um arquivo de encomendas no S3 com paginação e um relatório servido por URL pré-assinado guardado em cache.

## Fontes oficiais

- Redis no Bun: https://bun.sh/docs/runtime/redis
- S3 no Bun: https://bun.sh/docs/runtime/s3
- Comandos do Redis: https://redis.io/docs/latest/commands/
- O comando SET e as suas opções: https://redis.io/docs/latest/commands/set/
- Pub/sub no Redis: https://redis.io/docs/latest/develop/pubsub/
- Transações no Redis: https://redis.io/docs/latest/develop/using-commands/transactions/
- Imagem oficial do Redis: https://hub.docker.com/_/redis
- RustFS (repositório): https://github.com/rustfs/rustfs
- RustFS (imagem): https://hub.docker.com/r/rustfs/rustfs
- URLs pré-assinados na AWS: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
- Assinatura Signature V4 por query string: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
