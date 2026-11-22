      *> AVISOS.COB - VALUE incompativel com a PICTURE (so avisos)
       IDENTIFICATION DIVISION.
       PROGRAM-ID. AVISOS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  QTD     PIC 9(03) VALUE 12345.
       01  NOME    PIC 9(03) VALUE "ABC".
       01  NUM     PIC X(03) VALUE 7.
       PROCEDURE DIVISION.
           STOP RUN.
