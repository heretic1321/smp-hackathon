import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft, Crown, Users, Clock, Sword, Shield, Star, Gem, ChevronDown, ChevronUp, AlertCircle, Wifi, WifiOff, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { apiClient, type Party, type GateWithOccupancy } from '@smp/shared';
import { authService } from '../src/lib/auth';

interface PartyPageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party') => void;
  gateId: string | null;
}

export function PartyPage({ onNavigate, gateId }: PartyPageProps) {
  const [party, setParty] = useState<Party | null>(null);
  const [gate, setGate] = useState<GateWithOccupancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [sseConnected, setSseConnected] = useState(false);
  const [equippedRelics, setEquippedRelics] = useState<number[]>([]);
  const [starting, setStarting] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  useEffect(() => {
    if (gateId) {
      loadParty();
    }
  }, [gateId]);

  useEffect(() => {
    if (party) {
      setupSSE();
    }
    return () => {
      // Cleanup SSE connection
      if (typeof window !== 'undefined' && (window as any).eventSource) {
        (window as any).eventSource.close();
      }
    };
  }, [party]);

  const loadParty = async () => {
    if (!gateId) return;

    try {
      setLoading(true);
      setError('');

      // Get gate info first
      const gateData = await apiClient.getGate(gateId);
      setGate(gateData);

      // Join or create party
      const partyData = await apiClient.joinOrCreateParty({ gateId });
      setParty(partyData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load party');
    } finally {
      setLoading(false);
    }
  };

  const setupSSE = () => {
    if (!party) return;

    // Close existing connection
    if (typeof window !== 'undefined' && (window as any).eventSource) {
      (window as any).eventSource.close();
    }

    const eventSource = apiClient.createPartySSEConnection(party.partyId);

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    eventSource.addEventListener('member_joined', (event) => {
      const data = JSON.parse(event.data);
      setParty(prev => prev ? {
        ...prev,
        members: [...prev.members, data]
      } : null);
    });

    eventSource.addEventListener('member_left', (event) => {
      const data = JSON.parse(event.data);
      setParty(prev => prev ? {
        ...prev,
        members: prev.members.filter(m => m.wallet !== data.wallet)
      } : null);
    });

    eventSource.addEventListener('ready_changed', (event) => {
      const data = JSON.parse(event.data);
      setParty(prev => prev ? {
        ...prev,
        members: prev.members.map(m =>
          m.wallet === data.wallet ? { ...m, isReady: data.isReady } : m
        )
      } : null);
    });

    eventSource.addEventListener('started', (event) => {
      const data = JSON.parse(event.data);
      setStarting(true);
      // Handle game start
    });

    (window as any).eventSource = eventSource;
  };

  const handleReadyToggle = async () => {
    if (!party) return;

    try {
      const currentMember = party.members.find(m => m.wallet === authService.address);
      if (!currentMember) return;

      await apiClient.setReady(party.partyId, { isReady: !currentMember.isReady });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update ready status');
    }
  };

  const handleLockParty = async () => {
    if (!party) return;

    try {
      await apiClient.lockParty(party.partyId, { equippedRelicIds: equippedRelics });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to lock party');
    }
  };

  const handleStartParty = async () => {
    if (!party) return;

    try {
      setStarting(true);
      await apiClient.startParty(party.partyId);
      // The SSE will handle the redirect
    } catch (error) {
      setStarting(false);
      setError(error instanceof Error ? error.message : 'Failed to start party');
    }
  };

  const handleLeaveParty = async () => {
    if (!party) return;

    try {
      await apiClient.leaveParty(party.partyId);
      onNavigate('dungeons');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to leave party');
    }
  };

  // Early returns for loading and error states
  if (loading) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-white text-lg">Loading party...</div>
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
            onClick={loadParty}
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

  // Early return for null party or gate - check both party and members
  if (!party || !gate || !party.members) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-white text-lg">
          {loading ? 'Loading party...' : 'Party not found'}
        </div>
      </div>
    );
  }

  // Safe to access party and gate here - they are guaranteed to exist
  const currentPlayer = party.members.find(m => m.wallet === authService.address);
  const isLeader = party.leader === authService.address;
  const allReady = party.members.every(m => m.isReady);
  const canStart = isLeader && allReady && party.state === 'waiting';

  // Mock relics data (simplified for now)
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
              <Users className="w-4 h-4 mr-2" />
              Party Lobby
            </Badge>
            <div className="flex items-center space-x-2">
              {sseConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-gray-300">
                {sseConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
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
                          <span>{party.members.length}/{gate.capacity} Hunters</span>
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
              {/* Party Members List */}
              <div className="lg:col-span-2">
                <Card className="bg-black/90 border-purple-500/50 shadow-2xl shadow-purple-700/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Party Members</h2>
                      <Badge className="bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-1">
                        {party.members.length} / {gate.capacity}
                      </Badge>
                    </div>

                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {party.members
                          .sort((a, b) => {
                            const aIsCurrent = a.wallet === authService.address;
                            const bIsCurrent = b.wallet === authService.address;
                            const aIsLeader = a.wallet === party.leader;
                            const bIsLeader = b.wallet === party.leader;

                            if (aIsCurrent) return -1;
                            if (bIsCurrent) return 1;
                            if (aIsLeader) return -1;
                            if (bIsLeader) return 1;
                            return 0;
                          })
                          .map((member) => {
                            const isCurrentPlayer = member.wallet === authService.address;
                            const isLeader = member.wallet === party.leader;
                            return (
                            <Card key={member.wallet} className={`bg-purple-950/30 border-purple-600/40 hover:border-purple-500/60 transition-colors ${isCurrentPlayer ? 'ring-2 ring-purple-500/50' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="w-12 h-12 border-2 border-purple-500/50">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.displayName}`} alt={member.displayName} />
                                      <AvatarFallback className="bg-purple-700 text-white">
                                        {member.displayName.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <h3 className="font-semibold text-white">
                                          {member.displayName}
                                          {isCurrentPlayer && <span className="text-purple-400 ml-1">(You)</span>}
                                        </h3>
                                        {isLeader && (
                                          <Crown className="w-4 h-4 text-yellow-400" />
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-sm text-gray-400">Wallet: {member.wallet.slice(0, 6)}...{member.wallet.slice(-4)}</span>
                                        <div className={`w-6 h-6 ${getRankBadgeColor('E')} rounded-full flex items-center justify-center text-xs font-bold`}>
                                          {member.avatarId}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    {member.isReady || starting ? (
                                      <Badge className="bg-green-600 text-white">
                                        {starting ? 'Joining...' : 'Ready'}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="border-red-500/50 text-red-400">
                                        Not Ready
                                      </Badge>
                                    )}
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setExpandedPlayer(isCurrentPlayer ? (expandedPlayer ? null : member.wallet) : null)}
                                      className="text-purple-300 hover:text-white"
                                    >
                                      {expandedPlayer === member.wallet ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {expandedPlayer === member.wallet && isCurrentPlayer && (
                                  <div className="mt-4 pt-4 border-t border-purple-600/30">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-purple-300">Wallet:</span>
                                        <span className="text-white ml-2 font-mono">{member.wallet}</span>
                                      </div>
                                      <div>
                                        <span className="text-purple-300">Class:</span>
                                        <span className="text-white ml-2">{member.avatarId}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Actions and Relics Panel */}
              <div className="space-y-6">
                {/* Action Button */}
                <Card className="bg-black/90 border-purple-500/50 shadow-2xl shadow-purple-700/30">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
                    
                    {!isLeader && !allReady && !currentPlayer?.isReady && (
                      <p className="text-sm text-gray-400 mb-4">
                        Mark yourself as ready when you're prepared to enter the gate.
                      </p>
                    )}
                    
                    {!isLeader && currentPlayer?.isReady && !starting && (
                      <p className="text-sm text-yellow-400 mb-4">
                        Waiting for party leader to start the dungeon...
                      </p>
                    )}
                    
                    {isLeader && !allReady && (
                      <p className="text-sm text-red-400 mb-4">
                        Some players are not ready. Wait for all members to be ready before starting.
                      </p>
                    )}

                    {starting && (
                      <p className="text-sm text-green-400 mb-4 animate-pulse">
                        Preparing to enter {gate.name}...
                      </p>
                    )}

                    <div className="space-y-3">
                    <Button
                      className={`w-full py-3 ${
                          canStart || (!isLeader && !currentPlayer?.isReady)
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      } text-white shadow-lg`}
                      disabled={
                          starting ||
                          (isLeader && !allReady) ||
                          (!isLeader && currentPlayer?.isReady)
                        }
                        onClick={isLeader ? handleStartParty : handleReadyToggle}
                    >
                      <Sword className="w-5 h-5 mr-2" />
                        {starting ? 'Starting...' :
                         isLeader ? (allReady ? 'Start Dungeon' : 'Waiting for Players') :
                         currentPlayer?.isReady ? 'Waiting for Leader' : 'Ready'}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-800/40"
                        onClick={handleLeaveParty}
                      >
                        Leave Party
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