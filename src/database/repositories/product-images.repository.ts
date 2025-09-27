import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc, asc } from 'drizzle-orm';
import { productImages } from '../schema';
import { DB_CONNECTION } from '../database.module';
import { ProductImage } from '../../products/domain/product-image.entity';

export type NewProductImage = typeof productImages.$inferInsert;
export type ProductImageRecord = typeof productImages.$inferSelect;

@Injectable()
export class ProductImagesRepository {
  constructor(@Inject(DB_CONNECTION) private db: NodePgDatabase) {}

  /**
   * Busca todas las imágenes de un producto específico
   */
  async findByProductId(productId: string): Promise<ProductImage[]> {
    const result = await this.db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.displayOrder), desc(productImages.createdAt));

    return result.map(record => this.mapToDomain(record));
  }

  /**
   * Busca una imagen por su ID
   */
  async findById(imageId: string): Promise<ProductImage | null> {
    const result = await this.db
      .select()
      .from(productImages)
      .where(eq(productImages.id, imageId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomain(result[0]);
  }

  /**
   * Busca la imagen principal de un producto
   */
  async findPrimaryByProductId(productId: string): Promise<ProductImage | null> {
    const result = await this.db
      .select()
      .from(productImages)
      .where(
        and(
          eq(productImages.productId, productId),
          eq(productImages.isPrimary, true)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomain(result[0]);
  }

  /**
   * Crea una nueva imagen de producto
   */
  async create(imageData: Omit<ProductImage, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductImage> {
    const newImage: NewProductImage = {
      productId: imageData.productId,
      url: imageData.url,
      imageData: imageData.imageData,
      altText: imageData.altText,
      title: imageData.title,
      isPrimary: imageData.isPrimary || false,
      displayOrder: imageData.displayOrder || 0,
      fileSize: imageData.fileSize,
      mimeType: imageData.mimeType,
      width: imageData.width,
      height: imageData.height,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db
      .insert(productImages)
      .values(newImage)
      .returning();

    return this.mapToDomain(result[0]);
  }

  /**
   * Crea múltiples imágenes de producto
   */
  async createMany(imagesData: Omit<ProductImage, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ProductImage[]> {
    const newImages: NewProductImage[] = imagesData.map(imageData => ({
      productId: imageData.productId,
      url: imageData.url,
      imageData: imageData.imageData,
      altText: imageData.altText,
      title: imageData.title,
      isPrimary: imageData.isPrimary || false,
      displayOrder: imageData.displayOrder || 0,
      fileSize: imageData.fileSize,
      mimeType: imageData.mimeType,
      width: imageData.width,
      height: imageData.height,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await this.db
      .insert(productImages)
      .values(newImages)
      .returning();

    return result.map(record => this.mapToDomain(record));
  }

  /**
   * Actualiza una imagen de producto
   */
  async update(imageId: string, updateData: Partial<Omit<ProductImage, 'id' | 'productId' | 'createdAt'>>): Promise<ProductImage> {
    const updateValues: Partial<NewProductImage> = {
      ...(updateData.url !== undefined && { url: updateData.url }),
      ...(updateData.imageData !== undefined && { imageData: updateData.imageData }),
      ...(updateData.altText !== undefined && { altText: updateData.altText }),
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.isPrimary !== undefined && { isPrimary: updateData.isPrimary }),
      ...(updateData.displayOrder !== undefined && { displayOrder: updateData.displayOrder }),
      ...(updateData.fileSize !== undefined && { fileSize: updateData.fileSize }),
      ...(updateData.mimeType !== undefined && { mimeType: updateData.mimeType }),
      ...(updateData.width !== undefined && { width: updateData.width }),
      ...(updateData.height !== undefined && { height: updateData.height }),
      updatedAt: new Date(),
    };

    const result = await this.db
      .update(productImages)
      .set(updateValues)
      .where(eq(productImages.id, imageId))
      .returning();

    if (result.length === 0) {
      throw new Error(`Product image with ID ${imageId} not found`);
    }

    return this.mapToDomain(result[0]);
  }

  /**
   * Elimina una imagen de producto
   */
  async delete(imageId: string): Promise<void> {
    const result = await this.db
      .delete(productImages)
      .where(eq(productImages.id, imageId))
      .returning({ id: productImages.id });

    if (result.length === 0) {
      throw new Error(`Product image with ID ${imageId} not found`);
    }
  }

  /**
   * Elimina todas las imágenes de un producto
   */
  async deleteByProductId(productId: string): Promise<void> {
    await this.db
      .delete(productImages)
      .where(eq(productImages.productId, productId));
  }

  /**
   * Establece una imagen como principal y desmarca las demás
   */
  async setPrimaryImage(productId: string, imageId: string): Promise<void> {
    // Primero, desmarcar todas las imágenes del producto como no principales
    await this.db
      .update(productImages)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(eq(productImages.productId, productId));

    // Luego, marcar la imagen específica como principal
    const result = await this.db
      .update(productImages)
      .set({ isPrimary: true, updatedAt: new Date() })
      .where(
        and(
          eq(productImages.id, imageId),
          eq(productImages.productId, productId)
        )
      )
      .returning({ id: productImages.id });

    if (result.length === 0) {
      throw new Error(`Product image with ID ${imageId} not found for product ${productId}`);
    }
  }

  /**
   * Actualiza el orden de visualización de las imágenes
   */
  async updateDisplayOrder(productId: string, imageOrders: { imageId: string; displayOrder: number }[]): Promise<void> {
    for (const { imageId, displayOrder } of imageOrders) {
      await this.db
        .update(productImages)
        .set({ displayOrder, updatedAt: new Date() })
        .where(
          and(
            eq(productImages.id, imageId),
            eq(productImages.productId, productId)
          )
        );
    }
  }

  /**
   * Cuenta el número de imágenes de un producto
   */
  async countByProductId(productId: string): Promise<number> {
    const result = await this.db
      .select({ count: productImages.id })
      .from(productImages)
      .where(eq(productImages.productId, productId));

    return result.length;
  }

  /**
   * Verifica si una imagen existe y pertenece a un producto específico
   */
  async exists(imageId: string, productId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: productImages.id })
      .from(productImages)
      .where(
        and(
          eq(productImages.id, imageId),
          eq(productImages.productId, productId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  /**
   * Mapea un registro de la base de datos a una entidad de dominio
   */
  private mapToDomain(record: ProductImageRecord): ProductImage {
    return {
      id: record.id,
      productId: record.productId,
      url: record.url || undefined,
      imageData: record.imageData || undefined,
      altText: record.altText || undefined,
      title: record.title || undefined,
      isPrimary: record.isPrimary,
      displayOrder: record.displayOrder,
      fileSize: record.fileSize || undefined,
      mimeType: record.mimeType || undefined,
      width: record.width || undefined,
      height: record.height || undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
