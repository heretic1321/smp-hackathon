import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Eye, ShoppingCart, Wallet, Sword, Shield, Gem, Sparkles, Star, TrendingUp, Users, Clock, Package, Loader2, AlertCircle } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { inventoryService, type Relic } from '../src/services/inventory.service';
import { walletService } from '../src/lib/wallet';

interface MarketplacePageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party' | 'inventory' | 'marketplace') => void;
  selectedRelicId?: string | null;
}

// Relic interface is imported from inventory service

interface MarketListing {
  id: string;
  relic: Relic;
  seller: string;
  priceETH: number;
  listedAt: string;
  isOwned: boolean;
}

// Mock marketplace listings from other users
const mockMarketListings: MarketListing[] = [
  {
    id: 'market-1',
    relic: {
      id: 'market-relic-1',
      name: 'Shadow Monarch\'s Dual Blade',
      rarity: 'Mythic',
      type: 'sword',
      description: 'A legendary dual blade infused with the power of shadows. Forged in the deepest dungeons by ancient shadow smiths, this weapon channels the very essence of darkness itself.',
      benefits: [
        '+50% Shadow Damage',
        '+30% Critical Strike Chance',
        'Shadow Clone: Creates shadow duplicates when attacking',
        'Darkness Aura: Intimidates nearby enemies'
      ],
      imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759612747/Gemini_Generated_Image_fdypzafdypzafdyp_mjlfli.png',
      marketValue: 2.5,
      equipped: false,
      tokenId: 1001,
      relicType: 'sword',
      affixes: { shadow_damage: 50, crit_chance: 30 },
      cid: 'QmShadowBlade123'
    },
    seller: 'DragonSlayer88',
    priceETH: 2.5,
    listedAt: '2 hours ago',
    isOwned: false
  },
  {
    id: 'market-2',
    relic: {
      id: 'market-relic-2',
      name: 'Void Assassin\'s Dagger',
      rarity: 'Legendary',
      type: 'sword',
      description: 'A razor-sharp dagger that cuts through dimensions. Wielded by the most skilled assassins, it leaves no trace of its passage.',
      benefits: [
        '+40% Stealth Damage',
        '+25% Critical Hit Rate',
        'Void Strike: Teleports behind target',
        'Silent Death: No sound when attacking'
      ],
      imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759611020/Gemini_Generated_Image_czt4nsczt4nsczt4_gnjbmi.png',
      marketValue: 1.8,
      equipped: false,
      tokenId: 1002,
      relicType: 'sword',
      affixes: { stealth_damage: 40, crit_rate: 25 },
      cid: 'QmVoidDagger456'
    },
    seller: 'ShadowHunter42',
    priceETH: 1.8,
    listedAt: '5 hours ago',
    isOwned: false
  },
  {
    id: 'market-3',
    relic: {
      id: 'market-relic-3',
      name: 'Storm Archer\'s Bow',
      rarity: 'Epic',
      type: 'sword',
      description: 'An ethereal bow that channels the power of storms. Each arrow carries the fury of lightning and the precision of wind.',
      benefits: [
        '+60% Ranged Damage',
        '+35% Attack Speed',
        'Lightning Arrows: Chain lightning between enemies',
        'Wind Guidance: Arrows never miss'
      ],
      imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759611020/Gemini_Generated_Image_czt4nsczt4nsczt4_gnjbmi.png',
      marketValue: 0.85,
      equipped: false,
      tokenId: 1003,
      relicType: 'sword',
      affixes: { ranged_damage: 60, attack_speed: 35 },
      cid: 'QmStormBow789'
    },
    seller: 'MysticWarrior',
    priceETH: 0.85,
    listedAt: '1 day ago',
    isOwned: false
  },
  {
    id: 'market-4',
    relic: {
      id: 'market-relic-4',
      name: 'Arcane Scholar\'s Staff',
      rarity: 'Rare',
      type: 'sword',
      description: 'A mystical staff imbued with ancient knowledge. It amplifies magical power and channels the wisdom of forgotten mages.',
      benefits: [
        '+70% Magic Damage',
        '+50% Mana Regeneration',
        'Arcane Mastery: Spells cost 30% less mana',
        'Ancient Wisdom: Unlock hidden spell combinations'
      ],
      imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759611020/Gemini_Generated_Image_czt4nsczt4nsczt4_gnjbmi.png',
      marketValue: 0.45,
      equipped: false,
      tokenId: 1004,
      relicType: 'sword',
      affixes: { magic_damage: 70, mana_regen: 50 },
      cid: 'QmArcaneStaff012'
    },
    seller: 'ElementalMage',
    priceETH: 0.45,
    listedAt: '3 days ago',
    isOwned: false
  },
  {
    id: 'market-5',
    relic: {
      id: 'market-relic-5',
      name: 'Guardian\'s Bulwark',
      rarity: 'Epic',
      type: 'sword',
      description: 'An unbreakable shield forged from the bones of ancient dragons. It provides unmatched protection and reflects damage back to attackers.',
      benefits: [
        '+80% Damage Reduction',
        '+40% Block Chance',
        'Dragon\'s Roar: Stuns nearby enemies',
        'Reflective Barrier: 50% damage reflection'
      ],
      imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759611020/Gemini_Generated_Image_czt4nsczt4nsczt4_gnjbmi.png',
      marketValue: 1.2,
      equipped: false,
      tokenId: 1005,
      relicType: 'sword',
      affixes: { damage_reduction: 80, block_chance: 40 },
      cid: 'QmGuardianShield345'
    },
    seller: 'TankMaster',
    priceETH: 1.2,
    listedAt: '6 hours ago',
    isOwned: false
  },
  {
    id: 'market-6',
    relic: {
      id: 'market-relic-6',
      name: 'Phoenix Feather Blade',
      rarity: 'Legendary',
      type: 'sword',
      description: 'A blade forged from the feather of a phoenix. It burns with eternal fire and grants the power of resurrection.',
      benefits: [
        '+45% Fire Damage',
        '+25% Health Regeneration',
        'Phoenix Rebirth: Revive once per battle',
        'Eternal Flame: Never runs out of durability'
      ],
      imageUrl: 'https://res.cloudinary.com/dionysus2359/image/upload/v1759612747/Gemini_Generated_Image_fdypzafdypzafdyp_mjlfli.png',
      marketValue: 2.1,
      equipped: false,
      tokenId: 1006,
      relicType: 'sword',
      affixes: { fire_damage: 45, health_regen: 25 },
      cid: 'QmPhoenixBlade678'
    },
    seller: 'FireKnight',
    priceETH: 2.1,
    listedAt: '4 hours ago',
    isOwned: false
  }
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Mythic': return 'from-orange-500 to-red-500';
    case 'Legendary': return 'from-yellow-400 to-orange-500';
    case 'Epic': return 'from-purple-500 to-pink-500';
    case 'Rare': return 'from-blue-500 to-cyan-500';
    case 'Common': return 'from-gray-400 to-gray-600';
    default: return 'from-gray-400 to-gray-600';
  }
};

const getRarityBorderColor = (rarity: string) => {
  switch (rarity) {
    case 'Mythic': return 'border-orange-500/80';
    case 'Legendary': return 'border-yellow-500/80';
    case 'Epic': return 'border-purple-500/80';
    case 'Rare': return 'border-blue-500/80';
    case 'Common': return 'border-gray-500/80';
    default: return 'border-gray-500/80';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'sword': return Sword;
    case 'armor': return Shield;
    case 'accessory': return Gem;
    case 'stone': return Sparkles;
    default: return Star;
  }
};

export function MarketplacePage({ onNavigate, selectedRelicId }: MarketplacePageProps) {
  const [selectedTab, setSelectedTab] = useState<'browse' | 'sell'>('browse');
  const [selectedRelicToSell, setSelectedRelicToSell] = useState<Relic | null>(null);
  const [sellPrice, setSellPrice] = useState<string>('');
  const [marketListings] = useState<MarketListing[]>(mockMarketListings);
  const [userRelics, setUserRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const walletAddress = walletService.getAddress();
        if (!walletAddress) {
          throw new Error('Wallet not connected');
        }

        const inventoryData = await inventoryService.getInventory(walletAddress);
        setUserRelics(inventoryData);
      } catch (err) {
        console.error('Failed to load inventory:', err);
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    loadUserInventory();
  }, []);

  // Auto-select relic if passed from inventory
  useEffect(() => {
    if (selectedRelicId && userRelics.length > 0) {
      const relic = userRelics.find(r => r.id === selectedRelicId);
      if (relic) {
        setSelectedRelicToSell(relic);
        setSellPrice(relic.marketValue.toString());
        setSelectedTab('sell');
      }
    }
  }, [selectedRelicId, userRelics]);

  const handleBuyRelic = (listing: MarketListing) => {
    // Mock MetaMask purchase
    console.log('Initiating MetaMask purchase for:', listing.relic.name, 'Price:', listing.priceETH, 'ETH');
    // In a real app, this would integrate with MetaMask
    alert(`Purchase initiated via MetaMask for ${listing.relic.name} at ${listing.priceETH} ETH`);
  };

  const handleListRelic = () => {
    if (selectedRelicToSell && sellPrice) {
      // Mock MetaMask listing
      console.log('Listing relic:', selectedRelicToSell.name, 'Price:', sellPrice, 'ETH');
      // In a real app, this would integrate with MetaMask
      alert(`Listing created via MetaMask for ${selectedRelicToSell.name} at ${sellPrice} ETH`);
      setSelectedRelicToSell(null);
      setSellPrice('');
    }
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* Enhanced Purple Aura Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/80 via-purple-900/70 to-slate-950/90 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-violet-600/15 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white hover:text-purple-200 hover:bg-purple-800/40 border border-purple-600/30"
              onClick={() => onNavigate('profile')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            
            <Button
              variant="outline"
              className="border-purple-500/60 text-purple-600 hover:bg-purple-800/50 hover:border-purple-400 hover:text-purple-100 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium"
              onClick={() => onNavigate('inventory')}
            >
              <Package className="w-4 h-4 mr-2" />
              My Inventory
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-emerald-700/80 text-white border-emerald-500/50">
              <TrendingUp className="w-3 h-3 mr-1" />
              Active Market
            </Badge>
            <Badge className="bg-blue-700/80 text-white border-blue-500/50">
              <Users className="w-3 h-3 mr-1" />
              {marketListings.length} Listings
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Shadow Marketplace</h1>
              <p className="text-purple-300">Trade relics with other hunters using ETH</p>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'browse' | 'sell')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/80 border border-purple-600/30">
                <TabsTrigger value="browse" className="data-[state=active]:bg-purple-700/60 text-white">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Browse & Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-purple-700/60 text-white">
                  <Wallet className="w-4 h-4 mr-2" />
                  Sell Relics
                </TabsTrigger>
              </TabsList>

              {/* Browse Tab */}
              <TabsContent value="browse" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {marketListings.map((listing) => {
                    const TypeIcon = getTypeIcon(listing.relic.type);
                    return (
                      <Card key={listing.id} className={`bg-black/90 ${getRarityBorderColor(listing.relic.rarity)} border-2 shadow-2xl hover:scale-105 transition-transform`}>
                        <CardContent className="p-4">
                          <div className="relative mb-3">
                            <ImageWithFallback
                              src={listing.relic.imageUrl}
                              alt={listing.relic.name}
                              className="w-full h-32 object-cover rounded-lg bg-gradient-to-br from-purple-800/50 to-indigo-800/50"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className={`bg-gradient-to-r ${getRarityColor(listing.relic.rarity)} text-white border-0`}>
                                {listing.relic.rarity}
                              </Badge>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-1">
                                <p className="text-xs text-purple-300">Seller: {listing.seller}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-bold text-white truncate">{listing.relic.name}</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <TypeIcon className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-purple-300">{listing.relic.type}</span>
                              </div>
                            </div>
                            
                            <div className="bg-emerald-950/50 border border-emerald-600/30 rounded p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-emerald-300">Price:</span>
                                <span className="text-emerald-400 font-bold">{listing.priceETH} ETH</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-blue-500/60 text-blue-500 hover:bg-blue-800/50 hover:border-blue-400 hover:text-blue-100 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <RelicDetailsModal relic={listing.relic} />
                              </Dialog>
                              
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 font-semibold"
                                onClick={() => handleBuyRelic(listing)}
                              >
                                <Wallet className="w-4 h-4 mr-1" />
                                Buy Now
                              </Button>
                            </div>

                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              Listed {listing.listedAt}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Sell Tab */}
              <TabsContent value="sell" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Relic Selection */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Select Relic to Sell</h2>
                    
                    {/* Loading State */}
                    {loading && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-4" />
                        <p className="text-purple-300">Loading your inventory...</p>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                        <p className="text-red-300 mb-4">{error}</p>
                        <Button
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-800/40"
                          onClick={() => window.location.reload()}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}

                    {/* Relics Grid */}
                    {!loading && !error && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {userRelics.length === 0 ? (
                          <div className="col-span-2 text-center py-12">
                            <div className="text-purple-300 mb-4">
                              <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <h3 className="text-xl font-bold mb-2">No Relics Found</h3>
                              <p>You don't have any relics to sell yet. Complete dungeon runs to earn them!</p>
                            </div>
                            <Button
                              variant="outline"
                              className="border-purple-500/50 text-purple-300 hover:bg-purple-800/40"
                              onClick={() => onNavigate('dungeons')}
                            >
                              Go to Dungeons
                            </Button>
                          </div>
                        ) : (
                          userRelics.map((relic) => {
                            const TypeIcon = getTypeIcon(relic.type);
                            const isSelected = selectedRelicToSell?.id === relic.id;
                            return (
                              <Card 
                                key={relic.id} 
                                className={`bg-black/90 ${getRarityBorderColor(relic.rarity)} border-2 shadow-xl cursor-pointer transition-all ${
                                  isSelected ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-102'
                                }`}
                                onClick={() => {
                                  setSelectedRelicToSell(relic);
                                  setSellPrice(relic.marketValue.toString());
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="relative mb-2">
                                    <ImageWithFallback
                                      src={relic.imageUrl}
                                      alt={relic.name}
                                      className="w-full h-24 object-cover rounded-lg bg-gradient-to-br from-purple-800/50 to-indigo-800/50"
                                    />
                                    <div className="absolute top-1 right-1">
                                      <Badge className={`bg-gradient-to-r ${getRarityColor(relic.rarity)} text-white border-0 text-xs`}>
                                        {relic.rarity}
                                      </Badge>
                                    </div>
                                  </div>
                                  <h3 className="font-bold text-white text-sm truncate">{relic.name}</h3>
                                  <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center space-x-1">
                                      <TypeIcon className="w-3 h-3 text-purple-400" />
                                      <span className="text-xs text-purple-300">{relic.type}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-xs text-emerald-400">
                                    Suggested: {relic.marketValue} ETH
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Listing Details */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Listing Details</h2>
                    {selectedRelicToSell ? (
                      <Card className="bg-black/90 border-purple-600/30">
                        <CardHeader>
                          <CardTitle className="text-white">{selectedRelicToSell.name}</CardTitle>
                          <Badge className={`bg-gradient-to-r ${getRarityColor(selectedRelicToSell.rarity)} text-white border-0 w-fit`}>
                            {selectedRelicToSell.rarity}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="relative">
                            <ImageWithFallback
                              src={selectedRelicToSell.imageUrl}
                              alt={selectedRelicToSell.name}
                              className="w-full h-48 object-cover rounded-lg bg-gradient-to-br from-purple-800/50 to-indigo-800/50"
                            />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="price" className="text-purple-300">Price (ETH)</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                className="bg-purple-950/50 border-purple-600/50 text-white placeholder:text-gray-400"
                              />
                              <p className="text-sm text-gray-400 mt-1">
                                Suggested price: {selectedRelicToSell.marketValue} ETH
                              </p>
                            </div>

                            <Separator className="bg-purple-600/30" />

                            <div className="bg-purple-950/50 border border-purple-600/30 rounded-lg p-4">
                              <h4 className="text-white font-bold mb-2">Transaction Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Listing Price:</span>
                                  <span className="text-white">{sellPrice || '0'} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Platform Fee (2.5%):</span>
                                  <span className="text-white">{(parseFloat(sellPrice || '0') * 0.025).toFixed(4)} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-300">You'll receive:</span>
                                  <span className="text-emerald-400 font-bold">{(parseFloat(sellPrice || '0') * 0.975).toFixed(4)} ETH</span>
                                </div>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-purple-500/25 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={handleListRelic}
                              disabled={!sellPrice || parseFloat(sellPrice) <= 0}
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              List with MetaMask
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-black/90 border-purple-600/30">
                        <CardContent className="p-8 text-center">
                          <div className="text-gray-400 mb-4">
                            <Gem className="w-12 h-12 mx-auto mb-2" />
                            <p>Select a relic from your inventory to list on the marketplace</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

// Relic Details Modal Component
function RelicDetailsModal({ relic }: { relic: Relic }) {
  const TypeIcon = getTypeIcon(relic.type);

  return (
    <DialogContent className="bg-black/95 border-purple-500/50 text-white max-w-2xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle className="text-2xl text-white flex items-center">
          <TypeIcon className="w-6 h-6 mr-2 text-purple-400" />
          {relic.name}
        </DialogTitle>
        <DialogDescription className="text-purple-300">
          {relic.rarity} {relic.type}
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-6 pr-4">
          {/* Relic Image */}
          <div className="relative">
            <ImageWithFallback
              src={relic.imageUrl}
              alt={relic.name}
              className="w-full h-48 object-cover rounded-lg bg-gradient-to-br from-purple-800/50 to-indigo-800/50"
            />
            <div className="absolute top-4 right-4">
              <Badge className={`bg-gradient-to-r ${getRarityColor(relic.rarity)} text-white border-0 text-lg px-3 py-1`}>
                {relic.rarity}
              </Badge>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-purple-300 mb-1">Type</p>
              <p className="text-white">{relic.type}</p>
            </div>
          </div>

          <Separator className="bg-purple-600/30" />

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Description</h3>
            <p className="text-gray-300 leading-relaxed">{relic.description}</p>
          </div>

          <Separator className="bg-purple-600/30" />

          {/* Benefits */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Benefits & Effects</h3>
            <div className="space-y-2">
              {relic.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-purple-600/30" />

          {/* Market Value */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Market Information</h3>
            <div className="bg-purple-950/50 border border-purple-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-purple-300">Estimated Value:</span>
                <span className="text-emerald-400 font-bold text-lg">{relic.marketValue} ETH</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}