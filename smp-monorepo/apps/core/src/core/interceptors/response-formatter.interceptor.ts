import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  ok: true;
  data: T;
}

export interface ErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor<any, Response<any> | ErrorResponse> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<any> | ErrorResponse> {
    return next.handle().pipe(
      map((data) => {
        // If data is already formatted (has 'ok' property), return as-is
        if (data && typeof data === 'object' && 'ok' in data) {
          return data;
        }

        // Otherwise, wrap successful responses in the envelope format
        return {
          ok: true,
          data,
        };
      })
    );
  }
}
