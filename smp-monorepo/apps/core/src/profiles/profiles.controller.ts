import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { ZodValidationPipe } from '../core/pipes/zod-validation.pipe';
import {
  ProfileUpsertInput,
  ProfileDto,
  ProfileUpdateResponseDto,
  GetProfileByAddressQuery,
} from './dto/profiles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppError, ErrorCode } from '../common/errors/app.error';

@Controller('profile')
@ApiTags('Profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update profile',
    description: 'Create a new profile or update an existing one for the authenticated user'
  })
  @ApiResponse({
    status: 201,
    description: 'Profile created/updated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            wallet: { type: 'string', example: '0x1234...' },
            displayName: { type: 'string', example: 'ShadowMaster' },
            avatarId: { type: 'string', example: 'm_swordsman' },
            imageUrl: { type: 'string', example: 'https://cdn.example.com/profile.jpg' },
            rank: { type: 'string', example: 'E' },
            level: { type: 'number', example: 1 },
            xp: { type: 'number', example: 0 },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
          }
        }
      }
    }
  })
  async upsertProfile(
    @Body(new ZodValidationPipe(ProfileUpsertInput)) profileData: {
      displayName: string;
      avatarId: string;
      imageUrl: string;
    },
    @Req() request: any,
  ): Promise<{ ok: true; data: ProfileUpdateResponseDto }> {
    // Get wallet from authenticated user
    const wallet = request.user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    const profile = await this.profilesService.upsertProfile(wallet, profileData);

    return {
      ok: true,
      data: {
        wallet: profile.wallet,
        displayName: profile.displayName,
        avatarId: profile.avatarId,
        imageUrl: profile.imageUrl,
        rank: profile.rank as ProfileDto['rank'],
        level: profile.level,
        xp: profile.xp,
        sbtTokenId: profile.sbtTokenId,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    };
  }

  @Get(':address')
  @ApiOperation({
    summary: 'Get profile by address',
    description: 'Retrieve a player profile by their wallet address'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            wallet: { type: 'string', example: '0x1234...' },
            displayName: { type: 'string', example: 'ShadowMaster' },
            avatarId: { type: 'string', example: 'm_swordsman' },
            imageUrl: { type: 'string', example: 'https://cdn.example.com/profile.jpg' },
            rank: { type: 'string', example: 'E' },
            level: { type: 'number', example: 1 },
            xp: { type: 'number', example: 0 },
            sbtTokenId: { type: 'number', example: 123 },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found'
  })
  async getProfileByAddress(
    @Param('address') address: string,
  ): Promise<{ ok: true; data: ProfileDto | null }> {
    const profile = await this.profilesService.getProfileByAddress(address);

    if (!profile) {
      throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
    }

    return {
      ok: true,
      data: {
        wallet: profile.wallet,
        displayName: profile.displayName,
        avatarId: profile.avatarId,
        imageUrl: profile.imageUrl,
        rank: profile.rank as ProfileDto['rank'],
        level: profile.level,
        xp: profile.xp,
        sbtTokenId: profile.sbtTokenId,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get the profile of the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully'
  })
  async getCurrentProfile(@Req() request: any): Promise<{ ok: true; data: ProfileDto }> {
    const wallet = request.user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    const profile = await this.profilesService.getProfileByAddress(wallet);

    if (!profile) {
      throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
    }

    return {
      ok: true,
      data: {
        wallet: profile.wallet,
        displayName: profile.displayName,
        avatarId: profile.avatarId,
        imageUrl: profile.imageUrl,
        rank: profile.rank as ProfileDto['rank'],
        level: profile.level,
        xp: profile.xp,
        sbtTokenId: profile.sbtTokenId,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    };
  }

  @Get('leaderboard/top')
  @ApiOperation({
    summary: 'Get top players leaderboard',
    description: 'Get the top players ranked by XP and level'
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              wallet: { type: 'string', example: '0x1234...' },
              displayName: { type: 'string', example: 'ShadowMaster' },
              rank: { type: 'string', example: 'E' },
              level: { type: 'number', example: 1 },
              xp: { type: 'number', example: 1000 }
            }
          }
        }
      }
    }
  })
  async getLeaderboard(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ ok: true; data: any[] }> {
    const limitNum = limit ? parseInt(limit) : 10;
    const offsetNum = offset ? parseInt(offset) : 0;

    const profiles = await this.profilesService.getLeaderboard(limitNum, offsetNum);

    const leaderboard = profiles.map(profile => ({
      wallet: profile.wallet,
      displayName: profile.displayName,
      rank: profile.rank,
      level: profile.level,
      xp: profile.xp,
    }));

    return {
      ok: true,
      data: leaderboard,
    };
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search profiles',
    description: 'Search for profiles by display name (partial match, case-insensitive)'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully'
  })
  async searchProfiles(
    @Query('q') searchTerm: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ ok: true; data: any[] }> {
    if (!searchTerm) {
      throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'Search term is required');
    }

    const limitNum = limit ? parseInt(limit) : 20;
    const offsetNum = offset ? parseInt(offset) : 0;

    const profiles = await this.profilesService.searchProfiles(
      searchTerm,
      limitNum,
      offsetNum
    );

    const results = profiles.map(profile => ({
      wallet: profile.wallet,
      displayName: profile.displayName,
      avatarId: profile.avatarId,
      rank: profile.rank,
      level: profile.level,
    }));

    return {
      ok: true,
      data: results,
    };
  }
}
