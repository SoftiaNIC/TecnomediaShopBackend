import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from './products.service';
import { Product } from '../database/repositories/products.repository';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ 
    status: 201, 
    description: 'Producto creado exitosamente',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  async create(@Body() createProductDto: any): Promise<Product> {
    // TODO: Create a proper DTO for product creation
    const productData = {
      ...createProductDto,
      isActive: true,
      trackQuantity: true,
      allowOutOfStockPurchases: false,
      isDigital: false,
      quantity: 0,
    };
    return await this.productsService.create(productData);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'desc'
  ): Promise<Product[]> {
    return await this.productsService.findAll(limit, offset, sortBy, sortOrder);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async findById(@Param('id') id: string): Promise<Product | null> {
    return await this.productsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener un producto por slug' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado' 
  })
  @ApiParam({ name: 'slug', description: 'Slug del producto' })
  async findBySlug(@Param('slug') slug: string): Promise<Product | null> {
    return await this.productsService.findBySlug(slug);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Obtener productos por categoría' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos de la categoría',
  })
  @ApiParam({ name: 'categoryId', description: 'ID de la categoría' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<Product[]> {
    return await this.productsService.findByCategory(categoryId, limit, offset);
  }

  @Get('search/:term')
  @ApiOperation({ summary: 'Buscar productos por término' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda',
  })
  @ApiParam({ name: 'term', description: 'Término de búsqueda' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async search(
    @Param('term') term: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<Product[]> {
    return await this.productsService.search(term, limit, offset);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener productos activos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos activos',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findActive(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<Product[]> {
    return await this.productsService.findActive(limit, offset);
  }

  @Get('in-stock')
  @ApiOperation({ summary: 'Obtener productos en stock' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos en stock',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findInStock(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<Product[]> {
    return await this.productsService.findInStock(limit, offset);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto actualizado',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async update(
    @Param('id') id: string,
    @Body() updateData: any
  ): Promise<Product | null> {
    // TODO: Create a proper DTO for product update
    return await this.productsService.update(id, updateData);
  }

  @Put(':id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar stock de un producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stock actualizado',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async updateStock(
    @Param('id') id: string,
    @Body() stockData: { quantity: number }
  ): Promise<Product | null> {
    return await this.productsService.updateStock(id, stockData.quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto eliminado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async delete(@Param('id') id: string): Promise<{ message: string; success: boolean }> {
    const success = await this.productsService.delete(id);
    return {
      message: success ? 'Producto eliminado exitosamente' : 'Producto no encontrado',
      success
    };
  }
}
