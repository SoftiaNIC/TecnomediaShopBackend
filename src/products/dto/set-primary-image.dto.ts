import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class SetPrimaryImageDto {
  @ApiProperty({
    description: 'ID de la imagen a establecer como principal',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsString()
  @IsUUID()
  imageId: string;
}
