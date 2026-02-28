# AdoptaFácil (Producción) — Despliegue en Azure

Este repositorio contiene la aplicación **AdoptaFácil** construida con **Laravel 12 + Inertia + React + Vite**.

## Estado del despliegue

- **Plataforma**: Azure App Service (Linux)
- **Runtime**: PHP 8.2
- **Plan**: App Service Plan **Basic (B1)**, 1 instancia
- **Suscripción**: Azure for Students (crédito de **USD 100**)
- **Dominio (App Service)**: `https://adoptafacil-prod-a3f3gvdnc8hhfkfjeastus-01.azurewebsites.net`
- **CI/CD**: GitHub Actions (workflow de build + deploy)
- **Base de datos**: **SQLite** (por simplicidad; MySQL quedó pendiente)
- **Consumo**: mínimo (en la fecha de despliegue se observó ~USD 0.01)

> Nota: SQLite es viable para un MVP / tráfico bajo y 1 instancia. Si se escala a múltiples instancias o aumenta la concurrencia, conviene migrar a un motor administrado (Azure Database for MySQL / PostgreSQL).

---

## Requisitos (local)

- PHP 8.2+
- Composer
- Node.js (recomendado 18+)
- SQLite (incluido normalmente en PHP) o MySQL si cambias el driver

## Ejecución local rápida

1. Instalar dependencias:

```bash
composer install
npm install
```

2. Variables de entorno:

```bash
cp .env.example .env
php artisan key:generate
```

3. Base de datos (SQLite recomendado para desarrollo rápido):

- En `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

- Crear el archivo (si no existe):

```bash
mkdir -p database
type nul > database\database.sqlite
php artisan migrate
```

4. Levantar la app:

```bash
composer run dev
```

---

## Variables de entorno usadas en producción (Azure)

En **App Service → Configuration → Application settings** se configuran como variables de entorno.

Mínimas recomendadas:

- `APP_KEY` (obligatoria)
- `APP_URL` (dominio de App Service o tu dominio)
- `APP_ENV=production`
- `APP_DEBUG=false`

DB (SQLite):

- `DB_CONNECTION=sqlite`
- `DB_DATABASE=/home/site/wwwroot/database/database.sqlite` _(ruta típica en App Service Linux; también puede funcionar relativa)_

Auth Google (si aplica):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (debe apuntar al dominio productivo)

Otros observados/útiles:

- `SESSION_SAME_SITE`, `SESSION_SECURE_COOKIE`
- `WEBSITE_DOCUMENT_ROOT=/home/site/wwwroot/public`
- `WEBSITES_PORT` _(si aplica)_

---

## CI/CD (GitHub Actions → Azure App Service)

El despliegue está definido en:

- `.github/workflows/main_adoptafacil-prod.yml`

Qué hace:

- En `build`: checkout + PHP 8.2 + `composer install`
- Publica un artifact con el repo
- En `deploy`: login a Azure con **OIDC** (secrets) + `azure/webapps-deploy@v3`

Importante:

- Este workflow **no ejecuta `npm run build`**. Por eso, para que el frontend funcione en producción, los assets deben estar **compilados y versionados** (por ejemplo, `public/build/`).

---

## Configuración de App Service (resumen)

1. Crear el **Resource Group** y el **App Service Plan** (B1).

2. Crear la **Web App**:

- Publicación: Code
- Runtime: PHP 8.2
- OS: Linux

3. Configurar documento raíz:

- `WEBSITE_DOCUMENT_ROOT=/home/site/wwwroot/public`

4. Startup command (según el portal, usado para aplicar config de nginx):

```bash
cp /home/site/nginx-default /etc/nginx/sites-available/default && service nginx reload
```

5. Ajustar permisos/paths (SQLite, storage):

- Si es la primera vez, desde SSH:

```bash
php artisan migrate --force
php artisan storage:link
```

---

## Base de datos (SQLite) — por qué y límites

Se usa **SQLite** porque:

- Es simple (un solo archivo) y reduce costos
- El consumo esperado es bajo
- No requiere aprovisionar un servidor MySQL

Limitaciones a considerar:

- Concurrencia limitada; locks en escrituras
- Si se escala a múltiples instancias, **no es recomendable**
- Backups: hay que respaldar el archivo `database.sqlite`

---

## Troubleshooting rápido

- **Error 500**: revisar `storage/logs/laravel.log` (Logs en App Service) y validar `APP_KEY`.
- **Assets rotos**: asegurar que `public/build/` exista en el deploy.
- **Problemas con SQLite**: verificar que el path de `DB_DATABASE` exista y sea escribible.

---

## Documentación adicional

- Ver detalles completos del despliegue en: `docs/DEPLOYMENT_AZURE.md`
- Ver guía comparativa / justificación: `docs/GUIA_DESPLIEGUE.md`
