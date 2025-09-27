import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DatabaseModule } from '../database/database.module';
import { ProductsRepository, CategoriesRepository, ProductImagesRepository } from '../database/repositories';
import { ProductDomainService } from './domain/product.service';
import { ProductRepositoryAdapter } from './domain/product.repository';
import { ProductCategoryDomainService } from './domain/product-category.service';
import { ProductCategoryRepositoryAdapter } from './domain/product-category.repository';
import { ProductMapper } from './mapper/product.mapper';

const PRODUCT_REPOSITORY_TOKEN = 'PRODUCT_REPOSITORY_TOKEN';
const PRODUCT_CATEGORY_REPOSITORY_TOKEN = 'PRODUCT_CATEGORY_REPOSITORY_TOKEN';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [
    ProductsService, 
    ProductsRepository, 
    CategoriesRepository,
    ProductImagesRepository,
    ProductDomainService, 
    ProductCategoryDomainService,
    ProductCategoryRepositoryAdapter,
    ProductRepositoryAdapter,
    ProductMapper,
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: ProductRepositoryAdapter,
    },
    {
      provide: PRODUCT_CATEGORY_REPOSITORY_TOKEN,
      useClass: ProductCategoryRepositoryAdapter,
    }
  ],
  exports: [ProductsService, ProductsRepository, ProductImagesRepository, ProductDomainService, ProductCategoryDomainService, ProductCategoryRepositoryAdapter, ProductRepositoryAdapter],
})
export class ProductsModule {}
