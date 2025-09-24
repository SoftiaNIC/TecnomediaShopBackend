import { IsNumber, Min, IsOptional, IsBoolean, IsString, MaxLength, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductStockDto {
  @ApiProperty({
    description: 'Nueva cantidad de stock',
    example: 50,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @Max(999999)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Indica si es un ajuste relativo (sumar/restar) o absoluto (establecer)',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isRelative?: boolean;

  @ApiPropertyOptional({
    description: 'Notas sobre el ajuste de stock',
    example: 'Reposición de inventario mensual',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
