#!/bin/sh

# Salir inmediatamente si un comando falla
set -e

# Crear las carpetas necesarias dentro del volumen de storage
echo "Creating storage directories..."
mkdir -p /app/storage/framework/cache/data
mkdir -p /app/storage/framework/sessions
mkdir -p /app/storage/framework/views
mkdir -p /app/storage/logs
mkdir -p /app/storage/app/public

# Asignar los permisos correctos (muy importante)
chmod -R 775 /app/storage
chown -R www-data:www-data /app/storage

# Ejecutar las migraciones de la base de datos
echo "Running database migrations..."
php /var/www/artisan migrate --force

# Crear el enlace simbólico para las imágenes públicas
echo "Linking storage..."
php /var/www/artisan storage:link

# Iniciar el servidor de la aplicación
echo "Starting Laravel server..."
php /var/www/artisan serve --host=0.0.0.0 --port=${PORT:-8000}