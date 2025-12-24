FROM php:8.2-apache

# Enable Apache rewrite (Laravel needs this)
RUN a2enmod rewrite

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip zip curl \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libonig-dev libxml2-dev libzip-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Set working directory
WORKDIR /var/www/html

# Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ✅ COPY PROJECT FILES FIRST
COPY . .

# # ✅ NOW composer.json exists
# RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Apache should serve /public
RUN sed -i 's|/var/www/html|/var/www/html/public|g' \
    /etc/apache2/sites-available/000-default.conf

EXPOSE 80

CMD ["apache2-foreground"]
