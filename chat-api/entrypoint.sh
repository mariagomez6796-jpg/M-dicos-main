#!/bin/bash
set -e

echo "Starting chat-api entrypoint..."

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is up"

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Start application
echo "Starting application..."
exec "$@"

# Made with Bob
