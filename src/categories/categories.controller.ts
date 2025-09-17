import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { Category } from '../database/repositories/categories.repository';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiResponse({ 
    status: 201, 
    description: 'Categoría creada exitosamente',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  async create(@Body() createCategoryDto: any): Promise<Category> {
    // TODO: Create a proper DTO for category creation
    const categoryData = {
      ...createCategoryDto,
      isActive: true,
    };
    return await this.categoriesService.create(categoryData);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de categorías',
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
  ): Promise<Category[]> {
    return await this.categoriesService.findAll(limit, offset, sortBy, sortOrder);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categoría encontrada',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada' 
  })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  async findById(@Param('id') id: string): Promise<Category | null> {
    return await this.categoriesService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener una categoría por slug' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categoría encontrada',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada' 
  })
  @ApiParam({ name: 'slug', description: 'Slug de la categoría' })
  async findBySlug(@Param('slug') slug: string): Promise<Category | null> {
    return await this.categoriesService.findBySlug(slug);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener categorías activas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de categorías activas',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findActive(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<Category[]> {
    return await this.categoriesService.findActive(limit, offset);
  }

  @Get('top')
  @ApiOperation({ summary: 'Obtener categorías principales' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de categorías principales',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findTop(@Query('limit') limit: number = 5): Promise<Category[]> {
    return await this.categoriesService.findTopCategories(limit);
  }

  @Get('with-count')
  @ApiOperation({ summary: 'Obtener categorías con conteo de productos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de categorías con conteo de productos',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findWithProductCount(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<(Category & { productCount: number })[]> {
    return await this.categoriesService.findWithProductCount(limit, offset);
  }

  @Get('search/:term')
  @ApiOperation({ summary: 'Buscar categorías por término' })
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
  ): Promise<Category[]> {
    return await this.categoriesService.search(term, limit, offset);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categoría actualizada',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada' 
  })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  async update(
    @Param('id') id: string,
    @Body() updateData: any
  ): Promise<Category | null> {
    // TODO: Create a proper DTO for category update
    return await this.categoriesService.update(id, updateData);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de una categoría' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado actualizado',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada' 
  })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusData: { isActive: boolean }
  ): Promise<Category | null> {
    return await this.categoriesService.updateStatus(id, statusData.isActive);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categoría eliminada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada' 
  })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  async delete(@Param('id') id: string): Promise<{ message: string; success: boolean }> {
    const success = await this.categoriesService.delete(id);
    return {
      message: success ? 'Categoría eliminada exitosamente' : 'Categoría no encontrada',
      success
    };
  }
}
