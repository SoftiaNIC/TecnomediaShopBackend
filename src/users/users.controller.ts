import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  async create(@Body() createUserDto: CreateUserDto) {
    // Aquí iría la lógica para crear el usuario
    return {
      message: 'Usuario creado exitosamente',
      user: {
        id: 'uuid-generado',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        role: 'customer',
        isActive: true,
        createdAt: new Date(),
      }
    };
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
    return {
      id: 'uuid-del-usuario',
      email: 'usuario@ejemplo.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'customer',
      isActive: true,
    };
  }
}
