# Módulo de Gestión de Usuarios y Autenticación 👥

## Descripción General

El módulo de gestión de usuarios es la base fundamental de AdoptaFácil, manejando la autenticación, autorización y gestión de perfiles de todos los usuarios de la plataforma. Este módulo diferencia entre usuarios regulares, aliados comerciales y administradores, proporcionando experiencias personalizadas según el rol.

## Arquitectura del Módulo

### Backend (Laravel)

#### Controlador Principal: `AuthController`

**Ubicación**: `app/Http/Controllers/AuthController.php`

**Responsabilidades**:

- Gestión de registro y autenticación
- Manejo de roles y permisos de usuario
- Verificación de email y recuperación de contraseña
- Gestión de sesiones y tokens de API
- Integración con proveedores de autenticación externa

**Métodos principales**:

1. **Registro de Usuarios**

    - Registro estándar con validación
    - Registro de aliados comerciales
    - Verificación de email automática
    - Asignación de roles por defecto

2. **Autenticación**

    - Login con email/contraseña
    - Manejo de sesiones persistentes
    - Logout seguro
    - Protección contra fuerza bruta

3. **Gestión de Perfiles**
    - Actualización de información personal
    - Cambio de contraseña
    - Gestión de preferencias
    - Eliminación de cuenta

#### Modelo Principal: `User`

**Ubicación**: `app/Models/User.php`

**Atributos principales**:

```php
$fillable = [
    'name',              // Nombre completo
    'email',             // Email único
    'email_verified_at', // Verificación de email
    'password',          // Contraseña hasheada
    'phone',             // Teléfono de contacto
    'city',              // Ciudad de residencia
    'role',              // Rol del usuario
    'is_commercial_ally',// Indicador de aliado comercial
    'avatar',            // Imagen de perfil
];
```

**Roles de Usuario**:

- **user**: Usuario regular (adopción)
- **commercial_ally**: Aliado comercial (productos)
- **admin**: Administrador del sistema
- **moderator**: Moderador de contenido

**Relaciones principales**:

- `hasMany(Mascota::class)`: Mascotas publicadas
- `hasMany(Product::class)`: Productos del aliado
- `hasMany(Solicitud::class)`: Solicitudes de adopción
- `hasMany(Favorito::class)`: Favoritos del usuario
- `hasMany(Donation::class)`: Donaciones realizadas

#### Sistema de Autenticación

**Proveedor**: Laravel Breeze con Inertia.js

**Características**:

- Autenticación basada en sesiones
- Verificación de email obligatoria
- Recuperación de contraseña por email
- Rate limiting en intentos de login
- Logout automático por inactividad

### Frontend (React/TypeScript)

#### Páginas de Autenticación

**Ubicación**: `resources/js/pages/auth/`

**Componentes principales**:

1. **`login.tsx`**

    - Formulario de inicio de sesión
    - Validación en tiempo real
    - Recordar sesión
    - Enlaces a registro y recuperación

2. **`register.tsx`**

    - Formulario de registro estándar
    - Validación de campos
    - Términos y condiciones
    - Redirección post-registro

3. **`registro-opciones.tsx`**

    - Selección de tipo de usuario
    - Información sobre roles
    - Redirección a registro específico

4. **`forgot-password.tsx`**
    - Recuperación de contraseña
    - Validación de email
    - Feedback de proceso

#### Gestión de Estado

**Context**: `AuthContext`
**Hooks**: `useAuth`, `useUser`

**Funcionalidades**:

- Estado global de autenticación
- Información del usuario actual
- Permisos y roles
- Funciones de login/logout

### Base de Datos

#### Tabla Principal: `users`

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    role ENUM('user', 'commercial_ally', 'admin', 'moderator') DEFAULT 'user',
    is_commercial_ally BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(255),
    remember_token VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

#### Tablas Relacionadas

**`password_reset_tokens`**: Tokens de recuperación
**`sessions`**: Gestión de sesiones activas
**`personal_access_tokens`**: Tokens de API (futuro)

## Flujo de Trabajo

### 1. Registro de Usuario

1. Usuario accede a `/registro-opciones`
2. Selecciona tipo de cuenta (regular/aliado)
3. Completa formulario de registro
4. Se envía email de verificación
5. Usuario verifica email
6. Acceso completo a la plataforma

### 2. Proceso de Login

1. Usuario ingresa email/contraseña
2. Validación en servidor
3. Verificación de email confirmado
4. Creación de sesión
5. Redirección al dashboard

### 3. Gestión de Perfil

1. Usuario autenticado accede a configuración
2. Actualiza información personal
3. Cambia avatar o contraseña
4. Guarda cambios con validación

### 4. Recuperación de Contraseña

1. Usuario solicita recuperación
2. Se envía token por email
3. Usuario accede al enlace
4. Establece nueva contraseña
5. Se invalidan sesiones activas

## Características Técnicas

### Seguridad

- Hashing de contraseñas con bcrypt
- Verificación de email obligatoria
- Rate limiting en endpoints sensibles
- Protección CSRF en formularios
- Validación de entrada exhaustiva

### Validaciones

```php
// Registro
'name' => 'required|string|max:255',
'email' => 'required|string|email|max:255|unique:users',
'password' => 'required|string|min:8|confirmed',
'phone' => 'nullable|string|max:20',
'city' => 'required|string|max:100'

// Actualización de perfil
'name' => 'sometimes|string|max:255',
'email' => 'sometimes|email|unique:users,email,' . $user->id,
'phone' => 'nullable|string|max:20',
'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
```

### Gestión de Roles

- Middleware para verificación de roles
- Gates para permisos específicos
- Policies para autorización de recursos
- Sistema flexible y extensible

## Integraciones

### Con Otros Módulos

- **Mascotas**: Propietarios de publicaciones
- **Productos**: Vendedores aliados
- **Solicitudes**: Adoptantes y dueños
- **Dashboard**: Personalización por rol
- **Favoritos**: Preferencias de usuario

### Servicios Externos

- Servicio de email (SMTP/Mailgun)
- Proveedores OAuth (Google, Facebook - futuro)
- Servicios de verificación telefónica (futuro)
- Análisis de comportamiento (futuro)

## Configuración y Parámetros

### Variables de Entorno

```env
# Configuración de autenticación
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1

# Configuración de email
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM_ADDRESS="noreply@adoptafacil.com"

# Configuración de avatares
AVATAR_DISK=public
AVATAR_MAX_SIZE=2048
AVATAR_PATH=avatars/
```

### Middleware de Autenticación

- `auth`: Verificar autenticación
- `verified`: Verificar email confirmado
- `role:admin`: Verificar rol específico
- `throttle:login`: Rate limiting para login

## Roles y Permisos

### Usuario Regular (`user`)

**Permisos**:

- Registrar mascotas para adopción
- Solicitar adopciones
- Gestionar favoritos
- Acceder a comunidad
- Realizar donaciones

### Aliado Comercial (`commercial_ally`)

**Permisos**:

- Todos los permisos de usuario regular
- Registrar productos para venta
- Gestionar inventario
- Acceder a métricas de ventas

### Administrador (`admin`)

**Permisos**:

- Acceso completo al sistema
- Gestionar usuarios y roles
- Moderar contenido
- Acceder a analytics completos
- Configurar sistema

### Moderador (`moderator`)

**Permisos**:

- Moderar publicaciones
- Gestionar reportes
- Suspender usuarios
- Acceder a herramientas de moderación

## Testing

### Casos de Prueba Principales

1. **Registro con datos válidos/inválidos**
2. **Login con credenciales correctas/incorrectas**
3. **Verificación de email**
4. **Recuperación de contraseña**
5. **Gestión de roles y permisos**
6. **Middleware de autenticación**

### Comandos de Testing

```bash
# Tests de autenticación
php artisan test --filter=AuthTest

# Tests de registro
php artisan test tests/Feature/RegistrationTest.php

# Tests de permisos
php artisan test tests/Feature/PermissionTest.php
```

## Mantenimiento y Monitoreo

### Comandos Artisan

```bash
# Limpiar sesiones expiradas
php artisan session:cleanup

# Limpiar tokens de password reset expirados
php artisan auth:clear-resets

# Estadísticas de usuarios
php artisan users:stats

# Promover usuario a admin
php artisan users:promote {email}
```

### Logs Importantes

- Intentos de login fallidos
- Registros de nuevos usuarios
- Cambios de contraseña
- Accesos administrativos
- Errores de verificación de email

### Métricas de Usuario

- Usuarios registrados por día/mes
- Tasa de verificación de email
- Usuarios activos/inactivos
- Distribución por roles
- Tiempo promedio de sesión

## Seguridad Avanzada

### Protecciones Implementadas

- Rate limiting en endpoints críticos
- Validación de entrada exhaustiva
- Protección contra ataques de timing
- Headers de seguridad HTTP
- Sanitización de datos de salida

### Auditoría de Seguridad

```bash
# Verificar configuración de seguridad
php artisan security:check

# Auditar permisos de usuarios
php artisan users:audit

# Revisar sesiones sospechosas
php artisan sessions:review
```

## Roadmap y Mejoras Futuras

### Funcionalidades Planificadas

1. **Autenticación de dos factores (2FA)**

    - SMS y aplicaciones TOTP
    - Códigos de respaldo
    - Configuración por usuario

2. **Autenticación social**

    - Login con Google/Facebook
    - Sincronización de perfiles
    - Merge de cuentas existentes

3. **Gestión avanzada de perfiles**

    - Verificación de identidad
    - Perfiles públicos/privados
    - Sistema de reputación

4. **Analytics de usuario**
    - Dashboard de actividad personal
    - Estadísticas de adopciones
    - Histórico de interacciones

### Optimizaciones Técnicas

- Cache de permisos de usuario
- Sesiones en Redis
- API de gestión de usuarios
- Integración con SSO empresarial

---

## Contacto y Soporte

Para dudas sobre autenticación y gestión de usuarios, contactar al equipo de desarrollo de AdoptaFácil.

**Última actualización**: Agosto 2025
**Versión del módulo**: 1.0.0
