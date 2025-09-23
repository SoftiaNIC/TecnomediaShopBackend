import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Category } from '../../database/repositories/categories.repository';

export class CategoryResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiPropertyOptional({ description: 'Datos de la categoría' })
  data?: Category;

  @ApiPropertyOptional({ description: 'Información adicional sobre la operación' })
  meta?: Record<string, any>;
}

export class CategoriesListResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiProperty({ description: 'Lista de categorías' })
  data: Category[];

  @ApiProperty({ description: 'Metadatos de paginación y conteo' })
  meta: {
    total: number;
    count: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class CategoriesWithCountResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiProperty({ description: 'Lista de categorías con conteo de productos' })
  data: (Category & { productCount: number })[];

  @ApiProperty({ description: 'Metadatos de paginación y conteo' })
  meta: {
    total: number;
    count: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class DeleteResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiPropertyOptional({ description: 'Información adicional sobre la eliminación' })
  meta?: {
    deletedId: string;
    deletedAt: Date;
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
  };
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Indica que la operación falló' })
  success: false;

  @ApiProperty({ description: 'Mensaje de error descriptivo' })
  message: string;

  @ApiProperty({ description: 'Código de error HTTP' })
  statusCode: number;

  @ApiPropertyOptional({ description: 'Detalles adicionales del error' })
  details?: string[];

  @ApiPropertyOptional({ description: 'Timestamp del error' })
  timestamp?: Date;

  @ApiPropertyOptional({ description: 'Ruta donde ocurrió el error' })
  path?: string;
} 