import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, Max, IsUUID, ValidateIf, IsEnum, Matches, MinLength, MaxLength, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../domain/product.entity';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'iPhone 15 Pro Max',
    minLength: 3,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s\-\&\'\,\.\*\(\)\[\]\:]+$/, {
    message: 'El nombre contiene caracteres no permitidos'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'El iPhone más avanzado con cámara profesional y chip A17 Pro'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'SKU único del producto (se genera automáticamente si no se proporciona)',
    example: 'IPHONE15-PRO-MAX-256GB',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  sku?: string;

  @ApiProperty({
    description: 'URL amigable para el producto',
    example: 'iphone-15-pro-max',
    minLength: 3,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-z0-9\-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones'
  })
  slug: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 1199.99,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  price: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio antes de descuento)',
    example: 1399.99,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  @ValidateIf((o) => o.comparePrice !== undefined)
  comparePrice?: number;

  @ApiPropertyOptional({
    description: 'Precio de costo del producto',
    example: 899.99,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  @ValidateIf((o) => o.costPrice !== undefined)
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Cantidad en stock',
    example: 50,
    minimum: 0,
    default: 0
  })
  @IsNumber()
  @Min(0)
  @Max(999999)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'ID de la categoría principal',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Peso del producto en gramos',
    example: 221,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @Max(100000)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Código de barras del producto',
    example: '1234567890123'
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Indica si el producto está activo',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto es destacado',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si se debe rastrear el inventario',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  trackQuantity?: boolean;

  @ApiPropertyOptional({
    description: 'Permite comprar cuando no hay stock',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  allowOutOfStockPurchases?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si es un producto digital',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isDigital?: boolean;

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Apple',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({
    description: 'Título SEO para el producto',
    example: 'iPhone 15 Pro Max - El smartphone más avanzado'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'Descripción SEO para el producto',
    example: 'Descubre el iPhone 15 Pro Max con cámara profesional, chip A17 Pro y diseño innovador.'
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'Estado del producto',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    default: ProductStatus.ACTIVE
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
