import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { User, UserRole } from './domain/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo usuario (solo SUPERADMIN)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    type: 'User'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No autorizado - Solo SUPERADMIN puede crear usuarios' 
  })
  async create(@Body() createUserDto: CreateUserDto, @Request() req: Request): Promise<User> {
    const currentUser = (req as any).user;
    
    // Validar que el usuario actual sea SUPERADMIN
    await this.usersService.validateSuperadminCreation(currentUser);
    
    // Crear usuario con rol por defecto ADMIN
    const userData = {
      ...createUserDto,
      isActive: true,
      isEmailVerified: false,
      role: UserRole.ADMIN,
    };
    
    return await this.usersService.createBySuperadmin(userData, currentUser);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de autorización inválido' 
  })
  async getProfile() {
    // Aquí iría la lógica para obtener el perfil del usuario autenticado
    // Por ahora, esto requeriría implementar un decorador para obtener el usuario del token
    return {
      message: 'Perfil del usuario obtenido exitosamente',
      // user: authenticatedUser
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ): Promise<User[]> {
    return await this.usersService.findAll(limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async findById(@Param('id') id: string): Promise<User | null> {
    return await this.usersService.findById(id);
  }

  @Get('search/:term')
  @ApiOperation({ summary: 'Buscar usuarios por término' })
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
  ): Promise<User[]> {
    return await this.usersService.search(term, limit, offset);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateUserDto>
  ): Promise<User | null> {
    return await this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async delete(@Param('id') id: string): Promise<{ message: string; success: boolean }> {
    const success = await this.usersService.delete(id);
    return {
      message: success ? 'Usuario eliminado exitosamente' : 'Usuario no encontrado',
      success
    };
  }
}
