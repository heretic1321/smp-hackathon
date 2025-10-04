import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartiesController } from './parties.controller';
import { PartiesService } from './services/parties.service';
import { PartySseService } from './sse/party-sse.service';
import { Party, PartySchema } from '../database/schemas/party.schema';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { GatesModule } from '../gates/gates.module';
import { RunsModule } from '../runs/runs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Party.name, schema: PartySchema }]),
    AuthModule,
    ProfilesModule,
    GatesModule,
    forwardRef(() => RunsModule),
  ],
  controllers: [PartiesController],
  providers: [PartiesService, PartySseService],
  exports: [PartiesService, PartySseService],
})
export class PartiesModule {}
