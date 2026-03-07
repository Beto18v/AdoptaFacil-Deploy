# Chatbot FAQ Service - AdoptaFácil

Servicio de chatbot inteligente para preguntas frecuentes sobre la plataforma AdoptaFácil, desarrollado con FastAPI y matching difuso (fuzzy matching) para manejar variaciones en las preguntas de los usuarios.

## 🚀 Características

- **Matching Difuso**: Utiliza algoritmos de similitud de texto para encontrar respuestas incluso con errores ortográficos o variaciones
- **Base de Conocimiento Estructurada**: Más de 45 preguntas frecuentes extraídas de la documentación de AdoptaFácil
- **API REST**: Endpoints simples para integración con la plataforma principal
- **Fácil Expansión**: Agregar nuevas preguntas y respuestas sin modificar el código core
- **Umbral Configurable**: Ajusta la sensibilidad del matching difuso según necesidades

## 📋 Requisitos del Sistema

- Python 3.8+
- pip (gestor de paquetes de Python)
- Entorno virtual (recomendado)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd chatbot-faq-service
```

### 2. Crear entorno virtual

```bash
# Windows
python -m venv venv
```

### 3. Activar entorno virtual

```bash
# Windows
.\venv\Scripts\activate
```

### 4. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 5. Verificar instalación

```bash
python -c "import fastapi, uvicorn, rapidfuzz; print('Todas las dependencias instaladas correctamente')"
```

## 🚀 Uso

### Iniciar el servidor de desarrollo

```bash
# Puerto por defecto (8000)
python -m uvicorn app.main:app --reload

# Puerto específico
python -m uvicorn app.main:app --reload --port 8001

# Con host específico
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# En caso de no encontrar el paquete
$env:PYTHONPATH="."; uvicorn app.main:app --reload --port 8001
```

### Verificar que funciona

Abre tu navegador en `http://localhost:8001` y deberías ver:

```json
{ "message": "Chatbot FAQ Service is running" }
```

### Documentación de la API

Visita `http://localhost:8001/docs` para ver la documentación interactiva de Swagger UI.

## 📡 API Endpoints

### POST /chat/

Envía una pregunta al chatbot y recibe una respuesta.

**Request:**

```json
{
  "message": "¿Cómo me registro en la plataforma?"
}
```

**Response:**

```json
{
  "reply": "El registro es simple: crea una cuenta con tu email, verifica tu correo electrónico y completa tu perfil. Hay diferentes tipos de cuenta según tu rol: adoptante, dueño de mascota, refugio o aliado comercial."
}
```

**Ejemplo con cURL:**

```bash
curl -X POST "http://localhost:8001/chat/" \
     -H "Content-Type: application/json" \
     -d '{"message": "¿Cómo adoptar una mascota?"}'
```

## 🔍 Cómo Funciona el Fuzzy Matching

### Algoritmo Utilizado

El chatbot utiliza la librería `rapidfuzz` con el scorer `token_sort_ratio`, que:

1. **Tokeniza** las preguntas (divide en palabras)
2. **Ordena** los tokens alfabéticamente
3. **Compara** la similitud entre secuencias de tokens
4. **Calcula** un puntaje de similitud (0-100)

### Umbral de Similitud

- **Umbral configurado**: 50%
- Si la similitud es ≥ 50%, se devuelve la respuesta correspondiente
- Si es < 50%, se intenta matching por palabras clave
- Si no hay coincidencias, se devuelve una respuesta genérica con sugerencias

### Ejemplos de Matching

| Pregunta del Usuario        | Pregunta en Base                      | Similitud | Resultado               |
| --------------------------- | ------------------------------------- | --------- | ----------------------- |
| "¿como me registro?"        | "¿Cómo me registro en la plataforma?" | 95%       | ✅ Respuesta exacta     |
| "registro en la plataforma" | "¿Cómo me registro en la plataforma?" | 85%       | ✅ Respuesta encontrada |
| "dónde registrarme"         | "¿Cómo me registro en la plataforma?" | 75%       | ❌ Bajo umbral          |
| "hola quiero registrarme"   | "¿Cómo me registro en la plataforma?" | 82%       | ✅ Respuesta encontrada |

## 📚 Expansión del Vocabulario

### Agregar Nuevas Preguntas

Edita el archivo `app/faqs.py` y agrega nuevas entradas al array `FAQS`:

```python
{
    "question": "¿Nueva pregunta frecuente?",
    "answer": "Respuesta detallada y útil.",
    "keywords": ["palabra", "clave", "alternativa"]
}
```

**Ejemplo:**

```python
{
    "question": "¿Cómo contactar soporte técnico?",
    "answer": "Puedes contactar al soporte técnico a través del email soporte@adoptafacil.com o usando el formulario de contacto en la plataforma.",
    "keywords": ["soporte", "ayuda", "contacto", "técnico"]
}
```

### Mejores Prácticas para Nuevas FAQs

1. **Pregunta clara y concisa**: Escribe la pregunta como la haría un usuario típico
2. **Respuesta completa**: Proporciona toda la información necesaria
3. **Palabras clave relevantes**: Incluye variaciones comunes y sinónimos
4. **Lenguaje natural**: Usa un tono amigable y conversacional
5. **Enlaces cuando aplique**: Incluye URLs o referencias a secciones de la plataforma

### Actualizar Keywords

Si una pregunta no se está matching correctamente, agrega más keywords:

```python
"keywords": ["registro", "registrar", "crear cuenta", "signup", "nuevo usuario"]
```

## 🧪 Testing

### Test Básico

```bash
# Verificar que el servidor responde
curl http://localhost:8001/

# Test del endpoint de chat
curl -X POST "http://localhost:8001/chat/" \
     -H "Content-Type: application/json" \
     -d '{"message": "hola"}'
```

### Test de Fuzzy Matching

Prueba con variaciones de preguntas conocidas:

```bash
# Pregunta exacta
curl -X POST "http://localhost:8001/chat/" \
     -H "Content-Type: application/json" \
     -d '{"message": "¿Qué es AdoptaFácil?"}'

# Con errores ortográficos
curl -X POST "http://localhost:8001/chat/" \
     -H "Content-Type: application/json" \
     -d '{"message": "ke es adoptafasil?"}'

# Pregunta reformulada
curl -X POST "http://localhost:8001/chat/" \
     -H "Content-Type: application/json" \
     -d '{"message": "explícame qué es esta plataforma"}'
```

## 🐳 Docker (Opcional)

### Construir imagen

```bash
docker build -t chatbot-faq-service .
```

### Ejecutar contenedor

```bash
docker run -p 8001:8001 chatbot-faq-service
```

## 🔧 Configuración Avanzada

### Cambiar Umbral de Similitud

Edita `app/fuzzy_matcher.py`:

```python
fuzzy_matcher = FuzzyMatcher(threshold=85.0)  # Más estricto
# o
fuzzy_matcher = FuzzyMatcher(threshold=70.0)  # Más permisivo
```

### Algoritmos de Matching Alternativos

En `app/fuzzy_matcher.py`, puedes cambiar el scorer:

```python
# Más sensible al orden de palabras
scorer=fuzz.token_sort_ratio

# Más rápido pero menos preciso
scorer=fuzz.ratio

# Mejor para frases cortas
scorer=fuzz.partial_ratio
```

## 📊 Monitoreo y Logs

### Logs del Servidor

```bash
# Con logs detallados
python -m uvicorn app.main:app --reload --log-level info

# Guardar logs en archivo
python -m uvicorn app.main:app --reload --log-level info --access-log
```

### Health Check

```bash
curl http://localhost:8001/
# Debería retornar: {"message": "Chatbot FAQ Service is running"}
```

## 🚀 Despliegue en Producción

### Con Gunicorn + Uvicorn

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Variables de Entorno

```bash
export APP_ENV=production
export APP_PORT=8001
export APP_HOST=0.0.0.0
```

### Error: "Module 'rapidfuzz' not found"

```bash
pip install rapidfuzz==3.6.1
```

### Error: "Port already in use"

```bash
# Cambiar puerto
python -m uvicorn app.main:app --reload --port 8002
```

### Error: "Connection refused"

- Verifica que el servidor esté corriendo
- Revisa la URL y puerto
- Verifica firewall/antivirus

### El chatbot no encuentra respuestas

- Verifica que las preguntas estén en `app/faqs.py`
- Reduce el umbral de similitud
- Agrega más keywords a las preguntas relevantes

## ¿Dónde ampliar el chatbot?

### 1. Ampliar `app/routers/chat.py`

- Cambia el flujo de conversación, los endpoints y la lógica de cómo responde el bot.
- Útil para agregar nuevos endpoints, personalizar saludos/despedidas, o cambiar el comportamiento general.
- No almacena preguntas ni respuestas, solo orquesta el proceso.

### 2. Ampliar `app/faqs.py`

- Aquí agregas o editas las preguntas frecuentes, respuestas y palabras clave.
- Útil para que el bot sepa más cosas, entienda más variaciones o cubra nuevos temas.
- No contiene lógica de búsqueda, solo los datos.

### 3. Ampliar `app/fuzzy_matcher.py`

- Aquí puedes mejorar el algoritmo de búsqueda y comparación de preguntas.
- Útil para ajustar el umbral de similitud, cambiar el algoritmo de matching, o permitir sugerencias múltiples.
- No almacena preguntas ni respuestas, solo compara y busca.

**Resumen:**

- Si quieres que el bot sepa más: amplía `faqs.py`.
- Si quieres que busque/mejore cómo compara: amplía `fuzzy_matcher.py`.
- Si quieres cambiar cómo responde o agregar endpoints: amplía `chat.py`.

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
