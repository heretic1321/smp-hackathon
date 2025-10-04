import { apiClient, type Address, type InventoryResponse } from '@smp/shared';

export interface Relic {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  type: string; // Use actual relicType from database
  description: string;
  benefits: string[];
  imageUrl: string;
  marketValue: number;
  equipped: boolean;
  tokenId: number;
  relicType: string;
  affixes: Record<string, number>;
  cid: string;
}

export class InventoryService {
  /**
   * Fetch inventory data for a wallet address
   */
  async getInventory(wallet: Address): Promise<Relic[]> {
    try {
      const response = await apiClient.getInventory(wallet);
      return this.mapInventoryToRelics(response);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      throw new Error('Failed to load inventory data');
    }
  }

  /**
   * Map database inventory items to UI relic format
   */
  private mapInventoryToRelics(inventory: InventoryResponse): Relic[] {
    return inventory.items.map((item, index) => {
      // Use real data from database instead of generating it
      const name = item.name || `Unknown ${item.relicType}`;
      const description = item.description || 'A mysterious relic with unknown properties.';
      const benefits = item.benefits || ['Unknown abilities'];
      const imageUrl = item.imageUrl || 'https://via.placeholder.com/300x300?text=Relic';
      
      // Determine rarity based on affixes or relic type
      const rarity = this.determineRarity(item);
      
      // Use actual relicType from database as the type
      const type = item.relicType;
      
      // Calculate market value based on rarity and affixes
      const marketValue = this.calculateMarketValue(rarity, item.affixes);

      return {
        id: `relic_${item.tokenId}`,
        name,
        rarity,
        type,
        description,
        benefits,
        imageUrl,
        marketValue,
        equipped: item.equipped || false,
        tokenId: item.tokenId,
        relicType: item.relicType,
        affixes: item.affixes,
        cid: item.cid,
      };
    });
  }

  /**
   * Determine rarity based on affixes or relic type
   */
  private determineRarity(item: any): 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' {
    const affixCount = Object.keys(item.affixes).length;
    const maxAffixValue = Math.max(...Object.values(item.affixes) as number[]);
    
    if (maxAffixValue >= 20 || affixCount >= 5) return 'Mythic';
    if (maxAffixValue >= 15 || affixCount >= 4) return 'Legendary';
    if (maxAffixValue >= 10 || affixCount >= 3) return 'Epic';
    if (maxAffixValue >= 5 || affixCount >= 2) return 'Rare';
    return 'Common';
  }



  /**
   * Calculate market value based on rarity and affixes
   */
  private calculateMarketValue(rarity: string, affixes: Record<string, number>): number {
    const baseValues: Record<string, number> = {
      'Common': 0.01,
      'Rare': 0.05,
      'Epic': 0.20,
      'Legendary': 0.50,
      'Mythic': 1.00,
    };
    
    const baseValue = baseValues[rarity] || 0.01;
    const affixMultiplier = Object.values(affixes).reduce((sum, value) => sum + Math.abs(value), 0) / 100;
    
    return Math.max(baseValue, baseValue + affixMultiplier);
  }


}

export const inventoryService = new InventoryService();
