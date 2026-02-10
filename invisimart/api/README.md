# Invisimart API

Go-based REST API service for the Invisimart e-commerce application.

## Prerequisites

- Go 1.21 or later
- Docker (optional, for containerized deployment)

## Local Development

### Install Dependencies
```bash
go mod tidy
```

### Run Locally
```bash
# Development mode with hot reload (using air - optional)
go run main.go

# Or build and run
go build -o invisimart-api main.go
./invisimart-api
```

The API will start on `http://localhost:8080`

### Available Endpoints

- `GET /health` - Health check endpoint
- `GET /health/db` - Test database connection
- `GET /products` - List all products
- `GET /products/{id}` - Get a specific product by ID
- `GET /inventory` - Get current inventory levels for all products
- `GET /inventory/events` - Get recent inventory change events

### Environment Variables

Create a `.env` file in the api directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=invisimart
DB_PASSWORD=your_password
DB_NAME=invisimartdb
```
AWS_REGION=us-west-2
S3_BUCKET=invisimart-images
```

## Docker

### Build Docker Image
```bash
docker build -t invisimart-api .
```

### Run with Docker
```bash
# Run locally
docker run -p 8080:8080 invisimart-api

# Run with environment variables
docker run -p 8080:8080 \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_password \
  invisimart-api
```

### Docker Compose
```bash
# If you have a docker-compose.yml in the root
docker-compose up api
```

## Development Tools

### Recommended Tools
- **Air**: Live reload for Go applications
  ```bash
  go install github.com/air-verse/air@latest
  air
  ```

### Testing
```bash
go test ./...
```

### Code Formatting
```bash
go fmt ./...
```

### Linting
```bash
# Install golangci-lint
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run linter
golangci-lint run
```

## Project Structure

```
api/
├── main.go          # Application entry point
├── go.mod           # Go module definition
├── go.sum           # Go dependencies
├── README.md        # This file
├── Dockerfile       # Docker configuration
├── handlers/        # HTTP request handlers
├── models/          # Data models
├── middleware/      # HTTP middleware
├── config/          # Configuration files
└── tests/           # Test files
```

## Building for Production

### Cross-platform builds
```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o invisimart-api-linux main.go

# Windows
GOOS=windows GOARCH=amd64 go build -o invisimart-api.exe main.go

# macOS
GOOS=darwin GOARCH=amd64 go build -o invisimart-api-darwin main.go
```

### Optimized build
```bash
go build -ldflags "-s -w" -o invisimart-api main.go
```
