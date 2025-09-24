import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max, IsArray, IsUUID, ValidateIf, IsEnum, IsUrl, Matches, MinLength, MaxLength, ArrayNotEmpty, ArrayMinSize, ArrayMaxSize, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../domain/product.entity';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Nombre del producto',
    example: 'iPhone 15 Pro Max Actualizado',
    minLength: 3,
    maxLength: 200
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(200)
  @Matches(/^[a-zA-Z0-9\s\-\&\'\,\.]+$/, {
    message: 'El nombre solo puede contener letras, números, espacios y caracteres básicos de puntuación'
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'El iPhone más avanzado con cámara profesional y chip A17 Pro - Versión actualizada',
    maxLength: 5000
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'SKU único del producto',
    example: 'IPHONE15-PRO-MAX-256GB-V2',
    minLength: 3,
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Z0-9\-]+$/, {
    message: 'El SKU solo puede contener letras mayúsculas, números y guiones'
  })
  sku?: string;

  @ApiPropertyOptional({
    description: 'URL amigable para el producto',
    example: 'iphone-15-pro-max-actualizado',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9\-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones'
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Precio del producto',
    example: 1149.99,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  price?: number;

  @ApiPropertyOptional({
    description: 'Precio de descuento (si aplica)',
    example: 1049.99,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  @ValidateIf((o) => o.discountedPrice !== undefined)
  discountedPrice?: number;

  @ApiPropertyOptional({
    description: 'Cantidad en stock',
    example: 45,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(999999)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'ID de la categoría principal',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'IDs de categorías adicionales',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String]
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  additionalCategoryIds?: string[];

  @ApiPropertyOptional({
    description: 'URL de la imagen principal',
    example: 'https://example.com/images/iphone15-promax-v2.jpg'
  })
  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen debe ser una URL válida' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'URLs de imágenes adicionales',
    example: [
      'https://example.com/images/iphone15-promax-v2-1.jpg',
      'https://example.com/images/iphone15-promax-v2-2.jpg'
    ],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true, message: 'Cada URL de imagen debe ser una URL válida' })
  @ArrayMaxSize(10, { message: 'Máximo 10 imágenes adicionales permitidas' })
  @IsOptional()
  additionalImages?: string[];

  @ApiPropertyOptional({
    description: 'Peso del producto en gramos',
    example: 225,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100000)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Dimensiones del producto (formato: LxWxH en cm)',
    example: '16.0x7.7x0.85'
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/, {
    message: 'Las dimensiones deben estar en formato LxWxH (ej: 16.0x7.7x0.85)'
  })
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Apple'
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Etiquetas o tags del producto',
    example: ['smartphone', 'apple', 'premium', '5g', 'updated'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20, { message: 'Máximo 20 etiquetas permitidas' })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Indica si el producto está activo',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto es destacado',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si se debe rastrear el inventario',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  trackQuantity?: boolean;

  @ApiPropertyOptional({
    description: 'Permite comprar cuando no hay stock',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  allowOutOfStockPurchases?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si es un producto digital',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  isDigital?: boolean;

  @ApiPropertyOptional({
    description: 'Stock mínimo para alerta',
    example: 15,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000)
  lowStockThreshold?: number;

  @ApiPropertyOptional({
    description: 'Estado del producto',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Notas internas del producto',
    example: 'Producto actualizado con nuevas especificaciones',
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
