# 00 Introdução e mapa do curso

Este curso ensina COBOL de raiz, para quem já programa noutras linguagens mas nunca viu uma linha de COBOL. Neste módulo percebes o que é o COBOL e porque ainda se fala dele, montas o ambiente (GnuCOBOL dentro do Docker), compilas e executas o primeiro programa e conheces os dados da «loja», o projeto que atravessa o curso inteiro. Não há exercícios neste módulo: os exercícios começam no módulo 01.

**NOTA:** tudo o que aparece com saída de programa foi compilado e executado com o GnuCOBOL 3.2.0. O que pertence ao mundo do mainframe IBM (z/OS, JCL, CICS, Db2) não pode ser executado aqui: vem assinalado como «não executado» e baseia-se só no que as páginas oficiais dizem.

## O que é o COBOL

COBOL é o acrónimo de Common Business-Oriented Language, ou seja, uma linguagem orientada para aplicações de gestão. O seu desenho começou em 1959, no CODASYL (Committee on Data Systems Languages), e o Programmers Guide do GnuCOBOL diz que o COBOL foi apresentado ao público em 1959. É uma linguagem compilada, imperativa, com uma sintaxe deliberadamente parecida com frases em inglês (ADD A TO B, MOVE X TO Y, DISPLAY "texto").

Foi depois normalizado pela ANSI e mais tarde pela ISO/IEC, e continua a ser revisto. Segundo a Wikipedia (fonte secundária; o site da ISO bloqueou a verificação automática com um erro 403, por isso não o cito):

| Versão | Norma (segundo a Wikipedia) |
|---|---|
| COBOL-60 | especificação do CODASYL, 1960, sem norma oficial |
| COBOL-68 | ANSI X3.23-1968 |
| COBOL-74 | ANSI X3.23-1974 |
| COBOL-85 | ANSI X3.23-1985 e ISO 1989:1985 |
| COBOL 2002 | ISO/IEC 1989:2002 |
| COBOL 2014 | ISO/IEC 1989:2014 |
| COBOL 2023 | ISO/IEC 1989:2023 |

Na prática, cada compilador implementa uma parte de uma ou mais destas normas e acrescenta extensões próprias, a que se chama dialeto. A página do GnuCOBOL refere que a versão 3.2 suporta 19 dialetos de COBOL; vês a lista real mais abaixo.

## Onde ainda se usa

Aqui convém ser rigoroso: há muitos números a circular na internet e poucos têm fonte. Isto é o que consegui verificar, e o que não consegui.

| Setor | O que verifiquei | O que não verifiquei |
|---|---|---|
| Bancos | A página da IBM sobre o Enterprise COBOL for z/OS descreve um caso de cliente, o banco canadiano CIBC, que atualizou 40000 aplicações COBOL críticas para o Enterprise COBOL 6 em três anos | Quantos bancos no mundo usam COBOL. É um caso de um fornecedor, não uma estatística |
| Seguros | Nada em fontes oficiais | Tudo. Não afirmo nada sobre seguradoras |
| Administração pública | A Wikipedia afirma, citando um testemunho de 2016 ao Congresso dos EUA, que várias agências federais norte-americanas usam COBOL | Não validei a fonte primária |

A mesma página da IBM diz que o Enterprise COBOL for z/OS corre em IBM z/OS e trabalha com IBM CICS, IBM IMS e IBM Db2 (não executado). A Wikipedia acrescenta, sem citação, que o COBOL continua muito usado em aplicações de mainframe de processamento em lote e transacional.

**ATENÇÃO:** vais ver por aí frases como «80% do mundo corre em COBOL» ou «95% dos pagamentos com cartão». Não as uso nesta aula: não encontrei uma fonte primária que as sustente com um método claro. Desconfia de percentagens redondas sem origem.

## Porque se fala dele hoje

Há duas razões, e nenhuma é «o COBOL é a melhor linguagem».

- Sistemas legados. Quem tem milhões de linhas de COBOL a processar faturação, contas ou folhas de pagamento tem de as manter, corrigir e integrar com sistemas novos. A Wikipedia diz que hoje a maior parte da programação em COBOL é manutenção de aplicações existentes (afirmação sem citação na página). Reescrever tudo é caro e arriscado, e é isso que mantém o código em produção.
- Falta de pessoas que o conheçam. É um tema recorrente, mas não verifiquei nenhum número oficial sobre a dimensão da escassez, por isso não o quantifico. O que podes concluir sem números: quem aprende COBOL e percebe também de ficheiros, dados em largura fixa e integração tem uma competência pouco comum.

**DICA:** se trabalhas em ambientes com ERP, Delphi ou sistemas antigos, o valor deste curso não está em «escrever COBOL novo», está em ler e perceber programas e ficheiros de largura fixa como os que vais usar aqui. Se a tua empresa tiver interfaces por ficheiros posicionais, o formato é do mesmo tipo (confirma com quem as mantém).

## COBOL contra linguagens modernas

Uma comparação honesta, só com o que dá para demonstrar.

| Tema | COBOL | Linguagens modernas (ex.: Python, Java, JavaScript) |
|---|---|---|
| Sintaxe | Verbosa e parecida com inglês: ADD A B GIVING SOMA | Mais curta: soma = a + b |
| Números decimais | Tipo decimal exato por definição, descrito com PICTURE (módulo 02) | Normalmente float por omissão; o tipo decimal existe, mas é opcional |
| Estrutura de dados | Registos hierárquicos com níveis 01 e 05, ligados diretamente ao layout do ficheiro | Classes, dicionários, objetos; o layout do ficheiro é código à parte |
| Ficheiros | Ficheiros sequenciais e indexados são parte da própria linguagem (módulos 04 e 06) | Bibliotecas externas ou da biblioteca padrão |
| Compilação | Compilado; o GnuCOBOL gera C e depois código nativo | Varia: interpretado, compilado para bytecode ou nativo |
| Onde brilha | Processamento em lote de muitos registos com regras de negócio | Web, apps, ciência de dados, quase tudo o resto |

Na linha dos decimais, o teste que corri: em Python, 0.1 + 0.2 dá 0.30000000000000004, enquanto com o tipo Decimal dá 0.30. No COBOL, o programa abaixo (decimal.cob, em exemplos) soma 0.10 e 0.20 e dá exatamente 0.30. Não te preocupes ainda com PIC 9V99: é o módulo 02.

               ADD A B GIVING SOMA.
               DISPLAY A " + " B " = " SOMA.

    0.10 + 0.20 = 0.30

**NOTA:** a tabela é uma opinião informada, não um ranking. Para um site novo, o COBOL não é a escolha natural; mantém-se onde já existe código e onde a exatidão de contas e o volume de registos pesam. Não vou comparar bibliotecas nem desempenho: não medi.

## COBOL de mainframe e GnuCOBOL

O COBOL «empresarial» que corre nos bancos é, tipicamente, o IBM Enterprise COBOL for z/OS. Para estudar, usas o GnuCOBOL, um compilador livre. São o mesmo idioma de base, com diferenças.

| Aspeto | IBM Enterprise COBOL (z/OS) | GnuCOBOL 3.2.0 |
|---|---|---|
| Plataforma | IBM z/OS (segundo a IBM) | Neste curso, Linux dentro de um contentor Docker |
| Execução neste curso | Não executado | Executado |
| Ambiente à volta | CICS, IMS, Db2 e JCL (não executado) | Ficheiros normais do sistema; sem JCL nem CICS |
| Licença | Produto comercial da IBM | Software livre (a página do projeto fala em «free/libre COBOL compiler») |
| Dialetos | O dialeto IBM | Inclui opções como -std=ibm e -std=mvs, que ajustam avisos e funcionalidades |

Executei o compilador do contentor para ver os dialetos que ele conhece:

    cobc --help
      -std=<dialect>        warnings/features for a specific dialect
                            <dialect> can be one of:
                            default, cobol2014, cobol2002, cobol85, xopen,
                            ibm-strict, ibm, mvs-strict, mvs,
                            mf-strict, mf, bs2000-strict, bs2000,
                            acu-strict, acu, rm-strict, rm, gcos-strict,
                            gcos;

Existem também ficheiros de configuração como ibm.conf e tabelas de conversão de caracteres chamadas ebcdic500_ascii7bit.ttbl, ebcdic500_ascii8bit.ttbl e ebcdic500_latin1.ttbl (listei a pasta de configuração do compilador). Compilar com -std=ibm funcionou para o Olá, mundo, mas isso não prova compatibilidade com programas de mainframe.

**ATENÇÃO:** o que funciona no GnuCOBOL pode não funcionar no mainframe e vice-versa. Não verifiquei diferenças concretas na documentação da IBM, por isso, sempre que um módulo disser «no mainframe é assim», lê como «não executado: confirma na documentação». Aprender no GnuCOBOL dá-te a linguagem; JCL, CICS e Db2 ficam fora do curso, só os apresento no módulo 09 como contexto.

## Como vais trabalhar: Docker mais GnuCOBOL

Não instalas o COBOL no Windows. O compilador vive numa imagem Docker construída a partir deste Dockerfile (pasta 00-Introducao/ambiente):

    FROM debian:stable-slim
    RUN apt-get update \
     && apt-get install -y --no-install-recommends gnucobol \
     && rm -rf /var/lib/apt/lists/*
    WORKDIR /work

O GnuCOBOL vem do pacote gnucobol do Debian. Para construir a imagem, na pasta do Dockerfile:

    docker build -t est-cb-gnucobol:estudo .

A imagem usada nesta aula já estava construída a partir deste Dockerfile (não a reconstruí ao escrever o módulo). O resultado:

    docker images est-cb-gnucobol
    IMAGE                    ID             DISK USAGE   CONTENT SIZE   EXTRA
    est-cb-gnucobol:estudo   8caa586b687c        285MB             0B

E a versão real do compilador:

    docker run --rm est-cb-gnucobol:estudo cobc --version
    cobc (GnuCOBOL) 3.2.0
    Copyright (C) 2023 Free Software Foundation, Inc.
    Built     Sep 09 2024 19:57:37
    Packaged  Jul 28 2023 17:02:56 UTC
    C version "14.2.0"

(Omiti as linhas de licença e de autores.) Para compilar e executar, no Git Bash, a partir da pasta onde está o programa:

    export MSYS_NO_PATHCONV=1
    docker run --rm -v "$(pwd -W)":/work est-cb-gnucobol:estudo \
        sh -c "cobc -x -o ola ola.cob && ./ola"

O que cada parte faz: --rm apaga o contentor no fim; -v liga a tua pasta à pasta /work do contentor (o pwd -W dá o caminho em formato Windows e o MSYS_NO_PATHCONV=1 impede o Git Bash de o estragar; sem isto, a pasta monta vazia). O cobc -x produz um executável e -o dá-lhe nome. Também existe -j, que compila e executa logo a seguir.

**NOTA:** só testei estes comandos no Git Bash. Noutras shells, confirma como se escreve o caminho para o -v.

Uma observação que vais ver em todas as execuções:

    Warning: program compiled against libxml 212 using older 209

É um aviso inofensivo do ambiente (versões diferentes da biblioteca libxml na imagem). Vai para o canal de erros (stderr), por isso não aparece se redirecionares o erro para o nulo. Nas saídas das aulas seguintes omito-o para não poluir; se alguma vez for relevante, mostro-o.

O GnuCOBOL funciona traduzindo o COBOL para C. Podes ver o ficheiro C intermédio com cobc -C:

    cobc -C -o ola.c ola.cob
    head -3 ola.c
    /* Generated by           cobc 3.2.0 */
    /* Generated from         exemplos/ola.cob */
    /* Generated at           Nov 19 2026 12:34:41 */

O C gerado tem 208 linhas para um programa de seis. O executável resultante liga-se à biblioteca de execução do GnuCOBOL, libcob.so.4 (vi-o com ldd), e à biblioteca C do sistema.

## O primeiro programa: Olá, mundo

Ficheiro exemplos/ola.cob (escrito sem acentos de propósito):

          * Primeiro programa: escreve uma linha no ecra e termina.
           IDENTIFICATION DIVISION.
           PROGRAM-ID. OLA.
           PROCEDURE DIVISION.
               DISPLAY "Ola, mundo!".
               STOP RUN.

Compilado e executado:

    cobc -x -o ola ola.cob && ./ola
    Ola, mundo!

Linha a linha: a que começa por asterisco é um comentário; IDENTIFICATION DIVISION e PROGRAM-ID dão nome ao programa; PROCEDURE DIVISION é onde estão as instruções; DISPLAY escreve no ecrã; STOP RUN termina. As outras divisões (DATA e ENVIRONMENT) ficam para o módulo 01.

### O formato fixo: colunas

O COBOL clássico usa formato fixo, herdado dos cartões perfurados de 80 colunas (o Programmers Guide do GnuCOBOL diz que antes da norma COBOL 2002 o código se estruturava à volta desses cartões). Cada coluna tem um papel:

| Colunas | Para quê |
|---|---|
| 1 a 6 | Numeração de linhas; o compilador ignora-as (e podes deixá-las em branco) |
| 7 | Indicador: asterisco marca comentário, hífen marca continuação, D marca linha de depuração |
| 8 a 11 | Área A: títulos de divisão, secção e parágrafo, e níveis 01 |
| 12 a 72 | Área B: o resto do código |
| 73 em diante | Ignoradas |

Verifiquei o comportamento do asterisco na coluna 7 (o programa acima tem um comentário assim) e do D, e que o texto para lá da coluna 72 se perde. Não testei a regra de ter 01 na área A em todas as situações; é matéria do módulo 01.

**ATENÇÃO:** os dois erros de principiante, executados. Primeiro, escrever DISPLAY a começar na coluna 7 (seis espaços em vez de sete). A coluna 7 é o indicador e a letra D significa linha de depuração:

    cobc -x -o c7 ola-erro-coluna7.cob && ./c7
    (sem erro, e sem nenhuma saída!)

Compilou e o programa não escreveu nada: o DISPLAY foi tratado como linha de depuração e ignorado. Com a opção -fdebugging-line, o compilador passa a ler essa linha e vês o que ele percebeu:

    error: syntax error, unexpected Literal, expecting SECTION or .
    note: unknown statement 'ISPLAY'

Repara em 'ISPLAY': o D foi comido pelo indicador. O segundo erro é ultrapassar a coluna 72 com uma linha longa (ola-erro-coluna72.cob, 79 colunas):

    error: continuation character expected
    error: invalid literal: 'Ola mundo esta mensagem e comprida ...'
    note: missing terminating " character

O texto para lá da coluna 72 foi cortado e o literal ficou sem aspas finais. A solução é quebrar a linha com continuação (hífen na coluna 7), que vês nos módulos seguintes.

### O formato livre

Desde o COBOL 2002 existe formato livre, sem colunas. Ficheiro exemplos/ola-livre.cob:

    *> Primeiro programa em formato livre (compilar com -free).
    IDENTIFICATION DIVISION.
    PROGRAM-ID. OLA-LIVRE.
    PROCEDURE DIVISION.
        DISPLAY "Ola, mundo!".
        STOP RUN.

    cobc -x -free -o livre ola-livre.cob && ./livre
    Ola, mundo!

Curiosidade: sem -free, o compilador 3.2.0 deteta o formato sozinho e avisa, mas compila na mesma:

    exemplos/ola-livre.cob:1: note: free format detected
        1 > *> Primeiro programa em formato livre (compilar com -free).
    Ola, mundo!

Neste curso uso o formato fixo, porque é o que encontras em código antigo, e menciono o livre quando fizer sentido.

## O projeto fio condutor: a loja

Todos os módulos usam os mesmos dados de uma loja (os mesmos dos cursos de SQL e MongoDB): 3 categorias, 8 clientes, 10 produtos, 12 encomendas e 26 linhas de encomenda. Estão em 00-Introducao/dados/ como ficheiros LINE SEQUENTIAL: texto simples, um registo por linha, sem acentos, com campos de largura fixa e sem separadores. Os copybooks com a descrição de cada registo estão em 00-Introducao/copybooks/ (usá-los-ás com COPY a partir do módulo 07).

| Ficheiro | Registos | Tamanho do registo | Campos (nome, tipo, posições) |
|---|---|---|---|
| categorias.dat | 3 | 17 | ID 9(02) 1-2, NOME X(15) 3-17 |
| clientes.dat | 8 | 71 | ID 9(03) 1-3, NOME X(20) 4-23, EMAIL X(30) 24-53, CIDADE X(10) 54-63, DATA-REGISTO 9(08) 64-71 (AAAAMMDD) |
| produtos.dat | 10 | 42 | ID 9(03) 1-3, NOME X(25) 4-28, CATEGORIA-ID 9(02) 29-30, PRECO 9(05)V99 31-37, STOCK 9(05) 38-42 |
| encomendas.dat | 12 | 25 | ID 9(04) 1-4, CLIENTE-ID 9(03) 5-7, DATA 9(08) 8-15, ESTADO X(10) 16-25 |
| linhas.dat | 26 | 21 | ID 9(04) 1-4, ENCOMENDA-ID 9(04) 5-8, PRODUTO-ID 9(03) 9-11, QUANTIDADE 9(03) 12-14, PRECO-UNITARIO 9(05)V99 15-21 |

Medi o comprimento de cada linha e o número de linhas: cada ficheiro tem todas as linhas com o tamanho da tabela e o número de registos indicado. Na notação de PICTURE, 9(03) é um número de 3 dígitos, X(20) é texto de 20 caracteres e V marca a vírgula decimal implícita: ocupa zero posições. Por isso 12.90 está no ficheiro como 0001290, sem ponto. O módulo 02 explica a fundo.

Os primeiros registos de cada ficheiro, tal como estão (head -n 3):

    categorias.dat
    01Livros         
    02Eletronica     
    03Casa           

    clientes.dat
    001Ana Ribeiro         ana.ribeiro@exemplo.pt        Lisboa    20240115
    002Bruno Costa         bruno.costa@exemplo.pt        Porto     20240203
    003Carla Mendes        carla.mendes@exemplo.pt       Braga     20240321

    produtos.dat
    001Romance Policial         01000129000040
    002Livro de Receitas        01000185000025
    003Atlas Mundial            01000299900010

    encomendas.dat
    000100120250110entregue  
    000200220250118entregue  
    000300120250202entregue  

    linhas.dat
    000100010010020001290
    000200010050010001490
    000300020040010004990

Lê o primeiro produto com a tabela à frente: 001 (ID), Romance Policial seguido de espaços (nome, 25 caracteres), 01 (categoria 1, Livros), 0001290 (preço 12.90) e 00040 (stock de 40). A primeira encomenda, 0001 do cliente 001, foi a 2025-01-10 e está entregue. O cliente 8 (Hugo Teixeira) não tem email: o campo de 30 posições está em branco, e isso aparece nos módulos de ficheiros e relatórios.

O copybook de um dos ficheiros, para veres como a mesma informação se escreve em COBOL (cliente.cpy):

           01  REG-CLIENTE.
               05  CLI-ID              PIC 9(03).
               05  CLI-NOME            PIC X(20).
               05  CLI-EMAIL           PIC X(30).
               05  CLI-CIDADE          PIC X(10).
               05  CLI-DATA-REGISTO    PIC 9(08).

**DICA:** guarda a tabela dos cinco ficheiros à mão. Vais voltar a ela em quase todos os módulos.

## Mapa do curso: módulos 00 a 13

| Módulo | Título | O que vais fazer |
|---|---|---|
| 00 | Introdução | Este módulo: ambiente, primeiro programa, dados da loja |
| 01 | Primeiros programas | A estrutura de um programa COBOL, as quatro divisões, compilar e executar |
| 02 | Dados e PICTURE | Declarar variáveis, tipos, decimais, grupos e registos |
| 03 | Instruções e fluxo | Condições, ciclos e as instruções aritméticas |
| 04 | Ficheiros sequenciais | Ler e escrever os ficheiros da loja |
| 05 | Relatórios e texto | Formatar saída e manipular texto |
| 06 | Ficheiros indexados e ordenação | Acesso por chave e ordenar registos |
| 07 | Subprogramas e modularização | CALL, COPY e dividir o código |
| 08 | Erros e depuração | Estados de ficheiro, tratamento de erros e depuração |
| 09 | COBOL no mundo real | Contexto de mainframe, JCL, CICS e Db2, sem os executar |
| 10 | Projeto final | Juntar tudo num programa sobre a loja |
| 11 | Exercícios | Os exercícios de todos os módulos |
| 12 | Cheat sheet | Resumo de consulta rápida |
| 13 | Gabarito | Soluções dos exercícios |

Os módulos 01 a 09 têm quatro exercícios cada, numerados de forma contínua no módulo 11 (módulo 01: exercícios 1 a 4, módulo 02: 5 a 8, e assim por diante até ao módulo 09: 33 a 36); o projeto final é o exercício 37. Cada módulo vem em Word (referência completa) e PowerPoint (resumo visual).

## Glossário

| Termo | Significado |
|---|---|
| COBOL | Common Business-Oriented Language, linguagem para aplicações de gestão, desenhada a partir de 1959 |
| CODASYL | Comité que iniciou o desenho do COBOL |
| Dialeto | Variante do COBOL implementada por um compilador, com extensões próprias |
| GnuCOBOL | Compilador de COBOL livre, usado neste curso (versão 3.2.0) |
| cobc | O comando do compilador do GnuCOBOL |
| Enterprise COBOL | O compilador COBOL da IBM para z/OS (não executado) |
| z/OS | Sistema operativo de mainframe da IBM (não executado) |
| JCL, CICS, Db2 | Controlo de trabalhos, monitor de transações e base de dados do mundo mainframe (não executado; CICS e Db2 são nomes da IBM) |
| Divisão | Bloco principal de um programa COBOL (IDENTIFICATION, ENVIRONMENT, DATA, PROCEDURE) |
| Formato fixo | Código escrito por colunas (indicador na 7, código nas 8 a 72) |
| Formato livre | Código sem colunas fixas; compila-se com -free |
| PICTURE (PIC) | Cláusula que descreve o tipo e o tamanho de um dado |
| Registo | Uma linha de um ficheiro, com campos de largura fixa |
| LINE SEQUENTIAL | Ficheiro de texto com um registo por linha |
| Copybook | Ficheiro com declarações reutilizáveis, incluído com COPY |
| Legado | Sistema antigo que continua em produção e tem de ser mantido |

## Como estudar

- Executa tudo. Copia cada exemplo para uma pasta tua e compila-o: ver o programa a correr vale mais do que lê-lo.
- Parte de propósito. Apaga um ponto, muda uma coluna, estoura a coluna 72, e lê a mensagem do compilador. Em COBOL, os erros de colunas são o pão de cada dia.
- Mantém os binários fora da pasta do curso: compila numa pasta de trabalho tua.
- Segue a ordem dos módulos: o curso é cumulativo e cada módulo usa o anterior.
- Usa a loja como cobaia: depois de cada módulo, pergunta-te «como faria isto com os clientes ou com os produtos?».
- Faz os exercícios do módulo 11 a partir do módulo 01, e só depois consulta o gabarito (módulo 13).

**PRATICAR:** compila e executa exemplos/ola.cob; depois executa-o em formato livre com ola-livre.cob e -free. Por fim, volta a provocar o erro da coluna 7 e confirma que o compilador não se queixa e o programa não escreve nada.

## Fontes oficiais

- GnuCOBOL, página do projeto: https://gnucobol.sourceforge.io/
- GnuCOBOL, guias e documentação (Programmers Guide, FAQ): https://gnucobol.sourceforge.io/guides.html
- GnuCOBOL, Programmers Guide (HTML): https://gnucobol.sourceforge.io/HTML/gnucobpg.html
- GnuCOBOL, FAQ: https://gnucobol.sourceforge.io/faq/index.html
- GnuCOBOL, manual do compilador: https://gnucobol.sourceforge.io/doc/gnucobol.html
- Pacote gnucobol no Debian: https://packages.debian.org/stable/gnucobol
- IBM Enterprise COBOL for z/OS, página do produto (não executado): https://www.ibm.com/products/cobol-compiler-zos
- IBM Enterprise COBOL for z/OS 6.4, documentação (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4
- Docker, referência do docker run: https://docs.docker.com/reference/cli/docker/container/run/
- Docker, referência do docker build: https://docs.docker.com/reference/cli/docker/buildx/build/
- Wikipedia, COBOL (fonte secundária, usada só para a lista de normas e como contexto): https://en.wikipedia.org/wiki/COBOL
