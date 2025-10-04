import { z } from 'zod';

// Base address schema (Ethereum address)
export const Address = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format');

// Gate rank enum
export const GateRank = z.enum(['E', 'D', 'C', 'B', 'A', 'S']);

// Display name validation (3-24 characters)
export const DisplayName = z.string()
  .min(3, 'Display name must be at least 3 characters')
  .max(24, 'Display name must be at most 24 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Display name can only contain letters, numbers, underscores, and hyphens');

// Avatar ID schema
export const AvatarId = z.string().min(1, 'Avatar ID is required');

// Image URL validation
export const ImageUrl = z.string().url('Invalid image URL format');

// Common response envelope schemas
export const SuccessResponse = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    ok: z.literal(true),
    data: dataSchema,
  });

export const ErrorResponse = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
});

export const ApiResponse = <T extends z.ZodType>(dataSchema: T) =>
  z.union([SuccessResponse(dataSchema), ErrorResponse]);

// Pagination schema
export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const PaginatedResponse = <T extends z.ZodType>(itemSchema: T) =>
  SuccessResponse(z.object({
    items: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
  }));
