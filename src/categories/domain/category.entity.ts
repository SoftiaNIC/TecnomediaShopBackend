export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryCommand {
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
}

export interface UpdateCategoryCommand {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
}

export class CategoryName {
  constructor(private readonly name: string) {
    if (!name?.trim()) {
      throw new Error('El nombre de la categoría es requerido');
    }
    if (name.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }
    if (name.trim().length > 100) {
      throw new Error('El nombre no puede exceder 100 caracteres');
    }
    this.name = name.trim();
  }

  getValue(): string {
    return this.name;
  }

  toString(): string {
    return this.name;
  }
}

export class CategorySlug {
  constructor(private readonly slug: string) {
    if (!slug?.trim()) {
      throw new Error('El slug de la categoría es requerido');
    }
    
    const normalizedSlug = slug.toLowerCase().trim();
    
    // Validar formato de slug (solo letras minúsculas, números y guiones)
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      throw new Error('El slug solo puede contener letras minúsculas, números y guiones');
    }
    
    if (normalizedSlug.length < 3) {
      throw new Error('El slug debe tener al menos 3 caracteres');
    }
    
    if (normalizedSlug.length > 100) {
      throw new Error('El slug no puede exceder 100 caracteres');
    }
    
    this.slug = normalizedSlug;
  }

  getValue(): string {
    return this.slug;
  }

  toString(): string {
    return this.slug;
  }

  static fromName(name: string): CategorySlug {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
    
    return new CategorySlug(slug);
  }
} 