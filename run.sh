#! /bin/bash
set -e

echo "start to migration..."
./node_modules/db-migrate/bin/db-migrate up --migrations-dir ./migrations
echo "migration successfully"

echo "start app..."
npm start

$@
