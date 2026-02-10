# Database Container

This directory contains the custom PostgreSQL database image that includes built-in seed scripts.

## Files

- `Dockerfile` - Extends postgres:15 with automatic seed script execution
- `db_seed_dashed.sql` - Default seed script with "dashed" product images (used by container)
- `db_seed_cats.sql` - Alternative seed script with "cats" product images

## How it works

The Dockerfile copies `db_seed_dashed.sql` to `/docker-entrypoint-initdb.d/01-seed.sql` inside the container. PostgreSQL automatically runs any `.sql` files in this directory when the database is initialized for the first time.

## Usage

The database container is built and used automatically by docker-compose. When you run:

```bash
make up
```

The database will start with the seed data already loaded. No manual seeding is required.

## Customizing the seed script

To use a different seed script (e.g., the cats version):

1. Modify the Dockerfile to copy the desired script
2. Rebuild the container: `docker compose up db --build -d`

## Migration from old approach

Previously, seed scripts were mounted as volumes and run manually via `make db-seed`. This approach has been replaced with the automatic seeding built into the custom database image.