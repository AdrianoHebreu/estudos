      *> TABELAS.COB - REDEFINES, OCCURS, subscritos e indices
       IDENTIFICATION DIVISION.
       PROGRAM-ID. TABELAS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
      *> REDEFINES: a mesma memoria vista de duas formas
       01  CLI-DATA-REGISTO    PIC 9(08) VALUE 20240115.
       01  CLI-DATA-PARTES REDEFINES CLI-DATA-REGISTO.
           05  CLI-ANO         PIC 9(04).
           05  CLI-MES         PIC 9(02).
           05  CLI-DIA         PIC 9(02).
      *> Tabela de nomes dos meses: valores + REDEFINES + OCCURS
       01  MESES-VALORES.
           05  FILLER          PIC X(09) VALUE "Janeiro".
           05  FILLER          PIC X(09) VALUE "Fevereiro".
           05  FILLER          PIC X(09) VALUE "Marco".
           05  FILLER          PIC X(09) VALUE "Abril".
           05  FILLER          PIC X(09) VALUE "Maio".
           05  FILLER          PIC X(09) VALUE "Junho".
           05  FILLER          PIC X(09) VALUE "Julho".
           05  FILLER          PIC X(09) VALUE "Agosto".
           05  FILLER          PIC X(09) VALUE "Setembro".
           05  FILLER          PIC X(09) VALUE "Outubro".
           05  FILLER          PIC X(09) VALUE "Novembro".
           05  FILLER          PIC X(09) VALUE "Dezembro".
       01  TAB-MESES REDEFINES MESES-VALORES.
           05  NOME-MES        PIC X(09) OCCURS 12 TIMES.
      *> Tabela das categorias da loja, indexada
       01  TAB-CATEGORIAS.
           05  CATEGORIA OCCURS 3 TIMES INDEXED BY IX-CAT.
               10  CAT-ID      PIC 9(02).
               10  CAT-NOME    PIC X(15).
       01  WS-SUBSCRITO        PIC 9(02).
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "Data: " CLI-DATA-REGISTO
           DISPLAY "Ano=" CLI-ANO " Mes=" CLI-MES " Dia=" CLI-DIA
           DISPLAY "Registou-se em " CLI-DIA " de "
                   NOME-MES(CLI-MES) "de " CLI-ANO
           DISPLAY "Tamanho de TAB-MESES: " FUNCTION LENGTH(TAB-MESES)
                   " bytes; de um mes: " FUNCTION LENGTH(NOME-MES(1))
           MOVE 01 TO CAT-ID(1)
           MOVE "Livros" TO CAT-NOME(1)
           MOVE 02 TO CAT-ID(2)
           MOVE "Eletronica" TO CAT-NOME(2)
           MOVE 03 TO CAT-ID(3)
           MOVE "Casa" TO CAT-NOME(3)
           DISPLAY "--- Subscrito numerico ---"
           PERFORM VARYING WS-SUBSCRITO FROM 1 BY 1
                   UNTIL WS-SUBSCRITO > 3
               DISPLAY WS-SUBSCRITO ": " CAT-ID(WS-SUBSCRITO) " "
                       CAT-NOME(WS-SUBSCRITO)
           END-PERFORM
           DISPLAY "--- Indice (INDEXED BY, SET) ---"
           SET IX-CAT TO 1
           DISPLAY "Primeira: " CAT-NOME(IX-CAT)
           SET IX-CAT UP BY 2
           DISPLAY "Depois de UP BY 2: " CAT-NOME(IX-CAT)
           SET IX-CAT DOWN BY 1
           DISPLAY "Depois de DOWN BY 1: " CAT-NOME(IX-CAT)
           SET WS-SUBSCRITO TO IX-CAT
           DISPLAY "Posicao do indice como numero: " WS-SUBSCRITO
           STOP RUN.
