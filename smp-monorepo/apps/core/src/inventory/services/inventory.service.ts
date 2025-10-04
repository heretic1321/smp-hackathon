import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from '../../database/schemas/inventory.schema';
import { BlockchainIntegrationService } from '../../chain/services/blockchain-integration.service';
import {
  InventoryResponseDto,
  InventorySyncRequestDto,
  InventorySyncResponseDto,
  BulkInventoryQueryDto,
  BulkInventoryResponseDto,
  InventoryItemDto,
} from '../dto/inventory.dto';
import { AppError, ErrorCode } from '../../common/errors/app.error';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    private readonly blockchainService: BlockchainIntegrationService,
  ) {}

  /**
   * Get inventory for a wallet address
   */
  async getInventory(wallet: string): Promise<InventoryResponseDto> {
    try {
      // Get all inventory items for this wallet
      const items = await this.inventoryModel.find({ wallet }).sort({ tokenId: 1 });

      // Get equipped items (up to 3)
      const equippedItems = items
        .filter(item => item.equipped)
        .map(item => item.tokenId);

      return {
        wallet,
        items: items.map(item => ({
          tokenId: item.tokenId,
          relicId: item.relicId || `relic_${item.tokenId}`,
          relicType: item.relicType,
          name: item.name || `Unknown ${item.relicType}`,
          imageUrl: item.imageUrl || 'https://via.placeholder.com/300x300?text=Relic',
          description: item.description || 'A mysterious relic with unknown properties.',
          benefits: item.benefits || ['Unknown abilities'],
          affixes: Object.fromEntries(item.affixes),
          cid: item.cid,
          equipped: item.equipped,
        })),
        totalItems: items.length,
        equippedItems,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw AppError.internalError('Failed to get inventory', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Sync inventory for a wallet from blockchain
   */
  async syncInventory(syncRequest: InventorySyncRequestDto): Promise<InventorySyncResponseDto> {
    try {
      const { wallet, forceRefresh = false } = syncRequest;

      // Get current cached inventory
      const existingItems = await this.inventoryModel.find({ wallet });
      const existingTokenIds = new Set(existingItems.map(item => item.tokenId));

      // Sync from blockchain
      const blockchainRelics = await this.blockchainService.getRelicsByOwner(wallet);

      let itemsAdded = 0;
      let itemsUpdated = 0;

      for (const blockchainRelic of blockchainRelics) {
        const isExisting = existingTokenIds.has(blockchainRelic.tokenId);

        if (isExisting && !forceRefresh) {
          // Update existing item
          await this.inventoryModel.updateOne(
            { wallet, tokenId: blockchainRelic.tokenId },
            {
              relicType: blockchainRelic.relicType,
              affixes: new Map(Object.entries(blockchainRelic.affixes || {})),
              cid: blockchainRelic.tokenURI,
              lastSynced: new Date(),
              syncAttempts: 0, // Reset on successful sync
            },
          );
          itemsUpdated++;
        } else {
          // Add new item
          await this.inventoryModel.create({
            wallet,
            tokenId: blockchainRelic.tokenId,
            relicType: blockchainRelic.relicType,
            affixes: new Map(Object.entries(blockchainRelic.affixes || {})),
            cid: blockchainRelic.tokenURI,
            equipped: false,
            lastSynced: new Date(),
            syncAttempts: 0,
          });
          itemsAdded++;
        }
      }

      // Mark missing items as out of sync (but don't delete them)
      const blockchainTokenIds = new Set(blockchainRelics.map(r => r.tokenId));
      const missingItems = existingItems.filter(item => !blockchainTokenIds.has(item.tokenId));

      for (const missingItem of missingItems) {
        await this.inventoryModel.updateOne(
          { wallet, tokenId: missingItem.tokenId },
          {
            lastSynced: new Date(),
            syncAttempts: (missingItem.syncAttempts || 0) + 1,
          },
        );
      }

      const totalItems = await this.inventoryModel.countDocuments({ wallet });

      return {
        wallet,
        itemsAdded,
        itemsUpdated,
        totalItems,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw AppError.internalError('Failed to sync inventory', {
        error: error.message,
        wallet: syncRequest.wallet,
      });
    }
  }

  /**
   * Get bulk inventory data for multiple wallets
   */
  async getBulkInventory(query: BulkInventoryQueryDto): Promise<BulkInventoryResponseDto> {
    try {
      const inventories: Array<{
        wallet: string;
        items: InventoryItemDto[];
        totalItems: number;
      }> = [];

      for (const wallet of query.wallets) {
        const inventory = await this.getInventory(wallet);
        inventories.push({
          wallet: inventory.wallet,
          items: inventory.items,
          totalItems: inventory.totalItems,
        });
      }

      return {
        inventories,
        totalWallets: inventories.length,
      };
    } catch (error) {
      throw AppError.internalError('Failed to get bulk inventory', {
        error: error.message,
        wallets: query.wallets,
      });
    }
  }

  /**
   * Update equipped items for a wallet
   */
  async updateEquippedItems(wallet: string, equippedTokenIds: number[]): Promise<void> {
    try {
      // Validate that all token IDs belong to the wallet
      const ownershipResults = await this.blockchainService.batchVerifyOwnership(
        wallet,
        equippedTokenIds,
      );

      const invalidTokens = Object.entries(ownershipResults)
        .filter(([_, owned]) => !owned)
        .map(([tokenId, _]) => parseInt(tokenId));

      if (invalidTokens.length > 0) {
        throw AppError.badRequest(
          ErrorCode.FORBIDDEN,
          `You don't own tokens: ${invalidTokens.join(', ')}`,
          { invalidTokens },
        );
      }

      // Update all items for this wallet
      await this.inventoryModel.updateMany(
        { wallet },
        { equipped: false },
      );

      // Set equipped status for selected items
      if (equippedTokenIds.length > 0) {
        await this.inventoryModel.updateMany(
          { wallet, tokenId: { $in: equippedTokenIds } },
          { equipped: true },
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to update equipped items', {
        error: error.message,
        wallet,
        equippedTokenIds,
      });
    }
  }

  /**
   * Add relic to inventory (when minted in runs)
   */
  async addRelicToInventory(
    wallet: string,
    tokenId: number,
    relicType: string,
    name: string,
    imageUrl: string,
    description: string,
    benefits: string[],
    affixes: Record<string, number>,
    cid: string,
    txHash?: string,
  ): Promise<void> {
    try {
      await this.inventoryModel.findOneAndUpdate(
        { wallet, tokenId },
        {
          wallet,
          tokenId,
          relicType,
          name,
          imageUrl,
          description,
          benefits,
          affixes: new Map(Object.entries(affixes)),
          cid,
          equipped: false,
          txHash,
          mintedAt: new Date(),
          lastSynced: new Date(),
          syncAttempts: 0,
        },
        {
          upsert: true,
          new: true,
        },
      );
    } catch (error) {
      throw AppError.internalError('Failed to add relic to inventory', {
        error: error.message,
        wallet,
        tokenId,
      });
    }
  }

  /**
   * Remove relic from inventory (when transferred/burned)
   */
  async removeRelicFromInventory(wallet: string, tokenId: number): Promise<void> {
    try {
      await this.inventoryModel.deleteOne({ wallet, tokenId });
    } catch (error) {
      throw AppError.internalError('Failed to remove relic from inventory', {
        error: error.message,
        wallet,
        tokenId,
      });
    }
  }

  /**
   * Get inventory stats
   */
  async getInventoryStats(): Promise<{
    totalItems: number;
    totalWallets: number;
    equippedItems: number;
    relicTypes: Record<string, number>;
  }> {
    try {
      const [totalItems, totalWallets, equippedItems, relicTypeStats] = await Promise.all([
        this.inventoryModel.countDocuments(),
        this.inventoryModel.distinct('wallet').then(wallets => wallets.length),
        this.inventoryModel.countDocuments({ equipped: true }),
        this.inventoryModel.aggregate([
          { $group: { _id: '$relicType', count: { $sum: 1 } } },
        ]).then(results =>
          results.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {} as Record<string, number>)
        ),
      ]);

      return {
        totalItems,
        totalWallets,
        equippedItems,
        relicTypes: relicTypeStats,
      };
    } catch (error) {
      throw AppError.internalError('Failed to get inventory stats', {
        error: error.message,
      });
    }
  }

  /**
   * Clean up old sync attempts (maintenance function)
   */
  async cleanupSyncAttempts(): Promise<number> {
    try {
      // Remove items that have failed to sync too many times
      const result = await this.inventoryModel.deleteMany({
        syncAttempts: { $gte: 5 },
        lastSynced: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hours ago
      });

      return result.deletedCount || 0;
    } catch (error) {
      throw AppError.internalError('Failed to cleanup sync attempts', {
        error: error.message,
      });
    }
  }

  /**
   * Get equipped items for a wallet
   */
  async getEquippedItems(wallet: string): Promise<InventoryItemDto[]> {
    try {
      const equippedItems = await this.inventoryModel.find({
        wallet,
        equipped: true,
      }).sort({ tokenId: 1 });

      return equippedItems.map(item => ({
        tokenId: item.tokenId,
        relicId: item.relicId || `relic_${item.tokenId}`,
        relicType: item.relicType,
        name: item.name || `Unknown ${item.relicType}`,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/300x300?text=Relic',
        description: item.description || 'A mysterious relic with unknown properties.',
        benefits: item.benefits || ['Unknown abilities'],
        affixes: Object.fromEntries(item.affixes),
        cid: item.cid,
        equipped: item.equipped,
      }));
    } catch (error) {
      throw AppError.internalError('Failed to get equipped items', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Search inventory by relic type
   */
  async searchInventoryByType(wallet: string, relicType: string): Promise<InventoryItemDto[]> {
    try {
      const items = await this.inventoryModel.find({
        wallet,
        relicType: { $regex: relicType, $options: 'i' },
      }).sort({ tokenId: 1 });

      return items.map(item => ({
        tokenId: item.tokenId,
        relicId: item.relicId || `relic_${item.tokenId}`,
        relicType: item.relicType,
        name: item.name || `Unknown ${item.relicType}`,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/300x300?text=Relic',
        description: item.description || 'A mysterious relic with unknown properties.',
        benefits: item.benefits || ['Unknown abilities'],
        affixes: Object.fromEntries(item.affixes),
        cid: item.cid,
        equipped: item.equipped,
      }));
    } catch (error) {
      throw AppError.internalError('Failed to search inventory', {
        error: error.message,
        wallet,
        relicType,
      });
    }
  }

  /**
   * Get inventory items by token IDs
   */
  async getInventoryItems(wallet: string, tokenIds: number[]): Promise<InventoryItemDto[]> {
    try {
      const items = await this.inventoryModel.find({
        wallet,
        tokenId: { $in: tokenIds },
      }).sort({ tokenId: 1 });

      return items.map(item => ({
        tokenId: item.tokenId,
        relicId: item.relicId || `relic_${item.tokenId}`,
        relicType: item.relicType,
        name: item.name || `Unknown ${item.relicType}`,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/300x300?text=Relic',
        description: item.description || 'A mysterious relic with unknown properties.',
        benefits: item.benefits || ['Unknown abilities'],
        affixes: Object.fromEntries(item.affixes),
        cid: item.cid,
        equipped: item.equipped,
      }));
    } catch (error) {
      throw AppError.internalError('Failed to get inventory items', {
        error: error.message,
        wallet,
        tokenIds,
      });
    }
  }

  /**
   * Get relic by relicId
   */
  async getRelicById(relicId: string): Promise<InventoryItemDto> {
    try {
      const item = await this.inventoryModel.findOne({ relicId });
      
      if (!item) {
        throw AppError.notFound(ErrorCode.PROFILE_NOT_FOUND, 'Relic not found');
      }

      return {
        tokenId: item.tokenId,
        relicId: item.relicId || `relic_${item.tokenId}`,
        relicType: item.relicType,
        name: item.name || `Unknown ${item.relicType}`,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/300x300?text=Relic',
        description: item.description || 'A mysterious relic with unknown properties.',
        benefits: item.benefits || ['Unknown abilities'],
        affixes: Object.fromEntries(item.affixes),
        cid: item.cid,
        equipped: item.equipped,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalError('Failed to get relic by ID', {
        error: error.message,
        relicId,
      });
    }
  }
}
