import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import type { ICategoryRepository } from './category.repository';
import { 
  Category, 
  CreateCategoryCommand, 
  UpdateCategoryCommand,
  CategoryName,
  CategorySlug
} from './category.entity';

const CATEGORY_REPOSITORY_TOKEN = 'CATEGORY_REPOSITORY_TOKEN';

@Injectable()
export class CategoryDomainService {
  constructor(@Inject(CATEGORY_REPOSITORY_TOKEN) private readonly categoryRepository: ICategoryRepository) {}

  async createCategory(command: CreateCategoryCommand): Promise<Category> {
    // Validaciones de dominio
    const categoryName = new CategoryName(command.name);
    const categorySlug = new CategorySlug(command.slug);

    // Verificar si el nombre ya existe
    const existingCategoryByName = await this.categoryRepository.findByName(categoryName.getValue());
    if (existingCategoryByName) {
      throw new ConflictException('Ya existe una categoría con este nombre');
    }

    // Verificar si el slug ya existe
    const existingCategoryBySlug = await this.categoryRepository.findBySlug(categorySlug.getValue());
    if (existingCategoryBySlug) {
      throw new ConflictException('Ya existe una categoría con este slug');
    }

    // Crear la categoría con valores por defecto
    const categoryData = {
      name: categoryName.getValue(),
      description: command.description || '',
      slug: categorySlug.getValue(),
      isActive: command.isActive ?? true,
    };

    return await this.categoryRepository.create(categoryData);
  }

  async updateCategory(id: string, command: UpdateCategoryCommand): Promise<Category> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Validaciones de dominio para actualización
    const updateData: UpdateCategoryCommand = { ...command };

    if (command.name) {
      const categoryName = new CategoryName(command.name);
      updateData.name = categoryName.getValue();
      
      // Verificar si el nuevo nombre ya existe en otra categoría
      const categoryWithName = await this.categoryRepository.findByName(categoryName.getValue());
      if (categoryWithName && categoryWithName.id !== id) {
        throw new ConflictException('Ya existe otra categoría con este nombre');
      }
    }

    if (command.slug) {
      const categorySlug = new CategorySlug(command.slug);
      updateData.slug = categorySlug.getValue();
      
      // Verificar si el nuevo slug ya existe en otra categoría
      const categoryWithSlug = await this.categoryRepository.findBySlug(categorySlug.getValue());
      if (categoryWithSlug && categoryWithSlug.id !== id) {
        throw new ConflictException('Ya existe otra categoría con este slug');
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, updateData);
    if (!updatedCategory) {
      throw new NotFoundException('Error al actualizar la categoría');
    }

    return updatedCategory;
  }

  async activateCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (category.isActive) {
      throw new ConflictException('La categoría ya está activa');
    }

    const updatedCategory = await this.categoryRepository.updateStatus(id, true);
    if (!updatedCategory) {
      throw new NotFoundException('Error al activar la categoría');
    }

    return updatedCategory;
  }

  async deactivateCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (!category.isActive) {
      throw new ConflictException('La categoría ya está inactiva');
    }

    // TODO: Verificar si tiene productos activos asociados
    // const activeProductCount = await this.categoryRepository.countActiveProductsByCategory(id);
    // if (activeProductCount > 0) {
    //   throw new ConflictException('No se puede desactivar una categoría que tiene productos activos');
    // }

    const updatedCategory = await this.categoryRepository.updateStatus(id, false);
    if (!updatedCategory) {
      throw new NotFoundException('Error al desactivar la categoría');
    }

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar que no tenga productos asociados
    const productCount = await this.categoryRepository.countProductsByCategory(id);
    if (productCount > 0) {
      throw new ConflictException('No se puede eliminar una categoría que tiene productos asociados');
    }

    return await this.categoryRepository.delete(id);
  }

  async generateSlugFromName(name: string): Promise<string> {
    const baseSlug = CategorySlug.fromName(name);
    let slug = baseSlug.getValue();
    let counter = 1;

    // Si el slug ya existe, agregar un número al final
    while (await this.categoryRepository.findBySlug(slug)) {
      slug = `${baseSlug.getValue()}-${counter}`;
      counter++;
    }

    return slug;
  }
} 