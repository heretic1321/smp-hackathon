import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { Observable, map } from 'rxjs';
import { PartiesService } from './services/parties.service';
import { PartySseService } from './sse/party-sse.service';
import { ZodValidationPipe } from '../core/pipes/zod-validation.pipe';
import {
  PartyCreateInputDto,
  PartyUpdateInputDto,
  PartyDto,
  PartyMemberDto,
  PartyStateDto,
  PartyUpdateInput,
} from './dto/parties.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppError, ErrorCode } from '../common/errors/app.error';

@Controller('party')
@ApiTags('Parties')
export class PartiesController {
  constructor(
    private readonly partiesService: PartiesService,
    private readonly partySseService: PartySseService,
  ) {}

  @Post(':gateId/join-or-create')
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
    @Param('gateId') gateId: string,
    @Req() request: Request,
  ): Promise<{ ok: true; data: { partyId: string; message: string } }> {
    const wallet = (request as any).user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    // First try to find an existing party to join
    const existingParties = await this.partiesService.getPartiesByGate(gateId);

    for (const party of existingParties) {
      if (party.members.length < party.capacity && party.state === 'waiting') {
        // Try to join this party
        try {
          const result = await this.partiesService.joinParty(wallet, party.partyId);
          return {
            ok: true,
            data: result,
          };
        } catch (error) {
          // If join fails, continue to next party
          continue;
        }
      }
    }

    // No suitable party found, create a new one
    const result = await this.partiesService.createParty(wallet, { gateId });
    return {
      ok: true,
      data: result,
    };
  }

  @Post(':partyId/ready')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update ready state',
    description: 'Set the user\'s ready state in the party'
  })
  @ApiResponse({
    status: 200,
    description: 'Ready state updated successfully'
  })
  async updateReadyState(
    @Param('partyId') partyId: string,
    @Body(new ZodValidationPipe(PartyUpdateInput)) body: { isReady: boolean },
    @Req() request: Request,
  ): Promise<{ ok: true; data: { partyId: string; message: string } }> {
    const wallet = (request as any).user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.partiesService.updateMemberState(wallet, partyId, {
      isReady: body.isReady,
    });

    return {
      ok: true,
      data: result,
    };
  }

  @Post(':partyId/lock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update lock state',
    description: 'Set the user\'s lock state in the party (equipment selection)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lock state updated successfully'
  })
  async updateLockState(
    @Param('partyId') partyId: string,
    @Body(new ZodValidationPipe(PartyUpdateInput)) body: {
      isLocked: boolean;
      equippedRelicIds?: number[];
    },
    @Req() request: Request,
  ): Promise<{ ok: true; data: { partyId: string; message: string } }> {
    const wallet = (request as any).user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.partiesService.updateMemberState(wallet, partyId, {
      isLocked: body.isLocked,
      equippedRelicIds: body.equippedRelicIds,
    });

    return {
      ok: true,
      data: result,
    };
  }

  @Post(':partyId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Leave party',
    description: 'Remove the user from the party'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully left party'
  })
  async leaveParty(
    @Param('partyId') partyId: string,
    @Req() request: Request,
  ): Promise<{ ok: true; data: { message: string; newLeader?: string } }> {
    const wallet = (request as any).user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.partiesService.leaveParty(wallet, partyId);
    return {
      ok: true,
      data: result,
    };
  }

  @Get(':partyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get party details',
    description: 'Get detailed information about a party'
  })
  @ApiResponse({
    status: 200,
    description: 'Party details retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Party not found'
  })
  async getParty(
    @Param('partyId') partyId: string,
  ): Promise<{ ok: true; data: PartyDto }> {
    const party = await this.partiesService.getPartyById(partyId);

    if (!party) {
      throw AppError.notFound(ErrorCode.PARTY_NOT_FOUND, 'Party not found');
    }

    return {
      ok: true,
      data: {
        partyId: party.partyId,
        gateId: party.gateId,
        leader: party.leader,
        capacity: party.capacity,
        state: party.state as PartyStateDto,
        members: party.members.map(member => ({
          wallet: member.wallet,
          displayName: member.displayName,
          avatarId: member.avatarId,
          isReady: member.isReady,
          isLocked: member.isLocked,
          equippedRelicIds: member.equippedRelicIds,
          joinedAt: member.joinedAt.toISOString(),
        })),
        createdAt: party.createdAt.toISOString(),
        updatedAt: party.updatedAt.toISOString(),
      },
    };
  }

  @Post(':partyId/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Start party',
    description: 'Start the party (leader only, requires all members ready and locked)'
  })
  @ApiResponse({
    status: 200,
    description: 'Party started successfully'
  })
  @ApiResponse({
    status: 403,
    description: 'Only leader can start party'
  })
  @ApiResponse({
    status: 409,
    description: 'Not all members are ready/locked'
  })
  async startParty(
    @Param('partyId') partyId: string,
    @Req() request: Request,
  ): Promise<{ ok: true; data: { runId: string; message: string } }> {
    const wallet = (request as any).user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.partiesService.startParty(wallet, partyId);
    return {
      ok: true,
      data: result,
    };
  }

  @Get(':partyId/stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Party event stream',
    description: 'Server-Sent Events stream for real-time party updates'
  })
  @Sse()
  async getPartyStream(
    @Param('partyId') partyId: string,
    @Req() request: Request,
  ): Promise<Observable<MessageEvent>> {
    const wallet = (request as any).user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    // Verify user is in the party
    const party = await this.partiesService.getPartyById(partyId);
    if (!party) {
      throw AppError.notFound(ErrorCode.PARTY_NOT_FOUND, 'Party not found');
    }

    const isMember = party.members.some(member => member.wallet === wallet);
    if (!isMember && party.leader !== wallet) {
      throw AppError.forbidden(ErrorCode.NOT_A_MEMBER, 'Not a member of this party');
    }

    return this.partySseService.getPartyStream(partyId).pipe(
      map((event) => ({
        data: event,
      } as MessageEvent)),
    );
  }

  @Get(':partyId/start-payload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get start payload for game',
    description: 'Get the payload needed to start the game session'
  })
  @ApiResponse({
    status: 200,
    description: 'Start payload retrieved successfully'
  })
  async getStartPayload(
    @Param('partyId') partyId: string,
    @Req() request: Request,
  ): Promise<{ ok: true; data: { redirect: string } }> {
    const wallet = (request as any).user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    const party = await this.partiesService.getPartyById(partyId);

    if (!party) {
      throw AppError.notFound(ErrorCode.PARTY_NOT_FOUND, 'Party not found');
    }

    if (party.state !== 'starting') {
      throw AppError.conflict(ErrorCode.PARTY_STARTED, 'Party is not in starting state');
    }

    if (!party.runId) {
      throw AppError.internalError('Party missing run ID');
    }

    // Get user's member data
    const member = party.members.find(m => m.wallet === wallet);
    if (!member) {
      throw AppError.forbidden(ErrorCode.NOT_A_MEMBER, 'Not a member of this party');
    }

    // Generate game session data (this would integrate with the runs module)
    const gameData = {
      partyId,
      runId: party.runId,
      wallet,
      displayName: member.displayName,
      avatarId: member.avatarId,
      equippedRelicIds: member.equippedRelicIds,
      roomToken: `room_${party.runId}_${wallet}`,
    };

    // In a real implementation, this would set a game session cookie
    // and redirect to the Unity WebGL build

    return {
      ok: true,
      data: {
        redirect: `https://play.${process.env.DOMAIN || 'lvh.me'}/run/${party.runId}`,
      },
    };
  }

  @Get('my-parties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user\'s parties',
    description: 'Get all parties where the user is a leader or member'
  })
  @ApiResponse({
    status: 200,
    description: 'User parties retrieved successfully'
  })
  async getMyParties(@Req() request: Request): Promise<{ ok: true; data: { parties: any[] } }> {
    const wallet = (request as any).user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    const [leaderParties, memberParties] = await Promise.all([
      this.partiesService.getPartiesByLeader(wallet),
      this.partiesService.getPartiesByMember(wallet),
    ]);

    // Combine and deduplicate
    const allParties = [...leaderParties];
    const memberPartyIds = new Set(memberParties.map(p => p.partyId));

    for (const party of memberParties) {
      if (!memberPartyIds.has(party.partyId)) {
        allParties.push(party);
      }
    }

    const parties = allParties.map(party => ({
      partyId: party.partyId,
      gateId: party.gateId,
      leader: party.leader,
      capacity: party.capacity,
      state: party.state,
      memberCount: party.members.length,
      isLeader: party.leader === wallet,
      joinedAt: party.members.find(m => m.wallet === wallet)?.joinedAt.toISOString(),
      createdAt: party.createdAt.toISOString(),
    }));

    return {
      ok: true,
      data: { parties },
    };
  }
}
