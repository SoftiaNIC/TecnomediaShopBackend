import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [],
  exports: [],
})
export class UsersModule {}
