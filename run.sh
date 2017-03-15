#! /bin/bash
set -e

echo "Download node library"
npm install
echo "Download successfully"

echo "start to migration..."
./node_modules/db-migrate/bin/db-migrate up --migrations-dir ./migrations
echo "migration successfully"

echo "start app..."
npm start

$@
