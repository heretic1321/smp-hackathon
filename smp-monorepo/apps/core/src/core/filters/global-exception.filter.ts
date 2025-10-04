import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError, ErrorCode } from '../../common/errors/app.error';
import { ZodError } from 'zod';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.formatError(exception, request);

    // Log error with request context
    this.logger.error(
      `[${request.method}] ${request.url} - ${errorResponse.error.code}: ${errorResponse.error.message}`,
      {
        requestId: request.headers['x-request-id'] || 'unknown',
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        stack: exception instanceof Error ? exception.stack : undefined,
      }
    );

    response.status(errorResponse.statusCode || 500).json(errorResponse);
  }

  private formatError(exception: unknown, request: Request): {
    ok: false;
    error: {
      code: string;
      message: string;
      details?: Record<string, any>;
    };
    statusCode?: number;
  } {
    // Handle our custom AppError
    if (exception instanceof AppError) {
      return {
        ok: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
        statusCode: exception.statusCode,
      };
    }

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      let code = ErrorCode.INTERNAL_ERROR;
      let message = 'Internal server error';

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const responseObj = response as any;
        code = responseObj.error || code;
        message = responseObj.message || message;
      }

      return {
        ok: false,
        error: {
          code,
          message,
        },
        statusCode: status,
      };
    }

    // Handle Zod validation errors
    if (exception instanceof ZodError) {
      return {
        ok: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: {
            errors: exception.errors.map(error => ({
              field: error.path.join('.'),
              message: error.message,
              code: error.code,
            })),
          },
        },
        statusCode: 400,
      };
    }

    // Handle MongoDB/Mongoose errors
    if (exception instanceof Error) {
      // Duplicate key error
      if (exception.name === 'MongoError' && (exception as any).code === 11000) {
        const field = Object.keys((exception as any).keyValue || {})[0];
        return {
          ok: false,
          error: {
            code: ErrorCode.NAME_TAKEN,
            message: `This ${field} is already taken`,
            details: { field, value: (exception as any).keyValue[field] },
          },
          statusCode: 409,
        };
      }

      // Validation error
      if (exception.name === 'ValidationError') {
        return {
          ok: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: exception.message,
            details: { validationError: exception.message },
          },
          statusCode: 400,
        };
      }
    }

    // Handle unknown errors
    const errorMessage = exception instanceof Error ? exception.message : 'Unknown error';
    return {
      ok: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        details: {
          originalMessage: errorMessage,
          type: typeof exception,
        },
      },
      statusCode: 500,
    };
  }
}
