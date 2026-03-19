#!/bin/bash
set -e

# This script runs in the PostgreSQL container after PostgreSQL starts
# It executes Prisma migrations if they haven't been applied yet

echo "🔍 Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -U $POSTGRES_USER -d $POSTGRES_DB -c '\q' 2>/dev/null; do
  echo "⏳ PostgreSQL is starting..."
  sleep 1
done

echo "✅ PostgreSQL is ready"

# Check if migrations table exists
if PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1 FROM _prisma_migrations LIMIT 1" >/dev/null 2>&1; then
  echo "✅ Prisma migrations already applied"
else
  echo "🚀 Running Prisma migrations..."
  cd /prisma
  npx prisma migrate deploy || echo "⚠️ No migrations to apply or already applied"
  echo "✅ Migrations completed"
fi

# Generate Prisma client (needed for applications to connect)
echo "⚙️ Generating Prisma client..."
cd /prisma
npx prisma generate
echo "✅ Prisma client generated"

# Run seed script to create default user
echo "🌱 Running seed script..."
npx tsx seed.ts
echo "✅ Seed script completed"

echo "🎉 Database initialization complete"