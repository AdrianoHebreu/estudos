      *> SECCOES.COB - SECTION, paragrafos e a queda para o seguinte
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SECCOES.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  TOTAL               PIC 9(05)    VALUE ZERO.
       PROCEDURE DIVISION.
       PRINCIPAL SECTION.
       INICIO.
           DISPLAY "principal: INICIO"
           PERFORM PREPARAR
           PERFORM PROCESSAR
           PERFORM TERMINAR
           STOP RUN.
       PREPARAR SECTION.
       PREP-ZERAR.
           DISPLAY "  preparar: zerar o total"
           MOVE ZERO TO TOTAL.
       PREP-AVISAR.
           DISPLAY "  preparar: segundo paragrafo da mesma seccao".
       PROCESSAR SECTION.
       PROC-SOMAR.
           DISPLAY "  processar: somar"
           ADD 10 TO TOTAL.
       TERMINAR SECTION.
       TERM-MOSTRAR.
           DISPLAY "  terminar: total " TOTAL.
