import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GameService } from './game.service';

@Controller('game')
@ApiTags('Game State')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('start-data')
  @ApiOperation({
    summary: 'Get game start data',
    description: 'Retrieves player profile, current mission, equipped relics, and game features for the game start screen'
  })
  @ApiResponse({
    status: 200,
    description: 'Game start data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            player: {
              type: 'object',
              properties: {
                displayName: { type: 'string', example: 'ShadowHunter' },
                rank: { type: 'string', example: 'S' },
                level: { type: 'number', example: 25 },
                xp: { type: 'number', example: 1500 },
                avatarId: { type: 'string', example: 'avatar_001' },
                imageUrl: { type: 'string', example: 'https://example.com/avatar.jpg' }
              }
            },
            currentMission: {
              type: 'object',
              properties: {
                gateId: { type: 'string', example: 'gate_001' },
                gateName: { type: 'string', example: 'Shadow Monarch\'s Awakening' },
                bossName: { type: 'string', example: 'Ancient Shadow Dragon' },
                difficulty: { type: 'string', example: 'S-Rank' },
                description: { type: 'string', example: 'Face the ultimate challenge...' }
              }
            },
            equippedRelics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tokenId: { type: 'number', example: 123 },
                  name: { type: 'string', example: 'Shadow Sword' },
                  relicType: { type: 'string', example: 'sword' },
                  imageUrl: { type: 'string', example: 'https://example.com/relic.jpg' },
                  benefits: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            gameFeatures: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Shadow Army Command' },
                  description: { type: 'string', example: 'Command your army...' },
                  icon: { type: 'string', example: '👥' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Player profile not found'
  })
  async getGameStartData(@Req() request: any): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const data = await this.gameService.getGameStartData(wallet);
    return { ok: true, data };
  }

  @Get('completion-data')
  @ApiOperation({
    summary: 'Get game completion data',
    description: 'Retrieves player achievements, rewards, and recent relics for the game completion screen'
  })
  @ApiResponse({
    status: 200,
    description: 'Game completion data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            player: {
              type: 'object',
              properties: {
                displayName: { type: 'string', example: 'ShadowHunter' },
                rank: { type: 'string', example: 'S' },
                level: { type: 'number', example: 25 },
                xp: { type: 'number', example: 1500 },
                avatarId: { type: 'string', example: 'avatar_001' },
                imageUrl: { type: 'string', example: 'https://example.com/avatar.jpg' }
              }
            },
            achievements: {
              type: 'object',
              properties: {
                dungeonsConquered: { type: 'number', example: 15 },
                legendaryRelics: { type: 'number', example: 8 },
                finalRank: { type: 'string', example: 'S' },
                totalXp: { type: 'number', example: 1500 },
                playTime: { type: 'string', example: '2h 34m' }
              }
            },
            rewards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'relic' },
                  name: { type: 'string', example: 'Shadow Monarch\'s Crown' },
                  description: { type: 'string', example: 'Legendary NFT Relic' },
                  icon: { type: 'string', example: '👑' },
                  rarity: { type: 'string', example: 'Legendary' }
                }
              }
            },
            recentRelics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tokenId: { type: 'number', example: 123 },
                  name: { type: 'string', example: 'Shadow Sword' },
                  relicType: { type: 'string', example: 'sword' },
                  imageUrl: { type: 'string', example: 'https://example.com/relic.jpg' },
                  rarity: { type: 'string', example: 'Legendary' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Player profile not found'
  })
  async getGameCompletionData(@Req() request: any): Promise<{ ok: true; data: any }> {
    const wallet = request.user.address;
    const data = await this.gameService.getGameCompletionData(wallet);
    return { ok: true, data };
  }
}
