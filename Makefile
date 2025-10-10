# Aether Mail - Docker Commands
.PHONY: help docker-dev docker-prod docker-build docker-clean docker-logs

# Default target
help:
	@echo "Aether Mail - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make docker-dev         Start development environment"
	@echo "  make docker-dev-build   Build development images"
	@echo "  make docker-dev-logs    Show development logs"
	@echo "  make docker-dev-stop    Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  make docker-prod        Start production environment"
	@echo "  make docker-prod-build  Build production images"
	@echo "  make docker-prod-logs   Show production logs"
	@echo "  make docker-prod-stop   Stop production environment"
	@echo ""
	@echo "Utilities:"
	@echo "  make docker-clean       Clean up Docker resources"
	@echo "  make docker-exec        Access running container"
	@echo "  make docker-ps          Show running containers"
	@echo ""

# Development commands
docker-dev:
	docker-compose -f docker-compose.dev.yml up

docker-dev-build:
	docker-compose -f docker-compose.dev.yml build

docker-dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

docker-dev-stop:
	docker-compose -f docker-compose.dev.yml down

# Production commands
docker-prod:
	docker-compose -f docker-compose.prod.yml up -d

docker-prod-build:
	docker-compose -f docker-compose.prod.yml build

docker-prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

docker-prod-stop:
	docker-compose -f docker-compose.prod.yml down

# Utility commands
docker-clean:
	docker system prune -f --volumes
	docker image prune -f

docker-exec:
	docker exec -it aethermail-app-dev sh

docker-ps:
	docker-compose ps