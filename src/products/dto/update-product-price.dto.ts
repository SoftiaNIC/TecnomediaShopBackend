import { IsNumber, Min, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductPriceDto {
  @ApiProperty({
    description: 'Nuevo precio del producto',
    example: 1099.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Precio de descuento (si aplica)',
    example: 999.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountedPrice?: number;

  @ApiPropertyOptional({
    description: 'Indica si el precio de descuento está activo',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  hasDiscount?: boolean;

  @ApiPropertyOptional({
    description: 'Razón del cambio de precio',
    example: 'Promoción de lanzamiento'
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
