# 12 Consulta rápida

Uma página para consultar no dia a dia. Tudo o que aparece foi executado no curso com o GnuCOBOL 3.2.0 em Docker. O COBOL de mainframe (IBM Enterprise COBOL, JCL, CICS, Db2) não foi executado, e onde difere deve confirmar-se na documentação do compilador. Para o detalhe, vê o módulo indicado.

## Compilar e executar (módulos 00 e 01)

| Tarefa | Comando |
|---|---|
| Programa executável | cobc -x -o prog prog.cob |
| Formato livre | cobc -x -free prog.cob |
| Subprograma (módulo) | cobc -m sub.cob |
| Verificações em execução | cobc -x -debug prog.cob |
| Todos os avisos | cobc -x -Wall prog.cob |
| Procurar copybooks | cobc -x -I pasta prog.cob |
| Ver o C gerado | cobc -C prog.cob |
| Informação do compilador | cobc --info |

## Colunas do formato fixo (módulo 01)

| Colunas | Para quê |
|---|---|
| 1 a 6 | Numeração (ignorada) |
| 7 | Indicador: asterisco é comentário, D é linha de depuração, hífen é continuação |
| 8 a 11 | Área A: divisões, secções, parágrafos, níveis 01 e 77 |
| 12 a 72 | Área B: instruções e restantes níveis |
| depois da 72 | Cortado em silêncio |

**ATENÇÃO:** um DISPLAY a começar na coluna 7 compila sem erro e não escreve nada, porque o D é lido como linha de depuração. O texto para lá da coluna 72 desaparece sem aviso.

## As quatro divisões (módulo 01)

| Divisão | Conteúdo |
|---|---|
| IDENTIFICATION | PROGRAM-ID |
| ENVIRONMENT | SELECT dos ficheiros e configuração |
| DATA | FILE SECTION, WORKING-STORAGE, LINKAGE |
| PROCEDURE | As instruções, em parágrafos |

## Dados e PICTURE (módulo 02)

| Símbolo | Significado |
|---|---|
| 9 | Dígito |
| X | Qualquer carácter |
| A | Letra |
| S | Sinal |
| V | Vírgula decimal implícita (não ocupa espaço no ficheiro) |
| (n) | Repetição, por exemplo 9(05) |

| Nível | Uso |
|---|---|
| 01 | Registo ou grupo de topo |
| 02 a 49 | Subordinados |
| 77 | Item independente |
| 88 | Condição (nome para um valor) |

| USAGE | Nota |
|---|---|
| DISPLAY | Texto, um byte por dígito |
| COMP ou BINARY | Binário |
| COMP-3 | Decimal empacotado |
| COMP-2 | Vírgula flutuante: nunca para dinheiro |

**Regra:** o dinheiro guarda-se em decimal. Somar 0,1 dez vezes em vírgula flutuante deu 0.9999999999999998.

## Instruções e fluxo (módulo 03)

| Tarefa | Instrução |
|---|---|
| Copiar valores | MOVE origem TO destino |
| Calcular | COMPUTE, ADD, SUBTRACT, MULTIPLY, DIVIDE (com ROUNDED e ON SIZE ERROR) |
| Decidir | IF ... ELSE ... END-IF e EVALUATE ... WHEN ... END-EVALUATE |
| Repetir | PERFORM parágrafo, TIMES, UNTIL, VARYING, e inline com END-PERFORM |

| Comportamento medido | Resultado |
|---|---|
| ADD 1 a um PIC 99 que vale 99, sem SIZE ERROR | Fica 00 em silêncio |
| O mesmo com SIZE ERROR | O destino fica intacto |
| DIVIDE por zero sem SIZE ERROR | O destino não muda e o código de saída é 0 |
| MOVE de letras para um campo numérico | Fica 00000, sem erro |
| MOVE de número com decimais para um campo X | Erro de compilação |
| ROUNDED por omissão e NEAREST-EVEN, com 2,5 | 3 e 2 |

## Ficheiros sequenciais (módulo 04)

| Elemento | Nota |
|---|---|
| SELECT f ASSIGN TO nome | Liga o ficheiro lógico ao ficheiro real |
| ORGANIZATION IS LINE SEQUENTIAL | Uma linha por registo; corta os espaços finais ao escrever |
| FILE STATUS IS campo | O código do resultado de cada operação |
| OPEN INPUT, OUTPUT, EXTEND, I-O | Só o OUTPUT cria o ficheiro; EXTEND num inexistente dá 35 |
| READ f AT END ... | Fim do ficheiro |
| WRITE reg FROM área | Grava a partir de uma área de trabalho |

| FILE STATUS | Significado |
|---|---|
| 00 | Correto |
| 10 | Fim do ficheiro |
| 21 | Chave fora de ordem |
| 22 | Chave duplicada |
| 23 | Registo não existe |
| 30 | Erro permanente (por exemplo, pasta inexistente) |
| 35 | Ficheiro não existe |

**ATENÇÃO:** sem FILE STATUS, um OPEN de um ficheiro inexistente termina o programa com «libcob: error: file does not exist (status = 35)» e código de saída 1.

**Cuidados:** cada letra acentuada em UTF-8 ocupa 2 bytes e desalinha os registos de largura fixa. O CRLF é removido na leitura LINE SEQUENTIAL, mas lido como SEQUENTIAL desalinha os registos.

## Relatórios e texto (módulo 05)

| Edição | Efeito |
|---|---|
| Z | Suprime zeros à esquerda |
| * | Preenche com asteriscos |
| . e , | Ponto e vírgula decimais (com DECIMAL-POINT IS COMMA, trocam) |
| B, 0, / | Insere espaço, zero ou barra |
| + e - | Sinal |
| CR e DB | Crédito e débito |
| símbolo de moeda | Com CURRENCY SIGN IS "#" funciona; com "E" deu erro |

| Texto | Instrução |
|---|---|
| Juntar | STRING ... DELIMITED BY ... INTO destino (não limpa o destino) |
| Separar | UNSTRING origem DELIMITED BY ... INTO ... |
| Contar e substituir | INSPECT ... TALLYING, REPLACING, CONVERTING |
| Parte de um campo | campo(inicio:comprimento) |
| Funções | UPPER-CASE, TRIM, LENGTH, CURRENT-DATE, INTEGER-OF-DATE, NUMVAL |

## Ficheiros indexados e ordenação (módulo 06)

| Elemento | Nota |
|---|---|
| ORGANIZATION IS INDEXED | Com RECORD KEY e, se for preciso, ALTERNATE RECORD KEY WITH DUPLICATES |
| ACCESS MODE | SEQUENTIAL, RANDOM ou DYNAMIC |
| READ f KEY IS chave | Leitura por chave (INVALID KEY se não existir) |
| START f KEY IS = ou > ou >= | Posiciona; depois READ NEXT |
| WRITE, REWRITE, DELETE | Inserir, atualizar e apagar |
| SORT com USING e GIVING | Ordena um ficheiro; com INPUT e OUTPUT PROCEDURE usa RELEASE e RETURN |
| MERGE | Junta ficheiros já ordenados |

**NOTA:** no GnuCOBOL 3.2.0, `cobc --info` indica o gestor de ficheiros indexados BDB. Uma chave alternativa cria um segundo ficheiro de índice.

## Subprogramas e copybooks (módulo 07)

| Tarefa | Como |
|---|---|
| Chamar | CALL "SUB" USING a b |
| Receber | LINKAGE SECTION e PROCEDURE DIVISION USING |
| Modo de passagem | BY REFERENCE (por omissão), BY CONTENT (uma cópia), BY VALUE (compila com aviso) |
| Terminar o subprograma | GOBACK (EXIT PROGRAM no programa principal não faz nada) |
| Copybook | COPY nome. e COPY nome REPLACING ... |

**ATENÇÃO:** o compilador não confere os parâmetros entre programas. Um tipo errado dá lixo em silêncio e um tamanho errado escreve no campo vizinho. Com -debug o erro aparece. O ficheiro do módulo tem de ter o nome do PROGRAM-ID. PROCEDURE DIVISION RETURNING no subprograma não está implementado (aviso e falha de segmentação); o CALL ... RETURNING no chamador funciona.

## Erros e depuração (módulo 08)

| Tarefa | Como |
|---|---|
| Saber o que correu mal | FILE STATUS em todos os ficheiros e uma rotina central de erros |
| Tratar o estado de um ficheiro de forma central | DECLARATIVES com USE AFTER STANDARD ERROR PROCEDURE |
| Código de saída para o shell | MOVE n TO RETURN-CODE |
| Rastrear | DISPLAY de rastreio ou linhas D com -fdebugging-line |
| Verificações em execução | cobc -debug (subscritos, referências, parâmetros) |
| Ver bytes | DISPLAY em hexadecimal (FUNCTION HEX-OF) |

**Cuidado:** um ACCEPT para um PIC 9(03) aceita texto como «5A» sem erro. Valida com um REDEFINES alfanumérico e IF NUMERIC.

## COBOL no mundo real (módulo 09)

| Tema | Nota |
|---|---|
| EBCDIC e ASCII | A tabela por omissão do GnuCOBOL difere do CP037 nos símbolos [ ] ^ e a barra vertical; nas letras e dígitos coincide |
| COMP-3 | Um programa COBOL gerou-o e o Python leu-o |
| JSON e XML | JSON GENERATE e XML GENERATE compilam no 3.2.0 |
| C | CALL de uma função em C, e C ou Python a chamar COBOL |
| SQL embebido, JCL, CICS, Db2 | Não executados: ver a documentação do compilador |

## Erros comuns

| Erro | Consequência |
|---|---|
| Ultrapassar a coluna 72 | O resto é cortado em silêncio |
| DISPLAY na coluna 7 | É ignorado (linha de depuração) |
| Esquecer o ponto final | Um aviso, mas pode mudar o sentido |
| Estouro sem SIZE ERROR | Trunca em silêncio |
| Não usar FILE STATUS | O programa termina com um erro seco |
| Dinheiro em COMP-2 | Erros de arredondamento |
| Dados acentuados em PIC X | Registos desalinhados (2 bytes por letra) |

## Exercícios

**PRATICAR:** usa esta página para resolver os exercícios do módulo 11 sem abrir a documentação.

## Fontes oficiais

- [Manual de programação do GnuCOBOL](https://gnucobol.sourceforge.io/doc/gnucobol.html)
- [FAQ do GnuCOBOL](https://gnucobol.sourceforge.io/faq/index.html)
- [Documentação do IBM Enterprise COBOL para z/OS](https://www.ibm.com/docs/en/cobol-zos/6.4)
