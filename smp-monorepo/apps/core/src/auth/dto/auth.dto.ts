import { z } from 'zod';
import { Address } from '../../common/schemas/base.schema';

// SIWE Challenge Request
export const SiweChallengeRequest = z.object({
  address: Address,
});

export type SiweChallengeRequestDto = z.infer<typeof SiweChallengeRequest>;

// SIWE Challenge Response
export const SiweChallengeResponse = z.object({
  nonce: z.string().min(1),
});

export type SiweChallengeResponseDto = z.infer<typeof SiweChallengeResponse>;

// SIWE Verify Request
export const SiweVerifyRequest = z.object({
  address: Address,
  message: z.string().min(1),
  signature: z.string().min(1),
});

export type SiweVerifyRequestDto = z.infer<typeof SiweVerifyRequest>;

// SIWE Verify Response
export const SiweVerifyResponse = z.object({
  address: Address,
});

export type SiweVerifyResponseDto = z.infer<typeof SiweVerifyResponse>;

// Auth Me Response
export const AuthMeResponse = z.object({
  address: Address,
  roles: z.array(z.string()),
});

export type AuthMeResponseDto = z.infer<typeof AuthMeResponse>;

// Game Session Cookie Data
export const GameSessionData = z.object({
  partyId: z.string(),
  runId: z.string(),
  wallet: Address,
  displayName: z.string(),
  avatarId: z.string(),
  equippedRelicIds: z.array(z.number().int()).max(3).optional(),
  roomToken: z.string(),
});

export type GameSessionDataDto = z.infer<typeof GameSessionData>;
