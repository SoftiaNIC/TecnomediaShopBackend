import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../categories/dto/response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let details: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || 'Error en la solicitud';
        
        // Si hay múltiples mensajes de validación
        if (Array.isArray(responseObj.message)) {
          details = responseObj.message;
          message = 'Error de validación en los datos enviados';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Personalizar mensajes según el código de estado
    const customMessage = this.getCustomMessage(status, message);

    const errorResponse: ErrorResponseDto = {
      success: false,
      message: customMessage,
      statusCode: status,
      details: details.length > 0 ? details : undefined,
      timestamp: new Date(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private getCustomMessage(status: number, originalMessage: string): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return originalMessage.includes('validación') 
          ? originalMessage 
          : 'Los datos enviados no son válidos. Por favor, revisa la información e intenta nuevamente.';
      
      case HttpStatus.UNAUTHORIZED:
        return 'Acceso no autorizado. Por favor, inicia sesión para continuar.';
      
      case HttpStatus.FORBIDDEN:
        return 'No tienes permisos suficientes para realizar esta acción.';
      
      case HttpStatus.NOT_FOUND:
        return originalMessage.includes('encontrad') 
          ? originalMessage 
          : 'El recurso solicitado no fue encontrado.';
      
      case HttpStatus.CONFLICT:
        return originalMessage.includes('existe') 
          ? originalMessage 
          : 'Conflicto con el estado actual del recurso.';
      
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'La solicitud no se puede procesar debido a errores en los datos.';
      
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Error interno del servidor. Por favor, intenta más tarde o contacta al administrador.';
      
      default:
        return originalMessage;
    }
  }
} 