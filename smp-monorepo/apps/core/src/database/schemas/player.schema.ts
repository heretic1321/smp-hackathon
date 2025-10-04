import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Address, DisplayName, AvatarId, ImageUrl, GateRank } from '../../common/schemas/base.schema';

export type PlayerDocument = Player & Document;

@Schema({
  collection: 'players',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Player {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  })
  wallet: string; // Ethereum address, serves as _id

  @Prop({
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 24,
    validate: {
      validator: function(v: string) {
        return /^[a-zA-Z0-9_-]+$/.test(v);
      },
      message: 'Display name can only contain letters, numbers, underscores, and hyphens',
    },
  })
  displayName: string;

  @Prop({
    type: String,
    required: true,
  })
  displayNameLower: string; // For case-insensitive unique validation

  @Prop({
    type: String,
    required: true,
  })
  avatarId: string;

  @Prop({
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'imageUrl must be a valid URL',
    },
  })
  imageUrl: string;

  @Prop({
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E',
    required: true,
  })
  rank: string;

  @Prop({
    type: Number,
    min: 1,
    default: 1,
    required: true,
  })
  level: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
    required: true,
  })
  xp: number;

  @Prop({
    type: Number,
    required: false,
  })
  sbtTokenId?: number;

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
  
  @Prop({
    type: Boolean,
    default: false,
  })
  isAdmin: boolean;
}

// Create compound index for display name case-insensitive uniqueness
const PlayerSchema = SchemaFactory.createForClass(Player);

// Pre-save middleware to set displayNameLower
PlayerSchema.pre('save', function(next) {
  if (this.isModified('displayName')) {
    this.displayNameLower = this.displayName.toLowerCase();
  }
  next();
});

// Indexes
PlayerSchema.index({ displayNameLower: 1 }, { unique: true });
PlayerSchema.index({ rank: 1 });
PlayerSchema.index({ level: -1 });
PlayerSchema.index({ xp: -1 });
PlayerSchema.index({ sbtTokenId: 1 }, { sparse: true });

export { PlayerSchema };
