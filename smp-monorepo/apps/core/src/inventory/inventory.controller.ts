import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './services/inventory.service';
import { BlockchainIntegrationService } from '../chain/services/blockchain-integration.service';
import { ZodValidationPipe } from '../core/pipes/zod-validation.pipe';
import {
  InventorySyncRequestDto,
  BulkInventoryQueryDto,
  InventoryResponseDto,
  InventorySyncRequest,
  BulkInventoryQuery,
} from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppError, ErrorCode } from '../common/errors/app.error';

@Controller('inventory')
@ApiTags('Inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly blockchainService: BlockchainIntegrationService,
  ) {}

  @Get(':address')
  @ApiOperation({
    summary: 'Get inventory for address',
    description: 'Retrieve all relics owned by a wallet address from cache'
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            wallet: { type: 'string', example: '0x1234...' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tokenId: { type: 'number', example: 123 },
                  relicType: { type: 'string', example: 'SunspireBand' },
                  affixes: { type: 'object', example: { '+Crit': 8 } },
                  cid: { type: 'string', example: 'QmABC123...' },
                  equipped: { type: 'boolean', example: false }
                }
              }
            },
            totalItems: { type: 'number', example: 5 },
            equippedItems: { type: 'array', items: { type: 'number' }, example: [1, 2] },
            lastUpdated: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
          }
        }
      }
    }
  })
  async getInventory(
    @Param('address') wallet: string,
  ): Promise<{ ok: true; data: InventoryResponseDto }> {
    const inventory = await this.inventoryService.getInventory(wallet);

    return {
      ok: true,
      data: inventory,
    };
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sync inventory from blockchain',
    description: 'Refresh inventory cache from on-chain data'
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory synced successfully'
  })
  async syncInventory(
    @Body(new ZodValidationPipe(InventorySyncRequest)) syncRequest: {
      wallet: string;
      forceRefresh?: boolean;
    },
    @Req() request: any,
  ): Promise<{ ok: true; data: any }> {
    const wallet = request.user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    // Only allow syncing own inventory or admin sync
    if (syncRequest.wallet !== wallet) {
      throw AppError.forbidden(ErrorCode.FORBIDDEN, 'Can only sync own inventory');
    }

    const result = await this.inventoryService.syncInventory(syncRequest);

    return {
      ok: true,
      data: result,
    };
  }

  @Post('equip')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update equipped items',
    description: 'Set which relics are currently equipped (max 3)'
  })
  @ApiResponse({
    status: 200,
    description: 'Equipped items updated successfully'
  })
  async updateEquippedItems(
    @Body() body: { tokenIds: number[] },
    @Req() request: any,
  ): Promise<{ ok: true; data: { message: string } }> {
    const wallet = request.user?.address;

    if (!wallet) {
      throw AppError.unauthorized(ErrorCode.UNAUTHORIZED, 'User not authenticated');
    }

    // Validate max 3 equipped items
    if (body.tokenIds.length > 3) {
      throw AppError.badRequest(
        ErrorCode.VALIDATION_ERROR,
        'Maximum 3 items can be equipped at once'
      );
    }

    await this.inventoryService.updateEquippedItems(wallet, body.tokenIds);

    return {
      ok: true,
      data: {
        message: 'Equipped items updated successfully',
      },
    };
  }

  @Get('equipped/:address')
  @ApiOperation({
    summary: 'Get equipped items',
    description: 'Get all currently equipped relics for a wallet'
  })
  @ApiResponse({
    status: 200,
    description: 'Equipped items retrieved successfully'
  })
  async getEquippedItems(
    @Param('address') wallet: string,
  ): Promise<{ ok: true; data: any[] }> {
    const equippedItems = await this.inventoryService.getEquippedItems(wallet);

    return {
      ok: true,
      data: equippedItems,
    };
  }

  @Get('search/:address')
  @ApiOperation({
    summary: 'Search inventory by type',
    description: 'Search for relics of a specific type in a wallet'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully'
  })
  async searchInventory(
    @Param('address') wallet: string,
    @Query('type') relicType: string,
  ): Promise<{ ok: true; data: any[] }> {
    const items = await this.inventoryService.searchInventoryByType(wallet, relicType);

    return {
      ok: true,
      data: items,
    };
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Get bulk inventory data',
    description: 'Get inventory data for multiple wallets in a single request'
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk inventory retrieved successfully'
  })
  async getBulkInventory(
    @Body(new ZodValidationPipe(BulkInventoryQuery)) query: {
      wallets: string[];
    },
  ): Promise<{ ok: true; data: any }> {
    const result = await this.inventoryService.getBulkInventory(query);

    return {
      ok: true,
      data: result,
    };
  }

  @Get('relic/:relicId')
  @ApiOperation({
    summary: 'Get relic by ID',
    description: 'Get a specific relic by its relicId'
  })
  @ApiResponse({
    status: 200,
    description: 'Relic retrieved successfully'
  })
  async getRelicById(
    @Param('relicId') relicId: string,
  ): Promise<{ ok: true; data: any }> {
    const relic = await this.inventoryService.getRelicById(relicId);
    return {
      ok: true,
      data: relic,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get inventory statistics',
    description: 'Get overall statistics about the inventory system'
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory stats retrieved successfully'
  })
  async getInventoryStats(): Promise<{ ok: true; data: any }> {
    const [inventoryStats, blockchainStats] = await Promise.all([
      this.inventoryService.getInventoryStats(),
      this.blockchainService.getBlockchainStats(),
    ]);

    return {
      ok: true,
      data: {
        inventory: inventoryStats,
        blockchain: blockchainStats,
      },
    };
  }

  @Post('admin/cleanup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cleanup old sync attempts',
    description: 'Remove inventory items that have failed to sync multiple times (admin only)'
  })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed successfully'
  })
  async cleanupSyncAttempts(): Promise<{ ok: true; data: { removed: number } }> {
    const removed = await this.inventoryService.cleanupSyncAttempts();

    return {
      ok: true,
      data: {
        removed,
      },
    };
  }
}
