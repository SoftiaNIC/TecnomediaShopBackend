import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DatabaseModule } from '../database/database.module';
import { ProductsRepository } from '../database/repositories';
import { ProductDomainService } from './domain/product.service';
import { ProductRepositoryAdapter } from './domain/product.repository';

const PRODUCT_REPOSITORY_TOKEN = 'PRODUCT_REPOSITORY_TOKEN';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [
    ProductsService, 
    ProductsRepository, 
    ProductDomainService, 
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: ProductRepositoryAdapter,
    },
    ProductRepositoryAdapter
  ],
  exports: [ProductsService, ProductsRepository, ProductDomainService, ProductRepositoryAdapter],
})
export class ProductsModule {}
