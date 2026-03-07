# Módulo de Gestión de Mascotas 🐕🐱

## Descripción General

El módulo de gestión de mascotas es el núcleo principal de AdoptaFácil, permitiendo el registro, visualización y gestión completa de mascotas disponibles para adopción. Este módulo maneja tanto la experiencia pública para potenciales adoptantes como las funcionalidades administrativas para usuarios registrados.

## Arquitectura del Módulo

### Backend (Laravel)

#### Controlador Principal: `MascotaController`

**Ubicación**: `app/Http/Controllers/MascotaController.php`

**Responsabilidades**:

- Gestión de vistas públicas y privadas de mascotas
- Operaciones CRUD completas con validación
- Sistema de múltiples imágenes por mascota
- Cálculo automático de edad basado en fecha de nacimiento
- Autorización y permisos de usuario

**Métodos principales**:

1. **`indexPublic()`**

    - Muestra catálogo público de mascotas
    - Accesible sin autenticación
    - Incluye relaciones con usuario e imágenes

2. **`index()`**

    - Dashboard de mascotas para usuarios autenticados
    - Vista personalizada según rol de usuario

3. **`store(StoreMascotaRequest $request)`**

    - Registro de nuevas mascotas
    - Validación mediante Form Request personalizado
    - Gestión de múltiples imágenes (hasta 3)
    - Cálculo automático de edad

4. **`update(UpdateMascotaRequest $request, Mascota $mascota)`**

    - Actualización de datos de mascota existente
    - Verificación de permisos via Policy
    - Actualización de imágenes múltiples

5. **`destroy(Mascota $mascota)`**
    - Eliminación segura de mascota
    - Verificación de autorización
    - Limpieza de archivos de imágenes

#### Modelo: `Mascota`

**Ubicación**: `app/Models/Mascota.php`

**Atributos principales**:

```php
$fillable = [
    'nombre',           // Nombre de la mascota
    'especie',          // Tipo: perro, gato, otro
    'raza',            // Raza específica
    'edad',            // Calculada automáticamente
    'fecha_nacimiento', // Campo base para cálculo de edad
    'sexo',            // Macho/Hembra
    'ciudad',          // Ubicación de la mascota
    'descripcion',     // Descripción detallada
    'imagen',          // Imagen principal (compatibilidad)
    'user_id',         // Propietario de la publicación
];
```

**Relaciones**:

- `belongsTo(User::class)`: Pertenece a un usuario
- `hasMany(MascotaImage::class)`: Múltiples imágenes ordenadas
- `hasMany(Solicitud::class)`: Solicitudes de adopción

**Características especiales**:

- Auto-cálculo de edad al guardar
- Gestión automática de timestamps
- Scope queries para filtrado

#### Validación: `StoreMascotaRequest` y `UpdateMascotaRequest`

**Ubicación**: `app/Http/Requests/`

**Reglas de validación**:

- Nombre: requerido, máximo 255 caracteres
- Especie: requerido, opciones válidas
- Edad/fecha de nacimiento: validación de fechas
- Imágenes: máximo 3 archivos, formatos permitidos
- Datos de ubicación: validación de ciudad

#### Políticas: `MascotaPolicy`

**Ubicación**: `app/Policies/MascotaPolicy.php`

**Permisos definidos**:

- `view`: Cualquier usuario puede ver
- `create`: Solo usuarios autenticados
- `update`: Solo propietario de la mascota
- `delete`: Solo propietario de la mascota

### Frontend (React/TypeScript)

#### Vista Pública: `mascotas.tsx`

**Ubicación**: `resources/js/pages/mascotas.tsx`

**Características**:

- Catálogo completo con filtros por especie
- Sistema de favoritos para usuarios autenticados
- Modal de galería con múltiples imágenes
- Diseño responsive con información completa

**Componentes utilizados**:

- `PetHero`: Hero section con filtros
- `PetCard`: Tarjetas individuales de mascotas
- `CarouselModal`: Galería de imágenes
- `FavoritesProvider`: Context para favoritos

#### Componente Principal: `PetCard`

**Ubicación**: `resources/js/components/mascotas/pet-card.tsx`

**Funcionalidades**:

- Información básica de la mascota
- Sistema de favoritos interactivo
- Botón de galería de imágenes
- Información de contacto del propietario

### Base de Datos

#### Tabla Principal: `mascotas`

```sql
CREATE TABLE mascotas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    especie ENUM('perro', 'gato', 'otro') NOT NULL,
    raza VARCHAR(255),
    edad INT,
    fecha_nacimiento DATE,
    sexo ENUM('macho', 'hembra') NOT NULL,
    ciudad VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Tabla de Imágenes: `mascota_images`

```sql
CREATE TABLE mascota_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mascota_id BIGINT NOT NULL,
    imagen_path VARCHAR(255) NOT NULL,
    orden INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE
);
```

## Flujo de Trabajo

### 1. Registro de Nueva Mascota

1. Usuario autenticado accede al formulario de registro
2. Completa información básica y sube hasta 3 imágenes
3. `StoreMascotaRequest` valida los datos
4. Se calcula automáticamente la edad
5. Se almacena la mascota y sus imágenes
6. Redirección al dashboard con confirmación

### 2. Visualización Pública

1. Visitante accede a `/mascotas`
2. Se cargan todas las mascotas con sus imágenes
3. Sistema de filtros por especie
4. Interacción con favoritos (si está autenticado)

### 3. Gestión de Favoritos

1. Usuario hace clic en corazón de favorito
2. Se verifica autenticación
3. Se actualiza estado en base de datos
4. Feedback visual inmediato

## Características Técnicas

### Sistema de Imágenes Múltiples

- Máximo 3 imágenes por mascota
- Orden configurable por el usuario
- Redimensionamiento automático al subir
- Fallback a imagen principal para compatibilidad

### Cálculo Automático de Edad

- Campo `fecha_nacimiento` como fuente de verdad
- Cálculo en años completos
- Actualización automática al guardar
- Validación de fechas coherentes

### Autorización y Seguridad

- Políticas para operaciones CRUD
- Validación de entrada exhaustiva
- Sanitización de datos
- Verificación de propiedad de archivos

## Integraciones

### Con Otros Módulos

- **Usuarios**: Propietarios de mascotas
- **Solicitudes**: Proceso de adopción
- **Favoritos**: Sistema de preferencias
- **Dashboard**: Estadísticas y métricas

### APIs Externas

- Sistema de geolocalización para ciudades
- Servicio de imágenes (futuro)
- Notificaciones push (planificado)

## Configuración y Parámetros

### Variables de Entorno

```env
# Configuración de archivos
FILESYSTEM_DISK=public
MAX_MASCOTA_IMAGES=3
IMAGE_MAX_SIZE=5120  # KB

# Configuración de edad
MIN_AGE_MONTHS=1
MAX_AGE_YEARS=25
```

### Configuración de Almacenamiento

- Directorio base: `storage/app/public/mascotas/`
- Formatos permitidos: JPG, PNG, WEBP
- Tamaño máximo por imagen: 5MB
- Redimensionamiento automático: 800x600px

## Testing

### Casos de Prueba Principales

1. **Registro de mascota con datos válidos**
2. **Validación de datos inválidos**
3. **Carga de múltiples imágenes**
4. **Autorización de operaciones**
5. **Cálculo de edad automático**
6. **Filtrado público de mascotas**

### Comandos de Testing

```bash
# Ejecutar tests del módulo
php artisan test --filter=MascotaTest

# Test de integración
php artisan test tests/Feature/MascotaControllerTest.php

# Test de modelo
php artisan test tests/Unit/MascotaModelTest.php
```

## Mantenimiento y Monitoreo

### Logs Importantes

- Errores en carga de imágenes
- Fallos en cálculo de edad
- Intentos de acceso no autorizado
- Problemas de validación

### Métricas de Rendimiento

- Tiempo de carga del catálogo
- Éxito en subida de imágenes
- Conversión de visualización a adopción
- Uso del sistema de filtros

## Roadmap y Mejoras Futuras

### Funcionalidades Planificadas

1. **Sistema de búsqueda avanzada**

    - Filtros por edad, tamaño, temperamento
    - Búsqueda por texto libre
    - Geolocalización por proximidad

2. **Mejoras en gestión de imágenes**

    - Editor de imágenes integrado
    - Múltiples formatos de visualización
    - Optimización automática

3. **Funciones sociales**

    - Compartir mascotas en redes sociales
    - Sistema de calificaciones
    - Comentarios y preguntas

4. **Inteligencia artificial**
    - Reconocimiento automático de raza
    - Sugerencias de descripción
    - Matching inteligente adoptante-mascota

### Optimizaciones Técnicas

- Cache de consultas frecuentes
- Lazy loading de imágenes
- Compresión de imágenes automática
- CDN para recursos estáticos

---

## Contacto y Soporte

Para dudas o problemas relacionados con este módulo, contactar al equipo de desarrollo de AdoptaFácil.

**Última actualización**: Agosto 2025
**Versión del módulo**: 1.0.0
