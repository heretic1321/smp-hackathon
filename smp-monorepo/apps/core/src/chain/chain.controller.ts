import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BlockchainIntegrationService } from './services/blockchain-integration.service';
import { BlockchainMonitorService } from './services/blockchain-monitor.service';

@Controller('chain')
@ApiTags('Blockchain')
export class ChainController {
  constructor(
    private readonly blockchainService: BlockchainIntegrationService,
    private readonly monitorService: BlockchainMonitorService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get blockchain status',
    description: 'Get comprehensive blockchain connectivity and statistics'
  })
  @ApiResponse({
    status: 200,
    description: 'Blockchain status retrieved successfully'
  })
  async getBlockchainStatus(): Promise<{ ok: true; data: any }> {
    const status = await this.monitorService.getBlockchainStatus();
    return {
      ok: true,
      data: status,
    };
  }

  @Get('gas-price')
  @ApiOperation({
    summary: 'Get current gas price',
    description: 'Get the current gas price in wei'
  })
  @ApiResponse({
    status: 200,
    description: 'Gas price retrieved successfully'
  })
  async getGasPrice(): Promise<{ ok: true; data: { gasPrice: string } }> {
    const gasPrice = await this.blockchainService.getGasPrice();
    return {
      ok: true,
      data: {
        gasPrice: gasPrice.toString(),
      },
    };
  }

  @Get('network')
  @ApiOperation({
    summary: 'Get network information',
    description: 'Get information about the connected blockchain network'
  })
  @ApiResponse({
    status: 200,
    description: 'Network information retrieved successfully'
  })
  async getNetworkInfo(): Promise<{ ok: true; data: any }> {
    const networkInfo = await this.blockchainService.getNetworkInfo();
    return {
      ok: true,
      data: networkInfo,
    };
  }

  @Get('block-number')
  @ApiOperation({
    summary: 'Get current block number',
    description: 'Get the latest block number on the blockchain'
  })
  @ApiResponse({
    status: 200,
    description: 'Block number retrieved successfully'
  })
  async getBlockNumber(): Promise<{ ok: true; data: { blockNumber: number } }> {
    const blockNumber = await this.blockchainService.getBlockNumber();
    return {
      ok: true,
      data: {
        blockNumber,
      },
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get blockchain statistics',
    description: 'Get statistics about relics and transactions on the blockchain'
  })
  @ApiResponse({
    status: 200,
    description: 'Blockchain statistics retrieved successfully'
  })
  async getBlockchainStats(): Promise<{ ok: true; data: any }> {
    const stats = await this.blockchainService.getBlockchainStats();
    return {
      ok: true,
      data: stats,
    };
  }
}
