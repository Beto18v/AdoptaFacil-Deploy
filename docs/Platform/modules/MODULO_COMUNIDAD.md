# Módulo de Comunidad y Red Social 💬

## Descripción General

El módulo de comunidad transforma AdoptaFácil en una red social especializada en mascotas, donde los usuarios pueden compartir experiencias, consejos, historias de adopción y crear una comunidad sólida alrededor del cuidado animal. Este módulo fomenta la interacción entre adoptantes, dueños actuales y amantes de los animales.

## Arquitectura del Módulo

### Backend (Laravel)

#### Controlador Principal: `CommunityController`

**Ubicación**: `app/Http/Controllers/CommunityController.php`

**Responsabilidades**:

- Gestión del feed principal de la comunidad
- Creación y moderación de publicaciones
- Sistema de likes y reacciones
- Gestión de comentarios anidados
- Eliminación de contenido con autorización

**Métodos principales**:

1. **`index()`**

    - Feed principal de la comunidad
    - Carga paginada de publicaciones
    - Ordenamiento por fecha y relevancia
    - Inclusión de likes y comentarios

2. **`store(Request $request)`**

    - Creación de nuevas publicaciones
    - Validación de contenido y imágenes
    - Detección automática de spam
    - Notificación a followers

3. **`toggleLike(Post $post)`**

    - Sistema de likes/dislikes
    - Prevención de múltiples likes
    - Actualización en tiempo real
    - Notificación al autor

4. **`storeComment(Request $request, Post $post)`**

    - Creación de comentarios
    - Soporte para comentarios anidados
    - Validación y moderación
    - Notificaciones de respuesta

5. **`destroy(Post $post)`**
    - Eliminación de publicaciones
    - Verificación de autorización
    - Eliminación en cascada de likes/comentarios

#### Modelo: `Post`

**Ubicación**: `app/Models/Post.php`

**Atributos principales**:

```php
$fillable = [
    'user_id',      // Autor de la publicación
    'content',      // Contenido del post
    'image',        // Imagen opcional
    'type',         // Tipo: historia, consejo, pregunta
    'is_pinned',    // Publicación destacada
    'is_approved',  // Moderación (futuro)
];
```

**Tipos de Publicación**:

- **historia**: Historias de adopción y experiencias
- **consejo**: Tips y consejos de cuidado
- **pregunta**: Preguntas a la comunidad
- **noticia**: Noticias relevantes (admins)
- **evento**: Eventos y actividades

**Relaciones**:

- `belongsTo(User::class)`: Autor de la publicación
- `hasMany(PostLike::class)`: Likes recibidos
- `hasMany(Comment::class)`: Comentarios
- `hasMany(SharedLink::class)`: Enlaces compartidos

#### Modelo: `Comment`

**Ubicación**: `app/Models/Comment.php`

**Atributos principales**:

```php
$fillable = [
    'post_id',      // Publicación comentada
    'user_id',      // Usuario que comenta
    'parent_id',    // Comentario padre (para hilos)
    'content',      // Contenido del comentario
];
```

**Características**:

- Soporte para comentarios anidados (hilos)
- Sistema de likes independiente
- Moderación automática de contenido

#### Modelo: `PostLike`

**Ubicación**: `app/Models/PostLike.php`

**Funcionalidades**:

- Registro de likes únicos por usuario
- Tipos de reacción (futuro: amor, risa, etc.)
- Timestamps para analytics

### Frontend (React/TypeScript)

#### Vista Principal: `comunidad.tsx`

**Ubicación**: `resources/js/pages/comunidad.tsx`

**Características**:

- Feed infinito con scroll automático
- Formulario de creación de posts
- Sistema de likes en tiempo real
- Comentarios expandibles
- Filtros por tipo de contenido

**Componentes principales**:

1. **`PostCard`**

    - Tarjeta individual de publicación
    - Información del autor con avatar
    - Botones de interacción (like, comentar, compartir)
    - Preview de comentarios

2. **`CreatePostForm`**

    - Formulario de nueva publicación
    - Editor de texto con formato
    - Upload de imágenes
    - Selección de tipo de post

3. **`CommentSection`**

    - Lista de comentarios anidados
    - Formulario de respuesta rápida
    - Sistema de likes en comentarios
    - Indicadores de carga

4. **`PostFilter`**
    - Filtros por tipo de contenido
    - Ordenamiento (reciente, popular)
    - Búsqueda por texto

#### Sistema de Compartir: `SharedController`

**Ubicación**: `app/Http/Controllers/SharedController.php`

**Funcionalidades**:

- Generación de enlaces públicos
- Compartir en redes sociales
- Estadísticas de compartido
- Enlaces con expiración

### Base de Datos

#### Tabla Principal: `posts`

```sql
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(255),
    type ENUM('historia', 'consejo', 'pregunta', 'noticia', 'evento') DEFAULT 'historia',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_type (type),
    INDEX idx_created (created_at),
    INDEX idx_user (user_id),
    FULLTEXT(content)
);
```

#### Tabla de Likes: `post_likes`

```sql
CREATE TABLE post_likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_like (post_id, user_id)
);
```

#### Tabla de Comentarios: `comments`

```sql
CREATE TABLE comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post (post_id),
    INDEX idx_parent (parent_id)
);
```

#### Tabla de Enlaces Compartidos: `shared_links`

```sql
CREATE TABLE shared_links (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    clicks INT DEFAULT 0,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_token (token)
);
```

## Flujo de Trabajo

### 1. Creación de Publicación

1. Usuario autenticado accede al formulario
2. Selecciona tipo de publicación
3. Escribe contenido y sube imagen opcional
4. Sistema valida contenido (spam, profanidad)
5. Publicación aparece en el feed
6. Notificación a seguidores (futuro)

### 2. Interacción con Posts

1. Usuarios ven publicaciones en el feed
2. Pueden dar like/unlike instantáneamente
3. Agregar comentarios con respuestas anidadas
4. Compartir enlaces públicos
5. Reportar contenido inapropiado

### 3. Sistema de Comentarios

1. Usuario hace clic en "Comentar"
2. Escribe respuesta en formulario
3. Puede responder a comentarios específicos
4. Notificación al autor del post
5. Hilos de conversación automáticos

## Características Técnicas

### Validaciones de Contenido

```php
// Publicaciones
'content' => 'required|string|min:10|max:2000',
'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
'type' => 'required|in:historia,consejo,pregunta,noticia,evento'

// Comentarios
'content' => 'required|string|min:1|max:500',
'parent_id' => 'nullable|exists:comments,id'
```

### Moderación Automática

- Filtro de palabras prohibidas
- Detección de spam por frecuencia
- Validación de imágenes apropiadas
- Sistema de reportes de usuarios

### Optimizaciones de Rendimiento

- Cache de conteos (likes, comentarios)
- Paginación infinita en frontend
- Lazy loading de imágenes
- Debounce en búsquedas

### Sistema de Notificaciones

- Notificación al recibir likes
- Alertas de nuevos comentarios
- Menciones en publicaciones (futuro)
- Resumen diario de actividad

## Integraciones

### Con Otros Módulos

- **Usuarios**: Autores y participantes
- **Mascotas**: Referencias cruzadas en posts
- **Dashboard**: Métricas de participación
- **Notificaciones**: Sistema de alertas

### Características Sociales

- Compartir en redes sociales externas
- Embebido de posts en sitios web
- APIs para aplicaciones móviles
- Integración con servicios de análisis

## Funcionalidades Especiales

### Sistema de Hashtags (Futuro)

- Etiquetas automáticas y manuales
- Trending topics en la comunidad
- Búsqueda por hashtags
- Agrupación de contenido relacionado

### Gamificación

- Puntos por participación activa
- Badges por logros especiales
- Rankings de usuarios más activos
- Recompensas por contenido útil

### Contenido Destacado

- Posts fijados por administradores
- Historias destacadas del día
- Curación de contenido de calidad
- Archivo de mejores publicaciones

## Testing

### Casos de Prueba Principales

1. **Creación de posts con validación**
2. **Sistema de likes único por usuario**
3. **Comentarios anidados correctos**
4. **Autorización para eliminar posts**
5. **Moderación de contenido**
6. **Sistema de compartir enlaces**

### Comandos de Testing

```bash
# Tests del módulo de comunidad
php artisan test --filter=CommunityTest

# Test de interacciones sociales
php artisan test tests/Feature/SocialInteractionTest.php

# Test de moderación
php artisan test tests/Feature/ModerationTest.php
```

## Métricas y Analytics

### KPIs del Módulo

- Posts creados por día/semana
- Tasa de engagement (likes/comentarios)
- Usuarios activos en comunidad
- Tiempo promedio en la sección
- Contenido más popular

### Analytics de Contenido

- Posts con más interacción
- Usuarios más activos
- Horarios de mayor actividad
- Tipos de contenido preferidos
- Efectividad de moderación

## Mantenimiento y Monitoreo

### Comandos de Mantenimiento

```bash
# Limpiar posts muy antiguos sin actividad
php artisan community:cleanup

# Actualizar contadores de likes/comentarios
php artisan community:update-counters

# Generar reporte de actividad
php artisan community:activity-report

# Moderar contenido automáticamente
php artisan community:auto-moderate
```

### Moderación y Administración

- Panel de moderación para admins
- Sistema de reportes de usuarios
- Suspensión temporal de usuarios
- Herramientas de análisis de contenido

## Configuración del Sistema

### Variables de Entorno

```env
# Configuración de comunidad
MAX_POST_LENGTH=2000
MAX_COMMENT_LENGTH=500
MAX_POST_IMAGE_SIZE=5120
POSTS_PER_PAGE=20

# Moderación
AUTO_MODERATION=true
SPAM_DETECTION=true
PROFANITY_FILTER=true
ADMIN_APPROVAL_REQUIRED=false
```

### Configuración de Filtros

```php
// Palabras prohibidas
'banned_words' => [
    'spam', 'scam', 'inappropiate_content'
],

// Límites de usuario
'user_limits' => [
    'posts_per_hour' => 5,
    'comments_per_hour' => 20,
    'likes_per_hour' => 100
]
```

## Roadmap y Mejoras Futuras

### Funcionalidades Planificadas

1. **Sistema de seguidores**

    - Seguir usuarios específicos
    - Feed personalizado de seguidos
    - Notificaciones de actividad

2. **Eventos y meetups**

    - Creación de eventos locales
    - RSVP y gestión de asistencia
    - Integración con calendario

3. **Grupos temáticos**

    - Grupos por tipo de mascota
    - Grupos por ubicación
    - Moderadores de grupo

4. **Contenido multimedia avanzado**
    - Videos cortos estilo TikTok
    - Transmisiones en vivo
    - Álbumes de fotos

### Funciones de IA

- Sugerencias de contenido personalizado
- Detección automática de mascotas en fotos
- Recomendaciones de publicaciones
- Chatbot para preguntas frecuentes

### Integración Móvil

- Aplicación móvil nativa
- Notificaciones push
- Cámara integrada para posts
- Geolocalización para eventos

## Seguridad y Privacidad

### Protección de Datos

- Control de privacidad por usuario
- Anonimización de datos eliminados
- Encriptación de mensajes privados
- Cumplimiento con GDPR/CCPA

### Seguridad del Contenido

- Detección de contenido malicioso
- Validación de enlaces externos
- Protección contra XSS
- Rate limiting agresivo

---

## Contacto y Soporte

Para dudas sobre el módulo de comunidad y características sociales, contactar al equipo de desarrollo de AdoptaFácil.

**Última actualización**: Agosto 2025
**Versión del módulo**: 1.0.0
