import { z } from 'zod';

// Base types
export const Address = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export const GateRank = z.enum(['E','D','C','B','A','S']);
export const DisplayName = z.string().min(3).max(24);
export const AvatarId = z.string();

// Auth types
export const SiweChallengeRequest = z.object({
  address: Address
});

export const SiweChallengeResponse = z.object({
  nonce: z.string()
});

export const SiweVerifyRequest = z.object({
  address: Address,
  message: z.string(),
  signature: z.string()
});

export const SiweVerifyResponse = z.object({
  address: Address
});

// Admin types
export const AdminCheckResponse = z.object({
  isAdmin: z.boolean(),
  roles: z.array(z.string())
});

// Auth Me Response (updated to include isAdmin)
export const AuthMeResponse = z.object({
  address: Address,
  roles: z.array(z.string()),
  isAdmin: z.boolean()
});

// Profile types
export const Profile = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  imageUrl: z.string().url(),
  rank: GateRank,
  level: z.number().int().min(1),
  xp: z.number().int().min(0),
  sbtTokenId: z.number().int().optional()
});

export const ProfileUpsertInput = z.object({
  displayName: DisplayName,
  avatarId: AvatarId,
  imageUrl: z.string().url()
});

// Gate types
export const Gate = z.object({
  id: z.string(),
  rank: GateRank,
  name: z.string(),
  description: z.string(),
  thumbUrl: z.string().url(),
  mapCode: z.string(),
  capacity: z.number().int().min(1),
  isActive: z.boolean()
});

export const GateOccupancy = z.object({
  partyId: z.string(),
  current: z.number().int(),
  max: z.number().int()
});

export const GateWithOccupancy = Gate.extend({
  occupancy: z.array(GateOccupancy)
});

export const GatesResponse = z.object({
  gates: z.array(GateWithOccupancy)
});

// Party types
export const PartyMember = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  isReady: z.boolean(),
  isLocked: z.boolean(),
  equippedRelicIds: z.array(z.number().int()).max(3).optional()
});

export const Party = z.object({
  partyId: z.string(),
  gateId: z.string(),
  leader: Address,
  capacity: z.number().int(),
  state: z.enum(['waiting','starting','started','closed']),
  members: z.array(PartyMember),
  createdAt: z.string()
});

// Party actions
export const JoinPartyRequest = z.object({
  gateId: z.string()
});

export const ReadyRequest = z.object({
  isReady: z.boolean()
});

export const LockRequest = z.object({
  equippedRelicIds: z.array(z.number().int()).max(3)
});

export const LeavePartyRequest = z.object({});

// Run types
export const Contribution = z.object({
  wallet: Address,
  damage: z.number().int().min(0)
});

export const StartRunResult = z.object({
  runId: z.string(),
  roomToken: z.string()
});

export const FinishRunInput = z.object({
  bossId: z.string().min(1),
  contributions: z.array(Contribution).min(1)
});

export const FinishRunResult = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  relics: z.array(z.object({ tokenId: z.number().int(), cid: z.string() }))
});

export const ResultSummary = z.object({
  runId: z.string(),
  gateId: z.string(),
  bossId: z.string(),
  participants: z.array(z.object({
    wallet: Address,
    displayName: DisplayName,
    avatarId: AvatarId,
    damage: z.number().int().min(0),
    normalKills: z.number().int().min(0)
  })),
  mintedRelics: z.array(z.object({ tokenId: z.number().int(), cid: z.string() })),
  xpAwards: z.array(z.object({ wallet: Address, xp: z.number().int() })),
  rankUps: z.array(z.object({ wallet: Address, from: GateRank, to: GateRank })).optional()
});

// Inventory types
export const InventoryItem = z.object({
  tokenId: z.number().int(),
  relicType: z.string(),
  affixes: z.record(z.string(), z.number()),
  cid: z.string(),
  equipped: z.boolean().optional()
});

export const InventoryResponse = z.object({
  items: z.array(InventoryItem)
});

// Leaderboard types
export const LeaderboardEntry = z.object({
  wallet: Address,
  displayName: DisplayName,
  value: z.number().int()
});

export const LeaderboardResponse = z.object({
  scope: z.enum(['weekly', 'per_boss']),
  refId: z.string(),
  rows: z.array(LeaderboardEntry)
});

// Media types
export const MediaUploadResponse = z.object({
  imageUrl: z.string().url()
});

// Error types
export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional()
});

// Response envelope - generic function to create typed response schemas
export const createApiResponse = <T extends z.ZodTypeAny>(dataSchema: T) => {
  return z.object({
    ok: z.boolean(),
    data: dataSchema.optional(),
    error: ApiError.optional()
  });
};

// Common response types
export const ApiResponse = createApiResponse(z.any());

// Export types
export type Address = z.infer<typeof Address>;
export type GateRank = z.infer<typeof GateRank>;
export type DisplayName = z.infer<typeof DisplayName>;
export type AvatarId = z.infer<typeof AvatarId>;

export type SiweChallengeRequest = z.infer<typeof SiweChallengeRequest>;
export type SiweChallengeResponse = z.infer<typeof SiweChallengeResponse>;
export type SiweVerifyRequest = z.infer<typeof SiweVerifyRequest>;
export type SiweVerifyResponse = z.infer<typeof SiweVerifyResponse>;

export type AdminCheckResponse = z.infer<typeof AdminCheckResponse>;
export type AuthMeResponse = z.infer<typeof AuthMeResponse>;

export type Profile = z.infer<typeof Profile>;
export type ProfileUpsertInput = z.infer<typeof ProfileUpsertInput>;

export type Gate = z.infer<typeof Gate>;
export type GatesResponse = z.infer<typeof GatesResponse>;
export type GateOccupancy = z.infer<typeof GateOccupancy>;
export type GateWithOccupancy = z.infer<typeof GateWithOccupancy>;

export type PartyMember = z.infer<typeof PartyMember>;
export type Party = z.infer<typeof Party>;

export type JoinPartyRequest = z.infer<typeof JoinPartyRequest>;
export type ReadyRequest = z.infer<typeof ReadyRequest>;
export type LockRequest = z.infer<typeof LockRequest>;
export type LeavePartyRequest = z.infer<typeof LeavePartyRequest>;

export type Contribution = z.infer<typeof Contribution>;
export type StartRunResult = z.infer<typeof StartRunResult>;
export type FinishRunInput = z.infer<typeof FinishRunInput>;
export type FinishRunResult = z.infer<typeof FinishRunResult>;
export type ResultSummary = z.infer<typeof ResultSummary>;

export type InventoryItem = z.infer<typeof InventoryItem>;
export type InventoryResponse = z.infer<typeof InventoryResponse>;

export type LeaderboardEntry = z.infer<typeof LeaderboardEntry>;
export type LeaderboardResponse = z.infer<typeof LeaderboardResponse>;

export type MediaUploadResponse = z.infer<typeof MediaUploadResponse>;

export type ApiErrorType = z.infer<typeof ApiError>;
export type ApiResponse<T = any> = {
  ok: boolean;
  data?: T;
  error?: ApiErrorType;  // Fixed: was typeof ApiError
};


