"""Gera Roteiro-12-Semanas/roteiro.html a partir de tools/roteiro/semanas.json e template.html.

Uso (a partir da pasta english_studies):
    python tools/roteiro/build_roteiro.py
O HTML e gerado: nunca editar a mao. Os dados vivem em tools/roteiro/semanas.json.
"""
import json
import pathlib
import sys

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
DADOS = AQUI / "semanas.json"
TEMPLATE = AQUI / "template.html"
SAIDA = RAIZ / "Roteiro-12-Semanas" / "roteiro.html"


def main():
    semanas = json.loads(DADOS.read_text(encoding="utf-8"))
    semanas.sort(key=lambda s: s["week"])
    texto = json.dumps(semanas, ensure_ascii=False, separators=(",", ":"))
    # evita fechar o <script> por engano e carateres de linha problematicos
    texto = texto.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    html = TEMPLATE.read_text(encoding="utf-8")
    if "/*DADOS*/" not in html:
        sys.exit("template sem marcador /*DADOS*/")
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(html.replace("/*DADOS*/", texto), encoding="utf-8")
    vocab = sum(len(s["vocab"]) for s in semanas)
    print("OK", SAIDA, "| semanas:", len(semanas), "| vocabulario:", vocab, "| tamanho:", SAIDA.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
