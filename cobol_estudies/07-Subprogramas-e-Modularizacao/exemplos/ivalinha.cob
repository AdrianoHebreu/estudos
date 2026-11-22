      * Valida uma linha e calcula o total sem IVA e com IVA.
      * RETURN-CODE: 0 = ok, 4 = quantidade ou preco a zero.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. IVALINHA.
       DATA DIVISION.
       LINKAGE SECTION.
           COPY "pariva.cpy".
       PROCEDURE DIVISION USING PAR-LINHA.
       PRINCIPAL.
           MOVE ZEROS TO PAR-SEM-IVA PAR-COM-IVA
           IF PAR-QTD = 0 OR PAR-PRECO = 0
               MOVE 4 TO RETURN-CODE
           ELSE
               COMPUTE PAR-SEM-IVA = PAR-QTD * PAR-PRECO
               COMPUTE PAR-COM-IVA ROUNDED =
                   PAR-SEM-IVA * (100 + PAR-IVA-PERC) / 100
               MOVE 0 TO RETURN-CODE
           END-IF
           GOBACK.
