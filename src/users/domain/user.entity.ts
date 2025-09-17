export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  CLIENTE = 'cliente',
}

export interface CreateUserCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  avatar?: string;
}

export interface UpdateUserCommand {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  avatar?: string;
  updatedAt?: Date;
}

export class UserEmail {
  constructor(private readonly email: string) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    this.email = email.toLowerCase().trim();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.email;
  }

  toString(): string {
    return this.email;
  }
}

export class UserName {
  constructor(
    private readonly firstName: string,
    private readonly lastName: string
  ) {
    if (!firstName?.trim()) {
      throw new Error('First name is required');
    }
    if (!lastName?.trim()) {
      throw new Error('Last name is required');
    }
    
    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
