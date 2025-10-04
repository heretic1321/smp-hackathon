import { Controller, Post, Get, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DevOnlyGuard } from './dev-only.guard';
import { DevService } from './dev.service';

@Controller('dev')
@ApiTags('Development & Testing')
@UseGuards(JwtAuthGuard, DevOnlyGuard)
@ApiBearerAuth()
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Post('seed-gates')
  @ApiOperation({
    summary: '[DEV] Seed default gates',
    description: 'Populates the database with default gate data for testing. Only accessible to user "heretic".',
  })
  @ApiResponse({ status: 200, description: 'Gates seeded successfully' })
  async seedGates(): Promise<{ ok: true; data: { count: number; gates: any[] } }> {
    const gates = await this.devService.seedGates();
    return {
      ok: true,
      data: {
        count: gates.length,
        gates,
      },
    };
  }

  @Post('mint-test-relic')
  @ApiOperation({
    summary: '[DEV] Mint a test relic',
    description: 'Mints a test relic to your inventory without blockchain interaction',
  })
  @ApiResponse({ status: 200, description: 'Relic minted successfully' })
  async mintTestRelic(
    @Req() request: any,
    @Body() body: { relicType?: string },
  ): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const relic = await this.devService.mintTestRelic(wallet, body.relicType);
    return {
      ok: true,
      data: relic,
    };
  }

  @Post('update-xp')
  @ApiOperation({
    summary: '[DEV] Add XP to profile',
    description: 'Adds XP to your profile for testing level-ups and rank-ups',
  })
  @ApiResponse({ status: 200, description: 'XP updated successfully' })
  async updateXp(
    @Req() request: any,
    @Body() body: { xp: number },
  ): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const profile = await this.devService.addXp(wallet, body.xp);
    return {
      ok: true,
      data: profile,
    };
  }

  @Post('update-rank')
  @ApiOperation({
    summary: '[DEV] Change profile rank',
    description: 'Directly sets your hunter rank for testing',
  })
  @ApiResponse({ status: 200, description: 'Rank updated successfully' })
  async updateRank(
    @Req() request: any,
    @Body() body: { rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' },
  ): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const profile = await this.devService.setRank(wallet, body.rank);
    return {
      ok: true,
      data: profile,
    };
  }

  @Post('simulate-boss-kill')
  @ApiOperation({
    summary: '[DEV] Simulate a boss kill',
    description: 'Simulates completing a dungeon run with rewards',
  })
  @ApiResponse({ status: 200, description: 'Boss kill simulated successfully' })
  async simulateBossKill(
    @Req() request: any,
    @Body() body: { gateId: string; bossId?: string; damage?: number },
  ): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const result = await this.devService.simulateBossKill(
      wallet,
      body.gateId,
      body.bossId || 'test_boss',
      body.damage || 10000,
    );
    return {
      ok: true,
      data: result,
    };
  }

  @Post('mint-sbt')
  @ApiOperation({
    summary: '[DEV] Mint/Update SBT Profile',
    description: 'Creates or updates the SBT profile token (simulated)',
  })
  @ApiResponse({ status: 200, description: 'SBT minted successfully' })
  async mintSbt(@Req() request: any): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const result = await this.devService.mintOrUpdateSbt(wallet);
    return {
      ok: true,
      data: result,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: '[DEV] Get system stats',
    description: 'Returns overall system statistics for testing',
  })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats(): Promise<{ ok: true; data: any }> {
    const stats = await this.devService.getSystemStats();
    return {
      ok: true,
      data: stats,
    };
  }

  @Post('reset-profile')
  @ApiOperation({
    summary: '[DEV] Reset your profile',
    description: 'Resets your profile to starting values (keeps displayName and avatar)',
  })
  @ApiResponse({ status: 200, description: 'Profile reset successfully' })
  async resetProfile(@Req() request: any): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const profile = await this.devService.resetProfile(wallet);
    return {
      ok: true,
      data: profile,
    };
  }

  @Post('clear-inventory')
  @ApiOperation({
    summary: '[DEV] Clear your inventory',
    description: 'Removes all relics from your inventory',
  })
  @ApiResponse({ status: 200, description: 'Inventory cleared successfully' })
  async clearInventory(@Req() request: any): Promise<{ ok: true; data: { removed: number } }> {
    const wallet = request.user.address;
    const count = await this.devService.clearInventory(wallet);
    return {
      ok: true,
      data: { removed: count },
    };
  }

  @Post('test-run-blockchain')
  @ApiOperation({
    summary: '[DEV] Test run with blockchain minting',
    description: 'Simulates a game completion with blockchain relic minting. Returns transaction hash, username, wallet ID, and relic info.',
  })
  @ApiResponse({
    status: 200,
    description: 'Test run completed successfully with blockchain minting',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            txHash: { type: 'string', example: '0x1234...' },
            username: { type: 'string', example: 'TestUser' },
            walletId: { type: 'string', example: '0x742d35Cc6A3e0b6cEfF4c9CE0C8cD3B8C4e9f2423' },
            relic: {
              type: 'object',
              properties: {
                tokenId: { type: 'number', example: 123 },
                relicType: { type: 'string', example: 'Shadow Monarch\'s Test Ring' },
                affixes: { type: 'object' },
                ipfsCid: { type: 'string', example: 'QmTestRelic123' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'User profile not found'
  })
  @ApiResponse({
    status: 500,
    description: 'Blockchain transaction failed'
  })
  async testRunWithBlockchainMinting(
    @Req() request: any,
    @Body() body: { relicId?: string },
  ): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const result = await this.devService.testRunWithBlockchainMinting(wallet, body.relicId);
    return {
      ok: true,
      data: result,
    };
  }
}

