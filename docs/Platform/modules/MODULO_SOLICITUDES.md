# Módulo de Solicitudes de Adopción 📋

## Descripción General

El módulo de solicitudes de adopción es el corazón del proceso de adopción en AdoptaFácil. Facilita la comunicación entre potenciales adoptantes y dueños de mascotas, gestionando todo el flujo desde la solicitud inicial hasta la aprobación o rechazo de la adopción.

## Arquitectura del Módulo

### Backend (Laravel)

#### Controlador Principal: `SolicitudesController`

**Ubicación**: `app/Http/Controllers/SolicitudesController.php`

**Responsabilidades**:

- Gestión del CRUD completo de solicitudes
- Cambio de estados del proceso de adopción
- Notificaciones automáticas a las partes involucradas
- Validación de permisos y autorización
- Dashboard de seguimiento para adoptantes y dueños

**Métodos principales**:

1. **`index()`**

    - Dashboard de solicitudes para usuario autenticado
    - Vista diferenciada según rol (adoptante/dueño)
    - Filtros por estado y fecha

2. **`store(Request $request)`**

    - Creación de nueva solicitud de adopción
    - Validación de datos del adoptante
    - Notificación automática al dueño
    - Prevención de solicitudes duplicadas

3. **`show(Solicitud $solicitud)`**

    - Vista detallada de solicitud específica
    - Verificación de autorización (solo involucrados)
    - Historial de cambios de estado

4. **`updateStatus(Request $request, Solicitud $solicitud)`**
    - Cambio de estado de la solicitud
    - Validación de transiciones permitidas
    - Notificaciones automáticas

#### Controlador de Acciones: `AccionSolicitudController`

**Ubicación**: `app/Http/Controllers/AccionSolicitudController.php`

**Responsabilidades**:

- Gestión de acciones específicas sobre solicitudes
- Aprobación y rechazo con motivos
- Cancelación por parte del adoptante
- Finalización del proceso de adopción

**Métodos principales**:

1. **`aprobar(Solicitud $solicitud)`**

    - Aprobación de solicitud por el dueño
    - Cambio de estado a 'aprobada'
    - Notificación al adoptante
    - Registro en historial

2. **`rechazar(Request $request, Solicitud $solicitud)`**

    - Rechazo con motivo específico
    - Cambio de estado a 'rechazada'
    - Notificación con retroalimentación

3. **`cancelar(Solicitud $solicitud)`**
    - Cancelación por parte del adoptante
    - Validación de permisos
    - Notificación al dueño

#### Modelo Principal: `Solicitud`

**Ubicación**: `app/Models/Solicitud.php`

**Atributos principales**:

```php
$fillable = [
    'mascota_id',        // Mascota solicitada
    'user_id',           // Usuario adoptante
    'mensaje',           // Mensaje del adoptante
    'telefono',          // Teléfono de contacto
    'direccion',         // Dirección del adoptante
    'experiencia',       // Experiencia con mascotas
    'tipo_vivienda',     // Casa/apartamento/finca
    'tiene_patio',       // Disponibilidad de espacio
    'otros_animales',    // Otros animales en el hogar
    'estado',            // Estado actual de la solicitud
    'motivo_rechazo',    // Motivo en caso de rechazo
    'fecha_respuesta',   // Fecha de respuesta del dueño
];
```

**Estados de Solicitud**:

- **pendiente**: Solicitud recién creada
- **en_revision**: Siendo evaluada por el dueño
- **aprobada**: Aprobada por el dueño
- **rechazada**: Rechazada con motivo
- **cancelada**: Cancelada por el adoptante
- **finalizada**: Adopción completada

**Relaciones**:

- `belongsTo(User::class)`: Usuario adoptante
- `belongsTo(Mascota::class)`: Mascota solicitada
- `belongsTo(User::class, 'dueño_id')`: Dueño de la mascota (via mascota)

### Frontend (React/TypeScript)

#### Vista Principal: Gestión de Solicitudes

**Ubicación**: `resources/js/pages/Dashboard/Solicitudes.tsx`

**Características**:

- Dashboard unificado para adoptantes y dueños
- Filtros por estado y fecha
- Acciones rápidas (aprobar/rechazar/cancelar)
- Vista detallada de cada solicitud
- Historial de comunicación

**Componentes principales**:

1. **`SolicitudCard`**

    - Tarjeta resumen de solicitud
    - Acciones contextuales según rol
    - Indicadores visuales de estado
    - Enlaces a vista detallada

2. **`FormularioSolicitud`**

    - Formulario de nueva solicitud
    - Validación en tiempo real
    - Campos dinámicos según tipo de mascota
    - Preview antes de envío

3. **`ModalDetalle`**
    - Vista completa de la solicitud
    - Información del adoptante/mascota
    - Historial de cambios
    - Botones de acción

#### Formulario de Solicitud

**Integrado en**: Páginas de mascota individual

**Campos principales**:

- Mensaje personalizado al dueño
- Información de contacto
- Experiencia previa con mascotas
- Detalles del hogar y espacio disponible
- Compromiso de cuidado

### Base de Datos

#### Tabla Principal: `solicitudes`

```sql
CREATE TABLE solicitudes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mascota_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    mensaje TEXT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    experiencia TEXT,
    tipo_vivienda ENUM('casa', 'apartamento', 'finca', 'otro') NOT NULL,
    tiene_patio BOOLEAN DEFAULT FALSE,
    otros_animales TEXT,
    estado ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada', 'cancelada', 'finalizada') DEFAULT 'pendiente',
    motivo_rechazo TEXT,
    fecha_respuesta TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (mascota_id) REFERENCES mascotas(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_estado (estado),
    INDEX idx_mascota (mascota_id),
    INDEX idx_user (user_id),
    INDEX idx_fecha (created_at)
);
```

#### Tabla de Historial: `solicitud_historial`

```sql
CREATE TABLE solicitud_historial (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    solicitud_id BIGINT NOT NULL,
    estado_anterior ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada', 'cancelada', 'finalizada'),
    estado_nuevo ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada', 'cancelada', 'finalizada'),
    usuario_id BIGINT NOT NULL,
    comentario TEXT,
    created_at TIMESTAMP,

    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

## Flujo de Trabajo

### 1. Creación de Solicitud

1. Usuario ve mascota de interés
2. Completa formulario de solicitud
3. Sistema valida datos y previene duplicados
4. Se notifica automáticamente al dueño
5. Estado inicial: 'pendiente'

### 2. Evaluación por el Dueño

1. Dueño recibe notificación de nueva solicitud
2. Revisa información del adoptante
3. Cambia estado a 'en_revision'
4. Toma decisión: aprobar o rechazar

### 3. Respuesta del Dueño

1. **Si aprueba**: Estado cambia a 'aprobada', se notifica al adoptante
2. **Si rechaza**: Debe proporcionar motivo, se notifica con feedback
3. Se registra fecha de respuesta

### 4. Seguimiento Post-Decisión

1. **Si aprobada**: Coordinación para entrega (fuera del sistema)
2. **Si rechazada**: Adoptante puede solicitar otras mascotas
3. **Finalización**: Marca adopción como completada

## Características Técnicas

### Validaciones de Solicitud

```php
'mascota_id' => 'required|exists:mascotas,id',
'mensaje' => 'required|string|min:50|max:1000',
'telefono' => 'required|string|regex:/^[0-9+\-\s()]+$/',
'direccion' => 'required|string|min:10|max:255',
'tipo_vivienda' => 'required|in:casa,apartamento,finca,otro',
'tiene_patio' => 'boolean',
'experiencia' => 'nullable|string|max:500',
'otros_animales' => 'nullable|string|max:500'
```

### Reglas de Negocio

- Un usuario solo puede tener una solicitud activa por mascota
- Solo el dueño de la mascota puede aprobar/rechazar
- Solo el adoptante puede cancelar su solicitud
- Las solicitudes aprobadas no pueden revertirse
- Motivo es obligatorio al rechazar

### Sistema de Notificaciones

- Email automático al crear solicitud
- Notificación al cambiar estado
- Recordatorios para solicitudes pendientes
- Confirmación de acciones importantes

### Autorización y Permisos

- Solo involucrados pueden ver detalles
- Dueños solo ven solicitudes de sus mascotas
- Adoptantes solo ven sus propias solicitudes
- Admins pueden ver todas las solicitudes

## Integraciones

### Con Otros Módulos

- **Mascotas**: Solicitudes por mascota específica
- **Usuarios**: Adoptantes y dueños
- **Notificaciones**: Comunicación automática
- **Dashboard**: Métricas de adopción
- **Analytics**: Estadísticas de éxito

### Servicios de Comunicación

- Sistema de email transaccional
- Notificaciones push (futuro)
- SMS para urgencias (futuro)
- Chat integrado (planificado)

## Testing

### Casos de Prueba Principales

1. **Creación de solicitud válida**
2. **Prevención de solicitudes duplicadas**
3. **Flujo completo de aprobación**
4. **Flujo completo de rechazo**
5. **Cancelación por adoptante**
6. **Autorización de acciones**
7. **Validación de campos obligatorios**

### Comandos de Testing

```bash
# Tests del módulo de solicitudes
php artisan test --filter=SolicitudTest

# Test de flujo completo
php artisan test tests/Feature/AdoptionFlowTest.php

# Test de autorizaciones
php artisan test tests/Feature/SolicitudAuthTest.php
```

## Métricas y Analytics

### KPIs del Módulo

- Tasa de conversión de solicitudes
- Tiempo promedio de respuesta
- Porcentaje de aprobación vs rechazo
- Solicitudes por mascota promedio
- Adopciones completadas exitosamente

### Reportes Disponibles

- Solicitudes por período
- Análisis de motivos de rechazo
- Usuarios más activos en adopción
- Mascotas con más solicitudes
- Tiempos de respuesta por usuario

## Mantenimiento y Monitoreo

### Comandos de Mantenimiento

```bash
# Limpiar solicitudes muy antiguas
php artisan solicitudes:cleanup

# Enviar recordatorios de solicitudes pendientes
php artisan solicitudes:reminder

# Estadísticas de adopción
php artisan solicitudes:stats

# Marcar adopciones como finalizadas automáticamente
php artisan solicitudes:auto-finalize
```

### Logs Importantes

- Creación de nuevas solicitudes
- Cambios de estado
- Intentos de acceso no autorizado
- Errores en envío de notificaciones
- Solicitudes duplicadas bloqueadas

## Configuración del Sistema

### Variables de Entorno

```env
# Configuración de solicitudes
MAX_SOLICITUDES_POR_USUARIO=10
DIAS_AUTO_FINALIZACION=30
RECORDATORIO_DIAS=3

# Configuración de notificaciones
NOTIFICAR_EMAIL=true
NOTIFICAR_PUSH=false
TEMPLATE_EMAIL_SOLICITUD=solicitud-nueva
TEMPLATE_EMAIL_RESPUESTA=solicitud-respuesta
```

### Configuración de Estados

```php
// Estados y transiciones permitidas
'state_transitions' => [
    'pendiente' => ['en_revision', 'cancelada'],
    'en_revision' => ['aprobada', 'rechazada', 'cancelada'],
    'aprobada' => ['finalizada', 'cancelada'],
    'rechazada' => [], // Estado final
    'cancelada' => [], // Estado final
    'finalizada' => [] // Estado final
]
```

## Roadmap y Mejoras Futuras

### Funcionalidades Planificadas

1. **Sistema de chat integrado**

    - Comunicación directa adoptante-dueño
    - Historial de conversaciones
    - Notificaciones en tiempo real

2. **Proceso de adopción guiado**

    - Checklist de pasos a seguir
    - Documentos requeridos
    - Seguimiento post-adopción

3. **Sistema de referencias**

    - Referencias de adoptantes previos
    - Verificación de antecedentes
    - Red de confianza

4. **Analytics avanzados**
    - Predicción de éxito de adopción
    - Recomendaciones personalizadas
    - Análisis de patrones

### Mejoras en UX

- Formulario dividido en pasos
- Auto-guardado de borradores
- Vista previa antes de enviar
- Notificaciones push en tiempo real

### Optimizaciones Técnicas

- Cache de solicitudes frecuentes
- Búsqueda de texto completo
- API REST para aplicación móvil
- Integración con sistemas externos

## Seguridad y Privacidad

### Protección de Datos

- Encriptación de información sensible
- Anonimización de datos históricos
- Purga automática de datos antiguos
- Cumplimiento con regulaciones de privacidad

### Auditoría

- Registro de todas las acciones
- Trazabilidad completa del proceso
- Logs de acceso a información sensible
- Reportes de actividad sospechosa

---

## Contacto y Soporte

Para dudas sobre el módulo de solicitudes de adopción, contactar al equipo de desarrollo de AdoptaFácil.

**Última actualización**: Agosto 2025
**Versión del módulo**: 1.0.0
