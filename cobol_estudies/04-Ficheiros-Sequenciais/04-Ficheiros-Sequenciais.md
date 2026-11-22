# 04 Ficheiros sequenciais

Até aqui os dados estavam dentro do programa. Neste módulo o programa passa a ler e a escrever ficheiros: declaras o ficheiro, abres, lês registo a registo num ciclo, escreves, fechas e verificas o resultado de cada operação. É o trabalho de base de quase todo o COBOL de produção. Todas as saídas foram obtidas com o GnuCOBOL 3.2.0 (imagem Docker est-cb-gnucobol:estudo).

**NOTA:** os exemplos estão em 04-Ficheiros-Sequenciais/exemplos/. Copia o .cob e os ficheiros da loja (00-Introducao/dados/) para uma pasta tua e corre cobc -x -o programa programa.cob e depois ./programa. Os programas que pedem o nome do ficheiro leem-no do teclado: ex. echo clientes.dat e envia para ./programa por pipe.

## Declarar o ficheiro

Um ficheiro precisa de duas declarações. Na ENVIRONMENT DIVISION, o SELECT liga um nome interno ao ficheiro real. Na FILE SECTION, o FD descreve o registo.

               SELECT F-CLIENTES ASSIGN TO "clientes.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-ESTADO.
    ...
           FD  F-CLIENTES.
           01  REG-CLIENTE.
               05  CLI-ID              PIC 9(03).
               05  CLI-NOME            PIC X(20).

| Cláusula | Para quê |
|---|---|
| SELECT nome | O nome interno, usado em OPEN, READ, WRITE e CLOSE |
| ASSIGN TO | O ficheiro real: um literal entre aspas ou um nome de variável |
| ORGANIZATION | LINE SEQUENTIAL ou SEQUENTIAL (ver abaixo) |
| ACCESS MODE IS SEQUENTIAL | Acesso por ordem. É o único modo dos ficheiros sequenciais e o valor por defeito |
| FILE STATUS IS | Um campo PIC XX que recebe o resultado de cada operação |

Os registos do FD (nível 01) são a área de memória onde o READ põe os dados e de onde o WRITE os tira. Para gravar valores que não vêm do ficheiro, monta-os na WORKING-STORAGE e passa-os com WRITE FROM.

## LINE SEQUENTIAL e SEQUENTIAL

Os ficheiros da loja são de texto: cada registo ocupa uma linha, terminada por um fim de linha. Isso é ORGANIZATION IS LINE SEQUENTIAL. Em SEQUENTIAL os registos vêm colados, sem separador, e é o tamanho do registo que os delimita.

| | LINE SEQUENTIAL | SEQUENTIAL |
|---|---|---|
| Fim de registo | O fim de linha (LF) | Só o tamanho do registo |
| Editável num editor de texto | Sim | Só se tiver tamanho certo e sem LF |
| Espaços no fim ao escrever | Cortados (ver abaixo) | Mantidos |
| Uso típico | Texto, relatórios, trocas de ficheiros | Ficheiros de largura fixa de sistemas legados |

Como o ficheiro é lido como texto, os campos têm de coincidir com as colunas. O produto 001 está em produtos.dat como 001Romance Policial (25 caracteres), 01, 0001290, 00040: se a soma das PICTURE não der 42, tudo o que vem a seguir fica deslocado.

## Abrir, ler, escrever, fechar

| Instrução | O que faz |
|---|---|
| OPEN INPUT f | Abre para leitura. O ficheiro tem de existir |
| OPEN OUTPUT f | Cria o ficheiro; se já existia, apaga o conteúdo |
| OPEN EXTEND f | Abre para acrescentar no fim. Se o ficheiro não existir dá o estado 35 (verificado) |
| OPEN I-O f | Lê e atualiza registos já lidos (REWRITE) |
| READ f AT END ... | Lê o próximo registo; AT END trata o fim do ficheiro |
| WRITE reg | Grava o registo. Escreve-se o nome do registo (01), não o do ficheiro |
| WRITE reg FROM campo | Faz MOVE campo TO reg e grava |
| CLOSE f | Fecha o ficheiro |

O READ preenche o registo do FD. Por isso o primeiro programa, lerclientes.cob, usa os campos do próprio FD:

    $ ./lerclientes
    OPEN: 00
    001 Ana Ribeiro          Lisboa
    002 Bruno Costa          Porto
    003 Carla Mendes         Braga
    004 Diogo Pires          Lisboa
    005 Eva Martins          Coimbra
    006 Filipe Lopes         Porto
    007 Graca Nunes          Faro
    008 Hugo Teixeira        Lisboa
    ultimo READ: 10
    CLOSE: 00
    Lidos: 008

**ATENÇÃO:** depois de um READ com AT END, o conteúdo do registo já não é de confiança. Não uses os campos do registo depois do fim do ficheiro.

## O ciclo de leitura

O padrão universal é a leitura antecipada: lês um registo antes do ciclo, processas dentro dele e lês o seguinte no fim de cada volta. O fim do ficheiro é guardado numa flag com nível 88, que torna a condição legível.

           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
    ...
               PERFORM LER-CLIENTE
               PERFORM UNTIL FIM-DO-FICHEIRO
                   ADD 1 TO WS-TOTAL
                   DISPLAY CLI-ID " " CLI-NOME " " CLI-CIDADE
                   PERFORM LER-CLIENTE
               END-PERFORM
    ...
           LER-CLIENTE.
               READ F-CLIENTES
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ.

O parágrafo LER-CLIENTE existe uma só vez, e o ciclo é sempre «testa, processa, lê». Se leres só dentro do ciclo, ou processas um registo a mais no fim, ou perdes o primeiro. O READ tem também NOT AT END (usado em formatos.cob), que corre quando a leitura correu bem.

**DICA:** o END-READ fecha o READ. Usa-o sempre que o READ tiver AT END: sem ele, o ponto que acaba o parágrafo é que fecha, e é fácil encadear o que não querias.

## FILE STATUS: o resultado de cada operação

Com FILE STATUS, o programa continua depois de um erro de ficheiro e tu decides o que fazer. Sem ele, o GnuCOBOL escreve uma mensagem e termina. Em semstatus.cob, que abre um ficheiro inexistente sem FILE STATUS:

    libcob: error: file does not exist (status = 35) for file F-NADA ('nao-existe_dat' => nao-existe.dat)

O programa terminou com código de saída 1 e o DISPLAY seguinte nunca correu. O estados.cob provoca vários erros de propósito e mostra o código de cada um:

    OPEN INPUT de ficheiro inexistente: 35
    OPEN OUTPUT numa pasta inexistente: 30
    READ sem OPEN: 47
    OPEN de ficheiro ja aberto: 41
    WRITE num ficheiro aberto so para leitura: 48
    3.o READ (registo 3): 00
    4.o READ (fim): 10
    READ depois do fim: 46
    CLOSE de ficheiro fechado: 42

| Código | Significado, como observado |
|---|---|
| 00 | Operação bem sucedida |
| 04 | Linha maior do que o registo, truncada (ver acentos) |
| 06 | Linha maior do que o registo, devolvida em vários registos (ver acentos) |
| 10 | Fim do ficheiro (AT END) |
| 30 | Erro permanente de E/S (aqui, criar um ficheiro numa pasta que não existe) |
| 35 | OPEN INPUT de um ficheiro que não existe |
| 41 | OPEN de um ficheiro que já está aberto |
| 42 | CLOSE de um ficheiro que não está aberto |
| 46 | READ depois de já ter chegado ao fim |
| 47 | READ num ficheiro que não está aberto para leitura |
| 48 | WRITE num ficheiro que não está aberto para escrita |

A lista completa dos códigos está no manual do GnuCOBOL (fontes no fim); aqui estão só os que observei.

**ATENÇÃO:** o estado 10 é o único que é normal. Todos os outros diferentes de 00 numa abertura ou escrita pedem uma decisão: mensagem clara e STOP RUN, ou outro caminho. Testa o estado logo a seguir ao OPEN. O exercício 15 pede isso.

**NOTA:** o estado 35 também aparece num OPEN EXTEND de um ficheiro que não existe (verificado). Só o OPEN OUTPUT cria o ficheiro.

## OPEN OUTPUT, EXTEND e WRITE FROM

O filtrar.cob copia para lisboa.dat os clientes de Lisboa. Cada registo lido é testado e, se passa, gravado com WRITE FROM: o registo de saída tem 71 bytes sem estrutura, e o WRITE FROM trata do MOVE.

               OPEN INPUT F-CLIENTES
               OPEN OUTPUT F-LISBOA
           ...
                   IF CLI-CIDADE = "Lisboa"
                       WRITE REG-LISBOA FROM REG-CLIENTE
                       ADD 1 TO WS-GRAVADOS
                   END-IF

    Lidos: 008 Gravados: 003

O programa acrescenta depois um cliente novo (009, Iris Barbosa, definido na WORKING-STORAGE) com OPEN EXTEND. O ficheiro final tem quatro linhas, 288 bytes (71 de dados mais o LF, quatro vezes):

    001Ana Ribeiro         ana.ribeiro@exemplo.pt        Lisboa    20240115
    004Diogo Pires         diogo.pires@exemplo.pt        Lisboa    20240509
    008Hugo Teixeira                                     Lisboa    20241120
    009Iris Barbosa        iris@exemplo.pt               Lisboa    20250101

Correr o programa uma segunda vez dá outra vez quatro linhas e não oito, porque o OPEN OUTPUT apaga o que existia antes de o EXTEND acrescentar. O contrário é que é perigoso: um OPEN OUTPUT por engano num ficheiro de produção apaga os dados.

**ATENÇÃO:** o WRITE FROM exige que o campo de origem esteja bem montado. Se o registo de origem tiver mais bytes do que o de destino, o MOVE trunca à direita sem avisar.

Em LINE SEQUENTIAL, o WRITE corta os espaços no fim da linha. Em escrever.cob, o registo de 17 bytes com 01Livros e espaços foi gravado como 9 bytes (od -An -tx1; 0a é o fim de linha):

    30 31 4c 69 76 72 6f 73 0a

Quando o último campo do registo termina em espaços, as linhas deixam de ter todas o mesmo tamanho. Para os manteres com a largura, o manual do GnuCOBOL tem a opção COB_LS_FIXED (confirma na documentação; não a testei).

## Contar e somar

Ler um ficheiro para o resumir é o trabalho mais comum. O totais.cob lê linhas.dat, conta as linhas, soma as unidades e acumula o valor (quantidade vezes preço unitário):

           COMPUTE WS-VALOR-LINHA = LIN-QUANTIDADE * LIN-PRECO-UNIT
           ADD WS-VALOR-LINHA TO WS-TOTAL

    enc 1, produto 001 x002 = 00000025.80
    enc 1, produto 005 x001 = 00000014.90
    Linhas:    0026
    Unidades:  000046
    Total enc 1: 00000040.70
    Total geral: 00001005.49

Conferi o total com awk sobre o mesmo ficheiro: 1005.49. O valor decimal implícito do preço (V) fez o trabalho: o ficheiro tem 0001290, o programa multiplica 12.90 por 2.

**DICA:** dimensiona os acumuladores para o maior valor possível. WS-TOTAL com 9(08)V99 aguenta 99 milhões; um total que não caiba é truncado em silêncio (módulo 02), não dá erro.

## OPEN I-O e REWRITE

OPEN I-O abre o ficheiro para ler e para atualizar o registo que acabou de ser lido. Em atualizar.cob, com um ficheiro SEQUENTIAL de largura fixa, leio dois registos, mudo o nome do segundo e faço REWRITE:

    OPEN I-O: 00
    REWRITE: 00
    WRITE em I-O: 48

O ficheiro ficou com 01Livros, 02ELETRONICA e 03Casa (sem alterar o tamanho). O REWRITE substitui o registo na mesma posição, por isso o novo tem de ter o mesmo tamanho. Um WRITE num ficheiro aberto com I-O de acesso sequencial deu o estado 48: só se acrescenta com EXTEND.

**NOTA:** no mundo real, mudar um registo no meio de um ficheiro sequencial é raro: lê-se tudo e grava-se um ficheiro novo (a técnica do filtrar.cob). Para atualizar registos individuais usam-se ficheiros indexados (módulo 06).

## Largura fixa e fim de linha: LF e CRLF

Um registo de largura fixa de 17 bytes ocupa 17 bytes. Mas um ficheiro LINE SEQUENTIAL tem ainda o fim de linha: 18 bytes no Linux, onde o fim de linha é um LF (0A). No Windows o fim de linha é CRLF (0D 0A): 19 bytes. As categorias.dat da loja têm 54 bytes (3 vezes 18). Com um CRLF ficam 57, como em categorias-crlf.dat.

Em formatos.cob, a variável WS-NOME-FICHEIRO escolhe o ficheiro e uma letra escolhe o modo. Lido como LINE SEQUENTIAL, o ficheiro com LF e o ficheiro com CRLF dão o mesmo resultado: o GnuCOBOL 3.2.0 em Linux tirou o CR. Em crlf.cob, com cidades-crlf.dat (linhas Lisboa e Porto com CRLF), o registo de 10 bytes ficou 4C6973626F6120202020 e IF REG-CIDADE = "Lisboa" deu verdadeiro: sem CR escondido.

Lido como SEQUENTIAL de 17 bytes, o mesmo ficheiro com fim de linha deslocou tudo (em hexadecimal, o ID do segundo registo):

    categorias.dat       (LF)    ID: 3031  0A30  200A  2020
    categorias-crlf.dat  (CRLF)  ID: 3031  0D0A  2020  2020
    categorias-fixo.dat  (sem fim de linha)  ID: 3031  3032  3033

O segundo registo do ficheiro com LF começa no LF do primeiro e o ID aparece como 0A30 em vez de 3032. O terceiro começa em 200A. É esse o problema de ler ficheiros de outro sistema com a organização errada: nada dá erro, os dados é que ficam mal alinhados. A solução é o contrário: um ficheiro sem fim de linha (categorias-fixo.dat, criado com tr -d de LF) lido com SEQUENTIAL deu os três registos certos.

**ATENÇÃO:** se um ficheiro vier do Windows, convém conferir se os campos numéricos lidos são mesmo numéricos. IF campo IS NUMERIC testa isso. O que vi foi só o comportamento do GnuCOBOL 3.2.0 em Linux; não testei com um GnuCOBOL nativo de Windows nem com outros compiladores.

## Como o ASSIGN encontra o ficheiro

O ASSIGN TO aceita três formas:

| Forma | Exemplo | Resolução |
|---|---|---|
| Literal | ASSIGN TO "clientes.dat" | O nome tal e qual, na pasta atual |
| Variável da WORKING-STORAGE | ASSIGN TO WS-NOME-FICHEIRO | O valor do campo, lido no OPEN (os espaços à direita são ignorados) |
| Nome sem aspas que não é variável | ASSIGN TO CLIENTES | Consulta o ambiente e usa o valor da variável, senão usa o nome |

Em nomes.cob o SELECT usa ASSIGN TO CLIENTES, e executei-o de várias formas:

| Situação | Estado do OPEN |
|---|---|
| Nenhuma variável de ambiente | 35 (procura um ficheiro chamado CLIENTES) |
| DD_CLIENTES=clientes.dat | 00 |
| dd_CLIENTES=clientes.dat | 00 |
| CLIENTES=clientes.dat | 00 |
| COB_FILE_PATH=/work/d (com um ficheiro CLIENTES nessa pasta) | 00 |

Assim, o mesmo programa lê ficheiros diferentes sem ser recompilado: definir DD_CLIENTES antes de o correr. É o equivalente, no GnuCOBOL, do cartão DD do JCL, onde se liga o nome interno ao ficheiro real (o JCL não foi executado aqui). A COB_FILE_PATH define a pasta onde ficam os ficheiros com nome relativo.

    docker run --rm -e DD_CLIENTES=clientes.dat ... ./nomes

**NOTA:** a ordem de procura entre as variantes DD_, dd_ e o nome simples está no manual do GnuCOBOL; só confirmei que as três funcionam sozinhas. Os nomes de ficheiro no Linux distinguem maiúsculas de minúsculas; o Windows não.

## ASCII e acentos

Os ficheiros da loja são ASCII, sem acentos, de propósito. Se o ficheiro for UTF-8, cada letra acentuada ocupa 2 bytes, e o COBOL conta bytes, não letras. Em acentos.cob:

    Bytes em "José": 5
    Bytes em "Jose": 4
    JOSé

FUNCTION LENGTH devolveu 5 para José, e UPPER-CASE não converteu o é. O ficheiro acentos.dat tem duas linhas, escritas para ter NOME X(8) e CIDADE X(6) em letras. A primeira, João    Évora, tem duas letras acentuadas e, por isso, dois bytes a mais:

    nome=[João   ] cidade=[ Évor] estado 06
    nome=[a       ] cidade=[      ] estado 00
    nome=[Ana     ] cidade=[Porto ] estado 00

O nome ficou com 8 bytes e perdeu um espaço, e a cidade começou um byte antes («Évor»). Pior: a linha tinha 16 bytes, mais do que os 14 do registo, e o GnuCOBOL 3.2.0 devolveu o resto como um registo a mais (a letra a, estado 06). Com a opção COB_LS_SPLIT=false o resto é descartado e o estado é 04 (verificado; o manual descreve as duas opções).

**ATENÇÃO:** a regra prática, com ficheiros de largura fixa, é manter ASCII, ou fazer as contas em bytes. Registos com acentos desalinham todos os campos que vêm depois.

## Resumo

| Queres | Usa |
|---|---|
| Ler um ficheiro de texto | SELECT com LINE SEQUENTIAL, OPEN INPUT, ciclo com leitura antecipada |
| Criar ou refazer um ficheiro | OPEN OUTPUT e WRITE registo FROM campo |
| Acrescentar sem apagar | OPEN EXTEND |
| Saber o que correu mal | FILE STATUS testado logo a seguir ao OPEN |
| Mudar o ficheiro sem recompilar | ASSIGN TO nome (DD_nome) ou ASSIGN TO variável |
| Ficheiros de outro sistema | Confirmar LF ou CRLF, e ASCII ou UTF-8 |

## Exercícios

**PRATICAR:** faz os exercícios 13 a 16 do módulo 11: ler os produtos e contar os que não têm stock (13), separar as encomendas abertas num ficheiro novo (14), abrir um ficheiro cujo nome vem do teclado e tratar o estado do OPEN (15) e calcular o total de cada encomenda com quebra de controlo (16).

## Fontes oficiais

- Manual do programador do GnuCOBOL: https://gnucobol.sourceforge.io/doc/gnucobol.html
- FAQ do GnuCOBOL: https://gnucobol.sourceforge.io/faq/index.html
- IBM Enterprise COBOL for z/OS 6.4, documentação (o COBOL de mainframe; não executado aqui): https://www.ibm.com/docs/en/cobol-zos/6.4
