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
  isFeatured: boolean("is_featured").default(false).notNull(),
  isDigital: boolean("is_digital").default(false).notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de relación producto-categorías (muchos a muchos)
export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").default(false).notNull(), // Indica si es la categoría principal
  displayOrder: integer("display_order").default(0).notNull(), // Orden de visualización
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de imágenes de productos
export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 1000 }), // URL externa de la imagen
  imageData: text("image_data"), // Datos binarios de la imagen en base64
  altText: varchar("alt_text", { length: 255 }),
  title: varchar("title", { length: 255 }),
  isPrimary: boolean("is_primary").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  fileSize: integer("file_size"), // Tamaño en bytes
  mimeType: varchar("mime_type", { length: 100 }), // image/jpeg, image/png, etc.
  width: integer("width"), // Ancho en píxeles
  height: integer("height"), // Alto en píxeles
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
