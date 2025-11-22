# Docker compose
DOCKER_COMPOSE := docker compose
DOCKER_COMPOSE_FILE := docker-compose.yaml

.PHONY: help
help:
	@echo "Available commands:"
	@echo ""
	@echo "Production:"
	@echo "  make up.db        - Start database service in detached mode"
	@echo "  make up.db-echo   - Start database service with logs"
	@echo "  make up.app       - Start application service in detached mode"
	@echo "  make up.app-echo  - Start application service with logs"
	@echo "  make up           - Start all services in detached mode"
	@echo "  make up.echo      - Start all services with logs"
	@echo "  make down         - Stop all services"
	@echo "  make down.total   - Stop all services and remove volumes"
	@echo "  make logs.db      - Watch database logs"
	@echo "  make logs.app     - Watch application logs"
	@echo "  make logs         - Watch all services logs"
	@echo "  make shell.db     - Open shell in database container"
	@echo "  make shell.app    - Open shell in application container"
	@echo "  make restart.app  - Restart application service"
	@echo "  make restart.db   - Restart database service"
	@echo "  make build        - Build application image"
	@echo "  make ps           - Show running containers"
	@echo ""
	@echo "Development (with hot-reload):"
	@echo "  make dev          - Start all services in dev mode with logs"
	@echo "  make dev.up       - Start all services in dev mode (detached)"
	@echo "  make dev.down     - Stop all dev services"
	@echo "  make dev.logs     - Watch dev services logs"
	@echo "  make dev.logs.app - Watch dev app logs"
	@echo "  make dev.shell    - Open shell in dev app container"
	@echo "  make dev.restart  - Restart dev app service"
	@echo "  make dev.build    - Rebuild dev app image"


# Database commands
.PHONY: up.db up.db-echo logs.db shell.db restart.db
up.db:
	@echo "Starting database service..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d wehr_database


up.db-echo:
	@echo "Starting database service with logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up wehr_database


logs.db:
	@echo "Watching database logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f wehr_database


shell.db:
	@echo "Opening database shell..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec wehr_database sh


restart.db:
	@echo "Restarting database service..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) restart wehr_database


# Application commands
.PHONY: up.app up.app-echo logs.app shell.app restart.app
up.app:
	@echo "Starting application service..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d wehr_app


up.app-echo:
	@echo "Starting application service with logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up wehr_app


logs.app:
	@echo "Watching application logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f wehr_app


shell.app:
	@echo "Opening application shell..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec wehr_app sh


restart.app:
	@echo "Restarting application service..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) restart wehr_app


# All services commands
.PHONY: up up.echo down down.total logs build ps
up:
	@echo "Starting all services..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d --build


up.echo:
	@echo "Starting all services with logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up --build


down:
	@echo "Stopping all services..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down


down.total:
	@echo "Stopping all services and removing volumes..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v


logs:
	@echo "Watching all services logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f


build:
	@echo "Building application image..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build wehr_app


ps:
	@echo "Running containers:"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) ps


# Cleanup commands
.PHONY: prune clean
prune:
	@echo "Pruning Docker system..."
	@docker system prune -f


clean:
	@echo "Cleaning Docker system (including volumes)..."
	@docker system prune -af --volumes


# Development commands (with hot-reload)
.PHONY: dev dev.up dev.down dev.logs dev.logs.app dev.shell dev.restart dev.build
dev:
	@echo "Starting all services in development mode with logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up wehr_app_dev wehr_database --build


dev.up:
	@echo "Starting all services in development mode (detached)..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d wehr_app_dev wehr_database --build


dev.down:
	@echo "Stopping all development services..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down wehr_app_dev wehr_database


dev.logs:
	@echo "Watching all development services logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f wehr_app_dev wehr_database


dev.logs.app:
	@echo "Watching development app logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f wehr_app_dev


dev.shell:
	@echo "Opening development app shell..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec wehr_app_dev sh


dev.restart:
	@echo "Restarting development app service..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) restart wehr_app_dev


dev.build:
	@echo "Building development app image..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build wehr_app_dev
