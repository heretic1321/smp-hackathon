import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthService } from '../jwt.service';
import { AppError, ErrorCode } from '../../common/errors/app.error';

@Injectable()
export class JwtAuthGuard {
  constructor(private readonly jwtService: JwtAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    console.log('🔍 JWT Guard - Cookies:', request.cookies);
    console.log('🔍 JWT Guard - Token found:', !!token);

    if (!token) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'No session token provided');
    }

    try {
      const payload = this.jwtService.verifySessionToken(token);
      (request as any).user = payload;
      console.log('✅ JWT Guard - User authenticated:', payload.address);
      return true;
    } catch (error) {
      console.log('❌ JWT Guard - Token verification failed:', error);
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'Invalid session token');
    }
  }

  private extractTokenFromCookie(request: any): string | null {
    return request.cookies?.gb_session || null;
  }
}
