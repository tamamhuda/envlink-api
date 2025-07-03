#!/bin/sh

set -e

echo "⏳ Waiting for PostgreSQL..."

until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "🔄 PostgreSQL not ready yet..."
  echo "🔍 Trying with: host=$POSTGRES_HOST user=$POSTGRES_USER db=$POSTGRES_DB"
  sleep 3
done

echo "✅ PostgreSQL ready."

echo "🚀 Starting production server..."
exec npm run start:prod

