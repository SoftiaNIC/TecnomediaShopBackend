import { IsArray, IsUUID, IsBoolean, IsNumber, IsOptional, ArrayNotEmpty, ArrayMinSize, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignCategoryDto {
  @ApiProperty({
    description: 'Lista de IDs de categorías a asignar al producto',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  categoryIds: string[];

  @ApiPropertyOptional({
    description: 'ID de la categoría principal (debe estar incluida en categoryIds)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  primaryCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización para cada categoría (mapeo de categoryId a displayOrder)',
    example: { '123e4567-e89b-12d3-a456-426614174000': 0, '123e4567-e89b-12d3-a456-426614174001': 1 }
  })
  @IsOptional()
  displayOrders?: Record<string, number>;
}

export class RemoveCategoryDto {
  @ApiProperty({
    description: 'Lista de IDs de categorías a remover del producto',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  categoryIds: string[];
}

export class UpdateCategoryOrderDto {
  @ApiProperty({
    description: 'ID de la categoría a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Nuevo orden de visualización',
    example: 1,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  displayOrder: number;

  @ApiPropertyOptional({
    description: 'Indica si esta categoría es la principal',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
