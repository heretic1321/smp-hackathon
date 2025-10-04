import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({
  collection: 'inventory',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Inventory {
  @Prop({
    type: String,
    required: true,
  })
  wallet: string; // Ethereum address (serves as compound key with tokenId)

  @Prop({
    type: Number,
    required: true,
  })
  tokenId: number; // ERC-721 token ID

  @Prop({
    type: String,
    required: false,
  })
  relicId?: string; // Unique relic identifier for frontend

  @Prop({
    type: String,
    required: true,
  })
  relicType: string; // Type of relic

  @Prop({
    type: String,
    required: false,
  })
  name?: string; // Display name of the relic

  @Prop({
    type: String,
    required: false,
  })
  imageUrl?: string; // Image URL for the relic

  @Prop({
    type: String,
    required: false,
  })
  description?: string; // Description of the relic

  @Prop({
    type: [String],
    required: false,
  })
  benefits?: string[]; // Array of benefit descriptions

  @Prop({
    type: Map,
    of: Number,
    required: true,
  })
  affixes: Map<string, number>; // Relic attributes

  @Prop({
    type: String,
    required: true,
  })
  cid: string; // IPFS CID for metadata

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  equipped: boolean; // Whether this item is currently equipped

  // Blockchain verification data
  @Prop({
    type: String,
    required: false,
  })
  txHash?: string; // Transaction hash that minted this relic

  @Prop({
    type: Date,
    required: false,
  })
  mintedAt?: Date; // When this relic was minted

  // Cache metadata
  @Prop({
    type: Date,
    default: Date.now,
  })
  lastSynced: Date; // Last time this data was synced from blockchain

  @Prop({
    type: Number,
    default: 0,
  })
  syncAttempts: number; // Number of sync attempts

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;
}

// Compound indexes for efficient queries
const InventorySchema = SchemaFactory.createForClass(Inventory);

// Primary compound key (wallet + tokenId)
InventorySchema.index({ wallet: 1, tokenId: 1 }, { unique: true });

// Query indexes
InventorySchema.index({ wallet: 1 });
InventorySchema.index({ equipped: 1 });
InventorySchema.index({ relicType: 1 });
InventorySchema.index({ relicId: 1 }, { sparse: true });
InventorySchema.index({ lastSynced: 1 });
InventorySchema.index({ txHash: 1 }, { sparse: true });

export { InventorySchema };
