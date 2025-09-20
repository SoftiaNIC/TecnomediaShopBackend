import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IUserRepository } from './user.repository';
import { User, CreateUserCommand, UpdateUserCommand, UserRole, UserEmail, UserName } from './user.entity';
import { UserMapper } from './user.mapper';
import { PasswordService } from './password.service';

const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY_TOKEN';

@Injectable()
export class UserDomainService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async createUser(command: CreateUserCommand): Promise<User> {
    try {
      // Validaciones de dominio
      const userEmail = new UserEmail(command.email);
      const userName = new UserName(command.firstName, command.lastName);
      
      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(userEmail.getValue());
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Hash de la contraseña
      const hashedPassword = await this.passwordService.hashPassword(command.password);
      
      // Crear usuario con rol por defecto CLIENTE si no se especifica
      const user: User = {
        id: randomUUID(), // Generar UUID válido
        email: userEmail.getValue(),
        password: hashedPassword,
        firstName: userName.getFirstName(),
        lastName: userName.getLastName(),
        phone: command.phone,
        role: command.role || UserRole.CLIENTE,
        isActive: true,
        isEmailVerified: false,
        avatar: command.avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return await this.userRepository.create(user);
    } catch (error) {
      // Re-throw the error to be handled by the controller
      throw error;
    }
  }

  async updateUser(id: string, command: UpdateUserCommand): Promise<User | null> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validaciones de dominio para actualización
    const updateData: UpdateUserCommand = { ...command, updatedAt: new Date() };
    
    // Si se actualiza la contraseña, hacer hash
    if (command.password) {
      updateData.password = await this.passwordService.hashPassword(command.password);
    }

    if (command.email) {
      const userEmail = new UserEmail(command.email);
      updateData.email = userEmail.getValue();
      
      // Verificar si el nuevo email ya existe en otro usuario
      const userWithEmail = await this.userRepository.findByEmail(userEmail.getValue());
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Email already in use by another user');
      }
    }

    if (command.firstName || command.lastName) {
      const firstName = command.firstName || existingUser.firstName;
      const lastName = command.lastName || existingUser.lastName;
      const userName = new UserName(firstName, lastName);
      updateData.firstName = userName.getFirstName();
      updateData.lastName = userName.getLastName();
    }

    return await this.userRepository.update(id, updateData);
  }

  async validateSuperadminCreation(currentUser: User): Promise<void> {
    if (currentUser.role !== UserRole.SUPERADMIN) {
      throw new Error('Only SUPERADMIN users can create new users');
    }
  }

  async createUserBySuperadmin(command: CreateUserCommand, currentUser: User): Promise<User> {
    // Validar que el usuario actual sea SUPERADMIN
    await this.validateSuperadminCreation(currentUser);
    
    // Validaciones de dominio
    const userEmail = new UserEmail(command.email);
    const userName = new UserName(command.firstName, command.lastName);
    
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(userEmail.getValue());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash de la contraseña
    const hashedPassword = await this.passwordService.hashPassword(command.password);
    
    // Crear usuario con rol por defecto ADMIN si no se especifica (solo SUPERADMIN puede crear)
    const user: User = {
      id: randomUUID(), // Generar UUID válido
      email: userEmail.getValue(),
      password: hashedPassword,
      firstName: userName.getFirstName(),
      lastName: userName.getLastName(),
      phone: command.phone,
      role: command.role || UserRole.ADMIN,
      isActive: true,
      isEmailVerified: false,
      avatar: command.avatar,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return await this.userRepository.create(user);
  }

  async deactivateUser(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User is already deactivated');
    }

    return await this.userRepository.update(id, { isActive: false, updatedAt: new Date() });
  }

  async activateUser(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isActive) {
      throw new Error('User is already active');
    }

    return await this.userRepository.update(id, { isActive: true, updatedAt: new Date() });
  }

  async verifyEmail(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    return await this.userRepository.update(id, { 
      isEmailVerified: true, 
      updatedAt: new Date() 
    });
  }

  async changeUserRole(id: string, newRole: UserRole): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === newRole) {
      throw new Error('User already has this role');
    }

    return await this.userRepository.update(id, { 
      role: newRole, 
      updatedAt: new Date() 
    });
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user || !user.isActive) {
      return null;
    }

    // Comparar la contraseña usando bcrypt
    const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
