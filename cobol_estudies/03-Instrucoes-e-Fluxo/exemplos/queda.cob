      *> QUEDA.COB - sem STOP RUN o fluxo cai no paragrafo seguinte
       IDENTIFICATION DIVISION.
       PROGRAM-ID. QUEDA.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "no principal"
           PERFORM AUXILIAR.
       AUXILIAR.
           DISPLAY "no auxiliar".
       PERIGOSO.
           DISPLAY "no perigoso (ninguem o chamou)".
