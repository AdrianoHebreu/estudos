       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERRLINHA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-A                    PIC 9(04) VALUE 5.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "resultado do calculo: " WS-A " unidades na loja de teste".
           STOP RUN.
