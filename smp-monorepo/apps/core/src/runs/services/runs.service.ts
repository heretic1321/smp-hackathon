import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Run, RunDocument } from '../../database/schemas/run.schema';
import { Outbox, OutboxDocument } from '../../database/schemas/outbox.schema';
import { BlockchainIntegrationService } from '../../chain/services/blockchain-integration.service';
import { ProfilesService } from '../../profiles/profiles.service';
import { PartiesService } from '../../parties/services/parties.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import {
  FinishRunInputDto,
  FinishRunResultDto,
  ResultSummaryDto,
  XpAwardDto,
  RankUpDto,
  MintedRelicDto,
  ContributionDto,
} from '../dto/runs.dto';
import { AppError, ErrorCode } from '../../common/errors/app.error';

@Injectable()
export class RunsService {
  constructor(
    @InjectModel(Run.name) private runModel: Model<RunDocument>,
    @InjectModel(Outbox.name) private outboxModel: Model<OutboxDocument>,
    private readonly blockchainService: BlockchainIntegrationService,
    private readonly profilesService: ProfilesService,
    @Inject(forwardRef(() => PartiesService))
    private readonly partiesService: PartiesService,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * Create a new run when a party starts
   */
  async createRun(
    partyId: string,
    gateId: string,
    bossId: string,
    participants: Array<{
      wallet: string;
      displayName: string;
      avatarId: string;
      equippedRelicIds?: number[];
    }>,
  ): Promise<string> {
    try {
      // Generate unique run ID
      const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create run document
      const run = await this.runModel.create({
        runId,
        partyId,
        gateId,
        participants: participants.map(p => ({
          wallet: p.wallet,
          displayName: p.displayName,
          avatarId: p.avatarId,
          equippedRelicIds: p.equippedRelicIds || [],
          damage: 0,
          normalKills: 0,
        })),
        bossId,
        startedAt: new Date(),
      });

      return runId;
    } catch (error) {
      throw AppError.internalError('Failed to create run', {
        error: error.message,
        partyId,
        gateId,
      });
    }
  }

  /**
   * Create a test run for development (bypasses party system)
   */
  async createRunForTest(
    runId: string,
    gateId: string,
    bossId: string,
    participants: Array<{
      wallet: string;
      displayName: string;
      avatarId: string;
      damage: number;
      normalKills: number;
    }>,
  ): Promise<string> {
    try {
      const partyId = `test_party_${runId}`;

      // Create party document first
      const partyData = {
        partyId,
        gateId,
        leader: participants[0].wallet,
        capacity: participants.length,
        state: 'waiting',
        members: participants.map(p => ({
          wallet: p.wallet,
          displayName: p.displayName,
          avatarId: p.avatarId,
          isReady: false,
          isLocked: false,
          equippedRelicIds: [],
        })),
        createdAt: new Date().toISOString(),
      };

      // Create run document
      const run = await this.runModel.create({
        runId,
        partyId,
        gateId,
        participants: participants.map(p => ({
          wallet: p.wallet,
          displayName: p.displayName,
          avatarId: p.avatarId,
          equippedRelicIds: [],
          damage: p.damage,
          normalKills: p.normalKills,
        })),
        bossId,
        startedAt: new Date(),
      });

      return runId;
    } catch (error) {
      throw AppError.internalError('Failed to create test run', {
        error: error.message,
        runId,
        gateId,
      });
    }
  }

  /**
   * Finish a run with contributions and process rewards
   */
  async finishRun(
    runId: string,
    finishData: FinishRunInputDto,
    idempotencyKey?: string,
  ): Promise<FinishRunResultDto> {
    try {
      // Check idempotency first
      if (idempotencyKey) {
        const existingResponse = await this.outboxModel.findOne({
          runId,
          key: `finish_run_${runId}_${idempotencyKey}`,
        });

        if (existingResponse) {
          return existingResponse.response;
        }
      }

      // Find the run
      const run = await this.runModel.findOne({ runId });
      if (!run) {
        throw AppError.notFound(ErrorCode.RUN_NOT_FOUND, 'Run not found');
      }

      if (run.endedAt) {
        throw AppError.conflict(ErrorCode.RUN_ALREADY_FINISHED, 'Run already finished');
      }

      // Validate contributions match participants
      const participantWallets = run.participants.map(p => p.wallet);
      const contributionWallets = finishData.contributions.map(c => c.wallet);

      if (participantWallets.length !== contributionWallets.length) {
        throw AppError.badRequest(
          ErrorCode.INVALID_CONTRIBUTIONS,
          'Number of contributions must match number of participants'
        );
      }

      // Update participant damage
      for (const contribution of finishData.contributions) {
        const participant = run.participants.find(p => p.wallet === contribution.wallet);
        if (participant) {
          participant.damage = contribution.damage;
        }
      }

      // Calculate XP and rewards
      const { xpAwards, rankUps, mintedRelics } = await this.calculateRewards(run, finishData.bossId);

      // Update run with results
      run.endedAt = new Date();
      run.xpAwards = xpAwards.map(award => ({
        wallet: award.wallet,
        xp: award.xp,
        level: award.level,
        rank: award.rank,
        sbtTokenId: award.sbtTokenId,
      }));
      run.rankUps = rankUps.map(rankUp => ({
        wallet: rankUp.wallet,
        from: rankUp.from,
        to: rankUp.to,
      }));
      run.mintedRelics = mintedRelics.map(relic => ({
        tokenId: relic.tokenId,
        relicType: relic.relicType,
        affixes: new Map(Object.entries(relic.affixes)),
        cid: relic.cid,
        owner: relic.owner,
      }));

      await run.save();

      // Execute blockchain transactions (skip if contracts not deployed)
      const blockchainResults = await this.executeBlockchainTransactions(run, xpAwards, rankUps, mintedRelics);

      // Update player profiles
      await this.updatePlayerProfiles(xpAwards, rankUps);

      // Close the party (only for real runs, not test runs)
      if (!run.partyId.startsWith('test_party_')) {
        await this.partiesService.closeParty(run.partyId, 'Run completed');
      }

      // Store response for idempotency
      if (idempotencyKey) {
        await this.outboxModel.create({
          runId,
          key: `finish_run_${runId}_${idempotencyKey}`,
          response: blockchainResults,
        });
      }

      return blockchainResults;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to finish run', {
        error: error.message,
        runId,
      });
    }
  }

  /**
   * Get run results summary
   */
  async getRunResults(runId: string): Promise<ResultSummaryDto> {
    try {
      const run = await this.runModel.findOne({ runId });
      if (!run) {
        throw AppError.notFound(ErrorCode.RUN_NOT_FOUND, 'Run not found');
      }

      if (!run.endedAt) {
        throw AppError.notFound(ErrorCode.RUN_NOT_FOUND, 'Run not finished yet');
      }

      return {
        runId,
        gateId: run.gateId,
        bossId: run.bossId,
        participants: run.participants.map(p => ({
          wallet: p.wallet,
          displayName: p.displayName,
          avatarId: p.avatarId,
          damage: p.damage,
          normalKills: p.normalKills,
        })),
        mintedRelics: run.mintedRelics.map(r => ({
          tokenId: r.tokenId,
          cid: r.cid,
        })),
        xpAwards: run.xpAwards.map(a => ({
          wallet: a.wallet,
          xp: a.xp,
        })),
        rankUps: run.rankUps.map(r => ({
          wallet: r.wallet,
          from: r.from,
          to: r.to,
        })),
        completedAt: run.endedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalError('Failed to get run results', {
        error: error.message,
        runId,
      });
    }
  }

  /**
   * Calculate XP and rewards for a run
   */
  private async calculateRewards(
    run: RunDocument,
    bossId: string,
  ): Promise<{
    xpAwards: Array<{
      wallet: string;
      xp: number;
      level: number;
      rank: string;
      sbtTokenId?: number;
    }>;
    rankUps: Array<{
      wallet: string;
      from: string;
      to: string;
    }>;
    mintedRelics: Array<{
      tokenId: number;
      relicType: string;
      affixes: Record<string, number>;
      cid: string;
      owner: string;
    }>;
  }> {
    const xpAwards: Array<{
      wallet: string;
      xp: number;
      level: number;
      rank: string;
      sbtTokenId?: number;
    }> = [];

    const rankUps: Array<{
      wallet: string;
      from: string;
      to: string;
    }> = [];

    const mintedRelics: Array<{
      tokenId: number;
      relicType: string;
      affixes: Record<string, number>;
      cid: string;
      owner: string;
    }> = [];

    // Calculate base XP per player (simple formula)
    const totalDamage = run.participants.reduce((sum, p) => sum + p.damage, 0);
    const baseXpPerPlayer = Math.floor(totalDamage / run.participants.length / 10); // 1 XP per 10 damage

    for (const participant of run.participants) {
      // Get current player profile
      const profile = await this.profilesService.getProfileByAddress(participant.wallet);
      if (!profile) continue;

      // Calculate XP award
      const xpAward = baseXpPerPlayer + Math.floor(participant.damage / 100); // Bonus XP for high damage
      const newXp = profile.xp + xpAward;

      // Calculate new level and rank
      const { newLevel, newRank, leveledUp } = this.calculateLevelAndRank(profile.level, profile.rank, newXp);

      // Check for rank up
      if (leveledUp) {
        rankUps.push({
          wallet: participant.wallet,
          from: profile.rank,
          to: newRank,
        });
      }

      // Generate SBT token ID if player doesn't have one
      let sbtTokenId: number | undefined;
      if (!profile.sbtTokenId) {
        sbtTokenId = Date.now() + Math.floor(Math.random() * 1000);
      }

      xpAwards.push({
        wallet: participant.wallet,
        xp: newXp,
        level: newLevel,
        rank: newRank,
        sbtTokenId,
      });
    }

    // Generate relic rewards (simplified - in reality would be based on performance)
    for (let i = 0; i < Math.min(3, run.participants.length); i++) {
      const participant = run.participants[i];
      const relicType = this.getRandomRelicType();
      const affixes = this.generateRelicAffixes(relicType);

      mintedRelics.push({
        tokenId: Date.now() + i,
        relicType,
        affixes,
        cid: `Qm${Math.random().toString(36).substr(2, 44)}`,
        owner: participant.wallet,
      });
    }

    return { xpAwards, rankUps, mintedRelics };
  }

  /**
   * Calculate new level and rank based on XP
   */
  private calculateLevelAndRank(
    currentLevel: number,
    currentRank: string,
    newXp: number,
  ): { newLevel: number; newRank: string; leveledUp: boolean } {
    // Simple leveling system
    const xpPerLevel = 1000;
    const newLevel = Math.floor(newXp / xpPerLevel) + 1;

    // Rank progression
    const rankProgression = ['E', 'D', 'C', 'B', 'A', 'S'];
    const currentRankIndex = rankProgression.indexOf(currentRank);
    let newRank = currentRank;
    let leveledUp = false;

    if (newLevel > currentLevel) {
      leveledUp = true;
      // Rank up every 5 levels
      const newRankIndex = Math.min(rankProgression.length - 1, Math.floor((newLevel - 1) / 5));
      newRank = rankProgression[newRankIndex];
    }

    return { newLevel, newRank, leveledUp };
  }

  /**
   * Generate random relic type
   */
  private getRandomRelicType(): string {
    const relicTypes = [
      'SunspireBand',
      'FrostbiteRing',
      'BlazingAmulet',
      'ShadowCloak',
      'VitalityPendant',
    ];
    return relicTypes[Math.floor(Math.random() * relicTypes.length)];
  }

  /**
   * Generate random affixes for a relic
   */
  private generateRelicAffixes(relicType: string): Record<string, number> {
    const possibleAffixes = {
      SunspireBand: ['+Crit', '+Attack Speed', '+Movement Speed'],
      FrostbiteRing: ['+Frost Damage', '+Mana', '+Cooldown Reduction'],
      BlazingAmulet: ['+Fire Damage', '+Health', '+Defense'],
      ShadowCloak: ['+Stealth', '+Evasion', '+Critical Damage'],
      VitalityPendant: ['+Health', '+Regeneration', '+Max Health'],
    };

    const affixes = possibleAffixes[relicType as keyof typeof possibleAffixes] || ['+Health', '+Defense'];
    const selectedAffixes: Record<string, number> = {};

    // Select 2-3 random affixes
    const numAffixes = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const shuffled = [...affixes].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numAffixes);

    selected.forEach(affix => {
      selectedAffixes[affix] = Math.floor(Math.random() * 20) + 1; // 1-20
    });

    return selectedAffixes;
  }

  /**
   * Execute blockchain transactions
   */
  private async executeBlockchainTransactions(
    run: RunDocument,
    xpAwards: Array<{
      wallet: string;
      xp: number;
      level: number;
      rank: string;
      sbtTokenId?: number;
    }>,
    rankUps: Array<{
      wallet: string;
      from: string;
      to: string;
    }>,
    mintedRelics: Array<{
      tokenId: number;
      relicType: string;
      affixes: Record<string, number>;
      cid: string;
      owner: string;
    }>,
  ): Promise<FinishRunResultDto> {
    try {
      // For test runs, create a mock gate object
      let gate;
      if (run.partyId.startsWith('test_party_')) {
        // This is a test run, create mock gate
        gate = {
          gateId: run.gateId,
          name: 'Test Gate',
          rank: 'C',
          description: 'Test gate for development',
          capacity: 3,
          isActive: true,
        };
      } else {
        // Real run, get party from service
        gate = await this.partiesService.getPartyById(run.partyId);
        if (!gate) {
          throw new Error('Party not found for run');
        }
      }

      // Check if contracts are deployed (not zero addresses)
      const hasDeployedContracts = this.blockchainService.contractAddresses.BossLog !== '0x0000000000000000000000000000000000000000';

      let blockchainResults: FinishRunResultDto;

      if (hasDeployedContracts) {
        // Execute real blockchain transactions
        blockchainResults = await this.blockchainService.executeBlockchainTransactions(
          run, xpAwards, rankUps, mintedRelics, gate
        );
      } else {
        // Return mock results for development
        blockchainResults = {
          txHash: `mock_tx_${Date.now()}`,
          relics: mintedRelics.map((relic, index) => ({
            tokenId: relic.tokenId,
            cid: relic.cid,
          })),
        };
      }

      return blockchainResults;
    } catch (error) {
      throw AppError.chainError('Failed to execute blockchain transactions', {
        error: error.message,
        runId: run.runId,
      });
    }
  }

  /**
   * Update player profiles with new XP and levels
   */
  private async updatePlayerProfiles(
    xpAwards: Array<{
      wallet: string;
      xp: number;
      level: number;
      rank: string;
      sbtTokenId?: number;
    }>,
    rankUps: Array<{
      wallet: string;
      from: string;
      to: string;
    }>,
  ): Promise<void> {
    // Update XP and levels
    for (const award of xpAwards) {
      await this.profilesService.updatePlayerStats(award.wallet, {
        xp: award.xp,
        level: award.level,
        rank: award.rank,
        sbtTokenId: award.sbtTokenId,
      });
    }
  }

  /**
   * Get run by ID
   */
  async getRunById(runId: string): Promise<RunDocument | null> {
    try {
      const run = await this.runModel.findOne({ runId });
      return run;
    } catch (error) {
      throw AppError.internalError('Failed to get run', {
        error: error.message,
        runId,
      });
    }
  }

  /**
   * Get runs by party
   */
  async getRunsByParty(partyId: string): Promise<RunDocument[]> {
    try {
      const runs = await this.runModel.find({ partyId }).sort({ startedAt: -1 });
      return runs;
    } catch (error) {
      throw AppError.internalError('Failed to get runs by party', {
        error: error.message,
        partyId,
      });
    }
  }

  /**
   * Get runs by player
   */
  async getRunsByPlayer(wallet: string): Promise<RunDocument[]> {
    try {
      const runs = await this.runModel.find({
        'participants.wallet': wallet,
      }).sort({ startedAt: -1 });
      return runs;
    } catch (error) {
      throw AppError.internalError('Failed to get runs by player', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Get recent runs for leaderboard
   */
  async getRecentRuns(limit: number = 10): Promise<RunDocument[]> {
    try {
      const runs = await this.runModel.find({
        endedAt: { $exists: true },
      }).sort({ endedAt: -1 }).limit(limit);
      return runs;
    } catch (error) {
      throw AppError.internalError('Failed to get recent runs', {
        error: error.message,
      });
    }
  }
}
