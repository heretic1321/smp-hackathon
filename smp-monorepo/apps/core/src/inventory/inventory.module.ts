import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './services/inventory.service';
import { Inventory, InventorySchema } from '../database/schemas/inventory.schema';
import { AuthModule } from '../auth/auth.module';
import { ChainModule } from '../chain/chain.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]),
    AuthModule,
    ChainModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
