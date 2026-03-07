# 🎨 Paleta de Colores AdoptaFácil

Este documento define la paleta de colores oficial de AdoptaFácil para mantener consistencia visual en toda la plataforma.

## 📋 Índice

- [Colores Principales](#colores-principales)
- [Gradientes](#gradientes)
- [Colores de Fondo](#colores-de-fondo)
- [Colores de Texto](#colores-de-texto)
- [Colores de Tarjetas](#colores-de-tarjetas)
- [Efectos y Decoraciones](#efectos-y-decoraciones)
- [Estados Interactivos](#estados-interactivos)
- [Botones](#botones)
- [Sombras](#sombras)
- [Modo Oscuro](#modo-oscuro)
- [Animaciones](#animaciones)

---

## 🖼️ Logos

### Uso de Logos por Modo

```tsx
/* Modo claro */
src = { Logo }; /* Logo.png - Logo principal */
className = "dark:hidden"; /* Ocultar en modo oscuro */

/* Modo oscuro */
src = { LogoWhite }; /* LogoWhite.png - Logo blanco */
className = "hidden dark:block"; /* Mostrar solo en modo oscuro */
```

### Estructura de Logos

```tsx
{/* Logo responsive por modo */}
<img
    src={Logo}
    alt="Logo AdoptaFácil"
    className="mx-auto h-36 w-56 drop-shadow-2xl transition-transform duration-300 hover:scale-105 dark:hidden"
/>
<img
    src={LogoWhite}
    alt="Logo AdoptaFácil"
    className="mx-auto h-36 w-56 drop-shadow-2xl transition-transform duration-300 hover:scale-105 hidden dark:block"
/>
```

### Archivos de Logo Disponibles

- `Logo.png` - Logo principal (modo claro)
- `LogoWhite.png` - Logo blanco (modo oscuro)
- `LogoGray.png` - Logo gris (usos especiales)
- `LogoGreen.png` - Logo verde (usos especiales)

---

## 🌈 Colores Principales

### Verde Primario

```css
/* Verde claro */
from-green-400  /* #4ade80 */
to-green-600    /* #16a34a */

/* Verde oscuro (dark mode) */
from-green-600  /* #16a34a */
to-green-700    /* #15803d */
```

### Azul Primario

```css
/* Azul claro */
from-blue-500   /* #3b82f6 */
to-blue-700     /* #1d4ed8 */
via-blue-500    /* #3b82f6 */

/* Azul oscuro (dark mode) */
from-blue-600   /* #2563eb */
to-blue-700     /* #1d4ed8 */
via-blue-700    /* #1d4ed8 */
```

### Púrpura Secundario

```css
/* Púrpura claro */
to-purple-600   /* #9333ea */

/* Púrpura oscuro (dark mode) */
to-purple-800   /* #6b21a8 */
```

---

## 🌅 Gradientes

### Gradiente Principal (Fondo de Página)

```css
/* Modo claro */
bg-gradient-to-br from-green-400 via-blue-500 to-purple-600

/* Modo oscuro */
dark:from-green-600 dark:via-blue-700 dark:to-purple-800
```

### Gradientes para Títulos

```css
/* Texto con gradiente */
bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent

/* Líneas decorativas */
bg-gradient-to-r from-transparent via-white/60 to-transparent
```

### Gradientes para Botones y Elementos

```css
/* Botón Amigo AdoptaFácil */
bg-gradient-to-r from-blue-500 to-blue-700

/* Botón Aliado AdoptaFácil */
bg-gradient-to-r from-green-500 to-green-700

/* Decoraciones circulares */
bg-gradient-to-br from-white/10 to-transparent
bg-gradient-to-tr from-white/5 to-transparent
```

---

## 🎭 Colores de Fondo

### Fondos Principales

```css
/* Fondo de página */
bg-gradient-to-br from-green-400 via-blue-500 to-purple-600
dark:from-green-600 dark:via-blue-700 dark:to-purple-800

/* Elementos decorativos de fondo */
bg-white/5          /* Círculos grandes */
bg-blue-300/10      /* Círculos medianos */
bg-purple-300/10    /* Círculos pequeños */
```

### Fondos de Tarjetas

```css
/* Tarjetas principales */
bg-white            /* Modo claro */
dark:bg-gray-800    /* Modo oscuro */

/* Tarjetas secundarias o contenedores */
bg-gray-100         /* Modo claro */
dark:bg-gray-900    /* Modo oscuro */
```

---

## 📝 Colores de Texto

### Texto Principal

```css
/* Títulos principales */
text-white                      /* Sobre fondos oscuros/gradientes */
bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent

/* Texto de contenido */
text-gray-800       /* Modo claro */
dark:text-white     /* Modo oscuro */

/* Texto secundario */
text-gray-600       /* Modo claro */
dark:text-gray-300  /* Modo oscuro */

/* Texto sobre fondos con transparencia */
text-white/90       /* Subtítulos y descripciones */
```

### Jerarquía de Texto

```css
/* H1 - Títulos principales */
text-4xl font-bold md:text-5xl lg:text-6xl
bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent

/* H2 - Subtítulos */
text-2xl font-bold tracking-tight

/* H3 - Títulos de sección */
text-xl font-semibold

/* Párrafos principales */
text-xl leading-relaxed font-medium

/* Párrafos secundarios */
text-base leading-relaxed
```

---

## � Sistema de Diferenciación Visual por Secciones

### Principios de Diferenciación

AdoptaFácil usa un sistema coherente de diferenciación visual entre secciones basado en:

1. **Paleta base del Header**: Azul-Verde como referencia (`from-blue-600 to-green-600`)
2. **Variaciones de luminosidad**: Más claros en modo claro, más oscuros en modo oscuro
3. **Elementos distintivos**: Bordes, decoraciones y efectos únicos por sección

### Implementación de Variaciones

```css
/* Colores base del header (referencia) */
.header-colors-light {
  @apply bg-gradient-to-r from-blue-600 to-green-600;
}

.header-colors-dark {
  @apply bg-gradient-to-r from-blue-400 to-green-400;
}

/* Variaciones más claras para secciones en modo claro */
.section-lighter-variant {
  @apply bg-gradient-to-br from-blue-100/80 via-green-100/60 to-blue-200/40;
}

/* Variaciones más oscuras para secciones en modo oscuro */
.section-darker-variant {
  @apply bg-gradient-to-br from-blue-950/40 via-green-950/30 to-blue-900/50;
}

/* Elementos decorativos adaptados */
.decoration-lighter {
  @apply bg-gradient-to-br from-blue-300/30 to-green-300/30;
}

.decoration-darker {
  @apply bg-gradient-to-br from-blue-800/25 to-green-800/25;
}
```

### Guía de Aplicación por Sección

| Elemento         | Header Base            | Sección Adaptada (Claro)                   | Sección Adaptada (Oscuro)                  |
| ---------------- | ---------------------- | ------------------------------------------ | ------------------------------------------ |
| **Fondo**        | N/A                    | `blue-100/80 → green-100/60 → blue-200/40` | `blue-950/40 → green-950/30 → blue-900/50` |
| **Decoraciones** | N/A                    | `blue-300/30 → green-300/30`               | `blue-800/25 → green-800/25`               |
| **Bordes**       | N/A                    | `border-blue-200/50`                       | `border-blue-800/30`                       |
| **Stats Texto**  | `blue-600 → green-600` | `blue-500 → green-500`                     | `blue-400 → green-400`                     |
| **Puntos**       | N/A                    | `blue-400/90, green-400/80`                | `blue-600/90, green-600/80`                |

---

## �🃏 Colores de Tarjetas

### Tarjetas de Registro

```css
/* Contenedor principal */
bg-white shadow-2xl rounded-3xl
dark:bg-gray-800 dark:text-white

/* Estados hover */
hover:shadow-3xl
ring-4 ring-white/50    /* Cuando está activa */

/* Elementos decorativos internos */
bg-gradient-to-br from-white/10 to-transparent  /* Esquina superior */
bg-gradient-to-tr from-white/5 to-transparent   /* Esquina inferior */
```

### Íconos en Tarjetas

```css
/* Contenedor de ícono Amigo AdoptaFácil */
bg-gradient-to-r from-blue-500 to-blue-700
text-4xl text-white shadow-xl rounded-2xl

/* Contenedor de ícono Aliado AdoptaFácil */
bg-gradient-to-r from-green-500 to-green-700
text-4xl text-white shadow-xl rounded-2xl
```

---

## ✨ Efectos y Decoraciones

### Elementos Decorativos Flotantes

```css
/* Puntos animados */
bg-white/20 animate-pulse        /* Puntos grandes */
bg-white/30 animate-ping         /* Puntos medianos */
bg-white/10 animate-pulse        /* Puntos grandes suaves */
bg-white/25 animate-ping         /* Puntos pequeños */
```

### Efectos de Profundidad

```css
/* Sombras de elementos */
drop-shadow-2xl     /* Logo */
drop-shadow-lg      /* Títulos principales */

/* Desenfoque de fondo */
blur-3xl            /* Círculos grandes */
blur-2xl            /* Círculos medianos */
blur-xl             /* Círculos pequeños */
```

---

## 🔘 Estados Interactivos

### Hover States

```css
/* Escalado */
hover:scale-105         /* Botones */
hover:scale-110         /* Íconos */
group-hover:scale-110   /* Elementos dentro de grupos */
scale-[1.02]           /* Tarjetas activas */

/* Rotación */
group-hover:rotate-3    /* Íconos en hover del grupo */

/* Opacidad y overlays */
hover:opacity-100       /* Efectos de brillo */
bg-white/20 opacity-0 hover:opacity-100  /* Overlay de botones */
```

### Focus States

```css
/* Anillos de enfoque */
focus:outline-none focus:ring-4 focus:ring-blue-300/50

/* Estados activos */
ring-4 ring-white/50    /* Tarjeta seleccionada */
```

---

## 🎯 Botones

### Botón Primario (Amigo AdoptaFácil)

```css
bg-gradient-to-r from-blue-500 to-blue-700
text-white font-semibold
rounded-xl px-8 py-4
shadow-lg hover:shadow-xl hover:scale-105
focus:outline-none focus:ring-4 focus:ring-blue-300/50
transition-all duration-300
```

### Botón Secundario (Aliado AdoptaFácil)

```css
bg-gradient-to-r from-green-500 to-green-700
text-white font-semibold
rounded-xl px-8 py-4
shadow-lg hover:shadow-xl hover:scale-105
focus:outline-none focus:ring-4 focus:ring-green-300/50
transition-all duration-300
```

### Efectos de Botón

```css
/* Overlay en hover */
.button-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  opacity: 0;
  transition: opacity 0.3s;
}
.button:hover .button-overlay {
  opacity: 1;
}
```

---

## 🌑 Sombras

### Jerarquía de Sombras

```css
/* Sombras de elementos */
shadow-lg           /* Sombra ligera */
shadow-xl           /* Sombra media */
shadow-2xl          /* Sombra fuerte - tarjetas */
shadow-3xl          /* Sombra máxima - hover */

/* Sombras de imagen */
drop-shadow-2xl     /* Logo principal */
drop-shadow-lg      /* Títulos importantes */
```

---

## 🌙 Modo Oscuro

### Conversiones Automáticas

```css
/* Fondos */
bg-white → dark:bg-gray-800
bg-gray-100 → dark:bg-gray-900

/* Texto */
text-gray-800 → dark:text-white
text-gray-600 → dark:text-gray-300

/* Gradientes principales */
from-green-400 via-blue-500 to-purple-600 →
dark:from-green-600 dark:via-blue-700 dark:to-purple-800
```

---

## 🎬 Animaciones

### Transiciones Principales

```css
/* Duración estándar */
transition-transform duration-300    /* Escalado rápido */
transition-all duration-300         /* Estados generales */
transition-all duration-500         /* Tarjetas principales */
transition-opacity duration-500     /* Efectos de brillo */
transition-transform duration-1000  /* Animaciones lentas */
```

### Animaciones CSS

```css
/* Animaciones incorporadas */
animate-pulse       /* Pulsación suave */
animate-ping        /* Pulsación expansiva */

/* Efectos personalizados */
-skew-x-12          /* Inclinación para efectos de brillo */
translate-x-[-100%] /* Posición inicial de brillo */
group-hover:translate-x-[200%] /* Movimiento de brillo */
```

---

## � Sistema de Espaciado

### Espaciado Vertical (Padding y Margin)

```css
/* Espaciado de secciones principales */
pt-12 pb-4               /* Header compacto */
pt-16 pb-8               /* Header estándar */
pt-20 pb-12              /* Header amplio */

/* Espaciado entre elementos */
mb-2                     /* Espaciado mínimo (8px) */
mb-4                     /* Espaciado pequeño (16px) */
mb-6                     /* Espaciado medio (24px) */
mb-8                     /* Espaciado grande (32px) */
mb-12                    /* Espaciado extra grande (48px) */

/* Márgenes superiores progresivos */
mt-2                     /* Muy cerca (8px) */
mt-4                     /* Cerca (16px) */
mt-6                     /* Estándar (24px) */
mt-8                     /* Separado (32px) */
mt-12                    /* Muy separado (48px) */

/* Padding interno de elementos */
p-4                      /* Padding pequeño - inputs, botones pequeños */
p-6                      /* Padding medio - tarjetas secundarias */
p-8                      /* Padding estándar - tarjetas principales */
p-12                     /* Padding grande - contenedores principales */
```

### Espaciado Horizontal

```css
/* Padding horizontal responsive */
px-4                     /* Móvil estándar (16px) */
px-6 md:px-8            /* Tablet a desktop (24px → 32px) */
px-8 lg:px-12           /* Desktop grande (32px → 48px) */

/* Márgenes laterales */
mx-auto                  /* Centrado automático */
ml-auto                  /* Alineación derecha */
mr-auto                  /* Alineación izquierda */

/* Espaciado entre elementos horizontales */
space-x-2               /* Muy cerca (8px) - iconos pequeños */
space-x-3               /* Cerca (12px) - checkbox + label */
space-x-4               /* Estándar (16px) - botones relacionados */
space-x-6               /* Separado (24px) - elementos independientes */
```

### Grid y Flex Spacing

```css
/* Grid gaps responsive */
gap-4                   /* Gap pequeño (16px) */
gap-6                   /* Gap medio (24px) */
gap-8                   /* Gap estándar (32px) */
gap-8 lg:gap-10        /* Gap responsive estándar */
gap-8 lg:gap-12        /* Gap responsive amplio */

/* Flex spacing */
flex gap-2             /* Elementos muy unidos */
flex gap-4             /* Elementos cercanos */
flex gap-6             /* Elementos separados */
```

---

## 🛠️ Clases Utilitarias Personalizadas

### Contenedores y Layout

```css
/* Contenedores centrados con espaciado */
min-h-screen px-4                    /* Altura completa con padding móvil */
min-h-[45vh] px-4                   /* Sección compacta */
min-h-[60vh] px-4                   /* Sección estándar */
max-w-5xl mx-auto                   /* Ancho compacto centrado */
max-w-6xl mx-auto                   /* Ancho máximo centrado */
max-w-2xl mx-auto px-4              /* Ancho de texto centrado */

/* Grid responsive con espaciado óptimo */
grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10    /* Layout compacto */
grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12    /* Layout estándar */
```

### Espaciado de Componentes Específicos

```css
/* Formularios */
.form-group {
  margin-bottom: 24px;
} /* mb-6 - Entre campos */
.form-field {
  margin-bottom: 8px;
} /* mb-2 - Label a input */
.form-error {
  margin-top: 4px;
} /* mt-1 - Error debajo de input */
.form-button {
  margin-top: 24px;
} /* mt-6 - Botón de envío */

/* Tarjetas */
.card-padding {
  padding: 32px;
} /* p-8 - Padding interno estándar */
.card-spacing {
  margin-bottom: 32px;
} /* mb-8 - Entre tarjetas */
.card-content {
  margin-bottom: 32px;
} /* mb-8 - Último elemento antes de botón */

/* Headers */
.header-logo {
  margin-bottom: 24px;
} /* mb-6 - Logo a título */
.header-title {
  margin-top: 8px;
  margin-bottom: 16px;
} /* mt-2 mb-4 */
.header-subtitle {
  margin-top: 16px;
} /* mt-4 - Descripción */
.header-divider {
  margin-top: 24px;
} /* mt-6 - Línea decorativa */

/* Botones */
.button-group {
  gap: 16px;
} /* gap-4 - Entre botones relacionados */
.button-icon {
  gap: 8px;
} /* gap-2 - Icono y texto */
```

### Posicionamiento

```css
/* Elementos absolutos decorativos */
absolute inset-0              /* Cobertura completa */
absolute top-1/4 left-1/4     /* Posicionamiento fraccionario */
relative z-10                 /* Capa de contenido */
pointer-events-none           /* Sin interacción */
overflow-hidden               /* Ocultar desbordamiento */
```

---

## 📱 Responsive Design

### Espaciado Responsive por Dispositivo

```css
/* Móvil (hasta 768px) */
px-4 py-6               /* Padding conservador */
gap-4                   /* Gaps menores */
mb-4                    /* Márgenes compactos */
text-base               /* Texto base */

/* Tablet (768px - 1024px) */
px-6 py-8               /* Padding intermedio */
gap-6                   /* Gaps intermedios */
mb-6                    /* Márgenes medios */
text-lg                 /* Texto más grande */

/* Desktop (1024px+) */
px-8 py-12              /* Padding amplio */
gap-8                   /* Gaps amplios */
mb-8                    /* Márgenes amplios */
text-xl                 /* Texto grande */
```

### Breakpoints de Texto y Espaciado

```css
/* Títulos con espaciado responsive */
text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6    /* Título principal */
text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4    /* Subtítulo */
text-xl md:text-2xl lg:text-3xl mb-2 md:mb-3     /* Título de sección */

/* Contenedores responsive */
pt-12 pb-4 md:pt-16 md:pb-8 lg:pt-20 lg:pb-12   /* Header escalable */
px-4 md:px-8 lg:px-12                            /* Padding horizontal */
max-w-md md:max-w-2xl lg:max-w-4xl               /* Ancho máximo */

/* Grid y espaciado responsive */
gap-4 md:gap-6 lg:gap-8                          /* Gap escalable */
space-y-4 md:space-y-6 lg:space-y-8              /* Espaciado vertical */
```

### Grid Responsive

```css
/* Layout de tarjetas */
grid-cols-1 md:grid-cols-2     /* 1 col móvil, 2 desktop */
gap-8 lg:gap-12               /* Espaciado adaptativo */
max-w-6xl                     /* Ancho máximo */
```

---

## 🎨 Paleta Hexadecimal de Referencia

```css
/* Verdes */
--green-400: #4ade80;
--green-500: #22c55e;
--green-600: #16a34a;
--green-700: #15803d;

/* Azules */
--blue-100: #dbeafe;
--blue-300: #93c5fd;
--blue-500: #3b82f6;
--blue-600: #2563eb;
--blue-700: #1d4ed8;

/* Púrpuras */
--purple-300: #c084fc;
--purple-600: #9333ea;
--purple-800: #6b21a8;

/* Grises */
--gray-100: #f3f4f6;
--gray-300: #d1d5db;
--gray-600: #4b5563;
--gray-800: #1f2937;
--gray-900: #111827;

/* Blanco con transparencias */
--white-5: rgba(255, 255, 255, 0.05);
--white-10: rgba(255, 255, 255, 0.1);
--white-20: rgba(255, 255, 255, 0.2);
--white-25: rgba(255, 255, 255, 0.25);
--white-30: rgba(255, 255, 255, 0.3);
--white-50: rgba(255, 255, 255, 0.5);
--white-60: rgba(255, 255, 255, 0.6);
--white-90: rgba(255, 255, 255, 0.9);
```

---

## 📋 Checklist de Implementación

Al aplicar esta paleta en otras páginas, verificar:

### ✅ **Básicos Esenciales**

- [ ] **Logos**: Logo correcto por modo (Logo.png claro, LogoWhite.png oscuro)
- [ ] **Espaciado**: Usar sistema de espaciado consistente (4px, 8px, 16px, 24px, 32px, 48px)
- [ ] **Responsive**: Espaciado escalable por dispositivo (móvil → tablet → desktop)
- [ ] **Componentes**: Espaciado específico para formularios, tarjetas, headers

### 🎨 **Diseño Visual**

- [ ] **Diferenciación de secciones**: Cada sección con identidad visual única
- [ ] **Paleta base**: Usar colores del header como referencia (azul-verde)
- [ ] **Variaciones**: Más claro en modo claro, más oscuro en modo oscuro
- [ ] **Bordes**: Separadores visuales entre secciones (`border-t`)
- [ ] Gradiente principal de fondo implementado
- [ ] Modo oscuro configurado correctamente

### 🔘 **Interactividad**

- [ ] **Hover sin conflictos**: Un solo elemento transform por componente
- [ ] **Transiciones optimizadas**: Máximo 300ms, usar `colors` en lugar de `all`
- [ ] **z-index apropiados**: Contenido interactivo por encima de decoraciones
- [ ] Botones usando los gradientes apropiados
- [ ] Estados hover y focus implementados sin "doble mouse"

### 💬 **Chatbot Widget**

- [ ] **Tamaño actualizado**: Modal `h-[36rem] w-96` (más ancho)
- [ ] **Sugerencias**: Grid 2 columnas con 6 preguntas FAQ principales
- [ ] **Gradientes diversos**: Cada sugerencia con color temático único
- [ ] **Mensajes amplios**: Contenedores `max-w-sm` para mejor legibilidad

### 🏗️ **Estructura**

- [ ] Tarjetas con sombras y efectos consistentes
- [ ] Texto con jerarquía y colores apropiados
- [ ] Elementos decorativos con transparencias correctas
- [ ] Animaciones y transiciones aplicadas
- [ ] Grid gaps y flex spacing apropiados
- [ ] **Pets Section**: Fondo azul-verde diferenciado del resto

---

## 🎯 Assets y Recursos

### Importación de Logos

```tsx
// Importaciones necesarias
import Logo from "../../../../public/Logo/Logo.png";
import LogoWhite from "../../../../public/Logo/LogoWhite.png";

// Uso en componente
const LogoComponent = () => (
  <div className="logo-container">
    {/* Logo modo claro */}
    <img
      src={Logo}
      alt="Logo AdoptaFácil"
      className="h-36 w-56 drop-shadow-2xl dark:hidden"
    />
    {/* Logo modo oscuro */}
    <img
      src={LogoWhite}
      alt="Logo AdoptaFácil"
      className="h-36 w-56 drop-shadow-2xl hidden dark:block"
    />
  </div>
);
```

### Efectos de Logo

```css
/* Efectos estándar para logos */
.logo-effects {
  drop-shadow: drop-shadow-2xl;
  transition: transform 0.3s ease;
}

.logo-effects:hover {
  transform: scale(1.05);
}

/* Tamaños responsive */
.logo-sm {
  height: 24px;
  width: auto;
} /* h-6 */
.logo-md {
  height: 36px;
  width: auto;
} /* h-9 */
.logo-lg {
  height: 144px;
  width: 224px;
} /* h-36 w-56 */
.logo-xl {
  height: 192px;
  width: 288px;
} /* h-48 w-72 */
```

### Ejemplos Prácticos de Espaciado

```tsx
/* Formulario Login con espaciado óptimo */
<div className="p-8 space-y-6">                    {/* Contenedor principal */}
  <div className="mb-6">                           {/* Logo section */}
    <img className="mb-6 h-28 w-44" />            {/* Logo con margen */}
  </div>

  <form className="space-y-6">                     {/* Formulario */}
    <div className="space-y-2">                    {/* Campo individual */}
      <label className="mb-2" />                   {/* Label */}
      <input className="px-4 py-3" />             {/* Input con padding */}
    </div>

    <button className="mt-6 px-8 py-4" />         {/* Botón con espaciado */}
  </form>
</div>

/* Tarjetas de registro con espaciado responsive */
<div className="grid gap-8 lg:gap-10 max-w-5xl">  {/* Grid con gaps */}
  <div className="p-8 space-y-6">                 {/* Tarjeta individual */}
    <div className="mb-6" />                      {/* Icono section */}
    <h3 className="mb-4" />                       {/* Título */}
    <p className="mb-8" />                        {/* Descripción */}
    <button className="px-8 py-4" />              {/* Botón de acción */}
  </div>
</div>

/* Header responsive con espaciado escalable */
<div className="pt-12 pb-4 md:pt-16 md:pb-6 lg:pt-20 lg:pb-8">
  <div className="mb-6 md:mb-8">                  {/* Logo section */}
    <img className="mb-6" />
  </div>
  <h1 className="mt-2 mb-4" />                    {/* Título principal */}
  <p className="mt-4" />                          {/* Descripción */}
  <div className="mt-6" />                        {/* Línea decorativa */}
</div>
```

---

## � Tabla de Referencia de Espaciado

| Uso              | Clase Tailwind         | Píxeles | Cuándo Usar              |
| ---------------- | ---------------------- | ------- | ------------------------ |
| **Muy Pequeño**  | `space-1, p-1, m-1`    | 4px     | Ajustes mínimos, iconos  |
| **Pequeño**      | `space-2, p-2, m-2`    | 8px     | Labels, elementos unidos |
| **Estándar**     | `space-4, p-4, m-4`    | 16px    | Campos de formulario     |
| **Medio**        | `space-6, p-6, m-6`    | 24px    | Secciones relacionadas   |
| **Grande**       | `space-8, p-8, m-8`    | 32px    | Separación principal     |
| **Extra Grande** | `space-12, p-12, m-12` | 48px    | Secciones independientes |

### Espaciado por Tipo de Componente

| Componente            | Padding Interno                 | Margen Entre Elementos         | Gap en Grid       |
| --------------------- | ------------------------------- | ------------------------------ | ----------------- |
| **Botones**           | `px-8 py-4`                     | `space-x-4`                    | -                 |
| **Inputs**            | `px-4 py-3`                     | `space-y-2` (label-input)      | -                 |
| **Tarjetas**          | `p-8`                           | `space-y-6` (interno)          | `gap-8 lg:gap-10` |
| **Formularios**       | `p-8`                           | `space-y-6` (campos)           | -                 |
| **Secciones Landing** | `pt-30 pb-20 md:pt-36 md:pb-24` | `space-y-20` (entre secciones) | -                 |
| **Hero Section**      | `pt-30 pb-8 md:pt-36 md:pb-10`  | -                              | -                 |
| **Grid Layout**       | -                               | -                              | `gap-8 lg:gap-12` |

---

## �💡 Notas de Uso

1. **Espaciado**: Usar múltiplos de 4px (4, 8, 16, 24, 32, 48px) para consistencia
2. **Logos**: Siempre usar Logo.png para modo claro y LogoWhite.png para modo oscuro
3. **Consistencia**: Usar siempre los mismos gradientes y colores definidos
4. **Responsive**: Escalar espaciado progresivamente: móvil < tablet < desktop
5. **Accesibilidad**: Mantener contraste suficiente y espaciado táctil (44px mínimo)
6. **Performance**: Usar `transform` y `opacity` para animaciones suaves
7. **Jerarquía**: Respetar la escala de sombras, tamaños de texto y espaciado
8. **Componentes**: Seguir patrones de espaciado específicos por tipo de elemento
9. **Assets**: Precargar logos importantes para mejor rendimiento

---

## 📐 Estándar de Espaciado de Secciones

### Espaciado Uniforme para Landing Page

```css
/* Espaciado estándar para todas las secciones de landing */
.landing-section-spacing {
  @apply pt-30 pb-20 md:pt-36 md:pb-24;
}

/* Espaciado especial para Hero Section */
.hero-section-spacing {
  @apply pt-30 pb-8 md:pt-36 md:pb-10;
}
```

### Aplicación en Componentes

| Componente            | Padding Top      | Padding Bottom   | Fondo y Características                  |
| --------------------- | ---------------- | ---------------- | ---------------------------------------- |
| **HeroSection**       | `pt-30 md:pt-36` | `pb-0 md:pb-6`   | Gradiente principal con padding reducido |
| **CategoriesSection** | `pt-30 md:pt-36` | `pb-20 md:pb-24` | Fondo blanco/gray-900 estándar           |
| **PetsSection**       | `pt-30 md:pt-36` | `pb-20 md:pb-24` | Paleta azul-verde con borde superior     |
| **ProductsSection**   | `pt-30 md:pt-36` | `pb-20 md:pb-24` | Sección estándar de contenido            |

### Paleta de Colores por Sección

| Sección        | Modo Claro                                         | Modo Oscuro                                                       |
| -------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| **Header**     | `from-blue-600 to-green-600` (logo)                | `dark:from-blue-400 dark:to-green-400`                            |
| **Hero**       | `from-green-400 via-blue-500 to-purple-600`        | `dark:from-green-600 dark:via-blue-700 dark:to-purple-800`        |
| **Categories** | `bg-white` estándar                                | `dark:bg-gray-900` estándar                                       |
| **Pets**       | `from-blue-100/80 via-green-100/60 to-blue-200/40` | `dark:from-blue-950/40 dark:via-green-950/30 dark:to-blue-900/50` |
| **Products**   | Sección estándar                                   | Sección estándar                                                  |

### Valores en Píxeles

| Clase      | Móvil | Desktop | Uso                                |
| ---------- | ----- | ------- | ---------------------------------- |
| `pt-30`    | 120px | 120px   | Padding superior estándar          |
| `md:pt-36` | 120px | 144px   | Padding superior en desktop        |
| `pb-8`     | 32px  | 32px    | Padding inferior hero              |
| `md:pb-10` | 32px  | 40px    | Padding inferior hero desktop      |
| `pb-20`    | 80px  | 80px    | Padding inferior secciones         |
| `md:pb-24` | 80px  | 96px    | Padding inferior secciones desktop |

---

## 🏠 Componentes de Landing Page

### Header Navigation

```css
/* Header principal con backdrop blur */
.header-main {
  @apply fixed top-0 left-0 z-50 w-full transition-all duration-300;
  @apply backdrop-blur-md;
}

/* Estados de scroll */
.header-scrolled {
  @apply bg-white/95 shadow-lg dark:bg-gray-800/95;
}

.header-transparent {
  @apply bg-white/10;
}

/* Logo con efectos */
.header-logo {
  @apply h-12 w-auto drop-shadow-lg transition-all duration-300 hover:scale-105;
}

/* Título del header */
.header-title-scrolled {
  @apply bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent;
  @apply dark:from-blue-400 dark:to-green-400;
}

.header-title-transparent {
  @apply text-white drop-shadow-md;
}

/* Navegación principal */
.nav-link-scrolled {
  @apply text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400;
}

.nav-link-transparent {
  @apply text-white hover:text-blue-200 drop-shadow-md;
}
```

### Hero Section

```css
/* Hero principal con gradiente completo */
.hero-main {
  @apply relative min-h-auto pt-30 pb-8 md:pt-36 md:pb-10;
  @apply bg-gradient-to-br from-green-400 via-blue-500 to-purple-600;
  @apply dark:from-green-600 dark:via-blue-700 dark:to-purple-800;
}

/* Elementos decorativos hero */
.hero-circle-large {
  @apply h-64 w-64 rounded-full bg-white/5 blur-3xl;
}

.hero-circle-medium {
  @apply h-32 w-32 rounded-full bg-blue-300/10 blur-2xl;
}

/* Título principal hero */
.hero-title {
  @apply text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl lg:text-6xl pb-2;
  @apply bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent;
}

/* Formulario de búsqueda */
.hero-search-form {
  @apply flex flex-col space-y-4 rounded-2xl bg-white/10 backdrop-blur-md;
  @apply p-6 shadow-2xl md:flex-row md:space-y-0 md:space-x-4;
  @apply border border-white/20;
}

.hero-search-input {
  @apply flex-1 rounded-xl px-6 py-4 text-gray-800 placeholder-gray-500;
  @apply focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg;
  @apply transition-all duration-300;
}

.hero-search-button {
  @apply rounded-xl bg-gradient-to-r from-blue-600 to-blue-700;
  @apply px-8 py-4 font-semibold text-white shadow-xl;
  @apply transition-all duration-300 hover:scale-105 hover:shadow-2xl;
  @apply focus:outline-none focus:ring-4 focus:ring-blue-300/50;
}
```

### Pets Section

```css
/* Sección de mascotas con paleta header adaptada */
.pets-section {
  @apply relative border-t border-blue-200/50 pt-30 pb-20 md:pt-36 md:pb-24;
  @apply bg-gradient-to-br from-blue-100/80 via-green-100/60 to-blue-200/40;
  @apply dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-blue-900/50;
}

/* Elementos decorativos pets */
.pets-decoration-large {
  @apply h-40 w-40 rounded-full blur-3xl;
  @apply bg-gradient-to-br from-blue-300/30 to-green-300/30;
  @apply dark:from-blue-800/25 dark:to-green-800/25;
}

.pets-decoration-medium {
  @apply h-32 w-32 rounded-full blur-2xl;
  @apply bg-gradient-to-br from-green-300/35 to-blue-300/35;
  @apply dark:from-green-800/30 dark:to-blue-800/30;
}

/* Puntos animados pets */
.pets-dot-blue {
  @apply h-3 w-3 animate-pulse rounded-full shadow-lg;
  @apply bg-blue-400/90 shadow-blue-400/50;
  @apply dark:bg-blue-600/90 dark:shadow-blue-600/50;
}

.pets-dot-green {
  @apply h-4 w-4 animate-ping rounded-full shadow-lg;
  @apply bg-green-400/80 shadow-green-400/50;
  @apply dark:bg-green-600/80 dark:shadow-green-600/50;
}

/* Stats cards en pets section */
.pets-stats-green {
  @apply rounded-2xl border border-green-200/50 bg-white/95 backdrop-blur-sm p-6 text-center shadow-xl;
  @apply ring-1 ring-green-100/60 dark:border-green-800/40 dark:bg-gray-900/95 dark:ring-green-900/40;
}

.pets-stats-blue {
  @apply rounded-2xl border border-blue-200/50 bg-white/95 backdrop-blur-sm p-6 text-center shadow-xl;
  @apply ring-1 ring-blue-100/60 dark:border-blue-800/40 dark:bg-gray-900/95 dark:ring-blue-900/40;
}

.pets-stats-blue-green {
  @apply rounded-2xl border border-blue-200/50 bg-white/95 backdrop-blur-sm p-6 text-center shadow-xl;
  @apply ring-1 ring-blue-100/60 dark:border-green-800/40 dark:bg-gray-900/95 dark:ring-green-900/40;
}

/* Gradientes de stats pets */
.pets-stats-text-green {
  @apply bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-4xl font-bold text-transparent;
  @apply dark:from-green-400 dark:to-green-500;
}

.pets-stats-text-blue {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-4xl font-bold text-transparent;
  @apply dark:from-blue-400 dark:to-blue-500;
}

.pets-stats-text-blue-green {
  @apply bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-4xl font-bold text-transparent;
  @apply dark:from-blue-400 dark:to-green-400;
}

/* Líneas decorativas pets */
.pets-stats-line-green {
  @apply mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-500;
  @apply dark:from-green-500 dark:to-green-600;
}

.pets-stats-line-blue {
  @apply mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-blue-400 to-blue-500;
  @apply dark:from-blue-500 dark:to-blue-600;
}

.pets-stats-line-blue-green {
  @apply mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-blue-400 to-green-400;
  @apply dark:from-blue-500 dark:to-green-500;
}
```

### Categories Section

```css
/* Sección de categorías */
.categories-section {
  @apply relative bg-white py-20 dark:bg-gray-900;
}

/* Header de sección con badge */
.section-badge {
  @apply inline-flex items-center rounded-full px-8 py-4 text-sm font-bold shadow-lg;
  @apply bg-gradient-to-r from-green-100 via-blue-100 to-purple-100;
  @apply text-green-800 dark:from-green-900/50 dark:via-blue-900/50 dark:to-purple-900/50;
  @apply dark:text-green-200;
}

/* Títulos de sección */
.section-title {
  @apply text-4xl font-bold text-gray-800 lg:text-6xl dark:text-white tracking-tight;
}

.section-title-gradient {
  @apply bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent;
}

/* Línea decorativa */
.section-divider {
  @apply mx-auto h-1 w-32 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full;
}
```

### Category Cards

```css
/* Tarjeta de categoría base */
.category-card {
  @apply group relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl;
  @apply transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl;
  @apply dark:bg-gray-800 border border-gray-100 dark:border-gray-700;
}

/* Iconos de categoría */
.category-icon-perros {
  @apply bg-gradient-to-br from-blue-500 to-blue-700;
  @apply hover:from-blue-600 hover:to-blue-800;
}

.category-icon-gatos {
  @apply bg-gradient-to-br from-green-500 to-green-700;
  @apply hover:from-green-600 hover:to-green-800;
}

.category-icon-base {
  @apply inline-flex h-24 w-24 items-center justify-center rounded-2xl shadow-xl;
  @apply transition-all duration-300 group-hover:scale-110 group-hover:rotate-3;
}

/* Call to action de categoría */
.category-cta {
  @apply flex h-12 w-12 items-center justify-center rounded-full shadow-lg;
  @apply transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:shadow-xl;
}
```

### Pet Cards - Optimizadas (Sin conflictos de hover)

```css
/* Tarjeta de mascota - SIN escalado del contenedor */
.pet-card {
  @apply group relative overflow-hidden rounded-2xl bg-white shadow-xl;
  @apply transition-all duration-300 hover:shadow-2xl;
  @apply dark:bg-gray-800 border border-gray-100 dark:border-gray-700;
}

/* Imagen de mascota - Escalado reducido y más rápido */
.pet-image {
  @apply h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105;
}

/* Overlay sutil - Menos intenso */
.pet-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent;
  @apply opacity-0 transition-opacity duration-300 group-hover:opacity-100;
}

/* Badge de disponibilidad */
.pet-badge {
  @apply absolute top-4 right-4 rounded-full bg-green-500 px-3 py-1;
  @apply text-xs font-semibold text-white shadow-lg;
}

/* Botón de mascota - SIN escalado, solo colores */
.pet-button {
  @apply block w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700;
  @apply py-4 text-center font-semibold text-white shadow-lg;
  @apply transition-colors duration-300 hover:from-blue-600 hover:to-blue-800;
  @apply focus:outline-none focus:ring-4 focus:ring-blue-300/50;
}

/* Línea decorativa de progreso */
.pet-progress-line {
  @apply mb-6 h-0.5 w-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500;
  @apply transition-all duration-300 group-hover:w-24;
}

/* Configuración para evitar "doble mouse" */
.pet-card-content {
  @apply relative z-10; /* Asegurar que el contenido esté por encima de overlays */
}

.pet-card-no-conflict {
  /* Eliminar efectos complejos que causan conflictos */
  @apply [&>.shine-effect]:hidden; /* Sin efectos de brillo */
}
```

### Solución de Conflictos de Hover

```css
/* PROBLEMA: Múltiples elementos escalando simultáneamente */
/* ❌ ANTES - Conflictivo */
.conflicted-card {
  @apply hover:scale-105; /* Contenedor escala */
}
.conflicted-image {
  @apply group-hover:scale-110; /* Imagen escala */
}
.conflicted-button {
  @apply hover:scale-105; /* Botón escala */
}

/* ✅ DESPUÉS - Optimizado */
.optimized-card {
  @apply hover:shadow-2xl; /* Solo sombra, no escala */
}
.optimized-image {
  @apply group-hover:scale-105; /* Solo imagen escala sutilmente */
}
.optimized-button {
  @apply hover:from-blue-600 hover:to-blue-800; /* Solo colores cambian */
}

/* Principios para evitar conflictos de cursor */
/* 1. Un solo elemento principal con transform por tarjeta */
/* 2. Transiciones más rápidas (300ms máximo) */
/* 3. Evitar overlays complejos con transform */
/* 4. z-index claro para contenido interactivo */
```

### Product Cards

```css
/* Tarjeta de producto */
.product-card {
  @apply group relative overflow-hidden rounded-2xl bg-white shadow-xl;
  @apply transition-all duration-500 hover:scale-105 hover:shadow-2xl;
  @apply dark:bg-gray-800 border border-gray-100 dark:border-gray-700;
}

/* Badge de producto */
.product-badge {
  @apply absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg;
  @apply bg-gradient-to-r from-green-500 to-green-600;
}

/* Precio de producto */
.product-price {
  @apply text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent;
  @apply dark:from-green-400 dark:to-green-500;
}

/* Botón de producto */
.product-button {
  @apply block w-full rounded-xl bg-gradient-to-r from-green-500 to-green-700;
  @apply py-4 text-center font-semibold text-white shadow-lg;
  @apply transition-all duration-300 hover:scale-105 hover:shadow-xl;
  @apply hover:from-green-600 hover:to-green-800;
  @apply focus:outline-none focus:ring-4 focus:ring-green-300/50;
}
```

### Stats Cards

```css
/* Tarjetas de estadísticas */
.stats-card {
  @apply text-center p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50;
  @apply bg-white/80 dark:bg-gray-800/80 transition-all hover:scale-105 hover:shadow-lg;
}

.stats-number-green {
  @apply text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent;
}

.stats-number-blue {
  @apply text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent;
}

.stats-number-purple {
  @apply text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent;
}

.stats-divider {
  @apply mt-3 h-1 w-12 mx-auto rounded-full;
}

.stats-divider-green {
  @apply bg-gradient-to-r from-green-500 to-green-600;
}

.stats-divider-blue {
  @apply bg-gradient-to-r from-blue-500 to-blue-600;
}

.stats-divider-purple {
  @apply bg-gradient-to-r from-purple-500 to-purple-600;
}
```

### Footer

```css
/* Footer principal */
.footer-main {
  @apply relative z-10 py-16 text-white;
  @apply bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800;
  @apply dark:from-gray-900 dark:via-black dark:to-gray-900;
}

/* Título footer */
.footer-title {
  @apply text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent;
}

/* Enlaces footer */
.footer-link {
  @apply text-gray-300 transition-all duration-300 hover:translate-x-1;
}

.footer-link-green {
  @apply hover:text-green-400;
}

.footer-link-blue {
  @apply hover:text-blue-400;
}

.footer-link-purple {
  @apply hover:text-purple-400;
}

/* Iconos sociales */
.footer-social {
  @apply flex h-10 w-10 items-center justify-center rounded-full text-white;
  @apply transition-all duration-300 hover:scale-110 hover:shadow-lg;
}

.footer-social-facebook {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-500/50;
}

.footer-social-instagram {
  @apply bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-purple-500/50;
}

.footer-social-twitter {
  @apply bg-gradient-to-r from-blue-400 to-blue-500 hover:shadow-blue-400/50;
}
```

### Chatbot Widget

```css
/* Botón flotante chatbot - ACTUALIZADO con mayor ancho */
.chatbot-button {
  @apply fixed right-6 bottom-6 z-50 rounded-full p-4 text-white shadow-2xl;
  @apply bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600;
  @apply transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 hover:shadow-2xl group;
}

/* Modal chatbot - ACTUALIZADO más ancho y alto */
.chatbot-modal {
  @apply fixed right-6 bottom-24 z-50 flex h-[36rem] w-96 flex-col rounded-3xl;
  @apply border border-gray-200/50 bg-white/95 backdrop-blur-md shadow-2xl;
  @apply dark:border-gray-700/50 dark:bg-gray-800/95;
}

/* Mensajes chatbot - ACTUALIZADO contenedores más amplios */
.chatbot-message-container {
  @apply max-w-sm rounded-2xl px-5 py-4 shadow-lg transition-all hover:shadow-xl;
}

/* Sugerencias rápidas chatbot - ACTUALIZADO grid 2 columnas */
.chatbot-suggestions {
  @apply mt-3 grid grid-cols-2 gap-2;
}

.chatbot-suggestion-button {
  @apply rounded-lg px-3 py-2 text-xs transition-all hover:scale-105;
}

.chatbot-suggestion-blue {
  @apply bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800;
  @apply hover:from-blue-200 hover:to-blue-300;
  @apply dark:from-blue-900/50 dark:to-blue-800/50 dark:text-blue-300;
  @apply dark:hover:from-blue-800/60 dark:hover:to-blue-700/60;
}

.chatbot-suggestion-green {
  @apply bg-gradient-to-r from-green-100 to-green-200 text-green-800;
  @apply hover:from-green-200 hover:to-green-300;
  @apply dark:from-green-900/50 dark:to-green-800/50 dark:text-green-300;
  @apply dark:hover:from-green-800/60 dark:hover:to-green-700/60;
}

.chatbot-suggestion-purple {
  @apply bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800;
  @apply hover:from-purple-200 hover:to-purple-300;
  @apply dark:from-purple-900/50 dark:to-purple-800/50 dark:text-purple-300;
  @apply dark:hover:from-purple-800/60 dark:hover:to-purple-700/60;
}

.chatbot-suggestion-orange {
  @apply bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800;
  @apply hover:from-orange-200 hover:to-orange-300;
  @apply dark:from-orange-900/50 dark:to-orange-800/50 dark:text-orange-300;
  @apply dark:hover:from-orange-800/60 dark:hover:to-orange-700/60;
}

.chatbot-suggestion-teal {
  @apply bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800;
  @apply hover:from-teal-200 hover:to-teal-300;
  @apply dark:from-teal-900/50 dark:to-teal-800/50 dark:text-teal-300;
  @apply dark:hover:from-teal-800/60 dark:hover:to-teal-700/60;
}

.chatbot-suggestion-indigo {
  @apply bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800;
  @apply hover:from-indigo-200 hover:to-indigo-300;
  @apply dark:from-indigo-900/50 dark:to-indigo-800/50 dark:text-indigo-300;
  @apply dark:hover:from-indigo-800/60 dark:hover:to-indigo-700/60;
}

/* Header chatbot */
.chatbot-header {
  @apply flex items-center justify-between rounded-t-3xl p-6 text-white shadow-lg;
  @apply bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600;
}

/* Mensajes chatbot */
.chatbot-message-user {
  @apply bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white ml-4;
}

.chatbot-message-bot {
  @apply border border-gray-200/50 bg-white/90 text-gray-800 mr-4;
  @apply dark:border-gray-600/50 dark:bg-gray-700/90 dark:text-white;
}

/* Input chatbot */
.chatbot-input {
  @apply flex-1 rounded-xl border px-5 py-4 transition-all shadow-sm;
  @apply focus:ring-4 focus:ring-blue-300/50 focus:outline-none;
  @apply hover:border-blue-400 dark:hover:border-blue-500;
}

.chatbot-send-button {
  @apply rounded-xl p-4 text-white shadow-lg transition-all duration-300;
  @apply bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600;
  @apply hover:scale-110 hover:shadow-xl;
  @apply hover:from-blue-600 hover:via-blue-700 hover:to-purple-700;
}
```

### Theme Switcher

```css
/* Botón theme switcher */
.theme-switcher {
  @apply h-14 w-14 rounded-full shadow-xl transition-all duration-300;
  @apply bg-gradient-to-br from-gray-200 to-gray-300 hover:shadow-2xl hover:scale-110;
  @apply dark:from-gray-700 dark:to-gray-800;
  @apply border-2 border-white/50 dark:border-gray-600/50;
}

/* Dropdown theme switcher */
.theme-dropdown {
  @apply w-48 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl p-2;
  @apply dark:bg-gray-800/95 border border-gray-200/50 dark:border-gray-700/50;
}

.theme-option {
  @apply rounded-lg px-4 py-3 transition-all cursor-pointer font-medium;
}

.theme-option-light {
  @apply hover:bg-yellow-100 dark:hover:bg-yellow-900/50;
}

.theme-option-dark {
  @apply hover:bg-blue-100 dark:hover:bg-blue-900/50;
}

.theme-option-system {
  @apply hover:bg-green-100 dark:hover:bg-green-900/50;
}
```

### Efectos Especiales

```css
/* Efecto de brillo en hover */
.shine-effect {
  @apply absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent;
  @apply opacity-0 transition-opacity duration-500 group-hover:opacity-100;
  @apply -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%];
}

/* Puntos decorativos animados */
.dot-pulse {
  @apply rounded-full animate-pulse;
}

.dot-ping {
  @apply rounded-full animate-ping;
}

/* Líneas de progreso decorativas */
.progress-line {
  @apply h-0.5 rounded-full transition-all duration-300;
}

.progress-line-hover {
  @apply group-hover:w-24;
}

/* Separadores de sección */
.section-separator {
  @apply mx-auto mb-6 h-1 rounded-full;
}
```

---

## 🎛️ Sistema de Filtros Mejorados

### Contenedor de Filtros Principal

```css
/* Contenedor con gradiente y decoraciones */
.filters-container {
  @apply rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/80 via-green-50/60 to-purple-50/40 p-6 shadow-lg backdrop-blur-sm;
  @apply dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-purple-900/50 dark:shadow-2xl;
}

/* Decoraciones de fondo para filtros */
.filters-decorations {
  @apply pointer-events-none absolute inset-0 overflow-hidden rounded-2xl;
}
.filters-decoration-top {
  @apply absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-300/30 to-green-300/30 blur-xl;
  @apply dark:from-blue-700/20 dark:to-green-700/20;
}
.filters-decoration-bottom {
  @apply absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-tr from-green-300/20 to-purple-300/20 blur-lg;
  @apply dark:from-green-800/15 dark:to-purple-800/15;
}
```

### Campos de Filtro por Color

```css
/* Input de búsqueda */
.filter-search-input {
  @apply w-full rounded-xl border-2 border-blue-200/60 bg-white/90 px-4 py-3 font-medium shadow-md;
  @apply transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 focus:shadow-lg hover:shadow-md;
  @apply dark:border-blue-700/60 dark:bg-gray-800/90 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-700/50;
}

/* Select de Especie (Azul) */
.filter-select-blue {
  @apply rounded-xl border-2 border-blue-300/70 bg-white/90 px-4 py-3 font-semibold shadow-md;
  @apply transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 focus:shadow-lg hover:shadow-md;
  @apply dark:border-blue-600/70 dark:bg-gray-800/90 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600/50;
}

/* Select de Ciudad (Verde) */
.filter-select-green {
  @apply rounded-xl border-2 border-green-300/70 bg-white/90 px-4 py-3 font-semibold shadow-md;
  @apply transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-200/50 focus:shadow-lg hover:shadow-md;
  @apply dark:border-green-600/70 dark:bg-gray-800/90 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-600/50;
}

/* Select de Edad (Amarillo) */
.filter-select-yellow {
  @apply rounded-xl border-2 border-yellow-300/70 bg-white/90 px-4 py-3 font-semibold shadow-md;
  @apply transition-all duration-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200/50 focus:shadow-lg hover:shadow-md;
  @apply dark:border-yellow-600/70 dark:bg-gray-800/90 dark:text-white dark:focus:border-yellow-400 dark:focus:ring-yellow-600/50;
}

/* Select de Género (Púrpura) */
.filter-select-purple {
  @apply rounded-xl border-2 border-purple-300/70 bg-white/90 px-4 py-3 font-semibold shadow-md;
  @apply transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 focus:shadow-lg hover:shadow-md;
  @apply dark:border-purple-600/70 dark:bg-gray-800/90 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-600/50;
}
```

### Píldoras de Filtros Activos

```css
/* Contenedor de filtros activos */
.active-filters-container {
  @apply rounded-xl border border-gray-200/50 bg-white/60 p-4 shadow-md backdrop-blur-sm;
  @apply dark:border-gray-700/50 dark:bg-gray-800/60;
}

/* Píldoras por categoría con colores específicos */
.filter-pill-blue {
  @apply group flex items-center gap-2 rounded-full border-2 border-blue-300 bg-gradient-to-r from-blue-100 to-blue-200;
  @apply px-4 py-2 text-sm font-semibold text-blue-800 shadow-lg transition-all duration-300 hover:shadow-xl;
  @apply dark:border-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200;
}

.filter-pill-green {
  @apply group flex items-center gap-2 rounded-full border-2 border-green-300 bg-gradient-to-r from-green-100 to-green-200;
  @apply px-4 py-2 text-sm font-semibold text-green-800 shadow-lg transition-all duration-300 hover:shadow-xl;
  @apply dark:border-green-600 dark:from-green-900 dark:to-green-800 dark:text-green-200;
}

.filter-pill-yellow {
  @apply group flex items-center gap-2 rounded-full border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-yellow-200;
  @apply px-4 py-2 text-sm font-semibold text-yellow-800 shadow-lg transition-all duration-300 hover:shadow-xl;
  @apply dark:border-yellow-600 dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-200;
}

.filter-pill-purple {
  @apply group flex items-center gap-2 rounded-full border-2 border-purple-300 bg-gradient-to-r from-purple-100 to-purple-200;
  @apply px-4 py-2 text-sm font-semibold text-purple-800 shadow-lg transition-all duration-300 hover:shadow-xl;
  @apply dark:border-purple-600 dark:from-purple-900 dark:to-purple-800 dark:text-purple-200;
}

/* Botones de cerrar en píldoras */
.filter-pill-close {
  @apply ml-1 flex h-5 w-5 items-center justify-center rounded-full font-bold;
  @apply transition-all duration-200 hover:scale-110;
}
```

### Emojis y Iconos por Categoría

```css
/* Emojis recomendados por filtro */
.filter-emojis {
  /* Búsqueda */
  --search-emoji: "🔎";

  /* Especies */
  --species-general: "🐾";
  --dog-emoji: "🐕";
  --cat-emoji: "🐱";

  /* Ubicación */
  --location-emoji: "📍";

  /* Edades */
  --age-general: "⏰";
  --young-pet: "🐶";
  --adult-pet: "🐕‍🦺";
  --senior-pet: "🐕‍🦳";

  /* Géneros */
  --gender-general: "⚤";
  --male-emoji: "♂️";
  --female-emoji: "♀️";

  /* Acciones */
  --clear-emoji: "🗑️";
  --active-emoji: "✨";
}
```

### Ejemplos de Implementación Completa

```tsx
/* Contenedor de filtros mejorado */
<div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/80 via-green-50/60 to-purple-50/40 p-6 shadow-lg backdrop-blur-sm dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-purple-900/50">

  {/* Título con gradiente */}
  <h3 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-lg font-bold text-transparent">
    🔍 Filtrar mascotas
  </h3>

  {/* Grid de filtros con colores específicos */}
  <div className="flex flex-wrap gap-4">
    <input
      className="rounded-xl border-2 border-blue-200/60 bg-white/90 px-4 py-3 font-medium shadow-md focus:border-blue-400"
      placeholder="🔎 Buscar por nombre..."
    />
    <select className="rounded-xl border-2 border-blue-300/70 bg-white/90 px-4 py-3 font-semibold shadow-md focus:border-blue-500">
      <option>🐾 Todas las especies</option>
      <option>🐕 Perro</option>
      <option>🐱 Gato</option>
    </select>
    {/* ... más selectores con colores específicos */}
  </div>
</div>

/* Píldoras de filtros activos */
<div className="rounded-xl border bg-white/60 p-4 shadow-md">
  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text font-bold text-transparent">
    ✨ Filtros Activos:
  </span>
  <span className="flex items-center gap-2 rounded-full border-2 border-blue-300 bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2">
    🐾 Perro
    <button className="rounded-full bg-blue-200 h-5 w-5 hover:scale-110">✕</button>
  </span>
</div>
```

---

## 📊 Dashboard AdoptaFácil

### Diseño Principal del Dashboard

El dashboard mantiene consistencia visual con las páginas principales usando el mismo gradiente de fondo y elementos decorativos, pero optimizado para la gestión administrativa.

#### Estructura Base del Dashboard

```css
/* Contenedor principal del dashboard */
.dashboard-main {
  @apply relative flex-1 overflow-y-auto p-6;
  @apply bg-gradient-to-br from-green-400 via-blue-500 to-purple-600;
  @apply dark:from-green-600 dark:via-blue-700 dark:to-purple-800;
}

/* Elementos decorativos de fondo */
.dashboard-decorations {
  @apply pointer-events-none absolute inset-0 overflow-hidden;
}

/* Círculos decorativos grandes */
.dashboard-circle-large {
  @apply absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl;
}

.dashboard-circle-medium {
  @apply absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl;
}

.dashboard-circle-small {
  @apply absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-300/10 blur-3xl;
}

/* Puntos animados del dashboard */
.dashboard-dot-pulse {
  @apply absolute right-20 top-20 h-3 w-3 animate-pulse rounded-full bg-white/20 shadow-lg;
}

.dashboard-dot-ping {
  @apply absolute left-1/4 top-1/3 h-4 w-4 animate-ping rounded-full bg-white/30 shadow-lg;
}

.dashboard-dot-small {
  @apply absolute bottom-32 right-1/3 h-2 w-2 animate-pulse rounded-full bg-white/25 shadow-md;
}
```

#### Header del Dashboard

```css
/* Título principal del dashboard */
.dashboard-title-main {
  @apply text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl lg:text-6xl;
  @apply bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent;
}

/* Subtítulo descriptivo */
.dashboard-subtitle {
  @apply mt-4 text-xl leading-relaxed font-medium text-white/90;
}

/* Línea decorativa del header */
.dashboard-divider {
  @apply mt-6 mx-auto h-1 w-32 rounded-full;
  @apply bg-gradient-to-r from-transparent via-white/60 to-transparent;
}

/* Contenedor del header */
.dashboard-header {
  @apply relative z-10 mb-8 text-center;
}
```

### Tarjetas de Estadísticas

#### Diseño Base de Tarjetas

```css
/* Contenedor de tarjetas estadísticas */
.dashboard-stats-grid {
  @apply mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4;
}

/* Tarjeta base con efectos glassmorphism */
.dashboard-stat-card {
  @apply group relative overflow-hidden rounded-3xl p-8 shadow-2xl backdrop-blur-sm;
  @apply bg-white/95 dark:bg-gray-800/95;
  @apply transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl;
}

/* Elementos decorativos de tarjetas */
.dashboard-card-decoration-top {
  @apply absolute -right-8 -top-8 h-24 w-24 rounded-full blur-xl;
}

.dashboard-card-decoration-bottom {
  @apply absolute -bottom-4 -left-4 h-16 w-16 rounded-full blur-xl;
}
```

#### Colores Temáticos por Tarjeta

```css
/* Tarjeta de Mascotas (Azul) */
.dashboard-card-mascotas .dashboard-card-decoration-top {
  @apply bg-gradient-to-br from-blue-500/20 to-transparent;
}

.dashboard-card-mascotas .dashboard-card-decoration-bottom {
  @apply bg-gradient-to-tr from-blue-300/10 to-transparent;
}

.dashboard-card-mascotas .dashboard-icon {
  @apply rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 p-4 shadow-xl;
}

/* Tarjeta de Adopciones (Verde) */
.dashboard-card-adopciones .dashboard-card-decoration-top {
  @apply bg-gradient-to-br from-green-500/20 to-transparent;
}

.dashboard-card-adopciones .dashboard-card-decoration-bottom {
  @apply bg-gradient-to-tr from-green-300/10 to-transparent;
}

.dashboard-card-adopciones .dashboard-icon {
  @apply rounded-2xl bg-gradient-to-r from-green-500 to-green-700 p-4 shadow-xl;
}

/* Tarjeta de Donaciones (Púrpura) */
.dashboard-card-donaciones .dashboard-card-decoration-top {
  @apply bg-gradient-to-br from-purple-500/20 to-transparent;
}

.dashboard-card-donaciones .dashboard-card-decoration-bottom {
  @apply bg-gradient-to-tr from-purple-300/10 to-transparent;
}

.dashboard-card-donaciones .dashboard-icon {
  @apply rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 p-4 shadow-xl;
}

/* Tarjeta de Usuarios (Azul-Verde) */
.dashboard-card-usuarios .dashboard-card-decoration-top {
  @apply bg-gradient-to-br from-blue-500/20 to-green-500/10;
}

.dashboard-card-usuarios .dashboard-card-decoration-bottom {
  @apply bg-gradient-to-tr from-blue-300/10 to-green-300/5;
}

.dashboard-card-usuarios .dashboard-icon {
  @apply rounded-2xl bg-gradient-to-r from-blue-500 to-green-600 p-4 shadow-xl;
}
```

#### Contenido de Tarjetas

```css
/* Ícono dentro de tarjeta */
.dashboard-icon svg {
  @apply h-8 w-8 text-white;
}

/* Badge de cambio positivo */
.dashboard-change-positive {
  @apply rounded-full px-3 py-1 text-sm font-semibold;
  @apply bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400;
}

/* Badge de cambio negativo */
.dashboard-change-negative {
  @apply rounded-full px-3 py-1 text-sm font-semibold;
  @apply bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400;
}

/* Título de métrica */
.dashboard-metric-title {
  @apply mb-2 text-sm font-medium text-gray-600 dark:text-gray-300;
}

/* Valor de métrica */
.dashboard-metric-value {
  @apply text-3xl font-bold text-gray-800 dark:text-white;
}

/* Contenedor del contenido de tarjeta */
.dashboard-card-content {
  @apply relative;
}

/* Header de tarjeta con ícono y badge */
.dashboard-card-header {
  @apply mb-4 flex items-center justify-between;
}
```

### Tabla de Actividades Recientes

#### Contenedor Principal

```css
/* Contenedor de tabla con glassmorphism */
.dashboard-activities-container {
  @apply relative overflow-hidden rounded-3xl p-8 shadow-2xl backdrop-blur-sm;
  @apply bg-white/95 dark:bg-gray-800/95;
}

/* Elementos decorativos de tabla */
.dashboard-activities-decoration-top {
  @apply absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl;
  @apply bg-gradient-to-br from-blue-500/10 to-purple-500/5;
}

.dashboard-activities-decoration-bottom {
  @apply absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-xl;
  @apply bg-gradient-to-tr from-green-500/10 to-blue-500/5;
}
```

#### Header de la Tabla

```css
/* Contenedor del header */
.dashboard-activities-header {
  @apply relative mb-6 flex items-center justify-between;
}

/* Título de actividades */
.dashboard-activities-title {
  @apply text-2xl font-bold text-gray-800 dark:text-white;
}

/* Descripción de actividades */
.dashboard-activities-description {
  @apply mt-1 text-sm text-gray-600 dark:text-gray-300;
}

/* Ícono decorativo del header */
.dashboard-activities-icon-container {
  @apply rounded-2xl bg-gradient-to-r from-blue-500/20 to-green-500/20 p-3;
}

.dashboard-activities-icon {
  @apply h-6 w-6 text-blue-600 dark:text-blue-400;
}

/* Línea separadora */
.dashboard-activities-divider {
  @apply mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent;
  @apply dark:via-gray-600;
}
```

### Paleta de Colores Específica del Dashboard

#### Gradientes de Fondo

| Elemento              | Modo Claro                                  | Modo Oscuro                                                |
| --------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| **Fondo principal**   | `from-green-400 via-blue-500 to-purple-600` | `dark:from-green-600 dark:via-blue-700 dark:to-purple-800` |
| **Círculos grandes**  | `bg-white/5`                                | `bg-white/5`                                               |
| **Círculos medianos** | `bg-blue-300/10`                            | `bg-blue-300/10`                                           |
| **Círculos pequeños** | `bg-purple-300/10`                          | `bg-purple-300/10`                                         |

#### Colores por Tipo de Tarjeta

| Tarjeta        | Gradiente de Ícono        | Decoración Superior           | Decoración Inferior           |
| -------------- | ------------------------- | ----------------------------- | ----------------------------- |
| **Mascotas**   | `blue-500 → blue-700`     | `blue-500/20 → transparent`   | `blue-300/10 → transparent`   |
| **Adopciones** | `green-500 → green-700`   | `green-500/20 → transparent`  | `green-300/10 → transparent`  |
| **Donaciones** | `purple-500 → purple-700` | `purple-500/20 → transparent` | `purple-300/10 → transparent` |
| **Usuarios**   | `blue-500 → green-600`    | `blue-500/20 → green-500/10`  | `blue-300/10 → green-300/5`   |

#### Estados de Cambio

```css
/* Indicadores de cambio */
.dashboard-change-colors {
  /* Positivo */
  --change-positive-bg: theme("colors.green.100");
  --change-positive-text: theme("colors.green.700");
  --change-positive-dark-bg: theme("colors.green.900/0.3");
  --change-positive-dark-text: theme("colors.green.400");

  /* Negativo */
  --change-negative-bg: theme("colors.red.100");
  --change-negative-text: theme("colors.red.700");
  --change-negative-dark-bg: theme("colors.red.900/0.3");
  --change-negative-dark-text: theme("colors.red.400");
}
```

### Implementación Completa del Dashboard

#### Estructura JSX Base

```tsx
export default function Dashboard({ stats, actividadesRecientes }) {
  return (
    <AppLayout>
      <main className="dashboard-main">
        {/* Elementos decorativos */}
        <div className="dashboard-decorations">
          <div className="dashboard-circle-large"></div>
          <div className="dashboard-circle-medium"></div>
          <div className="dashboard-circle-small"></div>
          <div className="dashboard-dot-pulse"></div>
          <div className="dashboard-dot-ping"></div>
          <div className="dashboard-dot-small"></div>
        </div>

        <div className="relative z-10 container mx-auto">
          {/* Header del Dashboard */}
          <div className="dashboard-header">
            <h1 className="dashboard-title-main">Panel de Control</h1>
            <p className="dashboard-subtitle">
              Gestiona y monitorea tu plataforma AdoptaFácil
            </p>
            <div className="dashboard-divider"></div>
          </div>

          {/* Grid de tarjetas estadísticas */}
          <div className="dashboard-stats-grid">
            {/* Tarjeta Mascotas */}
            <div className="dashboard-stat-card dashboard-card-mascotas">
              <div className="dashboard-card-decoration-top"></div>
              <div className="dashboard-card-decoration-bottom"></div>

              <div className="dashboard-card-content">
                <div className="dashboard-card-header">
                  <div className="dashboard-icon">{/* SVG Icon */}</div>
                  <div className="dashboard-change-positive">
                    +{stats.cambioMascotas}%
                  </div>
                </div>
                <h3 className="dashboard-metric-title">Total Mascotas</h3>
                <p className="dashboard-metric-value">{stats.totalMascotas}</p>
              </div>
            </div>

            {/* Repetir para otras tarjetas... */}
          </div>

          {/* Tabla de actividades */}
          <div className="dashboard-activities-container">
            <div className="dashboard-activities-decoration-top"></div>
            <div className="dashboard-activities-decoration-bottom"></div>

            <div className="relative">
              <div className="dashboard-activities-header">
                <div>
                  <h2 className="dashboard-activities-title">
                    Actividades Recientes
                  </h2>
                  <p className="dashboard-activities-description">
                    Últimas acciones en la plataforma
                  </p>
                </div>
                <div className="dashboard-activities-icon-container">
                  <svg className="dashboard-activities-icon">
                    {/* Lightning Icon */}
                  </svg>
                </div>
              </div>

              <div className="dashboard-activities-divider"></div>
              <RecentTable activities={actividadesRecientes} />
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
```

### Espaciado del Dashboard

#### Espaciado Principal

```css
/* Espaciado del contenedor principal */
.dashboard-spacing {
  @apply p-6; /* Padding general de 24px */
}

/* Espaciado del contenedor interno */
.dashboard-container-spacing {
  @apply container mx-auto; /* Contenedor centrado */
}

/* Espaciado del header */
.dashboard-header-spacing {
  @apply mb-8 text-center; /* Margin bottom de 32px */
}

/* Espaciado del grid de tarjetas */
.dashboard-stats-spacing {
  @apply mb-12 gap-8; /* Margin bottom 48px, gap 32px */
  @apply sm:grid-cols-2 lg:grid-cols-4; /* Responsive grid */
}

/* Espaciado interno de tarjetas */
.dashboard-card-spacing {
  @apply p-8; /* Padding interno de 32px */
}

/* Espaciado de la tabla */
.dashboard-table-spacing {
  @apply p-8; /* Padding interno de 32px */
}
```

#### Espaciado Responsive

| Elemento                 | Móvil          | Tablet           | Desktop          |
| ------------------------ | -------------- | ---------------- | ---------------- |
| **Contenedor principal** | `p-6` (24px)   | `p-6` (24px)     | `p-6` (24px)     |
| **Grid de tarjetas**     | `grid-cols-1`  | `sm:grid-cols-2` | `lg:grid-cols-4` |
| **Gap entre tarjetas**   | `gap-8` (32px) | `gap-8` (32px)   | `gap-8` (32px)   |
| **Padding de tarjetas**  | `p-8` (32px)   | `p-8` (32px)     | `p-8` (32px)     |
| **Margin del header**    | `mb-8` (32px)  | `mb-8` (32px)    | `mb-8` (32px)    |
| **Margin del grid**      | `mb-12` (48px) | `mb-12` (48px)   | `mb-12` (48px)   |

### Guía de Uso para Otros Dashboards

#### Checklist de Implementación

✅ **Fondo principal**: Usar el gradiente azul-verde-púrpura  
✅ **Elementos decorativos**: Incluir círculos y puntos animados  
✅ **Header centralizado**: Título con gradiente y línea decorativa  
✅ **Tarjetas glassmorphism**: Fondo semi-transparente con backdrop-blur  
✅ **Colores temáticos**: Un color específico por tipo de métrica  
✅ **Decoraciones por tarjeta**: Círculos graduales en esquinas  
✅ **Estados de cambio**: Verde para positivo, rojo para negativo  
✅ **Efectos hover**: Escala ligera (1.02) y sombra mejorada  
✅ **Espaciado consistente**: Múltiplos de 8px (32px, 48px)  
✅ **Modo oscuro**: Transiciones automáticas para todos los elementos

#### Personalización por Módulo

```css
/* Para dashboard de mascotas */
.dashboard-pets-theme {
  /* Enfoque en verdes y azules */
  @apply from-green-500 via-blue-500 to-green-600;
}

/* Para dashboard de donaciones */
.dashboard-donations-theme {
  /* Enfoque en púrpuras y azules */
  @apply from-purple-500 via-blue-500 to-purple-600;
}

/* Para dashboard de usuarios */
.dashboard-users-theme {
  /* Enfoque en azules y verdes */
  @apply from-blue-500 via-green-500 to-blue-600;
}
```

---

**Versión**: 2.2  
**Última actualización**: Noviembre 2025  
**Basado en**: Dashboard AdoptaFácil con diseño glassmorphism y paleta completa integrada
