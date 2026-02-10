# Purchase Flow Error - Resolution Summary

## Issue
When clicking "Complete purchase" button, users were getting this error:
```
Database insert error: pq: relation "purchases" does not exist
```

## Root Cause
The purchase flow feature was added to the application after some users had already initialized their databases. The `purchases` and `purchase_items` tables are included in the seed script (`database/db_seed_dashed.sql`), but PostgreSQL only runs initialization scripts when creating a new database for the first time.

Users with existing database volumes from before the purchase flow was added don't have these tables in their database.

## Solution - Quick Fix

If you're experiencing this error, run this single command:

```bash
make db-migrate
```

This will add the missing tables to your existing database without losing any data.

## Solution - Alternative (Fresh Start)

If you don't need to preserve existing data, you can recreate the database:

```bash
make down
docker volume rm invisimart_db_data
make up
```

## What Was Fixed

### 1. Migration Script
- **File**: `scripts/migrate-purchases-tables.sh`
- **Purpose**: Adds the purchases and purchase_items tables to existing databases
- **Features**:
  - Automatically detects docker compose or podman-compose
  - Checks if database is running
  - Idempotent (safe to run multiple times)
  - Creates tables with proper schema and indexes
  - Clear success/error messages

### 2. Easy Access via Makefile
- Added `make db-migrate` command
- One simple command to fix the issue

### 3. Documentation
- **database/TROUBLESHOOTING.md**: Detailed troubleshooting guide
- **README.md**: Quick reference in main readme
- **docs/PURCHASE_FLOW_TESTING.md**: Complete testing documentation

## Verification

After running the migration, you can verify the tables exist:

```bash
# Using docker compose
docker compose exec db psql -U invisimart -d invisimartdb -c "\dt"

# Expected output:
#  Schema |      Name      | Type  |   Owner    
# --------+----------------+-------+------------
#  public | products       | table | invisimart
#  public | purchase_items | table | invisimart
#  public | purchases      | table | invisimart
```

## Testing the Purchase Flow

After the migration, test the purchase workflow:

```bash
curl -X POST http://localhost:8080/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "555-1234",
    "creditCard": "4111111111111111",
    "billingAddress": "123 Test St",
    "items": [{
      "productId": "1",
      "productName": "Bicycle",
      "quantity": 1,
      "unitPrice": 900
    }]
  }'
```

Expected: HTTP 201 response with an order ID and status "completed"

## Database Schema

The migration adds these two tables:

### purchases
- Stores order information with encrypted sensitive data
- Fields: order_id, customer_name, customer_email, encrypted phone, encrypted credit card, billing_address, total_amount, status, timestamps
- Indexed on order_id and created_at for fast lookups

### purchase_items
- Stores individual items in each order
- Fields: purchase_id (foreign key), product_id, product_name, quantity, unit_price, subtotal
- Linked to purchases table with CASCADE delete
- Indexed on purchase_id for fast joins

## Files Changed

- `scripts/migrate-purchases-tables.sh` - NEW: Migration script
- `database/TROUBLESHOOTING.md` - NEW: Troubleshooting guide
- `docs/PURCHASE_FLOW_TESTING.md` - NEW: Testing documentation
- `Makefile` - MODIFIED: Added db-migrate target
- `README.md` - MODIFIED: Added troubleshooting section

## For Developers

If you're adding new tables in the future:
1. Add table definitions to `database/db_seed_dashed.sql` (for new installations)
2. Create a migration script in `scripts/` (for existing installations)
3. Add a Makefile target for easy access
4. Update documentation

This ensures both new and existing users can use your feature.
