import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    return await this.usersService.validateUserCredentials(email, password);
  }

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const access_token = await this.generateToken(payload);
    
    return {
      access_token,
      user
    };
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ access_token: string; user: User }> {
    // 🔒 Security: Always assign CLIENTE role for public registration
    // Administrative role assignment should be done through admin endpoints
    const userRole = UserRole.CLIENTE;
    
    // Crear el usuario usando el UsersService
    const createUserCommand = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: userRole
    };
    
    const user = await this.usersService.create(createUserCommand);
    
    // Generar token JWT para el nuevo usuario
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const access_token = await this.generateToken(payload);
    
    return {
      access_token,
      user
    };
  }

  async generateToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const access_token = await this.generateToken(payload);
    return { access_token };
  }

  async logout(userId: string): Promise<{ message: string }> {
    // En una implementación más completa, aquí se agregaría el token a una lista negra
    // Por ahora, simplemente confirmamos que el usuario existe y está activo
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    return { message: 'Sesión cerrada exitosamente' };
  }
}
