import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesRepository, NewCategory, Category } from '../database/repositories';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { CategorySlug } from './domain/category.entity';
import { 
  CategoriesListResponseDto, 
  CategoriesWithCountResponseDto, 
  CategoryResponseDto, 
  DeleteResponseDto, 
  SlugGenerationResponseDto 
} from './dto/response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(categoryData: CreateCategoryDto): Promise<Category> {
    // Validar que el nombre no exista
    const existingByName = await this.categoriesRepository.existsByName(categoryData.name);
    if (existingByName) {
      throw new ConflictException('Ya existe una categoría con este nombre');
    }

    // Validar que el slug no exista
    const existingBySlug = await this.categoriesRepository.existsBySlug(categoryData.slug);
    if (existingBySlug) {
      throw new ConflictException('Ya existe una categoría con este slug');
    }

    const newCategory: NewCategory = {
      ...categoryData,
      isActive: categoryData.isActive ?? true,
    };

    return await this.categoriesRepository.create(newCategory);
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async findAll(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<Category[]> {
    return await this.categoriesRepository.findAll(limit, offset, sortBy, sortOrder);
  }

  async search(searchTerm: string, limit = 10, offset = 0): Promise<Category[]> {
    return await this.categoriesRepository.search(searchTerm, limit, offset);
  }

  async findActive(limit = 10, offset = 0): Promise<Category[]> {
    return await this.categoriesRepository.findActive(limit, offset);
  }

  async update(id: string, categoryData: UpdateCategoryDto): Promise<Category> {
    // Verificar que la categoría existe
    const existingCategory = await this.categoriesRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (categoryData.name && categoryData.name !== existingCategory.name) {
      const existingByName = await this.categoriesRepository.existsByName(categoryData.name);
      if (existingByName) {
        throw new ConflictException('Ya existe una categoría con este nombre');
      }
    }

    // Si se está actualizando el slug, verificar que no exista otro con el mismo slug
    if (categoryData.slug && categoryData.slug !== existingCategory.slug) {
      const existingBySlug = await this.categoriesRepository.existsBySlug(categoryData.slug);
      if (existingBySlug) {
        throw new ConflictException('Ya existe una categoría con este slug');
      }
    }

    const updatedCategory = await this.categoriesRepository.update(id, categoryData);
    if (!updatedCategory) {
      throw new NotFoundException('Error al actualizar la categoría');
    }

    return updatedCategory;
  }

  async delete(id: string): Promise<boolean> {
    // Verificar que la categoría existe
    const existingCategory = await this.categoriesRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // TODO: Verificar que no tenga productos asociados antes de eliminar
    // const productCount = await this.categoriesRepository.countByCategory(id);
    // if (productCount > 0) {
    //   throw new ConflictException('No se puede eliminar una categoría que tiene productos asociados');
    // }

    return await this.categoriesRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.categoriesRepository.count();
  }

  async countActive(): Promise<number> {
    return await this.categoriesRepository.countActive();
  }

  async existsByName(name: string): Promise<boolean> {
    return await this.categoriesRepository.existsByName(name);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return await this.categoriesRepository.existsBySlug(slug);
  }

  async findWithProductCount(limit = 10, offset = 0): Promise<(Category & { productCount: number })[]> {
    return await this.categoriesRepository.findWithProductCount(limit, offset);
  }

  async findTopCategories(limit = 5): Promise<Category[]> {
    return await this.categoriesRepository.findTopCategories(limit);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Category> {
    // Verificar que la categoría existe
    const existingCategory = await this.categoriesRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (existingCategory.isActive === isActive) {
      throw new ConflictException(`La categoría ya está ${isActive ? 'activa' : 'inactiva'}`);
    }

    const updatedCategory = await this.categoriesRepository.updateStatus(id, isActive);
    if (!updatedCategory) {
      throw new NotFoundException('Error al actualizar el estado de la categoría');
    }

    return updatedCategory;
  }

  async generateSlugFromName(name: string): Promise<string> {
    const baseSlug = CategorySlug.fromName(name);
    let slug = baseSlug.getValue();
    let counter = 1;

    // Si el slug ya existe, agregar un número al final
    while (await this.categoriesRepository.existsBySlug(slug)) {
      slug = `${baseSlug.getValue()}-${counter}`;
      counter++;
    }

    return slug;
  }

  async createWithAutoSlug(categoryData: Omit<CreateCategoryDto, 'slug'> & { slug?: string }): Promise<Category> {
    let slug = categoryData.slug;
    
    if (!slug) {
      slug = await this.generateSlugFromName(categoryData.name);
    }

    return await this.create({
      ...categoryData,
      slug,
    });
  }

  // Métodos con respuestas descriptivas
  async findAllWithResponse(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<CategoriesListResponseDto> {
    const categories = await this.findAll(limit, offset, sortBy, sortOrder);
    const total = await this.count();
    const count = categories.length;
    
    const hasNext = (offset + limit) < total;
    const hasPrevious = offset > 0;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} categorías de un total de ${total}` 
        : 'No se encontraron categorías en el sistema',
      data: categories,
      meta: {
        total,
        count,
        limit,
        offset,
        hasNext,
        hasPrevious,
      },
    };
  }

  async findActiveWithResponse(limit = 10, offset = 0): Promise<CategoriesListResponseDto> {
    const categories = await this.findActive(limit, offset);
    const total = await this.countActive();
    const count = categories.length;
    
    const hasNext = (offset + limit) < total;
    const hasPrevious = offset > 0;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} categorías activas de un total de ${total}` 
        : 'No hay categorías activas disponibles en este momento',
      data: categories,
      meta: {
        total,
        count,
        limit,
        offset,
        hasNext,
        hasPrevious,
      },
    };
  }

  async findWithProductCountResponse(limit = 10, offset = 0): Promise<CategoriesWithCountResponseDto> {
    const categories = await this.findWithProductCount(limit, offset);
    const total = await this.count();
    const count = categories.length;
    
    const hasNext = (offset + limit) < total;
    const hasPrevious = offset > 0;
    const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} categorías con un total de ${totalProducts} productos asociados` 
        : 'No hay categorías disponibles para mostrar',
      data: categories,
      meta: {
        total,
        count,
        limit,
        offset,
        hasNext,
        hasPrevious,
      },
    };
  }

  async searchWithResponse(searchTerm: string, limit = 10, offset = 0): Promise<CategoriesListResponseDto> {
    const categories = await this.search(searchTerm, limit, offset);
    const count = categories.length;

    return {
      success: true,
      message: count > 0 
        ? `Se encontraron ${count} categorías que coinciden con "${searchTerm}"` 
        : `No se encontraron categorías que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`,
      data: categories,
      meta: {
        total: count, // Para búsquedas, el total es lo que encontramos
        count,
        limit,
        offset,
        hasNext: false, // Las búsquedas no suelen tener paginación compleja
        hasPrevious: offset > 0,
      },
    };
  }

  async createWithResponse(categoryData: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.create(categoryData);
    
    return {
      success: true,
      message: `La categoría "${category.name}" ha sido creada exitosamente`,
      data: category,
      meta: {
        createdAt: category.createdAt,
        slug: category.slug,
      },
    };
  }

  async updateWithResponse(id: string, categoryData: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.update(id, categoryData);
    
    return {
      success: true,
      message: `La categoría "${category.name}" ha sido actualizada exitosamente`,
      data: category,
      meta: {
        updatedAt: category.updatedAt,
        fieldsUpdated: Object.keys(categoryData),
      },
    };
  }

  async deleteWithResponse(id: string): Promise<DeleteResponseDto> {
    // Obtener la categoría antes de eliminarla para el mensaje
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const success = await this.delete(id);
    
    return {
      success,
      message: `La categoría "${category.name}" ha sido eliminada exitosamente del sistema`,
      meta: {
        deletedId: id,
        deletedAt: new Date(),
      },
    };
  }

  async generateSlugWithResponse(name: string): Promise<SlugGenerationResponseDto> {
    const originalSlug = CategorySlug.fromName(name).getValue();
    const uniqueSlug = await this.generateSlugFromName(name);
    const isUnique = originalSlug === uniqueSlug;

    return {
      success: true,
      message: isUnique 
        ? `Slug generado exitosamente: "${uniqueSlug}"` 
        : `Slug generado con modificación para garantizar unicidad: "${uniqueSlug}"`,
      data: {
        originalName: name,
        generatedSlug: uniqueSlug,
        isUnique,
      },
    };
  }

  async findByIdWithResponse(id: string): Promise<CategoryResponseDto> {
    const category = await this.findById(id);
    
    return {
      success: true,
      message: `Categoría "${category.name}" encontrada exitosamente`,
      data: category,
      meta: {
        id: category.id,
        status: category.isActive ? 'Activa' : 'Inactiva',
      },
    };
  }

  async findBySlugWithResponse(slug: string): Promise<CategoryResponseDto> {
    const category = await this.findBySlug(slug);
    
    return {
      success: true,
      message: `Categoría con slug "${slug}" encontrada exitosamente`,
      data: category,
      meta: {
        slug: category.slug,
        status: category.isActive ? 'Activa' : 'Inactiva',
      },
    };
  }
}
