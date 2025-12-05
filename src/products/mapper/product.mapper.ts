import { Injectable } from '@nestjs/common';
import {
  Product,
  CreateProductCommand,
  UpdateProductCommand
} from '../domain/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductsListResponseDto
} from '../dto';

@Injectable()
export class ProductMapper {

  /**
   * Convierte un CreateProductDto a CreateProductCommand
   */
  toCreateCommand(dto: CreateProductDto): CreateProductCommand {
    return {
      name: dto.name,
      description: dto.description || '',
      slug: dto.slug,
      sku: dto.sku,
      price: dto.price,
      categoryId: dto.categoryId,
      quantity: dto.quantity,
      trackQuantity: dto.trackQuantity,
      allowOutOfStockPurchases: dto.allowOutOfStockPurchases,
      isDigital: dto.isDigital,
      isFeatured: dto.isFeatured,
      brand: dto.brand,
      weight: dto.weight,
    };
  }

  /**
   * Convierte un UpdateProductDto a UpdateProductCommand
   */
  toUpdateCommand(dto: UpdateProductDto): UpdateProductCommand {
    const command: UpdateProductCommand = {};

    if (dto.name !== undefined) command.name = dto.name;
    if (dto.description !== undefined) command.description = dto.description;
    if (dto.slug !== undefined) command.slug = dto.slug;
    if (dto.sku !== undefined) command.sku = dto.sku;
    if (dto.price !== undefined) command.price = dto.price;
    if (dto.categoryId !== undefined) command.categoryId = dto.categoryId;
    if (dto.quantity !== undefined) command.quantity = dto.quantity;
    if (dto.trackQuantity !== undefined) command.trackQuantity = dto.trackQuantity;
    if (dto.allowOutOfStockPurchases !== undefined) command.allowOutOfStockPurchases = dto.allowOutOfStockPurchases;
    if (dto.isActive !== undefined) command.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) command.isFeatured = dto.isFeatured;
    if (dto.brand !== undefined) command.brand = dto.brand;
    if (dto.isDigital !== undefined) command.isDigital = dto.isDigital;
    if (dto.weight !== undefined) command.weight = dto.weight;

    return command;
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  toResponseDto(product: Product): ProductResponseDto {
    return {
      success: true,
      message: `Producto "${product.name}" obtenido exitosamente`,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        quantity: product.quantity,
        trackQuantity: product.trackQuantity,
        allowOutOfStockPurchases: product.allowOutOfStockPurchases,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        brand: product.brand,
        isDigital: product.isDigital,
        weight: product.weight,
        barcode: product.barcode,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
      },
      meta: {
        createdAt: product.createdAt,
        slug: product.slug,
        stockStatus: product.quantity > 0 ? 'in_stock' : 'out_of_stock',
        priceStatus: product.comparePrice && product.comparePrice > product.price ? 'has_discount' : 'regular_price'
      }
    };
  }

  /**
   * Convierte múltiples entidades de dominio a DTOs de respuesta
   */
  toResponseDtos(products: Product[], total?: number, limit?: number, offset?: number): ProductsListResponseDto {
    return {
      success: true,
      message: `Se encontraron ${products.length} productos${total ? ` de un total de ${total}` : ''}`,
      data: products,
      meta: {
        total: total || products.length,
        count: products.length,
        limit: limit || products.length,
        offset: offset || 0,
        hasNext: total && limit && offset ? (offset + limit) < total : false,
        hasPrevious: offset ? offset > 0 : false,
        filters: {
          category: null,
          minPrice: null,
          maxPrice: null,
          inStock: null,
          isActive: true
        }
      }
    };
  }
}
