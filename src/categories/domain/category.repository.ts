import { Injectable } from '@nestjs/common';
import { CategoriesRepository as InfrastructureRepository, NewCategory, Category as InfrastructureCategory } from '../../database/repositories/categories.repository';
import { Category, CreateCategoryCommand, UpdateCategoryCommand } from './category.entity';

export interface ICategoryRepository {
  create(categoryData: CreateCategoryCommand): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(limit?: number, offset?: number, sortBy?: string, sortOrder?: string): Promise<Category[]>;
  update(id: string, categoryData: UpdateCategoryCommand): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, isActive: boolean): Promise<Category | null>;
  countProductsByCategory(categoryId: string): Promise<number>;
}

@Injectable()
export class CategoryRepositoryAdapter implements ICategoryRepository {
  constructor(private readonly infrastructureRepository: InfrastructureRepository) {}

  private mapToDomain(infraCategory: InfrastructureCategory): Category {
    return {
      ...infraCategory,
      description: infraCategory.description || undefined,
    };
  }

  async create(categoryData: CreateCategoryCommand): Promise<Category> {
    const newCategory: NewCategory = {
      name: categoryData.name,
      description: categoryData.description,
      slug: categoryData.slug,
      isActive: categoryData.isActive ?? true,
    };
    const result = await this.infrastructureRepository.create(newCategory);
    return this.mapToDomain(result);
  }

  async findById(id: string): Promise<Category | null> {
    const result = await this.infrastructureRepository.findById(id);
    return result ? this.mapToDomain(result) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    // El repositorio de infraestructura no tiene findByName, usamos existsByName
    const exists = await this.infrastructureRepository.existsByName(name);
    if (!exists) return null;
    
    // Como no tenemos findByName, podemos implementarlo con una búsqueda
    const categories = await this.infrastructureRepository.search(name, 1, 0);
    const found = categories.find(cat => cat.name === name);
    return found ? this.mapToDomain(found) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await this.infrastructureRepository.findBySlug(slug);
    return result ? this.mapToDomain(result) : null;
  }

  async findAll(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<Category[]> {
    const results = await this.infrastructureRepository.findAll(limit, offset, sortBy, sortOrder);
    return results.map(result => this.mapToDomain(result));
  }

  async update(id: string, categoryData: UpdateCategoryCommand): Promise<Category | null> {
    const result = await this.infrastructureRepository.update(id, categoryData);
    return result ? this.mapToDomain(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    return await this.infrastructureRepository.delete(id);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Category | null> {
    const result = await this.infrastructureRepository.updateStatus(id, isActive);
    return result ? this.mapToDomain(result) : null;
  }

  async countProductsByCategory(categoryId: string): Promise<number> {
    return await this.infrastructureRepository.countProductsByCategory(categoryId);
  }
} 