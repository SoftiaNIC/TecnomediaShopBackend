import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../users/domain/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si no se especifican roles, permitir acceso
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false; // Si no hay usuario autenticado, denegar acceso
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    return requiredRoles.some((role) => user.role === role);
  }
}
