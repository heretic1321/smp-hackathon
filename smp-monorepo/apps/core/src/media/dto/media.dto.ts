import { z } from 'zod';

// Profile image upload request
export const ProfileImageUploadRequest = z.object({
  file: z.any(), // This will be handled by multer
});

export type ProfileImageUploadRequestDto = z.infer<typeof ProfileImageUploadRequest>;

// Profile image upload response
export const ProfileImageUploadResponse = z.object({
  imageUrl: z.string().url(),
  contentHash: z.string(), // SHA256 hash of the uploaded file
});

export type ProfileImageUploadResponseDto = z.infer<typeof ProfileImageUploadResponse>;

// Relic image upload request
export const RelicImageUploadRequest = z.object({
  file: z.any(), // This will be handled by multer
  relicType: z.string().min(1),
  tokenId: z.number().int().min(1),
});

export type RelicImageUploadRequestDto = z.infer<typeof RelicImageUploadRequest>;

// Relic image upload response
export const RelicImageUploadResponse = z.object({
  imageUrl: z.string().url(),
  contentHash: z.string(), // SHA256 hash of the uploaded file
  metadataUrl: z.string().url(), // URL to the metadata JSON
  metadataHash: z.string(), // SHA256 hash of the metadata JSON
});

export type RelicImageUploadResponseDto = z.infer<typeof RelicImageUploadResponse>;

// Relic metadata structure
export const RelicMetadata = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.union([z.string(), z.number()]),
  })),
  external_url: z.string().url().optional(),
});

export type RelicMetadataDto = z.infer<typeof RelicMetadata>;
