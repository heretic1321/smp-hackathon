import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RunDocument = Run & Document;

@Schema({
  collection: 'runs',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Run {
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  runId: string; // e.g., "run_12345_abc123"

  @Prop({
    type: String,
    required: true,
  })
  partyId: string; // Reference to the party that started this run

  @Prop({
    type: String,
    required: true,
  })
  gateId: string; // Gate where the run took place

  // Run participants with their contributions
  @Prop({
    type: [{
      wallet: { type: String, required: true },
      displayName: { type: String, required: true },
      avatarId: { type: String, required: true },
      equippedRelicIds: [{ type: Number }],
      damage: { type: Number, required: true, min: 0 },
      normalKills: { type: Number, required: true, min: 0 },
    }],
    required: true,
  })
  participants: Array<{
    wallet: string;
    displayName: string;
    avatarId: string;
    equippedRelicIds?: number[];
    damage: number;
    normalKills: number;
  }>;

  // Boss information
  @Prop({
    type: String,
    required: true,
  })
  bossId: string;

  // Run timing
  @Prop({
    type: Date,
    required: true,
  })
  startedAt: Date;

  @Prop({
    type: Date,
    required: false,
  })
  endedAt?: Date;

  // Blockchain transaction data
  @Prop({
    type: String,
    required: false,
  })
  txHash?: string;

  // Minted relics from this run
  @Prop({
    type: [{
      tokenId: { type: Number, required: true },
      relicType: { type: String, required: true },
      affixes: { type: Map, of: Number },
      cid: { type: String, required: true },
      owner: { type: String, required: true },
    }],
    default: [],
  })
  mintedRelics: Array<{
    tokenId: number;
    relicType: string;
    affixes: Map<string, number>;
    cid: string;
    owner: string;
  }>;

  // Player rewards and updates
  @Prop({
    type: [{
      wallet: { type: String, required: true },
      xp: { type: Number, required: true, min: 0 },
      level: { type: Number, required: true, min: 1 },
      rank: { type: String, required: true },
      sbtTokenId: { type: Number, required: false },
    }],
    default: [],
  })
  xpAwards: Array<{
    wallet: string;
    xp: number;
    level: number;
    rank: string;
    sbtTokenId?: number;
  }>;

  // Rank ups that occurred
  @Prop({
    type: [{
      wallet: { type: String, required: true },
      from: { type: String, required: true },
      to: { type: String, required: true },
    }],
    default: [],
  })
  rankUps: Array<{
    wallet: string;
    from: string;
    to: string;
  }>;

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

// Indexes for efficient queries
const RunSchema = SchemaFactory.createForClass(Run);

RunSchema.index({ partyId: 1 });
RunSchema.index({ gateId: 1, startedAt: -1 });
RunSchema.index({ endedAt: -1 }, { sparse: true });
RunSchema.index({ txHash: 1 }, { sparse: true });
RunSchema.index({ 'participants.wallet': 1 });
RunSchema.index({ bossId: 1 });

export { RunSchema };
