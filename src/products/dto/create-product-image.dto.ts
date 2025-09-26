import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsEnum, 
  IsUUID, 
  IsUrl, 
  IsBase64,
  MaxLength,
  Min,
  ValidateIf,
  IsNotEmpty
} from 'class-validator';
import { ImageMimeType } from '../domain/product-image.entity';

export class CreateProductImageDto {
  @ApiProperty({
    description: 'ID del producto al que pertenece la imagen',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    description: 'URL externa de la imagen (requerida si no se proporciona imageData)',
    example: 'https://example.com/images/product-image.jpg'
  })
  @IsUrl()
  @IsOptional()
  @ValidateIf((o) => !o.imageData, {
    message: 'URL is required when imageData is not provided'
  })
  url?: string;

  @ApiPropertyOptional({
    description: 'Datos binarios de la imagen en base64 (requerido si no se proporciona url)',
    example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  })
  @IsBase64()
  @IsOptional()
  @ValidateIf((o) => !o.url, {
    message: 'Image data is required when URL is not provided'
  })
  imageData?: string;

  @ApiPropertyOptional({
    description: 'Texto alternativo para accesibilidad',
    example: 'Laptop gaming ASUS ROG vista frontal'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  altText?: string;

  @ApiPropertyOptional({
    description: 'Título de la imagen',
    example: 'Laptop ASUS ROG'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Indica si es la imagen principal del producto',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Orden de visualización',
    example: 0,
    default: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Tamaño del archivo en bytes',
    example: 1024000
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({
    description: 'Tipo MIME de la imagen',
    enum: ImageMimeType,
    example: ImageMimeType.JPEG
  })
  @IsEnum(ImageMimeType)
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Ancho de la imagen en píxeles',
    example: 1920
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: 'Alto de la imagen en píxeles',
    example: 1080
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  height?: number;
}
