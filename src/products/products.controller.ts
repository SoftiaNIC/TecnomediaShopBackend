import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ProductsService } from './products.service';
import { Product } from './domain/product.entity';
import { UserRole } from '../users/domain/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';
import { GenerateSlugDto } from './dto/generate-slug.dto';
import { 
  ProductResponseDto,
  ProductsListResponseDto,
  ProductsWithStatsResponseDto,
  ProductsByCategoryResponseDto,
  StockUpdateResponseDto,
  PriceUpdateResponseDto,
  ProductSearchResponseDto,
  DeleteProductResponseDto,
  SlugGenerationResponseDto,
  ErrorResponseDto
} from './dto/response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Crear un nuevo producto (ADMIN o SUPERADMIN)',
    description: 'Crea un nuevo producto en el sistema con toda la información necesaria incluyendo nombre, descripción, precio, stock, categorías e imágenes. El sistema validará que el SKU y slug sean únicos.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Producto creado exitosamente. Retorna el producto completo con ID generado, timestamps y metadatos adicionales.',
    type: ProductResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos. Retorna detalles específicos de los errores de validación para cada campo.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado. Token JWT inválido o no proporcionado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido. El usuario no tiene los permisos necesarios (se requiere rol ADMIN o SUPERADMIN).',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto. Ya existe un producto con el mismo SKU o slug.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Entidad no procesable. La categoría especificada no existe.',
    type: ErrorResponseDto
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return await this.productsService.createWithResponse(createProductDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los productos',
    description: 'Retorna una lista paginada de todos los productos activos en el sistema. Permite ordenar por diferentes campos y controlar la paginación mediante parámetros de consulta.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos con metadatos de paginación, información de conteo total y enlaces de navegación. Incluye productos con información detallada de precios, stock y categorías.',
    type: ProductsListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos. Los parámetros de paginación u ordenación contienen valores no válidos.',
    type: ErrorResponseDto
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos a retornar por página. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number, 
    description: 'Número de productos a omitir para la paginación. Valor mínimo: 0. Por defecto: 0.',
    example: 0
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    type: String, 
    description: 'Campo por el cual ordenar los productos. Opciones disponibles: name, price, createdAt, updatedAt, quantity. Por defecto: createdAt.',
    example: 'createdAt',
    enum: ['name', 'price', 'createdAt', 'updatedAt', 'quantity']
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    type: String, 
    description: 'Dirección del ordenamiento. Opciones: asc (ascendente) o desc (descendente). Por defecto: desc.',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'desc'
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findAllWithResponse(limit, offset, sortBy, sortOrder);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener un producto por ID',
    description: 'Retorna la información detallada de un producto específico utilizando su identificador único (UUID). Incluye toda la información del producto incluyendo precios, stock, categorías asociadas e imágenes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado con información detallada. Retorna el producto completo con metadatos, información de categorías y estado de inventario.',
    type: ProductResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID inválido. El formato del ID no corresponde a un UUID válido.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado. No existe un producto con el ID especificado.',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único del producto (UUID v4). Ejemplo: 123e4567-e89b-12d3-a456-426614174000',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productsService.findByIdWithResponse(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ 
    summary: 'Obtener un producto por slug',
    description: 'Retorna la información detallada de un producto utilizando su slug (URL amigable). Este endpoint es ideal para integraciones frontend y SEO ya que los slugs son legibles por humanos y optimizados para motores de búsqueda.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado con información detallada. Retorna el producto completo con metadatos, información de categorías y estado de inventario.',
    type: ProductResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Slug inválido. El slug contiene caracteres no permitidos o tiene formato incorrecto.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado. No existe un producto con el slug especificado.',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'slug', 
    description: 'Slug del producto (URL amigable). Solo puede contener letras minúsculas, números y guiones. Ejemplo: iphone-15-pro-max',
    example: 'iphone-15-pro-max'
  })
  async findBySlug(@Param('slug') slug: string): Promise<ProductResponseDto> {
    return await this.productsService.findBySlugWithResponse(slug);
  }

  @Get('category/:categoryId')
  @ApiOperation({ 
    summary: 'Obtener productos por categoría',
    description: 'Retorna una lista paginada de productos que pertenecen a una categoría específica. Permite filtrar productos por categoría y controlar la paginación y ordenamiento.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos de la categoría con metadatos de paginación. Incluye información detallada de cada producto y estadísticas de la categoría.',
    type: ProductsByCategoryResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID de categoría inválido o parámetros de consulta incorrectos. El formato del ID no corresponde a un UUID válido o los parámetros de paginación son inválidos.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada. No existe una categoría con el ID especificado.',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'categoryId', 
    description: 'ID único de la categoría (UUID v4). Ejemplo: 123e4567-e89b-12d3-a456-426614174000',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos a retornar por página. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number, 
    description: 'Número de productos a omitir para la paginación. Valor mínimo: 0. Por defecto: 0.',
    example: 0
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    type: String, 
    description: 'Campo por el cual ordenar los productos. Opciones disponibles: name, price, createdAt, updatedAt, quantity. Por defecto: createdAt.',
    example: 'createdAt',
    enum: ['name', 'price', 'createdAt', 'updatedAt', 'quantity']
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    type: String, 
    description: 'Dirección del ordenamiento. Opciones: asc (ascendente) o desc (descendente). Por defecto: desc.',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<ProductsByCategoryResponseDto> {
    return await this.productsService.findByCategoryWithResponse(categoryId, limit, offset);
  }

  @Get('search/:term')
  @ApiOperation({ 
    summary: 'Buscar productos por término',
    description: 'Busca productos en todo el catálogo utilizando un término de búsqueda. La búsqueda se realiza en nombre, descripción, SKU y slug. Retorna resultados ordenados por relevancia con metadatos de búsqueda y sugerencias.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda con metadatos y sugerencias. Incluye productos coincidentes, estadísticas de búsqueda, sugerencias de términos alternativos y enlaces para paginación.',
    type: ProductSearchResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Término de búsqueda inválido o parámetros incorrectos. El término de búsqueda está vacío o contiene caracteres no permitidos.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No se encontraron resultados. No hay productos que coincidan con el término de búsqueda.',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'term', 
    description: 'Término de búsqueda. Puede contener letras, números y espacios. Mínimo 2 caracteres, máximo 100 caracteres.',
    example: 'iPhone 15'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de resultados a retornar. Valor mínimo: 1, valor máximo: 50. Por defecto: 10.',
    example: 10
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number, 
    description: 'Número de resultados a omitir para la paginación. Valor mínimo: 0. Por defecto: 0.',
    example: 0
  })
  async search(
    @Param('term') term: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<ProductSearchResponseDto> {
    return await this.productsService.searchWithResponse(term, limit, offset);
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Obtener productos activos',
    description: 'Retorna una lista paginada de productos que están actualmente activos y disponibles para la venta. Excluye productos con estado INACTIVE, DRAFT o OUT_OF_STOCK. Ideal para mostrar en catálogos públicos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos activos con metadatos de paginación. Incluye solo productos disponibles para la venta con stock positivo y estado activo.',
    type: ProductsListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos. Los parámetros de paginación u ordenación contienen valores no válidos.',
    type: ErrorResponseDto
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos a retornar por página. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number, 
    description: 'Número de productos a omitir para la paginación. Valor mínimo: 0. Por defecto: 0.',
    example: 0
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    type: String, 
    description: 'Campo por el cual ordenar los productos. Opciones disponibles: name, price, createdAt, updatedAt, quantity. Por defecto: createdAt.',
    example: 'createdAt',
    enum: ['name', 'price', 'createdAt', 'updatedAt', 'quantity']
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    type: String, 
    description: 'Dirección del ordenamiento. Opciones: asc (ascendente) o desc (descendente). Por defecto: desc.',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  async findActive(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findActiveWithResponse(limit, offset);
  }

  @Get('in-stock')
  @ApiOperation({ 
    summary: 'Obtener productos en stock',
    description: 'Retorna una lista paginada de productos que tienen stock disponible (cantidad mayor a 0). Incluye productos activos e inactivos que tienen inventario físico disponible. Útil para gestión de inventario y reportes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos en stock con metadatos de paginación. Incluye productos con información detallada de cantidades disponibles y estado de inventario.',
    type: ProductsListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos. Los parámetros de paginación u ordenación contienen valores no válidos.',
    type: ErrorResponseDto
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos a retornar por página. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number, 
    description: 'Número de productos a omitir para la paginación. Valor mínimo: 0. Por defecto: 0.',
    example: 0
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    type: String, 
    description: 'Campo por el cual ordenar los productos. Opciones disponibles: name, price, createdAt, updatedAt, quantity. Por defecto: createdAt.',
    example: 'createdAt',
    enum: ['name', 'price', 'createdAt', 'updatedAt', 'quantity']
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    type: String, 
    description: 'Dirección del ordenamiento. Opciones: asc (ascendente) o desc (descendente). Por defecto: desc.',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  async findInStock(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findInStockWithResponse(limit, offset);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Actualizar un producto (ADMIN o SUPERADMIN)',
    description: 'Actualiza la información de un producto existente. Permite modificar todos los campos del producto incluyendo nombre, descripción, precio, stock, categorías e imágenes. El sistema validará que el SKU y slug no entren en conflicto con otros productos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto actualizado exitosamente. Retorna el producto completo con la información actualizada, timestamps modificados y metadatos adicionales.',
    type: ProductResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos. Retorna detalles específicos de los errores de validación para cada campo.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado. Token JWT inválido o no proporcionado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido. El usuario no tiene los permisos necesarios (se requiere rol ADMIN o SUPERADMIN).',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado. No existe un producto con el ID especificado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto. Ya existe otro producto con el mismo SKU o slug.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Entidad no procesable. La categoría especificada no existe.',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único del producto a actualizar (UUID v4). Ejemplo: 123e4567-e89b-12d3-a456-426614174000',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateProductDto
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateWithResponse(id, updateData);
  }

  @Put(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Actualizar stock de un producto (ADMIN o SUPERADMIN)',
    description: 'Actualiza la cantidad de stock de un producto específico. Permite incrementar o decrementar el inventario y opcionalmente agregar notas sobre el movimiento de stock. El sistema validará que la cantidad no sea negativa.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Stock actualizado exitosamente. Retorna la información detallada del producto con la nueva cantidad de stock, timestamp de actualización y metadatos del movimiento.',
    type: StockUpdateResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos. La cantidad de stock es negativa o contiene caracteres no válidos.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado. Token JWT inválido o no proporcionado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido. El usuario no tiene los permisos necesarios (se requiere rol ADMIN o SUPERADMIN).',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado. No existe un producto con el ID especificado.',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único del producto a actualizar stock (UUID v4). Ejemplo: 123e4567-e89b-12d3-a456-426614174000',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  async updateStock(
    @Param('id') id: string,
    @Body() stockData: UpdateProductStockDto
  ): Promise<StockUpdateResponseDto> {
    return await this.productsService.updateStockWithResponse(id, stockData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Eliminar un producto (ADMIN o SUPERADMIN)',
    description: 'Elimina permanentemente un producto del sistema. Esta operación es irreversible y eliminará toda la información asociada al producto incluyendo categorías e imágenes. Se recomienda tener precaución al usar este endpoint.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto eliminado exitosamente. Retorna confirmación de la eliminación con detalles del producto eliminado y timestamp de la operación.',
    type: DeleteProductResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID inválido. El formato del ID no corresponde a un UUID válido.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado. Token JWT inválido o no proporcionado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido. El usuario no tiene los permisos necesarios (se requiere rol ADMIN o SUPERADMIN).',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado. No existe un producto con el ID especificado.',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único del producto a eliminar (UUID v4). Ejemplo: 123e4567-e89b-12d3-a456-426614174000',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  async delete(@Param('id') id: string): Promise<DeleteProductResponseDto> {
    return await this.productsService.deleteWithResponse(id);
  }

  // === ENDPOINTS ESPECIALIZADOS ===

  @Get('featured')
  @ApiOperation({ summary: 'Obtener productos destacados' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos destacados con metadatos',
    type: ProductsListResponseDto
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de productos destacados' })
  async findFeatured(
    @Query('limit') limit: number = 10
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findFeaturedWithResponse(limit);
  }

  @Get('discounted')
  @ApiOperation({ 
    summary: 'Obtener productos con descuento',
    description: 'Retorna una lista paginada de productos que tienen descuentos aplicados. Permite filtrar por porcentaje mínimo de descuento y controlar la paginación. Ideal para secciones de ofertas y promociones.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos con descuento con metadatos de paginación. Incluye productos con información detallada de precios originales, precios con descuento y porcentajes de descuento.',
    type: ProductsListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos. Los parámetros de paginación, ordenación o porcentaje de descuento contienen valores no válidos.',
    type: ErrorResponseDto
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos con descuento a retornar. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number, 
    description: 'Número de productos a omitir para la paginación. Valor mínimo: 0. Por defecto: 0.',
    example: 0
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    type: String, 
    description: 'Campo por el cual ordenar los productos. Opciones disponibles: name, price, createdAt, updatedAt, quantity. Por defecto: createdAt.',
    example: 'createdAt',
    enum: ['name', 'price', 'createdAt', 'updatedAt', 'quantity']
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    type: String, 
    description: 'Dirección del ordenamiento. Opciones: asc (ascendente) o desc (descendente). Por defecto: desc.',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @ApiQuery({ 
    name: 'minDiscount', 
    required: false, 
    type: Number, 
    description: 'Porcentaje mínimo de descuento para filtrar productos. Valor mínimo: 1, valor máximo: 99. Por defecto: 1.',
    example: 10
  })
  async findDiscounted(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'desc'
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findDiscountedWithResponse(limit);
  }

  @Get('new-arrivals')
  @ApiOperation({ 
    summary: 'Obtener productos nuevos (llegadas recientes)',
    description: 'Retorna una lista de productos agregados recientemente al catálogo. Permite especificar el número de días para considerar un producto como nuevo. Ideal para secciones de "Novedades" o "Llegadas recientes".'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos nuevos con metadatos. Incluye productos recién agregados con información detallada y fechas de creación.',
    type: ProductsListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos. Los parámetros de días o límite contienen valores no válidos.',
    type: ErrorResponseDto
  })
  @ApiQuery({ 
    name: 'days', 
    required: false, 
    type: Number, 
    description: 'Número de días para considerar un producto como nuevo. Valor mínimo: 1, valor máximo: 365. Por defecto: 30.',
    example: 30
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos nuevos a retornar. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  async findNewArrivals(
    @Query('days') days: number = 30,
    @Query('limit') limit: number = 10
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findNewArrivalsWithResponse(days, limit);
  }

  @Get('bestsellers')
  @ApiOperation({ 
    summary: 'Obtener productos más vendidos',
    description: 'Retorna una lista de productos ordenados por número de ventas. Ideal para secciones de "Más vendidos" o "Productos populares". Los productos se ordenan automáticamente por métricas de ventas.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos más vendidos con metadatos. Incluye productos con información detallada y métricas de ventas.',
    type: ProductsListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos. El parámetro de límite contiene un valor no válido.',
    type: ErrorResponseDto
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos más vendidos a retornar. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  async findBestsellers(
    @Query('limit') limit: number = 10
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findBestsellersWithResponse(limit);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener productos con stock bajo (ADMIN o SUPERADMIN)',
    description: 'Retorna una lista de productos que tienen stock por debajo del umbral especificado. Este endpoint es exclusivo para administradores y permite gestionar el inventario de manera proactiva.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos con stock bajo con metadatos. Incluye productos con información detallada de inventario y niveles de stock actuales.',
    type: ProductsListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos. Los parámetros de umbral o límite contienen valores no válidos.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado. Token JWT inválido o no proporcionado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido. El usuario no tiene los permisos necesarios (se requiere rol ADMIN o SUPERADMIN).',
    type: ErrorResponseDto
  })
  @ApiQuery({ 
    name: 'threshold', 
    required: false, 
    type: Number, 
    description: 'Umbral de stock bajo para filtrar productos. Valor mínimo: 0. Por defecto: 10.',
    example: 10
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos con stock bajo a retornar. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  async findLowStock(
    @Query('threshold') threshold: number = 10,
    @Query('limit') limit: number = 10
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findLowStockWithResponse(threshold, limit);
  }

  @Get('out-of-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener productos sin stock (ADMIN o SUPERADMIN)',
    description: 'Retorna una lista de productos que tienen stock agotado (cantidad = 0). Este endpoint es exclusivo para administradores y permite identificar rápidamente los productos que necesitan reabastecimiento.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos sin stock con metadatos. Incluye productos con información detallada y estado de inventario agotado.',
    type: ProductsListResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos. El parámetro de límite contiene un valor no válido.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado. Token JWT inválido o no proporcionado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido. El usuario no tiene los permisos necesarios (se requiere rol ADMIN o SUPERADMIN).',
    type: ErrorResponseDto
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de productos sin stock a retornar. Valor mínimo: 1, valor máximo: 100. Por defecto: 10.',
    example: 10
  })
  async findOutOfStock(
    @Query('limit') limit: number = 10
  ): Promise<ProductsListResponseDto> {
    return await this.productsService.findOutOfStockWithResponse(limit);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener estadísticas de productos (ADMIN o SUPERADMIN)',
    description: 'Retorna estadísticas detalladas sobre el catálogo de productos incluyendo conteos por estado, categorías, rangos de precios y métricas de inventario. Ideal para dashboards administrativos y análisis de negocio.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas completas del catálogo de productos. Incluye conteos, porcentajes, métricas de inventario y análisis por categorías.',
    type: ProductsWithStatsResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado. Token JWT inválido o no proporcionado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido. El usuario no tiene los permisos necesarios (se requiere rol ADMIN o SUPERADMIN).',
    type: ErrorResponseDto
  })
  async getProductStats(): Promise<ProductsWithStatsResponseDto> {
    return await this.productsService.getProductStatsWithResponse();
  }

  @Post('generate-slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Generar slug para producto (ADMIN o SUPERADMIN)',
    description: 'Genera un slug único y amigable para SEO a partir del nombre de un producto. El slug se genera automáticamente eliminando caracteres especiales, convirtiendo a minúsculas y reemplazando espacios con guiones.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Slug generado exitosamente. Retorna el slug generado que es único y optimizado para motores de búsqueda.',
    type: SlugGenerationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos. El nombre del producto está vacío o contiene caracteres no permitidos.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado. Token JWT inválido o no proporcionado.',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido. El usuario no tiene los permisos necesarios (se requiere rol ADMIN o SUPERADMIN).',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto. No se pudo generar un slug único después de múltiples intentos.',
    type: ErrorResponseDto
  })
  async generateSlug(@Body() generateSlugDto: GenerateSlugDto): Promise<SlugGenerationResponseDto> {
    return await this.productsService.generateSlugWithResponse(generateSlugDto.name);
  }
}
