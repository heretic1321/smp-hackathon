import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GatesService } from './services/gates.service';
import { ZodValidationPipe } from '../core/pipes/zod-validation.pipe';
import {
  GateUpsertInputDto,
  GatesListResponseDto,
  GateWithOccupancyDto,
} from './dto/gates.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppError, ErrorCode } from '../common/errors/app.error';

@Controller('gates')
@ApiTags('Gates')
export class GatesController {
  constructor(private readonly gatesService: GatesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all active gates',
    description: 'Retrieve all active gates with current occupancy information'
  })
  @ApiResponse({
    status: 200,
    description: 'Gates retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            gates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'C_FROST' },
                  rank: { type: 'string', example: 'C' },
                  name: { type: 'string', example: 'Frost Halls' },
                  description: { type: 'string', example: 'A frozen dungeon...' },
                  thumbUrl: { type: 'string', example: 'https://...' },
                  mapCode: { type: 'string', example: 'FrostHall' },
                  capacity: { type: 'number', example: 3 },
                  isActive: { type: 'boolean', example: true },
                  occupancy: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        partyId: { type: 'string', example: 'p_123' },
                        current: { type: 'number', example: 2 },
                        max: { type: 'number', example: 3 }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  async getAllGates(): Promise<{ ok: true; data: GatesListResponseDto }> {
    const gates = await this.gatesService.getAllGates();

    const gatesWithOccupancy = gates.map(gate => ({
      id: gate.id,
      rank: gate.rank as 'E' | 'D' | 'C' | 'B' | 'A' | 'S',
      name: gate.name,
      description: gate.description,
      thumbUrl: gate.thumbUrl,
      mapCode: gate.mapCode,
      capacity: gate.capacity,
      isActive: gate.isActive,
      occupancy: gate.occupancy,
      createdAt: gate.createdAt.toISOString(),
      updatedAt: gate.updatedAt.toISOString(),
    }));

    return {
      ok: true,
      data: {
        gates: gatesWithOccupancy,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get gate by ID',
    description: 'Retrieve a specific gate with occupancy information'
  })
  @ApiResponse({
    status: 200,
    description: 'Gate retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Gate not found'
  })
  async getGateById(
    @Param('id') gateId: string,
  ): Promise<{ ok: true; data: GateWithOccupancyDto | null }> {
    const gate = await this.gatesService.getGateById(gateId);

    if (!gate) {
      throw AppError.notFound(ErrorCode.GATE_NOT_FOUND, 'Gate not found');
    }

    return {
      ok: true,
      data: {
        id: gate.id,
        rank: gate.rank as 'E' | 'D' | 'C' | 'B' | 'A' | 'S',
        name: gate.name,
        description: gate.description,
        thumbUrl: gate.thumbUrl,
        mapCode: gate.mapCode,
        capacity: gate.capacity,
        isActive: gate.isActive,
        occupancy: gate.occupancy,
        createdAt: gate.createdAt.toISOString(),
        updatedAt: gate.updatedAt.toISOString(),
      },
    };
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Seed initial gates',
    description: 'Create initial gate data for development (admin only)'
  })
  @ApiResponse({
    status: 201,
    description: 'Gates seeded successfully'
  })
  async seedGates(): Promise<{ ok: true; data: { message: string; count: number } }> {
    const gates = await this.gatesService.seedGates();

    return {
      ok: true,
      data: {
        message: 'Gates seeded successfully',
        count: gates.length,
      },
    };
  }

  @Post(':id/join-or-create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Join or create party in gate',
    description: 'Join an existing party in the gate or create a new one if none available'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined or created party'
  })
  @ApiResponse({
    status: 404,
    description: 'Gate not found'
  })
  @ApiResponse({
    status: 409,
    description: 'Gate is full'
  })
  async joinOrCreateParty(
    @Param('id') gateId: string,
  ): Promise<{ ok: true; data: { partyId: string; message: string } }> {
    const gate = await this.gatesService.getGateById(gateId);

    if (!gate) {
      throw AppError.notFound(ErrorCode.GATE_NOT_FOUND, 'Gate not found');
    }

    if (!gate.isActive) {
      throw AppError.conflict(ErrorCode.GATE_INACTIVE, 'Gate is not active');
    }

    // Check if gate has available capacity
    const hasCapacity = await this.gatesService.hasAvailableCapacity(gateId);
    if (!hasCapacity) {
      throw AppError.conflict(ErrorCode.PARTY_FULL, 'Gate is at maximum capacity');
    }

    // For now, we'll create a simple party ID
    // In the parties module, this will be replaced with proper party management
    const partyId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update gate occupancy
    await this.gatesService.updateGateOccupancy(gateId, {
      partyId,
      current: 1,
      max: Math.min(3, gate.capacity), // Default party size
    });

    return {
      ok: true,
      data: {
        partyId,
        message: 'Successfully joined/created party in gate',
      },
    };
  }

  @Get(':id/occupancy')
  @ApiOperation({
    summary: 'Get gate occupancy',
    description: 'Get real-time occupancy information for a gate'
  })
  @ApiResponse({
    status: 200,
    description: 'Occupancy retrieved successfully'
  })
  async getGateOccupancy(
    @Param('id') gateId: string,
  ): Promise<{ ok: true; data: { availableCapacity: number; totalCapacity: number; occupancy: any[] } }> {
    const gate = await this.gatesService.getGateById(gateId);

    if (!gate) {
      throw AppError.notFound(ErrorCode.GATE_NOT_FOUND, 'Gate not found');
    }

    const availableCapacity = await this.gatesService.getAvailableCapacity(gateId);

    return {
      ok: true,
      data: {
        availableCapacity,
        totalCapacity: gate.capacity,
        occupancy: gate.occupancy,
      },
    };
  }
}
