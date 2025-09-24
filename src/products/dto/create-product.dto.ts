import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, Max, IsArray, IsUUID, ValidateIf, IsEnum, IsUrl, Matches, MinLength, MaxLength, ArrayNotEmpty, ArrayMinSize, ArrayMaxSize, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../domain/product.entity';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'iPhone 15 Pro Max',
    minLength: 3,
    maxLength: 200
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  @Matches(/^[a-zA-Z0-9\s\-\&\'\,\.]+$/, {
    message: 'El nombre solo puede contener letras, números, espacios y caracteres básicos de puntuación'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'El iPhone más avanzado con cámara profesional y chip A17 Pro',
    maxLength: 5000
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    description: 'SKU único del producto',
    example: 'IPHONE15-PRO-MAX-256GB',
    minLength: 3,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Z0-9\-]+$/, {
    message: 'El SKU solo puede contener letras mayúsculas, números y guiones'
  })
  sku: string;

  @ApiProperty({
    description: 'URL amigable para el producto',
    example: 'iphone-15-pro-max',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
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
    description: 'Precio de descuento (si aplica)',
    example: 1099.99,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  @ValidateIf((o) => o.discountedPrice !== undefined)
  discountedPrice?: number;

  @ApiPropertyOptional({
    description: 'Cantidad en stock',
    example: 50,
    minimum: 0
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
    example: 'https://example.com/images/iphone15-promax.jpg'
  })
  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen debe ser una URL válida' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'URLs de imágenes adicionales',
    example: [
      'https://example.com/images/iphone15-promax-1.jpg',
      'https://example.com/images/iphone15-promax-2.jpg'
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
    example: 221,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @Max(100000)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Dimensiones del producto (formato: LxWxH en cm)',
    example: '15.97x7.69x0.82'
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/, {
    message: 'Las dimensiones deben estar en formato LxWxH (ej: 15.97x7.69x0.82)'
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
    example: ['smartphone', 'apple', 'premium', '5g'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20, { message: 'Máximo 20 etiquetas permitidas' })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Indica si el producto está activo',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

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
    description: 'Stock mínimo para alerta',
    example: 10,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
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
    example: 'Producto de alta demanda, reponer stock mensualmente',
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
