import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { EnvironmentConfig } from '../../core/config/env.validation';
import { AppError, ErrorCode } from '../../common/errors/app.error';
import { FinishRunResultDto } from '../../runs/dto/runs.dto';

// Enhanced contract ABIs with event signatures
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
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'gateId', type: 'string' },
      { indexed: true, name: 'bossId', type: 'string' },
      { indexed: false, name: 'participants', type: 'address[]' },
      { indexed: false, name: 'contributions', type: 'uint256[]' },
    ],
    name: 'BossKilled',
    type: 'event',
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
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
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
  {
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'getProgress',
    outputs: [
      { name: 'rank', type: 'string' },
      { name: 'level', type: 'uint256' },
      { name: 'xp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract addresses will be loaded from environment variables

export interface TransactionResult {
  txHash: string;
  success: boolean;
  gasUsed?: bigint;
  blockNumber?: bigint;
}

export interface RelicData {
  tokenId: number;
  owner: string;
  tokenURI: string;
  relicType?: string;
  affixes?: Record<string, number>;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  };
}

export interface PlayerProgress {
  rank: string;
  level: number;
  xp: number;
}

@Injectable()
export class BlockchainIntegrationService {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private coordinatorAccount: any;
  public readonly contractAddresses: {
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

    console.log('📝 Contract Addresses Loaded:');
    console.log('  BossLog:', this.contractAddresses.BossLog);
    console.log('  Relic721:', this.contractAddresses.Relic721);
    console.log('  PlayerCardSBT:', this.contractAddresses.PlayerCardSBT);

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
  ): Promise<TransactionResult> {
    try {
      const txHash = await this.walletClient.writeContract({
        address: this.contractAddresses.BossLog as `0x${string}`,
        abi: BOSS_LOG_ABI,
        functionName: 'emitBossKilled',
        args: [gateId, gateRank, bossId, participants as `0x${string}`[], contributions],
        account: this.coordinatorAccount,
        chain: undefined,
      });

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

      return {
        txHash,
        success: receipt.status === 'success',
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      throw AppError.chainError('Failed to emit BossKilled event', {
        error: error.message,
        gateId,
        bossId,
      });
    }
  }

  /**
   * Mint relic on-chain with enhanced error handling
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

      // Get transaction receipt to find the token ID from Transfer event
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

      // Parse token ID from Transfer event logs
      const tokenId = this.extractTokenIdFromTransferLogs(receipt.logs);

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
  ): Promise<TransactionResult> {
    try {
      const txHash = await this.walletClient.writeContract({
        address: this.contractAddresses.PlayerCardSBT as `0x${string}`,
        abi: PLAYER_CARD_SBT_ABI,
        functionName: 'updateProgress',
        args: [wallet as `0x${string}`, rank, BigInt(level), BigInt(xp)],
        account: this.coordinatorAccount,
        chain: undefined,
      });

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

      return {
        txHash,
        success: receipt.status === 'success',
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
      };
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
   * Get relic data by token ID
   */
  async getRelicData(tokenId: number): Promise<RelicData> {
    try {
      const [owner, tokenURI] = await Promise.all([
        this.publicClient.readContract({
          address: this.contractAddresses.Relic721 as `0x${string}`,
          abi: RELIC_721_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        }),
        this.publicClient.readContract({
          address: this.contractAddresses.Relic721 as `0x${string}`,
          abi: RELIC_721_ABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        }),
      ]);

      // Parse metadata from tokenURI (IPFS)
      const metadata = await this.parseRelicMetadata(tokenURI);

      return {
        tokenId,
        owner: owner as string,
        tokenURI,
        metadata,
      };
    } catch (error) {
      throw AppError.chainError('Failed to get relic data', {
        error: error.message,
        tokenId,
      });
    }
  }

  /**
   * Get player progress from on-chain SBT
   */
  async getPlayerProgress(wallet: string): Promise<PlayerProgress> {
    try {
      const [rank, level, xp] = await this.publicClient.readContract({
        address: this.contractAddresses.PlayerCardSBT as `0x${string}`,
        abi: PLAYER_CARD_SBT_ABI,
        functionName: 'getProgress',
        args: [wallet as `0x${string}`],
      });

      return {
        rank: rank as string,
        level: Number(level),
        xp: Number(xp),
      };
    } catch (error) {
      // If SBT doesn't exist, return default values
      return {
        rank: 'E',
        level: 1,
        xp: 0,
      };
    }
  }

  /**
   * Get all relics owned by a wallet
   */
  async getRelicsByOwner(wallet: string): Promise<RelicData[]> {
    try {
      const balance = await this.publicClient.readContract({
        address: this.contractAddresses.Relic721 as `0x${string}`,
        abi: RELIC_721_ABI,
        functionName: 'balanceOf',
        args: [wallet as `0x${string}`],
      });

      const relics: RelicData[] = [];

      // Get all token IDs owned by the wallet
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await this.publicClient.readContract({
            address: this.contractAddresses.Relic721 as `0x${string}`,
            abi: RELIC_721_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [wallet as `0x${string}`, BigInt(i)],
          });

          const relicData = await this.getRelicData(Number(tokenId));
          relics.push(relicData);
        } catch (error) {
          console.warn(`Failed to get relic ${i} for wallet ${wallet}:`, error);
        }
      }

      return relics;
    } catch (error) {
      throw AppError.chainError('Failed to get relics by owner', {
        error: error.message,
        wallet,
      });
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(): Promise<{
    totalRelics: number;
    blockNumber: number;
    gasPrice: bigint;
  }> {
    try {
      const [totalSupply, blockNumber, gasPrice] = await Promise.all([
        this.publicClient.readContract({
          address: this.contractAddresses.Relic721 as `0x${string}`,
          abi: RELIC_721_ABI,
          functionName: 'totalSupply',
        }),
        this.publicClient.getBlockNumber(),
        this.publicClient.getGasPrice(),
      ]);

      return {
        totalRelics: Number(totalSupply),
        blockNumber: Number(blockNumber),
        gasPrice,
      };
    } catch (error) {
      throw AppError.chainError('Failed to get blockchain stats', {
        error: error.message,
      });
    }
  }

  /**
   * Batch operations with error handling
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
        console.error('Failed to mint relic:', error);
        // Continue with other mints
      }
    }

    return results;
  }

  async batchUpdateProgress(
    updates: Array<{
      wallet: string;
      rank: string;
      level: number;
      xp: number;
    }>,
  ): Promise<TransactionResult[]> {
    const results: TransactionResult[] = [];

    for (const update of updates) {
      try {
        const result = await this.updatePlayerProgress(
          update.wallet,
          update.rank,
          update.level,
          update.xp,
        );
        results.push(result);
      } catch (error) {
        console.error('Failed to update player progress:', error);
        // Continue with other updates
      }
    }

    return results;
  }

  /**
   * Extract token ID from Transfer event logs
   */
  private extractTokenIdFromTransferLogs(logs: any[]): number {
    for (const log of logs) {
      if (log.topics && log.topics.length >= 4) {
        // Transfer event signature: Transfer(address,address,uint256)
        const transferSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
        if (log.topics[0] === transferSignature) {
          // tokenId is the third topic (index 2)
          return parseInt(log.topics[2], 16);
        }
      }
    }

    // Fallback: return a mock token ID
    return Date.now() % 1000000;
  }

  /**
   * Parse relic metadata from IPFS URI
   */
  private async parseRelicMetadata(tokenURI: string): Promise<{
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  }> {
    try {
      // In a real implementation, this would:
      // 1. Resolve IPFS gateway URL from tokenURI
      // 2. Fetch metadata JSON
      // 3. Parse and return structured data

      // For now, return mock metadata
      return {
        name: `Relic #${parseInt(tokenURI.split('/').pop() || '0')}`,
        description: 'A mysterious relic with unknown powers',
        image: 'https://via.placeholder.com/400x400',
        attributes: [
          { trait_type: 'Rarity', value: 'Common' },
          { trait_type: 'Type', value: 'Unknown' },
        ],
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Batch verify ownership of multiple tokens
   */
  async batchVerifyOwnership(wallet: string, tokenIds: number[]): Promise<Record<number, boolean>> {
    const results: Record<number, boolean> = {};

    for (const tokenId of tokenIds) {
      try {
        const owner = await this.publicClient.readContract({
          address: this.contractAddresses.Relic721 as `0x${string}`,
          abi: RELIC_721_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });

        results[tokenId] = owner.toLowerCase() === wallet.toLowerCase();
      } catch (error) {
        // If token doesn't exist or other error, mark as not owned
        results[tokenId] = false;
      }
    }

    return results;
  }

  /**
   * Verify if a wallet owns a specific token
   */
  async verifyOwnership(wallet: string, tokenId: number): Promise<boolean> {
    try {
      const owner = await this.publicClient.readContract({
        address: this.contractAddresses.Relic721 as `0x${string}`,
        abi: RELIC_721_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });

      return owner.toLowerCase() === wallet.toLowerCase();
    } catch (error) {
      // If token doesn't exist, ownerOf will throw
      return false;
    }
  }

  /**
   * Get transaction receipt with enhanced error handling
   */
  async getTransactionReceipt(txHash: string) {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      return {
        txHash,
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
        confirmations: 1, // Simplified
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
        logs: receipt.logs,
      };
    } catch (error) {
      if (error.message.includes('transaction not found')) {
        return {
          txHash,
          status: 'pending' as const,
          confirmations: 0,
        };
      }

      throw AppError.chainError('Failed to get transaction receipt', {
        error: error.message,
        txHash,
      });
    }
  }

  /**
   * Wait for transaction confirmation with timeout
   */
  async waitForConfirmation(
    txHash: string,
    confirmations: number = 1,
    timeoutMs: number = 30000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        await this.publicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
          confirmations,
        });
        return;
      } catch (error) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw AppError.chainError('Transaction confirmation timeout', {
      txHash,
      timeoutMs,
      confirmations,
    });
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    try {
      return await this.publicClient.getGasPrice();
    } catch (error) {
      throw AppError.chainError('Failed to get gas price', {
        error: error.message,
      });
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(
    to: string,
    data: string,
    value: bigint = 0n,
  ): Promise<bigint> {
    try {
      return await this.publicClient.estimateGas({
        to: to as `0x${string}`,
        data: data as `0x${string}`,
        value,
      });
    } catch (error) {
      throw AppError.chainError('Failed to estimate gas', {
        error: error.message,
        to,
      });
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<bigint> {
    try {
      return await this.publicClient.getBalance({
        address: address as `0x${string}`,
      });
    } catch (error) {
      throw AppError.chainError('Failed to get balance', {
        error: error.message,
        address,
      });
    }
  }

  /**
   * Get block number
   */
  async getBlockNumber(): Promise<number> {
    try {
      const blockNumber = await this.publicClient.getBlockNumber();
      return Number(blockNumber);
    } catch (error) {
      throw AppError.chainError('Failed to get block number', {
        error: error.message,
      });
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const chainId = await this.publicClient.getChainId();
      return {
        chainId,
        name: 'base-sepolia',
        network: 'base-sepolia',
      };
    } catch (error) {
      throw AppError.chainError('Failed to get network info', {
        error: error.message,
      });
    }
  }

  /**
   * Execute all blockchain transactions for a run completion
   */
  async executeBlockchainTransactions(
    run: any,
    xpAwards: any[],
    rankUps: any[],
    mintedRelics: any[],
    gate: any,
  ): Promise<FinishRunResultDto> {
    try {
      // Emit BossKilled event
      const participants = run.participants.map((p: any) => p.wallet);
      const contributions = run.participants.map((p: any) => BigInt(p.damage));

      const bossKilledResult = await this.emitBossKilled(
        gate.gateId,
        gate.rank,
        run.bossId,
        participants,
        contributions,
      );

      // Batch mint relics
      const relicMintRequests = mintedRelics.map((relic: any) => ({
        to: relic.owner,
        relicType: relic.relicType,
        affixes: relic.affixes,
        ipfsCid: relic.cid,
      }));

      const relicMintResults = await this.batchMintRelics(relicMintRequests);

      // Batch update player progress
      const progressUpdates = xpAwards.map((award: any) => ({
        wallet: award.wallet,
        rank: award.rank,
        level: award.level,
        xp: award.xp,
      }));

      const progressResults = await this.batchUpdateProgress(progressUpdates);

      return {
        txHash: bossKilledResult.txHash,
        relics: relicMintResults.map((result: any, index: number) => ({
          tokenId: result.tokenId,
          cid: mintedRelics[index].cid,
        })),
      };
    } catch (error) {
      throw AppError.chainError('Failed to execute blockchain transactions', {
        error: error.message,
        runId: run.runId,
      });
    }
  }
}
