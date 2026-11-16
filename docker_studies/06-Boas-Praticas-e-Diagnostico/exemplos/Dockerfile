# Versão endurecida: tag precisa + digest, base slim, utilizador sem privilégios
FROM python:3.13-slim@sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90

# Utilizador de sistema com UID/GID fixos (os volumes e o Kubernetes agradecem)
RUN groupadd --system --gid 10001 app \
 && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app

WORKDIR /app
COPY --chown=app:app app.py .

ENV PORT=8000 PYTHONUNBUFFERED=1
EXPOSE 8000
USER app

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["python", "-c", "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.environ['PORT'] + '/saude', timeout=2)"]

CMD ["python", "app.py"]
