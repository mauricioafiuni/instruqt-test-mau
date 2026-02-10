#!/bin/bash
# Migration script to add purchases tables to existing databases
# This script adds the purchases and purchase_items tables needed for the purchase workflow

set -e

echo "====================================="
echo "Invisimart Database Migration Script"
echo "====================================="
echo ""
echo "This script will add the purchases and purchase_items tables"
echo "to your existing database."
echo ""

# Check if docker/podman compose is available
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v podman-compose &> /dev/null; then
    COMPOSE_CMD="podman-compose"
else
    echo "Error: Neither 'docker compose' nor 'podman-compose' found."
    echo "Please install Docker or Podman first."
    exit 1
fi

# Check if database container is running
if ! $COMPOSE_CMD ps db | grep -q "Up\|running"; then
    echo "Error: Database container is not running."
    echo "Please start the services first with: make up"
    exit 1
fi

echo "Database container is running."
echo ""

# Check if purchases table already exists
TABLE_EXISTS=$($COMPOSE_CMD exec -T db psql -U invisimart -d invisimartdb -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchases');")

if [ "$TABLE_EXISTS" = "t" ]; then
    echo "✓ The 'purchases' table already exists in the database."
    echo "  No migration needed. Your database is up to date!"
    exit 0
fi

echo "The 'purchases' table does not exist. Running migration..."
echo ""

# Run the migration
$COMPOSE_CMD exec -T db psql -U invisimart -d invisimartdb << 'EOF'
-- Purchases table for storing order information with encrypted sensitive data
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone_encrypted TEXT NOT NULL,
    credit_card_encrypted TEXT NOT NULL,
    billing_address TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase items table for storing individual items in each order
CREATE TABLE IF NOT EXISTS purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);

-- Verify tables were created
\dt purchases
\dt purchase_items
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Migration completed successfully!"
    echo "  The purchases and purchase_items tables have been created."
    echo ""
    echo "You can now use the purchase workflow in the application."
else
    echo ""
    echo "✗ Migration failed. Please check the error messages above."
    exit 1
fi
