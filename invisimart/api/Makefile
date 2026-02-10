# Invisimart API Makefile

.PHONY: help run build test clean docker-build docker-run dev install-tools fmt lint

# Default target
help: ## Show this help message
	@echo "Invisimart API - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Development
run: ## Run the API locally
	go run main.go

dev: ## Run with hot reload (requires air)
	air

build: ## Build the API binary
	go build -o invisimart-api main.go

build-prod: ## Build optimized binary for production
	go build -ldflags "-s -w" -o invisimart-api main.go

# Dependencies
deps: ## Download and tidy dependencies
	go mod download
	go mod tidy

install-tools: ## Install development tools
	go install github.com/air-verse/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Testing and Quality
test: ## Run tests
	go test ./...

test-verbose: ## Run tests with verbose output
	go test -v ./...

test-coverage: ## Run tests with coverage report
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

fmt: ## Format code
	go fmt ./...

lint: ## Run linter
	golangci-lint run

# Docker
docker-build: ## Build Docker image
	docker build -t invisimart-api .

docker-run: ## Run Docker container
	docker run -p 8080:8080 invisimart-api

docker-run-env: ## Run Docker container with environment file
	docker run -p 8080:8080 --env-file .env invisimart-api

docker-shell: ## Run Docker container with shell access
	docker run -it --entrypoint /bin/sh invisimart-api

# Cleanup
clean: ## Clean build artifacts
	rm -f invisimart-api
	rm -f invisimart-api-*
	rm -f coverage.out coverage.html
	go clean

# Cross-platform builds
build-linux: ## Build for Linux
	GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o invisimart-api-linux main.go

build-windows: ## Build for Windows
	GOOS=windows GOARCH=amd64 go build -ldflags "-s -w" -o invisimart-api.exe main.go

build-darwin: ## Build for macOS
	GOOS=darwin GOARCH=amd64 go build -ldflags "-s -w" -o invisimart-api-darwin main.go

build-all: build-linux build-windows build-darwin ## Build for all platforms
