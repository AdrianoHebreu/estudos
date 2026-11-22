      *> AVALIAR.COB - EVALUATE: valor, lista, THRU, TRUE, ALSO
       IDENTIFICATION DIVISION.
       PROGRAM-ID. AVALIAR.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  ENC-ESTADO          PIC X(10)    VALUE "enviada".
       01  PRO-CATEGORIA       PIC 9(02)    VALUE 2.
       01  PRO-STOCK           PIC 9(05)    VALUE 15.
       01  PRO-PRECO           PIC 9(05)V99 VALUE 49.90.
       01  NOME-CAT            PIC X(15).
       01  MENSAGEM            PIC X(30).
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "--- EVALUATE como switch ---"
           EVALUATE PRO-CATEGORIA
               WHEN 1
                   MOVE "Livros" TO NOME-CAT
               WHEN 2
                   MOVE "Eletronica" TO NOME-CAT
               WHEN 3
                   MOVE "Casa" TO NOME-CAT
               WHEN OTHER
                   MOVE "(desconhecida)" TO NOME-CAT
           END-EVALUATE
           DISPLAY "Categoria " PRO-CATEGORIA ": " NOME-CAT
           DISPLAY "--- Varios valores no mesmo WHEN ---"
           EVALUATE ENC-ESTADO
               WHEN "pendente"
               WHEN "enviada"
                   MOVE "em curso" TO MENSAGEM
               WHEN "entregue"
               WHEN "cancelada"
                   MOVE "fechada" TO MENSAGEM
               WHEN OTHER
                   MOVE "estado invalido" TO MENSAGEM
           END-EVALUATE
           DISPLAY "Estado " ENC-ESTADO ": " MENSAGEM
           DISPLAY "--- Intervalos com THRU ---"
           EVALUATE PRO-STOCK
               WHEN 0
                   DISPLAY "stock " PRO-STOCK ": esgotado"
               WHEN 1 THRU 19
                   DISPLAY "stock " PRO-STOCK ": baixo"
               WHEN 20 THRU 99999
                   DISPLAY "stock " PRO-STOCK ": normal"
           END-EVALUATE
           DISPLAY "--- EVALUATE TRUE ---"
           EVALUATE TRUE
               WHEN PRO-STOCK = 0
                   DISPLAY "esgotado"
               WHEN PRO-STOCK < 20 AND PRO-PRECO > 40
                   DISPLAY "stock baixo num produto caro"
               WHEN PRO-STOCK < 20
                   DISPLAY "stock baixo"
               WHEN OTHER
                   DISPLAY "stock normal"
           END-EVALUATE
           DISPLAY "--- Sem break: so corre o primeiro WHEN ---"
           EVALUATE TRUE
               WHEN PRO-STOCK > 0
                   DISPLAY "primeiro WHEN (stock > 0)"
               WHEN PRO-STOCK > 10
                   DISPLAY "este nao corre, apesar de ser verdade"
           END-EVALUATE
           DISPLAY "--- Dois sujeitos com ALSO ---"
           EVALUATE PRO-CATEGORIA ALSO TRUE
               WHEN 1 ALSO PRO-STOCK = 0
                   DISPLAY "livro esgotado"
               WHEN 2 ALSO PRO-STOCK < 20
                   DISPLAY "eletronica com stock baixo"
               WHEN OTHER
                   DISPLAY "nenhum caso especial"
           END-EVALUATE
           STOP RUN.
