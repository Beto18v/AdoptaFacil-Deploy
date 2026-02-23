# Laravel Dockerfile for Railway deployment
FROM composer:2.6 as vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist

FROM node:18 as node_modules
WORKDIR /app
COPY . ./
RUN npm install && npm run build

FROM php:8.2-fpm
WORKDIR /var/www
RUN apt-get update && apt-get install -y libpng-dev libonig-dev libxml2-dev zip unzip git curl && \
    docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd
COPY --from=vendor /app/vendor ./vendor
COPY --from=node_modules /app/node_modules ./node_modules
COPY . .
RUN chown -R www-data:www-data /var/www && chmod -R 755 /var/www/storage
CMD ["sh", "start.sh"]
