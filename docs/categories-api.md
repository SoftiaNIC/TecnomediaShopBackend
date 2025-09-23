# 📂 API de Categorías - Documentación Completa

## 🔗 Base URL
```
http://localhost:3000/categories
```

---

## 📋 Tabla de Contenidos
1. [Información General](#información-general)
2. [Autenticación](#autenticación)
3. [Endpoints Públicos](#endpoints-públicos)
4. [Endpoints Protegidos](#endpoints-protegidos)
5. [Modelos de Datos](#modelos-de-datos)
6. [Códigos de Respuesta](#códigos-de-respuesta)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Casos de Error](#casos-de-error)

---

## 🌟 Información General

La API de Categorías proporciona operaciones CRUD completas para la gestión de categorías de productos en el sistema de e-commerce. Incluye:

- ✅ **Respuestas descriptivas** con mensajes en español
- ✅ **Validaciones robustas** con class-validator
- ✅ **Paginación inteligente** con metadatos detallados
- ✅ **Manejo de errores consistente** con información útil
- ✅ **Búsqueda avanzada** por nombre, descripción y slug
- ✅ **Generación automática de slugs** únicos
- ✅ **Control de acceso por roles** (ADMIN/SUPERADMIN)

---

## 🔐 Autenticación

### Endpoints Públicos
- `GET` - Consulta de categorías
- `GET` - Búsqueda de categorías
- `GET` - Generación de slugs

### Endpoints Protegidos
Requieren token JWT y rol **ADMIN** o **SUPERADMIN**:
- `POST` - Crear categoría
- `PUT` - Actualizar categoría
- `DELETE` - Eliminar categoría

### Formato de Autenticación
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 🌐 Endpoints Públicos

### 1. **GET /categories** - Listar todas las categorías

Obtiene todas las categorías con paginación y metadatos detallados.

**Parámetros de consulta:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `limit` | number | No | 10 | Número máximo de resultados |
| `offset` | number | No | 0 | Número de elementos a saltar |
| `sortBy` | string | No | 'createdAt' | Campo para ordenar |
| `sortOrder` | string | No | 'desc' | Orden: 'asc' o 'desc' |

**Ejemplo de petición:**
```bash
curl -X GET "http://localhost:3000/categories?limit=5&offset=0&sortBy=name&sortOrder=asc"
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Se encontraron 3 categorías de un total de 5",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electrónicos",
      "description": "Productos electrónicos y tecnológicos",
      "slug": "electronicos",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "count": 3,
    "limit": 5,
    "offset": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

**Respuesta sin datos (200):**
```json
{
  "success": true,
  "message": "No se encontraron categorías en el sistema",
  "data": [],
  "meta": {
    "total": 0,
    "count": 0,
    "limit": 10,
    "offset": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

### 2. **GET /categories/active** - Listar categorías activas

Obtiene solo las categorías que están activas.

**Parámetros de consulta:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `limit` | number | No | 10 | Número máximo de resultados |
| `offset` | number | No | 0 | Número de elementos a saltar |

**Ejemplo de petición:**
```bash
curl -X GET "http://localhost:3000/categories/active?limit=10"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Se encontraron 2 categorías activas de un total de 3",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electrónicos",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "count": 2,
    "limit": 10,
    "offset": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

### 3. **GET /categories/with-count** - Categorías con conteo de productos

Obtiene categorías incluyendo el número de productos asociados a cada una.

**Ejemplo de petición:**
```bash
curl -X GET "http://localhost:3000/categories/with-count"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Se encontraron 3 categorías con un total de 45 productos asociados",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electrónicos",
      "description": "Productos electrónicos y tecnológicos",
      "slug": "electronicos",
      "isActive": true,
      "productCount": 25,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "count": 3,
    "limit": 10,
    "offset": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

### 4. **GET /categories/search/{term}** - Buscar categorías

Busca categorías por nombre, descripción o slug.

**Parámetros de ruta:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `term` | string | Sí | Término de búsqueda |

**Parámetros de consulta:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `limit` | number | No | 10 | Número máximo de resultados |
| `offset` | number | No | 0 | Número de elementos a saltar |

**Ejemplo de petición:**
```bash
curl -X GET "http://localhost:3000/categories/search/electr"
```

**Respuesta con resultados:**
```json
{
  "success": true,
  "message": "Se encontraron 2 categorías que coinciden con \"electr\"",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electrónicos",
      "slug": "electronicos",
      "isActive": true
    }
  ],
  "meta": {
    "total": 2,
    "count": 2,
    "limit": 10,
    "offset": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

**Respuesta sin resultados:**
```json
{
  "success": true,
  "message": "No se encontraron categorías que coincidan con \"xyz\". Intenta con otros términos de búsqueda.",
  "data": [],
  "meta": {
    "total": 0,
    "count": 0,
    "limit": 10,
    "offset": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

### 5. **GET /categories/generate-slug/{name}** - Generar slug automático

Genera un slug único a partir de un nombre de categoría.

**Parámetros de ruta:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `name` | string | Sí | Nombre para generar el slug |

**Ejemplo de petición:**
```bash
curl -X GET "http://localhost:3000/categories/generate-slug/Productos%20Electrónicos"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Slug generado con modificación para garantizar unicidad: \"productos-electronicos-2\"",
  "data": {
    "originalName": "Productos Electrónicos",
    "generatedSlug": "productos-electronicos-2",
    "isUnique": false
  }
}
```

---

### 6. **GET /categories/{id}** - Obtener categoría por ID

Obtiene una categoría específica por su ID único.

**Parámetros de ruta:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | string (UUID) | Sí | ID único de la categoría |

**Ejemplo de petición:**
```bash
curl -X GET "http://localhost:3000/categories/123e4567-e89b-12d3-a456-426614174000"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Categoría \"Electrónicos\" encontrada exitosamente",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electrónicos",
    "description": "Productos electrónicos y tecnológicos",
    "slug": "electronicos",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "meta": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "Activa"
  }
}
```

---

### 7. **GET /categories/slug/{slug}** - Obtener categoría por slug

Obtiene una categoría específica por su slug único.

**Parámetros de ruta:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `slug` | string | Sí | Slug único de la categoría |

**Ejemplo de petición:**
```bash
curl -X GET "http://localhost:3000/categories/slug/electronicos"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Categoría con slug \"electronicos\" encontrada exitosamente",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electrónicos",
    "description": "Productos electrónicos y tecnológicos",
    "slug": "electronicos",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "meta": {
    "slug": "electronicos",
    "status": "Activa"
  }
}
```

---

## 🔒 Endpoints Protegidos

### 8. **POST /categories** - Crear nueva categoría

Crea una nueva categoría. **Requiere autenticación y rol ADMIN/SUPERADMIN.**

**Headers requeridos:**
```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Cuerpo de la petición:**
```json
{
  "name": "Ropa y Accesorios",
  "description": "Prendas de vestir y accesorios de moda",
  "slug": "ropa-accesorios",
  "isActive": true
}
```

**Validaciones:**
| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `name` | string | ✅ | 3-100 caracteres, único |
| `description` | string | ❌ | Texto libre |
| `slug` | string | ✅ | Formato: a-z0-9-, único |
| `isActive` | boolean | ❌ | Default: true |

**Ejemplo de petición:**
```bash
curl -X POST "http://localhost:3000/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Ropa y Accesorios",
    "description": "Prendas de vestir y accesorios de moda",
    "slug": "ropa-accesorios"
  }'
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "La categoría \"Ropa y Accesorios\" ha sido creada exitosamente",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "Ropa y Accesorios",
    "description": "Prendas de vestir y accesorios de moda",
    "slug": "ropa-accesorios",
    "isActive": true,
    "createdAt": "2024-01-15T11:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "meta": {
    "createdAt": "2024-01-15T11:30:00.000Z",
    "slug": "ropa-accesorios"
  }
}
```

---

### 9. **PUT /categories/{id}** - Actualizar categoría

Actualiza una categoría existente. **Requiere autenticación y rol ADMIN/SUPERADMIN.**

**Parámetros de ruta:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | string (UUID) | Sí | ID único de la categoría |

**Cuerpo de la petición (todos los campos opcionales):**
```json
{
  "name": "Electrónicos y Gadgets",
  "description": "Dispositivos electrónicos y gadgets tecnológicos",
  "isActive": true
}
```

**Ejemplo de petición:**
```bash
curl -X PUT "http://localhost:3000/categories/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Electrónicos y Gadgets",
    "description": "Dispositivos electrónicos y gadgets tecnológicos"
  }'
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "La categoría \"Electrónicos y Gadgets\" ha sido actualizada exitosamente",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electrónicos y Gadgets",
    "description": "Dispositivos electrónicos y gadgets tecnológicos",
    "slug": "electronicos",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "meta": {
    "updatedAt": "2024-01-15T12:00:00.000Z",
    "fieldsUpdated": ["name", "description"]
  }
}
```

---

### 10. **PUT /categories/{id}/status** - Actualizar estado

Actualiza el estado activo/inactivo de una categoría. **Requiere autenticación y rol ADMIN/SUPERADMIN.**

**Parámetros de ruta:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | string (UUID) | Sí | ID único de la categoría |

**Cuerpo de la petición:**
```json
{
  "isActive": false
}
```

**Ejemplo de petición:**
```bash
curl -X PUT "http://localhost:3000/categories/123e4567-e89b-12d3-a456-426614174000/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"isActive": false}'
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "El estado de la categoría \"Electrónicos\" ha sido desactivado exitosamente",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electrónicos",
    "isActive": false,
    "updatedAt": "2024-01-15T12:15:00.000Z"
  },
  "meta": {
    "previousStatus": true,
    "newStatus": false,
    "updatedAt": "2024-01-15T12:15:00.000Z"
  }
}
```

---

### 11. **DELETE /categories/{id}** - Eliminar categoría

Elimina una categoría del sistema. **Requiere autenticación y rol ADMIN/SUPERADMIN.**

**Parámetros de ruta:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | string (UUID) | Sí | ID único de la categoría |

**Ejemplo de petición:**
```bash
curl -X DELETE "http://localhost:3000/categories/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "La categoría \"Electrónicos\" ha sido eliminada exitosamente del sistema",
  "meta": {
    "deletedId": "123e4567-e89b-12d3-a456-426614174000",
    "deletedAt": "2024-01-15T12:30:00.000Z"
  }
}
```

---

## 📊 Modelos de Datos

### Category (Categoría)
```typescript
{
  id: string;           // UUID único
  name: string;         // Nombre de la categoría (3-100 caracteres)
  description?: string; // Descripción opcional
  slug: string;         // Slug único (a-z0-9-)
  isActive: boolean;    // Estado activo/inactivo
  createdAt: Date;      // Fecha de creación
  updatedAt: Date;      // Fecha de última actualización
}
```

### CreateCategoryDto
```typescript
{
  name: string;         // Requerido, 3-100 caracteres
  description?: string; // Opcional
  slug: string;         // Requerido, formato válido
  isActive?: boolean;   // Opcional, default: true
}
```

### UpdateCategoryDto
```typescript
{
  name?: string;        // Opcional, 3-100 caracteres
  description?: string; // Opcional
  slug?: string;        // Opcional, formato válido
  isActive?: boolean;   // Opcional
}
```

---

## 🔢 Códigos de Respuesta

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| **200** | ✅ OK | Operación exitosa |
| **201** | ✅ Created | Categoría creada exitosamente |
| **400** | ❌ Bad Request | Datos de entrada inválidos |
| **401** | ❌ Unauthorized | Token JWT faltante o inválido |
| **403** | ❌ Forbidden | Sin permisos (no es ADMIN/SUPERADMIN) |
| **404** | ❌ Not Found | Categoría no encontrada |
| **409** | ❌ Conflict | Nombre o slug ya existe |
| **500** | ❌ Internal Server Error | Error interno del servidor |

---

## 💡 Ejemplos de Uso

### Caso 1: Setup inicial de categorías
```bash
# 1. Obtener token de autenticación
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# 2. Crear categorías principales
curl -X POST "http://localhost:3000/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name": "Electrónicos", "slug": "electronicos"}'

curl -X POST "http://localhost:3000/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name": "Ropa", "slug": "ropa"}'

# 3. Verificar categorías creadas
curl -X GET "http://localhost:3000/categories/with-count"
```

### Caso 2: Búsqueda y gestión
```bash
# 1. Buscar categorías
curl -X GET "http://localhost:3000/categories/search/electr"

# 2. Actualizar categoría encontrada
curl -X PUT "http://localhost:3000/categories/ID_ENCONTRADO" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"description": "Nueva descripción"}'

# 3. Desactivar temporalmente
curl -X PUT "http://localhost:3000/categories/ID_ENCONTRADO/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"isActive": false}'
```

---

## ❌ Casos de Error

### Error de validación (400)
```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "statusCode": 400,
  "details": [
    "El nombre debe tener al menos 3 caracteres",
    "El slug solo puede contener letras minúsculas, números y guiones"
  ],
  "timestamp": "2024-01-15T11:30:00.000Z",
  "path": "/categories"
}
```

### Error de autenticación (401)
```json
{
  "success": false,
  "message": "Acceso no autorizado. Por favor, inicia sesión para continuar.",
  "statusCode": 401,
  "timestamp": "2024-01-15T11:30:00.000Z",
  "path": "/categories"
}
```

### Error de permisos (403)
```json
{
  "success": false,
  "message": "No tienes permisos suficientes para realizar esta acción.",
  "statusCode": 403,
  "timestamp": "2024-01-15T11:30:00.000Z",
  "path": "/categories"
}
```

### Error de recurso no encontrado (404)
```json
{
  "success": false,
  "message": "Categoría no encontrada",
  "statusCode": 404,
  "timestamp": "2024-01-15T11:30:00.000Z",
  "path": "/categories/uuid-inexistente"
}
```

### Error de conflicto (409)
```json
{
  "success": false,
  "message": "Ya existe una categoría con este nombre",
  "statusCode": 409,
  "timestamp": "2024-01-15T11:30:00.000Z",
  "path": "/categories"
}
```

---

## 🔗 Enlaces Útiles

- **Swagger UI**: http://localhost:3000/api
- **Repositorio**: https://github.com/tu-repo/ecommerce-api
- **Postman Collection**: [Descargar aquí](./postman/categories-collection.json)

---

## 📝 Notas Adicionales

1. **Slugs únicos**: El sistema garantiza que todos los slugs sean únicos, agregando números secuenciales si es necesario.

2. **Soft delete**: Actualmente se implementa eliminación física. Se recomienda implementar soft delete para mantener historial.

3. **Paginación**: Todos los endpoints de listado incluyen paginación con metadatos completos.

4. **Búsqueda**: La búsqueda es case-insensitive y busca en nombre, descripción y slug.

5. **Validaciones**: Todas las validaciones incluyen mensajes descriptivos en español.

6. **Logging**: Se recomienda implementar logging para auditoría de cambios.

---

**Versión**: 1.0.0  
**Última actualización**: 15 de enero de 2024  
**Contacto**: dev@example.com 