import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { ArrowLeft, Eye, DollarSign, Sword, Shield, Gem, Zap, Heart, Star, Sparkles, ShoppingCart } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface InventoryPageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party' | 'inventory' | 'marketplace') => void;
  onNavigateToMarketplace: (relicId?: string) => void;
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

// Mock relic data with Solo Leveling theme and anime-style images
const mockRelics: Relic[] = [
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

export function InventoryPage({ onNavigate, onNavigateToMarketplace }: InventoryPageProps) {
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const [relics] = useState<Relic[]>(mockRelics);

  const handleSellToMarketplace = (relic: Relic) => {
    // Navigate to marketplace with relic pre-selected
    onNavigateToMarketplace(relic.id);
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
              onClick={() => onNavigate('marketplace')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-purple-700/80 text-white border-purple-500/50">
              Total Relics: {relics.length}
            </Badge>
            <Badge className="bg-indigo-700/80 text-white border-indigo-500/50">
              Available: {relics.length}
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Shadow Arsenal</h1>
              <p className="text-purple-300">Manage your relics and equipment</p>
            </div>

            {/* Available Relics Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-purple-400" />
                Available Relics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {relics.map((relic) => {
                  const TypeIcon = getTypeIcon(relic.type);
                  return (
                    <Card key={relic.id} className={`bg-black/90 ${getRarityBorderColor(relic.rarity)} border-2 shadow-2xl hover:scale-105 transition-transform`}>
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          <ImageWithFallback
                            src={relic.imageUrl}
                            alt={relic.name}
                            className="w-full h-32 object-cover rounded-lg bg-gradient-to-br from-purple-800/50 to-indigo-800/50"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className={`bg-gradient-to-r ${getRarityColor(relic.rarity)} text-white border-0`}>
                              {relic.rarity}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-bold text-white truncate">{relic.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <TypeIcon className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-purple-300">{relic.type}</span>
                            </div>
                            <span className="text-sm text-gray-400">Lv.{relic.level}</span>
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-800/40"
                                onClick={() => setSelectedRelic(relic)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <RelicDetailsModal relic={relic} onSell={handleSellToMarketplace} />
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Relic Details Modal Component
function RelicDetailsModal({ relic, onSell }: { relic: Relic; onSell: (relic: Relic) => void }) {
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

          {/* Action Button */}
          <div className="pt-4">
            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-xl"
              onClick={() => onSell(relic)}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              List on Marketplace
            </Button>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}