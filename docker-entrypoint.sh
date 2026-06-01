#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running production database migrations..."
npx prisma migrate deploy

echo "Starting Next.js application..."
exec node server.js
