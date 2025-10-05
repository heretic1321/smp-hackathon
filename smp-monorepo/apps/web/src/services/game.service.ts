import { apiClient } from './api-client';

export interface GameStartData {
  player: {
    displayName: string;
    rank: string;
    level: number;
    xp: number;
    avatarId: string;
    imageUrl: string;
  };
  currentMission: {
    gateId: string;
    gateName: string;
    bossName: string;
    difficulty: string;
    description: string;
  };
  equippedRelics: Array<{
    tokenId: number;
    name: string;
    relicType: string;
    imageUrl: string;
    benefits: string[];
  }>;
  gameFeatures: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export interface GameCompletionData {
  player: {
    displayName: string;
    rank: string;
    level: number;
    xp: number;
    avatarId: string;
    imageUrl: string;
  };
  achievements: {
    dungeonsConquered: number;
    legendaryRelics: number;
    finalRank: string;
    totalXp: number;
    playTime: string;
  };
  rewards: Array<{
    type: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
  }>;
  recentRelics: Array<{
    tokenId: number;
    name: string;
    relicType: string;
    imageUrl: string;
    rarity: string;
  }>;
}

class GameService {
  async getGameStartData(): Promise<GameStartData> {
    try {
      const response = await apiClient.getGameStartData();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch game start data:', error);
      throw new Error('Failed to load game start data');
    }
  }

  async getGameCompletionData(): Promise<GameCompletionData> {
    try {
      const response = await apiClient.getGameCompletionData();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch game completion data:', error);
      throw new Error('Failed to load game completion data');
    }
  }
}

export const gameService = new GameService();
