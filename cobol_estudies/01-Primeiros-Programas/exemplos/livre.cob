*> Formato livre: compila com  cobc -x -free livre.cob
identification division.
program-id. livre.
data division.
working-storage section.
01 ws-nome pic x(20) value "Bruno Costa".
procedure division.
principal.
    display "Cliente: " ws-nome. *> comentario no fim da linha
    stop run.
