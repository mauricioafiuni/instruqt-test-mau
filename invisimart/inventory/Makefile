.PHONY: build run clean deps

# Build the inventory simulator
build:
	go build -o bin/inventory-simulator main.go

# Run the inventory simulator locally
run: build
	./bin/inventory-simulator

# Clean build artifacts
clean:
	rm -rf bin/

# Download dependencies
deps:
	go mod download
	go mod tidy

# Run with Docker
docker-build:
	docker build -t invisimart-inventory .

docker-run:
	docker run --rm \
		-e DB_HOST=localhost \
		-e DB_PORT=5432 \
		-e DB_USER=invisimart \
		-e DB_PASSWORD=invisimartpass \
		-e DB_NAME=invisimartdb \
		--network=host \
		invisimart-inventory
