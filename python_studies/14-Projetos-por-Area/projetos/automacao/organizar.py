"""Organiza uma pasta de recibos em <tipo>/<AAAA-MM>/. Simula por omissão."""
import argparse
import shutil
from datetime import datetime
from pathlib import Path


def destino(ficheiro: Path, raiz: Path) -> Path:
    """Calcula raiz/<extensão>/<AAAA-MM>/<nome> a partir da data de modificação."""
    mes = datetime.fromtimestamp(ficheiro.stat().st_mtime).strftime("%Y-%m")
    tipo = ficheiro.suffix.lower().lstrip(".") or "sem-extensao"
    return raiz / tipo / mes / ficheiro.name


def organizar(raiz: Path, aplicar: bool) -> int:
    """Move os ficheiros soltos em `raiz`; devolve quantos foram (ou seriam) movidos."""
    total = 0
    for f in sorted(p for p in raiz.iterdir() if p.is_file()):
        alvo = destino(f, raiz)
        if alvo.exists():
            print(f"IGNORADO (já existe): {alvo.relative_to(raiz)}")
            continue
        print(f"{'MOVER' if aplicar else 'SIMULAR'}: {f.name} -> {alvo.relative_to(raiz)}")
        if aplicar:
            alvo.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(f, alvo)
        total += 1
    return total


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pasta", type=Path)
    ap.add_argument("--aplicar", action="store_true", help="move mesmo (por omissão só simula)")
    ap.add_argument("--simular", action="store_true", help="modo por omissão, explícito")
    args = ap.parse_args()
    if not args.pasta.is_dir():
        ap.error(f"pasta inexistente: {args.pasta}")
    aplicar = args.aplicar and not args.simular
    n = organizar(args.pasta, aplicar)
    print(f"{n} ficheiro(s) {'movido(s)' if aplicar else 'a mover (simulação; usa --aplicar)'}.")


if __name__ == "__main__":
    main()
