import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Eye, ShoppingCart, Wallet, Sword, Shield, Gem, Sparkles, Star, TrendingUp, Users, Clock, Package } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MarketplacePageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party' | 'inventory' | 'marketplace') => void;
  selectedRelicId?: string | null;
}

// Relic type definitions
interface Relic {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  type: 'Weapon' | 'Armor' | 'Accessory' | 'Stone';
  description: string;
  benefits: string[];
  imageUrl: string;
  marketValue: number;
  level: number;
  equipped: boolean;
}

interface MarketListing {
  id: string;
  relic: Relic;
  seller: string;
  priceETH: number;
  listedAt: string;
  isOwned: boolean;
}

// Mock user relics (same as inventory)
const mockUserRelics: Relic[] = [
  {
    id: '1',
    name: 'Shadow Monarch\'s Blade',
    rarity: 'Mythic',
    type: 'Weapon',
    description: 'A legendary blade infused with the power of shadows. Forged in the deepest dungeons by ancient shadow smiths, this weapon channels the very essence of darkness itself.',
    benefits: [
      '+50% Shadow Damage',
      '+30% Critical Strike Chance',
      'Shadow Clone: Creates shadow duplicates when attacking',
      'Darkness Aura: Intimidates nearby enemies'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1712574823919-11ba072b4f08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHN3b3JkJTIwd2VhcG9uJTIwa2F0YW5hfGVufDF8fHx8MTc1OTU5NzA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    marketValue: 1.25,
    level: 85,
    equipped: false
  },
  {
    id: '2',
    name: 'Void Crystal of Eternity',
    rarity: 'Legendary',
    type: 'Accessory',
    description: 'A mysterious crystal that contains fragments of the void realm. Its dark energy pulsates with otherworldly power.',
    benefits: [
      '+25% Magic Damage',
      '+200 Mana',
      'Void Shield: Absorbs incoming damage',
      'Mana Regeneration +50%'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1753522491584-7f413014e31d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGNyeXN0YWwlMjBtYWdpYyUyMGdlbSUyMHB1cnBsZXxlbnwxfHx8fDE3NTk1OTcwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    marketValue: 0.65,
    level: 70,
    equipped: false
  },
  {
    id: '3',
    name: 'Dragon Scale Armor',
    rarity: 'Epic',
    type: 'Armor',
    description: 'Crafted from the scales of an ancient red dragon. Provides exceptional protection against both physical and magical attacks.',
    benefits: [
      '+300 Defense',
      '+15% Fire Resistance',
      'Dragon\'s Might: Increases strength in combat',
      'Heat Protection: Immunity to burn effects'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1718202384239-8de0147482c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGFybW9yJTIwZmFudGFzeSUyMGRyYWdvbiUyMHNjYWxlfGVufDF8fHx8MTc1OTU5NzA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    marketValue: 0.38,
    level: 60,
    equipped: false
  },
  {
    id: '4',
    name: 'Mana Stone of the Arcane',
    rarity: 'Rare',
    type: 'Stone',
    description: 'A glowing blue stone filled with pure magical energy. Often used by mages to enhance their spellcasting abilities.',
    benefits: [
      '+100 Mana',
      '+10% Spell Power',
      'Arcane Focus: Reduces spell cooldowns',
      'Magical Resonance: Enhances all magical effects'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1748261212356-90a204fccf89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1hZ2ljJTIwc3RvbmUlMjBibHVlJTIwY3J5c3RhbCUyMG9yYnxlbnwxfHx8fDE3NTk1OTcwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    marketValue: 0.20,
    level: 45,
    equipped: false
  },
  {
    id: '5',
    name: 'Hunter\'s Lucky Charm',
    rarity: 'Common',
    type: 'Accessory',
    description: 'A simple charm carried by many hunters. While not particularly powerful, it provides a small boost to luck and fortune.',
    benefits: [
      '+5% Drop Rate',
      '+2% Critical Chance',
      'Lucky Strike: Rare chance for double damage'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1679019937997-2272d4a840ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHBlbmRhbnQlMjBjaGFybSUyMGFjY2Vzc29yeSUyMGpld2Vscnl8ZW58MXx8fHwxNzU5NTk3MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    marketValue: 0.012,
    level: 10,
    equipped: false
  },
  {
    id: '6',
    name: 'Crimson Gauntlets of Power',
    rarity: 'Epic',
    type: 'Armor',
    description: 'Blood-red gauntlets that enhance the wearer\'s physical prowess. Forged by master craftsmen using rare crimson ore.',
    benefits: [
      '+150 Attack Power',
      '+20% Attack Speed',
      'Blood Rush: Increases damage with each kill',
      'Iron Grip: Cannot be disarmed'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1737170317183-a13de1ce7d8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGdhdW50bGV0cyUyMHJlZCUyMGFybW9yJTIwZmFudGFzeXxlbnwxfHx8fDE3NTk1OTcwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    marketValue: 0.30,
    level: 55,
    equipped: false
  }
];

// Mock marketplace listings from other users
const mockMarketListings: MarketListing[] = [
  {
    id: 'market-1',
    relic: {
      id: 'market-relic-1',
      name: 'Thunder God\'s Spear',
      rarity: 'Mythic',
      type: 'Weapon',
      description: 'A divine spear crackling with lightning. Wielded by the Thunder God himself, this weapon can call down bolts from the heavens.',
      benefits: [
        '+60% Lightning Damage',
        '+40% Critical Strike Chance',
        'Thunder Strike: Chains lightning between enemies',
        'Divine Blessing: Immunity to paralysis'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1712574823919-11ba072b4f08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHN3b3JkJTIwd2VhcG9uJTIwa2F0YW5hfGVufDF8fHx8MTc1OTU5NzA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      marketValue: 2.5,
      level: 90,
      equipped: false
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
      name: 'Phoenix Feather Pendant',
      rarity: 'Legendary',
      type: 'Accessory',
      description: 'A beautiful pendant containing a genuine phoenix feather. Grants the power of resurrection and fire immunity.',
      benefits: [
        '+30% Fire Damage',
        '+500 Health',
        'Phoenix Rebirth: Revive once per battle',
        'Fire Immunity: Complete protection from fire'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1679019937997-2272d4a840ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHBlbmRhbnQlMjBjaGFybSUyMGFjY2Vzc29yeSUyMGpld2Vscnl8ZW58MXx8fHwxNzU5NTk3MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      marketValue: 1.8,
      level: 75,
      equipped: false
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
      name: 'Celestial Shield of Aegis',
      rarity: 'Epic',
      type: 'Armor',
      description: 'A divine shield blessed by celestial beings. Provides unparalleled protection and reflects enemy attacks.',
      benefits: [
        '+400 Defense',
        '+25% Block Chance',
        'Aegis Reflection: Reflects 50% of blocked damage',
        'Divine Protection: Reduces all damage by 15%'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1718202384239-8de0147482c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGFybW9yJTIwZmFudGFzeSUyMGRyYWdvbiUyMHNjYWxlfGVufDF8fHx8MTc1OTU5NzA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      marketValue: 0.85,
      level: 65,
      equipped: false
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
      name: 'Arcane Crystal of Power',
      rarity: 'Rare',
      type: 'Stone',
      description: 'A concentrated crystal of pure magical energy. Enhances all magical abilities and provides unlimited mana.',
      benefits: [
        '+150 Mana',
        '+20% Spell Power',
        'Infinite Mana: Never runs out of mana',
        'Spell Mastery: All spells cost 25% less'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1748261212356-90a204fccf89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1hZ2ljJTIwc3RvbmUlMjBibHVlJTIwY3J5c3RhbCUyMG9yYnxlbnwxfHx8fDE3NTk1OTcwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      marketValue: 0.45,
      level: 50,
      equipped: false
    },
    seller: 'ElementalMage',
    priceETH: 0.45,
    listedAt: '3 days ago',
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
    case 'Weapon': return Sword;
    case 'Armor': return Shield;
    case 'Accessory': return Gem;
    case 'Stone': return Sparkles;
    default: return Star;
  }
};

export function MarketplacePage({ onNavigate, selectedRelicId }: MarketplacePageProps) {
  const [selectedTab, setSelectedTab] = useState<'browse' | 'sell'>('browse');
  const [selectedRelicToSell, setSelectedRelicToSell] = useState<Relic | null>(null);
  const [sellPrice, setSellPrice] = useState<string>('');
  const [marketListings] = useState<MarketListing[]>(mockMarketListings);

  // Auto-select relic if passed from inventory
  useState(() => {
    if (selectedRelicId) {
      const relic = mockUserRelics.find(r => r.id === selectedRelicId);
      if (relic) {
        setSelectedRelicToSell(relic);
        setSellPrice(relic.marketValue.toString());
        setSelectedTab('sell');
      }
    }
  });

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
              className="border-purple-500/50 text-purple-300 hover:bg-purple-800/40 hover:border-purple-400 hover:text-white transition-all"
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
                <TabsTrigger value="browse" className="data-[state=active]:bg-purple-700/60 data-[state=active]:text-white">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Browse & Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-purple-700/60 data-[state=active]:text-white">
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
                              <span className="text-sm text-gray-400">Lv.{listing.relic.level}</span>
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
                                    className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-800/40"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <RelicDetailsModal relic={listing.relic} />
                              </Dialog>
                              
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                                onClick={() => handleBuyRelic(listing)}
                              >
                                <Wallet className="w-4 h-4 mr-1" />
                                Buy
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {mockUserRelics.map((relic) => {
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
                                <span className="text-xs text-gray-400">Lv.{relic.level}</span>
                              </div>
                              <div className="mt-2 text-xs text-emerald-400">
                                Suggested: {relic.marketValue} ETH
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
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
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
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
          {relic.rarity} {relic.type} - Level {relic.level}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-purple-300 mb-1">Type</p>
              <p className="text-white">{relic.type}</p>
            </div>
            <div>
              <p className="text-sm text-purple-300 mb-1">Level</p>
              <p className="text-white">{relic.level}</p>
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