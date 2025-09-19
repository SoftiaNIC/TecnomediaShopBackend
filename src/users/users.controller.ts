import { Controller, UseGuards, Get, Param, Put, Delete, Query, Req, NotFoundException, ForbiddenException, BadRequestException, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { User, UserRole } from './domain/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Remueve el campo password de un objeto User para seguridad
   */
  private removePassword(user: User | null): Omit<User, 'password'> | null {
    if (!user) return null;
    
    // Crear una copia del objeto sin el campo password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Remueve el campo password de un array de usuarios para seguridad
   */
  private removePasswords(users: User[]): Omit<User, 'password'>[] {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
  
  // Nota: La creación de usuarios se realiza a través del endpoint /auth/register
  // para mantener separadas las responsabilidades de autenticación y gestión de usuarios

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
  async getProfile(@Req() req: any) {
    const currentUser = (req as any).user;
    console.log('DEBUG - Current user from JWT:', currentUser);
    console.log('DEBUG - User ID (sub):', currentUser?.sub);
    
    if (!currentUser || !currentUser.sub) {
      throw new BadRequestException('Token inválido o mal formado');
    }
    
    const user = await this.usersService.findById(currentUser.sub);
    console.log('DEBUG - User found:', user);
    
    if (!user) {
      throw new NotFoundException(`Usuario no encontrado con ID: ${currentUser.sub}`);
    }
    
    return {
      message: 'Perfil del usuario obtenido exitosamente',
      data: this.removePassword(user),
      success: true
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los usuarios (ADMIN o SUPERADMIN)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de autorización inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tiene permisos para ver usuarios' 
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ) {
    const users = await this.usersService.findAll(limit, offset);
    return {
      message: 'Lista de usuarios obtenida exitosamente',
      data: this.removePasswords(users),
      success: true
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de autorización inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No autorizado para ver este perfil' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async findById(@Param('id') id: string, @Req() req: any) {
    const currentUser = (req as any).user;
    
    // Los usuarios solo pueden ver su propio perfil, a menos que sean ADMIN o SUPERADMIN
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      if (currentUser.sub !== id) {
        throw new ForbiddenException('No autorizado para ver este perfil');
      }
    }
    
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    return {
      message: 'Usuario encontrado exitosamente',
      data: this.removePassword(user),
      success: true
    };
  }

  @Get('search/:term')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuarios por término (ADMIN o SUPERADMIN)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de autorización inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tiene permisos para buscar usuarios' 
  })
  @ApiParam({ name: 'term', description: 'Término de búsqueda' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async search(
    @Param('term') term: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ) {
    const users = await this.usersService.search(term, limit, offset);
    return {
      message: 'Búsqueda de usuarios completada exitosamente',
      data: this.removePasswords(users),
      success: true
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un usuario (ADMIN o SUPERADMIN)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de autorización inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tiene permisos para actualizar usuarios' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ 
    type: UpdateUserDto,
    description: 'Datos del usuario a actualizar' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto
  ) {
    const user = await this.usersService.update(id, updateData);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return {
      message: 'Usuario actualizado exitosamente',
      data: this.removePassword(user),
      success: true
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un usuario (ADMIN o SUPERADMIN)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de autorización inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tiene permisos para eliminar usuarios' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async delete(@Param('id') id: string): Promise<{ message: string; success: boolean }> {
    const success = await this.usersService.delete(id);
    if (!success) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return {
      message: 'Usuario eliminado exitosamente',
      success
    };
  }

  @Put(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Asignar rol a usuario (ADMIN o SUPERADMIN)',
    description: '🔒 Permite asignar o cambiar el rol de un usuario. Solo disponible para administradores.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rol asignado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o rol no permitido' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de autorización inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tiene permisos para asignar roles' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ 
    type: AssignRoleDto,
    description: 'Datos de asignación de rol' 
  })
  async assignRole(
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Req() req: any
  ) {
    // 🔒 Security: Validaciones adicionales para asignación de roles
    const currentUser = req.user;
    
    // Los ADMIN no pueden asignar rol SUPERADMIN
    if (currentUser.role === UserRole.ADMIN && assignRoleDto.role === UserRole.SUPERADMIN) {
      throw new ForbiddenException('Los administradores no pueden asignar el rol de superadministrador');
    }
    
    // Los SUPERADMIN pueden asignar cualquier rol
    // Validar que el usuario existe
    const existingUser = await this.usersService.findById(id);
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    // No permitir cambiar el rol de un SUPERADMIN a menos que seas SUPERADMIN
    if (existingUser.role === UserRole.SUPERADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('No puedes modificar el rol de un superadministrador');
    }
    
    // Asignar el nuevo rol
    const updatedUser = await this.usersService.updateRole(id, assignRoleDto.role);
    
    return {
      message: 'Rol asignado exitosamente',
      data: {
        userId: id,
        previousRole: existingUser.role,
        newRole: assignRoleDto.role,
        assignedBy: currentUser.email,
        reason: assignRoleDto.reason || 'No especificado'
      },
      success: true
    };
  }
}
