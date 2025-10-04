import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeaderboardsService } from './services/leaderboards.service';
import { createValidationPipe } from '../core/pipes/zod-validation.pipe';
import {
  WeeklyLeaderboardQueryDto,
  PerBossLeaderboardQueryDto,
  LeaderboardResponseDto,
  PlayerLeaderboardStatsDto,
} from './dto/leaderboards.dto';

@Controller('leaderboards')
@ApiTags('Leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get('weekly/:weekKey')
  @ApiOperation({
    summary: 'Get weekly leaderboard',
    description: 'Get leaderboard for a specific week (YYYY-WW format)'
  })
  @ApiResponse({
    status: 200,
    description: 'Weekly leaderboard retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            scope: { type: 'string', example: 'weekly' },
            refId: { type: 'string', example: '2024-W01' },
            period: {
              type: 'object',
              properties: {
                start: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                end: { type: 'string', example: '2024-01-07T23:59:59.999Z' }
              }
            },
            metric: { type: 'string', example: 'xp' },
            entries: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rank: { type: 'number', example: 1 },
                  wallet: { type: 'string', example: '0x1234...' },
                  displayName: { type: 'string', example: 'ShadowMaster' },
                  avatarId: { type: 'string', example: 'm_swordsman' },
                  value: { type: 'number', example: 1000 },
                  level: { type: 'number', example: 5 },
                  playerRank: { type: 'string', example: 'C' },
                  change: { type: 'number', example: 2 }
                }
              }
            },
            totalEntries: { type: 'number', example: 50 },
            lastUpdated: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
          }
        }
      }
    }
  })
  async getWeeklyLeaderboard(
    @Param('weekKey') weekKey: string,
    @Query('metric') metric?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ ok: true; data: LeaderboardResponseDto }> {
    const query = {
      weekKey,
      metric: (metric as any) || 'xp',
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    };

    const result = await this.leaderboardsService.getWeeklyLeaderboard(query);

    return {
      ok: true,
      data: result,
    };
  }

  @Get('boss/:bossId')
  @ApiOperation({
    summary: 'Get per-boss leaderboard',
    description: 'Get leaderboard for a specific boss encounter'
  })
  @ApiResponse({
    status: 200,
    description: 'Per-boss leaderboard retrieved successfully'
  })
  async getPerBossLeaderboard(
    @Param('bossId') bossId: string,
    @Query('metric') metric?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ ok: true; data: LeaderboardResponseDto }> {
    const query = {
      bossId,
      metric: (metric as any) || 'damage',
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    };

    const result = await this.leaderboardsService.getPerBossLeaderboard(query);

    return {
      ok: true,
      data: result,
    };
  }

  @Get('all-time')
  @ApiOperation({
    summary: 'Get all-time leaderboard',
    description: 'Get all-time leaderboard across all runs'
  })
  @ApiResponse({
    status: 200,
    description: 'All-time leaderboard retrieved successfully'
  })
  async getAllTimeLeaderboard(
    @Query('metric') metric?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ ok: true; data: LeaderboardResponseDto }> {
    const result = await this.leaderboardsService.getAllTimeLeaderboard(
      (metric as any) || 'xp',
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );

    return {
      ok: true,
      data: result,
    };
  }

  @Get('player/:address')
  @ApiOperation({
    summary: 'Get player leaderboard stats',
    description: 'Get detailed statistics for a player in leaderboard context'
  })
  @ApiResponse({
    status: 200,
    description: 'Player stats retrieved successfully'
  })
  async getPlayerStats(
    @Param('address') wallet: string,
  ): Promise<{ ok: true; data: PlayerLeaderboardStatsDto }> {
    const stats = await this.leaderboardsService.getPlayerStats(wallet);

    return {
      ok: true,
      data: stats,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get leaderboard statistics',
    description: 'Get overall statistics about the leaderboard system'
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard stats retrieved successfully'
  })
  async getLeaderboardStats(): Promise<{ ok: true; data: any }> {
    const stats = await this.leaderboardsService.getLeaderboardStats();

    return {
      ok: true,
      data: stats,
    };
  }

  @Get('weeks')
  @ApiOperation({
    summary: 'Get available weeks',
    description: 'Get all weeks that have leaderboard data'
  })
  @ApiResponse({
    status: 200,
    description: 'Available weeks retrieved successfully'
  })
  async getAvailableWeeks(): Promise<{ ok: true; data: string[] }> {
    const weeks = await this.leaderboardsService.getAvailableWeeks();

    return {
      ok: true,
      data: weeks,
    };
  }

  @Get('bosses')
  @ApiOperation({
    summary: 'Get available bosses',
    description: 'Get all bosses that have leaderboard data'
  })
  @ApiResponse({
    status: 200,
    description: 'Available bosses retrieved successfully'
  })
  async getAvailableBosses(): Promise<{ ok: true; data: string[] }> {
    const bosses = await this.leaderboardsService.getAvailableBosses();

    return {
      ok: true,
      data: bosses,
    };
  }

  @Get('current-week')
  @ApiOperation({
    summary: 'Get current week key',
    description: 'Get the current week key for weekly leaderboards'
  })
  @ApiResponse({
    status: 200,
    description: 'Current week key retrieved successfully'
  })
  async getCurrentWeek(): Promise<{ ok: true; data: { weekKey: string } }> {
    const weekKey = (this.leaderboardsService as any).getCurrentWeekKey();

    return {
      ok: true,
      data: { weekKey },
    };
  }
}
