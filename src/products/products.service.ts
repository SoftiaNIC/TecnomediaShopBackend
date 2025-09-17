import { Injectable } from '@nestjs/common';
import { ProductDomainService } from './domain/product.service';
import { ProductRepositoryAdapter } from './domain/product.repository';
import { Product, CreateProductCommand, UpdateProductCommand, ProductStatus } from './domain/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productDomainService: ProductDomainService,
    private readonly productRepository: ProductRepositoryAdapter,
  ) {}

  async create(productData: CreateProductCommand): Promise<Product> {
    return await this.productDomainService.createProduct(productData);
  }

  async findById(id: string): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return await this.productRepository.findBySlug(slug);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return await this.productRepository.findBySku(sku);
  }

  async findAll(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<Product[]> {
    return await this.productRepository.findAll(limit, offset, sortBy, sortOrder);
  }

  async findByCategory(categoryId: string, limit = 10, offset = 0): Promise<Product[]> {
    return await this.productDomainService.findProductsByCategory(categoryId, limit, offset);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<Product[]> {
    return await this.productRepository.search(searchTerm, limit, offset);
  }

  async update(id: string, productData: UpdateProductCommand): Promise<Product | null> {
    return await this.productDomainService.updateProduct(id, productData);
  }

  async delete(id: string): Promise<boolean> {
    return await this.productRepository.delete(id);
  }

  async findActive(limit = 10, offset = 0): Promise<Product[]> {
    return await this.productRepository.findActiveProducts(limit, offset);
  }

  async findLowStock(threshold = 10, limit = 50): Promise<Product[]> {
    return await this.productDomainService.findLowStockProducts(threshold, limit);
  }

  async findOutOfStock(limit = 50): Promise<Product[]> {
    return await this.productDomainService.findOutOfStockProducts(limit);
  }

  async count(): Promise<number> {
    return await this.productRepository.count();
  }

  async countByCategory(categoryId: string): Promise<number> {
    return await this.productRepository.countByCategory(categoryId);
  }

  async countActive(): Promise<number> {
    return await this.productRepository.countActive();
  }

  async activateProduct(id: string): Promise<Product | null> {
    return await this.productDomainService.activateProduct(id);
  }

  async deactivateProduct(id: string): Promise<Product | null> {
    return await this.productDomainService.deactivateProduct(id);
  }

  async getProductStatus(id: string): Promise<ProductStatus> {
    return await this.productDomainService.getProductStatus(id);
  }

  async updateProductPrice(id: string, newPrice: number): Promise<Product | null> {
    return await this.productDomainService.updateProductPrice(id, newPrice);
  }

  async updateProductQuantity(id: string, quantityChange: number): Promise<Product | null> {
    return await this.productDomainService.updateProductQuantity(id, quantityChange);
  }

  async checkProductAvailability(id: string, requestedQuantity: number = 1): Promise<boolean> {
    return await this.productDomainService.checkProductAvailability(id, requestedQuantity);
  }

  async findInStock(limit = 10, offset = 0): Promise<Product[]> {
    return await this.productRepository.findInStock(limit, offset);
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    return await this.productRepository.updateStock(id, quantity);
  }
}
