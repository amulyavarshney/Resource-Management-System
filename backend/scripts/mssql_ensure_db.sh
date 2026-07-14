#!/bin/sh
# Create the application database on a fresh SQL Server instance.
# Used by docker compose `db-init` (root and backend compose files).
set -eu

SERVER="${MSSQL_HOST:-db}"
PASSWORD="${SA_PASSWORD:?SA_PASSWORD must be set}"
DB_NAME="${MSSQL_DATABASE:-rms}"

SQLCMD=""
for candidate in /opt/mssql-tools18/bin/sqlcmd /opt/mssql-tools/bin/sqlcmd; do
  if [ -x "$candidate" ]; then
    SQLCMD="$candidate"
    break
  fi
done

if [ -z "$SQLCMD" ]; then
  echo "sqlcmd not found in mssql-tools paths" >&2
  exit 1
fi

echo "Ensuring database [${DB_NAME}] exists on ${SERVER}..."
"$SQLCMD" -S "$SERVER" -U sa -P "$PASSWORD" -C -Q \
  "IF DB_ID(N'${DB_NAME}') IS NULL CREATE DATABASE [${DB_NAME}];"
echo "Database [${DB_NAME}] is ready."
