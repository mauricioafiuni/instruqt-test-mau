FROM postgres:15

# Copy seed script to the initialization directory
COPY db_seed_dashed.sql /docker-entrypoint-initdb.d/01-seed.sql

# PostgreSQL will automatically run scripts in /docker-entrypoint-initdb.d/ 
# on container startup if the database is being initialized for the first time