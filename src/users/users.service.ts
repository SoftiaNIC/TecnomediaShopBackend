import { Injectable } from '@nestjs/common';
import { UserDomainService } from './domain/user.service';
import { UserRepositoryAdapter } from './domain/user.repository';
import { User, CreateUserCommand, UpdateUserCommand, UserRole } from './domain/user.entity';
import { UserMapper } from './domain/user.mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly userDomainService: UserDomainService,
    private readonly userRepository: UserRepositoryAdapter,
  ) {}

  async create(userData: CreateUserCommand): Promise<User> {
    return await this.userDomainService.createUser(userData);
  }

  async createBySuperadmin(userData: CreateUserCommand, currentUser: User): Promise<User> {
    return await this.userDomainService.createUserBySuperadmin(userData, currentUser);
  }

  async validateSuperadminCreation(currentUser: User): Promise<void> {
    return await this.userDomainService.validateSuperadminCreation(currentUser);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findAll(limit = 10, offset = 0): Promise<User[]> {
    return await this.userRepository.findAll(limit, offset);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<User[]> {
    return await this.userRepository.search(searchTerm, limit, offset);
  }

  async update(id: string, userData: UpdateUserCommand): Promise<User | null> {
    return await this.userDomainService.updateUser(id, userData);
  }

  async delete(id: string): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  async findByRole(role: UserRole, limit = 10, offset = 0): Promise<User[]> {
    const roleString = UserMapper.mapUserRoleToString(role);
    return await this.userRepository.findByRole(roleString, limit, offset);
  }

  async findActiveUsers(limit = 10, offset = 0): Promise<User[]> {
    return await this.userRepository.findActiveUsers(limit, offset);
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  async countByRole(role: UserRole): Promise<number> {
    const roleString = UserMapper.mapUserRoleToString(role);
    return await this.userRepository.countByRole(roleString);
  }

  // Métodos de dominio expuestos a través del servicio de aplicación
  async deactivateUser(id: string): Promise<User | null> {
    return await this.userDomainService.deactivateUser(id);
  }

  async activateUser(id: string): Promise<User | null> {
    return await this.userDomainService.activateUser(id);
  }

  async verifyEmail(id: string): Promise<User | null> {
    return await this.userDomainService.verifyEmail(id);
  }

  async changeUserRole(id: string, newRole: UserRole): Promise<User | null> {
    return await this.userDomainService.changeUserRole(id, newRole);
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    return await this.userDomainService.validateUserCredentials(email, password);
  }
}
