#!/bin/bash
set -euxo pipefail

cat << EOF > .env
    POSTGRES_CONNECTION_STRING="$POSTGRES_CONNECTION_STRING"
    REDIS_HOST="localhost"
    REDIS_PORT=6379
    BOT_TOKEN="$BOT_TOKEN"
    NODE_ENV="production"
    EOF