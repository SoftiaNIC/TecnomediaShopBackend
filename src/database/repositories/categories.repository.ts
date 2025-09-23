import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, like, or, desc, asc, count } from 'drizzle-orm';
import { categories, products } from '../schema';
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
    const [result] = await this.db
      .select({ count: count(categories.id) })
      .from(categories);
    return result.count;
  }

  async countActive(): Promise<number> {
    const [result] = await this.db
      .select({ count: count(categories.id) })
      .from(categories)
      .where(eq(categories.isActive, true));
    return result.count;
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
    const result = await this.db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        slug: categories.slug,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(
        categories.id,
        categories.name,
        categories.description,
        categories.slug,
        categories.isActive,
        categories.createdAt,
        categories.updatedAt
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(categories.createdAt));

    return result.map(row => ({
      ...row,
      productCount: row.productCount || 0,
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

  async countProductsByCategory(categoryId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count(products.id) })
      .from(products)
      .where(eq(products.categoryId, categoryId));
    return result.count;
  }
}
