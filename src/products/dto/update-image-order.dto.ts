import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImageOrderItem {
  @ApiProperty({
    description: 'ID de la imagen',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsString()
  @IsUUID()
  imageId: string;

  @ApiProperty({
    description: 'Orden de visualización',
    example: 0
  })
  @IsNumber()
  displayOrder: number;
}

export class UpdateImageOrderDto {
  @ApiProperty({
    description: 'Lista de imágenes con sus nuevos órdenes',
    type: [ImageOrderItem],
    isArray: true
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageOrderItem)
  imageOrders: ImageOrderItem[];
}
