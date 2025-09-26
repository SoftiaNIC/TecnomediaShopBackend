import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty({
    description: 'ID único de la imagen',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  id: string;

  @ApiProperty({
    description: 'ID del producto al que pertenece la imagen',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  productId: string;

  @ApiProperty({
    description: 'URL externa de la imagen (si se almacenó como URL)',
    example: 'https://example.com/images/product-image.jpg',
    required: false
  })
  url?: string;

  @ApiProperty({
    description: 'URL de datos base64 de la imagen (si se almacenó como datos binarios)',
    example: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    required: false
  })
  imageDataUrl?: string;

  @ApiProperty({
    description: 'Texto alternativo para accesibilidad',
    example: 'Laptop gaming ASUS ROG vista frontal',
    required: false
  })
  altText?: string;

  @ApiProperty({
    description: 'Título de la imagen',
    example: 'Laptop ASUS ROG',
    required: false
  })
  title?: string;

  @ApiProperty({
    description: 'Indica si es la imagen principal del producto',
    example: false
  })
  isPrimary: boolean;

  @ApiProperty({
    description: 'Orden de visualización',
    example: 0
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 1024000,
    required: false
  })
  fileSize?: number;

  @ApiProperty({
    description: 'Tamaño del archivo formateado',
    example: '1.02 MB',
    required: false
  })
  fileSizeFormatted?: string;

  @ApiProperty({
    description: 'Tipo MIME de la imagen',
    example: 'image/jpeg',
    required: false
  })
  mimeType?: string;

  @ApiProperty({
    description: 'Ancho de la imagen en píxeles',
    example: 1920,
    required: false
  })
  width?: number;

  @ApiProperty({
    description: 'Alto de la imagen en píxeles',
    example: 1080,
    required: false
  })
  height?: number;

  @ApiProperty({
    description: 'Dimensiones de la imagen',
    example: '1920x1080',
    required: false
  })
  dimensions?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;
}
