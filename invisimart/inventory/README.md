# Invisimart Inventory Simulator

This service simulates real-time inventory changes for the Invisimart e-commerce platform. It randomly performs purchase and restock operations on the database to demonstrate event-driven inventory management.

## Features

- **Random Purchase Simulation**: Simulates customers buying products from different store locations
- **Random Restock Simulation**: Simulates inventory restocking with preference for low-stock items
- **Multi-Location Support**: Tracks inventory across multiple store locations (main-store, downtown-store, mall-store)
- **Event Logging**: Logs all inventory changes for audit and analytics
- **Real-time Updates**: Updates inventory every 5 seconds

## Database Schema

### inventory table
- `product_id`: References products from the database
- `stock`: Current stock level
- `location`: Store location identifier
- `updated_at`: Last update timestamp

### inventory_events table
- `product_id`: Product identifier
- `event_type`: "purchase" or "restock"
- `quantity_change`: Positive for restock, negative for purchase
- `previous_stock`: Stock level before the change
- `new_stock`: Stock level after the change
- `location`: Store location where the event occurred
- `created_at`: Event timestamp

## Environment Variables

The service requires the following environment variables:

- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (invisimartdb)

## Running the Service

### With Make
```bash
# Install dependencies
make deps

# Build and run locally
make run

# Build Docker image
make docker-build

# Run with Docker
make docker-run
```

### With Docker Compose
```bash
# Start the entire stack including inventory service
docker-compose up -d

# View inventory logs
docker-compose logs -f inventory
```

### Manual Build
```bash
go build -o inventory-simulator main.go
./inventory-simulator
```

## Sample Output

```
2024/01/15 10:30:15 Starting Invisimart Inventory Simulator...
2024/01/15 10:30:15 Successfully connected to database
2024/01/15 10:30:15 Database tables initialized successfully
2024/01/15 10:30:15 Inventory seeded successfully
2024/01/15 10:30:15 Starting inventory simulation...
2024/01/15 10:30:20 🛒 PURCHASE: Product 3 at main-store - Sold 2 units (15 → 13)
2024/01/15 10:30:25 📦 RESTOCK: Product 7 at downtown-store - Added 12 units (8 → 20)
2024/01/15 10:30:30 🛒 PURCHASE: Product 1 at mall-store - Sold 1 units (1 → 0) - OUT OF STOCK!
```

## Integration

This service is designed to work with an event-driven architecture where:

1. Inventory changes trigger events
2. The main e-commerce application listens for these events
3. Product availability is updated in real-time on the website
4. Customers see accurate stock information

Future enhancements will include:
- Message queue integration (Redis/RabbitMQ)
- WebSocket notifications to the frontend
- REST API for inventory queries
- Advanced analytics and reporting
