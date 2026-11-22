      * Subprograma em estilo "funcao": o resultado vai num parametro
      * de saida e o estado da operacao em RETURN-CODE.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. DOBRO.
       DATA DIVISION.
       LINKAGE SECTION.
       01  LK-N                   PIC 9(04).
       01  LK-RES                 PIC 9(05).
       PROCEDURE DIVISION USING LK-N LK-RES.
           IF LK-N > 5000
               MOVE 0 TO LK-RES
               MOVE 8 TO RETURN-CODE
           ELSE
               COMPUTE LK-RES = LK-N * 2
               MOVE 0 TO RETURN-CODE
           END-IF.
           GOBACK.
