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

  /**
   * Remueve el campo password de un objeto User para seguridad
   */
  private removePassword(user: User | null): Omit<User, 'password'> | null {
    if (!user) return null;
    
    // Crear una copia del objeto sin el campo password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

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
      // Remover la contraseña del usuario antes de enviar la respuesta
      const safeResult = {
        access_token: result.access_token,
        user: this.removePassword(result.user)
      };
      
      return {
        message: 'Login exitoso',
        data: safeResult,
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
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: '🔒 Registro público de usuarios. Todos los usuarios registrados tendrán rol CLIENTE por seguridad. Para asignar roles administrativos, use el endpoint de usuarios con autenticación.'
  })
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
        phone: registerDto.phone
      });
      // Remover la contraseña del usuario antes de enviar la respuesta
      const safeResult = {
        access_token: result.access_token,
        user: this.removePassword(result.user)
      };
      
      return {
        message: 'Usuario registrado exitosamente',
        data: safeResult,
        success: true
      };
    } catch (error) {
      // Handle specific domain validation errors
      if (error.message === 'User with this email already exists') {
        throw new ConflictException({
          message: 'El email ya está registrado',
          field: 'email',
          success: false
        });
      }
      
      // Handle domain object validation errors
      if (error.message === 'Invalid email format') {
        throw new BadRequestException({
          message: 'El formato del email es inválido',
          field: 'email',
          success: false
        });
      }
      
      if (error.message === 'First name is required') {
        throw new BadRequestException({
          message: 'El nombre es requerido',
          field: 'firstName',
          success: false
        });
      }
      
      if (error.message === 'Last name is required') {
        throw new BadRequestException({
          message: 'El apellido es requerido',
          field: 'lastName',
          success: false
        });
      }
      
      // Handle validation errors with more details
      if (error.message.includes('validation') || error.response?.message) {
        throw new BadRequestException({
          message: error.message || 'Datos de registro inválidos',
          errors: error.response?.errors || [],
          success: false
        });
      }
      
      // Generic error with more context
      console.error('Registration error:', error);
      throw new BadRequestException({
        message: 'Error al registrar el usuario',
        error: error.message,
        success: false
      });
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
