#!/bin/bash

# Ensure storage directory has correct permissions
chmod -R 775 /var/www/storage
chmod -R 775 /var/www/bootstrap/cache
chown -R www-data:www-data /var/www/storage
chown -R www-data:www-data /var/www/bootstrap/cache

# Generate application key if not set
php artisan key:generate --no-interaction --force

# Clear and cache routes and config
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

# Start PHP-FPM
php-fpm
