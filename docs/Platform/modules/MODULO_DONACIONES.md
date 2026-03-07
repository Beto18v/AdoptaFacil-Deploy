# Módulo de Donaciones y Pagos 💰

## Descripción General

El módulo de donaciones y pagos permite a los usuarios de AdoptaFácil realizar contribuciones monetarias para apoyar la plataforma, refugios de animales y causas específicas. Este módulo integra pasarelas de pago seguras y proporciona herramientas para gestionar y rastrear todas las transacciones financieras.

## Arquitectura del Módulo

### Backend (Laravel)

#### Controlador Principal: `DonacionesController`

**Ubicación**: `app/Http/Controllers/DonacionesController.php`

**Responsabilidades**:

- Gestión del índice de donaciones para usuarios
- Procesamiento de nuevas donaciones
- Integración con pasarelas de pago
- Registro y seguimiento de transacciones
- Generación de recibos y comprobantes

**Métodos principales**:

1. **`index()`**

    - Vista de donaciones para usuario autenticado
    - Historial de donaciones realizadas
    - Estadísticas personales de contribuciones
    - Dashboard de impacto de las donaciones

2. **`store(Request $request)`**
    - Procesamiento de nueva donación
    - Validación de datos de pago
    - Integración con pasarela de pago
    - Registro en base de datos
    - Envío de confirmación por email

#### Controlador de Pagos: `PagoController`

**Ubicación**: `app/Http/Controllers/PagoController.php`

**Responsabilidades**:

- Gestión específica de transacciones de pago
- Integración con MercadoPago y otras pasarelas
- Manejo de callbacks y webhooks
- Verificación de estado de pagos
- Procesamiento de reembolsos

**Métodos principales**:

1. **`create()`**

    - Formulario de pago con opciones de donación
    - Cálculo de montos sugeridos
    - Selección de método de pago

2. **`process(Request $request)`**

    - Procesamiento del pago con la pasarela
    - Validación de datos de tarjeta/transferencia
    - Manejo de errores de pago

3. **`callback(Request $request)`**

    - Recepción de confirmaciones de pago
    - Actualización de estado de donaciones
    - Trigger de notificaciones

4. **`webhook(Request $request)`**
    - Manejo de webhooks de pasarelas
    - Verificación de autenticidad
    - Actualización automática de estados

#### Modelo Principal: `Donation`

**Ubicación**: `app/Models/Donation.php`

**Atributos principales**:

```php
$fillable = [
    'user_id',           // Usuario donante
    'amount',            // Monto de la donación
    'currency',          // Moneda (COP, USD, etc.)
    'payment_method',    // Método de pago usado
    'transaction_id',    // ID de transacción externa
    'gateway',           // Pasarela de pago utilizada
    'status',            // Estado de la donación
    'purpose',           // Propósito de la donación
    'recipient_type',    // Tipo de destinatario
    'recipient_id',      // ID del destinatario específico
    'anonymous',         // Donación anónima
    'message',           // Mensaje del donante
    'processed_at',      // Fecha de procesamiento
];
```

**Estados de Donación**:

- **pending**: Donación iniciada, esperando pago
- **processing**: Pago en proceso de verificación
- **completed**: Donación completada exitosamente
- **failed**: Pago falló o fue rechazado
- **refunded**: Donación reembolsada
- **cancelled**: Donación cancelada por el usuario

**Tipos de Destinatario**:

- **platform**: Donación general a la plataforma
- **shelter**: Donación específica a un refugio
- **mascota**: Donación para cuidado de mascota específica
- **emergency**: Donación para emergencia veterinaria

**Relaciones**:

- `belongsTo(User::class)`: Usuario donante
- `morphTo()`: Destinatario polimórfico (shelter, mascota, etc.)

### Frontend (React/TypeScript)

#### Vista Principal: `donaciones.tsx`

**Ubicación**: `resources/js/pages/Dashboard/Donaciones.tsx`

**Características**:

- Dashboard personal de donaciones
- Historial de contribuciones realizadas
- Estadísticas de impacto personal
- Formulario para nuevas donaciones
- Opciones de donación recurrente

**Componentes principales**:

1. **`DonationForm`**

    - Formulario de nueva donación
    - Selección de monto (predefinido o personalizado)
    - Elección de destinatario
    - Opciones de pago
    - Mensaje personalizado opcional

2. **`DonationCard`**

    - Tarjeta de donación individual
    - Estado y detalles de la transacción
    - Enlaces a comprobantes
    - Botones de acción (reembolso, compartir)

3. **`ImpactDashboard`**

    - Estadísticas del impacto de donaciones
    - Total donado y beneficiarios
    - Gráficos de distribución
    - Historiales de contribución

4. **`PaymentMethodSelector`**
    - Selección de método de pago
    - Formularios específicos por pasarela
    - Validación en tiempo real
    - Seguridad y encriptación

#### Integración de Pasarelas de Pago

**Componentes**: `PaymentGateway/`

**Pasarelas Soportadas**:

- MercadoPago (principal)
- PayPal (internacional)
- Stripe (futuro)
- Transferencias bancarias locales

### Base de Datos

#### Tabla Principal: `donations`

```sql
CREATE TABLE donations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    payment_method ENUM('credit_card', 'debit_card', 'bank_transfer', 'digital_wallet') NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    gateway ENUM('mercadopago', 'paypal', 'stripe', 'bank') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    purpose ENUM('platform', 'shelter', 'mascota', 'emergency') DEFAULT 'platform',
    recipient_type VARCHAR(255),
    recipient_id BIGINT,
    anonymous BOOLEAN DEFAULT FALSE,
    message TEXT,
    gateway_response JSON,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_transaction (transaction_id),
    INDEX idx_gateway (gateway)
);
```

#### Tabla de Recibos: `donation_receipts`

```sql
CREATE TABLE donation_receipts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    donation_id BIGINT NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    file_path VARCHAR(255),
    generated_at TIMESTAMP,
    sent_by_email BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);
```

#### Tabla de Configuración: `donation_settings`

```sql
CREATE TABLE donation_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    suggested_amounts JSON,
    minimum_amount DECIMAL(10,2) DEFAULT 1000,
    maximum_amount DECIMAL(10,2) DEFAULT 5000000,
    default_currency VARCHAR(3) DEFAULT 'COP',
    fee_percentage DECIMAL(5,2) DEFAULT 0,
    active_gateways JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Flujo de Trabajo

### 1. Proceso de Donación

1. Usuario navega a sección de donaciones
2. Selecciona tipo y monto de donación
3. Elige destinatario específico (opcional)
4. Selecciona método de pago
5. Completa información de pago
6. Confirmación y procesamiento
7. Recibo por email y en plataforma

### 2. Verificación de Pago

1. Sistema recibe notificación de pasarela
2. Verifica autenticidad del webhook
3. Actualiza estado en base de datos
4. Genera recibo automático
5. Notifica al usuario del resultado
6. Actualiza estadísticas globales

### 3. Manejo de Errores

1. **Pago Rechazado**: Notificación inmediata al usuario
2. **Pago Pendiente**: Seguimiento automático cada hora
3. **Timeout**: Auto-cancelación después de 24 horas
4. **Error de Sistema**: Log y notificación a administradores

## Características Técnicas

### Validaciones de Donación

```php
'amount' => 'required|numeric|min:1000|max:5000000',
'currency' => 'required|in:COP,USD,EUR',
'payment_method' => 'required|in:credit_card,debit_card,bank_transfer',
'purpose' => 'required|in:platform,shelter,mascota,emergency',
'message' => 'nullable|string|max:500'
```

### Seguridad de Pagos

- Encriptación de datos sensibles
- Validación de webhooks con firmas
- Tokenización de datos de tarjetas
- Cumplimiento PCI DSS
- Auditoría completa de transacciones

### Integración con MercadoPago

```php
// Configuración de preferencia de pago
$preference = new \MercadoPago\Preference();
$preference->items = [$item];
$preference->payer = $payer;
$preference->payment_methods = $payment_methods;
$preference->back_urls = $back_urls;
$preference->auto_return = "approved";
$preference->save();
```

### Sistema de Recibos

- Generación automática en PDF
- Numeración consecutiva única
- Información fiscal completa
- Envío automático por email
- Almacenamiento seguro

## Integraciones

### Pasarelas de Pago

#### MercadoPago (Principal)

- Pagos con tarjeta de crédito/débito
- Transferencias bancarias (PSE)
- Pagos en efectivo (baloto, efecty)
- Subscripciones recurrentes

#### PayPal (Internacional)

- Pagos internacionales
- Múltiples monedas
- Protection Seller/Buyer
- Express Checkout

### Servicios Externos

- Servicios de email transaccional
- APIs de conversión de moneda
- Servicios de generación de PDF
- Sistemas de auditoría financiera

## Configuración y Parámetros

### Variables de Entorno

```env
# Configuración de donaciones
DONATIONS_ENABLED=true
MIN_DONATION_AMOUNT=1000
MAX_DONATION_AMOUNT=5000000
DEFAULT_CURRENCY=COP

# MercadoPago
MERCADOPAGO_PUBLIC_KEY=your_public_key
MERCADOPAGO_ACCESS_TOKEN=your_access_token
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or live

# Configuración de recibos
RECEIPT_PREFIX=AF-
RECEIPT_STORAGE_DISK=local
AUTO_SEND_RECEIPTS=true
```

### Montos Sugeridos

```php
'suggested_amounts' => [
    5000,    // $5,000 COP
    10000,   // $10,000 COP
    25000,   // $25,000 COP
    50000,   // $50,000 COP
    100000,  // $100,000 COP
    'custom' // Monto personalizado
]
```

## Testing

### Casos de Prueba Principales

1. **Donación exitosa con tarjeta de crédito**
2. **Manejo de pagos rechazados**
3. **Webhooks de confirmación**
4. **Generación de recibos**
5. **Donaciones anónimas**
6. **Validación de montos mínimos/máximos**
7. **Procesamiento de reembolsos**

### Testing con Ambiente Sandbox

```bash
# Tests de pagos en sandbox
php artisan test --filter=PaymentTest --env=testing

# Test de webhooks
php artisan test tests/Feature/WebhookTest.php

# Test de recibos
php artisan test tests/Feature/ReceiptTest.php
```

### Datos de Prueba

```php
// Tarjetas de prueba MercadoPago
'test_cards' => [
    'visa' => '4013540682746260',
    'mastercard' => '5031433215406351',
    'amex' => '371180303257522'
]
```

## Métricas y Analytics

### KPIs de Donaciones

- Monto total recaudado por período
- Promedio de donación por usuario
- Tasa de conversión de visitantes a donantes
- Retención de donantes (donaciones repetidas)
- Distribución por método de pago

### Reportes Financieros

- Reporte diario de transacciones
- Análisis mensual de donaciones
- Distribución por propósito/destinatario
- Análisis de fallos y rechazos
- Reporte de comisiones por pasarela

## Mantenimiento y Monitoreo

### Comandos de Mantenimiento

```bash
# Procesar pagos pendientes
php artisan donations:process-pending

# Generar recibos faltantes
php artisan donations:generate-receipts

# Sincronizar estados con pasarelas
php artisan donations:sync-statuses

# Limpiar donaciones muy antiguas
php artisan donations:cleanup-old

# Reporte financiero mensual
php artisan donations:monthly-report
```

### Monitoreo en Tiempo Real

- Alertas por fallos de pago
- Notificaciones de montos inusualmente altos
- Monitor de disponibilidad de pasarelas
- Seguimiento de tiempo de respuesta

### Logs Críticos

- Todas las transacciones (éxito/fallo)
- Webhooks recibidos y procesados
- Errores de comunicación con pasarelas
- Intentos de fraude detectados
- Generación y envío de recibos

## Seguridad y Cumplimiento

### Protección de Datos Financieros

- Nunca almacenar números de tarjeta completos
- Encriptación de datos sensibles
- Auditoría completa de accesos
- Cumplimiento con regulaciones locales

### Prevención de Fraude

- Límites de donación por usuario/día
- Verificación de IP y geolocalización
- Validación de patrones de comportamiento
- Integración con servicios antifraude

### Cumplimiento Legal

- Generación de reportes fiscales
- Cumplimiento con ley de donaciones
- Documentación para auditorías
- Retención de datos según normativa

## Roadmap y Mejoras Futuras

### Funcionalidades Planificadas

1. **Donaciones recurrentes**

    - Subscripciones mensuales/anuales
    - Gestión de pagos automáticos
    - Cancelación por parte del usuario

2. **Crowdfunding para emergencias**

    - Campañas específicas para mascotas
    - Metas de recaudación
    - Updates de progreso

3. **Programa de fidelización**

    - Puntos por donaciones
    - Niveles de donante
    - Beneficios exclusivos

4. **Integración con contabilidad**
    - Exportación a sistemas contables
    - Reportes fiscales automáticos
    - Integración con DIAN

### Optimizaciones Técnicas

- Cache de configuraciones de pago
- Procesamiento asíncrono de donaciones
- API REST para integraciones externas
- Dashboard en tiempo real para administradores

---

## Contacto y Soporte

Para dudas sobre donaciones y pagos, contactar al equipo financiero de AdoptaFácil.

**Última actualización**: Agosto 2025
**Versión del módulo**: 1.0.0
