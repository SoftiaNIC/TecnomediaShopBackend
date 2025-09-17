import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, like, or } from 'drizzle-orm';
import { users, userRoleEnum } from '../schema';
import { DB_CONNECTION } from '../database.module';

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

@Injectable()
export class UsersRepository {
  constructor(@Inject(DB_CONNECTION) private db: NodePgDatabase) {}

  async create(userData: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(userData).returning();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user || null;
  }

  async findAll(limit = 10, offset = 0): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .where(
        or(
          like(users.firstName, `%${searchTerm}%`),
          like(users.lastName, `%${searchTerm}%`),
          like(users.email, `%${searchTerm}%`)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);
  }

  async update(id: string, userData: Partial<NewUser>): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async findByRole(role: 'superadmin' | 'admin' | 'cliente', limit = 10, offset = 0): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);
  }

  async findActiveUsers(limit = 10, offset = 0): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: users.id })
      .from(users);
    return result.length;
  }

  async countByRole(role: 'superadmin' | 'admin' | 'cliente'): Promise<number> {
    const result = await this.db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.role, role));
    return result.length;
  }
}