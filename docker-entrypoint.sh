#!/bin/bash

# Wait for database
until nc -z -v -w30 db 3306
do
  echo "Waiting for database connection..."
  sleep 5
done

cd /var/www

# Verify and fix permissions
chown -R www-data:www-data /var/www
chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# Install dependencies if needed
if [ ! -d "vendor" ]; then
    composer install --no-scripts
fi
if [ ! -d "node_modules" ]; then
    npm install
fi

# Clear and cache routes and config
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

# Generate application key if not set
php artisan key:generate --no-interaction --force

# Run migrations
php artisan migrate --force

# Start Vite dev server in background
if [ "$APP_ENV" != "production" ]; then
    npm run dev &
fi

# Start PHP-FPM
php-fpm