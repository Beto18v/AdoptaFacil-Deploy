# Pruebas (local) — AdoptaFácil

Este proyecto ya trae **Pest + PHPUnit** configurado para pruebas automáticas de backend Laravel.

## Qué pruebas ya están aplicadas

### 1) Pruebas unitarias

- **Estado actual**: **parcial / mínimo**.
- Hay soporte para el suite `Unit` en `phpunit.xml`, pero hasta ahora el proyecto casi no tenía archivos en `tests/Unit/`.
- En este entregable se agregaron unit tests simples (sin HTTP) para:
    - Reglas de `Policies`.
    - `SecureFileUpload` (validación y almacenamiento seguro).

> Nota: en Laravel, muchas “unitarias” terminan tocando el framework (facades, filesystem, etc.). Si quieres unit tests 100% puros, enfócalos a clases de dominio (Services) y usa mocks.

### 2) Pruebas de integración (Feature)

- **Estado actual**: **sí aplicadas**.
- Hay pruebas Feature que ejercitan rutas, sesión y componentes del stack Laravel (middleware, validación, notificaciones, DB, etc.):
    - Auth: login/registro/verificación email/confirmación password/reset password.
    - Settings: perfil y cambio de contraseña.
    - Dashboard: acceso invitado vs autenticado.
    - Estadísticas: generación de PDFs (validación de headers/content-type).

Estas pruebas corren con:

- `DB_CONNECTION=sqlite` y `DB_DATABASE=:memory:` (en `phpunit.xml`).
- `RefreshDatabase` activado (resetea BD entre tests).

### 3) Pruebas de carga

- **Estado actual**: **no aplicadas como suite**.
- Se agrega tooling local con **k6** (scripts) para generar carga contra tu servidor local.

### 4) Pruebas de estrés

- **Estado actual**: **no aplicadas como suite**.
- Se agrega script de **k6** con rampa agresiva (incremento de VUs) para identificar el punto de degradación.

---

## Cómo ejecutar las pruebas existentes (backend)

Desde la raíz del repo:

- Ejecutar todo:

```bash
php artisan test
```

- Ejecutar solo Feature (integración):

```bash
php artisan test --testsuite Feature
```

- Ejecutar solo Unit:

```bash
php artisan test --testsuite Unit
```

- Filtrar por nombre:

```bash
php artisan test --filter=registration
```

### Generar evidencia para el entregable

- Reporte JUnit:

```bash
mkdir -p storage/test-results
php artisan test --log-junit storage/test-results/junit.xml
```

- Vista visual (HTML) desde el JUnit XML (requiere Node/npm):

```bash
npm i -D junit-viewer
npx junit-viewer --results=storage/test-results --save=storage/test-results/junit.html
```

En Windows (PowerShell) para abrirlo:

```powershell
Start-Process .\storage\test-results\junit.html
```

---

## Cómo agregar las pruebas faltantes

### A) Agregar más unit tests

Recomendado para reglas de negocio, helpers y policies, sin pasar por HTTP.

- Ubicación: `tests/Unit/`
- Estilo: Pest (`test('...', fn () => ...)`)

Ejemplos ya incluidos:

- `tests/Unit/PoliciesTest.php`
- `tests/Unit/SecureFileUploadTest.php`

Siguiente paso típico:

- Crear tests para `Services/` (si agregas lógica de negocio allí) y mantenerlos sin DB si es posible.

### B) Ampliar integración (Feature)

Recomendado para flujos completos:

- endpoints en `routes/web.php` / `routes/api.php`
- autorización (policies)
- validación de Requests
- DB + relaciones

Patrón recomendado:

- Crear usuario con rol específico (admin/aliado/cliente), hacer `actingAs($user)`
- Ejecutar request HTTP (`get/post/patch/delete`)
- Afirmar status + redirección + cambios en BD (`assertDatabaseHas`)

---

## Pruebas de carga y estrés (solo local)

### Requisito

Levanta el servidor local primero (en otra terminal):

```bash
php artisan serve
```

Por defecto, los scripts usan `BASE_URL=http://127.0.0.1:8000`.

### Opción 1: k6 instalado (Windows)

- Si tienes `winget`:

```bash
winget install k6.k6
```

Luego:

```bash
set BASE_URL=http://127.0.0.1:8000
k6 run tests/Performance/k6-smoke.js
k6 run tests/Performance/k6-load.js
k6 run tests/Performance/k6-stress.js
```

### Opción 2: k6 vía Docker (sin instalar)

```bash
docker run --rm -i -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run - < tests/Performance/k6-smoke.js
```

> Nota: si tu Docker no resuelve `host.docker.internal`, usa la IP local.

### Exportar resultados

Puedes exportar el resumen a JSON:

```bash
k6 run --summary-export=storage/test-results/k6-load.json tests/Performance/k6-load.js
```

---

## Interpretación rápida (para documentar)

- **Carga**: el objetivo es mantener latencias razonables (ej. p95) y una tasa de error baja con concurrencia “esperada”.
- **Estrés**: el objetivo es encontrar el punto donde la app degrada (latencia sube, aparecen 5xx/429, saturación CPU/IO).

Sugerencia de evidencia:

- Capturar la salida del resumen de k6 y adjuntarla (texto o JSON).
- Registrar el hardware local y configuración (PHP/Node/DB) usada en la prueba.
