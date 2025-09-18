import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, BadRequestException, ConflictException, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/domain/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensaje de éxito'
        },
        data: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              description: 'Token JWT para autenticación'
            },
            user: {
              type: 'object',
              description: 'Información del usuario'
            }
          }
        },
        success: {
          type: 'boolean',
          description: 'Estado de la operación'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas' 
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'Credenciales de inicio de sesión' 
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto.email, loginDto.password);
      return {
        message: 'Login exitoso',
        data: result,
        success: true
      };
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        throw new UnauthorizedException('Credenciales inválidas');
      }
      throw new UnauthorizedException('Error en la autenticación');
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensaje de éxito'
        },
        data: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              description: 'Token JWT para autenticación'
            },
            user: {
              type: 'object',
              description: 'Información del usuario creado'
            }
          }
        },
        success: {
          type: 'boolean',
          description: 'Estado de la operación'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de registro inválidos' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El email ya está registrado' 
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'Datos de registro del usuario' 
  })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register({
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        password: registerDto.password,
        phone: registerDto.phone,
        role: registerDto.role
      });
      return {
        message: 'Usuario registrado exitosamente',
        data: result,
        success: true
      };
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        throw new ConflictException('El email ya está registrado');
      }
      if (error.message.includes('validation')) {
        throw new BadRequestException('Datos de registro inválidos');
      }
      throw new BadRequestException('Error al registrar el usuario');
    }
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token JWT' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refrescado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensaje de éxito'
        },
        data: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              description: 'Nuevo token JWT'
            }
          }
        },
        success: {
          type: 'boolean',
          description: 'Estado de la operación'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido o expirado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async refreshToken(@Req() req: any) {
    try {
      const currentUser = (req as any).user;
      const result = await this.authService.refreshToken(currentUser.sub);
      return {
        message: 'Token refrescado exitosamente',
        data: result,
        success: true
      };
    } catch (error) {
      if (error.message === 'User not found or inactive') {
        throw new NotFoundException('Usuario no encontrado o inactivo');
      }
      throw new UnauthorizedException('Error al refrescar el token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesión cerrada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensaje de éxito'
        },
        success: {
          type: 'boolean',
          description: 'Estado de la operación'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido o expirado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async logout(@Req() req: any) {
    try {
      const currentUser = (req as any).user;
      const result = await this.authService.logout(currentUser.sub);
      return {
        message: result.message,
        success: true
      };
    } catch (error) {
      if (error.message === 'User not found or inactive') {
        throw new NotFoundException('Usuario no encontrado o inactivo');
      }
      throw new UnauthorizedException('Error al cerrar sesión');
    }
  }
}
