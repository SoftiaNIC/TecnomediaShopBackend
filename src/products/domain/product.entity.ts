export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  sku: string;
  price: number;
  costPrice?: number;
  comparePrice?: number;
  discountedPrice?: number; // Calculated field based on comparePrice
  categoryId: string;
  categoryName?: string; // Joined field from categories table
  quantity: number;
  trackQuantity: boolean;
  allowOutOfStockPurchases: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  barcode?: string;
  weight?: number;
  images?: string[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  OUT_OF_STOCK = 'out_of_stock',
}

export interface CreateProductCommand {
  name: string;
  description: string;
  slug: string;
  sku: string;
  price: number;
  costPrice?: number;
  comparePrice?: number;
  categoryId: string;
  quantity?: number;
  trackQuantity?: boolean;
  allowOutOfStockPurchases?: boolean;
  isDigital?: boolean;
  isFeatured?: boolean;
  barcode?: string;
  weight?: number;
  images?: string[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateProductCommand {
  name?: string;
  description?: string;
  slug?: string;
  sku?: string;
  price?: number;
  costPrice?: number;
  comparePrice?: number;
  categoryId?: string;
  quantity?: number;
  trackQuantity?: boolean;
  allowOutOfStockPurchases?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  barcode?: string;
  weight?: number;
  images?: string[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  updatedAt?: Date;
}

export class ProductName {
  constructor(private readonly name: string) {
    if (!name?.trim()) {
      throw new Error('Product name is required');
    }
    if (name.trim().length < 3) {
      throw new Error('Product name must be at least 3 characters long');
    }
    if (name.trim().length > 100) {
      throw new Error('Product name must be less than 100 characters');
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

export class ProductSlug {
  constructor(private readonly slug: string) {
    if (!slug?.trim()) {
      throw new Error('Product slug is required');
    }
    
    const normalizedSlug = slug.toLowerCase().trim();
    
    // Validar formato de slug (solo letras, números, guiones y guiones bajos)
    if (!/^[a-z0-9_-]+$/.test(normalizedSlug)) {
      throw new Error('Product slug can only contain lowercase letters, numbers, hyphens and underscores');
    }
    
    this.slug = normalizedSlug;
  }

  getValue(): string {
    return this.slug;
  }

  toString(): string {
    return this.slug;
  }
}

export class ProductSku {
  constructor(private readonly sku: string) {
    if (!sku?.trim()) {
      throw new Error('Product SKU is required');
    }
    
    const normalizedSku = sku.toUpperCase().trim();
    
    if (normalizedSku.length < 3) {
      throw new Error('Product SKU must be at least 3 characters long');
    }
    if (normalizedSku.length > 50) {
      throw new Error('Product SKU must be less than 50 characters');
    }
    
    this.sku = normalizedSku;
  }

  getValue(): string {
    return this.sku;
  }

  toString(): string {
    return this.sku;
  }
}

export class ProductPrice {
  constructor(private readonly price: number) {
    if (typeof price !== 'number' || isNaN(price)) {
      throw new Error('Product price must be a valid number');
    }
    if (price < 0) {
      throw new Error('Product price cannot be negative');
    }
    if (price > 999999.99) {
      throw new Error('Product price cannot exceed 999,999.99');
    }
    this.price = Math.round(price * 100) / 100; // Redondear a 2 decimales
  }

  getValue(): number {
    return this.price;
  }

  getFormattedPrice(currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(this.price);
  }

  toString(): string {
    return this.price.toString();
  }
}

export class ProductQuantity {
  constructor(
    private readonly quantity: number,
    private readonly trackQuantity: boolean = true
  ) {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      throw new Error('Product quantity must be a valid number');
    }
    if (quantity < 0) {
      throw new Error('Product quantity cannot be negative');
    }
    if (quantity > 999999) {
      throw new Error('Product quantity cannot exceed 999,999');
    }
    
    this.quantity = Math.floor(quantity);
    this.trackQuantity = trackQuantity;
  }

  getValue(): number {
    return this.quantity;
  }

  isTrackingEnabled(): boolean {
    return this.trackQuantity;
  }

  isInStock(): boolean {
    return !this.trackQuantity || this.quantity > 0;
  }

  isLowStock(threshold: number = 10): boolean {
    return this.trackQuantity && this.quantity <= threshold && this.quantity > 0;
  }

  decreaseQuantity(amount: number = 1): ProductQuantity {
    if (amount <= 0) {
      throw new Error('Decrease amount must be positive');
    }
    return new ProductQuantity(this.quantity - amount, this.trackQuantity);
  }

  increaseQuantity(amount: number = 1): ProductQuantity {
    if (amount <= 0) {
      throw new Error('Increase amount must be positive');
    }
    return new ProductQuantity(this.quantity + amount, this.trackQuantity);
  }

  toString(): string {
    return this.quantity.toString();
  }
}
