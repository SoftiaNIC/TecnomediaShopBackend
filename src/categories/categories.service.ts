import { Injectable } from '@nestjs/common';
import { CategoriesRepository, NewCategory, Category } from '../database/repositories';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(categoryData: NewCategory): Promise<Category> {
    return await this.categoriesRepository.create(categoryData);
  }

  async findById(id: string): Promise<Category | null> {
    return await this.categoriesRepository.findById(id);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return await this.categoriesRepository.findBySlug(slug);
  }

  async findAll(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<Category[]> {
    return await this.categoriesRepository.findAll(limit, offset, sortBy, sortOrder);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<Category[]> {
    return await this.categoriesRepository.search(searchTerm, limit, offset);
  }

  async findActive(limit = 10, offset = 0): Promise<Category[]> {
    return await this.categoriesRepository.findActive(limit, offset);
  }

  async update(id: string, categoryData: Partial<NewCategory>): Promise<Category | null> {
    return await this.categoriesRepository.update(id, categoryData);
  }

  async delete(id: string): Promise<boolean> {
    return await this.categoriesRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.categoriesRepository.count();
  }

  async countActive(): Promise<number> {
    return await this.categoriesRepository.countActive();
  }

  async existsByName(name: string): Promise<boolean> {
    return await this.categoriesRepository.existsByName(name);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return await this.categoriesRepository.existsBySlug(slug);
  }

  async findWithProductCount(limit = 10, offset = 0): Promise<(Category & { productCount: number })[]> {
    return await this.categoriesRepository.findWithProductCount(limit, offset);
  }

  async findTopCategories(limit = 5): Promise<Category[]> {
    return await this.categoriesRepository.findTopCategories(limit);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Category | null> {
    return await this.categoriesRepository.updateStatus(id, isActive);
  }
}
