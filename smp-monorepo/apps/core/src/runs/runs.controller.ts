import { Controller, Post, Get, Param, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RunsService } from './services/runs.service';
import { ZodValidationPipe } from '../core/pipes/zod-validation.pipe';
import {
  FinishRunInputDto,
  FinishRunResultDto,
  ResultSummaryDto,
  FinishRunInput,
} from './dto/runs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppError, ErrorCode } from '../common/errors/app.error';

@Controller('runs')
@ApiTags('Runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post(':runId/finish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Finish a run',
    description: 'Submit run results with player contributions and process rewards'
  })
  @ApiResponse({
    status: 200,
    description: 'Run finished successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            txHash: { type: 'string', example: '0x1234...' },
            relics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tokenId: { type: 'number', example: 123 },
                  cid: { type: 'string', example: 'QmABC123...' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Run not found'
  })
  @ApiResponse({
    status: 409,
    description: 'Run already finished or invalid contributions'
  })
  async finishRun(
    @Param('runId') runId: string,
    @Body(new ZodValidationPipe(FinishRunInput)) finishData: {
      bossId: string;
      contributions: Array<{
        wallet: string;
        damage: number;
      }>;
    },
    @Req() request: any,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ): Promise<{ ok: true; data: FinishRunResultDto }> {
    const wallet = request.user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    // Verify the user is a participant in this run
    const run = await this.runsService.getRunById(runId);
    if (!run) {
      throw AppError.notFound(ErrorCode.RUN_NOT_FOUND, 'Run not found');
    }

    const isParticipant = run.participants.some(p => p.wallet === wallet);
    if (!isParticipant) {
      throw AppError.forbidden(ErrorCode.FORBIDDEN, 'You are not a participant in this run');
    }

    const result = await this.runsService.finishRun(runId, finishData, idempotencyKey);

    return {
      ok: true,
      data: result,
    };
  }

  @Post('create-test/:gateId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a test run for development',
    description: 'Create a test run for the authenticated user in the specified gate'
  })
  @ApiResponse({
    status: 201,
    description: 'Test run created successfully'
  })
  async createTestRun(
    @Param('gateId') gateId: string,
    @Req() request: any,
  ): Promise<{ ok: true; data: { runId: string; message: string } }> {
    const wallet = request.user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    // Create a test run
    const runId = `test_run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create participants array
    const participants = [{
      wallet,
      displayName: 'TestPlayer',
      avatarId: 'm_swordsman',
      damage: 0,
      normalKills: 0,
    }];

    // Create the run
    await this.runsService.createRunForTest(runId, gateId, 'TestBoss', participants);

    return {
      ok: true,
      data: {
        runId,
        message: 'Test run created successfully',
      },
    };
  }

  @Get('results/:runId')
  @ApiOperation({
    summary: 'Get run results',
    description: 'Get detailed results for a completed run including rewards and rankings'
  })
  @ApiResponse({
    status: 200,
    description: 'Run results retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Run not found or not finished'
  })
  async getRunResults(
    @Param('runId') runId: string,
  ): Promise<{ ok: true; data: ResultSummaryDto }> {
    const results = await this.runsService.getRunResults(runId);

    return {
      ok: true,
      data: results,
    };
  }

  @Get(':runId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get run details',
    description: 'Get detailed information about a run'
  })
  @ApiResponse({
    status: 200,
    description: 'Run details retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Run not found'
  })
  async getRun(
    @Param('runId') runId: string,
  ): Promise<{ ok: true; data: any }> {
    const run = await this.runsService.getRunById(runId);

    if (!run) {
      throw AppError.notFound(ErrorCode.RUN_NOT_FOUND, 'Run not found');
    }

    return {
      ok: true,
      data: {
        runId: run.runId,
        partyId: run.partyId,
        gateId: run.gateId,
        bossId: run.bossId,
        participants: run.participants.map(p => ({
          wallet: p.wallet,
          displayName: p.displayName,
          avatarId: p.avatarId,
          damage: p.damage,
          normalKills: p.normalKills,
        })),
        startedAt: run.startedAt.toISOString(),
        endedAt: run.endedAt?.toISOString(),
        status: run.endedAt ? 'completed' : 'in_progress',
      },
    };
  }

  @Get('leaderboard/recent')
  @ApiOperation({
    summary: 'Get recent runs leaderboard',
    description: 'Get the most recent completed runs for leaderboard display'
  })
  @ApiResponse({
    status: 200,
    description: 'Recent runs retrieved successfully'
  })
  async getRecentRunsLeaderboard(
    @Param('limit') limit?: string,
  ): Promise<{ ok: true; data: any[] }> {
    const limitNum = limit ? parseInt(limit) : 10;
    const runs = await this.runsService.getRecentRuns(limitNum);

    const leaderboard = runs.map(run => ({
      runId: run.runId,
      gateId: run.gateId,
      bossId: run.bossId,
      totalDamage: run.participants.reduce((sum, p) => sum + p.damage, 0),
      participantCount: run.participants.length,
      completedAt: run.endedAt?.toISOString(),
      topPerformer: run.participants.reduce((top, p) =>
        p.damage > top.damage ? p : top
      , run.participants[0]),
    }));

    return {
      ok: true,
      data: leaderboard,
    };
  }
}
