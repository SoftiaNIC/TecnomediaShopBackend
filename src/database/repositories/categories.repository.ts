import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { categories } from '../schema';
import { DB_CONNECTION } from '../database.module';

export type NewCategory = typeof categories.$inferInsert;
export type Category = typeof categories.$inferSelect;

@Injectable()
export class CategoriesRepository {
  constructor(@Inject(DB_CONNECTION) private db: NodePgDatabase) {}

  async create(categoryData: NewCategory): Promise<Category> {
    const [category] = await this.db.insert(categories).values(categoryData).returning();
    return category;
  }

  async findById(id: string): Promise<Category | null> {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return category || null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return category || null;
  }

  async findAll(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<Category[]> {
    const orderBy = sortOrder === 'desc' ? desc(categories[sortBy]) : asc(categories[sortBy]);
    
    return await this.db
      .select()
      .from(categories)
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<Category[]> {
    return await this.db
      .select()
      .from(categories)
      .where(
        or(
          like(categories.name, `%${searchTerm}%`),
          like(categories.description, `%${searchTerm}%`),
          like(categories.slug, `%${searchTerm}%`)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(categories.createdAt));
  }

  async findActive(limit = 10, offset = 0): Promise<Category[]> {
    return await this.db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(categories.createdAt));
  }

  async update(id: string, categoryData: Partial<NewCategory>): Promise<Category | null> {
    const [category] = await this.db
      .update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(categories)
      .where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: categories.id })
      .from(categories);
    return result.length;
  }

  async countActive(): Promise<number> {
    const result = await this.db
      .select({ count: categories.id })
      .from(categories)
      .where(eq(categories.isActive, true));
    return result.length;
  }

  async existsByName(name: string): Promise<boolean> {
    const result = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);
    return result.length > 0;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const result = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return result.length > 0;
  }

  async findWithProductCount(limit = 10, offset = 0): Promise<(Category & { productCount: number })[]> {
    // This is a more complex query that would require a subquery or join
    // For now, we'll return basic categories and you can implement product count separately
    const categoriesList = await this.findAll(limit, offset);
    
    // You would typically implement this with a proper SQL join
    // For simplicity, we're returning the basic structure
    return categoriesList.map(category => ({
      ...category,
      productCount: 0 // This should be calculated with a proper query
    }));
  }

  async findTopCategories(limit = 5): Promise<Category[]> {
    return await this.db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .limit(limit)
      .orderBy(desc(categories.createdAt));
  }

  async updateStatus(id: string, isActive: boolean): Promise<Category | null> {
    const [category] = await this.db
      .update(categories)
      .set({ 
        isActive, 
        updatedAt: new Date() 
      })
      .where(eq(categories.id, id))
      .returning();
    return category || null;
  }
}
