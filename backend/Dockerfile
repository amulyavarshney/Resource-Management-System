FROM python:3.11-slim AS base

WORKDIR /app

# System deps for pyodbc (SQL Server). For Postgres-only (Render), use Dockerfile.render.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    unixodbc-dev \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

# ── Builder ──────────────────────────────────────────────────────────────────
FROM base AS builder

COPY pyproject.toml .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir ".[mssql]"

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM base AS runtime

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . .

RUN chmod +x /app/entrypoint.sh \
    && addgroup --system app \
    && adduser --system --ingroup app app
USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health/live || exit 1

ENTRYPOINT ["./entrypoint.sh"]
