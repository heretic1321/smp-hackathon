import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { ArrowLeft, Eye, DollarSign, Sword, Shield, Gem, Zap, Heart, Star, Sparkles, ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { inventoryService, type Relic } from '../src/services/inventory.service';
import { walletService } from '../src/lib/wallet';

interface InventoryPageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party' | 'inventory' | 'marketplace') => void;
  onNavigateToMarketplace: (relicId?: string) => void;
}


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

export function InventoryPage({ onNavigate, onNavigateToMarketplace }: InventoryPageProps) {
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const walletAddress = walletService.getAddress();
        if (!walletAddress) {
          throw new Error('Wallet not connected');
        }

        const inventoryData = await inventoryService.getInventory(walletAddress);
        setRelics(inventoryData);
      } catch (err) {
        console.error('Failed to load inventory:', err);
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  const handleSellToMarketplace = (relic: Relic) => {
    // Navigate to marketplace with relic pre-selected
    onNavigateToMarketplace(relic.id);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const walletAddress = walletService.getAddress();
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      const inventoryData = await inventoryService.getInventory(walletAddress);
      setRelics(inventoryData);
    } catch (err) {
      console.error('Failed to refresh inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh inventory');
    } finally {
      setLoading(false);
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
              className="border-emerald-500/60 text-emerald-700 hover:bg-emerald-800/50 hover:border-emerald-400 hover:text-emerald-100 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 font-medium"
              onClick={() => onNavigate('marketplace')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Marketplace
            </Button>

            <Button
              variant="outline"
              className="border-amber-500/60 text-amber-700 hover:bg-amber-800/50 hover:border-amber-400 hover:text-amber-100 transition-all duration-200 shadow-lg hover:shadow-amber-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Refresh Inventory
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
                  onClick={handleRefresh}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Available Relics Section */}
            {!loading && !error && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Heart className="w-6 h-6 mr-2 text-purple-400" />
                  Available Relics
                </h2>
                
                {relics.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-purple-300 mb-4">
                      <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-bold mb-2">No Relics Found</h3>
                      <p>You don't have any relics yet. Complete dungeon runs to earn them!</p>
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
                              </div>
                              
                              <Dialog>
                                <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-blue-500/60 text-blue-600 hover:bg-blue-800/50 hover:border-blue-400 hover:text-blue-100 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 font-medium"
              onClick={() => setSelectedRelic(relic)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
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
                )}
              </div>
            )}
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

          {/* Action Button */}
          <div className="pt-4">
            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-200 font-semibold"
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