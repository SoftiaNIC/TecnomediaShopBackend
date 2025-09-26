import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ProductDomainService } from './domain/product.service';
import { ProductRepositoryAdapter } from './domain/product.repository';
import { ProductCategoryDomainService } from './domain/product-category.service';
import { ProductCategoryRepositoryAdapter } from './domain/product-category.repository';
import { Product, CreateProductCommand, UpdateProductCommand, ProductStatus } from './domain/product.entity';
import { ProductMapper } from './mapper/product.mapper';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  UpdateProductStockDto,
  UpdateProductStatusDto,
  UpdateProductPriceDto,
  UpdateProductFeaturedDto,
  AssignCategoryDto,
  RemoveCategoryDto,
  UpdateCategoryOrderDto
} from './dto';
import { 
  ProductResponseDto, 
  ProductsListResponseDto, 
  ProductsWithStatsResponseDto,
  ProductsByCategoryResponseDto,
  DeleteProductResponseDto,
  StockUpdateResponseDto,
  PriceUpdateResponseDto,
  ProductSearchResponseDto,
  SlugGenerationResponseDto
} from './dto/response.dto';
import { 
  CategoryAssignmentResponse,
  CategoryRemovalResponse,
  CategoryOrderUpdateResponse,
  ProductCategoriesResponse
} from './dto/category-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productDomainService: ProductDomainService,
    private readonly productRepository: ProductRepositoryAdapter,
    private readonly productMapper: ProductMapper,
    private readonly productCategoryDomainService: ProductCategoryDomainService,
    private readonly productCategoryRepository: ProductCategoryRepositoryAdapter,
  ) {}

  // Métodos originales (mantenidos para compatibilidad)
  async create(productData: CreateProductCommand): Promise<Product> {
    return await this.productDomainService.createProduct(productData);
  }

  async findById(id: string): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return await this.productRepository.findBySlug(slug);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return await this.productRepository.findBySku(sku);
  }

  async findAll(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<Product[]> {
    return await this.productRepository.findAll(limit, offset, sortBy, sortOrder);
  }

  async findByCategory(categoryId: string, limit = 10, offset = 0): Promise<Product[]> {
    return await this.productDomainService.findProductsByCategory(categoryId, limit, offset);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<Product[]> {
    return await this.productRepository.search(searchTerm, limit, offset);
  }

  async update(id: string, productData: UpdateProductCommand): Promise<Product | null> {
    return await this.productDomainService.updateProduct(id, productData);
  }

  async delete(id: string): Promise<boolean> {
    return await this.productRepository.delete(id);
  }

  async findActive(limit = 10, offset = 0): Promise<Product[]> {
    return await this.productRepository.findActiveProducts(limit, offset);
  }

  async findLowStock(threshold = 10, limit = 50): Promise<Product[]> {
    return await this.productDomainService.findLowStockProducts(threshold, limit);
  }

  async findOutOfStock(limit = 50): Promise<Product[]> {
    return await this.productDomainService.findOutOfStockProducts(limit);
  }

  async count(): Promise<number> {
    return await this.productRepository.count();
  }

  async countByCategory(categoryId: string): Promise<number> {
    return await this.productRepository.countByCategory(categoryId);
  }

  async countActive(): Promise<number> {
    return await this.productRepository.countActive();
  }

  async activateProduct(id: string): Promise<Product | null> {
    return await this.productDomainService.activateProduct(id);
  }

  async deactivateProduct(id: string): Promise<Product | null> {
    return await this.productDomainService.deactivateProduct(id);
  }

  async getProductStatus(id: string): Promise<ProductStatus> {
    return await this.productDomainService.getProductStatus(id);
  }

  async updateProductPrice(id: string, newPrice: number): Promise<Product | null> {
    return await this.productDomainService.updateProductPrice(id, newPrice);
  }

  async updateProductQuantity(id: string, quantityChange: number): Promise<Product | null> {
    return await this.productDomainService.updateProductQuantity(id, quantityChange);
  }

  async checkProductAvailability(id: string, requestedQuantity: number = 1): Promise<boolean> {
    return await this.productDomainService.checkProductAvailability(id, requestedQuantity);
  }

  async findInStock(limit = 10, offset = 0): Promise<Product[]> {
    return await this.productRepository.findInStock(limit, offset);
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    return await this.productRepository.updateStock(id, quantity);
  }

  // Métodos RESTless con respuestas enriquecidas
  async createWithResponse(productData: CreateProductDto): Promise<ProductResponseDto> {
    const createCommand = this.productMapper.toCreateCommand(productData);
    const product = await this.create(createCommand);
    
    return {
      success: true,
      message: `El producto "${product.name}" ha sido creado exitosamente`,
      data: product,
      meta: {
        createdAt: product.createdAt,
        slug: product.slug,
        sku: product.sku,
        stockStatus: product.quantity > 0 ? 'in_stock' : 'out_of_stock',
        priceStatus: product.discountedPrice && product.discountedPrice < product.price ? 'has_discount' : 'regular_price'
      },
    };
  }

  async findAllWithResponse(
    limit = 10, 
    offset = 0, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    filters?: Record<string, any>
  ): Promise<ProductsListResponseDto> {
    const products = await this.findAll(limit, offset, sortBy, sortOrder);
    const total = await this.count();
    const count = products.length;
    
    const hasNext = (offset + limit) < total;
    const hasPrevious = offset > 0;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos de un total de ${total}` 
        : 'No se encontraron productos en el sistema',
      data: products,
      meta: {
        total,
        count,
        limit,
        offset,
        hasNext,
        hasPrevious,
        filters: filters || {
          category: null,
          minPrice: null,
          maxPrice: null,
          inStock: null,
          isActive: true
        }
      },
    };
  }

  async findActiveWithResponse(limit = 10, offset = 0): Promise<ProductsListResponseDto> {
    const products = await this.findActive(limit, offset);
    const total = await this.countActive();
    const count = products.length;
    
    const hasNext = (offset + limit) < total;
    const hasPrevious = offset > 0;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos activos de un total de ${total}` 
        : 'No hay productos activos disponibles en este momento',
      data: products,
      meta: {
        total,
        count,
        limit,
        offset,
        hasNext,
        hasPrevious,
        filters: {
          isActive: true
        }
      },
    };
  }

  async findInStockWithResponse(limit = 10, offset = 0): Promise<ProductsListResponseDto> {
    const products = await this.findInStock(limit, offset);
    const count = products.length;
    
    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos disponibles en stock` 
        : 'No hay productos disponibles en stock en este momento',
      data: products,
      meta: {
        total: count, // Para productos en stock, el total es lo que encontramos
        count,
        limit,
        offset,
        hasNext: false,
        hasPrevious: offset > 0,
        filters: {
          inStock: true
        }
      },
    };
  }

  async findByCategoryWithResponse(
    categoryId: string, 
    limit = 10, 
    offset = 0
  ): Promise<ProductsByCategoryResponseDto> {
    const products = await this.findByCategory(categoryId, limit, offset);
    const total = await this.countByCategory(categoryId);
    const count = products.length;
    
    const hasNext = (offset + limit) < total;
    const hasPrevious = offset > 0;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos en esta categoría de un total de ${total}` 
        : 'No hay productos disponibles en esta categoría',
      data: products,
      meta: {
        categoryId,
        categoryName: products[0]?.categoryName || 'Categoría desconocida',
        total,
        count,
        limit,
        offset,
        hasNext,
        hasPrevious,
      },
    };
  }

  async searchWithResponse(
    searchTerm: string, 
    limit = 10, 
    offset = 0
  ): Promise<ProductSearchResponseDto> {
    const startTime = Date.now();
    const products = await this.search(searchTerm, limit, offset);
    const searchTime = Date.now() - startTime;
    const count = products.length;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos que coinciden con "${searchTerm}"` 
        : `No se encontraron productos que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`,
      data: products,
      meta: {
        searchTerm,
        total: count,
        count,
        limit,
        offset,
        hasNext: false,
        hasPrevious: offset > 0,
        searchTime,
        suggestions: count === 0 ? await this.getSearchSuggestions(searchTerm) : undefined
      },
    };
  }

  async updateWithResponse(id: string, productData: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.update(id, productData as UpdateProductCommand);
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    
    return {
      success: true,
      message: `El producto "${product.name}" ha sido actualizado exitosamente`,
      data: product,
      meta: {
        updatedAt: product.updatedAt,
        fieldsUpdated: Object.keys(productData),
        stockStatus: product.quantity > 0 ? 'in_stock' : 'out_of_stock'
      },
    };
  }

  async deleteWithResponse(id: string): Promise<DeleteProductResponseDto> {
    // Obtener el producto antes de eliminarlo para el mensaje
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const success = await this.delete(id);
    
    return {
      success,
      message: `El producto "${product.name}" ha sido eliminado exitosamente del sistema`,
      meta: {
        deletedId: id,
        deletedAt: new Date(),
        productName: product.name,
        hadOrders: false // TODO: Implementar verificación de órdenes asociadas
      },
    };
  }

  async updateStockWithResponse(id: string, stockData: UpdateProductStockDto): Promise<StockUpdateResponseDto> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const previousQuantity = product.quantity;
    let newQuantity: number;

    if (stockData.isRelative) {
      newQuantity = previousQuantity + stockData.quantity;
    } else {
      newQuantity = stockData.quantity;
    }

    const updatedProduct = await this.updateStock(id, newQuantity);
    
    if (!updatedProduct) {
      throw new NotFoundException('Error al actualizar el stock del producto');
    }

    return {
      success: true,
      message: `El stock del producto "${updatedProduct.name}" ha sido actualizado exitosamente`,
      data: updatedProduct,
      meta: {
        previousQuantity,
        newQuantity,
        difference: newQuantity - previousQuantity,
        adjustmentType: stockData.isRelative ? 'relative' : 'absolute',
        adjustedAt: new Date(),
        notes: stockData.notes
      },
    };
  }

  async updateStatusWithResponse(id: string, statusData: UpdateProductStatusDto): Promise<ProductResponseDto> {
    let updatedProduct: Product | null;
    
    if (statusData.isActive) {
      updatedProduct = await this.activateProduct(id);
    } else {
      updatedProduct = await this.deactivateProduct(id);
    }
    
    if (!updatedProduct) {
      throw new NotFoundException('Error al actualizar el estado del producto');
    }

    return {
      success: true,
      message: `El estado del producto "${updatedProduct.name}" ha sido ${statusData.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: updatedProduct,
      meta: {
        previousStatus: !statusData.isActive,
        newStatus: statusData.isActive,
        updatedAt: updatedProduct.updatedAt,
        reason: statusData.reason
      },
    };
  }

  async updatePriceWithResponse(id: string, priceData: UpdateProductPriceDto): Promise<PriceUpdateResponseDto> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const previousPrice = product.price;
    const updatedProduct = await this.updateProductPrice(id, priceData.price);
    
    if (!updatedProduct) {
      throw new NotFoundException('Error al actualizar el precio del producto');
    }

    // Actualizar precio de descuento si se proporciona
    if (priceData.discountedPrice !== undefined) {
      updatedProduct.discountedPrice = priceData.discountedPrice;
    }

    const percentageChange = ((updatedProduct.price - previousPrice) / previousPrice) * 100;

    return {
      success: true,
      message: `El precio del producto "${updatedProduct.name}" ha sido actualizado exitosamente`,
      data: updatedProduct,
      meta: {
        previousPrice,
        newPrice: updatedProduct.price,
        difference: updatedProduct.price - previousPrice,
        percentageChange,
        updatedAt: updatedProduct.updatedAt,
        hasDiscount: priceData.hasDiscount || false,
        reason: priceData.reason
      },
    };
  }

  async findByIdWithResponse(id: string): Promise<ProductResponseDto> {
    const product = await this.findById(id);
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    
    return {
      success: true,
      message: `Producto "${product.name}" encontrado exitosamente`,
      data: product,
      meta: {
        id: product.id,
        status: product.isActive ? 'Activo' : 'Inactivo',
        stockStatus: product.quantity > 0 ? 'En stock' : 'Sin stock',
        priceStatus: product.discountedPrice && product.discountedPrice < product.price ? 'Con descuento' : 'Precio regular'
      },
    };
  }

  async findBySlugWithResponse(slug: string): Promise<ProductResponseDto> {
    const product = await this.findBySlug(slug);
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    
    return {
      success: true,
      message: `Producto con slug "${slug}" encontrado exitosamente`,
      data: product,
      meta: {
        slug: product.slug,
        status: product.isActive ? 'Activo' : 'Inactivo',
        stockStatus: product.quantity > 0 ? 'En stock' : 'Sin stock'
      },
    };
  }

  async findLowStockWithResponse(threshold = 10, limit = 50): Promise<ProductsListResponseDto> {
    const products = await this.findLowStock(threshold, limit);
    const count = products.length;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos con stock bajo (menos de ${threshold} unidades)` 
        : `No hay productos con stock bajo por debajo del umbral de ${threshold} unidades`,
      data: products,
      meta: {
        total: count,
        count,
        limit,
        offset: 0,
        hasNext: false,
        hasPrevious: false,
        filters: {
          lowStock: true,
          threshold
        }
      },
    };
  }

  async findOutOfStockWithResponse(limit = 50): Promise<ProductsListResponseDto> {
    const products = await this.findOutOfStock(limit);
    const count = products.length;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos sin stock` 
        : 'No hay productos sin stock en este momento',
      data: products,
      meta: {
        total: count,
        count,
        limit,
        offset: 0,
        hasNext: false,
        hasPrevious: false,
        filters: {
          outOfStock: true
        }
      },
    };
  }

  // Métodos adicionales para endpoints especializados
  async findFeaturedWithResponse(limit = 10): Promise<ProductsListResponseDto> {
    const products = await this.productDomainService.findFeaturedProducts(limit);
    const total = await this.productDomainService.countFeaturedProducts();
    const count = products.length;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos destacados de un total de ${total}` 
        : 'No hay productos destacados disponibles',
      data: products,
      meta: {
        total,
        count,
        limit,
        offset: 0,
        hasNext: total > limit,
        hasPrevious: false,
        filters: {
          featured: true
        }
      },
    };
  }

  async findDiscountedWithResponse(limit = 10): Promise<ProductsListResponseDto> {
    // TODO: Implementar lógica para productos con descuento
    const products = await this.findActive(limit, 0);
    const discountedProducts = products.filter(p => p.discountedPrice && p.discountedPrice < p.price);
    const count = discountedProducts.length;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos con descuento` 
        : 'No hay productos con descuento disponibles',
      data: discountedProducts,
      meta: {
        total: count,
        count,
        limit,
        offset: 0,
        hasNext: false,
        hasPrevious: false,
        filters: {
          hasDiscount: true
        }
      },
    };
  }

  async findByPriceRangeWithResponse(
    minPrice: number, 
    maxPrice: number, 
    limit = 10, 
    offset = 0
  ): Promise<ProductsListResponseDto> {
    // TODO: Implementar lógica para búsqueda por rango de precio
    const products = await this.findAll(limit, offset, 'price', 'asc');
    const filteredProducts = products.filter(p => p.price >= minPrice && p.price <= maxPrice);
    const count = filteredProducts.length;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} productos en el rango de precio $${minPrice} - $${maxPrice}` 
        : `No hay productos en el rango de precio $${minPrice} - $${maxPrice}`,
      data: filteredProducts,
      meta: {
        total: count,
        count,
        limit,
        offset,
        hasNext: false,
        hasPrevious: offset > 0,
        filters: {
          minPrice,
          maxPrice
        }
      },
    };
  }

  async generateSlugWithResponse(name: string): Promise<SlugGenerationResponseDto> {
    // TODO: Implementar generación de slug similar al de categorías
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    let slug = baseSlug;
    let counter = 1;

    // Si el slug ya existe, agregar un número al final
    while (await this.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const isUnique = baseSlug === slug;

    return {
      success: true,
      message: isUnique 
        ? `Slug generado exitosamente: "${slug}"` 
        : `Slug generado con modificación para garantizar unicidad: "${slug}"`,
      data: {
        originalName: name,
        generatedSlug: slug,
        isUnique,
        suggestions: isUnique ? undefined : [`${baseSlug}-alt`, `${baseSlug}-v2`]
      },
    };
  }

  // Método auxiliar para sugerencias de búsqueda
  private async getSearchSuggestions(searchTerm: string): Promise<string[]> {
    // TODO: Implementar lógica para generar sugerencias de búsqueda
    // Por ahora, retornar algunas sugerencias genéricas
    return [
      `${searchTerm} premium`,
      `${searchTerm} pro`,
      `${searchTerm} plus`,
      `mejor ${searchTerm}`,
      `${searchTerm} economico`
    ];
  }

  // Métodos adicionales para endpoints especializados
  async findNewArrivalsWithResponse(days: number = 30, limit: number = 10): Promise<ProductsListResponseDto> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const products = await this.productRepository.findNewArrivals(cutoffDate, limit);
    const total = await this.productRepository.countNewArrivals(cutoffDate);
    
    return {
      success: true,
      message: `Se encontraron ${products.length} productos nuevos de los últimos ${days} días`,
      data: products,
      meta: {
        total,
        count: products.length,
        limit,
        offset: 0,
        hasNext: total > limit,
        hasPrevious: false
      }
    };
  }

  async findBestsellersWithResponse(limit: number = 10): Promise<ProductsListResponseDto> {
    // TODO: Implementar lógica de bestsellers (podría basarse en número de órdenes)
    // Por ahora, retornar productos activos ordenados por cantidad vendida (simulado)
    const products = await this.productRepository.findBestsellers(limit);
    const total = await this.productRepository.countBestsellers();
    
    return {
      success: true,
      message: `Se encontraron ${products.length} productos más vendidos`,
      data: products,
      meta: {
        total,
        count: products.length,
        limit,
        offset: 0,
        hasNext: total > limit,
        hasPrevious: false
      }
    };
  }

  async getProductStatsWithResponse(): Promise<ProductsWithStatsResponseDto> {
    const totalProducts = await this.count();
    const activeProducts = await this.countActive();
    const inStockProducts = await this.productRepository.countInStock();
    const outOfStockProducts = await this.productRepository.countOutOfStock();
    const totalValue = await this.productRepository.calculateTotalInventoryValue();
    const averagePrice = await this.productRepository.calculateAveragePrice();
    
    const products = await this.findAll(10, 0, 'createdAt', 'desc');
    
    return {
      success: true,
      message: 'Estadísticas de productos obtenidas exitosamente',
      data: products.map(product => ({
        ...product,
        categoryCount: 1, // TODO: Implementar conteo real por categoría
        totalReviews: 0, // TODO: Implementar cuando se tenga el módulo de reviews
        averageRating: 0, // TODO: Implementar cuando se tenga el módulo de reviews
        timesOrdered: 0 // TODO: Implementar cuando se tenga el módulo de órdenes
      })),
      meta: {
        total: totalProducts,
        count: products.length,
        limit: 10,
        offset: 0,
        hasNext: totalProducts > 10,
        hasPrevious: false,
        stats: {
          totalProducts,
          totalValue,
          averagePrice,
          inStockCount: inStockProducts,
          outOfStockCount: outOfStockProducts
        }
      }
    };
  }

  // Métodos para gestión de productos destacados
  async setProductAsFeatured(id: string, featuredData: UpdateProductFeaturedDto): Promise<ProductResponseDto> {
    try {
      const product = await this.productDomainService.setProductAsFeatured(id, featuredData.reason);
      
      if (!product) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      return {
        success: true,
        message: `Producto marcado como destacado exitosamente${featuredData.reason ? `: ${featuredData.reason}` : ''}`,
        data: product
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException(`No se pudo marcar el producto como destacado: ${error.message}`);
    }
  }

  async removeProductFromFeatured(id: string, featuredData?: UpdateProductFeaturedDto): Promise<ProductResponseDto> {
    try {
      const product = await this.productDomainService.removeProductFromFeatured(id, featuredData?.reason);
      
      if (!product) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      return {
        success: true,
        message: `Producto removido de destacados exitosamente${featuredData?.reason ? `: ${featuredData.reason}` : ''}`,
        data: product
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException(`No se pudo remover el producto de destacados: ${error.message}`);
    }
  }

  // Métodos para manejo de categorías de productos
  async assignCategoriesToProduct(productId: string, assignCategoryDto: AssignCategoryDto): Promise<CategoryAssignmentResponse> {
    try {
      await this.productCategoryDomainService.assignCategoriesToProduct(
        productId,
        assignCategoryDto.categoryIds,
        assignCategoryDto.primaryCategoryId,
        assignCategoryDto.displayOrders
      );

      return {
        success: true,
        message: 'Categorías asignadas exitosamente al producto',
        productId,
        assignedCategoryIds: assignCategoryDto.categoryIds,
        primaryCategoryId: assignCategoryDto.primaryCategoryId
      };
    } catch (error) {
      throw new ConflictException(`No se pudieron asignar las categorías: ${error.message}`);
    }
  }

  async getProductCategories(productId: string): Promise<ProductCategoriesResponse> {
    try {
      const categories = await this.productCategoryDomainService.getProductCategories(productId);
      // Transformar las categorías al formato esperado por ProductCategoryInfo
      const categoryInfos = categories.map(cat => ({
        id: cat.categoryId,
        name: cat.categoryName || '',
        slug: cat.categorySlug || '',
        isPrimary: cat.isPrimary,
        displayOrder: cat.displayOrder,
        isActive: cat.categoryIsActive ?? true
      }));

      return {
        success: true,
        message: 'Categorías del producto obtenidas exitosamente',
        productId,
        categories: categoryInfos
      };
    } catch (error) {
      throw new ConflictException(`No se pudieron obtener las categorías: ${error.message}`);
    }
  }

  async updateCategoryOrder(productId: string, updateCategoryOrderDto: UpdateCategoryOrderDto): Promise<CategoryOrderUpdateResponse> {
    try {
      await this.productCategoryDomainService.updateCategoryOrder(
        productId,
        updateCategoryOrderDto.categoryId,
        updateCategoryOrderDto.displayOrder,
        updateCategoryOrderDto.isPrimary
      );

      return {
        success: true,
        message: 'Orden de categoría actualizado exitosamente',
        productId,
        categoryId: updateCategoryOrderDto.categoryId,
        newDisplayOrder: updateCategoryOrderDto.displayOrder,
        isNowPrimary: updateCategoryOrderDto.isPrimary
      };
    } catch (error) {
      throw new ConflictException(`No se pudo actualizar el orden de la categoría: ${error.message}`);
    }
  }

  async removeCategoriesFromProduct(productId: string, removeCategoryDto: RemoveCategoryDto): Promise<CategoryRemovalResponse> {
    try {
      // Obtener categorías actuales antes de remover
      const currentCategories = await this.productCategoryDomainService.getProductCategories(productId);
      const currentCount = currentCategories.length;
      
      await this.productCategoryDomainService.removeCategoriesFromProduct(
        productId,
        removeCategoryDto.categoryIds
      );

      const remainingCount = currentCount - removeCategoryDto.categoryIds.length;

      return {
        success: true,
        message: 'Categorías removidas exitosamente del producto',
        productId,
        removedCategoryIds: removeCategoryDto.categoryIds,
        remainingCategoriesCount: Math.max(0, remainingCount)
      };
    } catch (error) {
      throw new ConflictException(`No se pudieron remover las categorías: ${error.message}`);
    }
  }
}
