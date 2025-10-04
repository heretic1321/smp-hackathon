import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RunsController } from './runs.controller';
import { RunsService } from './services/runs.service';
import { Run, RunSchema } from '../database/schemas/run.schema';
import { Outbox, OutboxSchema } from '../database/schemas/outbox.schema';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { PartiesModule } from '../parties/parties.module';
import { ChainModule } from '../chain/chain.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Run.name, schema: RunSchema },
      { name: Outbox.name, schema: OutboxSchema },
    ]),
    AuthModule,
    ProfilesModule,
    forwardRef(() => PartiesModule),
    ChainModule,
    InventoryModule,
  ],
  controllers: [RunsController],
  providers: [RunsService],
  exports: [RunsService],
})
export class RunsModule {}
