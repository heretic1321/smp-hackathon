import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { DevOnlyGuard } from './dev-only.guard';
import { Gate, GateSchema } from '../database/schemas/gate.schema';
import { Inventory, InventorySchema } from '../database/schemas/inventory.schema';
import { Player, PlayerSchema } from '../database/schemas/player.schema';
import { Run, RunSchema } from '../database/schemas/run.schema';
import { Party, PartySchema } from '../database/schemas/party.schema';
import { ProfilesModule } from '../profiles/profiles.module';
import { AuthModule } from '../auth/auth.module';
import { BlockchainIntegrationService } from '../chain/services/blockchain-integration.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Gate.name, schema: GateSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Player.name, schema: PlayerSchema },
      { name: Run.name, schema: RunSchema },
      { name: Party.name, schema: PartySchema },
    ]),
    ProfilesModule,
    AuthModule,
  ],
  controllers: [DevController],
  providers: [DevService, DevOnlyGuard, BlockchainIntegrationService],
  exports: [DevService],
})
export class DevModule {}

