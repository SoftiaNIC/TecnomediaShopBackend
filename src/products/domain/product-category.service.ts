import { Injectable, Inject } from '@nestjs/common';
import type { IProductCategoryRepository } from './product-category.repository';
import type { IProductRepository } from './product.repository';

const PRODUCT_CATEGORY_REPOSITORY_TOKEN = 'PRODUCT_CATEGORY_REPOSITORY_TOKEN';
const PRODUCT_REPOSITORY_TOKEN = 'PRODUCT_REPOSITORY_TOKEN';

@Injectable()
export class ProductCategoryDomainService {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY_TOKEN)
    private readonly productCategoryRepository: IProductCategoryRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Asigna múltiples categorías a un producto
   */
  async assignCategoriesToProduct(
    productId: string,
    categoryIds: string[],
    primaryCategoryId?: string,
    displayOrders?: Record<string, number>
  ): Promise<void> {
    // Validar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Validar que hay categorías para asignar
    if (!categoryIds || categoryIds.length === 0) {
      throw new Error('At least one category must be provided');
    }

    // Si se especifica una categoría principal, validar que esté en la lista
    if (primaryCategoryId && !categoryIds.includes(primaryCategoryId)) {
      throw new Error('Primary category must be included in the category list');
    }

    // Validar que las categorías existen (esto requeriría un repositorio de categorías)
    // Por ahora, asumimos que las categorías existen si se proporcionan IDs válidos

    // Obtener el máximo display order actual si no se proporcionan órdenes
    let maxOrder = 0;
    if (!displayOrders) {
      maxOrder = await this.productCategoryRepository.getMaxDisplayOrder(productId);
    }

    // Preparar los display orders
    const finalDisplayOrders: Record<string, number> = {};
    categoryIds.forEach((categoryId, index) => {
      finalDisplayOrders[categoryId] = displayOrders?.[categoryId] ?? maxOrder + index;
    });

    // Asignar las categorías
    await this.productCategoryRepository.assignCategoriesToProduct(
      productId,
      categoryIds,
      primaryCategoryId,
      finalDisplayOrders
    );
  }

  /**
   * Remueve categorías específicas de un producto
   */
  async removeCategoriesFromProduct(productId: string, categoryIds: string[]): Promise<void> {
    // Validar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Validar que hay categorías para remover
    if (!categoryIds || categoryIds.length === 0) {
      throw new Error('At least one category must be provided');
    }

    // Obtener las categorías actuales del producto
    const currentCategories = await this.productCategoryRepository.findProductCategories(productId);
    
    // Validar que todas las categorías a remover están asignadas
    const currentCategoryIds = currentCategories.map(pc => pc.categoryId);
    const invalidCategories = categoryIds.filter(id => !currentCategoryIds.includes(id));
    if (invalidCategories.length > 0) {
      throw new Error(`Some categories are not assigned to the product: ${invalidCategories.join(', ')}`);
    }

    // Verificar si se está intentando remover la categoría principal
    const primaryCategory = currentCategories.find(pc => pc.isPrimary);
    if (primaryCategory && categoryIds.includes(primaryCategory.categoryId)) {
      const remainingCategories = currentCategories.filter(pc => !categoryIds.includes(pc.categoryId));
      if (remainingCategories.length > 0) {
        // Si quedan otras categorías, no permitir remover la principal sin asignar una nueva
        throw new Error('Cannot remove primary category without assigning a new one first');
      }
    }

    // Remover las categorías
    await this.productCategoryRepository.removeCategoriesFromProduct(productId, categoryIds);
  }

  /**
   * Actualiza el orden y estado de una categoría específica
   */
  async updateCategoryOrder(
    productId: string,
    categoryId: string,
    displayOrder: number,
    isPrimary?: boolean
  ): Promise<void> {
    // Validar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Validar que la categoría está asignada al producto
    const isAssigned = await this.productCategoryRepository.isCategoryAssignedToProduct(productId, categoryId);
    if (!isAssigned) {
      throw new Error('Category is not assigned to this product');
    }

    // Si se quiere establecer como principal, validar que no haya ya una principal
    if (isPrimary) {
      const currentPrimary = await this.productCategoryRepository.findPrimaryCategory(productId);
      if (currentPrimary && currentPrimary.categoryId !== categoryId) {
        // Remover el estado principal de la categoría actual
        await this.productCategoryRepository.updateCategoryOrder(
          productId,
          currentPrimary.categoryId,
          currentPrimary.displayOrder,
          false
        );
      }
    }

    // Actualizar el orden y estado
    await this.productCategoryRepository.updateCategoryOrder(productId, categoryId, displayOrder, isPrimary);
  }

  /**
   * Establece una categoría como principal
   */
  async setPrimaryCategory(productId: string, categoryId: string): Promise<void> {
    // Validar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Validar que la categoría está asignada al producto
    const isAssigned = await this.productCategoryRepository.isCategoryAssignedToProduct(productId, categoryId);
    if (!isAssigned) {
      throw new Error('Category is not assigned to this product');
    }

    // Establecer como principal
    await this.productCategoryRepository.setPrimaryCategory(productId, categoryId);
  }

  /**
   * Obtiene todas las categorías de un producto
   */
  async getProductCategories(productId: string): Promise<any[]> {
    // Validar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return await this.productCategoryRepository.findProductCategories(productId);
  }

  /**
   * Obtiene la categoría principal de un producto
   */
  async getPrimaryCategory(productId: string): Promise<any | null> {
    // Validar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return await this.productCategoryRepository.findPrimaryCategory(productId);
  }

  /**
   * Verifica si un producto tiene categoría principal
   */
  async hasPrimaryCategory(productId: string): Promise<boolean> {
    return await this.productCategoryRepository.hasPrimaryCategory(productId);
  }
}
