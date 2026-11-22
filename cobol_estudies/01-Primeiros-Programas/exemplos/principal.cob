       IDENTIFICATION DIVISION.
       PROGRAM-ID. PRINCIPAL.
       PROCEDURE DIVISION.
       INICIO.
           DISPLAY "principal: vou chamar SUBGOBACK".
           CALL "SUBGOBACK".
           DISPLAY "principal: voltei de SUBGOBACK".
           DISPLAY "principal: vou chamar SUBSTOP".
           CALL "SUBSTOP".
           DISPLAY "principal: voltei de SUBSTOP".
           STOP RUN.
