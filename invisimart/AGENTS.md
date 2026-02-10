# Invisimart Copilot Instructions

## Project Overview

Invisimart is a microservices e-commerce platform used for HashiCorp sales demos. It's a **fictional** e-commerce platform that simulates real shopping experiences to demonstrate HashiCorp products like Terraform, Vault, Waypoint, and Nomad. While not production-ready, it must be sufficiently realistic for demonstrations.

## Architecture

**Core Services:**
- **Frontend** (`frontend/`): Next.js app with TypeScript and Tailwind CSS on port 8000
- **API Service** (`api/`): Go REST API on port 8080 serving from PostgreSQL DB
- **Inventory Simulator** (`inventory/`): Go service with real-time inventory simulation

**Database Design:**
- **Main DB** (`invisimartdb`, port 5432): Custom PostgreSQL container with built-in seed scripts. Contains both static product catalog and dynamic inventory tracking with event logging across store locations (`main-store`, `downtown-store`, `mall-store`)
- **Database Container** (`database/`): Custom image extending postgres:15 with automatic seeding using "dashed" product set

## Essential Development Commands

**Always use these Docker Compose commands, not individual service commands:**

```bash
make up           # Start all services with Docker Compose + auto-seed DB
make down         # Stop all services
make restart      # Restart all services
make db-seed      # Shows info about automatic database seeding (no longer needed)
```

**Frontend Development:**
```bash
make frontend-local  # Run Next.js locally while using containerized backend
```

**Access Points After `make up`:**
- Frontend: http://localhost:8000 (not 3000!)
- Admin inventory: http://localhost:8000/admin/inventory
- Admin events: http://localhost:8000/admin/events
- API: http://localhost:8080

## Development Patterns

### Frontend Data Fetching
Components use **graceful degradation**: try `/inventory` endpoint first (includes stock data), fallback to `/products` (catalog only). See `ProductList.tsx` lines 18-35.

### Go API Organization
- All handlers in `api/handlers/` directory
- Database connections managed per handler (no global DB instance)
- CORS middleware applied globally in `main.go`
- RESTful routes: `/products`, `/products/{id}`, `/inventory`, `/inventory/events`

### Product Data Structure
- Backend uses `product_id` (string) as primary identifier
- Frontend interface uses `id` field (maps to `product_id`)
- Product images served from `/product_images/` (all "invisible" themed products)

### Database Schema
- Products: `id` (serial), `product_id` (varchar), `name`, `image`, `price`
- Inventory: `product_id`, `stock`, `location`, `updated_at`
- Events: `event_type` ("purchase"/"restock"), `quantity_change`, `previous_stock`, `new_stock`

## Service-Specific Commands

### API Service (Go, api/)
```bash
cd api
make run            # go run main.go
make dev            # requires air
make build          # produces ./invisimart-api
make deps           # go mod download && tidy
make test           # go test ./...
make lint           # golangci-lint run
```

### Inventory Simulator (Go, inventory/)
```bash
cd inventory
make deps
make run            # builds then runs ./bin/inventory-simulator
```

### Database Container (PostgreSQL, database/)
```bash
cd database
# Custom container automatically seeds on first startup
# Uses db_seed_dashed.sql by default
# No manual commands needed - handled by docker-compose
```

### Frontend (Next.js, frontend/)
```bash
cd frontend
make install
API_URL=http://localhost:8080 make start
make build
npm run lint
```

## Environment Dependencies

- Go services require database connection env vars (see `docker-compose.yml`)
- Frontend requires `API_URL` (defaults to localhost:8080)
- All services containerized; always use Docker Compose for full stack

## Critical Notes

- **Frontend port is 8000 in Docker, not default Next.js 3000**
- Two separate PostgreSQL instances on different ports (5432 vs 5433)
- Always use `make up` for full stack - individual service startup missing dependencies
- Database seeding happens automatically via custom database container image
- This is a demo application for HashiCorp sales, not production code

## Testing Commands

```bash
# Database testing
make test-db-products        # Show all products
make test-db-inventory       # Show all inventory
make test-db-inventory-events # Show recent inventory events

# API testing
make test-api-products       # Test /products endpoint
make test-api-inventory      # Test /inventory endpoint
```

## Common Workflows

**Full Stack Development:**
```bash
make up              # Start everything
# Frontend: http://localhost:8000, API: http://localhost:8080
```

**Local Frontend Development:**
```bash
make frontend-local  # Run frontend locally against Docker API
```

**Debugging:**
```bash
make down && make up  # Clean restart
make db-seed         # Shows info about automatic seeding (no manual seeding needed)
```

## Inventory Simulation

The inventory service runs continuous background simulation:
- **Purchases**: Random quantity reduction at specified intervals
- **Restocks**: Smart restocking (prefers low-stock items) at different intervals
- **Multi-location tracking**: Event logging for audit trails across store locations

## Key File Structure

```
├── api/              # Go REST API service
├── database/         # Custom PostgreSQL container with seed scripts
├── frontend/         # Next.js TypeScript frontend
├── inventory/        # Go inventory simulator
├── docker-compose.yml # Main orchestration
├── Makefile          # Essential commands
├── packer/           # AMI packaging
└── terraform/        # Infrastructure deployment
```