export interface ProductImage {
  id: string;
  productId: string;
  url?: string; // URL externa de la imagen
  imageData?: string; // Datos binarios de la imagen en base64
  altText?: string;
  title?: string;
  isPrimary: boolean;
  displayOrder: number;
  fileSize?: number; // Tamaño en bytes
  mimeType?: string; // image/jpeg, image/png, etc.
  width?: number; // Ancho en píxeles
  height?: number; // Alto en píxeles
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductImageCommand {
  productId: string;
  url?: string; // URL externa de la imagen
  imageData?: string; // Datos binarios de la imagen en base64
  altText?: string;
  title?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  fileSize?: number; // Tamaño en bytes
  mimeType?: string; // image/jpeg, image/png, etc.
  width?: number; // Ancho en píxeles
  height?: number; // Alto en píxeles
}

export interface UpdateProductImageCommand {
  url?: string; // URL externa de la imagen
  imageData?: string; // Datos binarios de la imagen en base64
  altText?: string;
  title?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  fileSize?: number; // Tamaño en bytes
  mimeType?: string; // image/jpeg, image/png, etc.
  width?: number; // Ancho en píxeles
  height?: number; // Alto en píxeles
}

// Enum para tipos de imágenes soportados
export enum ImageMimeType {
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
  SVG = 'image/svg+xml',
}

// Value Objects para validaciones
export class ImageUrl {
  constructor(private readonly url: string) {
    if (!url?.trim()) {
      throw new Error('Image URL is required when using external URL');
    }
    
    // Validar formato de URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid image URL format');
    }
    
    // Validar que sea una URL de imagen
    if (!this.isImageUrl(url)) {
      throw new Error('URL must point to a valid image file');
    }
    
    this.url = url.trim();
  }
  
  getValue(): string {
    return this.url;
  }
  
  toString(): string {
    return this.url;
  }
  
  private isImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('image/') ||
           lowerUrl.includes('imgur.com') ||
           lowerUrl.includes('cloudinary.com');
  }
}

export class ImageData {
  constructor(
    private readonly data: string,
    private readonly mimeType: string
  ) {
    if (!data?.trim()) {
      throw new Error('Image data is required when using binary storage');
    }
    
    // Validar formato base64
    if (!this.isValidBase64(data)) {
      throw new Error('Invalid base64 image data format');
    }
    
    // Validar tipo MIME
    if (!Object.values(ImageMimeType).includes(mimeType as ImageMimeType)) {
      throw new Error(`Unsupported image MIME type: ${mimeType}`);
    }
    
    this.data = data.trim();
    this.mimeType = mimeType;
  }
  
  getValue(): string {
    return this.data;
  }
  
  getMimeType(): string {
    return this.mimeType;
  }
  
  toString(): string {
    return `data:${this.mimeType};base64,${this.data}`;
  }
  
  private isValidBase64(data: string): boolean {
    // Eliminar prefijo data URI si existe
    const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
    
    // Validar que solo contiene caracteres base64 válidos
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return base64Regex.test(base64Data);
  }
}

export class ImageFileSize {
  constructor(private readonly size: number) {
    if (typeof size !== 'number' || size < 0) {
      throw new Error('File size must be a positive number');
    }
    
    // Limitar tamaño máximo a 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (size > maxSize) {
      throw new Error('Image file size cannot exceed 10MB');
    }
    
    this.size = size;
  }
  
  getValue(): number {
    return this.size;
  }
  
  getFormattedSize(): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.size === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(this.size) / Math.log(1024));
    return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  toString(): string {
    return this.getFormattedSize();
  }
}

export class ImageDimensions {
  constructor(
    private readonly width: number,
    private readonly height: number
  ) {
    if (typeof width !== 'number' || width <= 0) {
      throw new Error('Image width must be a positive number');
    }
    
    if (typeof height !== 'number' || height <= 0) {
      throw new Error('Image height must be a positive number');
    }
    
    // Limitar dimensiones máximas
    const maxDimension = 10000; // 10,000 píxeles
    if (width > maxDimension || height > maxDimension) {
      throw new Error('Image dimensions cannot exceed 10,000 pixels');
    }
    
    this.width = width;
    this.height = height;
  }
  
  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }
  
  getAspectRatio(): number {
    return this.width / this.height;
  }
  
  toString(): string {
    return `${this.width}x${this.height}`;
  }
}
