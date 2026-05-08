FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    zip \
    libpng-dev \
    libonig-dev \
    libxml2-dev

# Install MongoDB extension
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy application
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Laravel optimizations
RUN php artisan optimize:clear || true
RUN php artisan config:cache || true
RUN php artisan route:cache || true

EXPOSE 10000

# Use a shell script or direct command to bind to the port provided by the environment
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
