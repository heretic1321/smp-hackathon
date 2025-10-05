import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { GridPattern } from "./ui/GridPattern";
import { cn } from "../src/lib/utils";
import { gameService, GameStartData } from '../src/services/game.service';
import { 
  Play, 
  Sword, 
  Shield, 
  Zap, 
  Target, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  Home, 
  Gamepad2,
  Flame,
  Star,
  Users,
  Trophy,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface GameStartedPageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party' | 'inventory' | 'marketplace' | 'dev' | 'gamecompleted' | 'gamestarted') => void;
}

export function GameStartedPage({ onNavigate }: GameStartedPageProps) {
  const [gameData, setGameData] = useState<GameStartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const data = await gameService.getGameStartData();
      setGameData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <div className="text-white text-lg">Loading game data...</div>
        </div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error || 'Failed to load game data'}</div>
          <Button onClick={() => onNavigate('home')}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative">
      {/* Enhanced Dark Blue Aura Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/85 to-indigo-950/90 pointer-events-none"></div>
      
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none">
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
            [10, 15],
            [15, 10],
            [10, 15],
            [15, 10],
          ]}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
            "fill-blue-500/20 stroke-blue-400/30"
          )}
        />
      </div>
      
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-sky-600/20 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none"></div>
      <div className="fixed top-3/4 left-1/6 w-48 h-48 bg-blue-700/15 rounded-full blur-2xl animate-pulse delay-300 pointer-events-none"></div>
      <div className="fixed top-1/6 right-1/3 w-72 h-72 bg-indigo-600/18 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none"></div>
      <div className="fixed bottom-1/3 left-1/2 w-56 h-56 bg-teal-600/15 rounded-full blur-2xl animate-pulse delay-1200 pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-blue-500/20">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Shadow Monarch's Path</h1>
            <p className="text-xs text-blue-300">Game Starting</p>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:text-blue-200 hover:bg-blue-800/40 border border-blue-600/30"
            onClick={() => onNavigate('home')}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Game Starting Animation */}
            <div className="text-center mb-12">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Gamepad2 className="w-16 h-16 text-white animate-bounce" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <Badge className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-green-300 px-6 py-3 text-lg mb-6">
                <Play className="w-5 h-5 mr-2" />
                Game Starting
              </Badge>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                Prepare for Battle
              </h2>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-400 mb-6">
                Your Shadow Awakening Begins
              </h3>
              
              <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
                The gates to the Shadow Realm are opening. Your journey as a hunter begins now. 
                Face the darkness, conquer dungeons, and rise to become the Shadow Monarch.
              </p>
            </div>

            {/* Game Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Left Side - Game Info */}
              <Card className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-blue-400" />
                    Current Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{gameData.currentMission.gateName} - {gameData.currentMission.difficulty}</h4>
                        <p className="text-blue-300 text-sm">{gameData.currentMission.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Sword className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Equipped Relics ({gameData.equippedRelics.length})</h4>
                        <p className="text-blue-300 text-sm">
                          {gameData.equippedRelics.length > 0 
                            ? `${gameData.equippedRelics.map(r => r.name).join(', ')}`
                            : 'No relics equipped'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Side - Player Stats */}
              <Card className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center">
                    <Crown className="w-6 h-6 mr-2 text-blue-400" />
                    Your Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="text-2xl font-bold text-white">{gameData.player.level}</div>
                      <div className="text-blue-300 text-sm">Level</div>
                    </div>
                    <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="text-2xl font-bold text-white">{gameData.player.rank}</div>
                      <div className="text-blue-300 text-sm">Rank</div>
                    </div>
                    <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="text-2xl font-bold text-white">{gameData.player.xp}</div>
                      <div className="text-blue-300 text-sm">XP</div>
                    </div>
                    <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="text-2xl font-bold text-white">{gameData.equippedRelics.length}</div>
                      <div className="text-blue-300 text-sm">Relics</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Features Preview */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">What Awaits You</h3>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Discover the features that make your journey unique
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gameData.gameFeatures.map((feature, index) => (
                  <Card key={index} className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-2xl">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                      <p className="text-blue-300 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Loading State */}
            <Card className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40 mb-8">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400 mr-3" />
                  <h4 className="text-xl font-bold text-white">Initializing Game World</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Loading assets...</span>
                  </div>
                  <div className="flex items-center justify-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Connecting to blockchain...</span>
                  </div>
                  <div className="flex items-center justify-center text-yellow-400">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">Preparing your character...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 text-white shadow-xl shadow-green-600/30 px-8 py-6 text-lg font-semibold group"
                onClick={() => onNavigate('dungeons')}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-blue-500/50 text-blue-300 hover:bg-blue-800/40 hover:text-white px-8 py-6 text-lg font-semibold"
                onClick={() => onNavigate('profile')}
              >
                <Crown className="w-5 h-5 mr-2" />
                View Profile
              </Button>
            </div>

            {/* Warning Message */}
            <div className="mt-12 p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl">
              <h4 className="text-xl font-bold text-white mb-3 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-yellow-400" />
                Ready for Adventure?
              </h4>
              <p className="text-gray-300 text-center">
                Your journey begins now. Face the darkness, conquer dungeons, and rise to become the Shadow Monarch. 
                Every decision matters in your path to power.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
