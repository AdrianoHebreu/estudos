# Ambiente de estudo de COBOL: GnuCOBOL instalado a partir do repositório oficial do Debian.
# Construir:  docker build -t est-cb-gnucobol:estudo .
FROM debian:stable-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends gnucobol \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /work
