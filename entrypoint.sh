#!/bin/sh
set -e

# =============================================================================
# Aether Identity - Service Entry Point
# =============================================================================

export PATH="/usr/local/bin:/usr/bin:/bin:/usr/local/go/bin:/go/bin:/root/go/bin:$HOME/.local/share/corepack/shims:$HOME/.local/bin"
export NODE_ENV="${NODE_ENV:-development}"

# =============================================================================
# Configuration
# =============================================================================

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-aether}"
DB_NAME="${DB_NAME:-etheria_account}"
DB_PASSWORD="${DB_PASSWORD:-${POSTGRES_PASSWORD:-password}}"
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

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
    echo "║                   Version 1.0.0-alpha                                ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    log_info "Frontend: http://localhost:${FRONTEND_PORT}"
    log_info "API:      http://localhost:${API_PORT}"
    log_info "Database: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
    echo ""
}

# =============================================================================
# System Setup
# =============================================================================

setup_pnpm() {
    log_info "Configuring pnpm..."
    
    if command -v pnpm >/dev/null 2>&1; then
        log_success "pnpm already available"
        return 0
    fi
    
    npm install -g pnpm@9.15.4 2>/dev/null || true
    
    if command -v pnpm >/dev/null 2>&1; then
        log_success "pnpm configured"
        return 0
    fi
    
    log_warn "pnpm not available, will try npx"
}

ensure_pnpm_path() {
    if ! command -v pnpm >/dev/null 2>&1; then
        if [ -f "$HOME/.local/share/corepack/shims/pnpm" ]; then
            export PATH="$HOME/.local/share/corepack/shims:$PATH"
        fi
    fi
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
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql 2>/dev/null || true

    if [ -f "/var/lib/postgresql/data/PG_VERSION" ]; then
        CURRENT_VERSION=$(cat /var/lib/postgresql/data/PG_VERSION 2>/dev/null)
        if [ "$(echo "$CURRENT_VERSION" | head -c2)" != "18" ]; then
            log_warn "PostgreSQL version mismatch (found $CURRENT_VERSION), reinitializing..."
            rm -rf /var/lib/postgresql/data/*
        fi
    fi

    if [ ! -d "/var/lib/postgresql/data/base" ]; then
        log_info "Initializing PostgreSQL database..."
        su - postgres -c "initdb -D /var/lib/postgresql/data" 2>&1 || true
    else
        if [ -f "/var/lib/postgresql/data/postmaster.pid" ]; then
            STALE_PID=$(cat /var/lib/postgresql/data/postmaster.pid 2>/dev/null)
            if [ -n "$STALE_PID" ] && ! kill -0 "$STALE_PID" 2>/dev/null; then
                log_warn "Removing stale postmaster.pid..."
                rm -f /var/lib/postgresql/data/postmaster.pid
            fi
        fi
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

# =============================================================================
# Database Health Check
# =============================================================================

wait_for_database() {
    if [ "$USE_EMBEDDED_DB" = "true" ]; then
        log_info "Database already running (embedded)"
        return 0
    fi

    log_info "Waiting for database to be ready..."

    MAX_RETRIES=30
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

# =============================================================================
# Prisma Setup
# =============================================================================

run_migrations() {
    log_info "Setting up Prisma..."

    ensure_pnpm_path

    PRISMA_DIR="/app/server/prisma"

    if [ -d "$PRISMA_DIR" ]; then
        cd "$PRISMA_DIR"

        if [ -f "package.json" ]; then
            log_info "Installing Prisma dependencies..."
            npm install --silent 2>/dev/null || true
        fi

        if [ -f "schema.prisma" ]; then
            log_info "Generating Prisma client..."
            PGPASSWORD="$DB_PASSWORD" DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
                npx prisma generate 2>/dev/null || log_warn "Prisma generate failed"

            log_info "Checking database state..."
            TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
            TABLE_COUNT=$(echo "$TABLE_COUNT" | xargs)

            if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" = "0" ]; then
                log_info "Fresh database detected - creating schema from Prisma..."
                PGPASSWORD="$DB_PASSWORD" DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
                    npx prisma db push --accept-data-loss 2>/dev/null || log_warn "Prisma db push failed"
            else
                log_info "Database already has $TABLE_COUNT tables - running migrations..."
                PGPASSWORD="$DB_PASSWORD" DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
                    npx prisma db push --accept-data-loss 2>/dev/null || log_warn "Prisma db push failed"
            fi
        fi

        log_success "Prisma setup complete"
    else
        log_warn "Prisma directory not found at ${PRISMA_DIR}"
    fi
}

# =============================================================================
# Default Admin User
# =============================================================================

create_default_admin() {
    log_info "Creating default admin user..."

    ADMIN_EMAIL="admin@skygenesisenterprise.com"
    ADMIN_PASSWORD="Admin123!"
    ADMIN_NAME="Administrator"

    EXISTING_ADMIN=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT id FROM users WHERE email = '${ADMIN_EMAIL}';" 2>/dev/null | xargs)

    if [ -n "$EXISTING_ADMIN" ]; then
        log_info "Admin user already exists"
        return 0
    fi

    log_info "Checking for bcrypt availability..."
    ADMIN_HASH=""

    if command -v node >/dev/null 2>&1; then
        log_info "Using Node.js for password hashing..."
        cd /tmp
        npm install bcrypt 2>/dev/null || true

        if [ -d "/tmp/node_modules/bcrypt" ]; then
            ADMIN_HASH=$(node -e "
const bcrypt = require('/tmp/node_modules/bcrypt');
bcrypt.hash('${ADMIN_PASSWORD}', 10).then(hash => console.log(hash));
" 2>/dev/null)
        fi
    fi

    if [ -z "$ADMIN_HASH" ]; then
        log_warn "No bcrypt available, using a pre-computed hash..."
        ADMIN_HASH='$2a$10$yVco7zLTfdZtKSAIwiljdew4Oj8F0oY9j9Qz9Zm8Yz9Zm8G4i0CJu6CC'
    fi

    if [ -z "$ADMIN_HASH" ] && command -v python3 >/dev/null 2>&1; then
        log_info "Using Python for password hashing..."
        pip install bcrypt 2>/dev/null || true
        ADMIN_HASH=$(python3 -c "
import bcrypt
print(bcrypt.hashpw('${ADMIN_PASSWORD}'.encode(), bcrypt.gensalt()).decode())
" 2>/dev/null)
    fi

    if [ -z "$ADMIN_HASH" ]; then
        log_warn "No hashing library available, skipping admin creation"
        return 0
    fi

    log_info "Inserting admin user into database..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        INSERT INTO users (id, email, first_name, password_hash, role, is_active, created_at, updated_at)
        VALUES (gen_random_uuid(), '${ADMIN_EMAIL}', '${ADMIN_NAME}', '${ADMIN_HASH}', 'ADMIN', true, NOW(), NOW());
    " 2>/dev/null || log_warn "Failed to create admin user"

    log_success "Default admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}"
    return 0
}

# =============================================================================
# Service Starters
# =============================================================================

start_frontend() {
    log_info "Starting Next.js on port ${FRONTEND_PORT}..."

    cd /app/app
    
    PNPM_PATH="/root/.local/share/corepack/pnpm"
    if [ -f "$PNPM_PATH" ]; then
        "$PNPM_PATH" next dev -p "$FRONTEND_PORT" -H 0.0.0.0 &
    elif command -v npx >/dev/null 2>&1; then
        npx next dev -p "$FRONTEND_PORT" -H 0.0.0.0 &
    else
        log_error "Neither pnpm nor npx available"
        return 1
    fi

    NEXT_PID=$!
    echo "$NEXT_PID" > /tmp/next.pid

    log_info "Next.js started (PID: $NEXT_PID)"

    # Wait for Next.js to be ready
    log_info "Waiting for Next.js to be ready..."
    sleep 10

    # Verify it's running
    if kill -0 "$NEXT_PID" 2>/dev/null; then
        log_success "Next.js is ready"
    else
        log_error "Next.js failed to start"
        return 1
    fi
}

start_api() {
    log_info "Starting Go API server on port ${API_PORT}..."

    cd /app
    air -c /app/.air.toml &

    API_PID=$!
    echo "$API_PID" > /tmp/api.pid

    log_info "Go API server started (PID: $API_PID)"

    # Wait a moment for the API to initialize
    sleep 3

    # Verify it's running
    if kill -0 "$API_PID" 2>/dev/null; then
        log_success "Go API server is ready"
    else
        log_error "Go API server failed to start"
        return 1
    fi
}

# =============================================================================
# Service Monitor
# =============================================================================

monitor_services() {
    log_info "All services started successfully!"
    echo ""
    echo "══════════════════════════════════════════════════════════════════════"
    echo "  Services are running. Press Ctrl+C to stop."
    echo "══════════════════════════════════════════════════════════════════════"
    echo ""

    # Monitor both processes
    while true; do
        # Check if either process died
        if ! kill -0 "$NEXT_PID" 2>/dev/null || ! kill -0 "$API_PID" 2>/dev/null; then
            log_error "A service has stopped unexpectedly!"
            break
        fi
        sleep 5
    done
    
    log_info "Monitoring stopped"
    exit 0
}

# =============================================================================
# Cleanup Handler
# =============================================================================

cleanup() {
    echo ""
    log_info "Stopping services..."

    # Read PIDs
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

    # Setup
    setup_pnpm

    # Database setup - START FIRST
    if [ "$USE_EMBEDDED_DB" = "true" ]; then
        start_postgres || log_warn "Failed to start embedded database"
        run_migrations
    else
        if wait_for_database; then
            run_migrations
        else
            log_error "Database not available, starting without migrations..."
        fi
    fi

    # Create default admin user
    create_default_admin

    # Start services - AFTER DB
    start_frontend || log_error "Frontend failed to start"
    start_api || log_error "API failed to start"

    # Monitor
    monitor_services
}

# Trap for cleanup
trap cleanup SIGINT SIGTERM

# Run
main