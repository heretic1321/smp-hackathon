import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Player, PlayerSchema } from '../database/schemas/player.schema';
import { Inventory, InventorySchema } from '../database/schemas/inventory.schema';
import { Run, RunSchema } from '../database/schemas/run.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Player.name, schema: PlayerSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Run.name, schema: RunSchema },
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
