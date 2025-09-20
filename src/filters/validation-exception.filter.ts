import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle different types of exceptions
    if (exception instanceof BadRequestException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // If it's already a formatted response, pass it through
      if (exceptionResponse.message && typeof exceptionResponse.message === 'object') {
        return response.status(status).json(exceptionResponse);
      }

      // Format class-validator errors
      if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
        return response.status(status).json({
          message: 'Validation failed',
          errors: exceptionResponse.message.map((msg: string) => ({
            message: msg,
          })),
          success: false,
        });
      }

      // Handle other BadRequestException cases
      return response.status(status).json({
        message: exceptionResponse.message || 'Bad request',
        success: false,
      });
    }

    // Handle ConflictException (e.g., duplicate email)
    if (exception instanceof ConflictException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      return response.status(status).json({
        message: exceptionResponse.message || 'Conflict',
        success: false,
        ...(exceptionResponse.field && { field: exceptionResponse.field }),
      });
    }

    // Handle UnauthorizedException
    if (exception instanceof UnauthorizedException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      return response.status(status).json({
        message: exceptionResponse.message || 'Unauthorized',
        success: false,
      });
    }

    // Handle NotFoundException
    if (exception instanceof NotFoundException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      return response.status(status).json({
        message: exceptionResponse.message || 'Not found',
        success: false,
      });
    }

    // Handle domain validation errors
    if (exception.message === 'Invalid email format') {
      return response.status(400).json({
        message: 'El formato del email es inválido',
        field: 'email',
        success: false,
      });
    }

    if (exception.message === 'First name is required') {
      return response.status(400).json({
        message: 'El nombre es requerido',
        field: 'firstName',
        success: false,
      });
    }

    if (exception.message === 'Last name is required') {
      return response.status(400).json({
        message: 'El apellido es requerido',
        field: 'lastName',
        success: false,
      });
    }

    if (exception.message === 'User with this email already exists') {
      return response.status(409).json({
        message: 'El email ya está registrado',
        field: 'email',
        success: false,
      });
    }

    // Generic error handler
    const status = exception.status || 500;
    const message = exception.message || 'Internal server error';

    // Log the error for debugging
    console.error('Unhandled exception:', exception);

    return response.status(status).json({
      message: status === 500 ? 'Error interno del servidor' : message,
      success: false,
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
    });
  }
}
