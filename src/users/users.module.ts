import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';
import { UsersRepository } from '../database/repositories';
import { UserDomainService } from './domain/user.service';
import { UserRepositoryAdapter } from './domain/user.repository';
import { PasswordService } from './domain/password.service';

const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY_TOKEN';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    UsersService, 
    UsersRepository, 
    UserDomainService, 
    PasswordService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryAdapter,
    },
    UserRepositoryAdapter
  ],
  exports: [UsersService, UsersRepository, UserDomainService, UserRepositoryAdapter],
})
export class UsersModule {}
