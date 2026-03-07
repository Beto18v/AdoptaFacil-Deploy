# Módulo de Gestión de Productos 🛍️

## Descripción General

El módulo de gestión de productos permite a los aliados comerciales de AdoptaFácil registrar y vender productos relacionados con el cuidado de mascotas. Este módulo facilita la creación de un marketplace integrado dentro de la plataforma de adopción, generando ingresos adicionales y proporcionando recursos útiles para los adoptantes.

## Arquitectura del Módulo

### Backend (Laravel)

#### Controlador Principal: `ProductController`

**Ubicación**: `app/Http/Controllers/ProductController.php`

**Responsabilidades**:

- Gestión del catálogo público de productos
- Dashboard unificado de productos y mascotas para usuarios
- Operaciones CRUD completas con validación
- Sistema de múltiples imágenes por producto (hasta 3)
- Autorización basada en políticas de usuario

**Métodos principales**:

1. **`indexPublic()`**

    - Catálogo público de productos
    - Accesible sin autenticación
    - Incluye información del vendedor para contacto

2. **`index()`**

    - Dashboard unificado para usuarios autenticados
    - Muestra productos propios y mascotas en una sola vista
    - Navegación por pestañas

3. **`store(StoreProductRequest $request)`**

    - Registro de nuevos productos
    - Validación exhaustiva mediante Form Request
    - Gestión de múltiples imágenes
    - Asignación automática de usuario propietario

4. **`update(UpdateProductRequest $request, Product $product)`**

    - Actualización de productos existentes
    - Verificación de permisos via ProductPolicy
    - Gestión de cambios en imágenes

5. **`destroy(Product $product)`**
    - Eliminación segura de productos
    - Verificación de autorización
    - Limpieza de archivos asociados

#### Modelo: `Product`

**Ubicación**: `app/Models/Product.php`

**Atributos principales**:

```php
$fillable = [
    'name',        // Nombre del producto
    'description', // Descripción detallada
    'price',       // Precio en moneda local
    'stock',       // Cantidad disponible
    'user_id',     // Vendedor/aliado comercial
    'imagen',      // Imagen principal (compatibilidad)
];
```

**Características especiales**:

- Accessors para compatibilidad con nombres antiguos
- Conversión automática de tipos de datos
- Relaciones optimizadas con carga ansiosa

**Relaciones**:

- `belongsTo(User::class)`: Pertenece a un usuario vendedor
- `hasMany(ProductImage::class)`: Múltiples imágenes ordenadas

#### Modelo de Imágenes: `ProductImage`

**Ubicación**: `app/Models/ProductImage.php`

**Atributos**:

```php
$fillable = [
    'product_id',   // ID del producto padre
    'imagen_path',  // Ruta del archivo de imagen
    'order',        // Orden de visualización
];
```

**Relaciones**:

- `belongsTo(Product::class)`: Pertenece a un producto

#### Validación: `StoreProductRequest` y `UpdateProductRequest`

**Ubicación**: `app/Http/Requests/`

**Reglas de validación**:

- Nombre: requerido, máximo 255 caracteres, único por usuario
- Descripción: requerida, máximo 1000 caracteres
- Precio: requerido, numérico, mínimo 0.01
- Stock: requerido, entero, mínimo 0
- Imágenes: máximo 3 archivos, formatos específicos

#### Políticas: `ProductPolicy`

**Ubicación**: `app/Policies/ProductPolicy.php`

**Permisos definidos**:

- `view`: Cualquier usuario puede ver productos
- `create`: Solo usuarios verificados pueden crear
- `update`: Solo propietario del producto
- `delete`: Solo propietario del producto

### Frontend (React/TypeScript)

#### Vista Pública: `productos.tsx`

**Ubicación**: `resources/js/pages/productos.tsx`

**Características**:

- Catálogo completo de productos disponibles
- Sistema de filtros por categoría y precio
- Información detallada del vendedor
- Modal de galería para múltiples imágenes
- Integración con sistema de contacto

**Componentes principales**:

- `ProductCard`: Tarjeta individual de producto
- `ProductHero`: Hero section con filtros
- `ContactModal`: Modal para contactar vendedor
- `ImageCarousel`: Galería de imágenes del producto

#### Dashboard Integrado

**Ubicación**: `resources/js/pages/Dashboard/`

**Funcionalidades**:

- Vista unificada de productos y mascotas
- Navegación por pestañas
- Formularios de creación/edición
- Gestión de imágenes drag & drop
- Estadísticas de ventas básicas

### Base de Datos

#### Tabla Principal: `products`

```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    user_id BIGINT NOT NULL,
    imagen VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_products (user_id),
    INDEX idx_price (price)
);
```

#### Tabla de Imágenes: `product_images`

```sql
CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    imagen_path VARCHAR(255) NOT NULL,
    order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_order (product_id, order)
);
```

## Flujo de Trabajo

### 1. Registro de Nuevo Producto

1. Aliado comercial autenticado accede al dashboard
2. Navega a la pestaña "Productos"
3. Completa formulario con información y hasta 3 imágenes
4. `StoreProductRequest` valida los datos
5. Se almacena el producto con sus imágenes
6. Redirección al dashboard con confirmación

### 2. Catálogo Público

1. Visitante accede a `/productos`
2. Se cargan todos los productos disponibles
3. Filtrado por categorías y rango de precios
4. Visualización de información del vendedor
5. Contacto directo mediante modal o información

### 3. Gestión de Inventario

1. Usuario revisa sus productos en dashboard
2. Edita stock, precios o información
3. Actualiza imágenes según necesidad
4. Sistema de notificaciones para stock bajo

## Características Técnicas

### Sistema de Múltiples Imágenes

- Máximo 3 imágenes por producto
- Orden configurable por el usuario
- Redimensionamiento automático al subir
- Formatos soportados: JPG, PNG, WEBP
- Compresión automática para optimización

### Gestión de Inventario

- Control de stock en tiempo real
- Notificaciones de stock bajo
- Historial de cambios de inventario
- Reportes básicos de ventas

### Sistema de Precios

- Soporte para múltiples monedas (configuración)
- Validación de precios mínimos
- Formato automático según configuración regional
- Cálculo de impuestos (futuro)

### Autorización y Seguridad

- Verificación de propiedad en todas las operaciones
- Validación de archivos subidos
- Sanitización de datos de entrada
- Rate limiting para creación de productos

## Integraciones

### Con Otros Módulos

- **Usuarios**: Vendedores y compradores
- **Dashboard**: Estadísticas unificadas
- **Notificaciones**: Alertas de stock y ventas
- **Pagos**: Sistema de transacciones (futuro)

### Servicios Externos

- Servicio de imágenes CDN
- API de geolocalización para entrega
- Pasarelas de pago (MercadoPago, PayPal)
- Servicios de envío (futuro)

## Configuración y Parámetros

### Variables de Entorno

```env
# Configuración de productos
MAX_PRODUCT_IMAGES=3
PRODUCT_IMAGE_MAX_SIZE=5120  # KB
MIN_PRODUCT_PRICE=0.01

# Configuración de almacenamiento
PRODUCTS_STORAGE_DISK=public
PRODUCTS_IMAGE_PATH=products/images

# Configuración de moneda
DEFAULT_CURRENCY=COP
CURRENCY_DECIMALS=2
```

### Configuración de Almacenamiento

- Directorio base: `storage/app/public/products/`
- Formatos permitidos: JPG, PNG, WEBP
- Tamaño máximo por imagen: 5MB
- Redimensionamiento automático: 800x600px

## Validaciones y Reglas de Negocio

### Validaciones de Producto

```php
'name' => 'required|string|max:255',
'description' => 'required|string|max:1000',
'price' => 'required|numeric|min:0.01|max:999999.99',
'stock' => 'required|integer|min:0|max:9999',
'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120'
```

### Reglas de Negocio

- Un usuario puede tener máximo 50 productos activos
- Stock mínimo para mantener producto visible: 1
- Tiempo máximo sin actividad: 90 días
- Límite de creación: 5 productos por día

## Testing

### Casos de Prueba Principales

1. **Creación de producto con datos válidos**
2. **Validación de precios negativos**
3. **Carga de múltiples imágenes**
4. **Autorización de operaciones CRUD**
5. **Gestión de stock y inventario**
6. **Filtrado en catálogo público**

### Comandos de Testing

```bash
# Tests del módulo de productos
php artisan test --filter=ProductTest

# Test de controlador
php artisan test tests/Feature/ProductControllerTest.php

# Test de modelo
php artisan test tests/Unit/ProductModelTest.php

# Test de políticas
php artisan test tests/Unit/ProductPolicyTest.php
```

## Métricas y Analytics

### KPIs del Módulo

- Número total de productos registrados
- Productos más vistos/populares
- Conversión de visualización a contacto
- Tiempo promedio de vida de un producto
- Distribución de precios

### Reportes Disponibles

- Productos por usuario
- Análisis de stock y rotación
- Productos sin stock
- Productos más antiguos sin actualizar

## Mantenimiento y Monitoreo

### Logs Importantes

- Errores en carga de imágenes
- Fallos en validación de precios
- Intentos de acceso no autorizado
- Problemas de stock inconsistente

### Tareas de Mantenimiento

```bash
# Limpiar productos sin imágenes
php artisan products:cleanup-orphaned

# Actualizar stock automático
php artisan products:update-stock

# Comprimir imágenes antiguas
php artisan products:optimize-images

# Notificar stock bajo
php artisan products:notify-low-stock
```

## Roadmap y Mejoras Futuras

### Funcionalidades Planificadas

1. **Sistema de categorías avanzado**

    - Categorías jerárquicas
    - Etiquetas y filtros personalizados
    - Búsqueda facetada

2. **E-commerce completo**

    - Carrito de compras
    - Proceso de checkout
    - Gestión de pedidos
    - Sistema de calificaciones

3. **Herramientas de vendedor**

    - Dashboard de analytics avanzado
    - Gestión de promociones
    - Sistema de descuentos
    - Integración con contabilidad

4. **Funcionalidades sociales**
    - Reseñas y comentarios
    - Sistema de favoritos para productos
    - Compartir en redes sociales
    - Recomendaciones personalizadas

### Optimizaciones Técnicas

- Indexación en Elasticsearch
- Cache de productos frecuentes
- CDN para imágenes
- Compresión automática de imágenes
- API REST completa para móvil

## Seguridad y Cumplimiento

### Medidas de Seguridad

- Validación de archivos subidos
- Sanitización de datos de usuario
- Rate limiting por IP y usuario
- Verificación de integridad de imágenes

### Cumplimiento Legal

- Protección de datos de compradores
- Términos y condiciones de venta
- Políticas de devolución
- Cumplimiento tributario (futuro)

---

## Contacto y Soporte

Para dudas específicas del módulo de productos, contactar al equipo de desarrollo de AdoptaFácil.

**Última actualización**: Agosto 2025
**Versión del módulo**: 1.0.0
