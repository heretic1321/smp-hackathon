import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { generateRequestId } from '../logger/logger.config';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Generate or use existing request ID
    const requestId = request.headers['x-request-id'] || generateRequestId();

    // Add to request object for use in controllers/services
    request.requestId = requestId;

    // Add to response headers
    response.setHeader('x-request-id', requestId);

    return next.handle().pipe(
      tap(() => {
        // Could add response time tracking here if needed
      })
    );
  }
}
