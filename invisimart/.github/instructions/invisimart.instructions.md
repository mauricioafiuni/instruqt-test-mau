# Invisimart Copilot Instructions

## What is Invisimart?
Invisimart is an example application, used as part of a series of sales demos showcasing HashiCorp products, like Terraform, Vault, Waypoint, or Nomad. It is a simplified e-commerce platform that serves to help us demonstrate how our products can be used to manage infrastructure, deploy applications, or secure secrets.

It is **not** meant to be a true production system. It is a **fictional** e-commerce platform that simulates some of the elements of a shopping experience. However, it must be sufficiently realistic to demonstrate how our products can be used in real-world scenarios.

## Architecture Overview

## Architecture Overview

Invisimart is a **microservices e-commerce platform** with three main services:

- **Frontend** (`frontend/`): Next.js app on port 3000/8000 with TypeScript, Tailwind CSS
- **API Service** (`api/`): Go REST API on port 8080 serving product and inventory data from PostgreSQL DB (port 5432)
- **Inventory Simulator** (`inventory/`): Go service simulating real-time inventory changes on the same PostgreSQL DB

### Key Architectural Pattern: Database Design
- **DB** (`invisimartdb`): Contains both static product catalog and dynamic inventory tracking with event logging across multiple store locations (`main-store`, `downtown-store`, `mall-store`)

## Critical Development Workflows

### Essential Commands (Use These, Not Individual Service Commands)
```bash
make up          # Start all services with Docker Compose + auto-seed DB
make down        # Stop all services
make db-seed     # Seed database with products (auto-run with `make up`)
make restart     # Restart all services
```

### Frontend Development Pattern
```bash
make frontend-local  # Runs Next.js locally while using containerized backend
# Sets API_URL=http://localhost:8080 automatically
```

### Access Points After `make up`
- Frontend: http://localhost:8000 (not 3000!)
- Admin inventory: http://localhost:8000/admin/inventory
- Admin events: http://localhost:8000/admin/events
- API: http://localhost:8080

## Project-Specific Patterns

### Frontend Data Fetching Strategy
Components use **graceful degradation**: try `/inventory` endpoint first (includes stock data), fallback to `/products` (catalog only). See `ProductList.tsx` lines 18-35.

### Go API Handler Organization
- All handlers in `api/handlers/` directory
- Database connections managed per handler (no global DB instance)
- CORS middleware applied globally in `main.go`
- Routes follow RESTful pattern: `/products`, `/products/{id}`, `/inventory`, `/inventory/events`

### Product Data Structure
- Backend uses `product_id` (string) as primary identifier
- Frontend interface uses `id` field (maps to `product_id`)
- Stock data includes both online/in-store inventory levels
- Product images served from `/product_images/` (all "invisible" themed products)

### Inventory Event Simulation
The inventory service runs continuous background simulation:
- Purchases: Random quantity reduction at a specified interval
- Restocks: Smart restocking (prefers low-stock items) at a different interval (less often than purchases)
- Multi-location tracking with event logging for audit trails

### Database Schema Key Points
- Products table: `id` (serial), `product_id` (varchar), `name`, `image`, `price`
- Inventory table: `product_id`, `stock`, `location`, `updated_at`
- Events table: `event_type` ("purchase"/"restock"), `quantity_change`, `previous_stock`, `new_stock`

## Environment Dependencies
- Go services require database connection env vars (see `docker-compose.yml`)
- Frontend requires `API_URL` (defaults to localhost:8080)
- All services containerized; local development uses Docker Compose orchestration

## Common Gotchas
- Frontend port is 8000 in Docker, not default Next.js 3000
- Two separate PostgreSQL instances (different ports: 5432 vs 5433)
- Always use `make up` for full stack - individual service startup missing dependencies
- Database seeding happens automatically with `make up` but can be run separately with `make db-seed`
