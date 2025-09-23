import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Electrónicos',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Productos electrónicos y tecnológicos'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Slug único para la categoría (solo letras minúsculas, números, guiones)',
    example: 'electronicos',
    pattern: '^[a-z0-9-]+$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones'
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Estado activo de la categoría',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 