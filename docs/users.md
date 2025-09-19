# 👥 Módulo de Usuarios

> **🏠 [README Principal](../README.md)** | **📚 [Documentación General](./README.md)** | **🔐 [Autenticación](./auth.md)** | **🛒 [Productos](./products.md)**

El módulo de usuarios gestiona las operaciones CRUD de usuarios, perfiles, búsqueda y gestión de roles del sistema.

## 📋 Tabla de Contenidos

### 🎯 Navegación Rápida
| Sección | Descripción |
|---------|-------------|
| **📡 Endpoints Públicos** | Perfil de usuario autenticado |
| **📡 Endpoints Administrativos** | CRUD y gestión de usuarios (Admin/Superadmin) |
| **🔐 Control de Acceso** | Roles y permisos requeridos |
| **💡 Mejores Prácticas** | Recomendaciones de uso |
| **🛠️ Ejemplos de Implementación** | Código de ejemplo |

### 📖 Contenido Detallado
- [Endpoints Públicos](#endpoints-públicos)
  - [👤 GET /users/profile](#-get-usersprofile) - Obtener perfil del usuario
- [Endpoints Administrativos](#endpoints-administrativos)
  - [👥 GET /users](#-get-users) - Listar todos los usuarios
  - [🔍 GET /users/:id](#-get-usersid) - Obtener usuario por ID
  - [🔎 GET /users/search/:term](#-get-userssearchterm) - Buscar usuarios
  - [✏️ PUT /users/:id](#️-put-usersid) - Actualizar usuario
  - [🔐 PUT /users/:id/role](#-put-usersidrole) - Asignar rol a usuario
  - [🗑️ DELETE /users/:id](#-delete-usersid) - Eliminar usuario
- [Control de Acceso](#control-de-acceso)
- [Mejores Prácticas](#mejores-prácticas)
- [Ejemplos de Implementación](#ejemplos-de-implementación)

---

<a name="endpoints-públicos"></a>
## 📡 Endpoints Públicos

<a name="-get-usersprofile"></a>
### 👤 GET /users/profile
Obtiene el perfil del usuario autenticado.

**Descripción**: Devuelve la información completa del usuario actualmente autenticado.

**Autenticación**: Requiere token JWT válido

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Response Exitoso (200)**:
```json
{
  "message": "Perfil del usuario obtenido exitosamente",
  "data": {
    "id": "uuid-del-usuario",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+1234567890",
    "role": "cliente",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "success": true
}
```

**Errores**:
- `400 Bad Request`: Token inválido o mal formado
- `401 Unauthorized`: Token de autorización inválido
- `404 Not Found`: Usuario no encontrado

---

### 👥 GET /users
Obtiene todos los usuarios del sistema (solo ADMIN o SUPERADMIN).

**Descripción**: Devuelve una lista paginada de todos los usuarios registrados en el sistema.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Query Parameters**:
- `limit`: Número máximo de usuarios a devolver (default: 10, máximo: 100)
- `offset`: Número de usuarios a omitir para paginación (default: 0)

**Response Exitoso (200)**:
```json
{
  "message": "Lista de usuarios obtenida exitosamente",
  "data": [
    {
      "id": "uuid-del-usuario-1",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@example.com",
      "phone": "+1234567890",
      "role": "cliente",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-del-usuario-2",
      "firstName": "María",
      "lastName": "García",
      "email": "maria.garcia@example.com",
      "phone": "+0987654321",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para ver usuarios

---

### 🔍 GET /users/:id
Obtiene un usuario específico por ID.

**Descripción**: Devuelve la información de un usuario específico. Los usuarios solo pueden ver su propio perfil, a menos que sean ADMIN o SUPERADMIN.

**Autenticación**: Requiere token JWT válido

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Path Parameters**:
- `id`: ID del usuario a consultar (UUID)

**Response Exitoso (200)**:
```json
{
  "message": "Usuario encontrado exitosamente",
  "data": {
    "id": "uuid-del-usuario",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+1234567890",
    "role": "cliente",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No autorizado para ver este perfil
- `404 Not Found`: Usuario no encontrado

---

### 🔎 GET /users/search/:term
Busca usuarios por término (solo ADMIN o SUPERADMIN).

**Descripción**: Busca usuarios por nombre, apellido o email que coincidan con el término proporcionado.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Path Parameters**:
- `term`: Término de búsqueda (string)

**Query Parameters**:
- `limit`: Número máximo de resultados a devolver (default: 10, máximo: 100)
- `offset`: Número de resultados a omitir para paginación (default: 0)

**Response Exitoso (200)**:
```json
{
  "message": "Búsqueda de usuarios completada exitosamente",
  "data": [
    {
      "id": "uuid-del-usuario-1",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@example.com",
      "phone": "+1234567890",
      "role": "cliente",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para buscar usuarios

---

### ✏️ PUT /users/:id
Actualiza un usuario existente (solo ADMIN o SUPERADMIN).

**Descripción**: Actualiza la información de un usuario específico. Solo los usuarios con rol ADMIN o SUPERADMIN pueden realizar esta operación.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Path Parameters**:
- `id`: ID del usuario a actualizar (UUID)

**Request Body**:
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez López",
  "email": "juan.carlos@example.com",
  "password": "nuevaPassword123",
  "phone": "+1234567890",
  "role": "admin",
  "isActive": true
}
```

**Campos Opcionales**:
- `firstName`: Nombre del usuario (string, opcional)
- `lastName`: Apellido del usuario (string, opcional)
- `email`: Email del usuario (string, opcional, formato email)
- `password`: Contraseña del usuario (string, opcional, mínimo 6 caracteres)
- `phone`: Teléfono del usuario (string, opcional)
- `role`: Rol del usuario (enum: `superadmin`, `admin`, `cliente`, opcional)
- `isActive`: Estado de activación del usuario (boolean, opcional)

**Response Exitoso (200)**:
```json
{
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": "uuid-del-usuario",
    "firstName": "Juan Carlos",
    "lastName": "Pérez López",
    "email": "juan.carlos@example.com",
    "phone": "+1234567890",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T15:30:00.000Z"
  },
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para actualizar usuarios
- `404 Not Found`: Usuario no encontrado

---

### 🔐 PUT /users/:id/role
Asigna o cambia el rol de un usuario (solo ADMIN o SUPERADMIN).

**Descripción**: 🔒 Permite asignar o cambiar el rol de un usuario específico. Este endpoint incluye validaciones de seguridad adicionales para prevenir asignaciones no autorizadas. Solo los usuarios con rol ADMIN o SUPERADMIN pueden realizar esta operación.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Path Parameters**:
- `id`: ID del usuario a modificar (UUID)

**Request Body**:
```json
{
  "role": "admin",
  "reason": "Promoción a administrador del sistema"
}
```

**Campos Obligatorios**:
- `role`: Nuevo rol a asignar (enum: `superadmin`, `admin`, `cliente`)

**Campos Opcionales**:
- `reason`: Motivo del cambio de rol (string, opcional, para auditoría)

**Response Exitoso (200)**:
```json
{
  "message": "Rol asignado exitosamente",
  "data": {
    "userId": "uuid-del-usuario",
    "previousRole": "cliente",
    "newRole": "admin",
    "assignedBy": "admin@example.com",
    "reason": "Promoción a administrador del sistema"
  },
  "success": true
}
```

**Errores**:
- `400 Bad Request`: Datos inválidos o rol no permitido
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para asignar roles o intento de asignación no autorizada
- `404 Not Found`: Usuario no encontrado

**Restricciones de Seguridad**:
- Los usuarios con rol `ADMIN` no pueden asignar el rol `SUPERADMIN`
- Solo los usuarios con rol `SUPERADMIN` pueden modificar el rol de otro `SUPERADMIN`
- Todas las asignaciones de roles son auditadas

---

### 🗑️ DELETE /users/:id
Elimina un usuario existente (solo ADMIN o SUPERADMIN).

**Descripción**: Elimina permanentemente un usuario del sistema. Solo los usuarios con rol ADMIN o SUPERADMIN pueden realizar esta operación.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Path Parameters**:
- `id`: ID del usuario a eliminar (UUID)

**Response Exitoso (200)**:
```json
{
  "message": "Usuario eliminado exitosamente",
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para eliminar usuarios
- `404 Not Found`: Usuario no encontrado

---

## Roles y Permisos

### Jerarquía de Roles

1. **SUPERADMIN**
   - Acceso completo a todos los endpoints
   - Puede gestionar todos los usuarios
   - Puede asignar cualquier rol
   - Acceso a todas las funcionalidades del sistema

2. **ADMIN**
   - Puede ver y gestionar usuarios (excepto SUPERADMIN)
   - Puede buscar usuarios
   - Puede actualizar y eliminar usuarios (excepto SUPERADMIN)
   - Acceso limitado a funcionalidades administrativas

3. **CLIENTE**
   - Solo puede ver su propio perfil
   - No puede acceder a endpoints de gestión de usuarios
   - Acceso básico a funcionalidades de cliente

### Matriz de Permisos

| Endpoint | SUPERADMIN | ADMIN | CLIENTE |
|----------|------------|-------|---------|
| GET /users/profile | ✅ | ✅ | ✅ |
| GET /users | ✅ | ✅ | ❌ |
| GET /users/:id | ✅ | ✅ | ✅* |
| GET /users/search/:term | ✅ | ✅ | ❌ |
| PUT /users/:id | ✅ | ✅* | ❌ |
| DELETE /users/:id | ✅ | ✅* | ❌ |

*Los CLIENTE solo pueden ver su propio perfil (`/users/:id` donde `:id` es su propio ID)
*Los ADMIN no pueden gestionar usuarios con rol SUPERADMIN

## DTOs y Validaciones

### UpdateUserDto

```typescript
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

### User Entity

```typescript
export class User {
  id: string;                    // UUID
  firstName: string;             // Nombre del usuario
  lastName: string;              // Apellido del usuario
  email: string;                 // Email único
  password: string;              // Contraseña hasheada
  phone?: string;                // Teléfono opcional
  role: UserRole;                // Rol del usuario
  isActive: boolean;             // Estado de activación
  createdAt: Date;               // Fecha de creación
  updatedAt: Date;               // Fecha de actualización
}
```

## Mejores Prácticas

### Para Clientes

1. **Manejo de Perfiles**:
   - Almacenar la información del perfil localmente para reducir solicitudes
   - Implementar caché para datos de usuario que no cambian frecuentemente

2. **Actualizaciones**:
   - Validar datos antes de enviar al servidor
   - Implementar confirmación para acciones destructivas (eliminación)

3. **Seguridad**:
   - Nunca exponer contraseñas en logs o consola
   - Validar permisos en el frontend antes de mostrar opciones

### Para Administradores

1. **Gestión de Usuarios**:
   - Implementar confirmación antes de eliminar usuarios
   - Usar paginación para listas grandes de usuarios
   - Implementar filtros y búsqueda avanzada

2. **Asignación de Roles**:
   - Validar que un ADMIN no pueda asignar rol SUPERADMIN
   - Implementar auditoría de cambios de roles
   - Notificar a los usuarios cuando su rol cambie

3. **Monitoreo**:
   - Implementar logging de acciones administrativas
   - Monitorear intentos de acceso no autorizados
   - Implementar rate limiting para endpoints administrativos

### Ejemplo de Implementación

```javascript
// Ejemplo de gestión de usuarios en frontend
class UserManager {
  constructor() {
    this.currentUser = null;
    this.users = [];
  }

  async getProfile() {
    const response = await fetch('/users/profile', {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      this.currentUser = data.data;
      return this.currentUser;
    }
    throw new Error(data.message);
  }

  async getAllUsers(limit = 10, offset = 0) {
    const response = await fetch(`/users?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      this.users = data.data;
      return this.users;
    }
    throw new Error(data.message);
  }

  async updateUser(userId, userData) {
    const response = await fetch(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    if (data.success) {
      // Actualizar usuario en la lista local
      const index = this.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        this.users[index] = data.data;
      }
      return data.data;
    }
    throw new Error(data.message);
  }

  async deleteUser(userId) {
    if (!confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }
    
    const response = await fetch(`/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      // Eliminar usuario de la lista local
      this.users = this.users.filter(u => u.id !== userId);
      return data;
    }
    throw new Error(data.message);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  hasPermission(action, resource) {
    if (!this.currentUser) return false;
    
    const permissions = {
      'superadmin': ['read', 'write', 'delete', 'manage'],
      'admin': ['read', 'write', 'delete'],
      'cliente': ['read']
    };
    
    return permissions[this.currentUser.role]?.includes(action) || false;
  }
}
```

---

## 🔗 Enlaces Rápidos

| Operación | Endpoint | Permisos | Descripción |
|-----------|----------|----------|-------------|
| **👤 Ver Perfil** | `GET /users/profile` | Todos | Obtener perfil del usuario autenticado |
| **👥 Listar Usuarios** | `GET /users` | Admin/Superadmin | Listar todos los usuarios |
| **🔍 Buscar Usuarios** | `GET /users/search/:term` | Admin/Superadmin | Buscar usuarios por término |
| **✏️ Actualizar Usuario** | `PUT /users/:id` | Admin/Superadmin | Actualizar datos de usuario |
| **🔐 Asignar Rol** | `PUT /users/:id/role` | Admin/Superadmin | 🔒 Asignar/cambiar rol de usuario con validaciones de seguridad |
| **🗑️ Eliminar Usuario** | `DELETE /users/:id` | Admin/Superadmin | Eliminar usuario del sistema |

---

### 📚 Documentación Relacionada

- **[🏠 README Principal](../README.md)** - Información general del proyecto
- **[📚 Documentación General](./README.md)** - Configuración y convenciones
- **[🔐 Módulo de Autenticación](./auth.md)** - Login y gestión de sesiones
- **[🛒 Módulo de Productos](./products.md)** - Catálogo e inventario

---

<div align="center">
  <strong>
    👥 **Módulo de Usuarios**<br>
    Gestión de perfiles y control de acceso
  </strong>
</div>

<div align="center">
  <sub>
    [⬆️ Volver al inicio](#-módulo-de-usuarios) | 
    [🏠 README Principal](../README.md) | 
    [📚 Documentación General](./README.md) | 
    [🔐 Autenticación](./auth.md) | 
    [🛒 Productos](./products.md)
  </sub>
</div>
