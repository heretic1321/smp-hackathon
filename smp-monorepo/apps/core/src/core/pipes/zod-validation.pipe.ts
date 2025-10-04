import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { AppError, ErrorCode } from '../../common/errors/app.error';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value === undefined || value === null) {
      return value;
    }

    // Use Zod's safeParse to get detailed error information
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw this.createValidationError(result.error);
    }

    return result.data;
  }

  private createValidationError(zodError: ZodError): AppError {
    const formattedErrors = zodError.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code,
    }));

    return AppError.validationError('Validation failed', {
      errors: formattedErrors,
      zodError: zodError.format(),
    });
  }
}

// Factory function for creating validation pipes
export function createValidationPipe<T extends ZodSchema>(schema: T): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}
