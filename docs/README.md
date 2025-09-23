# 🚀 Documentación del E-commerce API

> **🏠 [Volver al README Principal](../README.md)** | **📂 [Categorías](./categories-api.md)** ✨ | **🔐 [Autenticación](./auth.md)** | **👥 [Usuarios](./users.md)** | **🛒 [Productos](./products.md)**

¡Bienvenido a la documentación completa de la API de E-commerce! Esta API RESTful moderna incluye **respuestas descriptivas**, **validaciones robustas** y **documentación interactiva Swagger**.

## 📋 Tabla de Contenidos

### 🎯 Navegación Rápida
| Sección | Descripción |
|---------|-------------|
| **⚙️ Configuración General** | Variables de entorno, estructura de respuestas y autenticación |
| **🔐 Módulo de Autenticación** | Login, registro, refresh tokens y gestión de sesiones |
| **👥 Módulo de Usuarios** | Gestión de perfiles, CRUD y control de acceso |
| **🛒 Módulo de Productos** | Catálogo, inventario y gestión de productos |
| **🚀 Inicio Rápido** | Flujo básico de uso de la API |
| **📝 Convenciones** | Estándares y mejores prácticas |

### 📖 Contenido Detallado
- [Configuración General](#configuración-general)
  - [Variables de Entorno](#variables-de-entorno)
  - [Estructura de Respuestas](#estructura-de-respuestas)
  - [Gestión de Errores](#gestión-de-errores)
  - [Autenticación](#autenticación)
  - [Roles de Usuario](#roles-de-usuario)
- [Módulos Disponibles](#módulos-disponibles)
  - [🔐 Módulo de Autenticación](#-módulo-de-autenticación)
  - [👥 Módulo de Usuarios](#-módulo-de-usuarios)
  - [🛒 Módulo de Productos](#-módulo-de-productos)
- [Inicio Rápido](#inicio-rápido)
- [Convenciones](#convenciones)

---

<a name="configuración-general"></a>
## ⚙️ Configuración General

<a name="variables-de-entorno"></a>
### Variables de Entorno

La aplicación utiliza las siguientes variables de entorno que deben configurarse en el archivo `.env`:

```bash
# Database Configuration
DATABASE_URL="postgres://postgres:admin@localhost:5432/ecommerce_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=6h

# Application Configuration
NODE_ENV=development
PORT=3000

# Database Pool Configuration
DATABASE_MAX_CONNECTIONS=10
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=2000

# Super Admin Configuration
ADMIN_NAME="Super Admin"
ADMIN_EMAIL="admin@ecommerce.com"
ADMIN_PASSWORD="admin123"
```

<a name="estructura-de-respuestas"></a>
### Estructura de Respuestas

Todos los endpoints de la API siguen una estructura de respuesta consistente:

```json
{
  "message": "Descripción del resultado",
  "data": {
    // Datos específicos del endpoint
  },
  "success": true
}
```

<a name="gestión-de-errores"></a>
### Gestión de Errores

La API utiliza códigos de estado HTTP estándar:

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos de solicitud inválidos
- `401 Unauthorized`: No autenticado o token inválido
- `403 Forbidden`: No tiene permisos para realizar la acción
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: email ya registrado)
- `500 Internal Server Error`: Error interno del servidor

<a name="autenticación"></a>
### Autenticación

La mayoría de los endpoints requieren autenticación mediante token JWT. El token debe incluirse en el header de la solicitud:

```
Authorization: Bearer <token_jwt>
```

El token JWT tiene una duración configurada por defecto de 6 horas y puede ser refrescado usando el endpoint correspondiente.

<a name="roles-de-usuario"></a>
### Roles de Usuario

El sistema define tres roles de usuario:

- **SUPERADMIN**: Acceso completo al sistema
- **ADMIN**: Acceso administrativo limitado
- **CLIENTE**: Acceso básico de cliente

---

<a name="módulos-disponibles"></a>
## 📦 Módulos Disponibles

### 📂 [Módulo de Categorías](./categories-api.md) ✨ **NUEVO Y MEJORADO**

Gestión completa de categorías con **respuestas descriptivas** y **experiencia de usuario mejorada**.

#### 🔧 **Características Destacadas**:
- ✅ **Respuestas descriptivas** con mensajes en español
- ✅ **Paginación inteligente** con metadatos completos
- ✅ **Validaciones robustas** con class-validator
- ✅ **Manejo de errores consistente** con información útil
- ✅ **Búsqueda avanzada** por nombre, descripción y slug
- ✅ **Generación automática** de slugs únicos
- ✅ **Control de acceso** por roles (ADMIN/SUPERADMIN)
- ✅ **Documentación Swagger** completa con ejemplos
- ✅ **Colección Postman** preconfigurada

**[📖 Ver documentación completa →](./categories-api.md)**

---

<a name="-módulo-de-autenticación"></a>
### 🔐 [Módulo de Autenticación](./auth.md)

Gestiona la autenticación de usuarios, registro, login, logout y gestión de tokens JWT.

#### 📋 Endpoints Disponibles:
- [`POST /auth/login`](./auth.md#-post-authlogin) - Inicio de sesión
- [`POST /auth/register`](./auth.md#-post-authregister) - Registro de usuarios
- [`POST /auth/refresh`](./auth.md#-post-authrefresh) - Refrescar token
- [`POST /auth/logout`](./auth.md#-post-authlogout) - Cerrar sesión

#### 🔧 Características Clave:
- Autenticación JWT robusta
- Refresh tokens para sesiones prolongadas
- Validación segura de credenciales
- Gestión completa de sesiones

**[Ver documentación completa →](./auth.md)**

---

<a name="-módulo-de-usuarios"></a>
### 👥 [Módulo de Usuarios](./users.md)

Gestiona las operaciones CRUD de usuarios, perfiles, búsqueda y gestión de roles.

#### 📋 Endpoints Disponibles:
- [`GET /users/profile`](./users.md#-get-usersprofile) - Obtener perfil del usuario
- [`GET /users`](./users.md#-get-users) - Listar todos los usuarios (Admin)
- [`GET /users/:id`](./users.md#-get-usersid) - Obtener usuario por ID
- [`GET /users/search/:term`](./users.md#-get-userssearchterm) - Buscar usuarios (Admin)
- [`PUT /users/:id`](./users.md#️-put-usersid) - Actualizar usuario (Admin)
- [`DELETE /users/:id`](./users.md#-delete-usersid) - Eliminar usuario (Admin)

#### 🔧 Características Clave:
- Gestión de perfiles de usuario
- Control de acceso basado en roles
- Búsqueda y filtrado avanzado
- Validaciones robustas de datos

**[Ver documentación completa →](./users.md)**

---

<a name="-módulo-de-productos"></a>
### 🛒 [Módulo de Productos](./products.md)

Gestiona el catálogo de productos, inventario, categorías y estados de productos.

#### 📋 Endpoints Disponibles:
- [`POST /products`](./products.md#-post-products) - Crear producto (Admin)
- [`GET /products`](./products.md#-get-products) - Listar productos
- [`GET /products/:id`](./products.md#-get-productsid) - Obtener producto por ID
- [`GET /products/slug/:slug`](./products.md#-get-productsslugslug) - Obtener producto por slug
- [`GET /products/category/:categoryId`](./products.md#-get-productscategorycategoryid) - Productos por categoría
- [`GET /products/search/:term`](./products.md#-get-productssearchterm) - Buscar productos
- [`GET /products/active`](./products.md#-get-productsactive) - Productos activos
- [`GET /products/in-stock`](./products.md#-get-productsin-stock) - Productos en stock
- [`PUT /products/:id`](./products.md#️-put-productsid) - Actualizar producto (Admin)
- [`PUT /products/:id/stock`](./products.md#-put-productsidstock) - Actualizar stock (Admin)
- [`DELETE /products/:id`](./products.md#-delete-productsid) - Eliminar producto (Admin)

#### 🔧 Características Clave:
- Gestión completa de inventario
- Control de stock y disponibilidad
- SEO optimizado con slugs
- Categorización de productos
- Búsqueda avanzada y filtrado

**[Ver documentación completa →](./products.md)**

---

<a name="inicio-rápido"></a>
## 🚀 Inicio Rápido

1. **Registro de Usuario**
   ```bash
   POST /auth/register
   ```

2. **Inicio de Sesión**
   ```bash
   POST /auth/login
   ```

3. **Acceder a Perfil**
   ```bash
   GET /users/profile
   Headers: Authorization: Bearer <token>
   ```

---

<a name="convenciones"></a>
## 📝 Convenciones

- **IDs**: Todos los identificadores utilizan formato UUID
- **Fechas**: Todas las fechas siguen formato ISO 8601
- **Nombres**: Los nombres de endpoints y parámetros utilizan snake_case
- **Seguridad**: Las contraseñas nunca se exponen en las respuestas de la API

### 🔄 Navegación Rápida

| Sección | Enlace Rápido |
|---------|---------------|
| **Configuración** | [⚙️ Configuración General](#configuración-general) |
| **Autenticación** | [🔐 Módulo de Autenticación](./auth.md) |
| **Usuarios** | [👥 Módulo de Usuarios](./users.md) |
| **Productos** | [🛒 Módulo de Productos](./products.md) |
| **Inicio Rápido** | [🚀 Inicio Rápido](#inicio-rápido) |

---

## 🔗 Enlaces Rápidos por Módulo

| Módulo | Endpoints Principales | Documentación |
|--------|----------------------|---------------|
| **🔐 Autenticación** | Login, Register, Refresh, Logout | [📖 Ver Documentación](./auth.md) |
| **👥 Usuarios** | Profile, CRUD, Search | [📖 Ver Documentación](./users.md) |
| **🛒 Productos** | CRUD, Stock, Categories, Search | [📖 Ver Documentación](./products.md) |

---

### 📚 Documentación Relacionada

- **[🏠 Volver al README Principal](../README.md)** - Información general del proyecto
- **[🔐 Documentación de Autenticación](./auth.md)** - Endpoints y configuración JWT
- **[👥 Documentación de Usuarios](./users.md)** - Gestión de perfiles y permisos
- **[🛒 Documentación de Productos](./products.md)** - Catálogo e inventario

---

<div align="center">
  <strong>
    📖 **Documentación de la API Ecommerce Template**<br>
    Construida con ❤️ usando NestJS y DDD
  </strong>
</div>

<div align="center">
  <sub>
    [⬆️ Volver al inicio](#-documentación-de-la-api) | 
    [🏠 README Principal](../README.md) | 
    [🔐 Autenticación](./auth.md) | 
    [👥 Usuarios](./users.md) | 
    [🛒 Productos](./products.md)
  </sub>
</div>
