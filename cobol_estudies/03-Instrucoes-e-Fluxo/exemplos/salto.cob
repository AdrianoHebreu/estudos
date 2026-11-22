      *> SALTO.COB - GO TO: ciclo com saltos e ciclo estruturado
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SALTO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  I                   PIC 9(02)    VALUE ZERO.
       01  OPCAO               PIC 9        VALUE 2.
       01  PRO-STOCK           PIC 9(05)    VALUE 12.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "--- Ciclo com GO TO ---"
           MOVE 1 TO I.
       CICLO.
           IF I > 3
               GO TO FIM-CICLO
           END-IF
           DISPLAY "volta " I
           ADD 1 TO I
           GO TO CICLO.
       FIM-CICLO.
           DISPLAY "--- O mesmo ciclo com PERFORM ---"
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 3
               DISPLAY "volta " I
           END-PERFORM
           DISPLAY "--- GO TO DEPENDING ON ---"
           GO TO ACAO-1 ACAO-2 ACAO-3 DEPENDING ON OPCAO.
           DISPLAY "opcao fora de 1 a 3: segue em frente".
           GO TO FIM-ESCOLHA.
       ACAO-1.
           DISPLAY "acao 1"
           GO TO FIM-ESCOLHA.
       ACAO-2.
           DISPLAY "acao 2"
           GO TO FIM-ESCOLHA.
       ACAO-3.
           DISPLAY "acao 3"
           GO TO FIM-ESCOLHA.
       FIM-ESCOLHA.
           DISPLAY "--- GO TO para a saida de um PERFORM THRU ---"
           PERFORM VALIDAR THRU VALIDAR-SAIDA
           STOP RUN.
       VALIDAR.
           IF PRO-STOCK = 0
               DISPLAY "sem stock: nada a validar"
               GO TO VALIDAR-SAIDA
           END-IF
           DISPLAY "stock " PRO-STOCK ": a validar o resto".
       VALIDAR-SAIDA.
           EXIT.
