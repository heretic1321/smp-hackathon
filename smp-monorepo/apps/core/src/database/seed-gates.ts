import { MongooseModule } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Gate, GateSchema } from './schemas/gate.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

const SEED_GATES = [
  {
    id: 'E_GOBLIN_CAVE',
    rank: 'E',
    name: 'Goblin Cave',
    description: 'A dark cave infested with weak goblins. Perfect for beginners.',
    thumbUrl: 'https://picsum.photos/seed/goblin/400/300',
    mapCode: 'map_goblin_cave_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'E_SLIME_FOREST',
    rank: 'E',
    name: 'Slime Forest',
    description: 'A peaceful forest where slimes roam freely.',
    thumbUrl: 'https://picsum.photos/seed/slime/400/300',
    mapCode: 'map_slime_forest_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'D_ORC_CAMP',
    rank: 'D',
    name: 'Orc War Camp',
    description: 'A fortified camp where orcs train for battle. Moderate danger.',
    thumbUrl: 'https://picsum.photos/seed/orc/400/300',
    mapCode: 'map_orc_camp_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'D_ABANDONED_MINE',
    rank: 'D',
    name: 'Abandoned Mine',
    description: 'An old mine haunted by restless spirits and undead miners.',
    thumbUrl: 'https://picsum.photos/seed/mine/400/300',
    mapCode: 'map_abandoned_mine_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'C_FROST_TEMPLE',
    rank: 'C',
    name: 'Frost Temple',
    description: 'An ancient temple frozen in time. Ice elementals guard its halls.',
    thumbUrl: 'https://picsum.photos/seed/frost/400/300',
    mapCode: 'map_frost_temple_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'C_VOLCANIC_LAIR',
    rank: 'C',
    name: 'Volcanic Lair',
    description: 'A scorching dungeon filled with fire demons and lava beasts.',
    thumbUrl: 'https://picsum.photos/seed/volcano/400/300',
    mapCode: 'map_volcanic_lair_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'B_DARK_CATHEDRAL',
    rank: 'B',
    name: 'Dark Cathedral',
    description: 'A corrupted cathedral where dark priests perform forbidden rituals.',
    thumbUrl: 'https://picsum.photos/seed/cathedral/400/300',
    mapCode: 'map_dark_cathedral_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'B_SHADOW_FORTRESS',
    rank: 'B',
    name: 'Shadow Fortress',
    description: 'A massive fortress shrouded in darkness. High-level enemies await.',
    thumbUrl: 'https://picsum.photos/seed/fortress/400/300',
    mapCode: 'map_shadow_fortress_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'A_DEMON_PALACE',
    rank: 'A',
    name: 'Demon Palace',
    description: 'The palace of a demon lord. Only the strongest hunters should enter.',
    thumbUrl: 'https://picsum.photos/seed/demon/400/300',
    mapCode: 'map_demon_palace_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'A_DRAGON_NEST',
    rank: 'A',
    name: 'Dragon\'s Nest',
    description: 'Home to an ancient dragon. Extreme danger - form a strong party!',
    thumbUrl: 'https://picsum.photos/seed/dragon/400/300',
    mapCode: 'map_dragon_nest_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'S_VOID_DIMENSION',
    rank: 'S',
    name: 'Void Dimension',
    description: 'A dimension beyond reality where eldritch horrors dwell. Death is certain.',
    thumbUrl: 'https://picsum.photos/seed/void/400/300',
    mapCode: 'map_void_dimension_01',
    capacity: 3,
    isActive: true,
  },
  {
    id: 'S_MONARCH_THRONE',
    rank: 'S',
    name: 'Shadow Monarch\'s Throne',
    description: 'The final challenge. Face the Shadow Monarch himself. Only legends survive.',
    thumbUrl: 'https://picsum.photos/seed/monarch/400/300',
    mapCode: 'map_monarch_throne_01',
    capacity: 3,
    isActive: true,
  },
];

class SeedService {
  constructor(@InjectModel(Gate.name) private gateModel: Model<Gate>) {}

  async seedGates() {
    console.log('🌱 Starting gate seeding...');

    for (const gateData of SEED_GATES) {
      try {
        await this.gateModel.findOneAndUpdate(
          { id: gateData.id },
          {
            ...gateData,
            occupancy: [],
          },
          {
            upsert: true,
            new: true,
          },
        );
        console.log(`✅ Seeded gate: ${gateData.name} (${gateData.rank}-rank)`);
      } catch (error: any) {
        console.error(`❌ Failed to seed gate ${gateData.id}:`, error.message);
      }
    }

    console.log('🎉 Gate seeding complete!');
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/shadow-monarchs-path'),
    MongooseModule.forFeature([{ name: Gate.name, schema: GateSchema }]),
  ],
  providers: [SeedService],
})
class SeedModule {}

async function bootstrap() {
  const app = await NestFactory.create(SeedModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seedGates();
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
