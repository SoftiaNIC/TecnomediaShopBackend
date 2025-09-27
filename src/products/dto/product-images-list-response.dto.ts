import { ApiProperty } from '@nestjs/swagger';
import { ProductImageResponseDto } from './product-image-response.dto';

export class ProductImagesListResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Imágenes obtenidas exitosamente'
  })
  message: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  productId: string;

  @ApiProperty({
    description: 'Lista de imágenes del producto',
    type: [ProductImageResponseDto],
    isArray: true
  })
  data: ProductImageResponseDto[];

  @ApiProperty({
    description: 'Número total de imágenes',
    example: 3
  })
  total: number;

  @ApiProperty({
    description: 'Número de imágenes principales',
    example: 1
  })
  primaryCount: number;
}
