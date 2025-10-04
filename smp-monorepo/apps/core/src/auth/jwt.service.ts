import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { EnvironmentConfig } from '../core/config/env.validation';
import { GameSessionDataDto } from './dto/auth.dto';

@Injectable()
export class JwtAuthService {
  private readonly sessionTtl: number;
  private readonly gameSessionTtl: number;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<EnvironmentConfig>,
    private readonly jwtService: NestJwtService,
  ) {
    this.sessionTtl = this.configService.get('SESSION_TTL_HOURS', 2) * 60 * 60; // Convert to seconds
    this.gameSessionTtl = this.configService.get('GB_GAME_TTL_MINUTES', 5) * 60; // Convert to seconds
  }

  /**
   * Generate a session JWT token for authenticated users
   */
  generateSessionToken(address: string, roles: string[] = ['user']): string {
    const payload = {
      sub: address,
      roles,
      type: 'session',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.sessionTtl,
      issuer: 'shadow-monarchs-path',
      audience: 'web-client',
    });
  }

  /**
   * Verify and decode a session JWT token
   */
  verifySessionToken(token: string): { address: string; roles: string[] } {
    try {
      const payload = this.jwtService.verify(token, {
        issuer: 'shadow-monarchs-path',
        audience: 'web-client',
      });

      if (payload.type !== 'session') {
        throw new Error('Invalid token type');
      }

      return {
        address: payload.sub,
        roles: payload.roles || ['user'],
      };
    } catch (error) {
      throw new Error(`Invalid session token: ${error.message}`);
    }
  }

  /**
   * Generate a signed JWT for game session (non-HttpOnly cookie)
   */
  generateGameSessionToken(gameData: GameSessionDataDto): string {
    const payload = {
      ...gameData,
      type: 'game_session',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.gameSessionTtl,
      issuer: 'shadow-monarchs-path',
      audience: 'unity-client',
    });
  }

  /**
   * Verify and decode a game session JWT token
   */
  verifyGameSessionToken(token: string): GameSessionDataDto {
    try {
      const payload = this.jwtService.verify(token, {
        issuer: 'shadow-monarchs-path',
        audience: 'unity-client',
      });

      if (payload.type !== 'game_session') {
        throw new Error('Invalid token type');
      }

      return {
        partyId: payload.partyId,
        runId: payload.runId,
        wallet: payload.wallet,
        displayName: payload.displayName,
        avatarId: payload.avatarId,
        equippedRelicIds: payload.equippedRelicIds,
        roomToken: payload.roomToken,
      };
    } catch (error) {
      throw new Error(`Invalid game session token: ${error.message}`);
    }
  }

  /**
   * Get session token expiration time in seconds
   */
  getSessionTtl(): number {
    return this.sessionTtl;
  }

  /**
   * Get game session token expiration time in seconds
   */
  getGameSessionTtl(): number {
    return this.gameSessionTtl;
  }
}
