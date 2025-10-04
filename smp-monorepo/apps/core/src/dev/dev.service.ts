import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gate, GateDocument } from '../database/schemas/gate.schema';
import { Inventory, InventoryDocument } from '../database/schemas/inventory.schema';
import { Player, PlayerDocument } from '../database/schemas/player.schema';
import { Run, RunDocument } from '../database/schemas/run.schema';
import { Party, PartyDocument } from '../database/schemas/party.schema';
import { ProfilesService } from '../profiles/profiles.service';
import { AppError, ErrorCode } from '../common/errors/app.error';

const SEED_GATES = [
  {
    id: 'E_GOBLIN_CAVE',
    rank: 'E',
    name: 'Goblin Cave',
    description: 'A dark cave infested with weak goblins. Perfect for beginners.',
    thumbUrl: 'https://picsum.photos/seed/goblin/400/300',
    mapCode: 'map_goblin_cave_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'E_SLIME_FOREST',
    rank: 'E',
    name: 'Slime Forest',
    description: 'A peaceful forest where slimes roam freely.',
    thumbUrl: 'https://picsum.photos/seed/slime/400/300',
    mapCode: 'map_slime_forest_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'D_ORC_CAMP',
    rank: 'D',
    name: 'Orc War Camp',
    description: 'A fortified camp where orcs train for battle. Moderate danger.',
    thumbUrl: 'https://picsum.photos/seed/orc/400/300',
    mapCode: 'map_orc_camp_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'D_ABANDONED_MINE',
    rank: 'D',
    name: 'Abandoned Mine',
    description: 'An old mine haunted by restless spirits and undead miners.',
    thumbUrl: 'https://picsum.photos/seed/mine/400/300',
    mapCode: 'map_abandoned_mine_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'C_FROST_TEMPLE',
    rank: 'C',
    name: 'Frost Temple',
    description: 'An ancient temple frozen in time. Ice elementals guard its halls.',
    thumbUrl: 'https://picsum.photos/seed/frost/400/300',
    mapCode: 'map_frost_temple_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'C_VOLCANIC_LAIR',
    rank: 'C',
    name: 'Volcanic Lair',
    description: 'A scorching dungeon filled with fire demons and lava beasts.',
    thumbUrl: 'https://picsum.photos/seed/volcano/400/300',
    mapCode: 'map_volcanic_lair_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'B_DARK_CATHEDRAL',
    rank: 'B',
    name: 'Dark Cathedral',
    description: 'A corrupted cathedral where dark priests perform forbidden rituals.',
    thumbUrl: 'https://picsum.photos/seed/cathedral/400/300',
    mapCode: 'map_dark_cathedral_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'B_SHADOW_FORTRESS',
    rank: 'B',
    name: 'Shadow Fortress',
    description: 'A massive fortress shrouded in darkness. High-level enemies await.',
    thumbUrl: 'https://picsum.photos/seed/fortress/400/300',
    mapCode: 'map_shadow_fortress_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'A_DEMON_PALACE',
    rank: 'A',
    name: 'Demon Palace',
    description: 'The palace of a demon lord. Only the strongest hunters should enter.',
    thumbUrl: 'https://picsum.photos/seed/demon/400/300',
    mapCode: 'map_demon_palace_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'A_DRAGON_NEST',
    rank: 'A',
    name: 'Dragon\'s Nest',
    description: 'Home to an ancient dragon. Extreme danger - form a strong party!',
    thumbUrl: 'https://picsum.photos/seed/dragon/400/300',
    mapCode: 'map_dragon_nest_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'S_VOID_DIMENSION',
    rank: 'S',
    name: 'Void Dimension',
    description: 'A dimension beyond reality where eldritch horrors dwell. Death is certain.',
    thumbUrl: 'https://picsum.photos/seed/void/400/300',
    mapCode: 'map_void_dimension_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'S_MONARCH_THRONE',
    rank: 'S',
    name: 'Shadow Monarch\'s Throne',
    description: 'The final challenge. Face the Shadow Monarch himself. Only legends survive.',
    thumbUrl: 'https://picsum.photos/seed/monarch/400/300',
    mapCode: 'map_monarch_throne_01',
    capacity: 3,
    isActive: true,
  },
];

const RELIC_TYPES = ['sword', 'dagger', 'bow', 'staff', 'shield', 'armor', 'helmet', 'boots', 'ring', 'amulet'];

@Injectable()
export class DevService {
  constructor(
    @InjectModel(Gate.name) private gateModel: Model<GateDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Run.name) private runModel: Model<RunDocument>,
    @InjectModel(Party.name) private partyModel: Model<PartyDocument>,
    private readonly profilesService: ProfilesService,
  ) {}

  /**
   * Seed gates into database
   */
  async seedGates(): Promise<any[]> {
    const seededGates: any[] = [];

    for (const gateData of SEED_GATES) {
      const gate = await this.gateModel.findOneAndUpdate(
        { id: gateData.id },
        {
          ...gateData,
          occupancy: [],
        },
        {
          upsert: true,
          new: true,
        },
      );
      if (gate) {
        seededGates.push(gate.toObject());
      }
    }

    return seededGates;
  }

  /**
   * Mint a test relic directly to inventory
   */
  async mintTestRelic(wallet: string, relicType?: string): Promise<any> {
    const type = relicType || RELIC_TYPES[Math.floor(Math.random() * RELIC_TYPES.length)];
    const tokenId = Date.now() + Math.floor(Math.random() * 1000);

    // Generate random affixes
    const affixes = {
      strength: Math.floor(Math.random() * 20) + 1,
      agility: Math.floor(Math.random() * 20) + 1,
      intelligence: Math.floor(Math.random() * 20) + 1,
      vitality: Math.floor(Math.random() * 20) + 1,
    };

    const relic = await this.inventoryModel.create({
      wallet,
      tokenId,
      relicType: type,
      affixes: new Map(Object.entries(affixes)),
      cid: `Qm${Math.random().toString(36).substr(2, 44)}`,
      equipped: false,
      mintedAt: new Date(),
      lastSynced: new Date(),
      syncAttempts: 0,
    });

    return {
      tokenId,
      relicType: type,
      affixes,
      cid: relic.cid,
      equipped: false,
    };
  }

  /**
   * Add XP to profile
   */
  async addXp(wallet: string, xp: number): Promise<any> {
    const profile = await this.profilesService.getProfileByAddress(wallet);
    if (!profile) {
      throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
    }

    const newXp = profile.xp + xp;
    const newLevel = profile.level + Math.floor(xp / 1000); // 1000 XP per level

    await this.profilesService.updatePlayerStats(wallet, {
      xp: newXp,
      level: Math.max(1, newLevel),
    });

    return this.profilesService.getProfileByAddress(wallet);
  }

  /**
   * Set rank directly
   */
  async setRank(wallet: string, rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'): Promise<any> {
    await this.profilesService.updatePlayerStats(wallet, { rank });
    return this.profilesService.getProfileByAddress(wallet);
  }

  /**
   * Simulate a boss kill with rewards
   */
  async simulateBossKill(
    wallet: string,
    gateId: string,
    bossId: string,
    damage: number,
  ): Promise<any> {
    const profile = await this.profilesService.getProfileByAddress(wallet);
    if (!profile) {
      throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
    }

    // Award XP
    const xpGained = Math.floor(damage / 10);
    const newXp = profile.xp + xpGained;
    const newLevel = profile.level + Math.floor(xpGained / 1000);

    await this.profilesService.updatePlayerStats(wallet, {
      xp: newXp,
      level: Math.max(1, newLevel),
    });

    // Mint a relic
    const relic = await this.mintTestRelic(wallet);

    return {
      xpGained,
      newXp,
      newLevel,
      relic,
      bossId,
      gateId,
    };
  }

  /**
   * Mint or update SBT profile
   */
  async mintOrUpdateSbt(wallet: string): Promise<any> {
    const profile = await this.profilesService.getProfileByAddress(wallet);
    if (!profile) {
      throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Profile not found');
    }

    // Generate or use existing SBT token ID
    const sbtTokenId = profile.sbtTokenId || Date.now() + Math.floor(Math.random() * 1000);

    await this.profilesService.updatePlayerStats(wallet, { sbtTokenId });

    return {
      sbtTokenId,
      wallet,
      rank: profile.rank,
      level: profile.level,
      xp: profile.xp,
      message: profile.sbtTokenId ? 'SBT updated' : 'SBT minted',
    };
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<any> {
    const [gateCount, playerCount, runCount, partyCount, inventoryCount] = await Promise.all([
      this.gateModel.countDocuments(),
      this.playerModel.countDocuments(),
      this.runModel.countDocuments(),
      this.partyModel.countDocuments(),
      this.inventoryModel.countDocuments(),
    ]);

    return {
      gates: gateCount,
      players: playerCount,
      runs: runCount,
      parties: partyCount,
      relics: inventoryCount,
    };
  }

  /**
   * Reset profile to starting values
   */
  async resetProfile(wallet: string): Promise<any> {
    await this.profilesService.updatePlayerStats(wallet, {
      rank: 'E',
      level: 1,
      xp: 0,
      sbtTokenId: undefined,
    });

    return this.profilesService.getProfileByAddress(wallet);
  }

  /**
   * Clear user's inventory
   */
  async clearInventory(wallet: string): Promise<number> {
    const result = await this.inventoryModel.deleteMany({ wallet });
    return result.deletedCount;
  }
}

