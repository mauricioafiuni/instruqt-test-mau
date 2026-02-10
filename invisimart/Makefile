# ====================================================================
# Invisimart Development Commands
#
# NOTE: This Makefile requires Docker and Docker Compose to be installed.
#
# IMPORTANT: If building fails with "unauthorized: authentication failed"
#            for gcr.io images, run 'make gcr-login' first.
# ====================================================================

# Use docker compose as the command alias for running services
COMPOSE_CMD = docker compose

.PHONY: help up restart down db-seed db-migrate clean rebuild frontend-local test-db-products test-db-inventory test-db-inventory-events test-api-products test-api-inventory gcr-login pull

help: ## Show this help message
	@echo "Available commands (using Docker Compose):"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all services using Docker Compose
	$(COMPOSE_CMD) up -d --build

down: ## Stop all services using Docker Compose
	$(COMPOSE_CMD) down

pull: ## Pre-pull all service images using Docker Compose
	$(COMPOSE_CMD) pull

frontend-local: ## Start the frontend service locally
	cd frontend && API_URL=http://localhost:8080 npm run dev

restart: ## Restart all services using Docker Compose
	$(COMPOSE_CMD) restart

rebuild: down up

gcr-login: ## Authenticate Docker to gcr.io (required for distroless images)
	# Use 'gcloud auth print-access-token' to securely log Docker into gcr.io
	# Username is oauth2accesstoken, and password is the token output by gcloud
	gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin gcr.io
	@echo "Docker is now authenticated to gcr.io."

# Database seed command
db-seed: ## Seed the Postgres database with initial data
	@echo "Database seeding is now handled automatically by the custom database image"
	@echo "The seed script runs automatically when the database container starts for the first time"

db-migrate: ## Run database migration to add purchases tables (for existing databases)
	@./scripts/migrate-purchases-tables.sh

test-db-products: ## Show all products from the database
	$(COMPOSE_CMD) exec db psql -U invisimart -d invisimartdb -c "SELECT * FROM products;"

test-db-inventory: ## Show all inventory from the database
	$(COMPOSE_CMD) exec db psql -U invisimart -d invisimartdb -c "SELECT * FROM inventory;"

test-db-inventory-events: ## Show inventory events from the database
	$(COMPOSE_CMD) exec db psql -U invisimart -d invisimartdb -c "SELECT * FROM inventory_events ORDER BY created_at DESC LIMIT 20;"

test-api-products: ## Test the /products API endpoint
	curl -s http://localhost:8080/products | jq .

test-api-inventory: ## Test the /inventory API endpoint
	curl -s http://localhost:8080/inventory | jq .

clean: ## Clean build artifacts
	rm -f api/invisimart-api
	rm -rf frontend/build
