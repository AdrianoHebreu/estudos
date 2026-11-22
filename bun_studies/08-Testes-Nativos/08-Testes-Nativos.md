# 08 Testes nativos

Neste módulo testas a loja só com o que o Bun traz: o comando bun test e o módulo bun:test, com matchers, mocks, tempo simulado, snapshots, cobertura, relatórios para CI e testes de integração. Não instalas jest nem vitest.

Tudo foi executado com o Bun 1.4.0 no Windows 11 (Git Bash), na porta 35081 de 127.0.0.1. A documentação oficial já descreve a 1.4.5: onde ela diz algo que a 1.4.0 não faz, assinalo-o. Os exemplos estão em exemplos/ (ficheiros 01 a 09, a pasta src com o código testado, bug-real, cfg-cobertura e cfg-preload). A API completa da loja, com os 21 testes da documentação OpenAPI, já foi feita no módulo 03: lê o loja.test.ts em 03-Servidor-HTTP/exemplos/loja-api/ e não o repito aqui.

## O que substitui

| Biblioteca npm habitual | O que o Bun já traz |
|---|---|
| jest, vitest (executor de testes) | bun test, com test, describe, it, expect e hooks no módulo bun:test |
| jest.fn, vi.fn, sinon | mock(), jest.fn() e vi.fn() (existem em bun:test) |
| jest.spyOn, vi.spyOn | spyOn de bun:test |
| jest.mock, vi.mock | mock.module (jest.mock não está definido na 1.4.0) |
| jest fake timers, sinon fake-timers | jest.useFakeTimers e setSystemTime |
| jest --coverage, nyc, c8, istanbul | bun test --coverage, com reportes text e lcov |
| jest-junit | --reporter=junit com --reporter-outfile |
| jest --watch, nodemon | bun test --watch |
| ts-jest, babel-jest | nada: o Bun executa TypeScript sem passo de compilação |
| supertest | fetch contra um Bun.serve numa porta tua |

## Descoberta e execução

Sem argumentos, o bun test percorre a pasta atual e corre os ficheiros cujo nome contém .test, _test, .spec ou _spec antes da extensão. Criei ficheiros de teste de propósito: a.test.ts, b.spec.ts, c_test.ts, d_spec.ts, e.test.js, f.test.tsx, g.test.mjs e sub/z.test.ts foram todos corridos; test.ts, i-test.ts e h.tests.ts foram ignorados.

    bun test                       # todos os ficheiros que correspondem
    bun test 01-calculo            # filtro: qualquer ficheiro cujo caminho contenha o texto
    bun test ./bug-real/bug.ts     # caminho exato (com ./ ou /): corre mesmo sem .test no nome

**ATENÇÃO:** um nome sem ./ é um filtro, não um caminho. Com bun test uso.ts o Bun respondeu que nenhum ficheiro correspondia e explicou que os testes precisam de .test ou .spec no nome; com bun test ./uso.ts correu. Os filtros não são globs.

    bun test v1.4.0 (34cbb9a40)

     60 pass
     1 skip
     1 todo
     0 fail
    snapshots: 1 passed, 2 added
     106 expect() calls
    Ran 62 tests across 9 files. [65.00ms]

Esta é a execução completa de exemplos/ (62 testes em 9 ficheiros, 65 ms). Os pass não aparecem um a um: com a saída redirecionada para um ficheiro ou um pipe, a 1.4.0 só listou as falhas e o resumo. Para ver os nomes de todos os testes usa o relatório JUnit (mais abaixo).

## test, describe, it, expect

O módulo bun:test exporta test, it, describe, expect, os hooks (beforeAll, afterAll, beforeEach, afterEach), mock, spyOn, jest, vi, setSystemTime, onTestFinished, setDefaultTimeout, expectTypeOf e os aliases xtest, xit e xdescribe. Na 1.4.0 test, expect, jest e vi também existem como globais sem import: confirmei com um teste sem import. Importa sempre, que os tipos o agradecem.

    expect(totalSemIva(encomenda8)).toBe(99.8);
    expect(totalComIva(encomenda8)).toBe(122.75);   // 99.80 * 1.23 = 122.754

Exemplo 01, com as linhas da encomenda 8 do loja.sql (12.90, 2 x 18.50 e 49.90). Os estados especiais aparecem no resumo sem falhar a execução: test.skip salta o teste, test.todo só regista a intenção (com a opção --todo o Bun inclui-os na execução), test.failing espera que o teste falhe e falha se ele passar.

    test.skip("ainda por decidir: IVA reduzido por categoria", () => {});
    test.todo("arredondar para o cêntimo em cada linha e não só no total");
    test.failing("bug conhecido: desconto por quantidade", () => {
      expect(totalSemIva([{ quantidade: 10, preco_unitario: 10 }])).toBe(90);
    });

Quando um test.failing passa por engano, a mensagem é: this test is marked as failing but it passed. Remove .failing if tested behavior now works. Também existem test.if, test.skipIf, test.todoIf, test.failingIf, test.concurrent e test.serial (confirmei que são funções; os que não uso nos exemplos não os testei).

**DICA:** o dinheiro em vírgula flutuante é um alvo clássico. O exemplo 01 mostra que 0.1 + 0.2 não é 0.3 (toBeCloseTo resolve) e que Math.round(1.005 vezes 100) a dividir por 100 dá 1, enquanto o arredondar da loja, com Number.EPSILON, dá 1.01.

## Matchers

O exemplo 02 (12 testes) usa os matchers do dia a dia. Os mais úteis, todos executados:

| Matcher | Para que serve |
|---|---|
| toBe | igualdade estrita (Object.is): números, textos, referências |
| toEqual | estrutura igual; ignora propriedades undefined |
| toStrictEqual | estrutura e classe iguais; distingue undefined e instâncias de classes |
| toContain, toHaveLength, toMatch | elemento num array ou texto, tamanho, expressão regular |
| toMatchObject | o objeto contém pelo menos estas propriedades |
| toHaveProperty | propriedade por caminho, como encomenda.linhas[0].produto_id |
| toBeCloseTo | números decimais com tolerância |
| toThrow | função que lança; aceita classe, texto ou regex |
| resolves, rejects | promessas: await expect(p).resolves.toMatchObject(...) |
| toStartWith | texto começa por (extensão do Bun, usada no módulo 03) |

    expect(resposta).toEqual({
      id: expect.any(Number),
      criada_em: expect.any(Date),
      estado: expect.stringMatching(/^pend/),
      extra: expect.anything(),
    });
    expect(categorias).toEqual(expect.arrayContaining(["Casa", "Livros"]));

Os asymmetric matchers (expect.any, expect.anything, expect.objectContaining, expect.arrayContaining, expect.stringMatching) servem para os campos que mudam de execução para execução, como ids e datas. O expect.assertions(1) garante que o catch de um teste assíncrono chegou a correr. E o expect.extend regista matchers teus:

    expect.extend({
      toSerPrecoValido(recebido: unknown) {
        const ok = typeof recebido === "number" && recebido > 0 && Math.round(recebido * 100) === recebido * 100;
        return { pass: ok, message: () => "esperava um preço positivo com no máximo 2 casas, recebi " + String(recebido) };
      },
    });

**NOTA:** em TypeScript o matcher novo precisa de uma declaração de tipos para o editor o aceitar. Nos exemplos usei // @ts-expect-error, porque o Bun executa sem verificar tipos. A forma certa de declarar (interface Matchers do bun:test) não a executei: confirma na documentação.

## test.each, describe.each e hooks

O exemplo 03 valida encomendas com uma tabela de casos. Cada linha da tabela é um teste; no JUnit os nomes ficaram exatamente os da primeira coluna.

    const casos: [string, unknown, string[]][] = [
      ["encomenda válida", { cliente_id: 1, linhas: [{ produto_id: 4, quantidade: 2 }] }, []],
      ["sem linhas", { cliente_id: 1, linhas: [] }, ["linhas: pelo menos 1 linha"]],
      ["cliente 0", { cliente_id: 0, linhas: [{ produto_id: 1, quantidade: 1 }] }, ["cliente_id: inteiro maior ou igual a 1"]],
    ];
    test.each(casos)("%s", (_descricao, entrada, erros) => {
      const r = validarEncomenda(entrada);
      expect(r.ok ? [] : r.erros).toEqual(erros);
    });

O describe.each repete um grupo inteiro para cada objeto (o título aceita $estado) e o junit mostrou os grupos encomenda pendente, encomenda enviada e encomenda entregue.

A ordem dos hooks, registada no próprio teste (beforeAll e afterAll correm uma vez por describe, beforeEach e afterEach à volta de cada teste):

    beforeAll > beforeEach > teste 1 > afterEach > beforeEach > teste 2 > afterEach > afterAll

## Mocks e spies

O mock() cria uma função que regista as chamadas. O jest.fn() e o vi.fn() existem e fazem o mesmo. O spyOn observa um método que já existe e permite substituí-lo; o jest.restoreAllMocks() (ou o mockRestore de cada espião) repõe o original.

    const f = mock((a: number, b: number) => a + b);
    f(1, 2); f(3, 4);
    expect(f).toHaveBeenCalledTimes(2);
    expect(f).toHaveBeenCalledWith(3, 4);

    afterEach(() => jest.restoreAllMocks());
    spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: "aviso-1" }));

No exemplo 04 o spyOn sobre o fetch global testa o src/notificacoes.ts sem rede (o domínio do serviço é .invalid, que nunca resolve). Sem o afterEach, o espião ficava activo nos testes seguintes: na 1.4.0 a opção restoreMocks do bunfig não teve efeito nos meus testes (dois testes seguidos continuaram a ver o spyOn do anterior), por isso usa o hook.

### mock.module: substituir um módulo

O mock.module substitui um módulo inteiro para quem o importa a seguir. É o equivalente do jest.mock e do vi.mock, mas sem hoisting: regista-o antes de importar o código que o usa, ou importa esse código dinamicamente.

    const enviarAviso = mock(async (_email: string, _texto: string) => ({ id: "falso-1" }));
    mock.module("./src/notificacoes.ts", () => ({ enviarAviso }));

    const r = await confirmarEncomenda(repo, 8, "ana.ribeiro@exemplo.pt");
    expect(enviarAviso).toHaveBeenCalledWith("ana.ribeiro@exemplo.pt", "A tua encomenda 8 custa 45.51 euros com IVA.");

**ATENÇÃO:** na primeira versão pus o mock.module dentro de um describe, no mesmo ficheiro do spyOn ao fetch. Resultado real: o teste do spyOn passou a receber o aviso falso (Expected id aviso-1, Received id falso-1), porque o mock.module vale para o ficheiro inteiro desde que é registado. Por isso o exemplo 05 vive num ficheiro só para ele. Pior: o mock escapa para os ficheiros seguintes. Com dois ficheiros, o segundo viu o módulo falso (enviarAviso é um mock? true); com --isolate viu o real (false). E mock.restore() não desfaz o mock.module (a documentação diz o mesmo): para voltar atrás, volta a chamar mock.module com o módulo original.

## Tempo simulado

O setSystemTime muda Date e Date.now(), e sem argumentos volta à hora real. O jest.useFakeTimers controla setTimeout e companhia. O exemplo 06 usa o src/prazos.ts: uma encomenda pendente há mais de 7 dias está atrasada, e um agrupar que só chama a função depois de uma espera.

    setSystemTime(new Date("2025-04-20T12:00:00Z"));
    expect(estaAtrasada("2025-04-15", "pendente")).toBe(false);
    setSystemTime(new Date("2025-05-01T12:00:00Z"));
    expect(estaAtrasada("2025-04-15", "pendente")).toBe(true);

    jest.useFakeTimers();
    const a = agrupar(f, 500);
    a(1); a(2); a(3);
    jest.advanceTimersByTime(499);   // f ainda não foi chamada
    jest.advanceTimersByTime(1);     // agora sim, uma vez, com 3

Medi ainda: com timers falsos o Date.now() avança com o jest.advanceTimersByTime (60000 ms simulados deram 60000), o jest.setSystemTime também existe, e um Bun.sleep(1000) pendente acordou ao avançar 1000 ms. Existem também runAllTimers, runOnlyPendingTimers, getTimerCount, isFakeTimers e useRealTimers. Chama sempre o useRealTimers (e o setSystemTime sem argumentos) num afterEach.

## Snapshots

O toMatchSnapshot guarda o valor num ficheiro __snapshots__/NOME.test.ts.snap, criado na primeira execução. O toMatchInlineSnapshot escreve o valor no próprio ficheiro de teste (o do exemplo 07 já vem preenchido). A atualização é com bun test -u (ou --update-snapshots).

    expect(repo.produtos(2)).toMatchSnapshot();
    expect(resposta).toMatchSnapshot({ criada_em: expect.any(String) });   // campos variáveis

Alterei o ficheiro .snap à mão (preço 59.9 em vez de 49.9) para ver a falha, e depois corri com -u:

    error: expect(received).toMatchSnapshot(expected)

    @@ -6,3 +6,3 @@
          "nome": "Auscultadores Bluetooth",
    -     "preco": 59.9,
    +     "preco": 49.9,
          "stock": 30,

    (fail) snapshots > a lista de produtos da categoria 2 (ficheiro .snap) [3.46ms]
    snapshots: 2 passed, 1 failed

**NOTA:** o exemplo 07 cria a pasta __snapshots__ na primeira execução; não a incluí no curso porque é um ficheiro gerado. Apaga-a quando quiseres repetir a primeira execução. Um snapshot guarda o que é, não o que devia ser: revê sempre o diff antes de usar -u.

## SQLite em memória e servidor de teste

O exemplo 08 testa um repositório sobre bun:sqlite com uma base nova em cada teste: o beforeEach abre :memory: com o loja.sql do módulo 00 e o afterEach fecha-a. Assim os testes não dependem uns dos outros nem de ficheiros no disco.

    beforeEach(async () => { db = await abrirLojaEmMemoria(); repo = new RepositorioLoja(db); });
    afterEach(() => db.close());

    test("sem stock lança StockInsuficiente e a transação desfaz tudo", () => {
      const pedido = { cliente_id: 1, linhas: [{ produto_id: 5, quantidade: 1 }, { produto_id: 6, quantidade: 1 }] };
      expect(() => repo.criarEncomenda(pedido, "2026-11-22")).toThrow(StockInsuficiente);
      expect(repo.produto(5)?.stock).toBe(100);   // o carregador voltou ao stock original
    });

O teclado (produto 6) tem stock 0, por isso a segunda linha falha e a transação desfaz a primeira. Outro teste confirma que a chave estrangeira recusa o cliente 99 (a mensagem contém FOREIGN KEY).

O exemplo 09 é um teste de integração: arranca o servidor numa porta tua em beforeAll, faz pedidos reais com fetch e pára-o em afterAll com stop(true).

    beforeAll(async () => { servidor = await iniciar(35081); base = servidor.url.origin; });
    afterAll(() => servidor.stop(true));

    const r = await post({ cliente_id: 2, linhas: [{ produto_id: 10, quantidade: 4 }] });   // 4 x 6.50
    expect(r.status).toBe(201);
    expect(await r.json()).toEqual({ id: expect.any(Number), total_com_iva: 31.98 });

Cobre 404, 422 (corpo inválido e JSON partido) e 409 (stock insuficiente). Cada ficheiro cria o seu servidor com a sua base em memória. Com port: 0 o sistema escolhe uma porta livre e evitas conflitos entre ficheiros; usei portas fixas só para o curso ser previsível.

## Opções do bun test

| Opção | O que faz (executado, salvo indicação) |
|---|---|
| -t ou --test-name-pattern | corre só os testes cujo nome corresponde à regex; os outros contam como filtered out |
| filtro de ficheiro | bun test 08-repo corre os ficheiros com esse texto no caminho |
| --bail ou --bail=2 | pára depois de 1 (ou N) falhas e escreve Bailed out after 1 failure |
| --timeout=100 | limite por teste em ms (omissão 5000); falha com this test timed out after 100ms |
| test(nome, fn, 50) | limite só para esse teste |
| --rerun-each=3 | repete cada ficheiro 3 vezes (18 testes em vez de 6) |
| --randomize e --seed=7 | ordem aleatória; imprime a semente, e a mesma semente repete a mesma ordem |
| --only e test.only | só os testes marcados; ver abaixo |
| --concurrent | três testes de 300 ms demoraram 317 ms em vez de 921 ms |
| --retry=N ou { retry: N } | repete os testes que falham (testei a opção por teste) |
| --watch | volta a correr quando um ficheiro importado muda |
| --todo, --only-failures, --dots | incluir os todo, esconder os que passam, saída compacta |
| --parallel, --shard=1/3 | ficheiros em vários processos, ou uma fatia do conjunto |
| --path-ignore-patterns | ignora caminhos por glob |
| --changed, --timings, --no-orphans | existem no help da 1.4.0; não os usei |

Alguns detalhes que me surpreenderam: o test.only já limitou a execução mesmo sem --only (2 testes de 6), mas com CI=true o Bun recusa-o com .only is disabled in CI environments to prevent accidentally skipping tests, para ninguém esquecer um .only no repositório. O --watch correu os testes duas vezes: ao arrancar e depois de eu alterar o calculo.ts importado pelo teste (passou a falhar com Expected 1.01, Received 1); parei-o com kill do PID. O --parallel=3 funcionou mas, com 9 ficheiros minúsculos, demorou 1,59 s contra 65 ms em série: só compensa em suites grandes. O --shard dividiu os 9 ficheiros em 3 fatias de 3.

**ATENÇÃO:** o --check, que a documentação da 1.4.5 apresenta para verificar tipos antes de correr, não faz nada na 1.4.0: com uma linha const n: number = "texto" o bun test --check correu e passou, e o comando bun check não existe ("Script not found"). Por omissão o Bun não verifica tipos nos testes; usa o teu editor ou o tsc.

## Cobertura nativa

Com --coverage o Bun imprime uma tabela de funções e linhas por ficheiro. Corri só o exemplo 09, para ver ficheiros parcialmente cobertos:

    bun test --coverage 09-servidor

    --------------------|---------|---------|-------------------
    File                | % Funcs | % Lines | Uncovered Line #s
    --------------------|---------|---------|-------------------
    All files           |   92.22 |   95.80 |
     src\calculo.ts     |   80.00 |   90.00 |
     src\encomenda.ts   |  100.00 |  100.00 |
     src\repositorio.ts |   88.89 |   93.18 | 30-32
     src\servidor.ts    |  100.00 |  100.00 |
    --------------------|---------|---------|-------------------

Só entram os ficheiros que o teste carregou. Com todos os 9 ficheiros a tabela deu 100 por cento em tudo. O --coverage-reporter aceita text e lcov (podes passar os dois) e o --coverage-dir muda a pasta (omissão coverage). O lcov.info tem, por ficheiro, registos SF (caminho), DA (linha e contagem), LF e LH (linhas totais e cobertas).

**NOTA:** no Windows os caminhos da tabela e do SF do lcov saem com barra invertida; ferramentas que leem o lcov podem esperar barras normais.

O limite mínimo vive no bunfig.toml, na secção [test] (ficheiro cfg-cobertura/bunfig.toml):

    [test]
    coverage = true
    coverageReporter = ["text", "lcov"]
    coverageDir = "saida"
    coverageSkipTestFiles = true
    coverageThreshold = { lines = 0.85, functions = 0.85 }

Com este limite o bun test terminou com código 1, sem escrever nenhuma mensagem. Duas coisas que só percebi experimentando e a documentação confirma: a chave que omites fica em 0.9, e o limite aplica-se a cada ficheiro (o calculo.ts tem 80 por cento de funções e fez falhar a execução, mesmo com 92,22 no total). Com lines 0.85 e functions 0.75 o código foi 0. A documentação avisa ainda que com apenas o reporter lcov o limite não é verificado.

## bunfig e preload de testes

O bunfig.toml lê-se a partir da pasta onde corres o comando, por isso as pastas cfg-cobertura e cfg-preload têm cada uma o seu. O preload corre uma vez antes de qualquer ficheiro: serve para registar matchers, variáveis de ambiente e hooks globais.

    # cfg-preload/bunfig.toml
    [test]
    preload = ["./preload.ts"]

    # cfg-preload/preload.ts
    process.env.LOJA_AMBIENTE = "teste";
    expect.extend({ toSerPreco(recebido) { /* ... */ } });
    beforeAll(() => console.log("[preload] antes de cada ficheiro"));

Com cd cfg-preload e bun test ./uso.ts, o teste que chama expect(14.9).toSerPreco() passou e o beforeAll do preload correu para esse ficheiro. Outras chaves de [test] que confirmei com um bunfig de teste: pathIgnorePatterns, randomize com seed, retry e [test.reporter] com junit = "caminho.xml" (o ficheiro foi escrito). O restoreMocks não teve efeito, como disse acima.

## Relatórios e códigos de saída para CI

Os reporters da 1.4.0 são dois: junit, que exige --reporter-outfile, e dots. Um reporter desconhecido dá unsupported reporter format 'foo'. Available options: 'junit' (for XML test results), 'dots'. O JUnit escreve uma árvore testsuite por ficheiro e por describe:

    bun test 01-calc 06-tempo --reporter=junit --reporter-outfile=junit.xml

    <testsuites name="bun test" tests="15" assertions="22" failures="0" skipped="2" ...>
      <testsuite name="01-calculo.test.ts" tests="11" ...>
        <testcase name="soma quantidade vezes preço" classname="totalSemIva" ... />

Numa falha o testcase leva um elemento failure com a mensagem do expect (type="AssertionError"). Notei que o atributo file usa barra invertida (o nome do ficheiro com barra invertida) e o texto da pilha barra normal: normaliza se o teu CI for sensível a isso. A documentação diz que no GitHub Actions o bun test emite anotações automaticamente; não o testei.

| Situação | Código de saída |
|---|---|
| todos passam (com skip e todo) | 0 |
| um teste falha | 1 |
| rejeição de promessa sem await dentro de um teste | 1 (aparece como fail desse teste) |
| import que não existe no ficheiro de teste | 1 (Cannot find module) |
| nenhum ficheiro encontrado | 1; com --pass-with-no-tests dá 0 |
| limite de cobertura por cumprir | 1, sem mensagem na 1.4.0 |

## Testes que apanham bugs reais

A primeira versão da validação da encomenda (bug-real/encomenda-v1.ts) só recusava quantidades menores que zero. O teste escreve-se a partir do que a loja precisa, não do código: 1.5 e 0 unidades têm de ser recusadas. Corre-se com bun test ./bug-real/bug.ts (o nome não leva .test, para o bun test normal o ignorar).

    11 | test("V1: quantidades inválidas têm de ser recusadas", () => {
    12 |   for (const e of entradas) expect(validarEncomendaV1(e)).toHaveLength(1);
                                                                 ^
    error: expect(received).toHaveLength(expected)

    Expected length: 1
    Received length: 0

    (fail) V1: quantidades inválidas têm de ser recusadas [2.23ms]
    (fail) V1: o resultado completo [0.46ms]

     1 pass
     2 fail

A mensagem diz logo qual é a linha, o que se esperava e o que veio: aceitou 1.5 unidades e devolveu uma lista de erros vazia (no segundo teste o toEqual mostrou o diff: o array esperado de um erro contra um array vazio). O terceiro teste do ficheiro usa a versão corrigida (src/encomenda.ts, com Number.isInteger) e passa. Mensagens de outros matchers que vi: toBe com Expected 0.3, Received 0.30000000000000004; toThrow com Received function did not throw; toContain com Expected to contain: "Eletrónica", Received: [ "Livros", "Casa" ].

## Exercícios

**PRATICAR:** faz os exercícios 29 a 32 do módulo 13 (testes com test.each para uma função de desconto, tempo simulado e mocks, repositório SQLite em memória com transações e um pequeno script de CI com JUnit e códigos de saída). As soluções estão no módulo 15.

## Fontes oficiais

- [Bun: o executor de testes](https://bun.sh/docs/test)
- [Bun: escrever testes](https://bun.sh/docs/test/writing-tests)
- [Bun: descoberta de testes](https://bun.sh/docs/test/discovery)
- [Bun: configuração dos testes](https://bun.sh/docs/test/configuration)
- [Bun: hooks do ciclo de vida](https://bun.sh/docs/test/lifecycle)
- [Bun: mocks](https://bun.sh/docs/test/mocks)
- [Bun: snapshots](https://bun.sh/docs/test/snapshots)
- [Bun: datas e tempo](https://bun.sh/docs/test/dates-times)
- [Bun: cobertura de código](https://bun.sh/docs/test/code-coverage)
- [Bun: reporters](https://bun.sh/docs/test/reporters)
- [Bun: execução paralela e isolada](https://bun.sh/docs/test/parallel)
- [Bun: comportamento em tempo de execução](https://bun.sh/docs/test/runtime-behavior)
