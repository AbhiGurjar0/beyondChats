# Use the official PHP image with Apache
FROM php:8.2-apache

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    libpq-dev  

# 2. Clear cache to reduce image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Install PHP extensions (adjust if you need more)
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# 4. Enable Apache mod_rewrite (Essential for Laravel routing)
RUN a2enmod rewrite

# 5. Configure Apache Document Root to point to /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 6. Set working directory
WORKDIR /var/www/html

# 7. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 8. Copy application files
COPY . .

# 9. Install PHP dependencies
# --no-dev: Exclude dev dependencies (phpunit, etc.)
# --optimize-autoloader: Speed up loading classes
RUN composer install --no-interaction --no-dev --prefer-dist --optimize-autoloader --no-scripts --ignore-platform-req=php

# 10. Set permissions for Laravel Storage and Cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache


# 12. Expose port 80 (Render usually maps this automatically)
EXPOSE 80

CMD ["apache2-foreground"]