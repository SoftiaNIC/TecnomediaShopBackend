import { User, UserRole } from './user.entity';
import { User as DatabaseUser } from '../../database/repositories/users.repository';

export class UserMapper {
  static toDomainEntity(databaseUser: DatabaseUser): User {
    return {
      id: databaseUser.id,
      email: databaseUser.email,
      password: databaseUser.password,
      firstName: databaseUser.firstName,
      lastName: databaseUser.lastName,
      phone: databaseUser.phone || undefined,
      role: this.mapStringToUserRole(databaseUser.role),
      isActive: databaseUser.isActive,
      isEmailVerified: databaseUser.isEmailVerified,
      avatar: databaseUser.avatar || undefined,
      createdAt: databaseUser.createdAt,
      updatedAt: databaseUser.updatedAt,
    };
  }

  static toDomainEntities(databaseUsers: DatabaseUser[]): User[] {
    return databaseUsers.map(user => this.toDomainEntity(user));
  }

  static mapStringToUserRole(role: string): UserRole {
    switch (role.toLowerCase()) {
      case 'admin':
        return UserRole.ADMIN;
      case 'manager':
        return UserRole.MANAGER;
      case 'customer':
      default:
        return UserRole.CUSTOMER;
    }
  }

  static mapUserRoleToString(role: UserRole): string {
    return role.toLowerCase();
  }

  static toDatabaseUser(domainUser: Partial<User>): Partial<DatabaseUser> {
    const databaseUser: Partial<DatabaseUser> = {
      email: domainUser.email,
      password: domainUser.password,
      firstName: domainUser.firstName,
      lastName: domainUser.lastName,
      phone: domainUser.phone,
      isActive: domainUser.isActive,
      isEmailVerified: domainUser.isEmailVerified,
      avatar: domainUser.avatar,
      updatedAt: domainUser.updatedAt,
    };

    if (domainUser.role) {
      databaseUser.role = this.mapUserRoleToString(domainUser.role);
    }

    return databaseUser;
  }
}
