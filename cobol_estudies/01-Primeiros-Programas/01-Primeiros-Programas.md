# 01 Primeiros programas

Neste módulo escreves, compilas e executas os teus primeiros programas COBOL. Vês como um programa se organiza em quatro divisões, como funciona o formato de colunas do COBOL (e porque é que uma coluna errada parte o programa), como mostrar e ler dados com DISPLAY e ACCEPT, e como interpretar as mensagens reais do compilador quando algo corre mal.

## O ambiente

Todos os exemplos foram compilados e executados com o GnuCOBOL 3.2.0 (cobc 3.2.0, com o GCC 14.2.0), dentro do contentor Docker do módulo 00 (imagem est-cb-gnucobol:estudo). Os ficheiros estão em 01-Primeiros-Programas/exemplos/. O comando, a partir da pasta com os ficheiros .cob (no Git Bash):

    export MSYS_NO_PATHCONV=1
    docker run --rm -v "$(pwd -W)":/work est-cb-gnucobol:estudo sh -c "cobc -x -o ola ola.cob && ./ola"

Nas saídas deste módulo omiti sempre o aviso inofensivo «Warning: program compiled against libxml 212 using older 209», que o contentor escreve a cada execução e não tem a ver com o teu programa.

**NOTA:** daqui em diante escrevo só o comando do cobc (por exemplo cobc -x -o ola ola.cob). Corre-o dentro do contentor, como acima, ou num GnuCOBOL instalado no teu sistema.

## O primeiro programa

O programa COBOL mais pequeno que faz alguma coisa:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. OLA.
           PROCEDURE DIVISION.
               DISPLAY "Ola, loja!".
               STOP RUN.

Compila e executa:

    cobc -x -o ola ola.cob
    ./ola
    Ola, loja!

Cada peça tem o seu papel. IDENTIFICATION DIVISION. abre o programa e PROGRAM-ID. dá-lhe nome. PROCEDURE DIVISION. é onde estão as instruções, e cada instrução (DISPLAY, STOP RUN) acaba num ponto. O texto entre aspas chama-se literal. Está tudo em maiúsculas por tradição: o compilador não distingue maiúsculas de minúsculas.

## As quatro divisões

Um programa COBOL completo tem quatro divisões, sempre por esta ordem:

| Divisão | Para que serve | Obrigatória |
|---|---|---|
| IDENTIFICATION DIVISION | Nome do programa (PROGRAM-ID) | Sim, com PROGRAM-ID |
| ENVIRONMENT DIVISION | Liga o programa ao exterior: ficheiros, configuração | Não |
| DATA DIVISION | Descreve os dados: variáveis, registos, ficheiros | Não |
| PROCEDURE DIVISION | As instruções que o programa executa | Sim |

O ola.cob não tem ENVIRONMENT nem DATA DIVISION e compilou sem problemas: só precisas delas quando tens ficheiros (módulo 04) ou variáveis. Um programa com as quatro divisões, a mostrar o primeiro cliente da loja:

          * Mostra o primeiro cliente da loja (valores escritos a mao).
           IDENTIFICATION DIVISION.
           PROGRAM-ID. CLIENTE.

           ENVIRONMENT DIVISION.

           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-CLI-ID              PIC 9(03)  VALUE 1.
           01  WS-CLI-NOME            PIC X(20)  VALUE "Ana Ribeiro".
           01  WS-CLI-CIDADE          PIC X(10)  VALUE "Lisboa".

           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Cliente numero: " WS-CLI-ID.
               DISPLAY "Nome:           " WS-CLI-NOME.
               DISPLAY "Cidade:         " WS-CLI-CIDADE.
               STOP RUN.

    cobc -x -o cliente cliente.cob
    ./cliente
    Cliente numero: 001
    Nome:           Ana Ribeiro
    Cidade:         Lisboa

Dentro da DATA DIVISION, a WORKING-STORAGE SECTION guarda as variáveis do programa (há outras secções, como a FILE SECTION e a LINKAGE SECTION, que vês nos módulos 04 e 07). Na PROCEDURE DIVISION, PRINCIPAL. é um parágrafo: um nome seguido de ponto, que marca um bloco de instruções. A execução começa na primeira instrução da divisão e desce parágrafo a parágrafo.

**NOTA:** o 001 aparece com zeros à esquerda porque WS-CLI-ID é numérico de 3 dígitos (PIC 9(03)). Os campos alfanuméricos são preenchidos com espaços à direita até ao tamanho declarado: o nome tem 20 posições, mesmo que o texto seja mais curto.

## Formato fixo: as colunas

O COBOL clássico nasceu nos cartões perfurados de 80 colunas, e o formato fixo (o predefinido do cobc) herdou essa disposição. Cada linha tem zonas com significado:

| Colunas | Zona | Papel |
|---|---|---|
| 1 a 6 | Área de sequência | Numeração das linhas; o compilador ignora |
| 7 | Indicador | Marca a linha: comentário, continuação, depuração |
| 8 a 11 | Área A | Divisões, secções, parágrafos e níveis 01 |
| 12 a 72 | Área B | As instruções e o resto das declarações |
| 73 a 80 | Referência | Ignorado pelo compilador em formato fixo |

Por isso as divisões e os parágrafos começam na coluna 8 (sete espaços à esquerda) e as instruções na coluna 12. Uma régua para te orientares, com o ola.cob por baixo (N é a sequência, I o indicador, A e B as áreas):

    Coluna      12345678901234567890123456789012345
    Zonas       NNNNNNIAAAABBBBBBBBBBBBBBBBBBBBBBBB

                       IDENTIFICATION DIVISION.
                       PROGRAM-ID. OLA.
                       PROCEDURE DIVISION.
                           DISPLAY "Ola, loja!".
                           STOP RUN.

**ATENÇÃO:** tudo o que passa da coluna 72 é ignorado em silêncio. Mais abaixo vês um nome de variável cortado a meio por causa disso.

Para veres a área de sequência e as colunas 73 a 80 a serem ignoradas, o numerado.cob usa números nas colunas 1 a 6 e 73 a 80:

    000100 IDENTIFICATION DIVISION.                                         00010000
    000200 PROGRAM-ID. NUMERADO.                                            00020000
    000300 PROCEDURE DIVISION.                                              00030000
    000400* linha de comentario                                             00040000
    000500     DISPLAY "linha normal".                                      00050000
    000600D    DISPLAY "linha de depuracao".                                00060000
    000700     STOP RUN.                                                    00070000

    cobc -x -o numerado numerado.cob
    ./numerado
    linha normal

## O indicador da coluna 7

| Carácter na coluna 7 | Significado |
|---|---|
| espaço | Linha normal |
| asterisco | Comentário: a linha toda é ignorada |
| hífen | Continuação da linha anterior (literais compridos) |
| D | Linha de depuração: só é compilada com a opção -fdebugging-line |

O cliente.cob abre com um comentário (asterisco na coluna 7). Na numerado.cob a linha com D na coluna 7 foi ignorada. Com a opção -fdebugging-line passa a correr:

    cobc -x -fdebugging-line -o numerado numerado.cob
    ./numerado
    linha normal
    linha de depuracao

A continuação serve para um literal que não cabe até à coluna 72. A primeira linha vai até à coluna 72 sem fechar as aspas; a seguinte leva um hífen na coluna 7 e reabre as aspas na área B. O texto continua exatamente onde parou:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. CONTINUA.
           PROCEDURE DIVISION.
          * Uma linha de comentario: asterisco na coluna 7.
           PRINCIPAL.
               DISPLAY "Cliente Ana Ribeiro, de Lisboa, registada em 15 de j
          -    "aneiro de 2024, sem encomendas pendentes.".
               STOP RUN.

    cobc -x -o continua continua.cob
    ./continua
    Cliente Ana Ribeiro, de Lisboa, registada em 15 de janeiro de 2024, sem encomendas pendentes.

## Formato livre

No formato livre não há colunas: escreves onde quiseres e o limite é o fim da linha (255 caracteres, segundo a documentação do GnuCOBOL). Os comentários começam com asterisco seguido de maior, em qualquer ponto da linha. Escolhe-se com a opção -free (ou -F) ou com uma diretiva no início do ficheiro.

    *> Formato livre: compila com  cobc -x -free livre.cob
    identification division.
    program-id. livre.
    data division.
    working-storage section.
    01 ws-nome pic x(20) value "Bruno Costa".
    procedure division.
    principal.
        display "Cliente: " ws-nome. *> comentario no fim da linha
        stop run.

    cobc -x -free -o livre livre.cob
    ./livre
    Cliente: Bruno Costa

A alternativa é a diretiva SOURCE FORMAT FREE na primeira linha do ficheiro (livre-diretiva.cob): compilei-o sem -free e correu.

**ATENÇÃO:** o formato tem de coincidir com o do ficheiro. O cliente.cob (formato fixo, comentário com asterisco na coluna 7) compilado com -free dá erros, porque em formato livre esse asterisco já não é um comentário:

    cobc -x -free -o c2 cliente.cob
    cliente.cob:1: error: PROGRAM-ID header missing
    cliente.cob:1: error: PROCEDURE DIVISION header missing
    cliente.cob:1: error: syntax error, unexpected *

No GnuCOBOL 3.2.0 que usei, ficheiros em formato livre compilados sem -free também funcionaram, porque o compilador os detetou sozinho e avisou com «note: free format detected». Não contes com isso: passa sempre -free (ou usa a diretiva). Já o ola.cob, em formato fixo mas sem comentários na coluna 7, compilou com -free sem problemas.

Neste curso o código é em formato fixo, porque é o que vais encontrar nos sistemas legados. Num projeto novo em GnuCOBOL, o formato livre é perfeitamente aceitável.

## Compilar e executar com o cobc

| Comando | O que faz |
|---|---|
| cobc -x ola.cob | Compila para um executável com o nome do ficheiro (ola) |
| cobc -x -o prog ola.cob | Idem, com o nome prog |
| cobc -x -free ola.cob | Idem, para um ficheiro em formato livre |
| cobc -x -j ola.cob | Compila e executa de seguida |
| cobc -x -Wall ola.cob | Liga os avisos adicionais |
| cobc ola.cob | Sem -x gera um módulo carregável (ola.so), não um executável |
| cobc -x a.cob b.cob | Liga vários ficheiros num só executável |

O -x pede um executável: sem ele, o cobc gera um módulo para ser chamado por outro programa (listando a pasta vi o ficheiro ola.so), assunto do módulo 07.

Os avisos adicionais ligam-se com -Wall. O programa aviso.cob tem uma cláusula AUTHOR e um campo que ninguém usa; o -Wall mostra:

    cobc -x -Wall -o aviso aviso.cob
    aviso.cob:3: warning: AUTHOR is obsolete in GnuCOBOL [-Wobsolete]
        3 >        AUTHOR. CURSO-COBOL.

Sem -Wall este aviso não aparece, e o campo por usar não gerou aviso nenhum. Um aviso (warning) não impede a compilação; um erro (error) sim, e nesse caso não é criado o executável. Usa comentários em vez de AUTHOR.

## DISPLAY e ACCEPT

DISPLAY escreve no ecrã: aceita vários itens (literais e variáveis) numa só instrução e muda de linha no fim. Com WITH NO ADVANCING não muda de linha, o que dá jeito para mostrar uma pergunta. ACCEPT lê uma linha do teclado para uma variável.

           IDENTIFICATION DIVISION.
           PROGRAM-ID. ACEITAR.

           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-NOME                PIC X(20).
           01  WS-CIDADE              PIC X(10).

           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Nome do cliente: " WITH NO ADVANCING.
               ACCEPT WS-NOME.
               DISPLAY "Cidade: " WITH NO ADVANCING.
               ACCEPT WS-CIDADE.
               DISPLAY "Registado: [" WS-NOME "] de [" WS-CIDADE "]".
               STOP RUN.

Em vez de escreveres no teclado, alimenta o programa por pipe, como nos testes automáticos:

    cobc -x -o aceitar aceitar.cob
    (echo Carla Mendes; echo Braga) | ./aceitar
    Nome do cliente: Cidade: Registado: [Carla Mendes        ] de [Braga     ]

Tudo aparece na mesma linha porque, num pipe, o que «escreveste» não é mostrado no ecrã e por isso não há mudança de linha depois de cada pergunta. Num terminal verias as tuas respostas. Os parênteses retos mostram o preenchimento com espaços: o nome tem 20 posições e a cidade 10.

Se a entrada acabar antes do esperado (executei ./aceitar < /dev/null), o ACCEPT não dá erro: as variáveis ficam com espaços.

    Nome do cliente: Cidade: Registado: [                    ] de [          ]

## STOP RUN e GOBACK

Ambas terminam o programa. Num programa principal fazem o mesmo; a diferença aparece quando um programa chama outro (módulo 07). O GOBACK devolve o controlo a quem chamou; o STOP RUN termina a execução inteira. O principal.cob chama dois subprogramas, um que acaba com GOBACK e outro com STOP RUN:

    cobc -x -o principal principal.cob subgoback.cob substop.cob
    ./principal
    principal: vou chamar SUBGOBACK
      subgoback: a devolver o controlo
    principal: voltei de SUBGOBACK
    principal: vou chamar SUBSTOP
      substop: STOP RUN no subprograma

Nunca apareceu «voltei de SUBSTOP»: o STOP RUN no subprograma terminou o programa todo. Por isso, em programas que podem ser chamados por outros usa GOBACK; no programa principal, qualquer um serve.

O GOBACK num programa principal também devolve o RETURN-CODE ao sistema operativo. O sair.cob faz MOVE 3 TO RETURN-CODE e termina com GOBACK; no shell, o echo mostra o código de saída (0 é sucesso):

    cobc -x -o sair sair.cob
    ./sair
    A terminar com codigo 3
    echo $?
    3

Se esqueceres o STOP RUN, o programa terminou na mesma no fim da PROCEDURE DIVISION, com código 0 (testei com o sem-stop, um programa só com um DISPLAY). Escreve-o sempre: torna a intenção explícita.

## Variáveis de WORKING-STORAGE

Só o essencial; o detalhe é do módulo 02. Cada variável declara-se com um nível (01), um nome, um PICTURE (PIC), que diz o tipo e o tamanho, e opcionalmente um VALUE com o valor inicial:

| PIC | Significado | Exemplo |
|---|---|---|
| X(20) | 20 caracteres quaisquer | PIC X(20) VALUE "Ana Ribeiro" |
| 9(03) | Número de 3 dígitos | PIC 9(03) VALUE 1 |

Os tamanhos são os do ficheiro clientes.dat da loja: ID 9(03), NOME X(20), CIDADE X(10). Sem VALUE não contes com um valor inicial: carrega a variável (com ACCEPT, por exemplo) antes de a usar, como faz o aceitar.cob.

## O ponto final

O ponto termina uma frase COBOL. Dentro de um parágrafo podes ter várias instruções sem ponto entre elas; o ponto marca o fim do parágrafo e o fim de cada entrada da DATA DIVISION, e os cabeçalhos das divisões também o levam. O pontos.cob tem três DISPLAY, só o último com ponto, e um segundo parágrafo:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. PONTOS.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-NOME                PIC X(20)  VALUE "Ana Ribeiro".
           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Linha 1"
               DISPLAY WS-NOME
               DISPLAY "Linha 3".
           SEGUNDO.
               DISPLAY "Estou no paragrafo SEGUNDO".
               STOP RUN.

    cobc -x -o pontos pontos.cob
    ./pontos
    Linha 1
    Ana Ribeiro
    Linha 3
    Estou no paragrafo SEGUNDO

Repara que a execução passou do parágrafo PRINCIPAL para o SEGUNDO sozinha: o COBOL não pára no fim de um parágrafo, continua no seguinte, e só pára numa instrução como STOP RUN (o módulo 03 mostra como controlar isto). Um ponto no sítio errado, no meio de um IF por exemplo, muda o significado do programa, o que também fica para o módulo 03.

## Erros de compilação típicos

Todos os erros abaixo foram produzidos pelos ficheiros da pasta exemplos cujo nome começa por erro. A mensagem do cobc diz o ficheiro, a linha e o tipo (error ou warning), e mostra o código com um sinal «>» na linha apontada. A linha apontada é aquela onde o compilador percebeu o problema, que pode ser a seguinte à do erro.

**Ponto final em falta numa declaração** (erro-ponto.cob). Falta o ponto no fim da linha 5:

    cobc -x -o erro-ponto erro-ponto.cob
    erro-ponto.cob:6: error: syntax error, unexpected Identifier
        4 |        WORKING-STORAGE SECTION.
        5 |        01  WS-NOME                PIC X(20)  VALUE "Ana Ribeiro"
        6 >        01  WS-CIDADE              PIC X(10)  VALUE "Lisboa".
        7 |        PROCEDURE DIVISION.
        8 |        PRINCIPAL.

O erro é apontado à linha 6, não à 5: o compilador só percebe que a entrada anterior não acabou quando encontra o 01 seguinte. Olha sempre para a linha de cima.

**Ponto final em falta no fim de um parágrafo** (erro-ponto2.cob). Falta o ponto depois do último DISPLAY de PRINCIPAL, e o nome do parágrafo seguinte é lido como se fosse mais um operando:

    cobc -x -o erro-ponto2 erro-ponto2.cob
    erro-ponto2.cob: in paragraph 'PRINCIPAL':
    erro-ponto2.cob:10: error: 'FIM' is not defined
        8 |            DISPLAY "A mostrar o cliente"
        9 |            DISPLAY WS-NOME
       10 >        FIM.
       11 |            STOP RUN.

A mensagem fala em «FIM is not defined» e não em pontos: o erro real está na linha de cima. Compilando o mesmo ficheiro com -fformat=cobol85 (um formato fixo com verificação das áreas A e B), o compilador recupera e só avisa «optional period used [-Wdialect]»; executei-o, mas não verifiquei tudo o que esse formato impõe: confirma na documentação.

Faltar o ponto no fim do programa (erro-rodape.cob) é só um aviso, «optional period used [-Wdialect]»: o programa compilou e correu.

**Coluna errada, à esquerda** (erro-col1.cob). Uma instrução escrita desde a coluna 1 põe a sétima letra de DISPLAY na coluna 7:

    erro-col1.cob:8: error: invalid indicator 'Y' at column 7
        8 > DISPLAY WS-NOME.

O indicador 'Y' é o Y final de DISPLAY: as seis primeiras letras caíram na área de sequência.

**ATENÇÃO:** se o DISPLAY começar na coluna 7 (seis espaços à esquerda), o D é lido como indicador de depuração e a linha é ignorada em silêncio: o erro-col7.cob compilou sem erro nem aviso, correu com código 0 e não escreveu nada. Se o programa «não faz nada», conta as colunas.

**Coluna errada, à direita** (erro-col73.cob). Uma palavra que passa da coluna 72 fica cortada:

    erro-col73.cob:9: error: 'EXTR' is not defined
        9 >                                                                     EXTRA..

O nome escrito era EXTRAFORA; só as 4 primeiras letras estavam dentro da coluna 72. Se vires um nome estranho, truncado, desconfia do limite da coluna 72.

**Nome de parágrafo ou de variável errado** (erro-paragrafo.cob e erro-nome.cob):

    erro-paragrafo.cob:9: error: 'MOSTAR' is not defined
        9 >            PERFORM MOSTAR.

    erro-nome.cob:8: error: 'WS-NOMES' is not defined
        8 >            DISPLAY WS-NOMES.

«is not defined» quer dizer que escreveste um nome que não existe: quase sempre é uma gralha. O PERFORM, que chama um parágrafo, vê-lo-ás no módulo 03.

Sem PROGRAM-ID (erro-prog.cob) o erro é «syntax error, unexpected PROCEDURE, expecting FUNCTION-ID or PROGRAM-ID».

**DICA:** quando há vários erros, corrige só o primeiro e volta a compilar: os seguintes são muitas vezes consequências dele.

**Áreas A e B.** No GnuCOBOL 3.2.0, em formato fixo, não deu erro um 01 e um parágrafo deslocados dois espaços (erro-area.cob compilou e correu). Não contes com o compilador para te impor as áreas: cumpre-as tu, porque noutros compiladores pode ser erro.

## Nomes e palavras reservadas

Os nomes de variáveis, parágrafos e programas seguem regras simples. Testei cada uma no GnuCOBOL 3.2.0:

| Regra | Resultado observado |
|---|---|
| Letras, dígitos e hífens | WS-CLI-NOME é válido |
| Maiúsculas e minúsculas são iguais | cliente-nome e CLIENTE-NOME são o mesmo campo |
| Não pode acabar em hífen | WS-CLI- deu «syntax error, unexpected -» |
| Não pode ser só dígitos | 123 deu «syntax error, unexpected Literal» |
| Pode começar por dígito se tiver letras | 1-CLIENTE compilou e correu |
| Tamanho | Aceitou 40 caracteres; o limite do COBOL padrão é menor, confirma na documentação |
| Sublinhado | WS_NOME compilou, mas é extensão do GnuCOBOL: usa o hífen |

Usa nomes com prefixo (WS- para WORKING-STORAGE) e o hífen como separador: é a convenção. As palavras reservadas são as que a linguagem usa e não podes usá-las como nome. A lista do teu compilador obtém-se com cobc --list-reserved (mais de mil linhas). Algumas que parecem inocentes: DATE, DAY, TIME, COUNT, STATUS, VALUE, KEY, TEXT, LINE, SIZE, NUMBER, END, DATA e ID. O NAME é reservado «dependente do contexto». TOTAL e CLIENTE não são reservadas. O erro de usar uma (erro-reservada.cob, com 01 DATA PIC 9(08)):

    erro-reservada.cob:5: error: syntax error, unexpected DATA
        5 >        01  DATA                   PIC 9(08)  VALUE 20240115.

**NOTA:** o IBM Enterprise COBOL do mainframe z/OS compila-se e corre-se através de JCL; não executei nada fora do GnuCOBOL e remeto-te para a documentação da IBM (não executado). O módulo 09 trata do COBOL no mundo real.

**DICA:** com o prefixo WS- (WS-DATA-REGISTO) quase nunca colides com uma palavra reservada. Se um nome razoável der «syntax error» sem razão aparente, procura-o em cobc --list-reserved.

## Exercícios

**PRATICAR:** faz os exercícios 1 a 4 do módulo de exercícios (11-Exercicios-Praticos), compilando e executando cada um com o cobc.

## Fontes oficiais

- GnuCOBOL, página do projeto: https://gnucobol.sourceforge.io/
- GnuCOBOL Programmer's Guide (compilar, formatos de fonte, opções do cobc): https://gnucobol.sourceforge.io/doc/gnucobol.html
- GnuCOBOL, guias e documentação: https://gnucobol.sourceforge.io/guides.html
- IBM Enterprise COBOL for z/OS 6.4, documentação (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4
