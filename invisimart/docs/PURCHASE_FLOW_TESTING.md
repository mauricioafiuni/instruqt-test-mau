# Purchase Flow Testing and Verification

## Overview

This document describes the testing performed to verify the purchase flow and database connectivity.

## Problem Statement

Users were experiencing the error:
```
Database insert error: pq: relation "purchases" does not exist
```

This occurred because the database was initialized before the purchase flow feature was added, and the `purchases` and `purchase_items` tables were missing.

## Solution Verification

### 1. Database Schema Verification

**Test**: Verified that fresh database installations have the correct schema.

```bash
docker compose exec db psql -U invisimart -d invisimartdb -c "\dt"
```

**Result**: ✓ Confirmed the following tables exist:
- `products` - Product catalog
- `purchases` - Purchase orders
- `purchase_items` - Items in each purchase

### 2. Migration Script Testing

**Test**: Tested the migration script for existing databases.

**Steps**:
1. Dropped the purchases tables to simulate the error condition
2. Ran the migration script: `./scripts/migrate-purchases-tables.sh`
3. Verified tables were created successfully
4. Ran the script again to test idempotency

**Results**: ✓ All tests passed
- Script correctly detected missing tables
- Tables created with proper schema
- Indexes created correctly
- Script detected existing tables on second run (idempotent)

### 3. Purchase Endpoint Testing

**Test**: End-to-end purchase workflow testing with the API.

#### Test Case 1: Single Item Purchase

**Request**:
```bash
curl -X POST http://localhost:8080/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "555-1234",
    "creditCard": "4111111111111111",
    "billingAddress": "123 Test St",
    "items": [
      {
        "productId": "1",
        "productName": "Bicycle",
        "quantity": 1,
        "unitPrice": 900.00
      }
    ]
  }'
```

**Response**: ✓ Success
```json
{
  "orderId": "INV-f84afb94",
  "status": "completed",
  "message": "Purchase completed successfully",
  "total": 900,
  "timestamp": "2025-10-30T11:55:42Z"
}
```

**Database Verification**: ✓ Data correctly inserted
- Purchase record created with order ID, customer info, and total
- Purchase item created with product details and quantity
- Sensitive data (phone, credit card) encrypted using mock encryption

#### Test Case 2: Multiple Items Purchase

**Request**:
```bash
curl -X POST http://localhost:8080/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "customerPhone": "555-5678",
    "creditCard": "4222222222222222",
    "billingAddress": "456 Oak Ave",
    "items": [
      {
        "productId": "2",
        "productName": "Bow and Arrow",
        "quantity": 2,
        "unitPrice": 250.00
      },
      {
        "productId": "5",
        "productName": "Coffee Mug",
        "quantity": 3,
        "unitPrice": 20.00
      }
    ]
  }'
```

**Response**: ✓ Success
```json
{
  "orderId": "INV-93e58353",
  "status": "completed",
  "message": "Purchase completed successfully",
  "total": 560,
  "timestamp": "2025-10-30T11:56:40Z"
}
```

**Database Verification**: ✓ Data correctly inserted
- Purchase record created with correct total (2×250 + 3×20 = 560)
- Two purchase items created correctly
- Foreign key relationship maintained

#### Test Case 3: Retrieve Purchase Details

**Request**:
```bash
curl http://localhost:8080/purchase?orderId=INV-f84afb94
```

**Response**: ✓ Success
```json
{
  "orderId": "INV-f84afb94",
  "customerName": "Test User",
  "customerEmail": "test@example.com",
  "billingAddress": "123 Test St",
  "totalAmount": 900,
  "status": "completed",
  "createdAt": "2025-10-30T11:55:42Z",
  "items": [
    {
      "productId": "1",
      "productName": "Bicycle",
      "quantity": 1,
      "unitPrice": 900
    }
  ]
}
```

**Verification**: ✓ All data correctly retrieved
- Customer information returned (non-sensitive fields only)
- Items array properly populated
- Timestamps and status correct

## Database Schema Details

### purchases table
```sql
CREATE TABLE purchases (
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
```

**Indexes**:
- Primary key on `id`
- Unique constraint on `order_id`
- Index on `order_id` for lookups
- Index on `created_at DESC` for recent orders

### purchase_items table
```sql
CREATE TABLE purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- Primary key on `id`
- Index on `purchase_id` for joins
- Foreign key to `purchases(id)` with cascade delete

## Conclusion

✓ **All tests passed successfully**

The purchase flow is working correctly:
- Database schema is properly defined
- Migration script works reliably
- Purchase creation endpoint handles single and multiple items
- Data is correctly stored with proper relationships
- Retrieval endpoint returns complete purchase details
- Sensitive data is encrypted (mock encryption when Vault unavailable)

## How Users Can Verify

Users experiencing the "purchases does not exist" error can fix it with:

```bash
# Option 1: Run migration (preserves data)
make db-migrate

# Option 2: Recreate database (loses data)
make down
docker volume rm invisimart_db_data
make up
```

Then test the purchase flow:
```bash
# Test a simple purchase
curl -X POST http://localhost:8080/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test",
    "customerEmail": "test@test.com",
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

Expected: HTTP 201 response with order ID and status "completed"
