import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../database/repositories/users.repository';
import { User, CreateUserCommand, UpdateUserCommand, UserRole } from './user.entity';
import { UserMapper } from './user.mapper';

export interface IUserRepository {
  create(userData: CreateUserCommand): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(limit: number, offset: number): Promise<User[]>;
  search(searchTerm: string, limit: number, offset: number): Promise<User[]>;
  update(id: string, userData: UpdateUserCommand): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  findByRole(role: UserRole, limit: number, offset: number): Promise<User[]>;
  findActiveUsers(limit: number, offset: number): Promise<User[]>;
  count(): Promise<number>;
  countByRole(role: UserRole): Promise<number>;
}

@Injectable()
export class UserRepositoryAdapter implements IUserRepository {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(userData: CreateUserCommand): Promise<User> {
    const databaseUser = await this.usersRepository.create(userData);
    return UserMapper.toDomainEntity(databaseUser);
  }

  async findById(id: string): Promise<User | null> {
    const databaseUser = await this.usersRepository.findById(id);
    return databaseUser ? UserMapper.toDomainEntity(databaseUser) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const databaseUser = await this.usersRepository.findByEmail(email);
    return databaseUser ? UserMapper.toDomainEntity(databaseUser) : null;
  }

  async findAll(limit: number, offset: number): Promise<User[]> {
    const databaseUsers = await this.usersRepository.findAll(limit, offset);
    return UserMapper.toDomainEntities(databaseUsers);
  }

  async search(searchTerm: string, limit: number, offset: number): Promise<User[]> {
    const databaseUsers = await this.usersRepository.search(searchTerm, limit, offset);
    return UserMapper.toDomainEntities(databaseUsers);
  }

  async update(id: string, userData: UpdateUserCommand): Promise<User | null> {
    const databaseUser = await this.usersRepository.update(id, userData);
    return databaseUser ? UserMapper.toDomainEntity(databaseUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    return await this.usersRepository.delete(id);
  }

  async findByRole(role: UserRole, limit: number, offset: number): Promise<User[]> {
    const roleString = UserMapper.mapUserRoleToString(role);
    const databaseUsers = await this.usersRepository.findByRole(roleString, limit, offset);
    return UserMapper.toDomainEntities(databaseUsers);
  }

  async findActiveUsers(limit: number, offset: number): Promise<User[]> {
    const databaseUsers = await this.usersRepository.findActiveUsers(limit, offset);
    return UserMapper.toDomainEntities(databaseUsers);
  }

  async count(): Promise<number> {
    return await this.usersRepository.count();
  }

  async countByRole(role: UserRole): Promise<number> {
    const roleString = UserMapper.mapUserRoleToString(role);
    return await this.usersRepository.countByRole(roleString);
  }
}
