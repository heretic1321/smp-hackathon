import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../database/schemas/player.schema';
import { Inventory, InventoryDocument } from '../database/schemas/inventory.schema';
import { Run, RunDocument } from '../database/schemas/run.schema';
import { AppError } from '../common/errors/app.error';

export interface GameStartData {
  player: {
    displayName: string;
    rank: string;
    level: number;
    xp: number;
    avatarId: string;
    imageUrl: string;
  };
  currentMission: {
    gateId: string;
    gateName: string;
    bossName: string;
    difficulty: string;
    description: string;
  };
  equippedRelics: Array<{
    tokenId: number;
    name: string;
    relicType: string;
    imageUrl: string;
    benefits: string[];
  }>;
  gameFeatures: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export interface GameCompletionData {
  player: {
    displayName: string;
    rank: string;
    level: number;
    xp: number;
    avatarId: string;
    imageUrl: string;
  };
  achievements: {
    dungeonsConquered: number;
    legendaryRelics: number;
    finalRank: string;
    totalXp: number;
    playTime: string;
  };
  rewards: Array<{
    type: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
  }>;
  recentRelics: Array<{
    tokenId: number;
    name: string;
    relicType: string;
    imageUrl: string;
    rarity: string;
  }>;
}

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(Run.name) private runModel: Model<RunDocument>,
  ) {}

  async getGameStartData(wallet: string): Promise<GameStartData> {
    try {
      // Get player profile
      const player = await this.playerModel.findOne({ wallet }).exec();
      if (!player) {
        throw AppError.notFound('Player profile not found');
      }

      // Get equipped relics
      const equippedRelics = await this.inventoryModel
        .find({ wallet, equipped: true })
        .limit(3)
        .exec();

      // Get recent run for current mission
      const recentRun = await this.runModel
        .findOne({ 'participants.wallet': wallet })
        .sort({ startedAt: -1 })
        .exec();

      // Mock current mission data (in real implementation, this would come from gates/dungeons)
      const currentMission = {
        gateId: recentRun?.gateId || 'gate_001',
        gateName: 'Shadow Monarch\'s Awakening',
        bossName: 'Ancient Shadow Dragon',
        difficulty: 'S-Rank',
        description: 'Face the ultimate challenge and prove your worth as the Shadow Monarch'
      };

      // Game features
      const gameFeatures = [
        {
          title: 'Shadow Army Command',
          description: 'Command your army of shadow soldiers in epic battles',
          icon: '👥'
        },
        {
          title: 'Blockchain Relics',
          description: 'Own unique NFT relics with real value',
          icon: '⚔️'
        },
        {
          title: 'Real-time Combat',
          description: 'Engage in fast-paced multiplayer battles',
          icon: '⚡'
        },
        {
          title: 'Boss Hunting',
          description: 'Hunt legendary bosses and earn rewards',
          icon: '🏆'
        }
      ];

      return {
        player: {
          displayName: player.displayName,
          rank: player.rank,
          level: player.level,
          xp: player.xp,
          avatarId: player.avatarId,
          imageUrl: player.imageUrl,
        },
        currentMission,
        equippedRelics: equippedRelics.map(relic => ({
          tokenId: relic.tokenId,
          name: relic.name || `${relic.relicType} Relic`,
          relicType: relic.relicType,
          imageUrl: relic.imageUrl || '/api/placeholder/64/64',
          benefits: relic.benefits || ['Enhanced Power', 'Shadow Mastery'],
        })),
        gameFeatures,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalError('Failed to get game start data', {
        error: error.message,
        wallet,
      });
    }
  }

  async getGameCompletionData(wallet: string): Promise<GameCompletionData> {
    try {
      // Get player profile
      const player = await this.playerModel.findOne({ wallet }).exec();
      if (!player) {
        throw AppError.notFound('Player profile not found');
      }

      // Get completed runs count
      const completedRuns = await this.runModel
        .countDocuments({ 
          'participants.wallet': wallet,
          status: 'completed'
        })
        .exec();

      // Get legendary relics (S-rank or higher)
      const legendaryRelics = await this.inventoryModel
        .find({ 
          wallet,
          $or: [
            { 'affixes.rarity': { $gte: 5 } },
            { relicType: { $in: ['sword', 'crown', 'shadow'] } }
          ]
        })
        .limit(5)
        .exec();

      // Get recent relics
      const recentRelics = await this.inventoryModel
        .find({ wallet })
        .sort({ createdAt: -1 })
        .limit(3)
        .exec();

      // Calculate play time (mock data for now)
      const playTime = '2h 34m';

      // Generate rewards based on achievements
      const rewards = [
        {
          type: 'relic',
          name: 'Shadow Monarch\'s Crown',
          description: 'Legendary NFT Relic',
          icon: '👑',
          rarity: 'Legendary'
        },
        {
          type: 'currency',
          name: '1000 Shadow Coins',
          description: 'In-Game Currency',
          icon: '🪙',
          rarity: 'Common'
        }
      ];

      return {
        player: {
          displayName: player.displayName,
          rank: player.rank,
          level: player.level,
          xp: player.xp,
          avatarId: player.avatarId,
          imageUrl: player.imageUrl,
        },
        achievements: {
          dungeonsConquered: completedRuns,
          legendaryRelics: legendaryRelics.length,
          finalRank: player.rank,
          totalXp: player.xp,
          playTime,
        },
        rewards,
        recentRelics: recentRelics.map(relic => ({
          tokenId: relic.tokenId,
          name: relic.name || `${relic.relicType} Relic`,
          relicType: relic.relicType,
          imageUrl: relic.imageUrl || '/api/placeholder/64/64',
          rarity: this.getRarityFromAffixes(relic.affixes),
        })),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalError('Failed to get game completion data', {
        error: error.message,
        wallet,
      });
    }
  }

  private getRarityFromAffixes(affixes: Map<string, number>): string {
    const rarityValue = affixes.get('rarity') || 1;
    if (rarityValue >= 5) return 'Legendary';
    if (rarityValue >= 4) return 'Epic';
    if (rarityValue >= 3) return 'Rare';
    if (rarityValue >= 2) return 'Uncommon';
    return 'Common';
  }
}
