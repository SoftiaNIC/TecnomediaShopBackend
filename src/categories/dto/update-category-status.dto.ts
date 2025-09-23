import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryStatusDto {
  @ApiProperty({
    description: 'Estado activo de la categoría',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
} 