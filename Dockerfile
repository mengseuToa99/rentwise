FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    supervisor

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install PCNTL extension for Reverb
RUN docker-php-ext-configure pcntl --enable-pcntl \
    && docker-php-ext-install pcntl

# Ensure mbstring is properly installed and enabled
RUN docker-php-ext-install mbstring && docker-php-ext-enable mbstring

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user to run Composer and Artisan Commands
RUN useradd -G www-data,root -u 1000 -d /home/www www
RUN mkdir -p /home/www/.composer && \
    chown -R www:www /home/www

# Set working directory
WORKDIR /var/www

# Copy custom configurations
COPY docker/php/local.ini /usr/local/etc/php/conf.d/local.ini

# Copy supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install Node.js and npm
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Ensure proper permissions for Laravel
RUN mkdir -p /var/www/storage/logs /var/www/storage/framework/sessions /var/www/storage/framework/views /var/www/storage/framework/cache
RUN chown -R www-data:www-data /var/www/storage

# Expose port 9000 for PHP-FPM and 8080 for Reverb
EXPOSE 9000 8080

# Start PHP-FPM server and Supervisor
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]