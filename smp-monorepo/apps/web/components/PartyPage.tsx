import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft, Crown, Users, Sword, Shield, Star, Gem, ChevronDown, ChevronUp, AlertCircle, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { apiClient, type GateWithOccupancy } from '@smp/shared';
import { authService } from '../src/lib/auth';

interface PartyPageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party') => void;
  gateId: string | null;
}

export function PartyPage({ onNavigate, gateId }: PartyPageProps) {
  const [gate, setGate] = useState<GateWithOccupancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [equippedRelics, setEquippedRelics] = useState<number[]>([]);
  const [expandedPlayer, setExpandedPlayer] = useState<boolean>(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    if (gateId) {
      loadData();
    }
  }, [gateId]);

  const loadData = async () => {
    if (!gateId) return;

    try {
      setLoading(true);
      setError('');

      // Get gate info
      const gateData = await apiClient.getGate(gateId);
      setGate(gateData);

      // Get current user profile
      const address = authService.address;
      if (address) {
        try {
          const profile = await apiClient.getProfile(address);
          setCurrentUserProfile(profile);
        } catch (error) {
          console.warn('Could not load user profile:', error);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveParty = async () => {
    try {
      onNavigate('dungeons');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to leave party');
    }
  };

  // Early returns for loading and error states
  if (loading) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-white text-lg">Loading dungeon...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <div className="text-red-400 text-lg">{error}</div>
          <Button
            onClick={loadData}
            className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Utility functions (must be defined before early returns to avoid hooks issues)
const getRankBadgeColor = (rank: string) => {
  switch (rank) {
    case 'S': return 'bg-yellow-500 text-black';
    case 'A': return 'bg-purple-500 text-white';
    case 'B': return 'bg-blue-500 text-white';
    case 'C': return 'bg-green-500 text-white';
    case 'D': return 'bg-gray-500 text-white';
    case 'E': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Legendary': return 'text-yellow-400 border-yellow-400';
    case 'Epic': return 'text-purple-400 border-purple-400';
    case 'Rare': return 'text-blue-400 border-blue-400';
    case 'Common': return 'text-gray-400 border-gray-400';
    default: return 'text-gray-400 border-gray-400';
  }
};

  // Early return for null gate
  if (!gate) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-white text-lg">
          {loading ? 'Loading dungeon...' : 'Dungeon not found'}
        </div>
      </div>
    );
  }

// Mock relics data
const mockRelics = [
  {
    id: 1,
    name: "Shadow Ring",
    type: "Accessory",
    rarity: "Epic",
    effects: ["+20% Shadow Damage", "+15% Stealth Duration"],
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=100&h=100&fit=crop&crop=center"
  },
  {
    id: 2,
    name: "Crimson Amulet",
    type: "Necklace",
    rarity: "Rare",
    effects: ["+30 HP", "+10% Fire Resistance"],
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop&crop=center"
  },
  {
    id: 3,
    name: "Void Crystal",
    type: "Stone",
    rarity: "Legendary",
    effects: ["+25% Magic Power", "Void Shield (5 sec cooldown)"],
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop&crop=center"
  },
  {
    id: 4,
    name: "Hunter's Mark",
    type: "Tattoo",
    rarity: "Common",
    effects: ["+5% Experience Gain"],
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center"
  },
  {
    id: 5,
    name: "Ethereal Blade Fragment",
    type: "Weapon Enhancement",
    rarity: "Epic",
    effects: ["+40 Attack Power", "Ghost Strike (Critical hits ignore armor)"],
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=100&h=100&fit=crop&crop=center"
  }
];

  const handleEquipRelic = (relicId: number) => {
    if (equippedRelics.includes(relicId)) {
      setEquippedRelics(prev => prev.filter(id => id !== relicId));
    } else if (equippedRelics.length < 3) {
      setEquippedRelics(prev => [...prev, relicId]);
    }
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* Enhanced Purple Aura Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/90 via-purple-900/80 to-slate-950/95 pointer-events-none"></div>
      <div className="fixed top-1/6 left-1/6 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-1/5 right-1/5 w-[400px] h-[400px] bg-indigo-500/25 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-[350px] h-[350px] bg-violet-600/20 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4">
          <Button
            variant="ghost"
            className="text-white hover:text-purple-200 hover:bg-purple-800/40 border border-purple-600/30"
            onClick={() => onNavigate('dungeons')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dungeons
          </Button>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 px-4 py-2">
              <Sword className="w-4 h-4 mr-2" />
              Dungeon Preparation
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Gate Info Section */}
            <div className="mb-8">
              <Card className="bg-black/90 border-purple-500/50 shadow-2xl shadow-purple-700/30 overflow-hidden">
                <div className="relative">
                  {/* Large Gate Image */}
                  <div className="aspect-[21/9] relative overflow-hidden">
                    <ImageWithFallback
                      src={gate.thumbUrl}
                      alt={gate.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Rank Badge */}
                    <div className={`absolute top-6 left-6 w-16 h-16 ${getRankBadgeColor(gate.rank)} rounded-full flex items-center justify-center font-bold text-2xl shadow-lg`}>
                      {gate.rank}
                    </div>
                    
                    {/* Gate Title and Info */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h1 className="text-4xl font-bold text-white mb-4">
                        {gate.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4">
                        <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-sm">
                          {gate.rank} Rank
                        </Badge>
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Users className="w-5 h-5" />
                          <span>1/{gate.capacity} Hunters</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-300">
                          <MapPin className="w-5 h-5" />
                          <span>{gate.mapCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Solo Hunter Display */}
              <div className="lg:col-span-2">
                <Card className="bg-black/90 border-purple-500/50 shadow-2xl shadow-purple-700/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Solo Hunter</h2>
                      <Badge className="bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-1">
                        1 / {gate.capacity}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <Card className="bg-purple-950/30 border-purple-600/40 hover:border-purple-500/60 transition-colors ring-2 ring-purple-500/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12 border-2 border-purple-500/50">
                                <AvatarImage 
                                  src={currentUserProfile?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authService.address}`} 
                                  alt="Your Avatar" 
                                />
                                <AvatarFallback className="bg-purple-700 text-white">
                                  {authService.address?.slice(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold text-white">
                                    {currentUserProfile?.displayName || 'Hunter'}
                                    <span className="text-purple-400 ml-1">(You)</span>
                                  </h3>
                                  <Crown className="w-4 h-4 text-yellow-400" />
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-sm text-gray-400">Wallet: {authService.address?.slice(0, 6)}...{authService.address?.slice(-4)}</span>
                                  {currentUserProfile && (
                                    <div className={`w-6 h-6 ${getRankBadgeColor(currentUserProfile.rank)} rounded-full flex items-center justify-center text-xs font-bold`}>
                                      {currentUserProfile.rank}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Badge className="bg-green-600 text-white">
                                Ready
                              </Badge>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedPlayer(!expandedPlayer)}
                                className="text-purple-300 hover:text-white"
                              >
                                {expandedPlayer ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {expandedPlayer && currentUserProfile && (
                            <div className="mt-4 pt-4 border-t border-purple-600/30">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-purple-300">Wallet:</span>
                                  <span className="text-white ml-2 font-mono">{authService.address}</span>
                                </div>
                                <div>
                                  <span className="text-purple-300">Rank:</span>
                                  <span className="text-white ml-2">{currentUserProfile.rank}</span>
                                </div>
                                <div>
                                  <span className="text-purple-300">Level:</span>
                                  <span className="text-white ml-2">{currentUserProfile.level}</span>
                                </div>
                                <div>
                                  <span className="text-purple-300">XP:</span>
                                  <span className="text-white ml-2">{currentUserProfile.xp}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions and Relics Panel */}
              <div className="space-y-6">
                {/* Action Button */}
                <Card className="bg-black/90 border-purple-500/50 shadow-2xl shadow-purple-700/30">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
                    
                    <p className="text-sm text-gray-400 mb-4">
                      You are ready to enter the dungeon. Equip your relics and start your adventure!
                    </p>

                    <div className="space-y-3">
                      <Button
                        className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-lg"
                        onClick={() => {
                          // Handle dungeon start
                          console.log('Starting dungeon...');
                        }}
                      >
                        <Sword className="w-5 h-5 mr-2" />
                        Enter Dungeon
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-800/40"
                        onClick={handleLeaveParty}
                      >
                        Back to Dungeons
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Relics Panel */}
                <Card className="bg-black/90 border-purple-500/50 shadow-2xl shadow-purple-700/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Relics</h3>
                      <Badge className="bg-purple-600/20 border border-purple-500/30 text-purple-300 px-2 py-1 text-xs">
                        {equippedRelics.length}/3 Equipped
                      </Badge>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full border-purple-500/50 text-purple-200 bg-purple-700 hover:bg-purple-800/80 hover:text-white hover:border-purple-800 mb-4"
                        >
                          <Gem className="w-4 h-4 mr-2" />
                          Manage Relics
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black/95 border-purple-500/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-white flex items-center space-x-3">
                            <Gem className="w-6 h-6 text-purple-400" />
                            <span>Your Relics</span>
                          </DialogTitle>
                          <DialogDescription className="text-purple-200">
                            Equip up to 3 relics to enhance your abilities in the dungeon. Click on relics to equip or unequip them.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <ScrollArea className="h-[400px] mt-4">
                          <div className="grid grid-cols-1 gap-4">
                            {mockRelics.map((relic) => {
                              const isEquipped = equippedRelics.includes(relic.id);
                              
                              return (
                                <Card 
                                  key={relic.id} 
                                  className={`cursor-pointer transition-all hover:shadow-lg ${
                                    isEquipped 
                                      ? 'bg-purple-950/50 border-purple-400 shadow-purple-400/20' 
                                      : 'bg-gray-950/50 border-gray-600/30 hover:border-purple-500/50'
                                  }`}
                                  onClick={() => handleEquipRelic(relic.id)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start space-x-4">
                                      <div className="relative">
                                        <ImageWithFallback
                                          src={relic.image}
                                          alt={relic.name}
                                          className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        {isEquipped && (
                                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                            <Shield className="w-3 h-3 text-white" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className="font-semibold text-white">{relic.name}</h4>
                                          <Badge className={`text-xs ${getRarityColor(relic.rarity)} bg-transparent`}>
                                            {relic.rarity}
                                          </Badge>
                                        </div>
                                        
                                        <p className="text-sm text-gray-400 mb-2">{relic.type}</p>
                                        
                                        <div className="space-y-1">
                                          {relic.effects.map((effect, index) => (
                                            <div key={index} className="flex items-center space-x-1">
                                              <Star className="w-3 h-3 text-yellow-400" />
                                              <span className="text-sm text-green-400">{effect}</span>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {isEquipped && (
                                          <Badge className="mt-2 bg-green-600 text-white text-xs">
                                            Equipped
                                          </Badge>
                                        )}
                                        
                                        {!isEquipped && equippedRelics.length >= 3 && (
                                          <p className="text-xs text-red-400 mt-2">
                                            Unequip another relic first
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    {/* Currently Equipped Relics Preview */}
                    <div className="space-y-2">
                      <p className="text-sm text-purple-300">Currently Equipped:</p>
                      {equippedRelics.length > 0 ? (
                        <div className="space-y-2">
                          {equippedRelics.map(relicId => {
                            const relic = mockRelics.find(r => r.id === relicId);
                            if (!relic) return null;
                            
                            return (
                              <div key={relicId} className="flex items-center space-x-2 bg-purple-950/30 border border-purple-600/30 rounded-lg p-2">
                                <ImageWithFallback
                                  src={relic.image}
                                  alt={relic.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{relic.name}</p>
                                  <p className="text-xs text-purple-300">{relic.type}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No relics equipped</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}