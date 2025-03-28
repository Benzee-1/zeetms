#!/bin/bash

# Wait for the database to be ready
until pg_isready -h database -p 5432 -U tms_user; do
  echo "Waiting for database to be ready..."
  sleep 2
done

echo "Database is ready!"

# Start the application
exec "$@"