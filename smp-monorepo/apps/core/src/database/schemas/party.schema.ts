import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PartyDocument = Party & Document;

@Schema({
  collection: 'parties',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Party {
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  partyId: string; // e.g., "p_12345_abc123"

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  gateId: string; // Reference to the gate this party is in

  @Prop({
    type: String,
    required: true,
  })
  leader: string; // Wallet address of the party leader

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 10, // Reasonable maximum party size
    default: 3,
  })
  capacity: number;

  @Prop({
    type: String,
    required: true,
    enum: ['waiting', 'starting', 'started', 'closed'],
    default: 'waiting',
  })
  state: string;

  // Party members with their states
  @Prop({
    type: [{
      wallet: { type: String, required: true },
      displayName: { type: String, required: true },
      avatarId: { type: String, required: true },
      isReady: { type: Boolean, required: true, default: false },
      isLocked: { type: Boolean, required: true, default: false },
      equippedRelicIds: [{ type: Number }],
      joinedAt: { type: Date, required: true, default: Date.now },
    }],
    default: [],
    validate: {
      validator: function(members: any[]) {
        // Ensure leader is always in members
        const leaderInMembers = members.some(member => member.wallet === this.leader);
        if (!leaderInMembers) {
          return false;
        }
        return true;
      },
      message: 'Party leader must be included in members',
    },
  })
  members: Array<{
    wallet: string;
    displayName: string;
    avatarId: string;
    isReady: boolean;
    isLocked: boolean;
    equippedRelicIds?: number[];
    joinedAt: Date;
  }>;

  // Game session data (when party starts)
  @Prop({
    type: String,
    required: false,
  })
  runId?: string;

  @Prop({
    type: String,
    required: false,
  })
  roomToken?: string; // For Colyseus room authentication

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
const PartySchema = SchemaFactory.createForClass(Party);

// TTL index to automatically clean up old parties (2 hours)
PartySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 }); // 2 hours

PartySchema.index({ gateId: 1, state: 1 });
PartySchema.index({ leader: 1 });
PartySchema.index({ state: 1 });
PartySchema.index({ runId: 1 }, { sparse: true });

export { PartySchema };
