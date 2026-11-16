# ARG antes do FROM: só existe para escolher a imagem base
ARG BASE=python:3.13-slim
FROM ${BASE}

WORKDIR /app
COPY app.py .

ENV PORT=8000
EXPOSE 8000

# Não correr como root
USER nobody

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["python", "-c", "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.environ['PORT'] + '/saude', timeout=2)"]

# Forma exec: o Python fica com o PID 1 e recebe o SIGTERM
CMD ["python", "app.py"]
