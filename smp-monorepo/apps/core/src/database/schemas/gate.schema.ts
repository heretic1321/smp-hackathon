import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GateDocument = Gate & Document;

@Schema({
  collection: 'gates',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Gate {
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  id: string; // e.g., "C_FROST", "D_FIRE"

  @Prop({
    type: String,
    required: true,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    index: true,
  })
  rank: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

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
      message: 'thumbUrl must be a valid URL',
    },
  })
  thumbUrl: string;

  @Prop({
    type: String,
    required: true,
  })
  mapCode: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    default: 3,
  })
  capacity: number;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  isActive: boolean;

  // Real-time occupancy tracking
  @Prop({
    type: [{
      partyId: { type: String, required: true },
      current: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 1 },
    }],
    default: [],
  })
  occupancy: Array<{
    partyId: string;
    current: number;
    max: number;
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
const GateSchema = SchemaFactory.createForClass(Gate);

GateSchema.index({ rank: 1, isActive: 1 });
GateSchema.index({ isActive: 1 });
GateSchema.index({ capacity: 1 });

export { GateSchema };
