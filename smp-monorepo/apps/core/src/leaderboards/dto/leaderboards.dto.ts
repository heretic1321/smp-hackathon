import { z } from 'zod';
import { Address, DisplayName, AvatarId } from '../../common/schemas/base.schema';

// Leaderboard entry
export const LeaderboardEntry = z.object({
  rank: z.number().int().min(1),
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  value: z.number(), // The metric being ranked (XP, damage, etc.)
  level: z.number().int().min(1).optional(),
  playerRank: z.string().optional(), // Player's current rank
  change: z.number().int().optional(), // Rank change from previous period
});

export type LeaderboardEntryDto = z.infer<typeof LeaderboardEntry>;

// Leaderboard response
export const LeaderboardResponse = z.object({
  scope: z.enum(['weekly', 'per_boss', 'all_time']),
  refId: z.string().optional(), // Boss ID for per_boss, week key for weekly
  period: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  metric: z.enum(['xp', 'damage', 'kills', 'runs_completed']),
  entries: z.array(LeaderboardEntry),
  totalEntries: z.number().int().min(0),
  lastUpdated: z.string(),
});

export type LeaderboardResponseDto = z.infer<typeof LeaderboardResponse>;

// Weekly leaderboard query
export const WeeklyLeaderboardQuery = z.object({
  weekKey: z.string().regex(/^\d{4}-W\d{2}$/, 'Invalid week format (YYYY-WW)'),
  metric: z.enum(['xp', 'damage', 'kills', 'runs_completed']).default('xp'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type WeeklyLeaderboardQueryDto = z.infer<typeof WeeklyLeaderboardQuery>;

// Per-boss leaderboard query
export const PerBossLeaderboardQuery = z.object({
  bossId: z.string().min(1, 'Boss ID is required'),
  metric: z.enum(['damage', 'kills']).default('damage'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type PerBossLeaderboardQueryDto = z.infer<typeof PerBossLeaderboardQuery>;

// Leaderboard stats
export const LeaderboardStats = z.object({
  totalPlayers: z.number().int().min(0),
  totalRuns: z.number().int().min(0),
  averageScore: z.number().optional(),
  topScore: z.number().optional(),
});

export type LeaderboardStatsDto = z.infer<typeof LeaderboardStats>;

// Player stats for leaderboard context
export const PlayerLeaderboardStats = z.object({
  wallet: Address,
  displayName: DisplayName,
  avatarId: AvatarId,
  currentRank: z.number().int().min(1),
  totalScore: z.number(),
  rankChange: z.number().int().optional(), // From previous period
  percentile: z.number().min(0).max(100).optional(),
});

export type PlayerLeaderboardStatsDto = z.infer<typeof PlayerLeaderboardStats>;
