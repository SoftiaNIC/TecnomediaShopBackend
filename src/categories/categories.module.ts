import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { DatabaseModule } from '../database/database.module';
import { CategoriesRepository } from '../database/repositories';
import { CategoryDomainService, CategoryRepositoryAdapter } from './domain';

const CATEGORY_REPOSITORY_TOKEN = 'CATEGORY_REPOSITORY_TOKEN';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService, 
    CategoriesRepository,
    CategoryDomainService,
    {
      provide: CATEGORY_REPOSITORY_TOKEN,
      useClass: CategoryRepositoryAdapter,
    },
    CategoryRepositoryAdapter
  ],
  exports: [CategoriesService, CategoriesRepository, CategoryDomainService, CategoryRepositoryAdapter],
})
export class CategoriesModule {}
