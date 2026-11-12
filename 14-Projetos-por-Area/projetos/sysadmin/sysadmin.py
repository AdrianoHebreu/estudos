"""Ferramenta de administração: disco, servico, ambiente. Só biblioteca padrão."""
import argparse
import platform
import shutil
import socket
import sys
import urllib.error
import urllib.request

GIB = 1024 ** 3


def cmd_disco(args: argparse.Namespace) -> int:
    """Mostra o espaço livre; devolve 1 se a percentagem livre ficar abaixo do limiar."""
    uso = shutil.disk_usage(args.caminho)
    livre_pct = uso.free / uso.total * 100
    print(f"{args.caminho}: total {uso.total / GIB:.1f} GiB, "
          f"livre {uso.free / GIB:.1f} GiB ({livre_pct:.1f}%)")
    if livre_pct < args.limiar:
        print(f"ALERTA: livre abaixo de {args.limiar:g}%")
        return 1
    print("OK")
    return 0


def verificar_url(url: str, timeout: float) -> str | None:
    """Devolve None se o URL responde com 2xx/3xx; senão, o motivo da falha."""
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resposta:
            return None if resposta.status < 400 else f"HTTP {resposta.status}"
    except urllib.error.HTTPError as erro:
        return f"HTTP {erro.code}"
    except (urllib.error.URLError, TimeoutError, ValueError) as erro:
        return str(getattr(erro, "reason", erro))


def verificar_porta(destino: str, timeout: float) -> str | None:
    """Tenta ligar a 'host:porta'; devolve None se a ligação for aceite."""
    host, _, porta = destino.rpartition(":")
    try:
        with socket.create_connection((host or "localhost", int(porta)), timeout=timeout):
            return None
    except (OSError, ValueError) as erro:
        return str(erro)


def cmd_servico(args: argparse.Namespace) -> int:
    """Verifica um URL (http...) ou host:porta. Código de saída 0 = ativo, 1 = em baixo."""
    teste = verificar_url if args.destino.startswith(("http://", "https://")) else verificar_porta
    erro = teste(args.destino, args.timeout)
    print(f"{args.destino}: {'ATIVO' if erro is None else f'EM BAIXO ({erro})'}")
    return 0 if erro is None else 1


def cmd_ambiente(_: argparse.Namespace) -> int:
    """Mostra a versão do Python e o sistema."""
    print(f"Python {platform.python_version()} ({platform.python_implementation()})")
    print(f"Sistema: {platform.system()} {platform.release()} ({platform.machine()})")
    return 0


def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="sysadmin", description=__doc__)
    sub = parser.add_subparsers(dest="comando", required=True)

    disco = sub.add_parser("disco", help="espaço livre num caminho")
    disco.add_argument("caminho", nargs="?", default=".")
    disco.add_argument("--limiar", type=float, default=10.0, help="%% livre mínima (def. 10)")
    disco.set_defaults(func=cmd_disco)

    servico = sub.add_parser("servico", help="verifica URL ou host:porta")
    servico.add_argument("destino", help="http://... ou host:porta")
    servico.add_argument("--timeout", type=float, default=3.0)
    servico.set_defaults(func=cmd_servico)

    sub.add_parser("ambiente", help="Python e sistema").set_defaults(func=cmd_ambiente)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = construir_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
