import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Party, PartyDocument } from '../../database/schemas/party.schema';
import { GatesService } from '../../gates/services/gates.service';
import { ProfilesService } from '../../profiles/profiles.service';
import { RunsService } from '../../runs/services/runs.service';
import { PartySseService } from '../sse/party-sse.service';
import {
  PartyCreateInputDto,
  PartyUpdateInputDto,
  PartyJoinResultDto,
  PartyLeaveResultDto,
  PartyStartResultDto,
  PartyUpdateResultDto,
  PartyMemberDto,
  PartyEventDto,
  MemberJoinedEvent,
  MemberLeftEvent,
  ReadyChangedEvent,
  LockedChangedEvent,
  LeaderChangedEvent,
  StartedEvent,
  ClosedEvent,
} from '../dto/parties.dto';
import { AppError, ErrorCode } from '../../common/errors/app.error';

@Injectable()
export class PartiesService {
  constructor(
    @InjectModel(Party.name) private partyModel: Model<PartyDocument>,
    private readonly gatesService: GatesService,
    private readonly profilesService: ProfilesService,
    @Inject(forwardRef(() => RunsService))
    private readonly runsService: RunsService,
    private readonly partySseService: PartySseService,
  ) {}

  /**
   * Create a new party in a gate
   */
  async createParty(
    wallet: string,
    createData: PartyCreateInputDto,
  ): Promise<PartyJoinResultDto> {
    try {
      // Get user's profile
      const profile = await this.profilesService.getProfileByAddress(wallet);
      if (!profile) {
        throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
      }

      // Check if gate exists and has capacity
      const gate = await this.gatesService.getGateById(createData.gateId);
      if (!gate) {
        throw AppError.notFound(ErrorCode.GATE_NOT_FOUND, 'Gate not found');
      }

      if (!gate.isActive) {
        throw AppError.conflict(ErrorCode.GATE_INACTIVE, 'Gate is not active');
      }

      // Check if gate has available capacity
      const availableCapacity = await this.gatesService.getAvailableCapacity(createData.gateId);
      if (availableCapacity < 1) {
        throw AppError.conflict(ErrorCode.PARTY_FULL, 'Gate is at maximum capacity');
      }

      // Generate unique party ID
      const partyId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create party with user as leader
      const party = await this.partyModel.create({
        partyId,
        gateId: createData.gateId,
        leader: wallet,
        capacity: Math.min(3, gate.capacity), // Default to 3 or gate capacity
        state: 'waiting',
        members: [{
          wallet,
          displayName: profile.displayName,
          avatarId: profile.avatarId,
          isReady: false,
          isLocked: false,
          equippedRelicIds: [],
          joinedAt: new Date(),
        }],
      });

      // Update gate occupancy
      await this.gatesService.updateGateOccupancy(createData.gateId, {
        partyId,
        current: 1,
        max: party.capacity,
      });

      // Emit SSE event
      this.partySseService.emitToParty(partyId, {
        type: 'member_joined',
        data: {
          wallet,
          displayName: profile.displayName,
          avatarId: profile.avatarId,
        },
      });

      return {
        partyId,
        message: 'Party created successfully',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to create party', {
        error: error.message,
        wallet,
        gateId: createData.gateId,
      });
    }
  }

  /**
   * Join an existing party
   */
  async joinParty(
    wallet: string,
    partyId: string,
  ): Promise<PartyJoinResultDto> {
    try {
      // Get user's profile
      const profile = await this.profilesService.getProfileByAddress(wallet);
      if (!profile) {
        throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
      }

      // Find the party
      const party = await this.partyModel.findOne({ partyId });
      if (!party) {
        throw AppError.notFound(ErrorCode.PARTY_NOT_FOUND, 'Party not found');
      }

      // Check if party is in a joinable state
      if (party.state !== 'waiting') {
        throw AppError.conflict(ErrorCode.PARTY_STARTED, 'Party is no longer accepting new members');
      }

      // Check if user is already in the party
      const existingMember = party.members.find(member => member.wallet === wallet);
      if (existingMember) {
        return {
          partyId,
          message: 'Already a member of this party',
        };
      }

      // Check if party has capacity
      if (party.members.length >= party.capacity) {
        throw AppError.conflict(ErrorCode.PARTY_FULL, 'Party is full');
      }

      // Add user to party
      party.members.push({
        wallet,
        displayName: profile.displayName,
        avatarId: profile.avatarId,
        isReady: false,
        isLocked: false,
        equippedRelicIds: [],
        joinedAt: new Date(),
      });

      await party.save();

      // Update gate occupancy
      await this.gatesService.updateGateOccupancy(party.gateId, {
        partyId,
        current: party.members.length,
        max: party.capacity,
      });

      // Emit SSE event
      this.partySseService.emitToParty(partyId, {
        type: 'member_joined',
        data: {
          wallet,
          displayName: profile.displayName,
          avatarId: profile.avatarId,
        },
      });

      return {
        partyId,
        message: 'Successfully joined party',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to join party', {
        error: error.message,
        wallet,
        partyId,
      });
    }
  }

  /**
   * Leave a party
   */
  async leaveParty(
    wallet: string,
    partyId: string,
  ): Promise<PartyLeaveResultDto> {
    try {
      // Find the party
      const party = await this.partyModel.findOne({ partyId });
      if (!party) {
        throw AppError.notFound(ErrorCode.PARTY_NOT_FOUND, 'Party not found');
      }

      // Find the member
      const memberIndex = party.members.findIndex(member => member.wallet === wallet);
      if (memberIndex === -1) {
        throw AppError.forbidden(ErrorCode.NOT_A_MEMBER, 'Not a member of this party');
      }

      const member = party.members[memberIndex];
      const isLeader = party.leader === wallet;

      // Remove member from party
      party.members.splice(memberIndex, 1);

      let newLeader: string | undefined;
      let message = 'Left party successfully';

      if (isLeader && party.members.length > 0) {
        // Elect new leader (first remaining member)
        newLeader = party.members[0].wallet;
        party.leader = newLeader;
        message = 'Left party, new leader elected';
      } else if (party.members.length === 0) {
        // Party is empty, close it
        party.state = 'closed';
        message = 'Left party, party disbanded';
      }

      await party.save();

      // Update gate occupancy
      if (party.members.length > 0) {
        await this.gatesService.updateGateOccupancy(party.gateId, {
          partyId,
          current: party.members.length,
          max: party.capacity,
        });
      } else {
        // Remove from gate occupancy
        await this.gatesService.removePartyFromGate(party.gateId, partyId);
      }

      // Emit SSE events
      this.partySseService.emitToParty(partyId, {
        type: 'member_left',
        data: { wallet },
      });

      if (newLeader) {
        this.partySseService.emitToParty(partyId, {
          type: 'leader_changed',
          data: { wallet: newLeader },
        });
      }

      if (party.state === 'closed') {
        this.partySseService.emitToParty(partyId, {
          type: 'closed',
          data: { reason: 'Party disbanded' },
        });
        this.partySseService.cleanupPartyStream(partyId);
      }

      return {
        message,
        newLeader,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to leave party', {
        error: error.message,
        wallet,
        partyId,
      });
    }
  }

  /**
   * Update member ready/lock state
   */
  async updateMemberState(
    wallet: string,
    partyId: string,
    updateData: PartyUpdateInputDto,
  ): Promise<PartyUpdateResultDto> {
    try {
      // Find the party
      const party = await this.partyModel.findOne({ partyId });
      if (!party) {
        throw AppError.notFound(ErrorCode.PARTY_NOT_FOUND, 'Party not found');
      }

      // Find the member
      const memberIndex = party.members.findIndex(member => member.wallet === wallet);
      if (memberIndex === -1) {
        throw AppError.forbidden(ErrorCode.NOT_A_MEMBER, 'Not a member of this party');
      }

      // Update member state
      if (updateData.isReady !== undefined) {
        party.members[memberIndex].isReady = updateData.isReady;

        // Emit ready state change event
        this.partySseService.emitToParty(partyId, {
          type: 'ready_changed',
          data: {
            wallet,
            isReady: updateData.isReady,
          },
        });
      }

      if (updateData.isLocked !== undefined) {
        party.members[memberIndex].isLocked = updateData.isLocked;

        // Emit lock state change event
        this.partySseService.emitToParty(partyId, {
          type: 'locked_changed',
          data: {
            wallet,
            isLocked: updateData.isLocked,
          },
        });
      }

      if (updateData.equippedRelicIds !== undefined) {
        party.members[memberIndex].equippedRelicIds = updateData.equippedRelicIds;
      }

      await party.save();

      return {
        partyId,
        message: 'Member state updated successfully',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to update member state', {
        error: error.message,
        wallet,
        partyId,
      });
    }
  }

  /**
   * Start a party (leader only)
   */
  async startParty(
    wallet: string,
    partyId: string,
  ): Promise<PartyStartResultDto> {
    try {
      // Find the party
      const party = await this.partyModel.findOne({ partyId });
      if (!party) {
        throw AppError.notFound(ErrorCode.PARTY_NOT_FOUND, 'Party not found');
      }

      // Check if user is the leader
      if (party.leader !== wallet) {
        throw AppError.forbidden(ErrorCode.NOT_LEADER, 'Only the party leader can start the party');
      }

      // Check if all members are ready and locked
      const notReadyMembers = party.members.filter(member => !member.isReady);
      const notLockedMembers = party.members.filter(member => !member.isLocked);

      if (notReadyMembers.length > 0) {
        throw AppError.conflict(
          ErrorCode.MEMBER_NOT_READY,
          'All party members must be ready before starting'
        );
      }

      if (notLockedMembers.length > 0) {
        throw AppError.conflict(
          ErrorCode.MEMBER_NOT_LOCKED,
          'All party members must be locked before starting'
        );
      }

      // Create run record
      const participantsData = party.members.map(member => ({
        wallet: member.wallet,
        displayName: member.displayName,
        avatarId: member.avatarId,
        equippedRelicIds: member.equippedRelicIds,
      }));

      // Generate boss ID based on gate (simplified)
      const bossId = `${party.gateId}_BOSS_1`;

      const runId = await this.runsService.createRun(
        partyId,
        party.gateId,
        bossId,
        participantsData,
      );

      // Update party state
      party.state = 'starting';
      party.runId = runId;
      await party.save();

      // Emit start event
      this.partySseService.emitToParty(partyId, {
        type: 'started',
        data: { runId },
      });

      return {
        runId,
        message: 'Party started successfully',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to start party', {
        error: error.message,
        wallet,
        partyId,
      });
    }
  }

  /**
   * Get party by ID
   */
  async getPartyById(partyId: string): Promise<PartyDocument | null> {
    try {
      const party = await this.partyModel.findOne({ partyId });
      return party;
    } catch (error) {
      throw AppError.internalError('Failed to get party', {
        error: error.message,
        partyId,
      });
    }
  }

  /**
   * Get all parties for a gate
   */
  async getPartiesByGate(gateId: string): Promise<PartyDocument[]> {
    try {
      const parties = await this.partyModel.find({
        gateId,
        state: { $in: ['waiting', 'starting'] }
      }).sort({ createdAt: -1 });
      return parties;
    } catch (error) {
      throw AppError.internalError('Failed to get parties by gate', {
        error: error.message,
        gateId,
      });
    }
  }

  /**
   * Get parties by leader
   */
  async getPartiesByLeader(wallet: string): Promise<PartyDocument[]> {
    try {
      const parties = await this.partyModel.find({
        leader: wallet,
        state: { $in: ['waiting', 'starting'] }
      }).sort({ createdAt: -1 });
      return parties;
    } catch (error) {
      throw AppError.internalError('Failed to get parties by leader', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Get parties where user is a member
   */
  async getPartiesByMember(wallet: string): Promise<PartyDocument[]> {
    try {
      const parties = await this.partyModel.find({
        'members.wallet': wallet,
        state: { $in: ['waiting', 'starting'] }
      }).sort({ createdAt: -1 });
      return parties;
    } catch (error) {
      throw AppError.internalError('Failed to get parties by member', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Close a party (admin/internal function)
   */
  async closeParty(partyId: string, reason: string = 'Party closed'): Promise<void> {
    try {
      const party = await this.partyModel.findOne({ partyId });
      if (!party) {
        return; // Party already doesn't exist
      }

      party.state = 'closed';
      await party.save();

      // Remove from gate occupancy
      await this.gatesService.removePartyFromGate(party.gateId, partyId);

      // Emit close event
      this.partySseService.emitToParty(partyId, {
        type: 'closed',
        data: { reason },
      });

      // Clean up SSE stream
      this.partySseService.cleanupPartyStream(partyId);
    } catch (error) {
      throw AppError.internalError('Failed to close party', {
        error: error.message,
        partyId,
      });
    }
  }

  /**
   * Clean up old parties (call periodically)
   */
  async cleanupOldParties(): Promise<number> {
    try {
      // Close parties that have been waiting for too long (1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const oldParties = await this.partyModel.find({
        state: 'waiting',
        createdAt: { $lt: oneHourAgo },
      });

      let closedCount = 0;
      for (const party of oldParties) {
        await this.closeParty(party.partyId, 'Party expired due to inactivity');
        closedCount++;
      }

      return closedCount;
    } catch (error) {
      throw AppError.internalError('Failed to cleanup old parties', {
        error: error.message,
      });
    }
  }
}
