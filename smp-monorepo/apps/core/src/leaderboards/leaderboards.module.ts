import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaderboardsController } from './leaderboards.controller';
import { LeaderboardsService } from './services/leaderboards.service';
import { Run, RunSchema } from '../database/schemas/run.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Run.name, schema: RunSchema }]),
  ],
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService],
  exports: [LeaderboardsService],
})
export class LeaderboardsModule {}
