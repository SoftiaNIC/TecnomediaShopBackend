import { Injectable, Inject } from '@nestjs/common';
import type { IProductRepository } from './product.repository';
import {
  Product,
  CreateProductCommand,
  UpdateProductCommand,
  ProductStatus,
  ProductName,
  ProductSlug,
  ProductSku,
  ProductPrice,
  ProductQuantity
} from './product.entity';

const PRODUCT_REPOSITORY_TOKEN = 'PRODUCT_REPOSITORY_TOKEN';

@Injectable()
export class ProductDomainService {
  constructor(@Inject(PRODUCT_REPOSITORY_TOKEN) private readonly productRepository: IProductRepository) { }

  async createProduct(command: CreateProductCommand): Promise<Product> {
    // Validaciones de dominio
    const productName = new ProductName(command.name);
    const productSlug = new ProductSlug(command.slug);
    const productSku = new ProductSku(
      command.sku || this.generateSku(command.name)
    );
    const productPrice = new ProductPrice(command.price);
    const productQuantity = new ProductQuantity(
      command.quantity || 0,
      command.trackQuantity || true
    );

    // Verificar si el slug ya existe
    const existingProductBySlug = await this.productRepository.findBySlug(productSlug.getValue());
    if (existingProductBySlug) {
      throw new Error('Product with this slug already exists');
    }

    // Verificar si el SKU ya existe
    const existingProductBySku = await this.productRepository.findBySku(productSku.getValue());
    if (existingProductBySku) {
      throw new Error('Product with this SKU already exists');
    }

    // Verificar si la categoría existe (si se proporcionó)
    if (command.categoryId) {
      const categoryExists = await this.productRepository.categoryExists(command.categoryId);
      if (!categoryExists) {
        throw new Error('Category does not exist');
      }
    }

    // Crear el producto con valores por defecto
    const productData = {
      name: productName.getValue(),
      description: command.description || '',
      slug: productSlug.getValue(),
      sku: productSku.getValue(),
      price: productPrice.getValue(),
      costPrice: command.costPrice,
      comparePrice: command.comparePrice,
      categoryId: command.categoryId,
      quantity: productQuantity.getValue(),
      trackQuantity: productQuantity.isTrackingEnabled(),
      allowOutOfStockPurchases: command.allowOutOfStockPurchases || false,
      isActive: true,
      isDigital: command.isDigital || false,
      metaTitle: command.metaTitle,
      metaDescription: command.metaDescription,
    };

    return await this.productRepository.create(productData);
  }

  async updateProduct(id: string, command: UpdateProductCommand): Promise<Product | null> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Validaciones de dominio para actualización
    const updateData: UpdateProductCommand = { ...command, updatedAt: new Date() };

    if (command.name) {
      const productName = new ProductName(command.name);
      updateData.name = productName.getValue();
    }

    if (command.slug) {
      const productSlug = new ProductSlug(command.slug);
      updateData.slug = productSlug.getValue();

      // Verificar si el nuevo slug ya existe en otro producto
      const productWithSlug = await this.productRepository.findBySlug(productSlug.getValue());
      if (productWithSlug && productWithSlug.id !== id) {
        throw new Error('Slug already in use by another product');
      }
    }

    if (command.sku) {
      const productSku = new ProductSku(command.sku);
      updateData.sku = productSku.getValue();

      // Verificar si el nuevo SKU ya existe en otro producto
      const productWithSku = await this.productRepository.findBySku(productSku.getValue());
      if (productWithSku && productWithSku.id !== id) {
        throw new Error('SKU already in use by another product');
      }
    }

    if (command.price !== undefined) {
      const productPrice = new ProductPrice(command.price);
      updateData.price = productPrice.getValue();
    }

    if (command.quantity !== undefined || command.trackQuantity !== undefined) {
      const trackQuantity = command.trackQuantity ?? existingProduct.trackQuantity;
      const quantity = command.quantity ?? existingProduct.quantity;
      const productQuantity = new ProductQuantity(quantity, trackQuantity);
      updateData.quantity = productQuantity.getValue();
      updateData.trackQuantity = productQuantity.isTrackingEnabled();
    }

    if (command.categoryId) {
      const categoryExists = await this.productRepository.categoryExists(command.categoryId);
      if (!categoryExists) {
        throw new Error('Category does not exist');
      }
      updateData.categoryId = command.categoryId;
    }

    return await this.productRepository.update(id, updateData);
  }

  async activateProduct(id: string): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.isActive) {
      throw new Error('Product is already active');
    }

    return await this.productRepository.update(id, {
      isActive: true,
      updatedAt: new Date()
    });
  }

  async deactivateProduct(id: string): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.isActive) {
      throw new Error('Product is already inactive');
    }

    return await this.productRepository.update(id, {
      isActive: false,
      updatedAt: new Date()
    });
  }

  async updateProductPrice(id: string, newPrice: number): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const productPrice = new ProductPrice(newPrice);

    if (product.price === productPrice.getValue()) {
      throw new Error('Product already has this price');
    }

    return await this.productRepository.update(id, {
      price: productPrice.getValue(),
      updatedAt: new Date()
    });
  }

  async updateProductQuantity(id: string, quantityChange: number): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.trackQuantity) {
      throw new Error('Product quantity tracking is disabled');
    }

    const currentQuantity = new ProductQuantity(product.quantity, product.trackQuantity);
    let newQuantity: ProductQuantity;

    if (quantityChange > 0) {
      newQuantity = currentQuantity.increaseQuantity(quantityChange);
    } else {
      newQuantity = currentQuantity.decreaseQuantity(Math.abs(quantityChange));
    }

    return await this.productRepository.update(id, {
      quantity: newQuantity.getValue(),
      updatedAt: new Date()
    });
  }

  async checkProductAvailability(id: string, requestedQuantity: number = 1): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product || !product.isActive) {
      return false;
    }

    if (!product.trackQuantity || product.allowOutOfStockPurchases) {
      return true;
    }

    const productQuantity = new ProductQuantity(product.quantity, product.trackQuantity);
    return productQuantity.getValue() >= requestedQuantity;
  }

  async getProductStatus(id: string): Promise<ProductStatus> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.isActive) {
      return ProductStatus.INACTIVE;
    }

    const productQuantity = new ProductQuantity(product.quantity, product.trackQuantity);

    if (product.trackQuantity && !productQuantity.isInStock()) {
      return ProductStatus.OUT_OF_STOCK;
    }

    return ProductStatus.ACTIVE;
  }

  async findProductsByCategory(categoryId: string, limit: number = 10, offset: number = 0): Promise<Product[]> {
    const categoryExists = await this.productRepository.categoryExists(categoryId);
    if (!categoryExists) {
      throw new Error('Category does not exist');
    }

    return await this.productRepository.findByCategory(categoryId, limit, offset);
  }

  async findLowStockProducts(threshold: number = 10, limit: number = 50): Promise<Product[]> {
    return await this.productRepository.findLowStockProducts(threshold, limit);
  }

  async findOutOfStockProducts(limit: number = 50): Promise<Product[]> {
    return await this.productRepository.findOutOfStockProducts(limit);
  }

  async findFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return await this.productRepository.findFeaturedProducts(limit);
  }

  async countFeaturedProducts(): Promise<number> {
    return await this.productRepository.countFeaturedProducts();
  }

  async setProductAsFeatured(id: string, reason?: string): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.isActive) {
      throw new Error('Cannot set an inactive product as featured');
    }

    return await this.productRepository.update(id, {
      isFeatured: true,
      updatedAt: new Date()
    });
  }

  async removeProductFromFeatured(id: string, reason?: string): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    return await this.productRepository.update(id, {
      isFeatured: false,
    });
  }

  private generateSku(name: string): string {
    return name
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^A-Z0-9\s-]/g, "") // Remover caracteres especiales
      .trim()
      .replace(/\s+/g, "-") // Reemplazar espacios con guiones
      .slice(0, 50); // Limitar longitud
  }
}
