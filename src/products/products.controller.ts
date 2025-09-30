import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete, Query, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ProductsService } from './products.service';
import { ProductImageMapper } from './mapper/product-image.mapper';
import { Product } from './domain/product.entity';
import { UserRole } from '../users/domain/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';
import { GenerateSlugDto } from './dto/generate-slug.dto';
import { AssignCategoryDto, RemoveCategoryDto, UpdateCategoryOrderDto } from './dto/assign-category.dto';
import { 
  ProductResponseDto,
  ProductsListResponseDto,
  ProductsWithStatsResponseDto,
  ProductsByCategoryResponseDto,
  StockUpdateResponseDto,
  PriceUpdateResponseDto,
  ProductSearchResponseDto,
  DeleteProductResponseDto,
  SlugGenerationResponseDto
} from './dto/response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { 
  CategoryAssignmentResponse,
  CategoryRemovalResponse,
  CategoryOrderUpdateResponse,
  ProductCategoriesResponse
} from './dto/category-response.dto';
import { 
  CreateProductImageDto,
  UpdateProductImageDto,
  ProductImageResponseDto,
  ProductImagesListResponseDto,
  SetPrimaryImageDto,
  UpdateImageOrderDto
} from './dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productImageMapper: ProductImageMapper
  ) {}

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

  // Endpoints para manejo de categorías de productos
  @Post(':id/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Asignar categorías a un producto (ADMIN o SUPERADMIN)',
    description: 'Asigna una o múltiples categorías a un producto existente. Permite especificar una categoría principal y definir el orden de visualización de las categorías.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto al que se le asignarán las categorías',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Categorías asignadas exitosamente. Retorna detalles de la asignación incluyendo IDs de categorías asignadas y la categoría principal establecida.',
    type: CategoryAssignmentResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos. Los IDs de categorías son inválidos o la categoría principal no está incluida en la lista.',
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
    description: 'Producto no encontrado. El ID del producto no existe en el sistema.',
    type: ErrorResponseDto
  })
  async assignCategories(
    @Param('id') id: string,
    @Body() assignCategoryDto: AssignCategoryDto
  ): Promise<CategoryAssignmentResponse> {
    return await this.productsService.assignCategoriesToProduct(id, assignCategoryDto);
  }

  @Get(':id/categories')
  @ApiOperation({ 
    summary: 'Obtener categorías de un producto',
    description: 'Retorna todas las categorías asignadas a un producto específico, incluyendo información sobre cuál es la categoría principal y el orden de visualización.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto del cual se obtendrán las categorías',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Categorías obtenidas exitosamente. Retorna lista de categorías con sus detalles de asignación.',
    type: ProductCategoriesResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado. El ID del producto no existe en el sistema.',
    type: ErrorResponseDto
  })
  async getProductCategories(@Param('id') id: string): Promise<ProductCategoriesResponse> {
    return await this.productsService.getProductCategories(id);
  }

  @Put(':id/categories/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Actualizar orden de categorías de un producto (ADMIN o SUPERADMIN)',
    description: 'Actualiza el orden de visualización y el estado de categoría principal para una categoría específica de un producto.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto cuya categoría se actualizará',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orden de categoría actualizado exitosamente. Retorna detalles de la actualización realizada.',
    type: CategoryOrderUpdateResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos. La categoría no está asignada al producto o los datos son incorrectos.',
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
    description: 'Producto o categoría no encontrados. El ID del producto o la categoría no existen.',
    type: ErrorResponseDto
  })
  async updateCategoryOrder(
    @Param('id') id: string,
    @Body() updateCategoryOrderDto: UpdateCategoryOrderDto
  ): Promise<CategoryOrderUpdateResponse> {
    return await this.productsService.updateCategoryOrder(id, updateCategoryOrderDto);
  }

  @Delete(':id/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Remover categorías de un producto (ADMIN o SUPERADMIN)',
    description: 'Remueve una o múltiples categorías de un producto. No permite remover la categoría principal si quedan otras categorías asignadas sin asignar una nueva principal primero.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto del cual se removerán las categorías',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Categorías removidas exitosamente. Retorna detalles de las categorías removidas.',
    type: CategoryRemovalResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos. Se intentó remover la categoría principal sin asignar una nueva o las categorías no están asignadas.',
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
    description: 'Producto no encontrado. El ID del producto no existe en el sistema.',
    type: ErrorResponseDto
  })
  async removeCategories(
    @Param('id') id: string,
    @Body() removeCategoryDto: RemoveCategoryDto
  ): Promise<CategoryRemovalResponse> {
    return await this.productsService.removeCategoriesFromProduct(id, removeCategoryDto);
  }

  // Endpoints para gestión de imágenes de productos
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Agregar una imagen a un producto (ADMIN o SUPERADMIN)',
    description: 'Agrega una nueva imagen a un producto existente. Si es la primera imagen del producto, se marcará automáticamente como principal.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    description: 'Datos de la imagen a agregar',
    type: CreateProductImageDto,
    examples: {
      'create_image': {
        summary: 'Crear imagen',
        description: 'Ejemplo para agregar una nueva imagen a un producto',
        value: {
          productId: '550e8400-e29b-41d4-a716-446655440000',
          imageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          altText: 'Laptop gaming ASUS ROG vista frontal',
          title: 'Laptop ASUS ROG',
          isPrimary: true,
          displayOrder: 0,
          width: 450,
          height: 450,
          mimeType: 'image/png',
          fileSize: 1024
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Imagen agregada exitosamente',
    type: ProductImageResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado',
    type: ErrorResponseDto
  })
  async addProductImage(
    @Param('id') id: string,
    @Body() imageData: CreateProductImageDto
  ): Promise<ProductImageResponseDto> {
    const image = await this.productsService.addProductImage(id, imageData);
    return {
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageDataUrl: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      fileSizeFormatted: image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(2)} MB` : undefined,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      dimensions: image.width && image.height ? `${image.width}x${image.height}` : undefined,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    };
  }

  @Post(':id/images/batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Agregar múltiples imágenes a un producto (ADMIN o SUPERADMIN)',
    description: 'Agrega múltiples imágenes a un producto existente en una sola solicitud.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    description: 'Array de imágenes para agregar al producto. También se acepta un objeto individual.',
    type: [CreateProductImageDto],
    examples: {
      'multiple_images': {
        summary: 'Múltiples imágenes',
        description: 'Ejemplo con múltiples imágenes',
        value: [
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            imageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            altText: 'Imagen 1',
            title: 'Imagen 1',
            isPrimary: true,
            displayOrder: 0,
            width: 450,
            height: 450,
            mimeType: 'image/png',
            fileSize: 1024
          },
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            imageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            altText: 'Imagen 2',
            title: 'Imagen 2',
            isPrimary: false,
            displayOrder: 1,
            width: 450,
            height: 450,
            mimeType: 'image/png',
            fileSize: 1024
          }
        ]
      },
      'single_image': {
        summary: 'Imagen individual',
        description: 'Ejemplo con una sola imagen (también aceptado)',
        value: {
          productId: '550e8400-e29b-41d4-a716-446655440000',
          imageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          altText: 'Imagen individual',
          title: 'Imagen individual',
          isPrimary: true,
          displayOrder: 0,
          width: 450,
          height: 450,
          mimeType: 'image/png',
          fileSize: 1024
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Imágenes agregadas exitosamente',
    type: ProductImagesListResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado',
    type: ErrorResponseDto
  })
  async addMultipleProductImages(
    @Param('id') id: string,
    @Body() imagesData: CreateProductImageDto[]
  ): Promise<ProductImagesListResponseDto> {
    // Convertir DTOs a Commands usando el mapper
    const createCommands = this.productImageMapper.toCreateCommands(imagesData);
    const images = await this.productsService.addMultipleProductImages(id, createCommands);
    const imageDtos = images.map(image => ({
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageDataUrl: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      fileSizeFormatted: image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(2)} MB` : undefined,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      dimensions: image.width && image.height ? `${image.width}x${image.height}` : undefined,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    }));
    
    return {
      success: true,
      message: 'Imágenes agregadas exitosamente',
      productId: id,
      data: imageDtos,
      total: imageDtos.length,
      primaryCount: imageDtos.filter(img => img.isPrimary).length
    };
  }

  @Get(':id/images')
  @ApiOperation({ 
    summary: 'Obtener imágenes de un producto',
    description: 'Retorna todas las imágenes asociadas a un producto específico.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de imágenes obtenida exitosamente',
    type: ProductImagesListResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado',
    type: ErrorResponseDto
  })
  async getProductImages(@Param('id') id: string): Promise<ProductImagesListResponseDto> {
    const images = await this.productsService.getProductImages(id);
    const imageDtos = images.map(image => ({
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageDataUrl: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      fileSizeFormatted: image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(2)} MB` : undefined,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      dimensions: image.width && image.height ? `${image.width}x${image.height}` : undefined,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    }));
    
    return {
      success: true,
      message: 'Imágenes obtenidas exitosamente',
      productId: id,
      data: imageDtos,
      total: imageDtos.length,
      primaryCount: imageDtos.filter(img => img.isPrimary).length
    };
  }

  @Get(':id/images/primary')
  @ApiOperation({ 
    summary: 'Obtener imagen principal de un producto',
    description: 'Retorna la imagen principal de un producto específico.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Imagen principal obtenida exitosamente',
    type: ProductImageResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado',
    type: ErrorResponseDto
  })
  async getPrimaryProductImage(@Param('id') id: string): Promise<ProductImageResponseDto> {
    const image = await this.productsService.getPrimaryProductImage(id);
    if (!image) {
      throw new NotFoundException(`Primary image not found for product ${id}`);
    }
    
    return {
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageDataUrl: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      fileSizeFormatted: image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(2)} MB` : undefined,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      dimensions: image.width && image.height ? `${image.width}x${image.height}` : undefined,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    };
  }

  @Get('images/:imageId')
  @ApiOperation({ 
    summary: 'Obtener una imagen específica',
    description: 'Retorna una imagen específica por su ID.'
  })
  @ApiParam({ 
    name: 'imageId', 
    description: 'ID de la imagen',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Imagen obtenida exitosamente',
    type: ProductImageResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Imagen no encontrada',
    type: ErrorResponseDto
  })
  async getProductImage(@Param('imageId') imageId: string): Promise<ProductImageResponseDto> {
    const image = await this.productsService.getProductImage(imageId);
    return {
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageDataUrl: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      fileSizeFormatted: image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(2)} MB` : undefined,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      dimensions: image.width && image.height ? `${image.width}x${image.height}` : undefined,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    };
  }

  @Put('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Actualizar una imagen (ADMIN o SUPERADMIN)',
    description: 'Actualiza la información de una imagen existente.'
  })
  @ApiParam({ 
    name: 'imageId', 
    description: 'ID de la imagen',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @ApiBody({
    description: 'Datos actualizados de la imagen',
    type: UpdateProductImageDto,
    examples: {
      'update_image': {
        summary: 'Actualizar imagen',
        description: 'Ejemplo de actualización de datos de imagen',
        value: {
          altText: 'Laptop gaming ASUS ROG vista frontal actualizada',
          title: 'Laptop ASUS ROG Actualizada',
          isPrimary: false,
          displayOrder: 1,
          width: 450,
          height: 450,
          mimeType: 'image/jpeg',
          fileSize: 2048
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Imagen actualizada exitosamente',
    type: ProductImageResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Imagen no encontrada',
    type: ErrorResponseDto
  })
  async updateProductImage(
    @Param('imageId') imageId: string,
    @Body() updateData: UpdateProductImageDto
  ): Promise<ProductImageResponseDto> {
    const image = await this.productsService.updateProductImage(imageId, updateData);
    return {
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageDataUrl: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      fileSizeFormatted: image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(2)} MB` : undefined,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      dimensions: image.width && image.height ? `${image.width}x${image.height}` : undefined,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    };
  }

  @Put(':id/images/primary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Establecer imagen principal (ADMIN o SUPERADMIN)',
    description: 'Establece una imagen específica como la imagen principal de un producto.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    description: 'ID de la imagen a establecer como principal',
    type: SetPrimaryImageDto,
    examples: {
      'set_primary': {
        summary: 'Establecer imagen principal',
        description: 'Ejemplo para establecer una imagen como principal',
        value: {
          imageId: '550e8400-e29b-41d4-a716-446655440001'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Imagen principal establecida exitosamente',
    type: ProductImageResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto o imagen no encontrados',
    type: ErrorResponseDto
  })
  async setPrimaryProductImage(
    @Param('id') id: string,
    @Body() setPrimaryDto: SetPrimaryImageDto
  ): Promise<ProductImageResponseDto> {
    const image = await this.productsService.setPrimaryProductImage(id, setPrimaryDto.imageId);
    return {
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageDataUrl: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      fileSizeFormatted: image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(2)} MB` : undefined,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      dimensions: image.width && image.height ? `${image.width}x${image.height}` : undefined,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    };
  }

  @Put(':id/images/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Actualizar orden de imágenes (ADMIN o SUPERADMIN)',
    description: 'Actualiza el orden de visualización de múltiples imágenes de un producto.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    description: 'Lista de imágenes con sus nuevos órdenes de visualización',
    type: UpdateImageOrderDto,
    examples: {
      'update_order': {
        summary: 'Actualizar orden de imágenes',
        description: 'Ejemplo para reordenar múltiples imágenes',
        value: {
          imageOrders: [
            {
              imageId: '550e8400-e29b-41d4-a716-446655440001',
              displayOrder: 0
            },
            {
              imageId: '550e8400-e29b-41d4-a716-446655440002',
              displayOrder: 1
            },
            {
              imageId: '550e8400-e29b-41d4-a716-446655440003',
              displayOrder: 2
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orden de imágenes actualizado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto o imágenes no encontrados',
    type: ErrorResponseDto
  })
  async updateProductImagesOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateImageOrderDto
  ): Promise<{ success: boolean; message: string }> {
    await this.productsService.updateProductImagesOrder(id, updateOrderDto.imageOrders);
    return {
      success: true,
      message: 'Orden de imágenes actualizado exitosamente'
    };
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Eliminar una imagen (ADMIN o SUPERADMIN)',
    description: 'Elimina una imagen específica de un producto.'
  })
  @ApiParam({ 
    name: 'imageId', 
    description: 'ID de la imagen',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Imagen eliminada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Imagen no encontrada',
    type: ErrorResponseDto
  })
  async deleteProductImage(@Param('imageId') imageId: string): Promise<{ success: boolean; message: string }> {
    await this.productsService.deleteProductImage(imageId);
    return {
      success: true,
      message: 'Imagen eliminada exitosamente'
    };
  }

  @Delete(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Eliminar todas las imágenes de un producto (ADMIN o SUPERADMIN)',
    description: 'Elimina todas las imágenes asociadas a un producto específico.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Todas las imágenes eliminadas exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado',
    type: ErrorResponseDto
  })
  async deleteAllProductImages(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.productsService.deleteAllProductImages(id);
    return {
      success: true,
      message: 'Todas las imágenes eliminadas exitosamente'
    };
  }
}
