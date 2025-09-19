import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../domain/user.entity';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Nuevo rol a asignar al usuario',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    description: 'Motivo del cambio de rol (para auditoría)',
    example: 'Promoción a administrador del sistema',
    required: false
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
