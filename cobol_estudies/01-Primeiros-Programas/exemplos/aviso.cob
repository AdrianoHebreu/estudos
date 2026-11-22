       IDENTIFICATION DIVISION.
       PROGRAM-ID. AVISO.
       AUTHOR. CURSO-COBOL.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NOME                PIC X(20)  VALUE "Ana Ribeiro".
       01  WS-NAO-USADO           PIC 9(03)  VALUE 7.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY WS-NOME.
           STOP RUN.
