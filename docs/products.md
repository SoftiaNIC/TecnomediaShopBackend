# 🛒 Módulo de Productos

> **🏠 [README Principal](../README.md)** | **📚 [Documentación General](./README.md)** | **🔐 [Autenticación](./auth.md)** | **👥 [Usuarios](./users.md)**

El módulo de productos gestiona el catálogo de productos, inventario, categorías y estados de productos del sistema.

## 📋 Tabla de Contenidos

### 🎯 Navegación Rápida
| Sección | Descripción |
|---------|-------------|
| **📡 Endpoints CRUD** | Crear, leer, actualizar y eliminar productos |
| **📦 Gestión de Inventario** | Control de stock y disponibilidad |
| **🔍 Búsqueda y Filtrado** | Búsqueda por slug, categoría y términos |
| **🏷️ SEO y Metadatos** | Optimización para motores de búsqueda |
| **💡 Mejores Prácticas** | Recomendaciones de uso |
| **🛠️ Ejemplos de Implementación** | Código de ejemplo |

### 📖 Contenido Detallado
- [Endpoints CRUD](#endpoints-crud)
  - [📦 POST /products](#-post-products) - Crear producto
  - [📋 GET /products](#-get-products) - Listar productos
  - [🔍 GET /products/:id](#-get-productsid) - Obtener producto por ID
  - [🔗 GET /products/slug/:slug](#-get-productsslugslug) - Obtener producto por slug
  - [✏️ PUT /products/:id](#️-put-productsid) - Actualizar producto
  - [🗑️ DELETE /products/:id](#-delete-productsid) - Eliminar producto
- [Gestión de Inventario](#gestión-de-inventario)
  - [📊 PUT /products/:id/stock](#-put-productsidstock) - Actualizar stock
  - [✅ GET /products/active](#-get-productsactive) - Productos activos
  - [📦 GET /products/in-stock](#-get-productsin-stock) - Productos en stock
- [Búsqueda y Filtrado](#búsqueda-y-filtrado)
  - [🏷️ GET /products/category/:categoryId](#-get-productscategorycategoryid) - Productos por categoría
  - [🔎 GET /products/search/:term](#-get-productssearchterm) - Buscar productos
- [SEO y Metadatos](#seo-y-metadatos)
- [Mejores Prácticas](#mejores-prácticas)
- [Ejemplos de Implementación](#ejemplos-de-implementación)

---

<a name="endpoints-crud"></a>
## 📡 Endpoints CRUD

<a name="-post-products"></a>
### 📦 POST /products
Crear un nuevo producto (solo ADMIN o SUPERADMIN).

**Descripción**: Crea un nuevo producto en el sistema con la información proporcionada.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Request Body**:
```json
{
  "name": "Laptop Gaming ASUS ROG",
  "description": "Laptop de alto rendimiento para gaming",
  "slug": "laptop-gaming-asus-rog",
  "sku": "LAPTOP-ROG-001",
  "price": 1299.99,
  "costPrice": 999.99,
  "comparePrice": 1499.99,
  "categoryId": "uuid-de-categoria",
  "quantity": 50,
  "trackQuantity": true,
  "allowOutOfStockPurchases": false,
  "isActive": true,
  "isDigital": false,
  "barcode": "1234567890123",
  "weight": 2.5,
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["gaming", "laptop", "asus"],
  "metaTitle": "Laptop Gaming ASUS ROG - Mejor rendimiento",
  "metaDescription": "Laptop gaming de alto rendimiento con última tecnología"
}
```

**Campos Obligatorios**:
- `name`: Nombre del producto (string, 3-100 caracteres)
- `description`: Descripción del producto (string)
- `slug`: Slug URL amigable (string, único)
- `sku`: SKU del producto (string, 3-50 caracteres, único)
- `price`: Precio del producto (number, positivo, máximo 999,999.99)
- `categoryId`: ID de la categoría (string, UUID)

**Campos Opcionales**:
- `costPrice`: Precio de costo (number, positivo)
- `comparePrice`: Precio de comparación (number, positivo)
- `quantity`: Cantidad en stock (number, default: 0)
- `trackQuantity`: Habilitar seguimiento de inventario (boolean, default: true)
- `allowOutOfStockPurchases`: Permitir compras sin stock (boolean, default: false)
- `isActive`: Estado de activación (boolean, default: true)
- `isDigital`: Es producto digital (boolean, default: false)
- `barcode`: Código de barras (string)
- `weight`: Peso del producto (number, kg)
- `images`: Array de URLs de imágenes (string[])
- `tags`: Array de etiquetas (string[])
- `metaTitle`: Título para SEO (string)
- `metaDescription`: Descripción para SEO (string)

**Response Exitoso (201)**:
```json
{
  "id": "uuid-del-producto",
  "name": "Laptop Gaming ASUS ROG",
  "description": "Laptop de alto rendimiento para gaming",
  "slug": "laptop-gaming-asus-rog",
  "sku": "LAPTOP-ROG-001",
  "price": 1299.99,
  "costPrice": 999.99,
  "comparePrice": 1499.99,
  "categoryId": "uuid-de-categoria",
  "quantity": 50,
  "trackQuantity": true,
  "allowOutOfStockPurchases": false,
  "isActive": true,
  "isDigital": false,
  "barcode": "1234567890123",
  "weight": 2.5,
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["gaming", "laptop", "asus"],
  "metaTitle": "Laptop Gaming ASUS ROG - Mejor rendimiento",
  "metaDescription": "Laptop gaming de alto rendimiento con última tecnología",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para crear productos

---

### 📋 GET /products
Obtener todos los productos.

**Descripción**: Devuelve una lista paginada de todos los productos del sistema.

**Query Parameters**:
- `limit`: Número máximo de productos a devolver (default: 10, máximo: 100)
- `offset`: Número de productos a omitir para paginación (default: 0)
- `sortBy`: Campo para ordenar (default: 'createdAt')
- `sortOrder`: Dirección de ordenamiento ('asc' o 'desc', default: 'desc')

**Response Exitoso (200)**:
```json
[
  {
    "id": "uuid-del-producto-1",
    "name": "Laptop Gaming ASUS ROG",
    "description": "Laptop de alto rendimiento para gaming",
    "slug": "laptop-gaming-asus-rog",
    "sku": "LAPTOP-ROG-001",
    "price": 1299.99,
    "costPrice": 999.99,
    "comparePrice": 1499.99,
    "categoryId": "uuid-de-categoria",
    "quantity": 50,
    "trackQuantity": true,
    "allowOutOfStockPurchases": false,
    "isActive": true,
    "isDigital": false,
    "barcode": "1234567890123",
    "weight": 2.5,
    "images": ["image1.jpg", "image2.jpg"],
    "tags": ["gaming", "laptop", "asus"],
    "metaTitle": "Laptop Gaming ASUS ROG - Mejor rendimiento",
    "metaDescription": "Laptop gaming de alto rendimiento con última tecnología",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-del-producto-2",
    "name": "Mouse Gaming Logitech",
    "description": "Mouse gaming de alta precisión",
    "slug": "mouse-gaming-logitech",
    "sku": "MOUSE-LOG-001",
    "price": 79.99,
    "categoryId": "uuid-de-categoria",
    "quantity": 100,
    "trackQuantity": true,
    "allowOutOfStockPurchases": false,
    "isActive": true,
    "isDigital": false,
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
]
```

---

### 🔍 GET /products/:id
Obtener un producto por ID.

**Descripción**: Devuelve la información completa de un producto específico.

**Path Parameters**:
- `id`: ID del producto a consultar (UUID)

**Response Exitoso (200)**:
```json
{
  "id": "uuid-del-producto",
  "name": "Laptop Gaming ASUS ROG",
  "description": "Laptop de alto rendimiento para gaming",
  "slug": "laptop-gaming-asus-rog",
  "sku": "LAPTOP-ROG-001",
  "price": 1299.99,
  "costPrice": 999.99,
  "comparePrice": 1499.99,
  "categoryId": "uuid-de-categoria",
  "quantity": 50,
  "trackQuantity": true,
  "allowOutOfStockPurchases": false,
  "isActive": true,
  "isDigital": false,
  "barcode": "1234567890123",
  "weight": 2.5,
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["gaming", "laptop", "asus"],
  "metaTitle": "Laptop Gaming ASUS ROG - Mejor rendimiento",
  "metaDescription": "Laptop gaming de alto rendimiento con última tecnología",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `404 Not Found`: Producto no encontrado

---

### 🔗 GET /products/slug/:slug
Obtener un producto por slug.

**Descripción**: Devuelve la información de un producto utilizando su slug URL amigable.

**Path Parameters**:
- `slug`: Slug del producto a consultar (string)

**Response Exitoso (200)**:
```json
{
  "id": "uuid-del-producto",
  "name": "Laptop Gaming ASUS ROG",
  "description": "Laptop de alto rendimiento para gaming",
  "slug": "laptop-gaming-asus-rog",
  "sku": "LAPTOP-ROG-001",
  "price": 1299.99,
  "categoryId": "uuid-de-categoria",
  "quantity": 50,
  "trackQuantity": true,
  "allowOutOfStockPurchases": false,
  "isActive": true,
  "isDigital": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `404 Not Found`: Producto no encontrado

---

### 📂 GET /products/category/:categoryId
Obtener productos por categoría.

**Descripción**: Devuelve una lista de productos que pertenecen a una categoría específica.

**Path Parameters**:
- `categoryId`: ID de la categoría (UUID)

**Query Parameters**:
- `limit`: Número máximo de productos a devolver (default: 10, máximo: 100)
- `offset`: Número de productos a omitir para paginación (default: 0)

**Response Exitoso (200)**:
```json
[
  {
    "id": "uuid-del-producto-1",
    "name": "Laptop Gaming ASUS ROG",
    "description": "Laptop de alto rendimiento para gaming",
    "slug": "laptop-gaming-asus-rog",
    "sku": "LAPTOP-ROG-001",
    "price": 1299.99,
    "categoryId": "uuid-de-categoria",
    "quantity": 50,
    "trackQuantity": true,
    "allowOutOfStockPurchases": false,
    "isActive": true,
    "isDigital": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 🔎 GET /products/search/:term
Buscar productos por término.

**Descripción**: Busca productos por nombre, descripción, SKU o tags que coincidan con el término proporcionado.

**Path Parameters**:
- `term`: Término de búsqueda (string)

**Query Parameters**:
- `limit`: Número máximo de resultados a devolver (default: 10, máximo: 100)
- `offset`: Número de resultados a omitir para paginación (default: 0)

**Response Exitoso (200)**:
```json
[
  {
    "id": "uuid-del-producto",
    "name": "Laptop Gaming ASUS ROG",
    "description": "Laptop de alto rendimiento para gaming",
    "slug": "laptop-gaming-asus-rog",
    "sku": "LAPTOP-ROG-001",
    "price": 1299.99,
    "categoryId": "uuid-de-categoria",
    "quantity": 50,
    "trackQuantity": true,
    "allowOutOfStockPurchases": false,
    "isActive": true,
    "isDigital": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### ✅ GET /products/active
Obtener productos activos.

**Descripción**: Devuelve una lista de productos que están activos y disponibles para la venta.

**Query Parameters**:
- `limit`: Número máximo de productos a devolver (default: 10, máximo: 100)
- `offset`: Número de productos a omitir para paginación (default: 0)

**Response Exitoso (200)**:
```json
[
  {
    "id": "uuid-del-producto",
    "name": "Laptop Gaming ASUS ROG",
    "description": "Laptop de alto rendimiento para gaming",
    "slug": "laptop-gaming-asus-rog",
    "sku": "LAPTOP-ROG-001",
    "price": 1299.99,
    "categoryId": "uuid-de-categoria",
    "quantity": 50,
    "trackQuantity": true,
    "allowOutOfStockPurchases": false,
    "isActive": true,
    "isDigital": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 📦 GET /products/in-stock
Obtener productos en stock.

**Descripción**: Devuelve una lista de productos que tienen cantidad disponible en inventario.

**Query Parameters**:
- `limit`: Número máximo de productos a devolver (default: 10, máximo: 100)
- `offset`: Número de productos a omitir para paginación (default: 0)

**Response Exitoso (200)**:
```json
[
  {
    "id": "uuid-del-producto",
    "name": "Laptop Gaming ASUS ROG",
    "description": "Laptop de alto rendimiento para gaming",
    "slug": "laptop-gaming-asus-rog",
    "sku": "LAPTOP-ROG-001",
    "price": 1299.99,
    "categoryId": "uuid-de-categoria",
    "quantity": 50,
    "trackQuantity": true,
    "allowOutOfStockPurchases": false,
    "isActive": true,
    "isDigital": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### ✏️ PUT /products/:id
Actualizar un producto (solo ADMIN o SUPERADMIN).

**Descripción**: Actualiza la información de un producto existente.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Path Parameters**:
- `id`: ID del producto a actualizar (UUID)

**Request Body**:
```json
{
  "name": "Laptop Gaming ASUS ROG Pro",
  "description": "Laptop de alto rendimiento para gaming - Edición Pro",
  "price": 1399.99,
  "quantity": 45,
  "isActive": true
}
```

**Response Exitoso (200)**:
```json
{
  "id": "uuid-del-producto",
  "name": "Laptop Gaming ASUS ROG Pro",
  "description": "Laptop de alto rendimiento para gaming - Edición Pro",
  "slug": "laptop-gaming-asus-rog",
  "sku": "LAPTOP-ROG-001",
  "price": 1399.99,
  "categoryId": "uuid-de-categoria",
  "quantity": 45,
  "trackQuantity": true,
  "allowOutOfStockPurchases": false,
  "isActive": true,
  "isDigital": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T15:30:00.000Z"
}
```

**Errores**:
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para actualizar productos
- `404 Not Found`: Producto no encontrado

---

### 📊 PUT /products/:id/stock
Actualizar stock de un producto (solo ADMIN o SUPERADMIN).

**Descripción**: Actualiza la cantidad de inventario de un producto específico.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Path Parameters**:
- `id`: ID del producto a actualizar stock (UUID)

**Request Body**:
```json
{
  "quantity": 75
}
```

**Response Exitoso (200)**:
```json
{
  "id": "uuid-del-producto",
  "name": "Laptop Gaming ASUS ROG",
  "description": "Laptop de alto rendimiento para gaming",
  "slug": "laptop-gaming-asus-rog",
  "sku": "LAPTOP-ROG-001",
  "price": 1299.99,
  "categoryId": "uuid-de-categoria",
  "quantity": 75,
  "trackQuantity": true,
  "allowOutOfStockPurchases": false,
  "isActive": true,
  "isDigital": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T15:30:00.000Z"
}
```

**Errores**:
- `400 Bad Request`: Cantidad inválida
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para actualizar stock
- `404 Not Found`: Producto no encontrado

---

### 🗑️ DELETE /products/:id
Eliminar un producto (solo ADMIN o SUPERADMIN).

**Descripción**: Elimina permanentemente un producto del sistema.

**Autenticación**: Requiere token JWT válido y rol ADMIN o SUPERADMIN

**Headers**:
```
Authorization: Bearer <token_jwt>
```

**Path Parameters**:
- `id`: ID del producto a eliminar (UUID)

**Response Exitoso (200)**:
```json
{
  "message": "Producto eliminado exitosamente",
  "success": true
}
```

**Errores**:
- `401 Unauthorized`: Token de autorización inválido
- `403 Forbidden`: No tiene permisos para eliminar productos
- `404 Not Found`: Producto no encontrado

---

## Estados de Productos

### ProductStatus Enum

```typescript
export enum ProductStatus {
  ACTIVE = 'active',           // Producto activo y disponible
  INACTIVE = 'inactive',       // Producto inactivo
  DRAFT = 'draft',            // Producto en borrador
  OUT_OF_STOCK = 'out_of_stock' // Producto sin stock
}
```

### Lógica de Estados

1. **ACTIVE**: Producto visible y disponible para compra
   - `isActive: true`
   - `quantity > 0` (si `trackQuantity: true`)
   - O `allowOutOfStockPurchases: true`

2. **INACTIVE**: Producto no visible en el catálogo
   - `isActive: false`

3. **DRAFT**: Producto en proceso de creación
   - `isActive: false`
   - Estado temporal durante la creación

4. **OUT_OF_STOCK**: Producto sin stock disponible
   - `isActive: true`
   - `quantity <= 0`
   - `trackQuantity: true`
   - `allowOutOfStockPurchases: false`

## Gestión de Inventario

### Tipos de Productos

1. **Productos Físicos**:
   - `isDigital: false`
   - `trackQuantity: true` (default)
   - `weight` requerido
   - Gestión de inventario completa

2. **Productos Digitales**:
   - `isDigital: true`
   - `trackQuantity: false` (recomendado)
   - `weight` no requerido
   - Sin límite de inventario

### Configuración de Inventario

```typescript
{
  "trackQuantity": true,              // Habilitar seguimiento de inventario
  "allowOutOfStockPurchases": false,  // Permitir compras sin stock
  "quantity": 50,                     // Cantidad actual en stock
  "lowStockThreshold": 10             // Umbral de stock bajo (configurable)
}
```

### Reglas de Inventario

1. **Seguimiento Habilitado** (`trackQuantity: true`):
   - No se permiten cantidades negativas
   - Se valida stock antes de permitir compras
   - Se puede configurar umbral de stock bajo

2. **Seguimiento Deshabilitado** (`trackQuantity: false`):
   - No se gestiona inventario
   - Siempre disponible para compra
   - `allowOutOfStockPurchases` no aplica

3. **Compras sin Stock** (`allowOutOfStockPurchases: true`):
   - Permite vender incluso con `quantity <= 0`
   - Útil para productos con reposición rápida
   - Puede resultar en stock negativo

## DTOs y Validaciones

### CreateProductCommand

```typescript
export interface CreateProductCommand {
  name: string;                    // Requerido, 3-100 caracteres
  description: string;             // Requerido
  slug: string;                    // Requerido, único
  sku: string;                     // Requerido, único, 3-50 caracteres
  price: number;                   // Requerido, positivo, máximo 999,999.99
  costPrice?: number;              // Opcional, positivo
  comparePrice?: number;           // Opcional, positivo
  categoryId: string;              // Requerido, UUID
  quantity?: number;               // Opcional, default: 0
  trackQuantity?: boolean;         // Opcional, default: true
  allowOutOfStockPurchases?: boolean; // Opcional, default: false
  isDigital?: boolean;             // Opcional, default: false
  barcode?: string;                // Opcional
  weight?: number;                 // Opcional, kg
  images?: string[];               // Opcional
  tags?: string[];                 // Opcional
  metaTitle?: string;              // Opcional
  metaDescription?: string;        // Opcional
}
```

### UpdateProductCommand

```typescript
export interface UpdateProductCommand {
  name?: string;                   // Opcional, 3-100 caracteres
  description?: string;            // Opcional
  slug?: string;                   // Opcional, único
  sku?: string;                    // Opcional, único, 3-50 caracteres
  price?: number;                  // Opcional, positivo, máximo 999,999.99
  costPrice?: number;              // Opcional, positivo
  comparePrice?: number;           // Opcional, positivo
  categoryId?: string;             // Opcional, UUID
  quantity?: number;               // Opcional
  trackQuantity?: boolean;         // Opcional
  allowOutOfStockPurchases?: boolean; // Opcional
  isActive?: boolean;              // Opcional
  isDigital?: boolean;             // Opcional
  barcode?: string;                // Opcional
  weight?: number;                 // Opcional, kg
  images?: string[];               // Opcional
  tags?: string[];                 // Opcional
  metaTitle?: string;              // Opcional
  metaDescription?: string;        // Opcional
  updatedAt?: Date;                // Opcional
}
```

## Value Objects

### ProductName
```typescript
export class ProductName {
  constructor(private readonly name: string) {
    if (!name?.trim()) throw new Error('Product name is required');
    if (name.trim().length < 3) throw new Error('Product name must be at least 3 characters long');
    if (name.trim().length > 100) throw new Error('Product name must be less than 100 characters');
    this.name = name.trim();
  }
  
  getValue(): string;
  toString(): string;
}
```

### ProductSlug
```typescript
export class ProductSlug {
  constructor(private readonly slug: string) {
    if (!slug?.trim()) throw new Error('Product slug is required');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Product slug must contain only lowercase letters, numbers, and hyphens');
    this.slug = slug;
  }
  
  getValue(): string;
  toString(): string;
}
```

### ProductSku
```typescript
export class ProductSku {
  constructor(private readonly sku: string) {
    if (!sku?.trim()) throw new Error('Product SKU is required');
    const normalizedSku = sku.toUpperCase().trim();
    if (normalizedSku.length < 3) throw new Error('Product SKU must be at least 3 characters long');
    if (normalizedSku.length > 50) throw new Error('Product SKU must be less than 50 characters');
    this.sku = normalizedSku;
  }
  
  getValue(): string;
  toString(): string;
}
```

### ProductPrice
```typescript
export class ProductPrice {
  constructor(private readonly price: number) {
    if (typeof price !== 'number' || isNaN(price)) throw new Error('Product price must be a valid number');
    if (price < 0) throw new Error('Product price cannot be negative');
    if (price > 999999.99) throw new Error('Product price cannot exceed 999,999.99');
    this.price = Math.round(price * 100) / 100; // Redondear a 2 decimales
  }
  
  getValue(): number;
  getFormattedPrice(currency: string = 'USD'): string;
  toString(): string;
}
```

### ProductQuantity
```typescript
export class ProductQuantity {
  constructor(
    private readonly quantity: number,
    private readonly trackQuantity: boolean = true
  ) {
    if (typeof quantity !== 'number' || isNaN(quantity)) throw new Error('Product quantity must be a valid number');
    if (quantity < 0) throw new Error('Product quantity cannot be negative');
    if (quantity > 999999) throw new Error('Product quantity cannot exceed 999,999');
    this.quantity = Math.floor(quantity);
    this.trackQuantity = trackQuantity;
  }
  
  getValue(): number;
  isTrackingEnabled(): boolean;
  isInStock(): boolean;
  isLowStock(threshold: number = 10): boolean;
  decreaseQuantity(amount: number = 1): ProductQuantity;
  increaseQuantity(amount: number = 1): ProductQuantity;
  toString(): string;
}
```

## Mejores Prácticas

### Para Gestión de Productos

1. **Creación de Productos**:
   - Validar todos los campos antes de enviar al servidor
   - Generar slugs automáticamente a partir del nombre
   - Validar unicidad de SKU y slug
   - Implementar carga de imágenes con validación

2. **Gestión de Inventario**:
   - Implementar notificaciones de stock bajo
   - Registrar movimientos de inventario
   - Implementar auditoría de cambios de stock
   - Configurar umbrales de stock por producto

3. **SEO y Metadatos**:
   - Generar automáticamente metaTitle y metaDescription
   - Optimizar slugs para motores de búsqueda
   - Implementar etiquetas para mejor categorización
   - Usar imágenes optimizadas con alt text

### Para Clientes

1. **Búsqueda y Navegación**:
   - Implementar búsqueda en tiempo real
   - Usar filtros por categoría, precio, stock
   - Implementar ordenamiento por relevancia, precio, popularidad
   - Cargar imágenes de forma lazy loading

2. **Visualización de Productos**:
   - Mostrar disponibilidad de stock claramente
   - Implementar galería de imágenes con zoom
   - Mostrar precios con comparación si aplica
   - Incluir reseñas y valoraciones

3. **Experiencia de Compra**:
   - Validar stock antes de agregar al carrito
   - Implementar reservas de stock temporal
   - Notificar cuando productos vuelvan a estar disponibles
   - Sugerir productos similares cuando no haya stock

### Ejemplo de Implementación

```javascript
// Ejemplo de gestión de productos en frontend
class ProductManager {
  constructor() {
    this.products = [];
    this.categories = [];
  }

  async createProduct(productData) {
    const response = await fetch('/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    const data = await response.json();
    if (response.ok) {
      this.products.push(data);
      return data;
    }
    throw new Error(data.message || 'Error creating product');
  }

  async getProducts(filters = {}) {
    const params = new URLSearchParams({
      limit: filters.limit || 10,
      offset: filters.offset || 0,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc'
    });

    const response = await fetch(`/products?${params}`);
    const data = await response.json();
    
    if (response.ok) {
      this.products = data;
      return data;
    }
    throw new Error('Error fetching products');
  }

  async searchProducts(term, filters = {}) {
    const params = new URLSearchParams({
      limit: filters.limit || 10,
      offset: filters.offset || 0
    });

    const response = await fetch(`/products/search/${term}?${params}`);
    const data = await response.json();
    
    if (response.ok) {
      return data;
    }
    throw new Error('Error searching products');
  }

  async updateProductStock(productId, quantity) {
    const response = await fetch(`/products/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    });
    
    const data = await response.json();
    if (response.ok) {
      // Actualizar producto en la lista local
      const index = this.products.findIndex(p => p.id === productId);
      if (index !== -1) {
        this.products[index] = data;
      }
      return data;
    }
    throw new Error(data.message || 'Error updating stock');
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  generateSku(name, category) {
    const prefix = category.substring(0, 3).toUpperCase();
    const suffix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${suffix}-${random}`;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  isProductAvailable(product) {
    if (!product.isActive) return false;
    if (!product.trackQuantity) return true;
    if (product.allowOutOfStockPurchases) return true;
    return product.quantity > 0;
  }

  getStockStatus(product) {
    if (!product.isActive) return 'Inactivo';
    if (!product.trackQuantity) return 'Disponible';
    if (product.quantity <= 0) return 'Sin stock';
    if (product.quantity <= 10) return 'Stock bajo';
    return 'En stock';
  }
}
```

---

## 🔗 Enlaces Rápidos

| Operación | Endpoint | Permisos | Descripción |
|-----------|----------|----------|-------------|
| **📦 Crear Producto** | `POST /products` | Admin/Superadmin | Crear nuevo producto en el catálogo |
| **📋 Listar Productos** | `GET /products` | Todos | Listar todos los productos disponibles |
| **🔍 Buscar por Slug** | `GET /products/slug/:slug` | Todos | Obtener producto por URL amigable |
| **🏷️ Filtrar por Categoría** | `GET /products/category/:categoryId` | Todos | Productos de una categoría específica |
| **🔎 Búsqueda General** | `GET /products/search/:term` | Todos | Buscar productos por término |
| **✏️ Actualizar Producto** | `PUT /products/:id` | Admin/Superadmin | Modificar datos de producto |
| **📊 Actualizar Stock** | `PUT /products/:id/stock` | Admin/Superadmin | Modificar cantidad en inventario |
| **🗑️ Eliminar Producto** | `DELETE /products/:id` | Admin/Superadmin | Eliminar producto del catálogo |

---

### 📚 Documentación Relacionada

- **[🏠 README Principal](../README.md)** - Información general del proyecto
- **[📚 Documentación General](./README.md)** - Configuración y convenciones
- **[🔐 Módulo de Autenticación](./auth.md)** - Login y gestión de sesiones
- **[👥 Módulo de Usuarios](./users.md)** - Gestión de perfiles y permisos

---

<div align="center">
  <strong>
    🛒 **Módulo de Productos**<br>
    Catálogo completo con gestión de inventario
  </strong>
</div>

<div align="center">
  <sub>
    [⬆️ Volver al inicio](#-módulo-de-productos) | 
    [🏠 README Principal](../README.md) | 
    [📚 Documentación General](./README.md) | 
    [🔐 Autenticación](./auth.md) | 
    [👥 Usuarios](./users.md)
  </sub>
</div>
