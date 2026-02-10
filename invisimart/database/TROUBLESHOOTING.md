# Fixing "purchases" Table Not Found Error

## Problem

If you see this error when clicking "Complete purchase":

```
Database insert error: pq: relation "purchases" does not exist
```

This means your database was initialized before the purchase flow feature was added, and it's missing the required `purchases` and `purchase_items` tables.

## Solution

You have two options to fix this:

### Option 1: Run the Migration Script (Recommended - Preserves Data)

This option adds the missing tables to your existing database without losing any data:

```bash
./scripts/migrate-purchases-tables.sh
```

The script will:
- Check if your database is running
- Check if the tables already exist
- Create the `purchases` and `purchase_items` tables if they don't exist
- Verify the migration was successful

### Option 2: Recreate the Database (Loses All Data)

If you don't need to preserve existing data (products, inventory events, etc.), you can recreate the database from scratch:

```bash
# Stop all services
make down

# Remove the database volume (THIS WILL DELETE ALL DATA)
docker volume rm invisimart_db_data

# Start services again (database will be recreated with all tables)
make up
```

## Verification

After running either option, verify the tables exist:

```bash
# Using docker compose
docker compose exec db psql -U invisimart -d invisimartdb -c "\dt"
```

You should see three tables:
- `products`
- `purchases`
- `purchase_items`

## Why This Happens

PostgreSQL containers only run initialization scripts (like our seed script) when creating a new database. If you started the application before the purchase flow was added, your database volume was created without the purchase tables.

The seed script (`database/db_seed_dashed.sql`) now includes these tables, but existing installations need to either migrate or recreate their database.

## For Developers

If you're adding new tables to the project in the future, remember to:
1. Add the table definitions to `database/db_seed_dashed.sql` (for new installations)
2. Create a migration script in `scripts/` (for existing installations)
3. Update this documentation
