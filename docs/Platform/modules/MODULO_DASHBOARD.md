# Módulo de Dashboard y Analytics 📊

## Descripción General

El módulo de Dashboard y Analytics es el centro de comando de AdoptaFácil, proporcionando una vista integral del estado de la plataforma a través de métricas clave, estadísticas en tiempo real y herramientas de análisis. Este módulo está diseñado para administradores, moderadores y usuarios que necesitan monitorear el rendimiento y la actividad de la plataforma.

## Arquitectura del Módulo

### Backend (Laravel)

#### Controlador Principal: `DashboardController`

**Ubicación**: `app/Http/Controllers/DashboardController.php`

**Responsabilidades**:

- Generación de estadísticas principales de la plataforma
- Cálculo de métricas de crecimiento y tendencias
- Distribución de datos por categorías
- Actividad reciente y seguimiento de eventos
- Personalización de dashboard según rol de usuario

**Métodos principales**:

1. **`index()`**
    - Dashboard principal con todas las métricas
    - Estadísticas comparativas con período anterior
    - Gráficos de distribución y tendencias
    - Tabla de actividad reciente

**Estadísticas Principales**:

- Total de mascotas registradas
- Total de adopciones exitosas
- Total de donaciones recibidas
- Total de usuarios registrados

**Métricas de Crecimiento**:

- Porcentaje de cambio mensual en todas las categorías
- Comparación con período anterior
- Indicadores de tendencia (positiva/negativa)

#### Controlador de Estadísticas: `EstadisticasController`

**Ubicación**: `app/Http/Controllers/EstadisticasController.php`

**Responsabilidades**:

- Estadísticas avanzadas y reportes detallados
- Análisis de tendencias temporales
- Métricas de rendimiento por módulo
- Exportación de datos para análisis externo

**Funcionalidades**:

- Estadísticas por rango de fechas
- Análisis de usuarios más activos
- Métricas de conversión
- Reportes de uso de la plataforma

#### Controlador de Mapa: `MapaController`

**Ubicación**: `app/Http/Controllers/MapaController.php`

**Responsabilidades**:

- Visualización geográfica de datos
- Distribución de mascotas por ubicación
- Mapa interactivo de adopciones
- Análisis de cobertura geográfica

### Frontend (React/TypeScript)

#### Vista Principal: `dashboard.tsx`

**Ubicación**: `resources/js/pages/dashboard.tsx`

**Características**:

- Panel principal con métricas clave
- Gráficos interactivos y visualizaciones
- Tabla de actividad reciente
- Indicadores de rendimiento en tiempo real

**Componentes principales**:

1. **`StatCard`**

    - Tarjetas de estadísticas principales
    - Indicadores de cambio porcentual
    - Iconografía contextual
    - Colores basados en tendencias

2. **`Chart`**

    - Gráficos de barras y líneas
    - Distribución por categorías (pie chart)
    - Interactividad con hover y tooltips
    - Responsive design

3. **`RecentTable`**
    - Tabla de actividad reciente
    - Filtros por tipo de actividad
    - Paginación y ordenamiento
    - Enlaces a detalles específicos

#### Subpáginas de Analytics

**Ubicación**: `resources/js/pages/Dashboard/`

**Páginas especializadas**:

- `Analytics.tsx`: Análisis detallado
- `Reports.tsx`: Generación de reportes
- `UserStats.tsx`: Estadísticas de usuarios
- `AdoptionMetrics.tsx`: Métricas de adopción

### Estructura de Datos

#### Estadísticas Principales

```typescript
interface DashboardStats {
    totalMascotas: number;
    totalAdopciones: number;
    totalDonaciones: number;
    totalUsuarios: number;
    cambioMascotas: number; // % cambio vs mes anterior
    cambioAdopciones: number; // % cambio vs mes anterior
    cambioDonaciones: number; // % cambio vs mes anterior
    cambioUsuarios: number; // % cambio vs mes anterior
}
```

#### Distribución por Categorías

```typescript
interface DistribucionTipo {
    name: string; // Nombre de la categoría
    value: number; // Porcentaje del total
    total: number; // Cantidad absoluta
}
```

#### Métricas Temporales

```typescript
interface AdopcionMes {
    mes: string; // Formato "YYYY-MM"
    adopciones: number; // Cantidad de adopciones
}
```

#### Actividad Reciente

```typescript
interface ActividadReciente {
    id: number;
    tipo: string; // 'mascota', 'adopcion', 'producto', etc.
    mascota: string; // Nombre de la mascota
    usuario: string; // Nombre del usuario
    estado: string; // Estado actual
    fecha: string; // Fecha de la actividad
}
```

## Características Técnicas

### Cálculo de Métricas

#### Estadísticas de Crecimiento

```php
// Cálculo de cambio porcentual
$cambioMascotas = $mascotasAnterior > 0 ?
    round((($totalMascotas - $mascotasAnterior) / $mascotasAnterior) * 100, 1) : 100;
```

#### Distribución por Categorías

```php
// Distribución de mascotas por especie
$distribucionTipos = Mascota::selectRaw('especie, COUNT(*) as total')
    ->groupBy('especie')
    ->get()
    ->map(function ($item) use ($totalMascotas) {
        return [
            'name' => ucfirst($item->especie),
            'value' => $totalMascotas > 0 ? round(($item->total / $totalMascotas) * 100, 1) : 0,
            'total' => $item->total,
        ];
    });
```

### Optimizaciones de Rendimiento

- Cache de estadísticas frecuentes
- Consultas optimizadas con índices específicos
- Cálculos en background para datos complejos
- Lazy loading de componentes pesados

### Actualización de Datos

- Refresh automático cada 5 minutos
- Botón de actualización manual
- Indicadores de última actualización
- Fallback para datos sin conexión

## Gráficos y Visualizaciones

### Tipos de Gráficos Implementados

1. **Gráfico de Barras (Adopciones por Mes)**

    - Muestra tendencia temporal
    - Colores diferenciados por período
    - Tooltips informativos

2. **Gráfico Circular (Distribución de Especies)**

    - Porcentajes de cada tipo de mascota
    - Colores distintivos por categoría
    - Leyenda interactiva

3. **Tarjetas de Métricas**
    - Números principales destacados
    - Indicadores de tendencia
    - Iconos contextuales

### Configuración de Charts

```typescript
// Configuración de Chart.js
const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Adopciones por Mes',
        },
    },
    scales: {
        y: {
            beginAtZero: true,
        },
    },
};
```

## Métricas Específicas por Módulo

### Módulo de Mascotas

- Total de mascotas registradas
- Distribución por especie y raza
- Mascotas con más solicitudes
- Tiempo promedio hasta adopción
- Mascotas por ciudad/región

### Módulo de Usuarios

- Usuarios registrados por período
- Usuarios activos vs inactivos
- Distribución por roles
- Tasa de verificación de email
- Usuarios por ubicación geográfica

### Módulo de Adopciones

- Solicitudes creadas por período
- Tasa de aprobación vs rechazo
- Tiempo promedio de respuesta
- Adopciones completadas exitosamente
- Análisis de motivos de rechazo

### Módulo de Comunidad

- Posts creados por día
- Engagement rate (likes/comentarios)
- Usuarios más activos
- Contenido más popular
- Crecimiento de la comunidad

### Módulo de Productos

- Productos registrados
- Categorías más populares
- Aliados más activos
- Conversion rate de contactos

## Configuración y Personalización

### Variables de Dashboard

```env
# Configuración de dashboard
DASHBOARD_CACHE_TTL=300  # 5 minutos
STATS_COMPARISON_DAYS=30 # Comparar con 30 días anteriores
MAX_RECENT_ACTIVITIES=50
AUTO_REFRESH_INTERVAL=300000 # 5 minutos en ms
```

### Personalización por Rol

```php
// Métricas visibles según rol
'admin' => ['all'],
'moderator' => ['users', 'posts', 'reports'],
'commercial_ally' => ['products', 'own_stats'],
'user' => ['own_pets', 'own_adoptions']
```

## APIs y Endpoints

### Endpoints de Estadísticas

```php
// Rutas para datos del dashboard
Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('/dashboard/charts', [DashboardController::class, 'getChartData']);
Route::get('/dashboard/recent', [DashboardController::class, 'getRecentActivity']);
Route::get('/dashboard/export', [DashboardController::class, 'exportData']);
```

### Respuesta de API Típica

```json
{
    "stats": {
        "totalMascotas": 1250,
        "totalAdopciones": 342,
        "cambioMascotas": 12.5
    },
    "charts": {
        "adopcionesPorMes": [...],
        "distribucionTipos": [...]
    },
    "recentActivity": [...],
    "lastUpdate": "2025-08-09T10:30:00Z"
}
```

## Testing

### Casos de Prueba Principales

1. **Cálculo correcto de estadísticas**
2. **Cambios porcentuales precisos**
3. **Distribución de categorías**
4. **Filtrado de actividad reciente**
5. **Cache de datos funcionando**
6. **Autorización por roles**

### Comandos de Testing

```bash
# Tests del dashboard
php artisan test --filter=DashboardTest

# Test de métricas
php artisan test tests/Feature/MetricsTest.php

# Test de autorización
php artisan test tests/Feature/DashboardAuthTest.php
```

## Mantenimiento y Monitoreo

### Comandos de Mantenimiento

```bash
# Actualizar cache de estadísticas
php artisan dashboard:refresh-cache

# Generar reporte mensual
php artisan dashboard:monthly-report

# Limpiar datos antiguos de actividad
php artisan dashboard:cleanup-activity

# Verificar integridad de métricas
php artisan dashboard:verify-metrics
```

### Logs y Monitoreo

- Errores en cálculo de estadísticas
- Tiempos de respuesta del dashboard
- Uso de memoria en generación de gráficos
- Frecuencia de acceso por usuario

## Exportación y Reportes

### Formatos de Exportación

- **PDF**: Reportes ejecutivos formateados
- **Excel**: Datos detallados para análisis
- **CSV**: Datos raw para procesamiento
- **JSON**: Integración con herramientas externas

### Tipos de Reportes

1. **Reporte Mensual**: Resumen de actividad del mes
2. **Reporte de Adopciones**: Análisis detallado de adopciones
3. **Reporte de Usuarios**: Crecimiento y actividad de usuarios
4. **Reporte Personalizado**: Filtros específicos por fecha/categoría

## Roadmap y Mejoras Futuras

### Funcionalidades Planificadas

1. **Dashboard personalizable**

    - Widgets arrastrables
    - Métricas personalizadas por usuario
    - Temas y layouts alternativos

2. **Analytics avanzados**

    - Predicciones usando ML
    - Análisis de cohortes
    - Funnel de conversión detallado

3. **Alertas inteligentes**

    - Notificaciones de anomalías
    - Alertas de métricas críticas
    - Sugerencias de mejora

4. **Integración con herramientas externas**
    - Google Analytics
    - Herramientas de BI
    - APIs de terceros

### Optimizaciones Técnicas

- ElasticSearch para búsquedas complejas
- Redis para cache avanzado
- Procesamiento en background
- API GraphQL para consultas eficientes

## Seguridad y Acceso

### Control de Acceso

- Dashboard básico para todos los usuarios autenticados
- Métricas administrativas solo para admins
- Datos personales solo para el usuario propietario
- Logs de acceso a información sensible

### Privacidad de Datos

- Anonimización de datos personales en estadísticas
- Aggregación para proteger información individual
- Cumplimiento con regulaciones de privacidad
- Opción de opt-out para usuarios

---

## Contacto y Soporte

Para dudas sobre el dashboard y analytics, contactar al equipo de desarrollo de AdoptaFácil.

**Última actualización**: Agosto 2025
**Versión del módulo**: 1.0.0
