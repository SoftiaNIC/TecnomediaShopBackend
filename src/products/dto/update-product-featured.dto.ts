import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductFeaturedDto {
  @ApiProperty({
    description: 'Indica si el producto debe ser marcado como destacado',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  isFeatured: boolean;

  @ApiPropertyOptional({
    description: 'Razón por la cual se cambia el estado de destacado',
    example: 'Producto seleccionado para campaña de promoción de verano',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
