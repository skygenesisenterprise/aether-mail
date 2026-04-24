#!/bin/bash
set -e

echo "=========================================="
echo "  Aether Mail - Database Setup"
echo "=========================================="

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-aether}"
DB_NAME="${DB_NAME:-etheria_account}"
DB_PASSWORD="${DB_PASSWORD:-password}"

wait_for_db() {
    echo "[1/4] Waiting for PostgreSQL to be ready..."
    local attempt=1
    while true; do
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" > /dev/null 2>&1; then
            echo "      PostgreSQL is ready!"
            return 0
        fi
        echo "      Attempt $attempt - PostgreSQL not ready yet, retrying..."
        sleep $RETRY_INTERVAL
        attempt=$((attempt + 1))
    done
}

test_connection() {
    echo "[2/4] Testing database connection..."
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        echo "      Database connection successful!"
        sleep 2
        return 0
    fi
    echo "ERROR: Cannot connect to database"
    exit 1
}

setup_prisma() {
    echo "[3/4] Setting up Prisma..."
    
    cd /app/server/prisma
    
    echo "      Installing dependencies..."
    npm install --silent 2>/dev/null || npm install
    
    echo "      Generating Prisma Client..."
    DATABASE_URL="postgresql://aether:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
        PGPASSWORD="$DB_PASSWORD" npx prisma generate
    
    echo "      Checking for existing data..."
    set +e
    
    # Check if users table exists and has data
    USER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    
    if [ "$USER_COUNT" -gt "0" ]; then
        echo "      Found $USER_COUNT user(s) - PRESERVING existing data!"
        echo "      Skipping Prisma schema changes..."
        set -e
        return 0
    fi
    
    echo "      No existing data - pushing schema..."
    sleep 2
    
    PGPASSWORD="$DB_PASSWORD" DATABASE_URL="postgresql://aether:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
        npx prisma db push --accept-data-loss --skip-generate
    PRISMA_EXIT=$?
    set -e
    
    if [ $PRISMA_EXIT -eq 0 ]; then
        echo "      Schema pushed successfully!"
    else
        echo "      Warning: Schema push failed, tables may not exist yet"
    fi
    
    echo "      Prisma setup complete!"
}

start_application() {
    echo "[4/4] Starting application..."
    echo "=========================================="
    exec /entrypoint.sh
}

main() {
    wait_for_db
    test_connection
    setup_prisma
    start_application
}

main "$@"
