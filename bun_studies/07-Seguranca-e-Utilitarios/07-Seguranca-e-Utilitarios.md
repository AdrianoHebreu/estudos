# 07 Segurança e utilitários

Este módulo percorre a «caixa de ferramentas» que o Bun traz no próprio executável: palavras-passe, hashes, criptografia da Web, identificadores, tokens CSRF, credenciais do sistema, comparação e formatação de dados, compressão, versões, YAML, TOML e Markdown. A pergunta é a de sempre: o que é que deixas de instalar do npm?

Todas as saídas foram obtidas com o Bun 1.4.0 (revisão 34cbb9a40) no Windows 11, em Git Bash. A documentação já descreve a 1.4.5; onde algo da documentação não existia ou se comportava de outra forma, digo-o. Cada API foi confirmada com typeof e executada. Os doze ficheiros de 07-Seguranca-e-Utilitarios/exemplos correm com bun run ficheiro.ts e não usam pacotes do npm nem portas de rede.

**NOTA:** o que sei da documentação (por exemplo, os valores por omissão de gzip e zstd) está indicado como tal; o que vem das minhas execuções diz-se «medi» ou «executei». Os tempos desta lição foram medidos numa máquina partilhada: variam muito de execução para execução (um mesmo teste deu o triplo do tempo noutra corrida). Retira ordens de grandeza, não números exatos.

## Bun.password: hash e verify

Bun.password guarda palavras-passe com algoritmos feitos para serem lentos de propósito. O algoritmo por omissão é o argon2id; o bcrypt também está disponível. O verify não precisa de saber qual foi usado, porque o próprio hash o diz (exemplo 01-password.ts).

    const h1 = await Bun.password.hash("Estudo_2026!");
    // $argon2id$v=19$m=65536,t=2,p=1$t4eGoLoNLmGl0usHpBZEMseYcUCXNBxk0ivUOcpiABY$6gvfsi5EGWUIili/CaFH3xrp59hVPCuK5pPqZPR2Ll8
    await Bun.password.verify("Estudo_2026!", h1);   // true
    await Bun.password.verify("estudo_2026!", h1);   // false

    const b = await Bun.password.hash("Estudo_2026!", { algorithm: "bcrypt", cost: 10 });
    // $2b$10$gXS.ewQYv0rkOE9znZn7tOMxoMN.EIkhtrT3CNwzk5Z4DGsPYju4K  (60 caracteres)

O formato do hash contém tudo o que o verify precisa: o argon2 usa o formato PHC (algoritmo, versão, memória em KiB, iterações, paralelismo, sal, hash), o bcrypt usa o formato MCF ($2b, custo, sal e hash juntos). O sal é gerado automaticamente: dois hashes da mesma palavra-passe saíram diferentes (executei).

| Parâmetro | Algoritmo | Significado | Limites (erros reais da 1.4.0) |
|---|---|---|---|
| algorithm | ambos | argon2id (omissão), argon2i, argon2d ou bcrypt | outro valor: erro |
| memoryCost | argon2 | memória em KiB (omissão 65536, ou seja 64 MiB) | menor que 8: Memory cost must be at least 8 |
| timeCost | argon2 | número de iterações (omissão 2) | zero: Time cost must be greater than 0 |
| cost | bcrypt | log2 das rondas (omissão 10) | fora de 4 a 31: Rounds must be an integer between 4 and 31 |

O OWASP recomenda no mínimo argon2id com 19 MiB, 2 iterações e paralelismo 1 (memoryCost 19456) e, para bcrypt, custo 10 ou mais. O argon2i e o argon2d também funcionam (executei), mas para palavras-passe usa o argon2id.

Tempos medidos (02-password-tempos.ts, melhor de 7 execuções, 8 núcleos, máquina ocupada):

| Configuração | hash | verify |
|---|---|---|
| argon2id m=19456 t=2 | 40 a 55 ms | 35 a 55 ms |
| argon2id m=65536 t=2 (omissão) | 160 a 220 ms | 160 a 490 ms |
| argon2id m=65536 t=4 | 300 a 1100 ms | 330 a 1100 ms |
| bcrypt custo 4 | 1 a 4 ms | 1 a 4 ms |
| bcrypt custo 10 (omissão) | 75 a 240 ms | 75 a 240 ms |
| bcrypt custo 12 | 285 a 625 ms | 285 a 900 ms |

O hash e o verify custam o mesmo (o atacante também paga isto por cada tentativa), e um custo mais alto escala quase como esperado: o bcrypt duplica o tempo por cada unidade de custo. Escolhe o custo pelo teu servidor: um login deve demorar centenas de milissegundos, não segundos.

**ATENÇÃO:** as versões assíncronas correm fora da thread principal: com um hash de um segundo, o temporizador de 5 ms disparou 68 a 205 vezes, ou seja, o event loop continuou livre. Com hashSync o temporizador disparou uma vez: o processo ficou bloqueado. Num servidor usa sempre hash e verify (assíncronos).

**NOTA:** o bcrypt trunca palavras-passe com mais de 72 bytes. A documentação diz que o Bun faz um SHA-512 prévio nessas palavras-passe para não truncar em silêncio, e confirmei-o: com 100 letras a, a palavra-passe com 101 foi recusada (false). Aceita também Uint8Array. Uma palavra-passe vazia dá erro (password must not be empty), e um hash que não é hash dá PASSWORD_UNSUPPORTED_ALGORITHM.

## Bun.CryptoHasher e Bun.hash

Bun.CryptoHasher faz hashes criptográficos e HMAC (03-hash.ts). A lista real de algoritmos da 1.4.0 está em Bun.CryptoHasher.algorithms: blake2b256, blake2b512, blake2s256, md4, md5, ripemd160, sha1, sha224, sha256, sha384, sha512, sha512-224, sha512-256, sha3-224, sha3-256, sha3-384, sha3-512, shake128 e shake256.

    new Bun.CryptoHasher("sha256").update("loja: encomenda 12").digest("hex");
    // 75dcfd7352e03c862b6e8bc93017541aaf45f2982fb1cba3d7bb1122af00397f   (igual ao do node:crypto)
    new Bun.CryptoHasher("sha256", "segredo-de-estudo").update("loja: encomenda 12").digest("hex");
    // 2437390c51fcbe9cf1ee4b8904bea75140397c371066bd017504cf77cf432683   (HMAC, igual ao node:crypto)

O segundo argumento do construtor é a chave HMAC. O digest aceita hex, base64 ou nenhum (devolve um Buffer). Há também Bun.CryptoHasher.hash("sha256", dados, "hex") e atalhos como Bun.SHA256.hash. O copy() duplica o estado a meio. Duas diferenças que executei e que a documentação confirma:

- no hasher normal, depois do digest o objeto volta ao início: um segundo digest do sha1 deu da39a3ee... (a entrada vazia);
- no hasher HMAC isso não acontece: reutilizá-lo dá o erro HMAC has been consumed and is no longer usable;
- o HMAC suporta menos algoritmos: shake128, shake256 e blake2s256 dão HMAC is not supported for this algorithm yet.

Bun.hash é outra família: hashes não criptográficos, muito rápidos, para chaves de cache, ETags, partição de dados e deteção de alterações. Nunca para palavras-passe, tokens nem integridade contra um atacante.

| Função | Tipo devolvido | Exemplo para o texto «loja: encomenda 12» |
|---|---|---|
| Bun.hash (wyhash) | bigint | 1341747343364646307n |
| Bun.hash.crc32 | number | 2815350957 |
| Bun.hash.adler32 | number | 1049232942 |
| Bun.hash.xxHash64 | bigint | 3586486779872479069n |
| Bun.hash.xxHash3 | bigint | 17153576423888100991n |
| Bun.hash.cityHash32 e cityHash64 | number e bigint | 1744186066 e 12688507584561855238n |
| Bun.hash.murmur32v3 | number | 226437467 |
| Bun.hash.rapidhash | bigint | 11280726888143951327n |

Existem também xxHash32, murmur32v2 e murmur64v2. Os de 32 bits devolvem number, os de 64 bits devolvem bigint, e o segundo argumento é uma semente. O crc32 é o que os formatos gzip e zip usam internamente.

## Web Crypto

O padrão Web também está completo, sem imports (04-webcrypto.ts): crypto.subtle, crypto.getRandomValues e crypto.randomUUID. Executei o digest SHA-256 (resultado igual ao CryptoHasher), HMAC com sign e verify, AES-GCM, ECDSA P-256, Ed25519 e PBKDF2.

    const aes = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));      // IV novo para cada cifra
    const cifrado = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, new TextEncoder().encode("NIF 123456789"));
    cifrado.byteLength;   // 29 = 13 de texto + 16 da etiqueta de autenticação

Um byte adulterado faz o decrypt falhar com OperationError, que é a garantia do AES-GCM. A assinatura ECDSA P-256 tem 64 bytes e o Ed25519 também (ambos verificaram true). O subtle da 1.4.0 expõe ainda deriveKey, deriveBits, wrapKey, getPublicKey e funções de encapsulamento de chaves; só executei o que está acima.

**ATENÇÃO:** o crypto.getRandomValues aceitou 70000 bytes de uma vez, quando a norma Web (nos browsers) limita a 65536 por chamada. Não dependas disso se o código também corre no browser.

Escolher entre os dois mundos: usa Bun.password para palavras-passe, crypto.subtle para tudo o que também corre no browser (assinaturas, cifra) e Bun.CryptoHasher quando queres um hash incremental simples e síncrono. O node:crypto também existe (usei timingSafeEqual).

## Identificadores: UUID v4, v7 e v5

O crypto.randomUUID() devolve um UUID v4 (aleatório). O Bun acrescenta o v7 e o v5 (05-ids-csrf-secrets.ts).

    Bun.randomUUIDv7();                       // 01a20442-526a-74d1-be10-155d2c6946d2
    Bun.randomUUIDv7("base64");               // AaIEQlJqdNODpiVioURnCg==
    Bun.randomUUIDv7("hex", 1700000000000);   // 018bcfe5-6800-726c-97ba-3f8c6b80387a  (timestamp fixo, em ms)
    Bun.randomUUIDv5("python.org", "dns");    // 886313e1-3b8a-5372-9b90-0c9aee199e5d

- O v7 começa com 48 bits de milissegundos, por isso os UUID gerados em sequência ordenam-se como texto (executei: b > a deu true). É a melhor escolha para chaves primárias de bases de dados, porque inserções ordenadas fragmentam menos os índices.
- O v5 é determinístico: o mesmo nome e namespace dão sempre o mesmo UUID. O valor para python.org coincide com o do exemplo da norma. Os namespaces aceites são dns, url, oid e x500, ou um UUID; outro texto dá Invalid UUID format for namespace. Serve para ids estáveis derivados de dados (por exemplo, um id por email).
- O v4 do crypto.randomUUID serve quando a ordem não interessa.

**NOTA:** o randomUUIDv5 não aparece nas páginas da documentação que li (só na lista de funções do Bun); o comportamento descrito vem das minhas execuções.

## Bun.CSRF

Bun.CSRF.generate cria um token assinado com um segredo e uma validade; Bun.CSRF.verify confirma-o. Executei: um token tem 86 caracteres em base64url, expira (por omissão ao fim de 24 horas, segundo a documentação) e falha se o segredo, a assinatura ou o tempo não baterem.

    const token = Bun.CSRF.generate(segredo, { expiresIn: 60_000, sessionId: "cliente-1" });
    Bun.CSRF.verify(token, { secret: segredo, sessionId: "cliente-1" });   // true
    Bun.CSRF.verify(token, { secret: segredo, sessionId: "cliente-2" });   // false
    Bun.CSRF.verify(token, { secret: segredo });                           // false

**ATENÇÃO:** passa sempre o sessionId (a sessão ou o utilizador). A documentação avisa que, sem ele, um token emitido a qualquer visitante valida para todos, e um atacante pode obter um token na sua sessão e reutilizá-lo contra a vítima. Na 1.4.0 o sessionId já existe e funciona (executei os três casos acima). Sem segredo, o generate usa um segredo em memória gerado pelo Bun (diz a documentação), que desaparece quando o processo termina e não é partilhado entre processos: num servidor com várias instâncias passa um segredo teu, vindo de uma variável de ambiente. O token é só uma peça: precisas de o pôr num campo do formulário ou num cabeçalho e de o verificar nos pedidos que alteram dados (isso é do módulo 03).

## Bun.secrets

Bun.secrets guarda credenciais no cofre do sistema: Credential Manager no Windows, Keychain no macOS, libsecret no Linux. É para ferramentas de linha de comandos e desenvolvimento local (a documentação não a recomenda para segredos de produção, onde usas variáveis de ambiente).

    const c = { service: "est-bn07-estudo", name: "palavra-passe-ficticia" };
    await Bun.secrets.get(c);                                              // null
    await Bun.secrets.set({ ...c, value: "Estudo_2026!", persist: "local" });
    await Bun.secrets.get(c);                                              // Estudo_2026!
    await Bun.secrets.delete(c);                                           // true (false se já não existia)

No exemplo guardei um valor fictício e apaguei-o logo a seguir; confirmei com cmdkey /list que não ficou nada. Detalhe do Windows: por omissão a credencial é gravada com persistência enterprise, e com um perfil móvel de domínio pode aparecer noutros computadores. O parâmetro persist: "local" (só Windows, ignorado no macOS e Linux) limita-a a esta máquina. Executei persist: "local" na 1.4.0 e foi aceite.

## Texto, comparação e formatação

Tudo em 06-utilitarios.ts.

- escapeHTML troca aspas, o e comercial, a plica e os sinais de menor e maior por entidades. O resultado de Bun.escapeHTML('<b onclick="x()">Tom & "Jerry"</b>') começa por &lt;b onclick=&quot;x()&quot;&gt;. Converte números para texto (42 dá 42). Escapa o conteúdo, não o sanitiza: serve para pôr texto de utilizador num HTML, não para filtrar HTML.
- deepEquals compara em profundidade (p1 === p2 dá false, deepEquals dá true). Sem o terceiro argumento, undefined e campo ausente são iguais; com true (modo estrito) são diferentes. NaN é igual a NaN.
- deepMatch(subconjunto, objeto) verifica se o primeiro é um subconjunto do segundo: deepMatch({id: 4}, produto) deu true e a troca dos argumentos deu false. Não está explicado nas páginas que li; a ordem vem das minhas execuções.
- Bun.inspect devolve o texto que o console.log mostraria (com colors: true inclui códigos ANSI). A propriedade Bun.inspect.custom define como o teu objeto se mostra: um Cliente passou a aparecer como Cliente<Ana Ribeiro>, sem expor o NIF.
- Bun.inspect.table devolve uma tabela como o console.table, mas como texto (o segundo argumento escolhe as colunas, e o resultado está no bloco depois desta lista).
- stringWidth mede colunas de terminal: «Erro» a vermelho tem length 13 mas largura 4 (11 com countAnsiEscapeCodes); «你好» tem length 2 e largura 4; um emoji tem largura 2. stripANSI remove os códigos de cor.
- Bun.color converte cores: Bun.color("red", "hex") dá #ff0000, Bun.color("hsl(210, 50%, 40%)", "hex") dá #336699, "number" dá 16711680, "{rgb}" dá {r, g, b} e uma cor inválida dá null. Os formatos "ansi-16m", "ansi-256" e "ansi-16" dão os códigos de terminal (para coral: 38;2;255;127;80, 38;5;209 e 91). É só cor: não faz negrito nem sublinhado, por isso não substitui o chalk por inteiro.
- Bun.semver tem apenas duas funções, satisfies e order. satisfies("1.4.0", "^1.2.0") dá true e "^1.2.0" rejeita 2.0.0; um pré-lançamento como 1.3.0-beta.1 não satisfaz ^1.2.0 (executei); uma versão inválida dá false. order devolve -1, 0 ou 1, por isso serve em sort: ["1.10.0","1.2.0","1.9.1","1.2.0-beta.1"].sort(Bun.semver.order) deu 1.2.0-beta.1, 1.2.0, 1.9.1, 1.10.0. Não há parse, inc nem coerce.

    ┌───┬────┬────────────────────┬───────┬───────┐
    │   │ id │ nome               │ preco │ stock │
    ├───┼────┼────────────────────┼───────┼───────┤
    │ 0 │ 1  │ Romance Policial   │ 12.9  │ 40    │
    │ 1 │ 6  │ Teclado Mecânico   │ 79    │ 0     │
    │ 2 │ 10 │ Caneca de Cerâmica │ 6.5   │ 200   │
    └───┴────┴────────────────────┴───────┴───────┘

## Compressão

Compressão síncrona e assíncrona sem bibliotecas (07-compressao.ts), sobre 116107 bytes de linhas JSON:

| Função | Tamanho | Notas |
|---|---|---|
| Bun.gzipSync (omissão) | 9384 bytes | cabeçalho 1f 8b; nível 1: 21494, nível 9: 8915 |
| Bun.deflateSync | 9366 bytes | sem cabeçalho gzip; inflateSync inverte |
| Bun.zstdCompressSync (omissão) | 13751 bytes | nível 1: 10092 e nível 19: 5331 |
| Bun.zstdCompress | 13751 bytes | versão assíncrona, devolve uma Promise |

Os níveis por omissão confirmados executando: gzip 6 e zstd 3 (a documentação indica 1 a 22 para o zstd; nível 30 deu Compression level must be between 1 and 22 e o gzip rejeitou o nível 10 com Zlib error). Os resultados são Uint8Array, e dados que não são gzip dão Error: incorrect header check. Os tamanhos não dizem tudo: no ficheiro de 2,4 MB do exemplo 12 o zstd por omissão demorou cerca de 2 ms e o gzip cerca de 5 a 10 ms; o gzip nível 9 e o zstd nível 10 demoraram 20 a 30 ms. O zstd no nível 19 demorou 6,7 segundos nesse mesmo ficheiro (medi uma vez): só vale a pena para dados que se comprimem uma vez e se leem muitas.

Em streaming há CompressionStream e DecompressionStream do padrão Web. Aceitaram gzip, deflate, deflate-raw, zstd e brotli (executei new CompressionStream com cada um; o zstd e o brotli não os usei em dados). O resultado de um CompressionStream gzip teve o mesmo tamanho que o de Bun.gzipSync (9384 bytes) e Bun.gunzipSync leu-o. O brotli não tem função no objeto Bun (brotliCompressSync é undefined), mas o node:zlib tem brotliCompressSync e brotliDecompressSync (executei: 400 bytes de texto repetido deram 20 e voltaram iguais).

## Tempo, processo e caminhos

Tudo em 08-tempo-e-streams.ts.

- Bun.nanoseconds() devolve nanosegundos desde o arranque do processo, como number. Um sleep de 50 ms mediu 51,4 ms com Bun.nanoseconds e 51,5 ms com performance.now(): para medir intervalos servem os dois.
- Bun.sleep(ms) é assíncrono (aceita também uma Date) e Bun.sleepSync(ms) bloqueia o processo (mediu 20,4 ms para 20).
- Bun.peek(promessa) lê o resultado sem await, se a promessa já estiver resolvida (42); numa promessa pendente devolve a própria promessa; Bun.peek.status dá pending, fulfilled ou rejected. É uma API avançada, para evitar micro-ticks em código crítico.
- Bun.version dá 1.4.0 e Bun.revision o commit (34cbb9a40...).
- Bun.which("bun") devolveu no Windows um caminho com barras invertidas e terminado em .exe (a pasta .bun/bin da tua conta) e null para um programa inexistente; aceita { PATH } para procurar noutro sítio.
- Bun.pathToFileURL converte C:/loja/ficheiro com espaços.txt em file:///C:/loja/ficheiro%20com%20espa%C3%A7os.txt, e Bun.fileURLToPath faz o inverso (no Windows devolve barras invertidas).
- Bun.openInEditor(caminho) abre o ficheiro no editor do utilizador (variáveis VISUAL ou EDITOR, ou a opção editor, com linha e coluna). Só o descrevo: não o executei, porque abriria uma janela no teu computador.

## Streams e buffers

- Bun.readableStreamToText, ToJSON, ToArray, ToBytes, ToArrayBuffer e ToBlob consomem um ReadableStream inteiro. Executei todos com streams de pedaços e, por exemplo, ToJSON juntou os pedaços {"id": e 4} no objeto {id: 4}; ToArray devolveu os objetos de um stream de objetos. O readableStreamToFormData também existe (typeof), mas não o usei.
- Bun.concatArrayBuffers([a, b]) junta buffers num só ArrayBuffer. A assinatura da 1.4.0 que confirmei é (lista, tamanhoMáximo?, comoUint8Array?): com Infinity e true devolve um Uint8Array.
- Bun.ArrayBufferSink é um escritor incremental para construir bytes de tamanho desconhecido: com start({ asUint8Array: true }), write de texto e de bytes, e end() devolveu «olá loja».
- Bun.indexOfLine(bytes, desde) devolve a posição do próximo fim de linha (-1 se não houver): em «linha 1», «linha 2» e «linha 3» deu 7, depois 16 (o carriage return fica antes) e -1.

## YAML, TOML e Markdown

Tudo em 09-formatos.ts. Bun.YAML e Bun.TOML têm parse e stringify na 1.4.0 (os dois existem, confirmei os nomes e executei); há também Bun.JSON5, Bun.JSONL e Bun.JSONC.

    const cfg = Bun.YAML.parse(textoYaml);   // textoYaml: as chaves loja, nome, iva e fecho (com ~) em várias linhas
    // {"loja":{"nome":"Loja do Estudo","iva":0.23,"fecho":null}}
    Bun.YAML.stringify(cfg, null, 2);     // texto YAML com indentação de 2
    Bun.TOML.parse(textoToml);   // textoToml: nome = "Loja" e uma secção [servidor] com porta = 35070
    Bun.TOML.stringify({ nome: "Loja", servidor: { porta: 35070 } });   // 'nome = "Loja"' e a secção [servidor]

Sem o terceiro argumento, o YAML.stringify devolve uma só linha em estilo de fluxo, como [{id: 1,nome: Ana}]. Com indentação, deixou um espaço no fim de linhas como loja:. Erros de sintaxe dão SyntaxError (YAML Parse error: Unexpected token e TOML Parse error: Missing value after '=').

Bun.markdown tem html (texto), ansi (para terminal), render (com callbacks) e react (elementos JSX).

    Bun.markdown.html(textoMarkdown);   // um título «Aviso» e um parágrafo com A Loja a negrito
    // <h1>Aviso</h1> <p>A <strong>Loja</strong> fecha às 18h.</p>

**ATENÇÃO:** o Bun.markdown.html não sanitiza. Com o texto «script, imagem com onerror e ligação javascript:» devolveu tudo tal e qual. A opção tagFilter: true neutralizou a etiqueta script (&lt;script>) mas deixou o img com onerror e a ligação javascript:. Escapar primeiro com Bun.escapeHTML neutralizou as etiquetas, mas a ligação javascript: continuou ativa. Nunca ponhas o resultado, com texto de utilizadores, numa página sem um sanitizador a sério.

## Exemplos na loja

Palavras-passe dos clientes (10-loja-passwords.ts). Guarda-se só o hash; no login faz-se sempre um verify, mesmo quando o email não existe (contra um hash falso), para não revelar que emails estão registados. Medi 39 ms com email existente e 37 ms com email inexistente. Um hash antigo em bcrypt é migrado para argon2id no primeiro login bem-sucedido, reconhecendo-o pelo prefixo do hash. Uma palavra-passe curta é recusada antes do hash.

    registo recusado: palavra-passe demasiado curta (mínimo 10 caracteres)
    o que fica guardado: $argon2id$v=19$m=19456,t=2,p=1$kGWcnMaoy...
    ana, certa: Ana Ribeiro | errada: null | email inexistente: null
    hugo migrado para: argon2id

Token simples com HMAC (11-token-hmac.ts): o token é o payload em base64url, um ponto e a assinatura HMAC-SHA256 desse payload. Usei crypto.subtle.sign e crypto.subtle.verify (a verificação é em tempo constante) e Uint8Array.toBase64 e fromBase64 com alphabet base64url (nativos na 1.4.0: executei).

    token: eyJzdWIiOjEsImV4cCI6MTc5NTM2ODU4NzUyNn0.zSoTsLA3fr-ETUEDTdUSmta2asVuRv0mNRI4z6WK2B8
    verificar: {"sub":1}
    payload trocado: assinatura inválida | truncado: assinatura inválida | lixo: formato inválido | expirado: expirado

**ATENÇÃO:** isto não é um JWT. O Bun não traz JWT (não há nenhuma função jwt no objeto Bun). Para além do que o exemplo faz, um JWT a sério tem cabeçalho com o algoritmo (e a defesa contra o ataque que troca o algoritmo), as claims normalizadas (iss, aud, nbf, iat, jti), identificador de chave (kid) e rotação de chaves, chaves assimétricas para quem só verifica, revogação, refresh tokens e uma biblioteca testada pela comunidade. O payload do token não está cifrado: qualquer pessoa o lê (o exemplo mostra-o). Para sessões simples, um cookie com um identificador aleatório guardado no servidor é mais fácil de revogar.

Comprimir um export (12-export-comprimido.ts): 24000 linhas NDJSON de linhas de encomenda (2435694 bytes). Escrevi com Bun.write o original, o gzip e o zstd, e mostrei uma versão em streaming.

    export.ndjson             2435694 bytes 100.0%
    export.ndjson.gz            76311 bytes   3.1%
    export.ndjson.zst           36282 bytes   1.5%
    export-stream.ndjson.gz     76311 bytes   3.1%

Os dados gerados repetem-se, por isso as taxas são otimistas: com dados reais espera menos. Li os ficheiros de volta e o conteúdo era igual ao original. A pasta temporária (est-bn07-...) é apagada no fim.

**ATENÇÃO (Windows, Bun 1.4.0):** Bun.write(destino, new Response(stream)) ficou pendurado nos meus testes com um ReadableStream próprio, com o file.stream() e com um pipeThrough, e o processo não terminava (usei timeout para o interromper); só funcionou com new Response(new Blob([...]).stream()) e com texto. Passar o stream diretamente a Bun.write não deu erro, mas escreveu só 23 bytes («[object ReadableStream]»). Funcionou: ler o stream e escrever com Bun.file(destino).writer() (write e end), como no exemplo, ou juntar com arrayBuffer() e escrever o resultado. Não sei se acontece noutros sistemas.

## O que substitui

| Pacote npm habitual | O que o Bun já traz | Diferença |
|---|---|---|
| bcrypt, bcryptjs, argon2 | Bun.password | só hash e verify; argon2id por omissão e bcrypt |
| uuid | crypto.randomUUID, Bun.randomUUIDv7, Bun.randomUUIDv5 | sem v1, v3, v6 nem validação |
| nanoid | crypto.getRandomValues e toBase64 (base64url) | 12 bytes dão 16 caracteres; sem alfabeto à medida |
| semver | Bun.semver | só satisfies e order (sem parse, inc nem coerce) |
| escape-html | Bun.escapeHTML | equivalente para este uso |
| deep-equal, fast-deep-equal | Bun.deepEquals e Bun.deepMatch | |
| pako, fflate | Bun.gzipSync, deflateSync, zstd e CompressionStream | |
| chalk | Bun.color com saída ansi | só cores, sem negrito |
| strip-ansi, string-width | Bun.stripANSI e Bun.stringWidth | |
| which | Bun.which | |
| js-yaml, yaml, smol-toml | Bun.YAML e Bun.TOML | |
| marked | Bun.markdown | não sanitiza |
| csurf e similares | Bun.CSRF | usa sempre o sessionId |
| keytar | Bun.secrets | |
| crypto-js, xxhash, crc-32 | Bun.CryptoHasher, crypto.subtle e Bun.hash | |
| sleep, delay | Bun.sleep | |
| jsonwebtoken, jose | nada | continua a ser uma biblioteca (ou o token simples acima, com limites) |

## Peculiaridades da 1.4.0 e do Windows

- Bun.write com Response de um stream de JavaScript fica pendurado (acima). Evita-o na 1.4.0.
- Bun.which e Bun.fileURLToPath devolvem caminhos com barras invertidas e Bun.which acrescenta o .exe.
- Bun.secrets usa o Credential Manager; o persist: "local" evita a replicação por perfis móveis.
- O hasher HMAC deixa de servir depois do digest; o normal reinicia-se.
- A documentação é da 1.4.5, mas tudo o que aqui está existia e funcionou na 1.4.0, incluindo sessionId no CSRF e TOML.stringify. Não executei Bun.sliceAnsi nem Bun.wrapAnsi além de um teste rápido (existem na 1.4.0); ficam para quem quiser explorar.

## Exercícios

**PRATICAR:** faz os exercícios 25 a 28 do módulo 13: cronometrar e migrar palavras-passe (25), calcular o mesmo hash por quatro vias e detetar alterações (26), um token com rotação de chaves, revogação e CSRF com sessão (27) e exportar a loja em YAML, TOML e JSON comprimidos (28).

## Fontes oficiais

- Hashing (Bun.password, Bun.hash, CryptoHasher): https://bun.com/docs/runtime/hashing
- Utilitários (UUID, escapeHTML, deepEquals, inspect, stringWidth, gzip, zstd, peek, sleep, which): https://bun.com/docs/runtime/utils
- Proteção CSRF: https://bun.com/docs/runtime/csrf
- Secrets: https://bun.com/docs/runtime/secrets
- Semver: https://bun.com/docs/runtime/semver
- Color: https://bun.com/docs/runtime/color
- YAML: https://bun.com/docs/runtime/yaml
- TOML: https://bun.com/docs/runtime/toml
- Markdown: https://bun.com/docs/runtime/markdown
- Streams e ArrayBufferSink: https://bun.com/docs/runtime/streams
- OWASP, armazenamento de palavras-passe: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- MDN, SubtleCrypto: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
- RFC 9562, UUID: https://www.rfc-editor.org/rfc/rfc9562
