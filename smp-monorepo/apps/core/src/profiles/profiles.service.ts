import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../database/schemas/player.schema';
import { ProfileUpsertInputDto } from './dto/profiles.dto';
import { AppError, ErrorCode } from '../common/errors/app.error';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  /**
   * Create or update a player profile
   */
  async upsertProfile(
    wallet: string,
    profileData: ProfileUpsertInputDto,
  ): Promise<PlayerDocument> {
    try {
      // Check if display name is already taken (case-insensitive)
      const existingProfile = await this.playerModel.findOne({
        displayNameLower: profileData.displayName.toLowerCase(),
        wallet: { $ne: wallet }, // Exclude current user
      });

      if (existingProfile) {
        throw AppError.conflict(
          ErrorCode.NAME_TAKEN,
          `Display name "${profileData.displayName}" is already taken`,
          { displayName: profileData.displayName }
        );
      }

      // Create or update profile
      const profile = await this.playerModel.findOneAndUpdate(
        { wallet },
        {
          ...profileData,
          displayNameLower: profileData.displayName.toLowerCase(),
          // Set default values for new profiles
          rank: 'E',
          level: 1,
          xp: 0,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      );

      return profile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw AppError.conflict(
          ErrorCode.NAME_TAKEN,
          `This ${field} is already taken`,
          { field, value: error.keyValue[field] }
        );
      }

      throw AppError.internalError('Failed to create/update profile', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Get profile by wallet address
   */
  async getProfileByAddress(wallet: string): Promise<PlayerDocument | null> {
    try {
      const profile = await this.playerModel.findOne({ wallet });
      return profile;
    } catch (error) {
      throw AppError.internalError('Failed to get profile', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Update player profile (for admin/internal use)
   */
  async updateProfile(
    wallet: string,
    updates: Partial<ProfileUpsertInputDto>,
  ): Promise<PlayerDocument> {
    try {
      // If updating display name, check for conflicts
      if (updates.displayName) {
        const existingProfile = await this.playerModel.findOne({
          displayNameLower: updates.displayName.toLowerCase(),
          wallet: { $ne: wallet },
        });

        if (existingProfile) {
          throw AppError.conflict(
            ErrorCode.NAME_TAKEN,
            `Display name "${updates.displayName}" is already taken`,
            { displayName: updates.displayName }
          );
        }
      }

      const updateData: any = { ...updates };
      if (updates.displayName) {
        updateData.displayNameLower = updates.displayName.toLowerCase();
      }

      const profile = await this.playerModel.findOneAndUpdate(
        { wallet },
        updateData,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!profile) {
        throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
      }

      return profile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw AppError.conflict(
          ErrorCode.NAME_TAKEN,
          `This ${field} is already taken`,
          { field, value: error.keyValue[field] }
        );
      }

      throw AppError.internalError('Failed to update profile', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Update player stats (XP, level, rank, SBT token)
   */
  async updatePlayerStats(
    wallet: string,
    updates: {
      xp?: number;
      level?: number;
      rank?: string;
      sbtTokenId?: number;
    },
  ): Promise<PlayerDocument> {
    try {
      const updateData: any = {};
      if (updates.xp !== undefined) updateData.xp = updates.xp;
      if (updates.level !== undefined) updateData.level = updates.level;
      if (updates.rank !== undefined) updateData.rank = updates.rank;
      if (updates.sbtTokenId !== undefined) updateData.sbtTokenId = updates.sbtTokenId;

      const profile = await this.playerModel.findOneAndUpdate(
        { wallet },
        updateData,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!profile) {
        throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
      }

      return profile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to update player stats', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Get multiple profiles by wallet addresses
   */
  async getProfilesByWallets(wallets: string[]): Promise<PlayerDocument[]> {
    try {
      const profiles = await this.playerModel.find({
        wallet: { $in: wallets },
      });
      return profiles;
    } catch (error) {
      throw AppError.internalError('Failed to get profiles', {
        error: error.message,
        wallets,
      });
    }
  }

  /**
   * Search profiles by display name (partial match, case-insensitive)
   */
  async searchProfiles(
    searchTerm: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<PlayerDocument[]> {
    try {
      const profiles = await this.playerModel
        .find({
          displayNameLower: {
            $regex: searchTerm.toLowerCase(),
            $options: 'i',
          },
        })
        .limit(limit)
        .skip(offset)
        .sort({ displayNameLower: 1 });

      return profiles;
    } catch (error) {
      throw AppError.internalError('Failed to search profiles', {
        error: error.message,
        searchTerm,
      });
    }
  }

  /**
   * Get leaderboard (top players by XP)
   */
  async getLeaderboard(
    limit: number = 10,
    offset: number = 0,
  ): Promise<PlayerDocument[]> {
    try {
      const profiles = await this.playerModel
        .find({})
        .sort({ xp: -1, level: -1 })
        .limit(limit)
        .skip(offset);

      return profiles;
    } catch (error) {
      throw AppError.internalError('Failed to get leaderboard', {
        error: error.message,
      });
    }
  }
}

