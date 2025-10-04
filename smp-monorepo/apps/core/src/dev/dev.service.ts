import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gate, GateDocument } from '../database/schemas/gate.schema';
import { Inventory, InventoryDocument } from '../database/schemas/inventory.schema';
import { Player, PlayerDocument } from '../database/schemas/player.schema';
import { Run, RunDocument } from '../database/schemas/run.schema';
import { Party, PartyDocument } from '../database/schemas/party.schema';
import { ProfilesService } from '../profiles/profiles.service';
import { BlockchainIntegrationService } from '../chain/services/blockchain-integration.service';
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

const RELIC_TYPES = [
  {
    relicId: '1',
    type: 'sword',
    name: 'Shadow Monarch\'s Dual Blade',
    description: 'A legendary dual blade infused with the power of shadows. Forged in the deepest dungeons by ancient shadow smiths, this weapon channels the very essence of darkness itself.',
    benefits: ['+50% Shadow Damage', '+30% Critical Strike Chance', 'Shadow Clone: Creates shadow duplicates when attacking', 'Darkness Aura: Intimidates nearby enemies'],
    imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759612747/Gemini_Generated_Image_fdypzafdypzafdyp_mjlfli.png'
  },
  {
    relicId: '2',
    type: 'dagger',
    name: 'Void Assassin\'s Dagger',
    description: 'A razor-sharp dagger that cuts through dimensions. Wielded by the most skilled assassins, it leaves no trace of its passage.',
    benefits: ['+40% Stealth Damage', '+25% Critical Hit Rate', 'Void Strike: Teleports behind target', 'Silent Death: No sound when attacking'],
    imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759611020/Gemini_Generated_Image_czt4nsczt4nsczt4_gnjbmi.png'
  },
  {
    relicId: '3',
    type: 'bow',
    name: 'Storm Archer\'s Bow',
    description: 'An ethereal bow that channels the power of storms. Each arrow carries the fury of lightning and the precision of wind.',
    benefits: ['+60% Ranged Damage', '+35% Attack Speed', 'Lightning Arrows: Chain lightning between enemies', 'Wind Guidance: Arrows never miss'],
    imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759611020/Gemini_Generated_Image_czt4nsczt4nsczt4_gnjbmi.png'
  },
  {
    relicId: '4',
    type: 'staff',
    name: 'Arcane Scholar\'s Staff',
    description: 'A mystical staff imbued with ancient knowledge. It amplifies magical power and channels the wisdom of forgotten mages.',
    benefits: ['+70% Magic Damage', '+50% Mana Regeneration', 'Arcane Mastery: Spells cost 30% less mana', 'Ancient Wisdom: Unlock hidden spell combinations'],
    imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759611020/Gemini_Generated_Image_czt4nsczt4nsczt4_gnjbmi.png'
  },
  {
    relicId: '5',
    type: 'shield',
    name: 'Guardian\'s Bulwark',
    description: 'An unbreakable shield forged from the bones of ancient dragons. It provides unmatched protection and reflects damage back to attackers.',
    benefits: ['+80% Damage Reduction', '+40% Block Chance', 'Dragon\'s Roar: Stuns nearby enemies', 'Reflective Barrier: 50% damage reflection'],
    imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759611020/Gemini_Generated_Image_czt4nsczt4nsczt4_gnjbmi.png'
  }
];

@Injectable()
export class DevService {
  constructor(
    @InjectModel(Gate.name) private gateModel: Model<GateDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Run.name) private runModel: Model<RunDocument>,
    @InjectModel(Party.name) private partyModel: Model<PartyDocument>,
    private readonly profilesService: ProfilesService,
    private readonly blockchainService: BlockchainIntegrationService,
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
    // Only allow sword type relics
    const swordRelic = RELIC_TYPES.find(r => r.type === 'sword');
    const relicData = swordRelic || RELIC_TYPES[0]; // Fallback to first item (which is sword)
    
    // Generate a unique tokenId by checking existing ones
    let tokenId: number;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      tokenId = Date.now() + Math.floor(Math.random() * 10000) + Math.floor(Math.random() * 1000);
      attempts++;
      
      // Check if this tokenId already exists for this wallet
      const existingItem = await this.inventoryModel.findOne({ wallet, tokenId });
      if (!existingItem) break;
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique tokenId after multiple attempts');
      }
    } while (true);

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
      relicId: relicData.relicId,
      relicType: relicData.type,
      name: relicData.name,
      imageUrl: relicData.imageUrl,
      description: relicData.description,
      benefits: relicData.benefits,
      affixes: new Map(Object.entries(affixes)),
      cid: `Qm${Math.random().toString(36).substr(2, 44)}`,
      equipped: false,
      mintedAt: new Date(),
      lastSynced: new Date(),
      syncAttempts: 0,
    });

    return {
      tokenId,
      relicId: relicData.relicId,
      relicType: relicData.type,
      name: relicData.name,
      imageUrl: relicData.imageUrl,
      description: relicData.description,
      benefits: relicData.benefits,
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

  /**
   * Test run with blockchain minting - creates a fake relic and mints it on-chain
   */
  async testRunWithBlockchainMinting(wallet: string, relicId?: string): Promise<{
    txHash: string;
    username: string;
    walletId: string;
    relic: {
      tokenId: number;
      relicId: string;
      relicType: string;
      name: string;
      imageUrl: string;
      description: string;
      benefits: string[];
      affixes: Record<string, number>;
      ipfsCid: string;
    };
  }> {
    try {
      // Get user profile
      const profile = await this.profilesService.getProfileByAddress(wallet);
      if (!profile) {
        throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'User profile not found');
      }

      // Get specified relic data or fallback to sword
      let relicData;
      if (relicId) {
        relicData = RELIC_TYPES.find(r => r.relicId === relicId);
        if (!relicData) {
          throw AppError.validationError(`Relic with ID '${relicId}' not found`);
        }
      } else {
        // Default to sword relic if no relicId specified
        relicData = RELIC_TYPES.find(r => r.type === 'sword') || RELIC_TYPES[0];
      }
      
      // Create fake relic data with enhanced information
      const fakeRelic = {
        relicId: relicData.relicId,
        relicType: relicData.type,
        name: relicData.name,
        imageUrl: relicData.imageUrl,
        description: relicData.description,
        benefits: relicData.benefits,
        affixes: {
          shadow_damage: 25,
          stealth_duration: 20,
          crit_chance: 15,
        },
        ipfsCid: '', // Will be set to unique value during minting
      };

      // Mint relic on blockchain
      const uniqueIpfsCid = `QmTestRelic${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const mintResult = await this.blockchainService.mintRelic(
        wallet,
        fakeRelic.relicType,
        fakeRelic.affixes,
        uniqueIpfsCid,
      );

      // Update the fakeRelic with the unique IPFS CID that was used
      fakeRelic.ipfsCid = uniqueIpfsCid;

      // Add relic to user's inventory in database with enhanced data
      try {
        // Check if this tokenId already exists for this wallet
        const existingItem = await this.inventoryModel.findOne({ wallet, tokenId: mintResult.tokenId });
        if (existingItem) {
          console.warn(`TokenId ${mintResult.tokenId} already exists for wallet ${wallet}, updating existing item`);
          // Update the existing item with new data
          existingItem.name = fakeRelic.name;
          existingItem.imageUrl = fakeRelic.imageUrl;
          existingItem.description = fakeRelic.description;
          existingItem.benefits = fakeRelic.benefits;
          existingItem.affixes = new Map(Object.entries(fakeRelic.affixes));
          existingItem.cid = fakeRelic.ipfsCid;
          existingItem.lastSynced = new Date();
          existingItem.syncAttempts = 0;
          
          await existingItem.save();
          
          // Return the updated item data
          return {
            txHash: mintResult.txHash,
            username: profile.displayName,
            walletId: profile.wallet,
            relic: {
              tokenId: existingItem.tokenId,
              relicId: existingItem.relicId || '',
              relicType: existingItem.relicType,
              name: existingItem.name || '',
              imageUrl: existingItem.imageUrl || '',
              description: existingItem.description || '',
              benefits: existingItem.benefits || [],
              affixes: Object.fromEntries(existingItem.affixes || new Map()),
              ipfsCid: existingItem.cid,
            },
          };
        }

        const inventoryItem = new this.inventoryModel({
          wallet,
          tokenId: mintResult.tokenId,
          relicId: fakeRelic.relicId,
          relicType: fakeRelic.relicType,
          name: fakeRelic.name,
          imageUrl: fakeRelic.imageUrl,
          description: fakeRelic.description,
          benefits: fakeRelic.benefits,
          affixes: new Map(Object.entries(fakeRelic.affixes)),
          cid: fakeRelic.ipfsCid,
          equipped: false,
          mintedAt: new Date(),
          lastSynced: new Date(),
          syncAttempts: 0,
        });

        await inventoryItem.save();
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Fallback: create without enhanced fields if schema doesn't support them yet
        const fallbackItem = new this.inventoryModel({
          wallet,
          tokenId: mintResult.tokenId,
          relicType: fakeRelic.relicType,
          affixes: new Map(Object.entries(fakeRelic.affixes)),
          cid: fakeRelic.ipfsCid,
          equipped: false,
          mintedAt: new Date(),
          lastSynced: new Date(),
          syncAttempts: 0,
        });

        await fallbackItem.save();
      }

      return {
        txHash: mintResult.txHash,
        username: profile.displayName,
        walletId: wallet,
        relic: {
          tokenId: mintResult.tokenId,
          relicId: fakeRelic.relicId,
          relicType: fakeRelic.relicType,
          name: fakeRelic.name,
          imageUrl: fakeRelic.imageUrl,
          description: fakeRelic.description,
          benefits: fakeRelic.benefits,
          affixes: fakeRelic.affixes,
          ipfsCid: fakeRelic.ipfsCid,
        },
      };
    } catch (error) {
      console.error('testRunWithBlockchainMinting error:', error);
      throw AppError.internalError('Failed to complete test run with blockchain minting', {
        error: error.message,
        wallet,
      });
    }
  }
}

