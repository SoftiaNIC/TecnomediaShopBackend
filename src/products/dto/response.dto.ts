import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Product } from '../domain/product.entity';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';

export class ProductResponseDto {
  @ApiProperty({ 
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Mensaje descriptivo de la operación',
    example: 'El producto "iPhone 15 Pro Max" ha sido creado exitosamente'
  })
  message: string;

  @ApiPropertyOptional({ 
    description: 'Datos del producto'
  })
  data?: Product;

  @ApiPropertyOptional({ 
    description: 'Información adicional sobre la operación',
    example: {
      createdAt: "2024-01-15T10:30:00.000Z",
      slug: "iphone-15-pro-max",
      stockStatus: "in_stock",
      priceStatus: "has_discount"
    }
  })
  meta?: Record<string, any>;
}

export class ProductsListResponseDto {
  @ApiProperty({ 
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Mensaje descriptivo de la operación',
    example: 'Se encontraron 25 productos de un total de 100'
  })
  message: string;

  @ApiProperty({ 
    description: 'Lista de productos',
    type: 'array',
    items: { $ref: '#/components/schemas/Product' }
  })
  data: Product[];

  @ApiProperty({ 
    description: 'Metadatos de paginación y conteo',
    example: {
      total: 100,
      count: 25,
      limit: 25,
      offset: 0,
      hasNext: true,
      hasPrevious: false,
      filters: {
        category: null,
        minPrice: null,
        maxPrice: null,
        inStock: null,
        isActive: true
      }
    }
  })
  meta: {
    total: number;
    count: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
    filters?: Record<string, any>;
  };
}

export class ProductsWithStatsResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiProperty({ description: 'Lista de productos con estadísticas' })
  data: (Product & { 
    categoryCount?: number;
    totalReviews?: number;
    averageRating?: number;
    timesOrdered?: number;
  })[];

  @ApiProperty({ description: 'Metadatos de paginación y estadísticas' })
  meta: {
    total: number;
    count: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
    stats?: {
      totalProducts: number;
      totalValue: number;
      averagePrice: number;
      inStockCount: number;
      outOfStockCount: number;
    };
  };
}

export class ProductsByCategoryResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiProperty({ description: 'Lista de productos por categoría' })
  data: Product[];

  @ApiProperty({ description: 'Metadatos de categoría y paginación' })
  meta: {
    categoryId: string;
    categoryName: string;
    total: number;
    count: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class DeleteProductResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiPropertyOptional({ description: 'Información adicional sobre la eliminación' })
  meta?: {
    deletedId: string;
    deletedAt: Date;
    productName: string;
    hadOrders?: boolean;
  };
}

export class StockUpdateResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiPropertyOptional({ description: 'Información del stock actualizado' })
  data?: Product;

  @ApiPropertyOptional({ description: 'Metadatos del ajuste de stock' })
  meta?: {
    previousQuantity: number;
    newQuantity: number;
    difference: number;
    adjustmentType: 'absolute' | 'relative';
    adjustedAt: Date;
    notes?: string;
  };
}

export class PriceUpdateResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiPropertyOptional({ description: 'Información del precio actualizado' })
  data?: Product;

  @ApiPropertyOptional({ description: 'Metadatos del ajuste de precio' })
  meta?: {
    previousPrice: number;
    newPrice: number;
    difference: number;
    percentageChange: number;
    updatedAt: Date;
    hasDiscount: boolean;
    reason?: string;
  };
}

export class ProductSearchResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiProperty({ description: 'Resultados de búsqueda' })
  data: Product[];

  @ApiProperty({ description: 'Metadatos de búsqueda' })
  meta: {
    searchTerm: string;
    total: number;
    count: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
    searchTime: number;
    suggestions?: string[];
  };
}

export class SlugGenerationResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiProperty({ description: 'Slug generado' })
  data: {
    originalName: string;
    generatedSlug: string;
    isUnique: boolean;
    suggestions?: string[];
  };
}

