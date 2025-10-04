import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gate, GateDocument } from '../../database/schemas/gate.schema';
import { GateUpsertInputDto, GateOccupancyUpdateDto } from '../dto/gates.dto';
import { AppError, ErrorCode } from '../../common/errors/app.error';

@Injectable()
export class GatesService {
  constructor(
    @InjectModel(Gate.name) private gateModel: Model<GateDocument>,
  ) {}

  /**
   * Get all active gates with occupancy information
   */
  async getAllGates(): Promise<GateDocument[]> {
    try {
      const gates = await this.gateModel.find({ isActive: true }).sort({ rank: 1, name: 1 });
      return gates;
    } catch (error) {
      throw AppError.internalError('Failed to get gates', {
        error: error.message,
      });
    }
  }

  /**
   * Get gate by ID with occupancy information
   */
  async getGateById(gateId: string): Promise<GateDocument | null> {
    try {
      const gate = await this.gateModel.findOne({ id: gateId, isActive: true });
      return gate;
    } catch (error) {
      throw AppError.internalError('Failed to get gate', {
        error: error.message,
        gateId,
      });
    }
  }

  /**
   * Create or update a gate (admin function)
   */
  async upsertGate(gateData: GateUpsertInputDto): Promise<GateDocument> {
    try {
      const gate = await this.gateModel.findOneAndUpdate(
        { id: gateData.id },
        {
          ...gateData,
          // Reset occupancy when updating gate
          occupancy: [],
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      );

      return gate;
    } catch (error) {
      if (error.code === 11000) {
        throw AppError.conflict(
          ErrorCode.GATE_NOT_FOUND,
          `Gate with ID "${gateData.id}" already exists`,
          { gateId: gateData.id }
        );
      }

      throw AppError.internalError('Failed to create/update gate', {
        error: error.message,
        gateId: gateData.id,
      });
    }
  }

  /**
   * Update gate occupancy (internal function for party management)
   */
  async updateGateOccupancy(
    gateId: string,
    occupancyUpdate: GateOccupancyUpdateDto,
  ): Promise<GateDocument> {
    try {
      // Find the gate
      const gate = await this.gateModel.findOne({ id: gateId, isActive: true });
      if (!gate) {
        throw AppError.notFound(ErrorCode.GATE_NOT_FOUND, 'Gate not found');
      }

      // Update occupancy array
      const existingOccupancyIndex = gate.occupancy.findIndex(
        occ => occ.partyId === occupancyUpdate.partyId,
      );

      if (existingOccupancyIndex >= 0) {
        // Update existing party occupancy
        gate.occupancy[existingOccupancyIndex] = {
          partyId: occupancyUpdate.partyId,
          current: occupancyUpdate.current,
          max: occupancyUpdate.max,
        };
      } else {
        // Add new party occupancy
        gate.occupancy.push({
          partyId: occupancyUpdate.partyId,
          current: occupancyUpdate.current,
          max: occupancyUpdate.max,
        });
      }

      // Remove empty occupancies
      gate.occupancy = gate.occupancy.filter(occ => occ.current > 0);

      // Save the updated gate
      const updatedGate = await gate.save();
      return updatedGate;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to update gate occupancy', {
        error: error.message,
        gateId,
        occupancyUpdate,
      });
    }
  }

  /**
   * Remove party from gate occupancy (when party disbands)
   */
  async removePartyFromGate(gateId: string, partyId: string): Promise<GateDocument> {
    try {
      const gate = await this.gateModel.findOne({ id: gateId, isActive: true });
      if (!gate) {
        throw AppError.notFound(ErrorCode.GATE_NOT_FOUND, 'Gate not found');
      }

      // Remove the party from occupancy
      gate.occupancy = gate.occupancy.filter(occ => occ.partyId !== partyId);

      const updatedGate = await gate.save();
      return updatedGate;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to remove party from gate', {
        error: error.message,
        gateId,
        partyId,
      });
    }
  }

  /**
   * Seed initial gates (development/admin function)
   */
  async seedGates(): Promise<GateDocument[]> {
    const initialGates: GateUpsertInputDto[] = [
      {
        id: 'C_FROST',
        rank: 'C',
        name: 'Frost Halls',
        description: 'A frozen dungeon filled with icy monsters and treacherous terrain.',
        thumbUrl: 'https://via.placeholder.com/300x200/87CEEB/000000?text=Frost+Halls',
        mapCode: 'FrostHall',
        capacity: 3,
        isActive: true,
      },
      {
        id: 'C_FIRE',
        rank: 'C',
        name: 'Blazing Caves',
        description: 'A volcanic dungeon with rivers of lava and fire-based enemies.',
        thumbUrl: 'https://via.placeholder.com/300x200/FF6347/FFFFFF?text=Blazing+Caves',
        mapCode: 'BlazingCaves',
        capacity: 3,
        isActive: true,
      },
      {
        id: 'D_SHADOW',
        rank: 'D',
        name: 'Shadow Temple',
        description: 'A mysterious temple shrouded in darkness with stealth-based challenges.',
        thumbUrl: 'https://via.placeholder.com/300x200/4B0082/FFFFFF?text=Shadow+Temple',
        mapCode: 'ShadowTemple',
        capacity: 4,
        isActive: true,
      },
      {
        id: 'E_TUTORIAL',
        rank: 'E',
        name: 'Beginner\'s Grove',
        description: 'A safe training area for new shadow monarchs to learn the basics.',
        thumbUrl: 'https://via.placeholder.com/300x200/90EE90/000000?text=Beginner%27s+Grove',
        mapCode: 'TutorialGrove',
        capacity: 5,
        isActive: true,
      },
    ];

    const createdGates: GateDocument[] = [];

    for (const gateData of initialGates) {
      try {
        const gate = await this.upsertGate(gateData);
        createdGates.push(gate);
      } catch (error) {
        // Ignore duplicate key errors during seeding
        if (error.code !== 'DUPLICATE_IDEMPOTENCY_KEY') {
          console.warn(`Failed to seed gate ${gateData.id}:`, error.message);
        }
      }
    }

    return createdGates;
  }

  /**
   * Get gates by rank
   */
  async getGatesByRank(rank: string): Promise<GateDocument[]> {
    try {
      const gates = await this.gateModel.find({ rank, isActive: true }).sort({ name: 1 });
      return gates;
    } catch (error) {
      throw AppError.internalError('Failed to get gates by rank', {
        error: error.message,
        rank,
      });
    }
  }

  /**
   * Check if a gate has available capacity
   */
  async hasAvailableCapacity(gateId: string): Promise<boolean> {
    try {
      const gate = await this.gateModel.findOne({ id: gateId, isActive: true });
      if (!gate) {
        return false;
      }

      const totalOccupancy = gate.occupancy.reduce((sum, occ) => sum + occ.current, 0);
      return totalOccupancy < gate.capacity;
    } catch (error) {
      throw AppError.internalError('Failed to check gate capacity', {
        error: error.message,
        gateId,
      });
    }
  }

  /**
   * Get available capacity for a gate
   */
  async getAvailableCapacity(gateId: string): Promise<number> {
    try {
      const gate = await this.gateModel.findOne({ id: gateId, isActive: true });
      if (!gate) {
        return 0;
      }

      const totalOccupancy = gate.occupancy.reduce((sum, occ) => sum + occ.current, 0);
      return Math.max(0, gate.capacity - totalOccupancy);
    } catch (error) {
      throw AppError.internalError('Failed to get available capacity', {
        error: error.message,
        gateId,
      });
    }
  }
}
