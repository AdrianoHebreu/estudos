      *> LEGIVEL.COB - IF aninhado contra EVALUATE, dois estilos
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LEGIVEL.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       78  LIMITE-ENVIO-GRATIS     VALUE 50.
       01  WS-VALOR                PIC 9(04) VALUE 35.
       01  WS-TIPO                 PIC X(10).
           88  TIPO-PEQUENO        VALUE "pequeno".
       PROCEDURE DIVISION.
       PRINCIPAL.
           IF WS-VALOR = 0
               MOVE "vazio" TO WS-TIPO
           ELSE
               IF WS-VALOR < 20
                   MOVE "pequeno" TO WS-TIPO
               ELSE
                   IF WS-VALOR < LIMITE-ENVIO-GRATIS
                       MOVE "medio" TO WS-TIPO
                   ELSE
                       MOVE "grande" TO WS-TIPO
                   END-IF
               END-IF
           END-IF
           DISPLAY "IF aninhado: " WS-TIPO
           EVALUATE TRUE
               WHEN WS-VALOR = 0
                   MOVE "vazio" TO WS-TIPO
               WHEN WS-VALOR < 20
                   MOVE "pequeno" TO WS-TIPO
               WHEN WS-VALOR < LIMITE-ENVIO-GRATIS
                   MOVE "medio" TO WS-TIPO
               WHEN OTHER
                   MOVE "grande" TO WS-TIPO
           END-EVALUATE
           DISPLAY "EVALUATE:    " WS-TIPO
           IF TIPO-PEQUENO
               DISPLAY "e pequeno"
           END-IF
           STOP RUN.
