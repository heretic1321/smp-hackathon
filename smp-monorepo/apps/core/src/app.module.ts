import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { ProfilesModule } from './profiles/profiles.module';
import { GatesModule } from './gates/gates.module';
import { PartiesModule } from './parties/parties.module';
import { RunsModule } from './runs/runs.module';
import { InventoryModule } from './inventory/inventory.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { ChainModule } from './chain/chain.module';
import { DevModule } from './dev/dev.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [CoreModule, DatabaseModule, AuthModule, MediaModule, ProfilesModule, GatesModule, PartiesModule, RunsModule, InventoryModule, LeaderboardsModule, ChainModule, DevModule, GameModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
