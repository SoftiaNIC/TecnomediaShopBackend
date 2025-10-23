import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';

const logger = new Logger('Bootstrap');

// Aumentar el límite de listeners para evitar advertencias
require('events').EventEmitter.defaultMaxListeners = 15;

async function bootstrap() {
  // Configurar límites de memoria
  const memoryLimit = process.env.NODE_MEMORY_LIMIT || '512';
  const memoryLimitInBytes = parseInt(memoryLimit) * 1024 * 1024;
  
  if (process.env.NODE_ENV === 'production') {
    process.env.UV_THREADPOOL_SIZE = '4';
    require('newrelic'); // Si usas New Relic
  }
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    abortOnError: false,
  });
  
  const configService = app.get(ConfigService);
  
  // Configurar el límite de memoria
  if (memoryLimitInBytes > 0) {
    logger.log(`Memory limit set to ${memoryLimit}MB`);
  }
  
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
  const server = await app.listen(port, '0.0.0.0');
  
  // Configurar timeouts para evitar conexiones colgadas
  server.keepAliveTimeout = 125000;
  server.headersTimeout = 130000;
  
  const url = await app.getUrl();
  logger.log(`Application is running on: ${url}`);
  logger.log(`Swagger documentation: ${url}/api`);
  
  // Manejo de señales para un cierre limpio
  const gracefulShutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Starting graceful shutdown...`);
    try {
      await app.close();
      logger.log('Nest application closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  // Manejadores de señales
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Manejo de excepciones no capturadas
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

bootstrap();
