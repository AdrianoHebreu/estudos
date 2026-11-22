"""Python executa um programa COBOL (no contentor) e le a saida."""
import subprocess, sys, os

pasta = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
cmd = ["docker", "run", "--rm", "-v", pasta + ":/work",
       "est-cb-gnucobol:estudo", "./chama"]
r = subprocess.run(cmd, capture_output=True, text=True,
                   env={**os.environ, "MSYS_NO_PATHCONV": "1"})
print("codigo de saida:", r.returncode)
for linha in r.stdout.splitlines():
    print("COBOL disse:", linha)
