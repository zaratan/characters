#!/usr/bin/env bash
set -euo pipefail

# Load .env.local if POSTGRES_URL is not already set
if [ -z "${POSTGRES_URL:-}" ]; then
  source "$(dirname "$0")/load-env.sh"
fi

if [ -z "${POSTGRES_URL:-}" ]; then
  echo "Error: POSTGRES_URL is not set (check .env.local or export it)" >&2
  exit 1
fi

DB_NAME=$(node -e "console.log(new URL(process.env.POSTGRES_URL).pathname.slice(1))")
BASE_URL=$(node -e "console.log(process.env.POSTGRES_URL.replace(/\/[^/]*$/, '/postgres'))")

case "${1:-}" in
  create)
    psql "$BASE_URL" -c "CREATE DATABASE \"$DB_NAME\""
    echo "Database '$DB_NAME' created."
    ;;
  drop)
    psql "$BASE_URL" -c "DROP DATABASE IF EXISTS \"$DB_NAME\""
    echo "Database '$DB_NAME' dropped."
    ;;
  *)
    echo "Usage: $0 {create|drop}" >&2
    exit 1
    ;;
esac
