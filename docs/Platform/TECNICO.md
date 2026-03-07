# Documentación Técnica de AdoptaFácil 🔧

## Arquitectura del Sistema

AdoptaFácil está desarrollado con **Laravel 12** en el backend y **React con TypeScript** en el frontend, utilizando **Inertia.js** para crear una experiencia de aplicación de página única (SPA).

### Stack Tecnológico

```
Frontend (React/TypeScript)
       ↕ Inertia.js
Backend (Laravel 12/PHP)
       ↕ Eloquent ORM
Base de Datos (mySQL)
```

### Tecnologías Principales

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Bridge**: Inertia.js para SSR y SPA
- **Base de Datos**: MySQL/PostgreSQL
- **Autenticación**: Laravel Breeze
- **Mapas**: Integración con servicios de geolocalización

---

## Controladores Documentados

### Controladores Principales

| Controlador             | Descripción                  | Módulo      |
| ----------------------- | ---------------------------- | ----------- |
| `MascotaController`     | Gestión completa de mascotas | Mascotas    |
| `ProductController`     | Marketplace de productos     | Productos   |
| `DashboardController`   | Analytics y métricas         | Dashboard   |
| `CommunityController`   | Red social y posts           | Comunidad   |
| `SolicitudesController` | Proceso de adopción          | Solicitudes |
| `DonacionesController`  | Sistema de donaciones        | Donaciones  |

### Controladores de Soporte

| Controlador              | Descripción                  | Función   |
| ------------------------ | ---------------------------- | --------- |
| `AuthController`         | Autenticación complementaria | Usuarios  |
| `FavoritosController`    | Sistema de favoritos         | Mascotas  |
| `ShelterController`      | Gestión de refugios          | Refugios  |
| `MapaController`         | Geolocalización              | Mapas     |
| `PagoController`         | Procesamiento de pagos       | Pagos     |
| `SharedController`       | Enlaces compartidos          | Comunidad |
| `EstadisticasController` | Estadísticas avanzadas       | Analytics |

### Controladores de Configuración

| Controlador                 | Descripción             | Ubicación   |
| --------------------------- | ----------------------- | ----------- |
| `ProfileController`         | Perfil de usuario       | Settings/   |
| `PasswordController`        | Cambio de contraseña    | Settings/   |
| `AccionSolicitudController` | Acciones de solicitudes | Solicitudes |

---

## Vistas React Documentadas

### Páginas Principales

| Vista           | Descripción            | Acceso      |
| --------------- | ---------------------- | ----------- |
| `index.tsx`     | Landing page principal | Público     |
| `mascotas.tsx`  | Catálogo de mascotas   | Público     |
| `productos.tsx` | Catálogo de productos  | Público     |
| `refugios.tsx`  | Directorio de refugios | Público     |
| `comunidad.tsx` | Red social             | Público     |
| `dashboard.tsx` | Panel de control       | Autenticado |

### Páginas de Autenticación

| Vista                   | Descripción          | Función |
| ----------------------- | -------------------- | ------- |
| `login.tsx`             | Inicio de sesión     | Auth    |
| `register.tsx`          | Registro de usuarios | Auth    |
| `registro-opciones.tsx` | Tipo de cuenta       | Auth    |
| `forgot-password.tsx`   | Recuperar contraseña | Auth    |

---

## Modelos de Base de Datos

### Modelos Principales

| Modelo      | Tabla       | Descripción                |
| ----------- | ----------- | -------------------------- |
| `User`      | users       | Usuarios del sistema       |
| `Mascota`   | mascotas    | Mascotas para adopción     |
| `Product`   | products    | Productos del marketplace  |
| `Solicitud` | solicitudes | Solicitudes de adopción    |
| `Post`      | posts       | Publicaciones de comunidad |
| `Donation`  | donations   | Donaciones realizadas      |

### Modelos de Soporte

| Modelo         | Tabla          | Descripción            |
| -------------- | -------------- | ---------------------- |
| `MascotaImage` | mascota_images | Imágenes múltiples     |
| `ProductImage` | product_images | Imágenes de productos  |
| `Favorito`     | favoritos      | Favoritos de usuarios  |
| `Shelter`      | shelters       | Refugios registrados   |
| `Comment`      | comments       | Comentarios en posts   |
| `PostLike`     | post_likes     | Likes en publicaciones |
| `SharedLink`   | shared_links   | Enlaces compartidos    |

---

## Estructura de Base de Datos

### Tablas Principales

- **users** - Usuarios del sistema
- **mascotas** - Mascotas para adopción
- **mascota_images** - Imágenes múltiples de mascotas
- **products** - Productos del marketplace
- **product_images** - Imágenes de productos
- **solicitudes** - Solicitudes de adopción
- **posts** - Publicaciones de la comunidad
- **comments** - Comentarios en posts
- **post_likes** - Likes en publicaciones
- **donations** - Donaciones realizadas
- **favoritos** - Favoritos de usuarios

### Relaciones Principales

```sql
-- Un usuario puede tener múltiples mascotas
users (1) → (N) mascotas

-- Una mascota puede tener múltiples imágenes
mascotas (1) → (N) mascota_images

-- Una mascota puede recibir múltiples solicitudes
mascotas (1) → (N) solicitudes

-- Un usuario puede hacer múltiples solicitudes
users (1) → (N) solicitudes

-- Un post puede tener múltiples comentarios
posts (1) → (N) comments
```

---

## Características Técnicas Destacadas

### Seguridad

- 🔒 Validación exhaustiva en todos los formularios
- 🔒 Autorización granular con Policies
- 🔒 Sanitización de datos de entrada
- 🔒 Protección CSRF automática
- 🔒 Hasheado seguro de contraseñas

### Performance

- ⚡ Lazy loading de imágenes
- ⚡ Paginación en consultas pesadas
- ⚡ Cache de estadísticas frecuentes
- ⚡ Optimización de consultas con Eloquent
- ⚡ Compresión automática de imágenes

### UX/UI

- 🎨 Diseño responsive con Tailwind CSS
- 🎨 Tema claro/oscuro
- 🎨 Componentes reutilizables
- 🎨 Feedback visual inmediato
- 🎨 Navegación intuitiva

### Integraciones

- 🔌 MercadoPago para pagos
- 🔌 Sistema de email transaccional
- 🔌 Mapas para geolocalización
- 🔌 APIs REST para móvil (futuro)
- 🔌 Webhooks para notificaciones

---

## Estructura de Archivos del Proyecto

```
laravel12-react/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Controladores documentados
│   │   ├── Requests/        # Form Requests
│   │   └── Middleware/      # Middleware personalizado
│   ├── Models/              # Modelos Eloquent
│   ├── Policies/            # Políticas de autorización
│   └── Providers/           # Service Providers
├── database/
│   ├── migrations/          # Migraciones de BD
│   ├── seeders/            # Seeders de datos
│   └── factories/          # Factories para testing
├── resources/
│   ├── js/
│   │   ├── pages/          # Vistas React documentadas
│   │   ├── components/     # Componentes reutilizables
│   │   ├── layouts/        # Layouts de la aplicación
│   │   └── types/          # Tipos TypeScript
│   └── css/                # Estilos Tailwind
├── routes/
│   ├── web.php             # Rutas web principales
│   ├── api.php             # API REST endpoints
│   └── auth.php            # Rutas de autenticación
├── docs/                   # Documentación de módulos
│   ├── MODULO_MASCOTAS.md
│   ├── MODULO_PRODUCTOS.md
│   ├── MODULO_USUARIOS.md
│   ├── MODULO_SOLICITUDES.md
│   ├── MODULO_COMUNIDAD.md
│   ├── MODULO_DASHBOARD.md
│   └── MODULO_DONACIONES.md
└── tests/                  # Suite de testing
    ├── Feature/
    └── Unit/
```

---

## Configuración del Proyecto

### Requisitos del Sistema

- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer 2.x
- NPM/Yarn

### Instalación

```bash
# Clonar repositorio
git clone [url-del-repo]
cd laravel12-react

# Instalar dependencias PHP
composer install

# Instalar dependencias Node.js
npm install

# Configurar variables de entorno
cp .env.example .env
php artisan key:generate

# Migrar base de datos
php artisan migrate --seed

# Compilar assets
npm run build

# Iniciar servidores
php artisan serve
npm run dev
```

### Variables de Entorno Principales

```env
# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=adoptafacil
DB_USERNAME=root
DB_PASSWORD=

# Configuración de archivos
FILESYSTEM_DISK=public
MAX_MASCOTA_IMAGES=3
MAX_PRODUCT_IMAGES=3
```

---

## Testing y Calidad

### Estrategia de Testing

- **Unit Tests**: Modelos y funciones individuales
- **Feature Tests**: Flujos completos de usuario
- **Integration Tests**: Comunicación entre módulos
- **Browser Tests**: Interfaz de usuario (Dusk)

### Comandos de Testing

```bash
# Ejecutar todos los tests
php artisan test

# Tests por módulo específico
php artisan test --filter=MascotaTest
php artisan test --filter=ProductTest
php artisan test --filter=SolicitudTest

# Coverage report
php artisan test --coverage
```

### Estándares de Código

- PSR-12 para PHP
- ESLint + Prettier para TypeScript/React
- PHPStan nivel 8 para análisis estático
- Conventional Commits para mensajes de git

---

## Deployment y Producción

### Ambientes

- **Local**: Desarrollo con Docker/Vagrant
- **Staging**: Testing con datos similares a producción
- **Production**: Servidor de producción con SSL

### CI/CD Pipeline

```yaml
# .github/workflows/
- lint.yml # Linting y formato de código
- tests.yml # Ejecución de test suite
- deploy.yml # Deployment automático
```

### Consideraciones de Producción

- **Performance**: Cache Redis, CDN para imágenes
- **Seguridad**: SSL, headers de seguridad, rate limiting
- **Monitoring**: Logs centralizados, métricas de aplicación
- **Backups**: Base de datos y archivos de usuario

---

## Mantenimiento y Soporte

### Comandos Artisan Personalizados

```bash
# Limpiar datos antiguos
php artisan cleanup:old-data

# Actualizar estadísticas
php artisan stats:update

# Procesar donaciones pendientes
php artisan donations:process

# Enviar notificaciones
php artisan notifications:send
```

### Logs Importantes

- `laravel.log` - Errores generales de la aplicación
- `payments.log` - Transacciones y pagos
- `security.log` - Intentos de acceso y seguridad
- `performance.log` - Métricas de rendimiento

---

## Contribución al Proyecto

### Workflow de Desarrollo

1. Fork del repositorio
2. Crear branch para feature: `git checkout -b feature/nueva-funcionalidad`
3. Implementar cambios con tests
4. Commit siguiendo Conventional Commits
5. Pull Request con descripción detallada

### Estructura de Commits

```
feat: agregar sistema de favoritos
fix: corregir validación de email
docs: actualizar documentación de API
test: agregar tests para módulo de solicitudes
```

---

## Contacto y Soporte Técnico

### Equipo de Desarrollo

- **Desarrollador Principal**: Beto18v
- **Repositorio**: [GitHub - AdoptaF-cil](https://github.com/Beto18v/AdoptaF-cil)
- **Rama Principal**: `main`

### Documentación

- **Documentación Técnica**: `/docs/` directory
- **API Documentation**: En desarrollo
- **Manual de Usuario**: Planificado

### Soporte Técnico

Para dudas técnicas, problemas o sugerencias, crear un issue en el repositorio de GitHub o contactar al equipo de desarrollo.

---

**Última actualización**: Agosto 2025  
**Versión técnica**: 1.0.0  
**Estado**: En desarrollo activo
