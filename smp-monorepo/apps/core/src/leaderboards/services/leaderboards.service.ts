import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Run, RunDocument } from '../../database/schemas/run.schema';
import { LeaderboardResponseDto, WeeklyLeaderboardQueryDto, PerBossLeaderboardQueryDto, PlayerLeaderboardStatsDto } from '../dto/leaderboards.dto';
import { AppError, ErrorCode } from '../../common/errors/app.error';

@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectModel(Run.name) private runModel: Model<RunDocument>,
  ) {}

  /**
   * Get weekly leaderboard
   */
  async getWeeklyLeaderboard(query: WeeklyLeaderboardQueryDto): Promise<LeaderboardResponseDto> {
    try {
      // Parse week key (YYYY-WW format)
      const [year, week] = query.weekKey.split('-W').map(Number);
      const weekStart = this.getWeekStart(year, week);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Get runs for the week
      const runs = await this.runModel.find({
        endedAt: {
          $gte: weekStart,
          $lt: weekEnd,
        },
      });

      // Calculate metrics based on query
      const entries = await this.calculateWeeklyMetrics(runs, query.metric, query.limit, query.offset);

      return {
        scope: 'weekly',
        refId: query.weekKey,
        period: {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString(),
        },
        metric: query.metric,
        entries,
        totalEntries: entries.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw AppError.internalError('Failed to get weekly leaderboard', {
        error: error.message,
        weekKey: query.weekKey,
        metric: query.metric,
      });
    }
  }

  /**
   * Get per-boss leaderboard
   */
  async getPerBossLeaderboard(query: PerBossLeaderboardQueryDto): Promise<LeaderboardResponseDto> {
    try {
      // Get runs for this boss
      const runs = await this.runModel.find({
        bossId: query.bossId,
        endedAt: { $exists: true },
      });

      // Calculate metrics based on query
      const entries = await this.calculateBossMetrics(runs, query.metric, query.limit, query.offset);

      return {
        scope: 'per_boss',
        refId: query.bossId,
        metric: query.metric,
        entries,
        totalEntries: entries.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw AppError.internalError('Failed to get per-boss leaderboard', {
        error: error.message,
        bossId: query.bossId,
        metric: query.metric,
      });
    }
  }

  /**
   * Get all-time leaderboard
   */
  async getAllTimeLeaderboard(metric: string = 'xp', limit: number = 20, offset: number = 0): Promise<LeaderboardResponseDto> {
    try {
      // Get all completed runs
      const runs = await this.runModel.find({
        endedAt: { $exists: true },
      });

      const entries = await this.calculateAllTimeMetrics(runs, metric, limit, offset);

      return {
        scope: 'all_time',
        metric: metric as 'xp' | 'damage' | 'kills' | 'runs_completed',
        entries,
        totalEntries: entries.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw AppError.internalError('Failed to get all-time leaderboard', {
        error: error.message,
        metric,
      });
    }
  }

  /**
   * Calculate weekly metrics for leaderboard
   */
  private async calculateWeeklyMetrics(
    runs: RunDocument[],
    metric: string,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    // Aggregate runs by player for the week
    const playerStats = new Map<string, {
      wallet: string;
      totalValue: number;
      runCount: number;
      displayName: string;
      avatarId: string;
      level: number;
      playerRank: string;
    }>();

    for (const run of runs) {
      for (const participant of run.participants) {
        const existing = playerStats.get(participant.wallet);

        let value = 0;
        switch (metric) {
          case 'xp':
            // Sum XP from run awards
            const xpAward = run.xpAwards.find(award => award.wallet === participant.wallet);
            value = xpAward ? xpAward.xp : 0;
            break;
          case 'damage':
            value = participant.damage;
            break;
          case 'kills':
            value = participant.normalKills;
            break;
          case 'runs_completed':
            value = 1; // Each run counts as 1 completion
            break;
        }

        if (existing) {
          existing.totalValue += value;
          existing.runCount += 1;
        } else {
          playerStats.set(participant.wallet, {
            wallet: participant.wallet,
            totalValue: value,
            runCount: 1,
            displayName: participant.displayName,
            avatarId: participant.avatarId,
            level: 1, // Would need to fetch from profiles
            playerRank: 'E', // Would need to fetch from profiles
          });
        }
      }
    }

    // Convert to array and sort
    const entries = Array.from(playerStats.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(offset, offset + limit)
      .map((player, index) => ({
        rank: offset + index + 1,
        wallet: player.wallet,
        displayName: player.displayName,
        avatarId: player.avatarId,
        value: player.totalValue,
        level: player.level,
        playerRank: player.playerRank,
        change: 0, // Would need historical data for rank changes
      }));

    return entries;
  }

  /**
   * Calculate per-boss metrics for leaderboard
   */
  private async calculateBossMetrics(
    runs: RunDocument[],
    metric: string,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    // Aggregate runs by player for this boss
    const playerStats = new Map<string, {
      wallet: string;
      bestValue: number;
      runCount: number;
      displayName: string;
      avatarId: string;
      level: number;
      playerRank: string;
    }>();

    for (const run of runs) {
      for (const participant of run.participants) {
        const existing = playerStats.get(participant.wallet);

        let value = 0;
        switch (metric) {
          case 'damage':
            value = participant.damage;
            break;
          case 'kills':
            value = participant.normalKills;
            break;
        }

        if (existing) {
          // Keep the best value for this metric
          existing.bestValue = Math.max(existing.bestValue, value);
          existing.runCount += 1;
        } else {
          playerStats.set(participant.wallet, {
            wallet: participant.wallet,
            bestValue: value,
            runCount: 1,
            displayName: participant.displayName,
            avatarId: participant.avatarId,
            level: 1, // Would need to fetch from profiles
            playerRank: 'E', // Would need to fetch from profiles
          });
        }
      }
    }

    // Convert to array and sort
    const entries = Array.from(playerStats.values())
      .sort((a, b) => b.bestValue - a.bestValue)
      .slice(offset, offset + limit)
      .map((player, index) => ({
        rank: offset + index + 1,
        wallet: player.wallet,
        displayName: player.displayName,
        avatarId: player.avatarId,
        value: player.bestValue,
        level: player.level,
        playerRank: player.playerRank,
        change: 0, // Would need historical data
      }));

    return entries;
  }

  /**
   * Calculate all-time metrics for leaderboard
   */
  private async calculateAllTimeMetrics(
    runs: RunDocument[],
    metric: string,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    // Aggregate all runs by player
    const playerStats = new Map<string, {
      wallet: string;
      totalValue: number;
      runCount: number;
      displayName: string;
      avatarId: string;
      level: number;
      playerRank: string;
    }>();

    for (const run of runs) {
      for (const participant of run.participants) {
        const existing = playerStats.get(participant.wallet);

        let value = 0;
        switch (metric) {
          case 'xp':
            // Sum XP from all runs
            const xpAward = run.xpAwards.find(award => award.wallet === participant.wallet);
            value = xpAward ? xpAward.xp : 0;
            break;
          case 'damage':
            value = participant.damage;
            break;
          case 'kills':
            value = participant.normalKills;
            break;
          case 'runs_completed':
            value = 1;
            break;
        }

        if (existing) {
          existing.totalValue += value;
          existing.runCount += 1;
        } else {
          playerStats.set(participant.wallet, {
            wallet: participant.wallet,
            totalValue: value,
            runCount: 1,
            displayName: participant.displayName,
            avatarId: participant.avatarId,
            level: 1, // Would need to fetch from profiles
            playerRank: 'E', // Would need to fetch from profiles
          });
        }
      }
    }

    // Convert to array and sort
    const entries = Array.from(playerStats.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(offset, offset + limit)
      .map((player, index) => ({
        rank: offset + index + 1,
        wallet: player.wallet,
        displayName: player.displayName,
        avatarId: player.avatarId,
        value: player.totalValue,
        level: player.level,
        playerRank: player.playerRank,
        change: 0, // Would need historical data
      }));

    return entries;
  }

  /**
   * Get current week key (YYYY-WW format)
   */
  private getCurrentWeekKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = this.getWeekNumber(now);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Get week number for a date
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Get week start date from week key
   */
  private getWeekStart(year: number, week: number): Date {
    const jan1 = new Date(year, 0, 1);
    const days = (week - 1) * 7;
    const weekStart = new Date(jan1.getTime() + days * 24 * 60 * 60 * 1000);

    // Adjust to Monday (ISO week starts on Monday)
    const dayOfWeek = weekStart.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    weekStart.setDate(weekStart.getDate() - mondayOffset);

    return weekStart;
  }

  /**
   * Get player stats for leaderboard context
   */
  async getPlayerStats(wallet: string): Promise<PlayerLeaderboardStatsDto> {
    try {
      // Get player's current profile
      const profile = await this.runModel.aggregate([
        {
          $match: {
            'participants.wallet': wallet,
            endedAt: { $exists: true },
          },
        },
        {
          $unwind: '$participants',
        },
        {
          $match: {
            'participants.wallet': wallet,
          },
        },
        {
          $group: {
            _id: '$participants.wallet',
            totalRuns: { $sum: 1 },
            totalDamage: { $sum: '$participants.damage' },
            totalKills: { $sum: '$participants.normalKills' },
            avgDamage: { $avg: '$participants.damage' },
            avgKills: { $avg: '$participants.normalKills' },
          },
        },
      ]);

      const stats = profile[0] || {
        totalRuns: 0,
        totalDamage: 0,
        totalKills: 0,
        avgDamage: 0,
        avgKills: 0,
      };

      // Get current rank from runs
      const latestRun = await this.runModel.findOne(
        { 'participants.wallet': wallet, endedAt: { $exists: true } },
        {},
        { sort: { endedAt: -1 } },
      );

      return {
        wallet,
        displayName: latestRun?.participants.find(p => p.wallet === wallet)?.displayName || 'Unknown',
        avatarId: latestRun?.participants.find(p => p.wallet === wallet)?.avatarId || 'm_swordsman',
        currentRank: 1, // Would need to calculate from all players
        totalScore: stats.totalDamage, // Use damage as total score
        percentile: 50, // Would need to calculate from all players
      };
    } catch (error) {
      throw AppError.internalError('Failed to get player stats', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(): Promise<{
    totalPlayers: number;
    totalRuns: number;
    averageScore: number;
    topScore: number;
  }> {
    try {
      const stats = await this.runModel.aggregate([
        {
          $match: { endedAt: { $exists: true } },
        },
        {
          $group: {
            _id: null,
            totalRuns: { $sum: 1 },
            totalDamage: { $sum: { $sum: '$participants.damage' } },
            avgDamage: { $avg: { $sum: '$participants.damage' } },
            maxDamage: { $max: { $sum: '$participants.damage' } },
          },
        },
      ]);

      const result = stats[0] || {
        totalRuns: 0,
        totalDamage: 0,
        avgDamage: 0,
        maxDamage: 0,
      };

      // Get unique players count
      const uniquePlayers = await this.runModel.distinct('participants.wallet', {
        endedAt: { $exists: true },
      });

      return {
        totalPlayers: uniquePlayers.length,
        totalRuns: result.totalRuns,
        averageScore: result.avgDamage || 0,
        topScore: result.maxDamage || 0,
      };
    } catch (error) {
      throw AppError.internalError('Failed to get leaderboard stats', {
        error: error.message,
      });
    }
  }

  /**
   * Get available weeks for weekly leaderboards
   */
  async getAvailableWeeks(): Promise<string[]> {
    try {
      const weeks = await this.runModel.distinct('endedAt', {
        endedAt: { $exists: true },
      });

      // Convert dates to week keys
      const weekKeys = weeks.map(date => {
        const d = new Date(date);
        const year = d.getFullYear();
        const week = this.getWeekNumber(d);
        return `${year}-W${week.toString().padStart(2, '0')}`;
      });

      // Remove duplicates and sort
      return [...new Set(weekKeys)].sort().reverse();
    } catch (error) {
      throw AppError.internalError('Failed to get available weeks', {
        error: error.message,
      });
    }
  }

  /**
   * Get available bosses for per-boss leaderboards
   */
  async getAvailableBosses(): Promise<string[]> {
    try {
      const bosses = await this.runModel.distinct('bossId', {
        endedAt: { $exists: true },
      });

      return bosses.sort();
    } catch (error) {
      throw AppError.internalError('Failed to get available bosses', {
        error: error.message,
      });
    }
  }
}
