import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GatesController } from './gates.controller';
import { GatesService } from './services/gates.service';
import { Gate, GateSchema } from '../database/schemas/gate.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gate.name, schema: GateSchema }]),
    AuthModule,
  ],
  controllers: [GatesController],
  providers: [GatesService],
  exports: [GatesService],
})
export class GatesModule {}
