import { z } from 'zod';
import { Address, DisplayName, AvatarId } from '../../common/schemas/base.schema';

// Contribution data for each player
export const Contribution = z.object({
  wallet: Address,
  damage: z.number().int().min(0),
});

export type ContributionDto = z.infer<typeof Contribution>;

// Run creation input (when party starts)
export const StartRunResult = z.object({
  runId: z.string(),
  roomToken: z.string(),
});

export type StartRunResultDto = z.infer<typeof StartRunResult>;

// Run finish input from game client
export const FinishRunInput = z.object({
  bossId: z.string().min(1, 'Boss ID is required'),
  contributions: z.array(Contribution).min(1, 'At least one contribution is required'),
});

export type FinishRunInputDto = z.infer<typeof FinishRunInput>;

// Run finish result (blockchain transaction)
export const FinishRunResult = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  relics: z.array(z.object({
    tokenId: z.number().int(),
    cid: z.string(),
  })),
});

export type FinishRunResultDto = z.infer<typeof FinishRunResult>;

// Participant information
export const RunParticipant = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  damage: z.number().int().min(0),
  normalKills: z.number().int().min(0),
});

export type RunParticipantDto = z.infer<typeof RunParticipant>;

// XP award information
export const XpAward = z.object({
  wallet: Address,
  xp: z.number().int(),
});

export type XpAwardDto = z.infer<typeof XpAward>;

// Rank up information
export const RankUp = z.object({
  wallet: Address,
  from: z.string(),
  to: z.string(),
});

export type RankUpDto = z.infer<typeof RankUp>;

// Run summary for results page
export const ResultSummary = z.object({
  runId: z.string(),
  gateId: z.string(),
  bossId: z.string(),
  participants: z.array(RunParticipant),
  mintedRelics: z.array(z.object({
    tokenId: z.number().int(),
    cid: z.string(),
  })),
  xpAwards: z.array(XpAward),
  rankUps: z.array(RankUp).optional(),
  completedAt: z.string(),
});

export type ResultSummaryDto = z.infer<typeof ResultSummary>;

// Outbox entry for idempotency
export const OutboxEntry = z.object({
  runId: z.string(),
  key: z.string(), // Idempotency key
  response: z.any(), // Stored response
  createdAt: z.string(),
});

export type OutboxEntryDto = z.infer<typeof OutboxEntry>;

// Blockchain transaction data
export const BlockchainTx = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  status: z.enum(['pending', 'confirmed', 'failed']),
  confirmations: z.number().int().min(0),
  gasUsed: z.number().int().optional(),
  gasPrice: z.string().optional(),
  blockNumber: z.number().int().optional(),
});

export type BlockchainTxDto = z.infer<typeof BlockchainTx>;

// Minted relic information
export const MintedRelic = z.object({
  tokenId: z.number().int(),
  relicType: z.string(),
  affixes: z.record(z.string(), z.number()),
  cid: z.string(),
  owner: Address,
});

export type MintedRelicDto = z.infer<typeof MintedRelic>;
