"""Serviço de tarefas: stdlib para HTTP; psycopg só se existir DATABASE_URL."""
import json
import os
import signal
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DATABASE_URL = os.environ.get("DATABASE_URL")
PORT = int(os.environ.get("PORT", "8000"))
MENSAGEM = os.environ.get("MENSAGEM", "")

memoria = []

if DATABASE_URL:
    import psycopg

    with psycopg.connect(DATABASE_URL, autocommit=True) as con:
        con.execute(
            "CREATE TABLE IF NOT EXISTS tarefa ("
            "id SERIAL PRIMARY KEY, titulo TEXT NOT NULL)"
        )


def listar():
    if DATABASE_URL:
        with psycopg.connect(DATABASE_URL) as con:
            linhas = con.execute("SELECT id, titulo FROM tarefa ORDER BY id").fetchall()
        return [{"id": i, "titulo": t} for i, t in linhas]
    return memoria


def criar(titulo):
    if DATABASE_URL:
        with psycopg.connect(DATABASE_URL) as con:
            i = con.execute(
                "INSERT INTO tarefa (titulo) VALUES (%s) RETURNING id", (titulo,)
            ).fetchone()[0]
        return {"id": i, "titulo": titulo}
    tarefa = {"id": len(memoria) + 1, "titulo": titulo}
    memoria.append(tarefa)
    return tarefa


class Handler(BaseHTTPRequestHandler):
    def _enviar(self, codigo, corpo):
        dados = json.dumps(corpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        if self.path == "/saude":
            corpo = {"estado": "ok"}
            if MENSAGEM:
                corpo["mensagem"] = MENSAGEM
            self._enviar(200, corpo)
        elif self.path == "/tarefas":
            self._enviar(200, listar())
        else:
            self._enviar(404, {"erro": "não encontrado"})

    def do_POST(self):
        if self.path != "/tarefas":
            return self._enviar(404, {"erro": "não encontrado"})
        tamanho = int(self.headers.get("Content-Length", 0))
        try:
            titulo = json.loads(self.rfile.read(tamanho))["titulo"]
        except (ValueError, KeyError, TypeError):
            return self._enviar(400, {"erro": 'esperado {"titulo": "..."}'})
        self._enviar(201, criar(titulo))


def parar(sinal, quadro):
    # Como PID 1 num contentor, o Python não trata o SIGTERM por omissão.
    raise SystemExit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, parar)
    print(f"A escutar em 0.0.0.0:{PORT} (base de dados: {'PostgreSQL' if DATABASE_URL else 'memória'})", flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
