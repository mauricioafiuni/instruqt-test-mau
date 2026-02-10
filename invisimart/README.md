# Invisimart

A full-stack e-commerce application built with React and Go, featuring real-time inventory tracking and secure payment processing with HashiCorp Vault.

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS (`frontend/`)
- **API Service**: Go REST API (`api/`)
- **Inventory Service**: Go service for real-time inventory simulation (`inventory/`)
- **Main Database**: PostgreSQL for products (external)
- **Inventory Database**: PostgreSQL for inventory tracking with event logging
- **Vault Integration**: HashiCorp Vault for encrypting sensitive payment data

## Features

- 🛒 **Shopping Cart**: Add products to cart and manage quantities
- 💳 **Secure Checkout**: Purchase flow with encrypted payment information
- 🔐 **Vault Integration**: Credit card and phone numbers encrypted using Vault Transit engine
- 📦 **Real-time Inventory**: Live inventory tracking across multiple locations
- 📊 **Admin Dashboard**: View inventory levels and transaction events

## Quick Start

```bash
# Start all services
make up

# Access the application
# Frontend: http://localhost:8000
# Admin Inventory: http://localhost:8000/admin/inventory
# Admin Events: http://localhost:8000/admin/events
# API: http://localhost:8080
```

## Troubleshooting

### "purchases" Table Not Found Error

If you see the error `pq: relation "purchases" does not exist` when trying to complete a purchase:

This means your database was initialized before the purchase flow feature was added. To fix this:

```bash
# Option 1: Run the migration script (preserves existing data)
make db-migrate

# Option 2: Recreate the database (deletes all data)
make down
docker volume rm invisimart_db_data
make up
```

See [database/TROUBLESHOOTING.md](database/TROUBLESHOOTING.md) for more details.

## Vault Setup (Optional for Purchase Flow)

The purchase flow requires HashiCorp Vault for encrypting sensitive data. See [docs/VAULT_SETUP.md](docs/VAULT_SETUP.md) for detailed setup instructions.

**Quick Vault Setup for Development:**

```bash
# Start Vault in dev mode (terminal 1)
vault server -dev

# Configure Vault (terminal 2)
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='<dev-root-token-from-output>'
vault secrets enable transit
vault write -f transit/keys/invisimart-key

# Start Invisimart with Vault enabled
VAULT_ADDR='http://127.0.0.1:8200' VAULT_TOKEN='<token>' make up
```

## Components

- All inventory changes are recorded as events
- Tracks inventory across different store locations
- Inventory simulator updates stock levels regularly
- View current inventory levels in the Admin Section
- Secure purchase flow with Vault-encrypted payment data

### Frontend
Next.js application with TypeScript and Tailwind CSS for the user interface.

### API Endpoints
- `GET /products` - List all products
- `GET /products/{id}` - Get specific product details
- `GET /inventory` - Current inventory levels for all products
- `GET /inventory/events` - Recent inventory change events
- `POST /purchase` - Create a new purchase order (requires Vault)
- `GET /purchase?orderId={id}` - Retrieve purchase details

### Coming Soon

- **Infrastructure packaging and deployment**: Terraform, Waypoint, Kubernetes, etc. (work in progress)
- **Storage**: AWS S3 for product images (work in progress)
- **Lambda Function**: AWS Lambda for product management and image processing (`lambda/`) (work in progress)
