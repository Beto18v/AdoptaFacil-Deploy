# Despliegue en Azure App Service (AdoptaFácil)

Este documento explica el despliegue de la app Laravel (Inertia + React) en **Azure App Service (Linux, PHP 8.2)** con **CI/CD en GitHub Actions**.

## 1) Arquitectura del despliegue

- App: Laravel 12 (PHP)
- Frontend: Inertia + React + Vite
- Hosting: Azure App Service (PaaS)
- DB: SQLite (solo para pruebas o escenarios temporales; no recomendado para pagos reales en producción)
- CI/CD: GitHub Actions → `azure/webapps-deploy`

## 2) Creación de recursos en Azure

1. Crear **Resource Group** (ej. `rg-laravel-prod`).
2. Crear **App Service Plan** (Basic B1) en la región deseada (ej. East US).
3. Crear **Web App**:
    - Publish: Code
    - Runtime stack: PHP 8.2
    - OS: Linux

## 3) Configuración de App Service

### Variables de entorno (Configuration → Application settings)

Agregadas:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://<tu-app>.azurewebsites.net`
- `APP_KEY=<valor generado>`

SQLite:

- `DB_CONNECTION=sqlite`
- `DB_DATABASE=/home/site/wwwroot/database/database.sqlite`

Advertencia:

- Para despliegues productivos con donaciones reales, no se recomienda mantener SQLite dentro de `wwwroot`.
- La recomendación es migrar a Azure Database for MySQL o PostgreSQL antes de operar pagos reales.

Otras:

- `WEBSITE_DOCUMENT_ROOT=/home/site/wwwroot/public`
- `SESSION_SECURE_COOKIE=true`

### Startup command

En el portal se configuró el comando:

```bash
cp /home/site/nginx-default /etc/nginx/sites-available/default && service nginx reload
```

Objetivo: aplicar la configuración de Nginx provista por el entorno para servir correctamente la app (document root /public y rutas).

## 4) CI/CD con GitHub Actions

Workflow principal (deploy a producción):

- `.github/workflows/main_adoptafacil-prod.yml`

Resumen:

- Build: PHP 8.2 + `composer install`.
- Deploy: `azure/login@v2` (OIDC) + `azure/webapps-deploy@v3`.

### Importante sobre assets

El workflow de producción **no corre `npm run build`**. En este repo, `public/build/` está presente, por lo que los assets ya vienen compilados.

Si en el futuro dejas de versionar `public/build/`, tendrás que:

- Compilar en el workflow (`npm ci` + `npm run build`) y subir `public/build/` al artifact, o
- Usar un pipeline de Azure que compile antes de servir.

## 5) Pasos post-deploy (primera vez)

Desde **SSH** (App Service → SSH) ejecutar:

```bash
php artisan migrate --force
php artisan storage:link
```

Normalmente la DB se crea al conectar; si falla por permisos/ruta, crear el archivo en `database/database.sqlite`.

## 6) Observaciones sobre SQLite

SQLite puede servir para ambientes locales, sandbox o demos de una sola instancia, pero no debería ser la base objetivo para producción si el sistema va a procesar donaciones reales.

Riesgos concretos en App Service:

- el despliegue por ZIP publica contenido en `/home/site/wwwroot`, por lo que dejar la base dentro del árbol desplegado aumenta el riesgo operativo
- SQLite no es adecuada para escenarios con más concurrencia, reintentos de webhook ni escalamiento horizontal
- para pagos y trazabilidad financiera, la recomendación es usar una base administrada desde el primer entorno productivo

Recomendación:

- Azure Database for MySQL o PostgreSQL

## 7) Costos / consumo

Bajo la suscripción **Azure for Students** se usó crédito de prueba (USD 100).
Para el escenario actual (B1 + tráfico bajo), el consumo observado fue mínimo (aprox. USD 0.01 en el panel de costos en la fecha del despliegue).
