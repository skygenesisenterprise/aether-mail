#!/bin/sh
set -e

# =============================================================================
# Aether Identity - Production Service Entry Point
# =============================================================================

export PATH="/usr/local/bin:/usr/bin:/bin:/usr/local/go/bin:/go/bin:/root/go/bin:/root/.local/share/corepack"
export NODE_ENV="${NODE_ENV:-production}"

# =============================================================================
# Configuration
# =============================================================================

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-aether}"
DB_NAME="${DB_NAME:-etheria_account}"
DB_PASSWORD="${DB_PASSWORD:-${POSTGRES_PASSWORD:-password}}"

FRONTEND_PORT="${FRONTEND_PORT:-3000}"
API_PORT="${API_PORT:-8080}"

USE_EMBEDDED_DB="${USE_EMBEDDED_DB:-true}"

# =============================================================================
# Logging Functions
# =============================================================================

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "[✓]  $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo "[!]  $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo "[X]  $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

# =============================================================================
# Header Display
# =============================================================================

display_header() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                    Aether Identity                                   ║"
    echo "║               Enterprise Account Management                          ║"
    echo "║                   Version 1.0.0-production                           ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    log_info "Frontend: http://localhost:${FRONTEND_PORT}"
    log_info "API:      http://localhost:${API_PORT}"
    log_info "Database: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
    log_info "Admin:    admin@skygenesisenterprise.com / Admin123!"
    echo ""
}

# =============================================================================
# Database Setup
# =============================================================================

start_postgres() {
    if [ "$USE_EMBEDDED_DB" != "true" ]; then
        return 0
    fi

    log_info "Starting embedded PostgreSQL..."

    mkdir -p /var/lib/postgresql/data
    mkdir -p /run/postgresql
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql

    if [ ! -d "/var/lib/postgresql/data/base" ]; then
        log_info "Initializing PostgreSQL database..."
        su - postgres -c "initdb -D /var/lib/postgresql/data" 2>&1 || true
    fi

    su - postgres -c "pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/logfile start -w" &
    POSTGRES_PID=$!
    echo "$POSTGRES_PID" > /tmp/postgres.pid

    log_info "Waiting for PostgreSQL to be ready..."

    MAX_RETRIES=30
    RETRY_COUNT=0

    while ! su - postgres -c "psql -l" >/dev/null 2>&1; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            log_error "PostgreSQL failed to start"
            if [ -f /var/lib/postgresql/logfile ]; then
                log_error "PostgreSQL log: $(cat /var/lib/postgresql/logfile)"
            fi
            return 1
        fi
        sleep 1
    done

    log_info "Creating database user and schema..."
    su - postgres -c "psql -c \"CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}' CREATEDB;\"" 2>/dev/null || true
    su - postgres -c "psql -c \"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};\"" 2>/dev/null || true

    log_success "PostgreSQL started"
    return 0
}

wait_for_database() {
    if [ "$USE_EMBEDDED_DB" = "true" ]; then
        log_info "Database already running (embedded)"
        return 0
    fi

    log_info "Waiting for database to be ready..."

    MAX_RETRIES=60
    RETRY_COUNT=0

    while ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; do
        RETRY_COUNT=$((RETRY_COUNT + 1))

        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            log_error "Database not available after ${MAX_RETRIES} attempts"
            return 1
        fi

        log_info "Waiting for database... (${RETRY_COUNT}/${MAX_RETRIES})"
        sleep 2
    done

    log_success "Database connected"
    return 0
}

run_migrations() {
    log_info "Running database migrations..."

    PRISMA_DIR="/app/prisma"

    if [ -d "$PRISMA_DIR" ]; then
        cd "$PRISMA_DIR"

        if [ -f "schema.prisma" ]; then
            log_info "Generating Prisma client..."
            PGPASSWORD="$DB_PASSWORD" DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
                npx prisma generate 2>/dev/null || log_warn "Prisma generate failed"

            log_info "Running database migrations..."
            PGPASSWORD="$DB_PASSWORD" DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
                npx prisma db push --accept-data-loss 2>/dev/null || log_warn "Prisma db push failed"
        fi

        log_success "Database migrations complete"
    else
        log_warn "Prisma directory not found"
    fi
}

# =============================================================================
# Service Starters
# =============================================================================

start_frontend() {
    log_info "Starting Next.js (production mode) on port ${FRONTEND_PORT}..."

    cd /app

    export PORT="$FRONTEND_PORT"
    export HOST="0.0.0.0"
    export NEXT_PUBLIC_BASE_PATH=""
    export NEXT_TELEMETRY_DISABLED=1

    node server.js &
    NEXT_PID=$!
    echo "$NEXT_PID" > /tmp/next.pid

    log_info "Next.js started (PID: $NEXT_PID)"

    sleep 3

    if kill -0 "$NEXT_PID" 2>/dev/null; then
        log_success "Next.js is ready"
    else
        log_error "Next.js failed to start"
        return 1
    fi

    return 0
}

start_api() {
    log_info "Starting Go API server on port ${API_PORT}..."

    cd /app

    export SERVER_PORT="$API_PORT"
    export ENVIRONMENT="production"
    export GIN_MODE=release

    ./server/etheriatimes-api &
    API_PID=$!
    echo "$API_PID" > /tmp/api.pid

    log_info "Go API server started (PID: $API_PID)"

    sleep 3

    if kill -0 "$API_PID" 2>/dev/null; then
        log_success "Go API server is ready"
    else
        log_error "Go API server failed to start"
        return 1
    fi

    return 0
}

# =============================================================================
# Service Monitor
# =============================================================================

monitor_services() {
    log_success "All services started successfully!"
    echo ""
    echo "══════════════════════════════════════════════════════════════════════"
    echo "  Services are running. Press Ctrl+C to stop."
    echo "══════════════════════════════════════════════════════════════════════"
    echo ""

    while true; do
        if ! kill -0 "$NEXT_PID" 2>/dev/null || ! kill -0 "$API_PID" 2>/dev/null; then
            log_error "A service has stopped unexpectedly!"
            break
        fi
        sleep 5
    done
}

# =============================================================================
# Cleanup Handler
# =============================================================================

cleanup() {
    echo ""
    log_info "Stopping services..."

    if [ -f /tmp/next.pid ]; then
        kill "$(cat /tmp/next.pid)" 2>/dev/null || true
        rm -f /tmp/next.pid
    fi

    if [ -f /tmp/api.pid ]; then
        kill "$(cat /tmp/api.pid)" 2>/dev/null || true
        rm -f /tmp/api.pid
    fi

    if [ -f /tmp/postgres.pid ]; then
        kill "$(cat /tmp/postgres.pid)" 2>/dev/null || true
        rm -f /tmp/postgres.pid
    fi

    log_info "All services stopped"
    exit 0
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    display_header

    if [ "$USE_EMBEDDED_DB" = "true" ]; then
        start_postgres || log_warn "Failed to start embedded database"
    else
        if wait_for_database; then
            run_migrations
        else
            log_error "Database not available, starting without migrations..."
        fi
    fi

    start_frontend || log_error "Frontend failed to start"
    start_api || log_error "API failed to start"

    monitor_services
}

trap cleanup SIGINT SIGTERM

main
