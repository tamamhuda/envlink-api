#!/bin/sh

set -e  # Exit immediately if a command exits with a non-zero status

echo "⏳ Checking database readiness..."

# Wait until PostgreSQL is ready to accept connections
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' > /dev/null 2>&1; do
  echo "🔄 Waiting for PostgreSQL at $POSTGRES_HOST..."
  sleep 3
done

echo "✅ PostgreSQL is ready."

echo "🚀 Starting NestJS in watch mode..."
exec pnpm run start:dev
