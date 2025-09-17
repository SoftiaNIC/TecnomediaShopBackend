import { Injectable, Inject } from '@nestjs/common';
import { UsersRepository, NewUser, User } from '../database/repositories';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(userData: NewUser): Promise<User> {
    return await this.usersRepository.create(userData);
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async findAll(limit = 10, offset = 0): Promise<User[]> {
    return await this.usersRepository.findAll(limit, offset);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<User[]> {
    return await this.usersRepository.search(searchTerm, limit, offset);
  }

  async update(id: string, userData: Partial<NewUser>): Promise<User | null> {
    return await this.usersRepository.update(id, userData);
  }

  async delete(id: string): Promise<boolean> {
    return await this.usersRepository.delete(id);
  }

  async findByRole(role: string, limit = 10, offset = 0): Promise<User[]> {
    return await this.usersRepository.findByRole(role, limit, offset);
  }

  async findActiveUsers(limit = 10, offset = 0): Promise<User[]> {
    return await this.usersRepository.findActiveUsers(limit, offset);
  }

  async count(): Promise<number> {
    return await this.usersRepository.count();
  }

  async countByRole(role: string): Promise<number> {
    return await this.usersRepository.countByRole(role);
  }
}
