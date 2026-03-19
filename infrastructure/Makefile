# Aether Identity Infrastructure Makefile
# Commands for managing the development environment

.PHONY: help up down build logs shell restart clean ps health check-docker

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m # No Color

# Docker Compose file
COMPOSE_FILE := docker/docker-compose.dev.yml

# Detect docker compose command (support both 'docker-compose' and 'docker compose')
DOCKER_COMPOSE := $(shell if command -v docker-compose >/dev/null 2>&1; then echo "docker-compose"; elif docker compose version >/dev/null 2>&1; then echo "docker compose"; else echo ""; fi)

# Check if docker compose is available
check-docker:
	@if [ -z "$(DOCKER_COMPOSE)" ]; then \
		echo "$(RED)Error: Docker Compose is not installed!$(NC)"; \
		echo "Please install Docker Compose:"; \
		echo "  - Option 1: Install docker-compose (standalone)"; \
		echo "  - Option 2: Enable Docker Compose V2 plugin (docker compose)"; \
		echo ""; \
		echo "For Ubuntu/Debian:"; \
		echo "  sudo apt-get install docker-compose-plugin"; \
		echo ""; \
		echo "Or download standalone:"; \
		echo "  sudo curl -L \"https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64\" -o /usr/local/bin/docker-compose"; \
		echo "  sudo chmod +x /usr/local/bin/docker-compose"; \
		exit 1; \
	fi

help: ## Show this help message
	@echo "$(BLUE)Aether Identity Infrastructure - Available Commands$(NC)"
	@echo "=================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

up: check-docker ## Start all services (detached mode)
	@echo "$(BLUE)Starting Aether Identity services...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services started!$(NC)"
	@echo "$(YELLOW)URLs:$(NC)"
	@echo "  - App:       http://localhost:3001"
	@echo "  - API:       http://localhost:3001/api/v1"
	@echo "  - Traefik:   http://localhost:8082"

up-logs: check-docker ## Start all services with logs attached
	@echo "$(BLUE)Starting Aether Identity services with logs...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up --build

down: check-docker ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Services stopped!$(NC)"

down-volumes: check-docker ## Stop all services and remove volumes (WARNING: data will be lost)
	@echo "$(RED)WARNING: This will remove all data volumes!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ $$confirm = y ] && $(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down -v || echo "Cancelled"

build: check-docker ## Build or rebuild all services
	@echo "$(BLUE)Building services...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)Build complete!$(NC)"

logs: check-docker ## View logs from all services
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f

logs-app: check-docker ## View logs from Next.js app only
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f aether-app

logs-server: check-docker ## View logs from Go server only
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f aether-server

logs-db: check-docker ## View logs from PostgreSQL only
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f postgres

restart: check-docker ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)Services restarted!$(NC)"

restart-app: check-docker ## Restart Next.js app only
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart aether-app

restart-server: check-docker ## Restart Go server only
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart aether-server

ps: check-docker ## List running containers
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) ps

status: check-docker ## Show status of all services
	@echo "$(BLUE)Service Status:$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

health: check-docker ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) ps | grep -E "(Name|healthy|unhealthy|starting)" || echo "$(YELLOW)Health status not available yet$(NC)"

shell-app: check-docker ## Open shell in Next.js app container
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec aether-app sh

shell-server: check-docker ## Open shell in Go server container
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec aether-server sh

shell-db: check-docker ## Open shell in PostgreSQL container
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec postgres sh

db-cli: check-docker ## Open PostgreSQL CLI (psql)
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec postgres psql -U postgres -d aether_identity

db-migrate: check-docker ## Run database migrations (if using Prisma)
	@echo "$(BLUE)Running database migrations...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec aether-server go run main.go migrate || echo "$(YELLOW)Migration command not configured$(NC)"

db-seed: ## Seed database with initial data
	@echo "$(BLUE)Seeding database...$(NC)"
	@echo "$(YELLOW)Add your seed command here$(NC)"

clean: ## Remove all containers, networks, and images
	@echo "$(RED)WARNING: This will remove all containers and images!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ $$confirm = y ] && docker-compose -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans || echo "Cancelled"

prune: ## Clean up Docker system (remove unused data)
	@echo "$(BLUE)Cleaning up Docker system...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

# Development helpers
dev: up ## Alias for 'make up'

stop: down ## Alias for 'make down'

# Service-specific commands
app-logs: logs-app ## Alias for logs-app
server-logs: logs-server ## Alias for logs-server
db-logs: logs-db ## Alias for logs-db

# Quick access URLs
urls: ## Display all accessible URLs
	@echo "$(GREEN)Aether Identity - Local URLs$(NC)"
	@echo "================================"
	@echo "$(BLUE)Frontend (Next.js):$(NC)  http://localhost:3001"
	@echo "$(BLUE)API (Go Server):$(NC)     http://localhost:3001/api"
	@echo "$(BLUE)Database Admin:$(NC)      http://localhost:3001/admin"
	@echo "$(BLUE)Traefik Dashboard:$(NC)  http://localhost:8082"
	@echo ""
	@echo "$(YELLOW)Internal Services (not exposed):$(NC)"
	@echo "  - PostgreSQL: postgres:5432 (internal only)"
	@echo "  - Go Server:  aether-server:8080 (internal only)"
	@echo "  - Next.js:    aether-app:3000 (internal only)"

# Testing
test: ## Run tests (if configured)
	@echo "$(BLUE)Running tests...$(NC)"
	@echo "$(YELLOW)Add your test commands here$(NC)"

# Backup and restore
backup: ## Backup PostgreSQL database
	@echo "$(BLUE)Creating database backup...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U postgres aether_identity > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Backup created!$(NC)"

restore: ## Restore PostgreSQL database from backup (usage: make restore FILE=backup.sql)
ifndef FILE
	@echo "$(RED)Error: Please specify FILE parameter$(NC)"
	@echo "Usage: make restore FILE=backup.sql"
	@exit 1
endif
	@echo "$(BLUE)Restoring database from $(FILE)...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U postgres aether_identity < $(FILE)
	@echo "$(GREEN)Restore complete!$(NC)"
