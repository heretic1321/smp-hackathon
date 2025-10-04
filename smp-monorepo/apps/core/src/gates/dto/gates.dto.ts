import { z } from 'zod';
import { GateRank } from '../../common/schemas/base.schema';

// Gate creation/update input
export const GateUpsertInput = z.object({
  id: z.string().min(1, 'Gate ID is required'),
  rank: GateRank,
  name: z.string().min(1, 'Gate name is required'),
  description: z.string().min(1, 'Gate description is required'),
  thumbUrl: z.string().url('Thumbnail URL must be a valid URL'),
  mapCode: z.string().min(1, 'Map code is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  isActive: z.boolean().default(true),
});

export type GateUpsertInputDto = z.infer<typeof GateUpsertInput>;

// Gate response
export const Gate = z.object({
  id: z.string(),
  rank: GateRank,
  name: z.string(),
  description: z.string(),
  thumbUrl: z.string().url(),
  mapCode: z.string(),
  capacity: z.number().int().min(1),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type GateDto = z.infer<typeof Gate>;

// Gate with occupancy information
export const GateWithOccupancy = z.object({
  id: z.string(),
  rank: GateRank,
  name: z.string(),
  description: z.string(),
  thumbUrl: z.string().url(),
  mapCode: z.string(),
  capacity: z.number().int().min(1),
  isActive: z.boolean(),
  occupancy: z.array(z.object({
    partyId: z.string(),
    current: z.number().int().min(0),
    max: z.number().int().min(1),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type GateWithOccupancyDto = z.infer<typeof GateWithOccupancy>;

// Gates list response
export const GatesListResponse = z.object({
  gates: z.array(GateWithOccupancy),
});

export type GatesListResponseDto = z.infer<typeof GatesListResponse>;

// Gate occupancy update (for internal use)
export const GateOccupancyUpdate = z.object({
  partyId: z.string(),
  current: z.number().int().min(0),
  max: z.number().int().min(1),
});

export type GateOccupancyUpdateDto = z.infer<typeof GateOccupancyUpdate>;
