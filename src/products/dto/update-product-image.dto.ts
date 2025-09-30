import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsEnum, 
  IsUrl, 
  IsBase64,
  MaxLength,
  Min,
  ValidateIf
} from 'class-validator';
import { ImageMimeType } from '../domain/product-image.entity';

export class UpdateProductImageDto {
  @ApiPropertyOptional({
    description: 'URL externa de la imagen',
    example: 'https://example.com/images/product-image-updated.jpg'
  })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Datos binarios de la imagen en base64',
    example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  })
  @IsBase64()
  @IsOptional()
  imageData?: string;

  @ApiPropertyOptional({
    description: 'Texto alternativo para accesibilidad',
    example: 'Laptop gaming ASUS ROG vista frontal actualizada'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  altText?: string;

  @ApiPropertyOptional({
    description: 'Título de la imagen',
    example: 'Laptop ASUS ROG Actualizada'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Indica si es la imagen principal del producto',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Orden de visualización',
    example: 1
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Tamaño del archivo en bytes',
    example: 2048000
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
    example: 2560
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: 'Alto de la imagen en píxeles',
    example: 1440
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  height?: number;
}
