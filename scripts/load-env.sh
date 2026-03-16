#!/usr/bin/env bash
# Source this file to load .env.local into the current shell environment
# Usage: source ./scripts/load-env.sh

if [ -f .env.local ]; then
  set -a
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    # Strip surrounding quotes from value
    value=$(echo "$value" | sed "s/^['\"]//;s/['\"]$//")
    export "$key=$value"
  done < .env.local
  set +a
fi
