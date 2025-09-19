# 🔐 Módulo de Autenticación

> **🏠 [README Principal](../README.md)** | **📚 [Documentación General](./README.md)** | **👥 [Usuarios](./users.md)** | **🛒 [Productos](./products.md)**

El módulo de autenticación gestiona el registro, login, logout y gestión de tokens JWT para los usuarios del sistema.

## 📋 Tabla de Contenidos

### 🎯 Navegación Rápida
| Sección | Descripción |
|---------|-------------|
| **📡 Endpoints** | Login, register, refresh y logout |
| **⚙️ Configuración JWT** | Estructura y configuración de tokens |
| **🔄 Flujo de Autenticación** | Proceso completo de autenticación |
| **💡 Mejores Prácticas** | Recomendaciones de seguridad |
| **🛠️ Ejemplo de Implementación** | Código de ejemplo |

### 📖 Contenido Detallado
- [Endpoints](#endpoints)
  - [🔐 POST /auth/login](#-post-authlogin) - Inicio de sesión
  - [📝 POST /auth/register](#-post-authregister) - Registro de usuarios
  - [🔄 POST /auth/refresh](#-post-authrefresh) - Refrescar token
  - [🚪 POST /auth/logout](#-post-authlogout) - Cerrar sesión
- [Configuración JWT](#configuración-jwt)
  - [Token Structure](#token-structure)
  - [Configuración](#configuración)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Mejores Prácticas](#mejores-prácticas)
- [Ejemplo de Implementación](#ejemplo-de-implementación)

---

<a name="endpoints"></a>
## 📡 Endpoints

<a name="-post-authlogin"></a>
### 🔐 POST /auth/login

Inicia sesión de un usuario existente y devuelve un token JWT.

**Descripción**: Autentica un usuario con email y contraseña, generando un token JWT para futuras solicitudes.

**Request Body**:
```json
{
  "email": "admin@ecommerce.com",
  "password": "admin123"
}
```

**Response Exitoso (200)**:
```json
{
  "message": "Login exitoso",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-del-usuario",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@ecommerce.com",
      "phone": "+1234567890",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Credenciales inválidas
- `500 Internal Server Error`: Error en la autenticación

---

### 📝 POST /auth/register
Registra un nuevo usuario en el sistema.

**Descripción**: Crea una nueva cuenta de usuario con la información proporcionada y genera un token JWT. 🔒 **Por seguridad**, todos los usuarios registrados a través de este endpoint público tendrán automáticamente el rol `CLIENTE`, sin importar el valor enviado en el campo `role`.

**Request Body**:
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Campos Obligatorios**:
- `firstName`: Nombre del usuario (string, requerido)
- `lastName`: Apellido del usuario (string, requerido)
- `email`: Email válido (string, requerido, formato email)
- `password`: Contraseña (string, requerido, mínimo 6 caracteres)

**Campos Opcionales**:
- `phone`: Teléfono del usuario (string, opcional)
- `role`: 🔒 **Campo ignorado por seguridad** (enum: `superadmin`, `admin`, `cliente`) - Este campo es aceptado en el DTO pero siempre será sobrescrito con `CLIENTE` en el backend

**Response Exitoso (201)**:
```json
{
  "message": "Usuario registrado exitosamente",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-del-usuario",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@example.com",
      "phone": "+1234567890",
      "role": "cliente",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "success": true
}
```

**Errores**:
- `400 Bad Request`: Datos de registro inválidos
- `409 Conflict`: El email ya está registrado
- `500 Internal Server Error`: Error al registrar el usuario

---

### 🔄 POST /auth/refresh
Refresca un token JWT existente.

**Descripción**: Genera un nuevo token JWT para un usuario autenticado, extendiendo la sesión.

**Autenticación**: Requiere token JWT válido

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Response Exitoso (200)**:
```json
{
  "message": "Token refrescado exitosamente",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Usuario no encontrado
- `500 Internal Server Error`: Error al refrescar el token

---

### 🚪 POST /auth/logout
Cierra la sesión del usuario actual.

**Descripción**: Invalida la sesión actual del usuario autenticado.

**Autenticación**: Requiere token JWT válido

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Response Exitoso (200)**:
```json
{
  "message": "Sesión cerrada exitosamente",
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Usuario no encontrado
- `500 Internal Server Error`: Error al cerrar sesión

---

## Configuración JWT

### Token Structure

Los tokens JWT generados contienen la siguiente información:

```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@ejemplo.com",
  "role": "cliente",
  "iat": 1640995200,
  "exp": 1641016800
}
```

**Payload Fields**:
- `sub`: ID del usuario (UUID)
- `email`: Email del usuario
- `role`: Rol del usuario (`superadmin`, `admin`, `cliente`)
- `iat`: Timestamp de emisión
- `exp`: Timestamp de expiración

### Configuración

```bash
# Variables de entorno para JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=6h
```

**JWT_SECRET**: Clave secreta para firmar los tokens. Debe ser una cadena segura y única.

**JWT_EXPIRES_IN**: Tiempo de expiración del token. Formatos soportados:
- `6h` (6 horas) - valor por defecto
- `1d` (1 día)
- `7d` (7 días)
- `60m` (60 minutos)
- `3600s` (3600 segundos)

### Flujo de Autenticación

1. **Registro/Login**: El usuario se registra o inicia sesión
2. **Token Generation**: El sistema genera un token JWT con 6 horas de validez
3. **API Requests**: El cliente incluye el token en el header `Authorization`
4. **Token Validation**: El sistema valida el token en cada solicitud protegida
5. **Token Refresh**: Antes de la expiración, el cliente puede refrescar el token
6. **Logout**: El usuario cierra sesión y el token se invalida

### Mejores Prácticas

1. **Almacenamiento de Tokens**: 
   - Almacenar el token en un lugar seguro (localStorage, sessionStorage, o cookies HttpOnly)
   - Nunca exponer el token en URLs o logs

2. **Manejo de Expiración**:
   - Implementar lógica para refrescar el token antes de su expiración
   - Manejar errores 401 y redirigir al login cuando el token expire

3. **Seguridad**:
   - Usar HTTPS en producción
   - Validar siempre el token en el backend
   - Implementar rate limiting en endpoints de autenticación

4. **Refresh Strategy**:
   - Refrescar el token cuando quede menos del 25% del tiempo de vida
   - Implementar un sistema de renovación silenciosa para mejor UX

### Ejemplo de Implementación

```javascript
// Ejemplo de manejo de tokens en frontend
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshTimeout = null;
  }

  async login(credentials) {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    if (data.success) {
      this.setToken(data.data.access_token);
      this.scheduleTokenRefresh();
    }
    return data;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  scheduleTokenRefresh() {
    // Refrescar token 5 minutos antes de expirar
    const refreshTime = (6 * 60 * 60 * 1000) - (5 * 60 * 1000); // 6h - 5min
    
    this.refreshTimeout = setTimeout(async () => {
      await this.refreshToken();
    }, refreshTime);
  }

  async refreshToken() {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      this.setToken(data.data.access_token);
      this.scheduleTokenRefresh();
    } else {
      this.logout();
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    // Redirigir a login
  }
}
```

---

## 🔗 Enlaces Rápidos

| Operación | Endpoint | Descripción |
|-----------|----------|-------------|
| **🔐 Login** | `POST /auth/login` | Iniciar sesión con email y contraseña |
| **📝 Register** | `POST /auth/register` | Registrar nuevo usuario |
| **🔄 Refresh** | `POST /auth/refresh` | Refrescar token JWT |
| **🚪 Logout** | `POST /auth/logout` | Cerrar sesión |

---

### 📚 Documentación Relacionada

- **[🏠 README Principal](../README.md)** - Información general del proyecto
- **[📚 Documentación General](./README.md)** - Configuración y convenciones
- **[👥 Módulo de Usuarios](./users.md)** - Gestión de perfiles de usuario
- **[🛒 Módulo de Productos](./products.md)** - Catálogo e inventario

---

<div align="center">
  <strong>
    🔐 **Módulo de Autenticación**<br>
    Gestión segura de usuarios y sesiones
  </strong>
</div>

<div align="center">
  <sub>
    [⬆️ Volver al inicio](#-módulo-de-autenticación) | 
    [🏠 README Principal](../README.md) | 
    [📚 Documentación General](./README.md) | 
    [👥 Usuarios](./users.md) | 
    [🛒 Productos](./products.md)
  </sub>
</div>
