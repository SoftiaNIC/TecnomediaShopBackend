import { ApiProperty } from '@nestjs/swagger';

export class CategoryAssignmentResponse {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Categorías asignadas exitosamente al producto'
  })
  message: string;

  @ApiProperty({
    description: 'ID del producto afectado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  productId: string;

  @ApiProperty({
    description: 'Lista de IDs de categorías asignadas',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001']
  })
  assignedCategoryIds: string[];

  @ApiProperty({
    description: 'ID de la categoría principal asignada',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  primaryCategoryId?: string;
}

export class CategoryRemovalResponse {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Categorías removidas exitosamente del producto'
  })
  message: string;

  @ApiProperty({
    description: 'ID del producto afectado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  productId: string;

  @ApiProperty({
    description: 'Lista de IDs de categorías removidas',
    example: ['123e4567-e89b-12d3-a456-426614174001']
  })
  removedCategoryIds: string[];

  @ApiProperty({
    description: 'Cantidad de categorías restantes',
    example: 1
  })
  remainingCategoriesCount: number;
}

export class CategoryOrderUpdateResponse {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Orden de categoría actualizado exitosamente'
  })
  message: string;

  @ApiProperty({
    description: 'ID del producto afectado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  productId: string;

  @ApiProperty({
    description: 'ID de la categoría actualizada',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  categoryId: string;

  @ApiProperty({
    description: 'Nuevo orden de visualización',
    example: 1
  })
  newDisplayOrder: number;

  @ApiProperty({
    description: 'Indica si ahora es la categoría principal',
    example: true,
    required: false
  })
  isNowPrimary?: boolean;
}

export class ProductCategoriesResponse {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Categorías del producto obtenidas exitosamente'
  })
  message: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  productId: string;

  @ApiProperty({
    description: 'Lista de categorías asignadas al producto'
  })
  categories: ProductCategoryInfo[];
}

export class ProductCategoryInfo {
  @ApiProperty({
    description: 'ID de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Electrónicos'
  })
  name: string;

  @ApiProperty({
    description: 'Slug de la categoría',
    example: 'electronicos'
  })
  slug: string;

  @ApiProperty({
    description: 'Indica si es la categoría principal',
    example: true
  })
  isPrimary: boolean;

  @ApiProperty({
    description: 'Orden de visualización',
    example: 0
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Indica si la categoría está activa',
    example: true
  })
  isActive: boolean;
}
