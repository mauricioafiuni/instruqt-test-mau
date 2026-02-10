help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Lambda commands
build: ## Build Lambda function
	GOOS=linux GOARCH=amd64 go build -o bootstrap main.go

package: build ## Package Lambda function for deployment
	zip lambda-function.zip bootstrap

test: ## Test Lambda function locally
	go test ./...
