import { Injectable } from '@nestjs/common';
import { ProductsRepository, NewProduct, Product } from '../database/repositories';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(productData: NewProduct): Promise<Product> {
    return await this.productsRepository.create(productData);
  }

  async findById(id: string): Promise<Product | null> {
    return await this.productsRepository.findById(id);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return await this.productsRepository.findBySlug(slug);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return await this.productsRepository.findBySku(sku);
  }

  async findAll(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<Product[]> {
    return await this.productsRepository.findAll(limit, offset, sortBy, sortOrder);
  }

  async findByCategory(categoryId: string, limit = 10, offset = 0): Promise<Product[]> {
    return await this.productsRepository.findByCategory(categoryId, limit, offset);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<Product[]> {
    return await this.productsRepository.search(searchTerm, limit, offset);
  }

  async findActive(limit = 10, offset = 0): Promise<Product[]> {
    return await this.productsRepository.findActive(limit, offset);
  }

  async findInStock(limit = 10, offset = 0): Promise<Product[]> {
    return await this.productsRepository.findInStock(limit, offset);
  }

  async findDigital(limit = 10, offset = 0): Promise<Product[]> {
    return await this.productsRepository.findDigital(limit, offset);
  }

  async update(id: string, productData: Partial<NewProduct>): Promise<Product | null> {
    return await this.productsRepository.update(id, productData);
  }

  async delete(id: string): Promise<boolean> {
    return await this.productsRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.productsRepository.count();
  }

  async countByCategory(categoryId: string): Promise<number> {
    return await this.productsRepository.countByCategory(categoryId);
  }

  async countActive(): Promise<number> {
    return await this.productsRepository.countActive();
  }

  async countInStock(): Promise<number> {
    return await this.productsRepository.countInStock();
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    return await this.productsRepository.updateStock(id, quantity);
  }

  async findLowStock(threshold: number = 10, limit = 10, offset = 0): Promise<Product[]> {
    return await this.productsRepository.findLowStock(threshold, limit, offset);
  }
}
