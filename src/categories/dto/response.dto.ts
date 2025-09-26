import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Category } from '../../database/repositories/categories.repository';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';

export class CategoryResponseDto {
  @ApiProperty({ 
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Mensaje descriptivo de la operación',
    example: 'La categoría "Electrónicos" ha sido creada exitosamente'
  })
  message: string;

  @ApiPropertyOptional({ 
    description: 'Datos de la categoría',
    example: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Electrónicos",
      description: "Productos electrónicos y tecnológicos",
      slug: "electronicos",
      isActive: true,
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z"
    }
  })
  data?: Category;

  @ApiPropertyOptional({ 
    description: 'Información adicional sobre la operación',
    example: {
      createdAt: "2024-01-15T10:30:00.000Z",
      slug: "electronicos"
    }
  })
  meta?: Record<string, any>;
}

export class CategoriesListResponseDto {
  @ApiProperty({ 
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Mensaje descriptivo de la operación',
    example: 'Se encontraron 3 categorías de un total de 5'
  })
  message: string;

  @ApiProperty({ 
    description: 'Lista de categorías',
    example: [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Electrónicos",
        description: "Productos electrónicos y tecnológicos",
        slug: "electronicos",
        isActive: true,
        createdAt: "2024-01-15T10:30:00.000Z",
        updatedAt: "2024-01-15T10:30:00.000Z"
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174001",
        name: "Ropa y Accesorios",
        description: "Prendas de vestir y accesorios de moda",
        slug: "ropa-accesorios",
        isActive: true,
        createdAt: "2024-01-15T10:35:00.000Z",
        updatedAt: "2024-01-15T10:35:00.000Z"
      }
    ]
  })
  data: Category[];

  @ApiProperty({ 
    description: 'Metadatos de paginación y conteo',
    example: {
      total: 5,
      count: 3,
      limit: 10,
      offset: 0,
      hasNext: false,
      hasPrevious: false
    }
  })
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
 