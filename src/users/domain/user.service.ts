import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from './user.repository';
import { User, CreateUserCommand, UpdateUserCommand, UserRole, UserEmail, UserName } from './user.entity';
import { UserMapper } from './user.mapper';

const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY_TOKEN';

@Injectable()
export class UserDomainService {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository) {}

  async createUser(command: CreateUserCommand): Promise<User> {
    // Validaciones de dominio
    const userEmail = new UserEmail(command.email);
    const userName = new UserName(command.firstName, command.lastName);
    
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(userEmail.getValue());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Crear el usuario con valores por defecto
    const userData = {
      email: userEmail.getValue(),
      password: command.password, // En un caso real, aquí se hashearía la contraseña
      firstName: userName.getFirstName(),
      lastName: userName.getLastName(),
      role: command.role || UserRole.CUSTOMER,
      isActive: true,
      isEmailVerified: false,
    };

    return await this.userRepository.create(userData);
  }

  async updateUser(id: string, command: UpdateUserCommand): Promise<User | null> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validaciones de dominio para actualización
    const updateData: UpdateUserCommand = { ...command, updatedAt: new Date() };

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

    // En un caso real, aquí se compararía el hash de la contraseña
    if (user.password !== password) {
      return null;
    }

    return user;
  }
}
