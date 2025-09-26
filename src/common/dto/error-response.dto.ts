import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ 
    description: 'Indica si la operación fue exitosa',
    example: false
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Mensaje de error',
    example: 'Ya existe un producto con este SKU'
  })
  message: string;

  @ApiPropertyOptional({ 
    description: 'Código de error HTTP',
    example: 409
  })
  statusCode?: number;

  @ApiPropertyOptional({ 
    description: 'Código de error personalizado',
    example: 'CONFLICT'
  })
  errorCode?: string;

  @ApiPropertyOptional({ 
    description: 'Detalles adicionales del error',
    example: {
      field: 'sku',
      value: 'IPHONE15-PRO-MAX-256GB',
      conflictType: 'duplicate_sku'
    }
  })
  details?: Record<string, any> | string[];

  @ApiPropertyOptional({ 
    description: 'Timestamp del error',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp?: string | Date;

  @ApiPropertyOptional({ 
    description: 'Ruta donde ocurrió el error',
    example: '/api/products'
  })
  path?: string;
}
