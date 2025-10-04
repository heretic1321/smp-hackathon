// Error codes matching the spec requirements
export enum ErrorCode {
  // Auth errors
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  NONCE_MISMATCH = 'NONCE_MISMATCH',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Profile errors
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  NAME_TAKEN = 'NAME_TAKEN',

  // Gate errors
  GATE_NOT_FOUND = 'GATE_NOT_FOUND',
  GATE_INACTIVE = 'GATE_INACTIVE',

  // Party errors
  PARTY_NOT_FOUND = 'PARTY_NOT_FOUND',
  NOT_A_MEMBER = 'NOT_A_MEMBER',
  PARTY_FULL = 'PARTY_FULL',
  PARTY_STARTED = 'PARTY_STARTED',
  NOT_LEADER = 'NOT_LEADER',
  MEMBER_NOT_READY = 'MEMBER_NOT_READY',
  MEMBER_NOT_LOCKED = 'MEMBER_NOT_LOCKED',

  // Run errors
  RUN_NOT_FOUND = 'RUN_NOT_FOUND',
  RUN_ALREADY_FINISHED = 'RUN_ALREADY_FINISHED',
  INVALID_CONTRIBUTIONS = 'INVALID_CONTRIBUTIONS',
  DUPLICATE_IDEMPOTENCY_KEY = 'DUPLICATE_IDEMPOTENCY_KEY',

  // Media errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_TYPE = 'UNSUPPORTED_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // Chain errors
  CHAIN_ERROR = 'CHAIN_ERROR',

  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// Custom error class for application errors
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Helper methods for common error types
  static badRequest(code: ErrorCode, message: string, details?: Record<string, any>): AppError {
    return new AppError(code, message, 400, details);
  }

  static unauthorized(code: ErrorCode, message: string = 'Unauthorized'): AppError {
    return new AppError(code, message, 401);
  }

  static forbidden(code: ErrorCode, message: string = 'Forbidden'): AppError {
    return new AppError(code, message, 403);
  }

  static notFound(code: ErrorCode, message: string): AppError {
    return new AppError(code, message, 404);
  }

  static conflict(code: ErrorCode, message: string, details?: Record<string, any>): AppError {
    return new AppError(code, message, 409, details);
  }

  static unprocessableEntity(code: ErrorCode, message: string, details?: Record<string, any>): AppError {
    return new AppError(code, message, 422, details);
  }

  static tooManyRequests(code: ErrorCode, message: string = 'Too many requests'): AppError {
    return new AppError(code, message, 429);
  }

  static internalError(message: string = 'Internal server error', details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500, details);
  }

  static chainError(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.CHAIN_ERROR, message, 502, details);
  }

  static validationError(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }
}
