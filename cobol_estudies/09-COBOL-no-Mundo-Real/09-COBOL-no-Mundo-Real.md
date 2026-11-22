# 09 COBOL no mundo real

Até aqui escreveste COBOL que corre num contentor, com ficheiros de texto. Na vida real o COBOL raramente vive sozinho: corre ao lado de JCL, CICS e Db2 num mainframe, troca ficheiros com outros sistemas e é chamado ou chama código noutras linguagens. Este módulo mostra essa fronteira. Regra de honestidade: tudo o que foi executado aqui usou o GnuCOBOL 3.2.0 (cobc 3.2.0, imagem est-cb-gnucobol:estudo), Python 3.13 e as ferramentas do contentor (iconv, gcc). O mainframe não se pode executar aqui: o que digo sobre IBM Enterprise COBOL, z/OS, JCL, CICS e Db2 vem de documentação da IBM que li e está assinalado como «não executado».

## O ecossistema: batch e online

Há dois modos de trabalho que explicam quase tudo o que ouvirás sobre COBOL empresarial.

| Modo | O que é | Exemplo na loja |
|---|---|---|
| Batch | Um programa corre do princípio ao fim sobre ficheiros ou tabelas, sem utilizador à espera | Fecho do dia: somar as linhas de encomenda e gerar um ficheiro para a contabilidade |
| Online (transacional) | Muitos utilizadores pedem pequenas operações e esperam resposta imediata | Consultar o stock de um produto ao balcão |

Tudo o que fizeste nos módulos 04 a 06 é batch. As três peças do mainframe que se ligam ao COBOL, segundo a documentação da IBM que li (não executado):

| Peça | O que a documentação diz |
|---|---|
| JCL | Descreve ao sistema o trabalho a fazer e os recursos de que precisa. Um job tem uma instrução JOB e pelo menos uma EXEC (identifica o programa a executar num passo); as instruções DD descrevem os dados de entrada e saída |
| CICS | Servidor de aplicações para o z/OS, com aplicações em várias linguagens; num programa COBOL escrevem-se comandos entre EXEC CICS e END-EXEC |
| Db2 | O SQL é escrito no programa COBOL entre EXEC SQL e END-EXEC (ver mais abaixo) |

Um job de JCL que corre o teu programa é, conceptualmente, o que fizeste com docker run: dizer qual o programa e onde estão os ficheiros. Mas a sintaxe e as regras do JCL não as executei, por isso não as ensino aqui.

**NOTA:** a IBM descreve o CICS como servidor de aplicações «para aplicações de alta intensidade e alto valor» em setores como banca, transportes, retalho e seguros. Quantas empresas usam COBOL ou quanto código existe são números que não verifiquei e não cito.

## GnuCOBOL e COBOL de mainframe

Só listo o que li nas documentações (a do GnuCOBOL e a do Enterprise COBOL for z/OS 6.4) ou observei a executar.

| Tema | Enterprise COBOL (documentação, não executado) | GnuCOBOL 3.2.0 (documentação ou executado) |
|---|---|---|
| SQL | EXEC SQL e END-EXEC, com o compilador a tratar o Db2 (coprocessador) | A FAQ diz que há pré-compiladores externos (OCESQL, esqlOC); o cobc não traz EXEC SQL |
| JSON e XML | JSON GENERATE e XML GENERATE | Executei os dois no 3.2.0 (ver abaixo) |
| Página de códigos | CODEPAGE tem por omissão 1140 | Tabela EBCDIC por omissão traduz «para ASCII estendido à maneira Micro Focus», segundo o guia |
| CICS | EXEC CICS command END-EXEC | Não li nada no guia do GnuCOBOL sobre isto: não afirmo |

Fora desta tabela, não assumas equivalência: um programa que usa CICS, JCL ou Db2 precisa de adaptação para correr no GnuCOBOL, e isso depende de cada caso.

## EBCDIC e ASCII

O mainframe usa EBCDIC; o resto do mundo, ASCII ou UTF-8. A FAQ do GnuCOBOL diz que ele suporta ambos. A forma COBOL de converter é declarar dois alfabetos e usar INSPECT CONVERTING (excerto de ebcdic.cob, executado):

           SPECIAL-NAMES.
               ALPHABET ALFA-NATIVO IS NATIVE
               ALPHABET ALFA-EBCDIC IS EBCDIC.
           ...
                       INSPECT REG-ENTRADA
                           CONVERTING ALFA-NATIVO TO ALFA-EBCDIC

O programa converte categorias.dat e grava categorias.ebc (ORGANIZATION IS SEQUENTIAL, sem fim de linha). Os primeiros 17 bytes, em hexadecimal, e o mesmo ficheiro feito com iconv dentro do contentor:

    f0 f1 d3 89 a5 99 96 a2 40 40 40 40 40 40 40 40 40 ...
    $ tr -d '[:cntrl:]' < categorias.dat | iconv -f ASCII -t CP037 | cmp - categorias.ebc && echo IGUAIS
    IGUAIS

Cada carácter mudou de byte: o dígito 0 passou de 30 para f0, o espaço de 20 para 40, o L maiúsculo para d3. E o Python lê-o com a tabela cp037 (ler_ebcdic.py):

    f0 f1 d3 89 a5 99 -> '01Livros         '

Para as letras, os dígitos, o espaço, o arroba e o ponto dos dados da loja os resultados coincidem. Nos símbolos já não. Converti a cadeia de símbolos abaixo com o INSPECT e com o iconv (mesmo comprimento, hexadecimal):

    original        [ ] { } ~ ^ | ! # @
    GnuCOBOL        ad bd c0 d0 a1 5f 6a 5a 7b 7c
    iconv CP037     ba bb c0 d0 a1 b0 4f 5a 7b 7c
    iconv CP273     63 fc 43 dc 59 5f bb 4f 7b b5
    iconv CP500     4a 5a c0 d0 a1 5f bb 4f 7b 7c

Os parêntesis retos, o circunflexo e a barra vertical saem diferentes entre o GnuCOBOL e o CP037; e o CP273, o CP500 e o CP037 também diferem entre si (o CP1140 deu o mesmo que o CP037 neste teste). Ler os bytes do GnuCOBOL com cp037 no Python dá '\xdd\xa8{}~\xac\xa6!#@': os símbolos [ ] ^ | viram outros carateres.

**ATENÇÃO:** «converter para EBCDIC» não é uma operação única: tens de saber qual a página de códigos do sistema de destino. Passar texto entre sistemas sem combinar a tabela corrompe exatamente os símbolos que parecem inofensivos. Tentei também a opção febcdic-table=ibm (existe na lista de opções do guia) e o cobc 3.2.0 desta imagem respondeu «can't open translation table 'ibm'», por isso não sei dizer-te se se pode escolher o CP037 com ela. Quando precisares de uma tabela exata, converte com iconv ou Python, como acima.

**DICA:** o iconv -l lista as tabelas disponíveis no contentor (vi CP037, CP273, CP500 e CP1140). O que o teu parceiro de integração usa em produção, pergunta-lhe; confirma na documentação do sistema dele.

## COMP-3 e ficheiros trocados entre sistemas

Um ficheiro de largura fixa em texto (como os da loja) abre-se em qualquer editor. Um ficheiro com campos binários não. A documentação do Enterprise COBOL diz que PACKED-DECIMAL e COMP-3 são sinónimos, que ocupam um byte por cada dois dígitos e que o byte mais à direita leva um dígito e o sinal (positivo C, A, E ou F; negativo D ou B). O GnuCOBOL aceita COMP-3 e PACKED-DECIMAL (palavras reservadas, confirmado na lista do guia).

O programa gera_comp3.cob lê produtos.dat e grava produtos.bin com este registo (38 bytes):

           01  REG-SAIDA.
               05  SAI-ID              PIC 9(03).
               05  SAI-NOME            PIC X(25).
               05  SAI-CATEGORIA-ID    PIC 9(02).
               05  SAI-PRECO           PIC S9(05)V99 COMP-3.
               05  SAI-STOCK           PIC S9(05) COMP.

    10 registos, 38 bytes cada

O PRECO 12.90 tem 7 dígitos: ficam 4 bytes (7 dígitos mais o sinal). O ficheiro nunca foi texto, por isso um Python lê-o por posições (ler_comp3.py): separa o nibble do sinal, e lê o COMP como inteiro big-endian (assim o li; o guia lista a opção binary-byteorder com native ou big-endian):

    380 bytes, 10 registos
    1 Romance Policial 0001290c 12.90 40
    2 Livro de Receitas 0001850c 18.50 25
    3 Atlas Mundial 0002999c 29.99 10
    valor total de stock: 7304.60

O total de 7304.60 coincide com o calculado diretamente em produtos.dat. O sufixo c do último nibble é o sinal positivo; no exercício 34 vês um d (negativo).

**ATENÇÃO:** o COMP-3 não tem ponto decimal nem fim de linha. Quem recebe o ficheiro precisa do layout exato (do copybook), do número de casas e da página de códigos dos campos de texto. Se o ficheiro passar por uma transferência em modo texto, os bytes do COMP-3 são alterados e o ficheiro fica inutilizável: esta parte não executei, mas é por isso que as transferências de ficheiros com campos binários têm de ser em modo binário.

## Formatos modernos a partir do COBOL

O 3.2.0 compila JSON GENERATE e XML GENERATE (testado). O programa exporta.cob gera CSV à mão com STRING e JSON por registo (clientes.dat). O CSV:

    id;nome;email;cidade;data_registo
    001;Ana Ribeiro;ana.ribeiro@exemplo.pt;Lisboa;20240115
    ...
    008;Hugo Teixeira;;Lisboa;20241120

O excerto mais importante é o do STRING, com FUNCTION TRIM para tirar os espaços do preenchimento, e o do JSON GENERATE:

           JSON GENERATE WS-JSON FROM REG-CLIENTE COUNT IN WS-TAM
               ON EXCEPTION DISPLAY "JSON falhou"
           END-JSON
           MOVE WS-JSON(1:WS-TAM) TO LINHA-JSON

Resultado para os clientes 1 e 8 (uma linha cada), e o XML do cliente 1:

    {"REG-CLIENTE":{"CLI-ID":1,"CLI-NOME":"Ana Ribeiro","CLI-EMAIL":"ana.ribeiro@exemplo.pt","CLI-CIDADE":"Lisboa","CLI-DATA-REGISTO":20240115}}
    {"REG-CLIENTE":{"CLI-ID":8,"CLI-NOME":"Hugo Teixeira","CLI-EMAIL":" ","CLI-CIDADE":"Lisboa","CLI-DATA-REGISTO":20241120}}
    <REG-CLIENTE><CLI-ID>1</CLI-ID><CLI-NOME>Ana Ribeiro</CLI-NOME>...</REG-CLIENTE>

Observa o que o gerador fez, porque quem consome o JSON vai reparar: os nomes das chaves são os nomes dos campos COBOL (em maiúsculas, com hífen); os campos PIC 9 saem como números e perdem os zeros à esquerda (CLI-ID passa de 001 para 1); os alfanuméricos perdem os espaços finais; e o email em branco do cliente 8 saiu como uma cadeia com um espaço (o consumidor Python fez .strip()). Um PIC 9(05)V99 saiu como número com duas casas (12.90, visto no exercício 35), e um campo editado (ZZZZ9.99) saiu como texto com espaços.

**NOTA:** o COUNT IN dá o número de caracteres gerados; sem ele ficas com o campo todo, preenchido com espaços. Se o campo de destino for pequeno, a cláusula ON EXCEPTION é o sítio para o detetar. Não testei o comportamento de JSON PARSE nem de XML PARSE.

O consome_json.py lê o ficheiro com o módulo json do Python:

    8 clientes
    1 int 'ana.ribeiro@exemplo.pt'
    2 int 'bruno.costa@exemplo.pt'
    8 int ''

## C e COBOL

O guia do GnuCOBOL descreve a interface com C. Executei os dois sentidos.

COBOL chama C. A função C recebe números por valor, e uma cadeia por referência sem terminador NUL (o guia avisa disso). Em iva_c.c:

    int iva_c(int centimos, int taxa)
    {
        return (centimos * (100 + taxa) + 50) / 100;
    }

E no COBOL (chama_c.cob), compilado com cobc -x -o chama chama_c.cob iva_c.c:

           CALL "iva_c" USING BY VALUE WS-CENTIMOS WS-TAXA
               RETURNING WS-RES

    1290 centimos + 23% =   1587 centimos
    ROMANCE POLICIAL  (    17 carateres)

O 1290 vem do Romance Policial (12.90). Se compilares sem o ficheiro .c, o programa compila e só falha ao executar:

    libcob: error: module 'iva_c' not found

C chama COBOL. O módulo preco_final.cob (LINKAGE com dois campos PIC 9(05)V99) compila-se com cobc -m e o main em C usa cob_init, cob_resolve e cob_tidy da libcob (main_c.c). Os argumentos são o texto dos dígitos, sem ponto decimal:

    $ cobc -m preco_final.cob && cobc -x -o mainc main_c.c
    $ COB_LIBRARY_PATH=. ./mainc
    C recebeu: 0001587

Python chama COBOL. Não usei ctypes: o caminho simples, e o que executei, é correr o programa como processo e ler o resultado. O chama_cobol.py faz subprocess.run de docker run ... ./chama e imprime «COBOL disse: ...» para cada linha. É menos elegante do que uma biblioteca, mas o contrato é claro: ficheiros, argumentos e stdout.

**ATENÇÃO:** o guia avisa que um erro dentro do COBOL termina o programa inteiro, tal como STOP RUN, mesmo quando foi chamado a partir de C. Por isso o módulo preco_final.cob termina com GOBACK, e quem integra deve tratar os erros do lado COBOL.

## COBOL e SQL: SQL embebido

Não executei SQL embebido: o GnuCOBOL não o compila por si. O que li:

- Na documentação do Enterprise COBOL for z/OS 6.4: as instruções SQL delimitam-se com EXEC SQL e END-EXEC (cada delimitador completo numa só linha); deve incluir-se a SQLCA com EXEC SQL INCLUDE; as variáveis hospedeiras (host variables) definem-se na WORKING-STORAGE, LOCAL-STORAGE ou LINKAGE (não executado).
- Na FAQ do GnuCOBOL: existem pré-compiladores externos (OCESQL, para PostgreSQL, e esqlOC, que usa ODBC) que traduzem o EXEC SQL em COBOL normal antes de o cobc compilar. Confirma na documentação de cada um as versões e bases de dados suportadas.

O padrão, igual em qualquer pré-compilador, é este (esquema da documentação lida, não executado):

           EXEC SQL
               SELECT nome INTO :WS-NOME FROM clientes WHERE id = :WS-ID
           END-EXEC
           IF SQLCODE NOT = 0 ... (tratar o erro ou o 100, sem linhas)

Compara com os teus cursos de SQL: a consulta é a mesma, mas os valores entram e saem por variáveis COBOL precedidas de dois pontos, e o resultado é verificado pelo SQLCODE.

## Integrar com sistemas atuais: SAP e Delphi

A ponte mais simples e mais comum é o ficheiro de largura fixa. O COBOL escreve cada campo na sua posição, o outro sistema lê pela mesma posição. O contrato é o copybook: sem ele ninguém sabe onde acaba o NOME e começa a CATEGORIA.

O importa_largura_fixa.py faz de «sistema recetor»: tem o layout (nome e tamanho de cada campo, igual a produto.cpy), valida o tamanho de cada registo, parte os campos e repõe o ponto decimal implícito do preço:

    10 registos de 42 bytes
    {'id': '001', 'nome': 'Romance Policial', 'categoria_id': '01', 'preco': Decimal('12.90'), 'stock': '00040'}
    preco medio: 35.809

Um programa Delphi faria o mesmo com ReadLn e Copy(linha, posição, tamanho) (não executado). Do SAP não tenho documentação lida: não digo como o SAP importa ficheiros, só que o que um importador precisa de saber é o mesmo que o script acima precisou (posições, tamanhos, decimais implícitos, codificação, fim de linha); confirma no lado SAP.

Checklist para qualquer troca de ficheiros: quem é o dono do layout; página de códigos e fim de linha (os ficheiros da loja são ASCII com fim de linha LF); decimais implícitos e sinais; campos binários ou COMP-3 só com transferência binária; um registo de controlo (contagem e total) para detetar ficheiros truncados.

## Modernização: manter, encapsular, reescrever, migrar

A decisão sobre o que fazer a um sistema COBOL existente é de arquitetura, e está tratada em C:\temp\Sites\studies\solution_architect_studies\11-Migracao-e-Modernizacao\11-Migracao-e-Modernizacao.md (os «Rs» da migração, strangler fig, camada anticorrupção, cutover). Não a repito. O que este módulo acrescenta é o lado COBOL dessas opções:

| Opção | O que o COBOL oferece (visto neste módulo) |
|---|---|
| Manter | Corrigir e evoluir o programa; o que aprendeste nos módulos 01 a 08 |
| Encapsular | Pôr o COBOL por trás de uma interface: CALL a partir de C, execução como processo, ficheiros e JSON como contrato |
| Reescrever | Os copybooks e os ficheiros de exemplo servem de especificação; o script de largura fixa mostra como validar a saída da versão nova contra a antiga |
| Migrar | Os formatos (EBCDIC, COMP-3) são onde as migrações de dados costumam falhar: testa com ficheiros reais |

## Carreira e competências

Não tenho dados verificados sobre salários, procura ou quantidade de programadores COBOL, e não os vou inventar: procura-os em fontes atuais e independentes. O que o próprio material mostra é a diferença entre saber a linguagem e saber o ambiente:

- A linguagem em si (módulos 01 a 08) é a parte pequena.
- O ambiente: JCL, CICS e Db2 (a documentação da IBM trata-os em manuais próprios) e ferramentas do mainframe. Isto só se aprende com acesso a um sistema real, que este curso não usou.
- A fronteira: formatos de ficheiro, codificações, COMP-3, integração com outras linguagens, que é o que este módulo treinou e é útil mesmo sem mainframe.

Para quem trabalha com SAP e Delphi, o valor imediato está na capacidade de ler um copybook, perceber um ficheiro de largura fixa e falar com a equipa que mantém o COBOL. Isto é uma leitura minha do que o curso cobre, não um dado do mercado.

## Exercícios

**PRATICAR:** faz os exercícios 33 a 36 (EBCDIC, COMP-3, CSV e JSON, e chamar C); as soluções estão no módulo de gabarito. Os exemplos desta aula estão em 09-COBOL-no-Mundo-Real/exemplos/; copia-os para uma pasta de trabalho com os .dat da loja.

## Fontes oficiais

- GnuCOBOL Programmer's Guide (interface C, opções do compilador, palavras reservadas): https://gnucobol.sourceforge.io/doc/gnucobol.html
- GnuCOBOL FAQ (EBCDIC, SQL embebido, JSON): https://gnucobol.sourceforge.io/faq/index.html
- IBM, Enterprise COBOL for z/OS 6.4 Programming Guide (COMP-3, CODEPAGE, EXEC SQL, EXEC CICS): https://www.ibm.com/docs/en/SS6SG3_6.4.0/pdf/pgmvs.pdf
- IBM, JSON GENERATE no Enterprise COBOL for z/OS 6.4: https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statements-json-generate-statement
- IBM, z/OS MVS JCL User's Guide: https://www.ibm.com/docs/en/SSLTBW_3.1.0/pdf/ieab500_v3r1.pdf
- IBM, o que é o CICS: https://www.ibm.com/support/pages/what-cics
- Python, codecs (cp037 e outros): https://docs.python.org/3/library/codecs.html
- Python, struct: https://docs.python.org/3/library/struct.html
