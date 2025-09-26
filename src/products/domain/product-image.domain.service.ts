import { Injectable } from '@nestjs/common';
import { 
  ProductImage, 
  CreateProductImageCommand, 
  UpdateProductImageCommand,
  ImageUrl,
  ImageData,
  ImageFileSize,
  ImageDimensions
} from './product-image.entity';

@Injectable()
export class ProductImageDomainService {
  
  /**
   * Crea una nueva imagen de producto con validaciones de dominio
   */
  createProductImage(command: CreateProductImageCommand): ProductImage {
    // Validar que se proporcione URL o imageData, pero no ambos
    this.validateImageSource(command.url, command.imageData);
    
    // Validar y procesar URL si se proporciona
    let processedUrl: string | undefined;
    if (command.url) {
      const imageUrl = new ImageUrl(command.url);
      processedUrl = imageUrl.getValue();
    }
    
    // Validar y procesar imageData si se proporciona
    let processedImageData: string | undefined;
    if (command.imageData) {
      const imageData = new ImageData(
        command.imageData, 
        command.mimeType || 'image/jpeg'
      );
      processedImageData = imageData.getValue();
    }
    
    // Validar y procesar fileSize si se proporciona
    let processedFileSize: number | undefined;
    if (command.fileSize !== undefined) {
      const fileSize = new ImageFileSize(command.fileSize);
      processedFileSize = fileSize.getValue();
    }
    
    // Validar y procesar dimensiones si se proporcionan
    let processedWidth: number | undefined;
    let processedHeight: number | undefined;
    if (command.width !== undefined && command.height !== undefined) {
      const dimensions = new ImageDimensions(command.width, command.height);
      processedWidth = dimensions.getWidth();
      processedHeight = dimensions.getHeight();
    }
    
    // Crear la entidad de imagen
    const productImage: ProductImage = {
      id: this.generateImageId(),
      productId: command.productId,
      url: processedUrl,
      imageData: processedImageData,
      altText: command.altText,
      title: command.title,
      isPrimary: command.isPrimary || false,
      displayOrder: command.displayOrder || 0,
      fileSize: processedFileSize,
      mimeType: command.mimeType,
      width: processedWidth,
      height: processedHeight,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return productImage;
  }
  
  /**
   * Actualiza una imagen de producto existente
   */
  updateProductImage(existingImage: ProductImage, command: UpdateProductImageCommand): ProductImage {
    // Validar que se proporcione URL o imageData, pero no ambos
    this.validateImageSource(command.url, command.imageData);
    
    // Crear una copia de la imagen existente
    const updatedImage: ProductImage = { ...existingImage };
    
    // Actualizar URL si se proporciona
    if (command.url !== undefined) {
      if (command.url) {
        const imageUrl = new ImageUrl(command.url);
        updatedImage.url = imageUrl.getValue();
        updatedImage.imageData = undefined; // Limpiar imageData si se establece URL
      } else {
        updatedImage.url = undefined;
      }
    }
    
    // Actualizar imageData si se proporciona
    if (command.imageData !== undefined) {
      if (command.imageData) {
        const imageData = new ImageData(
          command.imageData, 
          command.mimeType || existingImage.mimeType || 'image/jpeg'
        );
        updatedImage.imageData = imageData.getValue();
        updatedImage.url = undefined; // Limpiar URL si se establece imageData
      } else {
        updatedImage.imageData = undefined;
      }
    }
    
    // Actualizar otros campos si se proporcionan
    if (command.altText !== undefined) {
      updatedImage.altText = command.altText;
    }
    
    if (command.title !== undefined) {
      updatedImage.title = command.title;
    }
    
    if (command.isPrimary !== undefined) {
      updatedImage.isPrimary = command.isPrimary;
    }
    
    if (command.displayOrder !== undefined) {
      updatedImage.displayOrder = command.displayOrder;
    }
    
    if (command.fileSize !== undefined) {
      const fileSize = new ImageFileSize(command.fileSize);
      updatedImage.fileSize = fileSize.getValue();
    }
    
    if (command.mimeType !== undefined) {
      updatedImage.mimeType = command.mimeType;
    }
    
    if (command.width !== undefined && command.height !== undefined) {
      const dimensions = new ImageDimensions(command.width, command.height);
      updatedImage.width = dimensions.getWidth();
      updatedImage.height = dimensions.getHeight();
    }
    
    // Actualizar fecha de modificación
    updatedImage.updatedAt = new Date();
    
    return updatedImage;
  }
  
  /**
   * Valida que solo se proporcione URL o imageData, pero no ambos
   */
  private validateImageSource(url?: string, imageData?: string): void {
    const hasUrl = url && url.trim().length > 0;
    const hasImageData = imageData && imageData.trim().length > 0;
    
    if (hasUrl && hasImageData) {
      throw new Error('Cannot provide both URL and image data. Only one image source is allowed.');
    }
    
    if (!hasUrl && !hasImageData) {
      throw new Error('Must provide either URL or image data. At least one image source is required.');
    }
  }
  
  /**
   * Genera un ID único para la imagen
   */
  private generateImageId(): string {
    return crypto.randomUUID();
  }
  
  /**
   * Valida que un producto pueda tener solo una imagen principal
   */
  validatePrimaryImageConstraint(
    images: ProductImage[], 
    newImage: ProductImage,
    isUpdate: boolean = false
  ): void {
    if (!newImage.isPrimary) {
      return; // No es imagen principal, no hay restricción
    }
    
    // Buscar otras imágenes principales
    const otherPrimaryImages = images.filter(img => 
      img.isPrimary && 
      img.productId === newImage.productId && 
      (!isUpdate || img.id !== newImage.id)
    );
    
    if (otherPrimaryImages.length > 0) {
      throw new Error('A product can only have one primary image. Please mark other images as non-primary first.');
    }
  }
  
  /**
   * Organiza las imágenes por orden de visualización
   */
  organizeDisplayOrder(images: ProductImage[]): ProductImage[] {
    return images
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((image, index) => ({
        ...image,
        displayOrder: index
      }));
  }
  
  /**
   * Convierte imageData a URL de datos para la respuesta
   */
  toImageDataUrl(image: ProductImage): string | undefined {
    if (!image.imageData || !image.mimeType) {
      return undefined;
    }
    
    return `data:${image.mimeType};base64,${image.imageData}`;
  }
  
  /**
   * Formatea el tamaño del archivo para la respuesta
   */
  formatFileSize(bytes?: number): string | undefined {
    if (bytes === undefined) {
      return undefined;
    }
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  /**
   * Formatea las dimensiones para la respuesta
   */
  formatDimensions(width?: number, height?: number): string | undefined {
    if (width === undefined || height === undefined) {
      return undefined;
    }
    
    return `${width}x${height}`;
  }
}
