import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChainController } from './chain.controller';
import { BlockchainIntegrationService } from './services/blockchain-integration.service';
import { BlockchainMonitorService } from './services/blockchain-monitor.service';
import { ChainService } from './chain.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [ChainController],
  providers: [
    BlockchainIntegrationService,
    BlockchainMonitorService,
    ChainService,
  ],
  exports: [
    BlockchainIntegrationService,
    BlockchainMonitorService,
    ChainService,
  ],
})
export class ChainModule {}
