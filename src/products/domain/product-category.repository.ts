import { Injectable } from '@nestjs/common';

export interface IProductCategoryRepository {
  // Métodos para asignación de categorías
  assignCategoriesToProduct(productId: string, categoryIds: string[], primaryCategoryId?: string, displayOrders?: Record<string, number>): Promise<void>;
  removeCategoriesFromProduct(productId: string, categoryIds: string[]): Promise<void>;
  updateCategoryOrder(productId: string, categoryId: string, displayOrder: number, isPrimary?: boolean): Promise<void>;
  
  // Métodos de consulta
  findProductCategories(productId: string): Promise<ProductCategory[]>;
  findPrimaryCategory(productId: string): Promise<ProductCategory | null>;
  findProductsByCategory(categoryId: string, limit?: number, offset?: number): Promise<string[]>;
  findCategoryProductsCount(categoryId: string): Promise<number>;
  
  // Métodos de verificación
  isCategoryAssignedToProduct(productId: string, categoryId: string): Promise<boolean>;
  hasPrimaryCategory(productId: string): Promise<boolean>;
  
  // Métodos de utilidad
  removeAllCategoriesFromProduct(productId: string): Promise<void>;
  setPrimaryCategory(productId: string, categoryId: string): Promise<void>;
  getMaxDisplayOrder(productId: string): Promise<number>;
}

export interface ProductCategory {
  id: string;
  productId: string;
  categoryId: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Información de la categoría (join)
  categoryName?: string;
  categorySlug?: string;
  categoryIsActive?: boolean;
}

@Injectable()
export class ProductCategoryRepositoryAdapter implements IProductCategoryRepository {
  // Nota: Esta implementación necesitará ser inyectada con el Drizzle service
  // Por ahora, es una estructura base que se completará más adelante
  
  constructor(
    // private readonly db: DrizzleService,
  ) {}

  async assignCategoriesToProduct(
    productId: string, 
    categoryIds: string[], 
    primaryCategoryId?: string, 
    displayOrders?: Record<string, number>
  ): Promise<void> {
    // Implementación pendiente - necesitará el servicio de base de datos
    throw new Error('Method not implemented');
  }

  async removeCategoriesFromProduct(productId: string, categoryIds: string[]): Promise<void> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async updateCategoryOrder(
    productId: string, 
    categoryId: string, 
    displayOrder: number, 
    isPrimary?: boolean
  ): Promise<void> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async findProductCategories(productId: string): Promise<ProductCategory[]> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async findPrimaryCategory(productId: string): Promise<ProductCategory | null> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async findProductsByCategory(categoryId: string, limit: number = 10, offset: number = 0): Promise<string[]> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async findCategoryProductsCount(categoryId: string): Promise<number> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async isCategoryAssignedToProduct(productId: string, categoryId: string): Promise<boolean> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async hasPrimaryCategory(productId: string): Promise<boolean> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async removeAllCategoriesFromProduct(productId: string): Promise<void> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async setPrimaryCategory(productId: string, categoryId: string): Promise<void> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }

  async getMaxDisplayOrder(productId: string): Promise<number> {
    // Implementación pendiente
    throw new Error('Method not implemented');
  }
}
