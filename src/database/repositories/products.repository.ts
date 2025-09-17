import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { products, categories } from '../schema';
import { DB_CONNECTION } from '../database.module';

export type NewProduct = typeof products.$inferInsert;
export type Product = typeof products.$inferSelect;

@Injectable()
export class ProductsRepository {
  constructor(@Inject(DB_CONNECTION) private db: NodePgDatabase) {}

  async create(productData: NewProduct): Promise<Product> {
    const [product] = await this.db.insert(products).values(productData).returning();
    return product;
  }

  async findById(id: string): Promise<Product | null> {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return product || null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    return product || null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.sku, sku))
      .limit(1);
    return product || null;
  }

  async findAll(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<Product[]> {
    const orderBy = sortOrder === 'desc' ? desc(products[sortBy]) : asc(products[sortBy]);
    
    return await this.db
      .select()
      .from(products)
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy);
  }

  async findByCategory(categoryId: string, limit = 10, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(
        or(
          like(products.name, `%${searchTerm}%`),
          like(products.description, `%${searchTerm}%`),
          like(products.sku, `%${searchTerm}%`),
          like(products.slug, `%${searchTerm}%`)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));
  }

  async findActive(limit = 10, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));
  }

  async findInStock(limit = 10, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          eq(products.trackQuantity, true),
          eq(products.allowOutOfStockPurchases, false),
          eq(products.quantity, 0)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));
  }

  async findDigital(limit = 10, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(eq(products.isDigital, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));
  }

  async update(id: string, productData: Partial<NewProduct>): Promise<Product | null> {
    const [product] = await this.db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(products)
      .where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: products.id })
      .from(products);
    return result.length;
  }

  async countByCategory(categoryId: string): Promise<number> {
    const result = await this.db
      .select({ count: products.id })
      .from(products)
      .where(eq(products.categoryId, categoryId));
    return result.length;
  }

  async countActive(): Promise<number> {
    const result = await this.db
      .select({ count: products.id })
      .from(products)
      .where(eq(products.isActive, true));
    return result.length;
  }

  async countInStock(): Promise<number> {
    const result = await this.db
      .select({ count: products.id })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          eq(products.trackQuantity, true),
          eq(products.allowOutOfStockPurchases, false),
          eq(products.quantity, 0)
        )
      );
    return result.length;
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    const [product] = await this.db
      .update(products)
      .set({ 
        quantity, 
        updatedAt: new Date() 
      })
      .where(eq(products.id, id))
      .returning();
    return product || null;
  }

  async findLowStock(threshold: number = 10, limit = 10, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          eq(products.trackQuantity, true),
          eq(products.quantity, threshold)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(asc(products.quantity));
  }
}
