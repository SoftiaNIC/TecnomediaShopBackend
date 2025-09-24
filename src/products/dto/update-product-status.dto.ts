import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../domain/product.entity';

export class UpdateProductStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de activación del producto',
    example: true
  })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Estado detallado del producto',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Razón del cambio de estado',
    example: 'Producto reabastecido y disponible para venta'
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
