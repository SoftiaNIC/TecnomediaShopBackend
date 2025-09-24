import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateSlugDto {
  @ApiProperty({
    description: 'Nombre del producto para generar el slug',
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
}
