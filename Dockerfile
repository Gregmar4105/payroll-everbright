# ==========================================
# Stage 1: Node.js Frontend Asset Build
# ==========================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Install npm dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy project source code for Vite build
COPY . .

# Build frontend assets (Vite + Inertia React)
RUN npm run build

# ==========================================
# Stage 2: PHP Composer Dependencies Build
# ==========================================
FROM composer:2 AS php-builder

WORKDIR /app

# Copy Composer manifests
COPY composer.json composer.lock ./

# Install PHP production dependencies
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --ignore-platform-reqs

# Copy application source and generate optimized autoloader
COPY . .
RUN composer dump-autoload --optimize --no-dev --ignore-platform-reqs

# ==========================================
# Stage 3: Production Runtime Application
# ==========================================
FROM php:8.3-fpm-alpine

# Install system dependencies and Nginx + Supervisor
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    zip \
    unzip \
    git

# Install PHP extensions using docker-php-extension-installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# Copy custom configurations
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html

# Copy application code and vendor from builders
COPY --chown=www-data:www-data . /var/www/html
COPY --chown=www-data:www-data --from=php-builder /app/vendor /var/www/html/vendor
COPY --chown=www-data:www-data --from=frontend-builder /app/public/build /var/www/html/public/build

# Set permissions for storage & bootstrap cache
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
