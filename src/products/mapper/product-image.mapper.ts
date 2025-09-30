import { Injectable } from '@nestjs/common';
import { ProductImage, CreateProductImageCommand } from '../domain/product-image.entity';
import { ProductImageResponseDto } from '../dto/product-image-response.dto';
import { CreateProductImageDto } from '../dto/create-product-image.dto';
import { productImages } from '../../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ProductImageMapper {
  
  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  toResponseDto(image: ProductImage): ProductImageResponseDto {
    return {
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageDataUrl: this.toImageDataUrl(image),
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      fileSizeFormatted: this.formatFileSize(image.fileSize),
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      dimensions: this.formatDimensions(image.width, image.height),
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
  
  /**
   * Convierte múltiples entidades de dominio a DTOs de respuesta
   */
  toResponseDtos(images: ProductImage[]): ProductImageResponseDto[] {
    return images.map(image => this.toResponseDto(image));
  }
  
  /**
   * Convierte un registro de la base de datos a entidad de dominio
   */
  toDomain(dbRecord: any): ProductImage {
    return {
      id: dbRecord.id,
      productId: dbRecord.productId,
      url: dbRecord.url,
      imageData: dbRecord.imageData,
      altText: dbRecord.altText,
      title: dbRecord.title,
      isPrimary: dbRecord.isPrimary,
      displayOrder: dbRecord.displayOrder,
      fileSize: dbRecord.fileSize,
      mimeType: dbRecord.mimeType,
      width: dbRecord.width,
      height: dbRecord.height,
      createdAt: new Date(dbRecord.createdAt),
      updatedAt: new Date(dbRecord.updatedAt),
    };
  }
  
  /**
   * Convierte múltiples registros de la base de datos a entidades de dominio
   */
  toDomainEntities(dbRecords: any[]): ProductImage[] {
    return dbRecords.map(record => this.toDomain(record));
  }
  
  /**
   * Convierte una entidad de dominio a formato de base de datos para inserción
   */
  toDatabaseForInsert(image: ProductImage) {
    return {
      id: image.id,
      productId: image.productId,
      url: image.url,
      imageData: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
  
  /**
   * Convierte una entidad de dominio a formato de base de datos para actualización
   */
  toDatabaseForUpdate(image: ProductImage) {
    return {
      url: image.url,
      imageData: image.imageData,
      altText: image.altText,
      title: image.title,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
      fileSize: image.fileSize,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      updatedAt: image.updatedAt,
    };
  }
  
  /**
   * Convierte un DTO a Command para crear imagen
   */
  toCreateCommand(dto: CreateProductImageDto): CreateProductImageCommand {
    return {
      productId: dto.productId,
      url: dto.url,
      imageData: dto.imageData,
      altText: dto.altText,
      title: dto.title,
      isPrimary: dto.isPrimary,
      displayOrder: dto.displayOrder,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
      width: dto.width,
      height: dto.height,
    };
  }
  
  /**
   * Convierte múltiples DTOs a Commands para crear imágenes
   */
  toCreateCommands(dtos: CreateProductImageDto[]): CreateProductImageCommand[] {
    // Asegurarse de que dtos sea siempre un array
    const dtosArray = Array.isArray(dtos) ? dtos : [dtos];
    return dtosArray.map(dto => this.toCreateCommand(dto));
  }
  
  /**
   * Convierte imageData a URL de datos para la respuesta
   */
  private toImageDataUrl(image: ProductImage): string | undefined {
    if (!image.imageData || !image.mimeType) {
      return undefined;
    }
    
    return `data:${image.mimeType};base64,${image.imageData}`;
  }
  
  /**
   * Formatea el tamaño del archivo para la respuesta
   */
  private formatFileSize(bytes?: number): string | undefined {
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
  private formatDimensions(width?: number, height?: number): string | undefined {
    if (width === undefined || height === undefined) {
      return undefined;
    }
    
    return `${width}x${height}`;
  }
}
