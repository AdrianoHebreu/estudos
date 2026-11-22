      *> CONDICOES.COB - IF, comparacoes, classe, nivel 88, AND/OR/NOT
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CONDICOES.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  PRO-STOCK           PIC 9(05)    VALUE 15.
           88  SEM-STOCK                    VALUE 0.
           88  STOCK-BAIXO                  VALUE 1 THRU 19.
           88  STOCK-NORMAL                 VALUE 20 THRU 99999.
       01  PRO-CATEGORIA       PIC 9(02)    VALUE 1.
       01  PRO-PRECO           PIC 9(05)V99 VALUE 49.90.
       01  PRECO-TXT           PIC 9(03)V9  VALUE 49.9.
       01  CIDADE-1            PIC X(10)    VALUE "Lisboa".
       01  CIDADE-2            PIC X(06)    VALUE "Lisboa".
       01  CIDADE-3            PIC X(06)    VALUE "lisboa".
       01  TXT-A               PIC X(02)    VALUE "9 ".
       01  TXT-B               PIC X(02)    VALUE "10".
       01  NUM-A               PIC 9(02)    VALUE 9.
       01  NUM-B               PIC 9(02)    VALUE 10.
       01  CODIGO              PIC X(04)    VALUE "12A4".
       01  CODIGO-OK           PIC X(04)    VALUE "1204".
       01  NOME-OK             PIC X(10)    VALUE "Ana Maria".
       01  NOME-MAU            PIC X(10)    VALUE "Bloco 7".
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "--- IF / ELSE ---"
           IF PRO-STOCK > 0
               DISPLAY "Ha stock: " PRO-STOCK
           ELSE
               DISPLAY "Sem stock"
           END-IF
           DISPLAY "--- Condicoes de nivel 88 ---"
           IF SEM-STOCK
               DISPLAY "classe: sem stock"
           ELSE
               IF STOCK-BAIXO
                   DISPLAY "classe: stock baixo"
               ELSE
                   DISPLAY "classe: stock normal"
               END-IF
           END-IF
           IF NOT SEM-STOCK
               DISPLAY "NOT SEM-STOCK e verdadeiro"
           END-IF
           DISPLAY "--- Comparacoes ---"
           IF PRO-PRECO = PRECO-TXT
               DISPLAY "49.90 = 49.9: numeros comparam-se pelo valor"
           END-IF
           IF CIDADE-1 = CIDADE-2
               DISPLAY "X(10) = X(06) com o mesmo texto: iguais"
           END-IF
           IF CIDADE-2 NOT = CIDADE-3
               DISPLAY "Lisboa e lisboa: diferentes (maiusculas)"
           END-IF
           IF TXT-A > TXT-B
               DISPLAY "texto: 9 e maior que 10"
           END-IF
           IF NUM-A < NUM-B
               DISPLAY "numero: 9 e menor que 10"
           END-IF
           DISPLAY "--- Condicoes de classe ---"
           IF CODIGO IS NUMERIC
               DISPLAY "12A4 e numerico"
           ELSE
               DISPLAY "12A4 NAO e numerico"
           END-IF
           IF CODIGO-OK IS NUMERIC
               DISPLAY "1204 e numerico"
           END-IF
           IF NOME-OK IS ALPHABETIC
               DISPLAY "Ana Maria e alfabetico (espacos contam)"
           END-IF
           IF NOME-MAU IS NOT ALPHABETIC
               DISPLAY "Bloco 7 NAO e alfabetico"
           END-IF
           DISPLAY "--- AND, OR, NOT ---"
           IF PRO-CATEGORIA = 1 OR PRO-CATEGORIA = 2 AND SEM-STOCK
               DISPLAY "sem parenteses: verdadeiro"
           ELSE
               DISPLAY "sem parenteses: falso"
           END-IF
           IF (PRO-CATEGORIA = 1 OR PRO-CATEGORIA = 2) AND SEM-STOCK
               DISPLAY "com parenteses: verdadeiro"
           ELSE
               DISPLAY "com parenteses: falso"
           END-IF
           IF PRO-STOCK > 0 AND < 20
               DISPLAY "condicao abreviada: entre 1 e 19"
           END-IF
           IF PRO-CATEGORIA = 1 OR 2
               DISPLAY "condicao abreviada: categoria 1 ou 2"
           END-IF
           IF NOT (PRO-STOCK > 0 AND PRO-PRECO > 100)
               DISPLAY "NOT de uma condicao composta"
           END-IF
           STOP RUN.
