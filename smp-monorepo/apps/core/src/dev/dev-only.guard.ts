import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppError, ErrorCode } from '../common/errors/app.error';
import { ProfilesService } from '../profiles/profiles.service';

/**
 * Guard that only allows access to users with displayName "heretic" (case-insensitive)
 * Used for development/testing endpoints
 */
@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(private readonly profilesService: ProfilesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = (request as any).user;

    if (!user || !user.address) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    try {
      const profile = await this.profilesService.getProfileByAddress(user.address);
      
      if (!profile) {
        throw AppError.forbidden(ErrorCode.FORBIDDEN, 'Profile not found');
      }

      if (profile.displayName.toLowerCase() !== 'heretic') {
        throw AppError.forbidden(
          ErrorCode.FORBIDDEN,
          'Access denied: Dev endpoints are restricted to authorized developers only'
        );
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalError('Failed to verify dev access', { error: error.message });
    }
  }
}

