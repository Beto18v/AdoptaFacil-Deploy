# AdoptaFácil – Documentación General

Bienvenido a la documentación unificada de AdoptaFácil, una plataforma web integral para la adopción de mascotas en Colombia. Aquí encontrarás información funcional, técnica y de integración de todos los módulos y microservicios.

---

## Tabla de Contenido

- [Visión General](#visión-general)
- [Arquitectura y Stack Tecnológico](#arquitectura-y-stack-tecnológico)
- [Módulos Principales](#módulos-principales)
- [Microservicios](#microservicios)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Testing y Calidad](#testing-y-calidad)
- [Deployment y Producción](#deployment-y-producción)
- [Contribución](#contribución)
- [Contacto y Soporte](#contacto-y-soporte)

---

## Visión General

AdoptaFácil es una plataforma modular que integra funcionalidades de red social, marketplace, gestión de adopciones y donaciones, con una arquitectura moderna basada en Laravel 12 (backend), React + TypeScript (frontend) y microservicios para funcionalidades avanzadas.

## Arquitectura y Stack Tecnológico

- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Bridge:** Inertia.js (SPA/SSR)
- **Base de Datos:** MySQL/PostgreSQL
- **Microservicios:** FastAPI (Python)
- **Pagos:** MercadoPago SDK
- **Mapas:** Integración de geolocalización

## Módulos Principales

| Módulo         | Descripción                  | Archivo de Detalle                  |
| -------------- | --------------------------- | ----------------------------------- |
| 🐕 Mascotas    | Gestión de mascotas          | [PETS.md](../modules/MODULO_MASCOTAS.md) |
| 🛍️ Productos   | Marketplace de productos     | [PRODUCTS.md](../modules/MODULO_PRODUCTOS.md) |
| 👥 Usuarios    | Autenticación y perfiles     | [USERS.md](../modules/MODULO_USUARIOS.md) |
| 📋 Solicitudes | Proceso de adopción          | [ADOPTIONS.md](../modules/MODULO_SOLICITUDES.md) |
| 💬 Comunidad   | Red social de mascotas       | [COMMUNITY.md](../modules/MODULO_COMUNIDAD.md) |
| 📊 Dashboard   | Analytics y métricas         | [DASHBOARD.md](../modules/MODULO_DASHBOARD.md) |
| 💰 Donaciones  | Pagos y donaciones           | [DONATIONS.md](../modules/MODULO_DONACIONES.md) |

## Microservicios

| Servicio                | Tecnología   | Descripción breve                                 | Documentación técnica                  |
|------------------------ |-------------|--------------------------------------------------|----------------------------------------|
| Pet Detail Service      | FastAPI     | Generación de descripciones emocionales de mascotas| [pet-detail-service/README.md](../services/pet-detail-service/README.md) |
| Chatbot FAQ Service     | FastAPI     | Chatbot de preguntas frecuentes                   | [chatbot-faq-service/README.md](../services/chatbot-faq-service/README.md) |

## Estructura del Proyecto

```text
laravel12-react/
├── app/Http/Controllers/   # Controladores principales
├── app/Models/             # Modelos Eloquent
├── resources/js/pages/     # Vistas React
├── routes/                 # Rutas web y API
├── docs/                   # Documentación
│   ├── platform/           # Documentación general y módulos
│   └── services/           # Documentación de microservicios
└── tests/                  # Suite de testing
```

## Instalación y Configuración

### Requisitos
- PHP 8.2+, Node.js 18+, MySQL 8.0+, Composer 2.x, NPM/Yarn

### Pasos básicos
```bash
# Clonar repositorio
# Instalar dependencias PHP y Node
# Configurar .env y llaves
# Migrar base de datos
# Compilar assets
# Iniciar servidores
```

## Testing y Calidad
- Unit, Feature, Integration y Browser tests
- PSR-12, ESLint, PHPStan, Conventional Commits

## Deployment y Producción
- Ambientes: Local, Staging, Producción
- CI/CD: Lint, tests, deploy automático
- Seguridad, performance y monitoreo

## Contribución
- Fork, branch, PR con tests y descripción
- Estructura de commits convencional

## Contacto y Soporte
- Issues de GitHub, Discussions, Email
- Equipo de desarrollo y canales oficiales

---

**Última actualización:** Octubre 2025
