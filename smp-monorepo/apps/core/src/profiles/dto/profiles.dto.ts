import { z } from 'zod';
import { Address, DisplayName, AvatarId, ImageUrl, GateRank } from '../../common/schemas/base.schema';

// Profile creation/update input
export const ProfileUpsertInput = z.object({
  displayName: DisplayName,
  avatarId: AvatarId,
  imageUrl: ImageUrl,
});

export type ProfileUpsertInputDto = z.infer<typeof ProfileUpsertInput>;

// Profile response
export const Profile = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  imageUrl: ImageUrl,
  rank: GateRank,
  level: z.number().int().min(1),
  xp: z.number().int().min(0),
  sbtTokenId: z.number().int().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProfileDto = z.infer<typeof Profile>;

// Profile update response (same as Profile but with updated timestamp)
export const ProfileUpdateResponse = Profile;

export type ProfileUpdateResponseDto = z.infer<typeof ProfileUpdateResponse>;

// Get profile by address query
export const GetProfileByAddressQuery = z.object({
  address: Address,
});

export type GetProfileByAddressQueryDto = z.infer<typeof GetProfileByAddressQuery>;
