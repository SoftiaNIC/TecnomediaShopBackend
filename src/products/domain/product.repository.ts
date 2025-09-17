import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../../database/repositories/products.repository';
import { Product, CreateProductCommand, UpdateProductCommand } from './product.entity';

export interface IProductRepository {
  create(productData: CreateProductCommand): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(limit: number, offset: number, sortBy?: string, sortOrder?: string): Promise<Product[]>;
  findByCategory(categoryId: string, limit: number, offset: number): Promise<Product[]>;
  search(searchTerm: string, limit: number, offset: number): Promise<Product[]>;
  update(id: string, productData: UpdateProductCommand): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  categoryExists(categoryId: string): Promise<boolean>;
  findActiveProducts(limit: number, offset: number): Promise<Product[]>;
  findLowStockProducts(threshold: number, limit: number): Promise<Product[]>;
  findOutOfStockProducts(limit: number): Promise<Product[]>;
  count(): Promise<number>;
  countByCategory(categoryId: string): Promise<number>;
  countActive(): Promise<number>;
  findInStock(limit: number, offset: number): Promise<Product[]>;
  updateStock(id: string, quantity: number): Promise<Product | null>;
}

@Injectable()
export class ProductRepositoryAdapter implements IProductRepository {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(productData: CreateProductCommand): Promise<Product> {
    const databaseProductData = ProductMapper.toDatabaseProduct(productData);
    const databaseProduct = await this.productsRepository.create(databaseProductData);
    return ProductMapper.toDomainEntity(databaseProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const databaseProduct = await this.productsRepository.findById(id);
    return databaseProduct ? ProductMapper.toDomainEntity(databaseProduct) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const databaseProduct = await this.productsRepository.findBySlug(slug);
    return databaseProduct ? ProductMapper.toDomainEntity(databaseProduct) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const databaseProduct = await this.productsRepository.findBySku(sku);
    return databaseProduct ? ProductMapper.toDomainEntity(databaseProduct) : null;
  }

  async findAll(limit: number, offset: number, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Promise<Product[]> {
    const databaseProducts = await this.productsRepository.findAll(limit, offset, sortBy, sortOrder);
    return ProductMapper.toDomainEntities(databaseProducts);
  }

  async findByCategory(categoryId: string, limit: number, offset: number): Promise<Product[]> {
    const databaseProducts = await this.productsRepository.findByCategory(categoryId, limit, offset);
    return ProductMapper.toDomainEntities(databaseProducts);
  }

  async search(searchTerm: string, limit: number, offset: number): Promise<Product[]> {
    const databaseProducts = await this.productsRepository.search(searchTerm, limit, offset);
    return ProductMapper.toDomainEntities(databaseProducts);
  }

  async update(id: string, productData: UpdateProductCommand): Promise<Product | null> {
    const databaseProductData = ProductMapper.toDatabaseProduct(productData);
    const databaseProduct = await this.productsRepository.update(id, databaseProductData);
    return databaseProduct ? ProductMapper.toDomainEntity(databaseProduct) : null;
  }

  async delete(id: string): Promise<boolean> {
    return await this.productsRepository.delete(id);
  }

  async categoryExists(categoryId: string): Promise<boolean> {
    // Este método necesitaría ser implementado en el repositorio de productos o categories
    // Por ahora, asumimos que existe si podemos encontrar productos con esa categoría
    const productsInCategory = await this.productsRepository.findByCategory(categoryId, 1, 0);
    return productsInCategory.length > 0;
  }

  async findActiveProducts(limit: number, offset: number): Promise<Product[]> {
    const databaseProducts = await this.productsRepository.findActive(limit, offset);
    return ProductMapper.toDomainEntities(databaseProducts);
  }

  async findLowStockProducts(threshold: number, limit: number): Promise<Product[]> {
    const databaseProducts = await this.productsRepository.findLowStock(threshold, limit);
    return ProductMapper.toDomainEntities(databaseProducts);
  }

  async findOutOfStockProducts(limit: number): Promise<Product[]> {
    const databaseProducts = await this.productsRepository.findOutOfStock(limit);
    return ProductMapper.toDomainEntities(databaseProducts);
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

  async findInStock(limit: number, offset: number): Promise<Product[]> {
    const databaseProducts = await this.productsRepository.findInStock(limit, offset);
    return ProductMapper.toDomainEntities(databaseProducts);
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    const databaseProduct = await this.productsRepository.updateStock(id, quantity);
    return databaseProduct ? ProductMapper.toDomainEntity(databaseProduct) : null;
  }
}

export class ProductMapper {
  static toDomainEntity(databaseProduct: any): Product {
    return {
      id: databaseProduct.id,
      name: databaseProduct.name,
      description: databaseProduct.description || '',
      slug: databaseProduct.slug,
      sku: databaseProduct.sku,
      price: typeof databaseProduct.price === 'string' ? parseFloat(databaseProduct.price) : databaseProduct.price,
      costPrice: databaseProduct.costPrice ? (typeof databaseProduct.costPrice === 'string' ? parseFloat(databaseProduct.costPrice) : databaseProduct.costPrice) : undefined,
      comparePrice: databaseProduct.comparePrice ? (typeof databaseProduct.comparePrice === 'string' ? parseFloat(databaseProduct.comparePrice) : databaseProduct.comparePrice) : undefined,
      categoryId: databaseProduct.categoryId,
      quantity: databaseProduct.quantity,
      trackQuantity: databaseProduct.trackQuantity,
      allowOutOfStockPurchases: databaseProduct.allowOutOfStockPurchases,
      isActive: databaseProduct.isActive,
      isDigital: databaseProduct.isDigital,
      barcode: databaseProduct.barcode,
      weight: databaseProduct.weight,
      images: databaseProduct.images || [],
      tags: databaseProduct.tags || [],
      metaTitle: databaseProduct.metaTitle,
      metaDescription: databaseProduct.metaDescription,
      createdAt: databaseProduct.createdAt,
      updatedAt: databaseProduct.updatedAt,
    };
  }

  static toDomainEntities(databaseProducts: any[]): Product[] {
    return databaseProducts.map(product => this.toDomainEntity(product));
  }

  static toDatabaseProduct(domainProduct: Partial<Product>): any {
    const databaseProduct: any = {
      name: domainProduct.name,
      description: domainProduct.description,
      slug: domainProduct.slug,
      sku: domainProduct.sku,
      categoryId: domainProduct.categoryId,
      quantity: domainProduct.quantity,
      trackQuantity: domainProduct.trackQuantity,
      allowOutOfStockPurchases: domainProduct.allowOutOfStockPurchases,
      isActive: domainProduct.isActive,
      isDigital: domainProduct.isDigital,
      barcode: domainProduct.barcode,
      weight: domainProduct.weight,
      images: domainProduct.images,
      tags: domainProduct.tags,
      metaTitle: domainProduct.metaTitle,
      metaDescription: domainProduct.metaDescription,
      updatedAt: domainProduct.updatedAt,
    };

    if (domainProduct.price !== undefined) {
      databaseProduct.price = domainProduct.price.toString();
    }
    if (domainProduct.costPrice !== undefined) {
      databaseProduct.costPrice = domainProduct.costPrice?.toString();
    }
    if (domainProduct.comparePrice !== undefined) {
      databaseProduct.comparePrice = domainProduct.comparePrice?.toString();
    }

    return databaseProduct;
  }
}
