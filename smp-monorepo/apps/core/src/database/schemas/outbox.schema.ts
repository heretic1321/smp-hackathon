import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OutboxDocument = Outbox & Document;

@Schema({
  collection: 'outbox',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Outbox {
  @Prop({
    type: String,
    required: true,
  })
  runId: string; // Reference to the run

  @Prop({
    type: String,
    required: true,
  })
  key: string; // Idempotency key (e.g., "finish_run_{runId}_{idempotencyKey}")

  @Prop({
    type: Object,
    required: true,
  })
  response: any; // Stored response for idempotent returns

  @Prop({
    type: String,
    required: false,
  })
  txHash?: string; // Blockchain transaction hash

  @Prop({
    type: String,
    required: false,
  })
  status: string; // 'pending', 'confirmed', 'failed'

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

// Compound unique index for idempotency
const OutboxSchema = SchemaFactory.createForClass(Outbox);

OutboxSchema.index({ runId: 1, key: 1 }, { unique: true });
OutboxSchema.index({ txHash: 1 }, { sparse: true });

export { OutboxSchema };
