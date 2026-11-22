      * CALL sem ON EXCEPTION e sem o modulo: erro em execucao.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SEMEXCECAO.
       PROCEDURE DIVISION.
       INICIO.
           DISPLAY "semexcecao: vou chamar NAOEXISTE".
           CALL "NAOEXISTE".
           DISPLAY "semexcecao: nunca chego aqui".
           STOP RUN.
