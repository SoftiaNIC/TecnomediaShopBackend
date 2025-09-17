import { pgTable, uuid, varchar, text, decimal, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Enum para roles de usuario
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'cliente']);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  role: userRoleEnum('role').default('cliente').notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  sku: varchar("sku", { length: 100 }).unique(),
  barcode: varchar("barcode", { length: 100 }),
  trackQuantity: boolean("track_quantity").default(true).notNull(),
  quantity: integer("quantity").default(0).notNull(),
  allowOutOfStockPurchases: boolean("allow_out_of_stock_purchases").default(false).notNull(),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  categoryId: uuid("category_id").references(() => categories.id),
  isActive: boolean("is_active").default(true).notNull(),
  isDigital: boolean("is_digital").default(false).notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
