import { z } from 'zod';

// Environment validation schema matching the spec requirements
export const envValidationSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DOMAIN: z.string().min(1, 'DOMAIN is required'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  // MongoDB - use custom validation since mongodb:// is not a standard URL protocol
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').optional(),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).default(2),

  // Game handoff
  GB_GAME_TTL_MINUTES: z.coerce.number().int().min(1).max(60).default(5),

  // Chain (Base Sepolia)
  RPC_URL: z.string().url('RPC_URL must be a valid HTTP/HTTPS URL'),
  CHAIN_ID: z.coerce.number().int().min(1).default(84532), // Base Sepolia
  COORDINATOR_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'COORDINATOR_PRIVATE_KEY must be a valid 64-character hex string with 0x prefix'),

  // Contract Addresses
  BOSS_LOG_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'BOSS_LOG_ADDRESS must be a valid Ethereum address').optional(),
  RELIC_721_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'RELIC_721_ADDRESS must be a valid Ethereum address').optional(),
  PLAYER_CARD_SBT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'PLAYER_CARD_SBT_ADDRESS must be a valid Ethereum address').optional(),

  // Storage
  STORAGE_BASE_URL: z.string().url('STORAGE_BASE_URL must be a valid URL for file storage'),

  // Internal
  SERVICE_KEY: z.string().min(16, 'SERVICE_KEY must be at least 16 characters'),
});

// Type inference from the schema
export type EnvironmentConfig = z.infer<typeof envValidationSchema>;

// Validate environment variables at startup
export function validateEnvironment(env: Record<string, unknown>): EnvironmentConfig {
  try {
    return envValidationSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}
