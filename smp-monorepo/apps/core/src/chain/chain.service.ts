import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { EnvironmentConfig } from '../core/config/env.validation';
import { AppError, ErrorCode } from '../common/errors/app.error';

// Contract ABIs (these would normally be imported from generated types)
const BOSS_LOG_ABI = [
  {
    inputs: [
      { name: 'gateId', type: 'string' },
      { name: 'gateRank', type: 'string' },
      { name: 'bossId', type: 'string' },
      { name: 'participants', type: 'address[]' },
      { name: 'contributions', type: 'uint256[]' },
    ],
    name: 'emitBossKilled',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const RELIC_721_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'relicType', type: 'string' },
      { name: 'affixInts', type: 'uint256[]' },
      { name: 'ipfsCid', type: 'string' },
    ],
    name: 'mint',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const PLAYER_CARD_SBT_ABI = [
  {
    inputs: [
      { name: 'addr', type: 'address' },
      { name: 'rank', type: 'string' },
      { name: 'level', type: 'uint256' },
      { name: 'xp', type: 'uint256' },
    ],
    name: 'updateProgress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Contract addresses will be loaded from environment variables

@Injectable()
export class ChainService {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private coordinatorAccount: any;
  private contractAddresses: {
    BossLog: string;
    Relic721: string;
    PlayerCardSBT: string;
  };

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<EnvironmentConfig>,
  ) {
    // Load contract addresses from environment
    this.contractAddresses = {
      BossLog: this.configService.get('BOSS_LOG_ADDRESS') || '0x0000000000000000000000000000000000000000',
      Relic721: this.configService.get('RELIC_721_ADDRESS') || '0x0000000000000000000000000000000000000000',
      PlayerCardSBT: this.configService.get('PLAYER_CARD_SBT_ADDRESS') || '0x0000000000000000000000000000000000000000',
    };
    // Initialize viem clients for Base Sepolia
    const rpcUrl = this.configService.get('RPC_URL') || 'https://sepolia.base.org';
    this.publicClient = createPublicClient({
      transport: http(rpcUrl),
      chain: {
        id: 84532,
        name: 'base-sepolia',
        network: 'base-sepolia',
        nativeCurrency: { name: 'Base Sepolia Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: [rpcUrl] },
          public: { http: [rpcUrl] }
        },
      },
    });

    // Initialize wallet client with coordinator private key
    const privateKey = this.configService.get('COORDINATOR_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('COORDINATOR_PRIVATE_KEY is required for blockchain operations');
    }

    this.coordinatorAccount = privateKeyToAccount(privateKey as `0x${string}`);
    this.walletClient = createWalletClient({
      account: this.coordinatorAccount,
      transport: http(rpcUrl),
      chain: {
        id: 84532,
        name: 'base-sepolia',
        network: 'base-sepolia',
        nativeCurrency: { name: 'Base Sepolia Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: [rpcUrl] },
          public: { http: [rpcUrl] }
        },
      },
    });
  }

  /**
   * Emit BossKilled event on-chain
   */
  async emitBossKilled(
    gateId: string,
    gateRank: string,
    bossId: string,
    participants: string[],
    contributions: bigint[],
  ): Promise<string> {
    try {
      const txHash = await this.walletClient.writeContract({
        address: this.contractAddresses.BossLog as `0x${string}`,
        abi: BOSS_LOG_ABI,
        functionName: 'emitBossKilled',
        args: [gateId, gateRank, bossId, participants as `0x${string}`[], contributions],
        account: this.coordinatorAccount,
        chain: undefined,
      });

      return txHash;
    } catch (error) {
      throw AppError.chainError('Failed to emit BossKilled event', {
        error: error.message,
        gateId,
        bossId,
      });
    }
  }

  /**
   * Mint relic on-chain
   */
  async mintRelic(
    to: string,
    relicType: string,
    affixes: Record<string, number>,
    ipfsCid: string,
  ): Promise<{ tokenId: number; txHash: string }> {
    try {
      // Convert affixes to uint256 array
      const affixInts = Object.values(affixes).map(v => BigInt(v));

      const txHash = await this.walletClient.writeContract({
        address: this.contractAddresses.Relic721 as `0x${string}`,
        abi: RELIC_721_ABI,
        functionName: 'mint',
        args: [to as `0x${string}`, relicType, affixInts, ipfsCid],
        account: this.coordinatorAccount,
        chain: undefined,
      });

      // Get transaction receipt to find the token ID
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

      // Parse token ID from logs (this is a simplified implementation)
      // In reality, you'd need to decode the Transfer event logs
      const tokenId = this.extractTokenIdFromLogs(receipt.logs);

      return { tokenId, txHash };
    } catch (error) {
      throw AppError.chainError('Failed to mint relic', {
        error: error.message,
        to,
        relicType,
      });
    }
  }

  /**
   * Update player progress on-chain
   */
  async updatePlayerProgress(
    wallet: string,
    rank: string,
    level: number,
    xp: number,
  ): Promise<string> {
    try {
      const txHash = await this.walletClient.writeContract({
        address: this.contractAddresses.PlayerCardSBT as `0x${string}`,
        abi: PLAYER_CARD_SBT_ABI,
        functionName: 'updateProgress',
        args: [wallet as `0x${string}`, rank, BigInt(level), BigInt(xp)],
        account: this.coordinatorAccount,
        chain: undefined,
      });

      return txHash;
    } catch (error) {
      throw AppError.chainError('Failed to update player progress', {
        error: error.message,
        wallet,
        rank,
        level,
        xp,
      });
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(txHash: string, confirmations: number = 1): Promise<void> {
    try {
      await this.publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
        confirmations,
      });
    } catch (error) {
      throw AppError.chainError('Transaction confirmation failed', {
        error: error.message,
        txHash,
      });
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string) {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      return {
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
        confirmations: 1, // Simplified for this example
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      if (error.message.includes('transaction not found')) {
        return {
          status: 'pending' as const,
          confirmations: 0,
        };
      }

      throw AppError.chainError('Failed to get transaction status', {
        error: error.message,
        txHash,
      });
    }
  }

  /**
   * Extract token ID from mint transaction logs
   * This is a simplified implementation - in reality you'd decode Transfer events
   */
  private extractTokenIdFromLogs(logs: any[]): number {
    // This is a placeholder implementation
    // In a real implementation, you'd decode the Transfer event from the Relic721 contract
    // For now, we'll return a mock token ID
    return Date.now() % 1000000;
  }

  /**
   * Batch mint multiple relics
   */
  async batchMintRelics(
    mintRequests: Array<{
      to: string;
      relicType: string;
      affixes: Record<string, number>;
      ipfsCid: string;
    }>,
  ): Promise<Array<{ tokenId: number; txHash: string }>> {
    const results: Array<{ tokenId: number; txHash: string }> = [];

    for (const request of mintRequests) {
      try {
        const result = await this.mintRelic(
          request.to,
          request.relicType,
          request.affixes,
          request.ipfsCid,
        );
        results.push(result);
      } catch (error) {
        // Log error but continue with other mints
        console.error('Failed to mint relic:', error);
      }
    }

    return results;
  }

  /**
   * Batch update player progress
   */
  async batchUpdateProgress(
    updates: Array<{
      wallet: string;
      rank: string;
      level: number;
      xp: number;
    }>,
  ): Promise<string[]> {
    const txHashes: string[] = [];

    for (const update of updates) {
      try {
        const txHash = await this.updatePlayerProgress(
          update.wallet,
          update.rank,
          update.level,
          update.xp,
        );
        txHashes.push(txHash);
      } catch (error) {
        // Log error but continue with other updates
        console.error('Failed to update player progress:', error);
      }
    }

    return txHashes;
  }
}
