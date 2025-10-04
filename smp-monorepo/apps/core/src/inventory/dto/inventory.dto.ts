import { z } from 'zod';
import { Address } from '../../common/schemas/base.schema';

// Inventory item information
export const InventoryItem = z.object({
  tokenId: z.number().int(),
  relicId: z.string().optional(),
  relicType: z.string(),
  name: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  affixes: z.record(z.string(), z.number()),
  cid: z.string(),
  equipped: z.boolean().optional(),
});

export type InventoryItemDto = z.infer<typeof InventoryItem>;

// Inventory response
export const InventoryResponse = z.object({
  wallet: Address,
  items: z.array(InventoryItem),
  totalItems: z.number().int().min(0),
  equippedItems: z.array(z.number().int()), // Array of equipped token IDs
  lastUpdated: z.string(),
});

export type InventoryResponseDto = z.infer<typeof InventoryResponse>;

// Inventory sync request (for manual cache refresh)
export const InventorySyncRequest = z.object({
  wallet: Address,
  forceRefresh: z.boolean().optional(),
});

export type InventorySyncRequestDto = z.infer<typeof InventorySyncRequest>;

// Inventory sync response
export const InventorySyncResponse = z.object({
  wallet: Address,
  itemsAdded: z.number().int().min(0),
  itemsUpdated: z.number().int().min(0),
  totalItems: z.number().int().min(0),
  lastUpdated: z.string(),
});

export type InventorySyncResponseDto = z.infer<typeof InventorySyncResponse>;

// Bulk inventory query
export const BulkInventoryQuery = z.object({
  wallets: z.array(Address).min(1).max(50), // Limit to 50 wallets per request
});

export type BulkInventoryQueryDto = z.infer<typeof BulkInventoryQuery>;

// Bulk inventory response
export const BulkInventoryResponse = z.object({
  inventories: z.array(z.object({
    wallet: Address,
    items: z.array(InventoryItem),
    totalItems: z.number().int().min(0),
  })),
  totalWallets: z.number().int().min(0),
});

export type BulkInventoryResponseDto = z.infer<typeof BulkInventoryResponse>;
