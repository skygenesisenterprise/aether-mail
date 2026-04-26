.PHONY: help build build-app build-server build-dev build-cloud run-app run-server run-dev run-prod stop clean prune rmi-dev dev-up dev-down dev-logs

APP_NAME := aethermail

help:
	@echo "Available targets:"
	@echo "  build         - Build production image (full app)"
	@echo "  build-app     - Build frontend image (app/)"
	@echo "  build-server  - Build server image (server/)"
	@echo "  build-dev     - Build development image"
	@echo "  build-cloud   - Build cloud image"
	@echo "  run-app       - Run frontend container"
	@echo "  run-server    - Run server container"
	@echo "  run-dev       - Run development container (docker-compose)"
	@echo "  run-prod      - Run production container"
	@echo "  stop          - Stop all containers"
	@echo "  clean         - Remove build artifacts"
	@echo "  prune         - Clean up Docker system"
	@echo "  rmi-dev       - Remove dev image and container"
	@echo "  dev-up        - Start dev environment (docker-compose)"
	@echo "  dev-down      - Stop dev environment"
	@echo "  dev-logs      - View dev environment logs"
	@echo "  cloud-up      - Start cloud environment (docker-compose)"
	@echo "  cloud-down    - Stop cloud environment"
	@echo "  cloud-logs    - View cloud environment logs"

build:
	docker build -t $(APP_NAME):latest .

build-app:
	docker build -f Dockerfile -t $(APP_NAME)-app:latest --target frontend-builder app/

build-server:
	docker build -f Dockerfile -t $(APP_NAME)-server:latest --target backend-builder .

build-dev:
	docker build --no-cache -f Dockerfile.dev -t $(APP_NAME):latest .

build-cloud:
	docker build --no-cache -f Dockerfile.cloud -t $(APP_NAME):latest .

run-app:
	docker run --name $(APP_NAME)-app -p 3000:3000 $(APP_NAME)-app:latest

run-server:
	docker run --name $(APP_NAME)-server -p 8080:8080 $(APP_NAME)-server:latest

run-dev:
	docker run --name $(APP_NAME)-dev -p 3000:3000 $(APP_NAME)-dev:latest

run-prod:
	docker run --name $(APP_NAME)-prod -p 3000:3000 $(APP_NAME):latest

stop:
	docker stop $(APP_NAME)-app $(APP_NAME)-server $(APP_NAME)-dev $(APP_NAME)-prod 2>/dev/null || true
	docker rm $(APP_NAME)-app $(APP_NAME)-server $(APP_NAME)-dev $(APP_NAME)-prod 2>/dev/null || true

clean:
	rm -rf app/.next
	rm -rf server/aether-server

prune:
	docker system prune -f

rmi-dev:
	docker stop $(APP_NAME) 2>/dev/null || true
	docker rm $(APP_NAME) 2>/dev/null || true
	docker rmi $(APP_NAME):latest 2>/dev/null || true

dev-up:
	docker compose -f docker-compose.dev.yml up -d

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

dev-rebuild:
	docker compose -f docker-compose.dev.yml down
	docker build --no-cache -f Dockerfile.dev -t $(APP_NAME):latest .
	docker compose -f docker-compose.dev.yml up -d

dev-restart:
	docker compose -f docker-compose.dev.yml restart

cloud-up:
	docker compose -f docker-compose.cloud.yml up -d

cloud-down:
	docker compose -f docker-compose.cloud.yml down

cloud-logs:
	docker compose -f docker-compose.cloud.yml logs -f

cloud-rebuild:
	docker compose -f docker-compose.cloud.yml down
	docker build --no-cache -f Dockerfile.cloud -t $(APP_NAME):latest .
	docker compose -f docker-compose.cloud.yml up -d

rmi-cloud:
	docker stop $(APP_NAME) 2>/dev/null || true
	docker rm $(APP_NAME) 2>/dev/null || true
	docker rmi $(APP_NAME):latest 2>/dev/null || true