import { Controller, Post, Get, Body, Res, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { SiweService } from './siwe.service';
import { JwtAuthService } from './jwt.service';
import { ZodValidationPipe } from '../core/pipes/zod-validation.pipe';
import {
  SiweChallengeRequest,
  SiweChallengeResponse,
  SiweVerifyRequest,
  SiweVerifyResponse,
  AuthMeResponse,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly siweService: SiweService,
    private readonly jwtService: JwtAuthService,
  ) {}

  @Post('challenge')
  @ApiOperation({
    summary: 'Generate SIWE challenge',
    description: 'Generate a SIWE challenge message for the given address'
  })
  @ApiResponse({
    status: 200,
    description: 'Challenge generated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            nonce: { type: 'string', example: 'abc123...' }
          }
        }
      }
    }
  })
  async generateChallenge(
    @Body(new ZodValidationPipe(SiweChallengeRequest)) body: { address: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ ok: true; data: { nonce: string } }> {
    const result = await this.siweService.generateChallenge(body);

    return {
      ok: true,
      data: result,
    };
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify SIWE signature',
    description: 'Verify a SIWE signature and establish user session'
  })
  @ApiResponse({
    status: 200,
    description: 'Signature verified successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            address: { type: 'string', example: '0x1234...' }
          }
        }
      }
    }
  })
  async verifySignature(
    @Body(new ZodValidationPipe(SiweVerifyRequest)) body: {
      address: string;
      message: string;
      signature: string;
    },
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ ok: true; data: { address: string } }> {
    const result = await this.siweService.verifySignature(body);

    // Generate session token
    const sessionToken = this.jwtService.generateSessionToken(result.address);

    // Set HttpOnly session cookie
    // For lvh.me subdomains, we need to NOT set the domain at all to make it work
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to false for development with HTTP
      sameSite: 'lax' as const,
      // Don't set domain for localhost/lvh.me - let browser handle it
      // domain: process.env.DOMAIN || '.lvh.me',
      maxAge: this.jwtService.getSessionTtl() * 1000, // Convert to milliseconds
      path: '/',
    };

    response.cookie('gb_session', sessionToken, cookieOptions);
    
    console.log('✅ Session cookie set for:', result.address);
    console.log('🍪 Cookie options:', cookieOptions);

    return {
      ok: true,
      data: result,
    };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Clear the user session cookie'
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully'
  })
  async logout(@Res({ passthrough: true }) response: Response): Promise<{ ok: true; data: {} }> {
    // Clear session cookie
    response.clearCookie('gb_session', {
      domain: process.env.DOMAIN,
      path: '/',
    });

    return {
      ok: true,
      data: {},
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get information about the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully'
  })
  async getCurrentUser(@Req() request: Request): Promise<{ ok: true; data: { address: string; roles: string[] } }> {
    const user = (request as any).user;

    return {
      ok: true,
      data: {
        address: user.address,
        roles: user.roles,
      },
    };
  }
}
