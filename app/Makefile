# Makefile pour la gestion du développement Docker de l'application Next.js
# Ce Makefile fournit des commandes claires et organisées pour le développement

# Couleurs pour une meilleure lisibilité
GREEN  := \033[0;32m
YELLOW := \033[1;33m
BLUE   := \033[0;34m
MAGENTA := \033[0;35m
CYAN   := \033[0;36m
RED    := \033[0;31m
RESET  := \033[0m

# Variables de base
APP_DIR := $(shell pwd)
DOCKER_COMPOSE := docker compose

# Mode par défaut (dev ou prod)
MODE ?= dev

# Fichiers Docker Compose en fonction du mode
DOCKER_COMPOSE_FILE := infra/docker-compose.$(MODE).yml

# Nom du conteneur
CONTAINER_NAME := aether-identity-frontend-$(MODE)

.PHONY: help
help: ## Afficher l'aide pour les commandes disponibles
	@echo "${GREEN}========================================${RESET}"
	@echo "${GREEN}Makefile pour Aether Identity - Application Next.js${RESET}"
	@echo "${GREEN}========================================${RESET}"
	@echo ""
	@echo "${BLUE}📋 Mode actuel: $(MODE)${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo "${CYAN}🚀 COMMANDES PRINCIPALES${RESET}"
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "  ${YELLOW}make up${RESET}                    ${GREEN}# Lancer le conteneur en mode $(MODE)${RESET}"
	@echo "  ${YELLOW}make down${RESET}                  ${GREEN}# Arrêter et supprimer les conteneurs${RESET}"
	@echo "  ${YELLOW}make restart${RESET}               ${GREEN}# Redémarrer le conteneur${RESET}"
	@echo "  ${YELLOW}make rebuild${RESET}               ${GREEN}# Reconstruire et relancer le conteneur${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo "${CYAN}📊 MONITORING ET LOGS${RESET}"
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "  ${YELLOW}make logs${RESET}                  ${GREEN}# Afficher les logs du conteneur${RESET}"
	@echo "  ${YELLOW}make logs-follow${RESET}            ${GREEN}# Suivre les logs en temps réel${RESET}"
	@echo "  ${YELLOW}make status${RESET}                ${GREEN}# Afficher le statut des conteneurs${RESET}"
	@echo "  ${YELLOW}make ps${RESET}                    ${GREEN}# Lister les conteneurs en cours d'exécution${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo "${CYAN}🔧 GESTION DOCKER${RESET}"
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "  ${YELLOW}make build${RESET}                 ${GREEN}# Construire l'image Docker${RESET}"
	@echo "  ${YELLOW}make clean${RESET}                 ${GREEN}# Nettoyer les images Docker inutilisées${RESET}"
	@echo "  ${YELLOW}make prune${RESET}                 ${GREEN}# Nettoyer complètement (images, conteneurs, volumes)${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo "${CYAN}🔌 GESTION DES PORTS${RESET}"
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "  ${YELLOW}make ports${RESET}                 ${GREEN}# Vérifier les ports utilisés${RESET}"
	@echo "  ${YELLOW}make kill-ports${RESET}            ${GREEN}# Forcer la libération du port 3000${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo "${CYAN}💻 ACCÈS AU CONTENAIR${RESET}"
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "  ${YELLOW}make exec${RESET}                  ${GREEN}# Exécuter une commande dans le conteneur${RESET}"
	@echo "  ${YELLOW}make shell${RESET}                 ${GREEN}# Ouvrir un shell dans le conteneur${RESET}"
	@echo "  ${YELLOW}make bash${RESET}                  ${GREEN}# Ouvrir un bash dans le conteneur${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo "${CYAN}⚙️  GESTION DU MODE${RESET}"
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "  ${YELLOW}make dev${RESET}                   ${GREEN}# Basculer en mode développement${RESET}"
	@echo "  ${YELLOW}make prod${RESET}                  ${GREEN}# Basculer en mode production${RESET}"
	@echo "  ${YELLOW}make mode=dev up${RESET}           ${GREEN}# Lancer en mode développement (override)${RESET}"
	@echo "  ${YELLOW}make mode=prod up${RESET}          ${GREEN}# Lancer en mode production (override)${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo "${CYAN}🔍 INFORMATIONS${RESET}"
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "  ${YELLOW}make version${RESET}               ${GREEN}# Afficher les versions de Docker${RESET}"
	@echo "  ${YELLOW}make info${RESET}                  ${GREEN}# Afficher des informations sur le système${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo "${CYAN}📚 EXEMPLES D'UTILISATION${RESET}"
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "  ${MAGENTA}# Démarrer en mode développement${RESET}"
	@echo "  ${GREEN}make up${RESET}"
	@echo ""
	@echo "  ${MAGENTA}# Démarrer en mode production${RESET}"
	@echo "  ${GREEN}make mode=prod up${RESET}"
	@echo ""
	@echo "  ${MAGENTA}# Reconstruire et redémarrer${RESET}"
	@echo "  ${GREEN}make rebuild${RESET}"
	@echo ""
	@echo "  ${MAGENTA}# Voir les logs en temps réel${RESET}"
	@echo "  ${GREEN}make logs-follow${RESET}"
	@echo ""
	@echo "${CYAN}─────────────────────────────────────────────────────────────${RESET}"
	@echo ""
	@echo "${RED}💡 Astuce: Utilisez 'make help' à tout moment pour afficher cette aide${RESET}"
	@echo ""

.PHONY: up
up: ## Lancer le conteneur en mode $(MODE)
	@echo "${GREEN}🚀 Lancement du conteneur Next.js en mode $(MODE)...${RESET}"
	@echo "${YELLOW}Utilisation du fichier: $(DOCKER_COMPOSE_FILE)${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d --build
	@echo "${GREEN}✅ Conteneur démarré: $(CONTAINER_NAME)${RESET}"
	@echo "${GREEN}🌐 Accès à l'application:${RESET}"
	@echo "   - http://localhost:3000 (Next.js direct)"
	@echo ""
	@echo "${GREEN}📝 Pour suivre les logs: make logs-follow${RESET}"

.PHONY: down
down: ## Arrêter et supprimer les conteneurs
	@echo "${GREEN}🛑 Arrêt et suppression des conteneurs...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down
	@echo "${GREEN}✅ Conteneurs arrêtés et supprimés${RESET}"

.PHONY: restart
restart: down up ## Redémarrer le conteneur

.PHONY: rebuild
rebuild: ## Reconstruire et relancer le conteneur
	@echo "${GREEN}🔄 Reconstruction et redémarrage du conteneur...${RESET}"
	@echo "${YELLOW}Nettoyage des conteneurs existants...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down --remove-orphans
	@echo "${YELLOW}Construction de l'image avec cache nettoyé...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build --no-cache
	@echo "${YELLOW}Démarrage du conteneur...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d
	@echo "${GREEN}✅ Reconstruction terminée${RESET}"

.PHONY: build
build: ## Construire l'image Docker
	@echo "${GREEN}🔨 Construction de l'image Docker...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build
	@echo "${GREEN}✅ Image Docker construite avec succès${RESET}"

.PHONY: logs
logs: ## Afficher les logs du conteneur
	@echo "${GREEN}📋 Affichage des logs (dernières 100 lignes)...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs --tail=100

.PHONY: logs-follow
logs-follow: ## Suivre les logs en temps réel
	@echo "${GREEN}📋 Suivi des logs en temps réel...${RESET}"
	@echo "${RED}Appuyez sur Ctrl+C pour arrêter le suivi${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f

.PHONY: status
status: ## Afficher le statut des conteneurs
	@echo "${GREEN}📊 Statut des conteneurs...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) ps

.PHONY: ps
ps: ## Lister les conteneurs en cours d'exécution
	@echo "${GREEN}📊 Liste des conteneurs en cours d'exécution...${RESET}"
	docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"

.PHONY: ports
ports: ## Vérifier les ports utilisés
	@echo "${GREEN}🔍 Vérification des ports utilisés...${RESET}"
	@echo ""
	@echo "${BLUE}Ports utilisés par Docker:${RESET}"
	@docker ps --format "{{.Names}}: {{.Ports}}"
	@echo ""
	@echo "${BLUE}Processus utilisant le port 3000:${RESET}"
	@lsof -i :3000 || echo "${GREEN}✅ Port 3000 disponible${RESET}"
	@echo ""
	@echo "${YELLOW}Si le port est utilisé, vous pouvez le libérer avec:${RESET}"
	@echo "  ${GREEN}fuser -k 3000/tcp${RESET} (Linux)"
	@echo "  ${GREEN}lsof -i :3000 | grep -v PID | awk '{print $$2}' | xargs kill -9${RESET}"

.PHONY: exec
exec: ## Exécuter une commande dans le conteneur
	@echo "${GREEN}💻 Exécution d'une commande dans le conteneur...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec app sh -c "$@"

.PHONY: shell
shell: ## Ouvrir un shell dans le conteneur
	@echo "${GREEN}💻 Ouverture d'un shell dans le conteneur...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec app sh

.PHONY: bash
bash: ## Ouvrir un bash dans le conteneur
	@echo "${GREEN}💻 Ouverture d'un bash dans le conteneur...${RESET}"
	@cd $(APP_DIR) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec app bash

.PHONY: clean
clean: ## Nettoyer les images Docker inutilisées
	@echo "${GREEN}🧹 Nettoyage des images Docker inutilisées...${RESET}"
	docker system prune -f
	@echo "${GREEN}✅ Nettoyage terminé${RESET}"

.PHONY: prune
prune: ## Nettoyer complètement (images, conteneurs, volumes)
	@echo "${RED}⚠️  Attention: Cette commande supprime TOUT (images, conteneurs, volumes, réseaux)${RESET}"
	@echo "${YELLOW}Confirmez-vous? (o/n)${RESET}"
	@read -r REPLY
	if [ "$$REPLY" = "o" ] || [ "$$REPLY" = "O" ]; then
		@echo "${GREEN}🧹 Nettoyage complet en cours...${RESET}"
		docker system prune -a -f --volumes
		@echo "${GREEN}✅ Nettoyage complet terminé${RESET}"
	else
		@echo "${GREEN}✅ Nettoyage annulé${RESET}"
	fi

.PHONY: kill-ports
kill-ports: ## Forcer la libération du port 3000
	@echo "${RED}⚠️  Attention: Cette commande tue les processus utilisant le port 3000${RESET}"
	@echo "${YELLOW}Confirmez-vous? (o/n)${RESET}"
	@read -r REPLY
	if [ "$$REPLY" = "o" ] || [ "$$REPLY" = "O" ]; then
		@echo "${GREEN}🔥 Libération du port en cours...${RESET}"
		@echo "${YELLOW}Port 3000:${RESET}"
		@lsof -ti :3000 | xargs -r kill -9
		@echo "${GREEN}✅ Port libéré${RESET}"
	else
		@echo "${GREEN}✅ Opération annulée${RESET}"
	fi

.PHONY: dev
dev: ## Basculer en mode développement
	@echo "${GREEN}⚙️  Basculer en mode développement...${RESET}"
	@export MODE=dev
	@echo "${GREEN}✅ Mode développé défini: dev${RESET}"
	@echo "${YELLOW}Utilisez 'make up' pour appliquer ce changement${RESET}"

.PHONY: prod
prod: ## Basculer en mode production
	@echo "${GREEN}⚙️  Basculer en mode production...${RESET}"
	@export MODE=prod
	@echo "${GREEN}✅ Mode développé défini: prod${RESET}"
	@echo "${YELLOW}Utilisez 'make up' pour appliquer ce changement${RESET}"

.PHONY: version
version: ## Afficher les versions de Docker
	@echo "${GREEN}📋 Versions de Docker...${RESET}"
	docker --version
	docker compose version
	@echo ""

.PHONY: info
info: ## Afficher des informations sur le système
	@echo "${GREEN}📊 Informations système...${RESET}"
	@echo ""
	@echo "${BLUE}Docker Information:${RESET}"
	docker info --format '{{.Driver}}: {{.DriverStatus}}'
	@echo ""
	@echo "${BLUE}Conteneurs en cours d'exécution:${RESET}"
	docker ps --format "{{.Names}}"
	@echo ""
	@echo "${BLUE}Images disponibles:${RESET}"
	docker images --format "{{.Repository}}:{{.Tag}}"
	@echo ""

.PHONY: reset
reset: clean prune ## Réinitialiser complètement l'environnement Docker

# Alias pour les commandes courantes
.PHONY: start
start: up

.PHONY: stop
stop: down

.PHONY: rebuild-force
rebuild-force: clean rebuild

.PHONY: force-rebuild
force-rebuild: kill-ports rebuild ## Reconstruction forcée avec libération des ports
