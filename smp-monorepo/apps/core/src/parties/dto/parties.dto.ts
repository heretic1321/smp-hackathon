import { z } from 'zod';
import { Address, DisplayName, AvatarId, GateRank } from '../../common/schemas/base.schema';

// Party member information
export const PartyMember = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  isReady: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  equippedRelicIds: z.array(z.number().int()).max(3).optional(),
  joinedAt: z.string(),
});

export type PartyMemberDto = z.infer<typeof PartyMember>;

// Party state enum
export const PartyState = z.enum(['waiting', 'starting', 'started', 'closed']);

export type PartyStateDto = z.infer<typeof PartyState>;

// Party creation input
export const PartyCreateInput = z.object({
  gateId: z.string().min(1, 'Gate ID is required'),
});

export type PartyCreateInputDto = z.infer<typeof PartyCreateInput>;

// Party update input (for ready/lock states)
export const PartyUpdateInput = z.object({
  isReady: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  equippedRelicIds: z.array(z.number().int()).max(3).optional(),
});

export type PartyUpdateInputDto = z.infer<typeof PartyUpdateInput>;

// Party response
export const Party = z.object({
  partyId: z.string(),
  gateId: z.string(),
  leader: Address,
  capacity: z.number().int().min(1),
  state: PartyState,
  members: z.array(PartyMember),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PartyDto = z.infer<typeof Party>;

// Party join result
export const PartyJoinResult = z.object({
  partyId: z.string(),
  message: z.string(),
});

export type PartyJoinResultDto = z.infer<typeof PartyJoinResult>;

// Party leave result
export const PartyLeaveResult = z.object({
  message: z.string(),
  newLeader: Address.optional(),
});

export type PartyLeaveResultDto = z.infer<typeof PartyLeaveResult>;

// Party start result
export const PartyStartResult = z.object({
  runId: z.string(),
  message: z.string(),
});

export type PartyStartResultDto = z.infer<typeof PartyStartResult>;

// Party ready/lock update result
export const PartyUpdateResult = z.object({
  partyId: z.string(),
  message: z.string(),
});

export type PartyUpdateResultDto = z.infer<typeof PartyUpdateResult>;

// SSE Event types
export const PartyEventType = z.enum([
  'member_joined',
  'member_left',
  'ready_changed',
  'locked_changed',
  'leader_changed',
  'started',
  'closed'
]);

export type PartyEventTypeDto = z.infer<typeof PartyEventType>;

// SSE Event data structures
export const MemberJoinedEvent = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
});

export const MemberLeftEvent = z.object({
  wallet: Address,
});

export const ReadyChangedEvent = z.object({
  wallet: Address,
  isReady: z.boolean(),
});

export const LockedChangedEvent = z.object({
  wallet: Address,
  isLocked: z.boolean(),
});

export const LeaderChangedEvent = z.object({
  wallet: Address,
});

export const StartedEvent = z.object({
  runId: z.string(),
});

export const ClosedEvent = z.object({
  reason: z.string(),
});

// Union type for all SSE events
export const PartyEvent = z.discriminatedUnion('type', [
  z.object({ type: z.literal('member_joined'), data: MemberJoinedEvent }),
  z.object({ type: z.literal('member_left'), data: MemberLeftEvent }),
  z.object({ type: z.literal('ready_changed'), data: ReadyChangedEvent }),
  z.object({ type: z.literal('locked_changed'), data: LockedChangedEvent }),
  z.object({ type: z.literal('leader_changed'), data: LeaderChangedEvent }),
  z.object({ type: z.literal('started'), data: StartedEvent }),
  z.object({ type: z.literal('closed'), data: ClosedEvent }),
]);

export type PartyEventDto = z.infer<typeof PartyEvent>;
