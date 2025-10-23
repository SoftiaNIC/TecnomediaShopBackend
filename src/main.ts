import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Global validation pipe with detailed error messages
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const formattedErrors = errors.map(error => ({
        field: error.property,
        message: Object.values(error.constraints || {}).join(', '),
        value: error.value
      }));
      return new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
        success: false
      });
    }
  }));
  
  // Global exception filters for consistent error handling
  app.useGlobalFilters(new HttpExceptionFilter(), new ValidationExceptionFilter());
  
  // CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Increase body parser limit for image uploads
  const express = require('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('API RESTful completa para sistema de e-commerce con gestión de categorías, productos, usuarios y autenticación. Incluye respuestas descriptivas, validaciones robustas y manejo de errores consistente.')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingresa el token JWT obtenido del endpoint de login',
      in: 'header',
    })
    .addTag('categories', 'Operaciones CRUD para gestión de categorías de productos')
    .addTag('products', 'Operaciones CRUD para gestión de productos')
    .addTag('users', 'Operaciones para gestión de usuarios y perfiles')
    .addTag('auth', 'Autenticación y autorización de usuarios')
    .setContact('Equipo de Desarrollo', 'https://example.com', 'dev@example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Servidor de Desarrollo')
    .addServer('https://api.example.com', 'Servidor de Producción')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
