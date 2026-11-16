"""Serviço de tarefas (versão em memória, só biblioteca padrão)."""
import json
import os
import signal
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

TAREFAS = []


class Manipulador(BaseHTTPRequestHandler):
    def _responder(self, codigo, corpo):
        dados = json.dumps(corpo, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        if self.path == "/saude":
            self._responder(200, {"estado": "ok"})
        elif self.path == "/tarefas":
            self._responder(200, TAREFAS)
        else:
            self._responder(404, {"erro": "não encontrado"})

    def do_POST(self):
        if self.path != "/tarefas":
            self._responder(404, {"erro": "não encontrado"})
            return
        tamanho = int(self.headers.get("Content-Length", 0))
        try:
            pedido = json.loads(self.rfile.read(tamanho) or b"{}")
            titulo = pedido["titulo"]
        except (ValueError, KeyError, TypeError):
            self._responder(400, {"erro": "JSON com o campo titulo é obrigatório"})
            return
        tarefa = {"id": len(TAREFAS) + 1, "titulo": titulo}
        TAREFAS.append(tarefa)
        self._responder(201, tarefa)


def parar(sinal, quadro):
    # Como PID 1 num contentor, o Python não trata o SIGTERM por omissão.
    raise SystemExit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, parar)
    porta = int(os.environ.get("PORT", "8000"))
    print(f"A ouvir em 0.0.0.0:{porta}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", porta), Manipulador).serve_forever()
