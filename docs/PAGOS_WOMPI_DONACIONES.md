# Pagos Wompi para Donaciones

## Resumen

Se implemento un MVP de pagos para el modulo de donaciones usando Wompi Web Checkout, manteniendo el recaudo centralizado en una sola cuenta Wompi de la plataforma.

La integracion se hizo con cambios pequenos sobre lo ya existente:

- `app/Http/Controllers/DonacionesController.php` sigue siendo el punto central del modulo.
- La donacion ya no nace como exitosa ni como transaccion pendiente: ahora inicia en `initiated`.
- El estado final se actualiza con webhook seguro de Wompi.
- El usuario tiene retorno desde Wompi y ve el resultado en el dashboard.
- El refugio ahora puede registrar como recibe dinero en una tabla separada.

## Arquitectura implementada

### Backend

- `DonacionesController::store`
    - valida la donacion
    - genera la referencia unica en backend
    - genera la firma de integridad de Wompi en backend
    - crea la donacion en estado `initiated`
    - responde con la URL de checkout de Wompi
- `DonacionesController::handleWompiReturn`
    - recibe el `id` de transaccion que Wompi agrega a la URL de retorno
    - consulta la transaccion en Wompi
    - actualiza la donacion local y redirige al dashboard con mensaje flash
- `DonacionesController::handleWompiWebhook`
    - valida autenticidad del evento con checksum SHA256 y `WOMPI_EVENT_SECRET`
    - procesa `transaction.updated`
    - sincroniza estado final en base de datos
- `WompiService`
    - encapsula referencia, firma, URL de checkout, consulta de transacciones y mapeo de estados

### Base de datos

Se agregaron dos migraciones nuevas:

- `2026_03_22_000000_add_wompi_fields_to_donations_table.php`
- `2026_03_22_000100_create_shelter_payment_methods_table.php`

Campos agregados a `donations`:

- `status`
- `gateway`
- `reference`
- `gateway_transaction_id`
- `gateway_payment_method`
- `gateway_payload`
- `paid_at`
- `failed_at`
- `cancelled_at`

Nueva tabla:

- `shelter_payment_methods`
    - `shelter_id`
    - `type`
    - `account_holder`
    - `document_number`
    - `bank_name`
    - `account_type`
    - `account_number`
    - `phone_number`
    - `is_active`

### Compatibilidad con shelters

La tabla `shelters` no se destruyo ni se rehizo.

- Si el refugio usa `bank_account`, tambien se siguen llenando `bank_name`, `account_type` y `account_number`.
- Si el refugio cambia a `nequi` o `daviplata`, esos campos legacy quedan en `null` para no dejar datos inconsistentes.
- Las cuentas bancarias antiguas de `shelters` se backfillean a `shelter_payment_methods` durante la migracion.

## Flujo de donacion

1. El cliente abre el formulario de donacion.
2. El backend crea una fila en `donations` con:
    - `status = initiated`
    - `gateway = wompi`
    - `reference = DON-...`
3. El frontend redirige al checkout de Wompi.
4. Wompi procesa el pago.
5. Wompi envia webhook a `/webhooks/wompi/donaciones`.
6. La app valida firma del evento y actualiza la donacion.
7. Wompi devuelve al usuario a `/donaciones/pago/retorno?id=...`.
8. La app consulta el estado de la transaccion para mostrar un resultado coherente aun si el webhook llego despues o antes.
9. La tabla de donaciones muestra el estado persistido en DB.

## Estados de la donacion

Estados internos guardados en DB:

- `initiated`
- `pending`
- `completed`
- `cancelled`
- `failed`

Mapeo desde Wompi:

- `APPROVED` -> `completed`
- `PENDING` -> `pending`
- `VOIDED` -> `cancelled`
- `DECLINED` -> `failed`
- `ERROR` -> `failed`

Semantica recomendada:

- `initiated`: la plataforma ya genero el checkout, pero todavia no conoce una transaccion consultable en Wompi
- `pending`: Wompi ya reporto una transaccion y aun no entrega un estado final
- `cancelled`: Wompi reporto anulacion o el checkout se abandono/expiró
- `failed`: Wompi reporto rechazo o error del medio de pago

Notas:

- El estado de verdad para conciliacion es el guardado en DB.
- El webhook es la confirmacion principal.
- La URL de retorno hace una sincronizacion adicional para mejorar UX.

## Webhook

Ruta:

- `POST /webhooks/wompi/donaciones`

Validacion implementada:

- se lee `X-Event-Checksum` o `signature.checksum`
- se toman dinamicamente las rutas listadas en `signature.properties`
- se concatena:
    - valores de `signature.properties`
    - `timestamp` del evento
    - `WOMPI_EVENT_SECRET`
- se genera `sha256`
- se compara contra el checksum recibido

Si el checksum no coincide, el webhook se rechaza con `400`.

## Variables de entorno

Variables nuevas en `.env.example`:

```env
WOMPI_PUBLIC_KEY=
WOMPI_INTEGRITY_SECRET=
WOMPI_EVENT_SECRET=
WOMPI_API_URL=https://sandbox.wompi.co/v1
WOMPI_CHECKOUT_URL=https://checkout.wompi.co/p/
```

Variables clave que debes tener bien configuradas tambien:

```env
APP_URL=https://tu-app.azurewebsites.net
```

### Valores recomendados por entorno

Sandbox:

```env
WOMPI_PUBLIC_KEY=pub_test_...
WOMPI_INTEGRITY_SECRET=test_integrity_...
WOMPI_EVENT_SECRET=test_events_...
WOMPI_API_URL=https://sandbox.wompi.co/v1
WOMPI_CHECKOUT_URL=https://checkout.wompi.co/p/
```

Produccion:

```env
WOMPI_PUBLIC_KEY=pub_prod_...
WOMPI_INTEGRITY_SECRET=prod_integrity_...
WOMPI_EVENT_SECRET=prod_events_...
WOMPI_API_URL=https://production.wompi.co/v1
WOMPI_CHECKOUT_URL=https://checkout.wompi.co/p/
```

## Azure App Service

### Variables que debes cargar en Azure

En `App Service > Settings > Environment variables`, agrega o valida:

- `APP_URL`
- `APP_ENV`
- `APP_DEBUG`
- `WOMPI_PUBLIC_KEY`
- `WOMPI_INTEGRITY_SECRET`
- `WOMPI_EVENT_SECRET`
- `WOMPI_API_URL`
- `WOMPI_CHECKOUT_URL`

Valor recomendado:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://TU_APP_SERVICE.azurewebsites.net` o tu dominio final HTTPS

### Recomendacion fuerte para datos de pagos

Para produccion real con donaciones y conciliacion, evita dejar la base principal en SQLite dentro de App Service:

- si despliegas por ZIP a `/home/site/wwwroot`, el contenido desplegado puede reemplazar archivos del sitio
- SQLite no es la opcion recomendada para pagos reales, webhooks y crecimiento operacional
- para produccion real usa una base administrada como Azure Database for MySQL o PostgreSQL

### Importante para que Wompi funcione

- `APP_URL` debe ser HTTPS y publico.
- La URL del webhook de Wompi debe apuntar al dominio publico real.
- La URL de retorno tambien debe salir desde ese mismo dominio.

## Paso a paso para configurar Wompi

### 1. Crear cuenta

1. Entra a `https://comercios.wompi.co`.
2. Crea tu comercio.
3. Completa el onboarding necesario para aceptar pagos.

### 2. Obtener credenciales

1. Entra al dashboard del comercio.
2. Abre `Desarrollo > Programadores`.
3. Copia estas credenciales del ambiente que vayas a usar:
    - llave publica
    - secreto de integridad
    - secreto de eventos

### 3. Elegir ambiente

- Para pruebas usa llaves `pub_test_`, `test_integrity_`, `test_events_`.
- Para produccion usa llaves `pub_prod_`, `prod_integrity_`, `prod_events_`.

### 4. Configurar URLs en Wompi

Webhook:

- `https://TU_DOMINIO/webhooks/wompi/donaciones`

Retorno:

- no se configura separado en dashboard
- la app lo envia al checkout como `redirect-url`
- el valor efectivo es:
    - `https://TU_DOMINIO/donaciones/pago/retorno`

### 5. Configurar tu App

1. Sube variables de entorno a Azure.
2. Publica el deploy.
3. Ejecuta migraciones:

```bash
php artisan migrate --force
```

### 6. Probar el flujo completo

1. Entra al dashboard como cliente.
2. Crea una donacion.
3. Verifica que la donacion nazca en `pending`.
4. Completa o rechaza el pago en Wompi.
5. Confirma que:
    - llegue el webhook
    - el retorno lleve al dashboard
    - la tabla muestre `completed`, `cancelled` o `failed`

## Datos de prueba para sandbox

Si usas sandbox de Wompi:

- Tarjeta aprobada: `4242 4242 4242 4242`
- Tarjeta declinada: `4111 1111 1111 1111`
- PSE:
    - `Banco que aprueba`
    - `Banco que rechaza`

Recomendacion:

- prueba al menos una transaccion `APPROVED`
- prueba una `DECLINED`
- prueba una `VOIDED` o flujo equivalente si tu operacion lo permite

## Metodo de recepcion del refugio

El formulario ahora soporta:

- `bank_account`
    - banco
    - tipo de cuenta
    - numero de cuenta
    - titular
    - documento
- `nequi`
    - celular
    - titular
    - documento
- `daviplata`
    - celular
    - titular
    - documento

Comportamiento:

- Si el aliado aun no tiene refugio, lo registra completo.
- Si el aliado ya tiene refugio, puede abrir un modal para actualizar solo el medio de recepcion.

## Rutas nuevas

- `PUT /shelters/{shelter}`
- `POST /webhooks/wompi/donaciones`
- `GET /donaciones/pago/retorno`

## Pruebas automaticas ejecutadas

Se verifico automaticamente:

- creacion de donacion en `pending`
- generacion de referencia y checkout inicial
- validacion del formulario de metodo de recepcion
- actualizacion por webhook
- mapeo de estados de Wompi a estados internos
- retorno del usuario consultando transaccion
- importacion manual existente
- compatibilidad con tests de integridad de datos

Comandos ejecutados:

```bash
php artisan test tests/Feature/DonacionesModuleTest.php tests/Feature/DataIntegrityTest.php
npm run types
```

## Validacion manual recomendada

Con tus credenciales reales o sandbox:

1. Verifica que el checkout abra correctamente desde Azure.
2. Verifica que Wompi regrese a:
    - `https://TU_DOMINIO/donaciones/pago/retorno?id=...`
3. Verifica que Wompi envie webhook a:
    - `https://TU_DOMINIO/webhooks/wompi/donaciones`
4. Verifica que el estado cambie en DB y en la tabla del dashboard.
5. Verifica que el refugio pueda guardar:
    - cuenta bancaria
    - Nequi
    - Daviplata
6. Verifica que el cambio de metodo de recepcion no rompa refugios ya creados.

## Limitaciones actuales del MVP

- El recaudo sigue centralizado en una sola cuenta Wompi de la plataforma.
- No hay split payments.
- No hay marketplace Wompi ni OAuth de terceros.
- No hay dispersion automatica hacia el refugio.
- El formulario del donante redirige directamente al checkout de Wompi; el metodo real usado queda confirmado por Wompi al finalizar.
- La informacion del refugio queda lista para futura dispersion, pero hoy no dispara pagos automaticos.

## Checklist de salida a produccion

1. Cargar variables Wompi de produccion en Azure.
2. Confirmar `APP_URL` publico y HTTPS.
3. Ejecutar migraciones.
4. Configurar webhook de produccion en Wompi.
5. Probar una transaccion real de bajo monto.
6. Confirmar:
    - webhook recibido
    - retorno correcto
    - `completed` en tabla y DB
    - datos del refugio guardados correctamente
