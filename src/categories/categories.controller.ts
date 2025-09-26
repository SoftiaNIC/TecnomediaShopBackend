import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/domain/user.entity';
import { CategoriesService } from './categories.service';
import { Category } from '../database/repositories/categories.repository';
import { 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  UpdateCategoryStatusDto,
  CategoriesListResponseDto,
  CategoriesWithCountResponseDto,
  CategoryResponseDto,
  DeleteResponseDto,
  SlugGenerationResponseDto
} from './dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('categories')
@Controller('categories')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva categoría (ADMIN o SUPERADMIN)' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Categoría creada exitosamente',
    type: CategoryResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya existe una categoría con este nombre o slug',
    type: ErrorResponseDto
  })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return await this.categoriesService.createWithResponse(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías con información detallada' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de categorías con metadatos de paginación',
    type: CategoriesListResponseDto
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de resultados (default: 10)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de elementos a saltar (default: 0)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Campo para ordenar (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, description: 'Orden: asc o desc (default: desc)' })
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'desc'
  ): Promise<CategoriesListResponseDto> {
    return await this.categoriesService.findAllWithResponse(limit, offset, sortBy, sortOrder);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener categorías activas con información detallada' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de categorías activas con metadatos',
    type: CategoriesListResponseDto
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de resultados (default: 10)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de elementos a saltar (default: 0)' })
  async findActive(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<CategoriesListResponseDto> {
    return await this.categoriesService.findActiveWithResponse(limit, offset);
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
  @ApiOperation({ summary: 'Obtener categorías con conteo de productos y estadísticas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de categorías con conteo de productos y metadatos detallados',
    type: CategoriesWithCountResponseDto
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de resultados (default: 10)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de elementos a saltar (default: 0)' })
  async findWithProductCount(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<CategoriesWithCountResponseDto> {
    return await this.categoriesService.findWithProductCountResponse(limit, offset);
  }

  @Get('search/:term')
  @ApiOperation({ summary: 'Buscar categorías por término con resultados descriptivos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda con información detallada',
    type: CategoriesListResponseDto
  })
  @ApiParam({ name: 'term', description: 'Término de búsqueda (nombre, descripción o slug)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de resultados (default: 10)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de elementos a saltar (default: 0)' })
  async search(
    @Param('term') term: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<CategoriesListResponseDto> {
    return await this.categoriesService.searchWithResponse(term, limit, offset);
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
  @ApiParam({ name: 'slug', description: 'Slug único de la categoría' })
  async findBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return await this.categoriesService.findBySlugWithResponse(slug);
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
  @ApiParam({ name: 'id', description: 'ID único de la categoría' })
  async findById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoriesService.findByIdWithResponse(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una categoría (ADMIN o SUPERADMIN)' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Categoría actualizada',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya existe una categoría con este nombre o slug' 
  })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.updateWithResponse(id, updateData);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de una categoría (ADMIN o SUPERADMIN)' })
  @ApiBody({ type: UpdateCategoryStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado actualizado',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'La categoría ya tiene este estado' 
  })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusData: UpdateCategoryStatusDto
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.updateStatus(id, statusData.isActive);
    return {
      success: true,
      message: `El estado de la categoría "${category.name}" ha sido ${statusData.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: category,
      meta: {
        previousStatus: !statusData.isActive,
        newStatus: statusData.isActive,
        updatedAt: category.updatedAt,
      },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una categoría (ADMIN o SUPERADMIN)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categoría eliminada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Categoría no encontrada' 
  })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  async delete(@Param('id') id: string): Promise<DeleteResponseDto> {
    return await this.categoriesService.deleteWithResponse(id);
  }

  @Get('generate-slug/:name')
  @ApiOperation({ summary: 'Generar slug automático desde un nombre con información detallada' })
  @ApiResponse({ 
    status: 200, 
    description: 'Slug generado exitosamente con metadatos',
    type: SlugGenerationResponseDto
  })
  @ApiParam({ name: 'name', description: 'Nombre para generar el slug (se convertirá automáticamente)' })
  async generateSlug(@Param('name') name: string): Promise<SlugGenerationResponseDto> {
    return await this.categoriesService.generateSlugWithResponse(name);
  }
}
