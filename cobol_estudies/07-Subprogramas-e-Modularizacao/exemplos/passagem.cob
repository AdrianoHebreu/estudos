      * BY REFERENCE, BY CONTENT e BY VALUE lado a lado.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. PASSAGEM.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-A                   PIC 9(04) VALUE 10.
       01  WS-B                   PIC 9(04) VALUE 20.
       01  WS-C                   PIC S9(09) COMP-5 VALUE 30.
       PROCEDURE DIVISION.
       INICIO.
           DISPLAY "antes:  a=" WS-A " b=" WS-B " c=" WS-C.
           CALL "MUDAR" USING BY REFERENCE WS-A
                              BY CONTENT WS-B
                              BY VALUE WS-C.
           DISPLAY "depois: a=" WS-A " b=" WS-B " c=" WS-C.
           STOP RUN.
