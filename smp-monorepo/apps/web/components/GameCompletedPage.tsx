import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { GridPattern } from "./ui/GridPattern";
import { cn } from "../src/lib/utils";
import { gameService, GameCompletionData } from '../src/services/game.service';
import { 
  Trophy, 
  Star, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  Home, 
  Play, 
  Target,
  Zap,
  Shield,
  Sword,
  CheckCircle,
  Award,
  Gift,
  Flame,
  Coins,
  Loader2
} from 'lucide-react';

interface GameCompletedPageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party' | 'inventory' | 'marketplace' | 'dev' | 'gamecompleted' | 'gamestarted') => void;
}

export function GameCompletedPage({ onNavigate }: GameCompletedPageProps) {
  const [gameData, setGameData] = useState<GameCompletionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const data = await gameService.getGameCompletionData();
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
          <div className="text-white text-lg">Loading completion data...</div>
        </div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error || 'Failed to load completion data'}</div>
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
            <p className="text-xs text-blue-300">Game Completed</p>
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
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Success Animation */}
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-white animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
                  <Star className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Congratulations Message */}
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 text-lg">
                <Crown className="w-5 h-5 mr-2" />
                Game Completed!
              </Badge>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                Congratulations!
              </h2>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-400 mb-6">
                You have mastered the Shadow Realm
              </h3>
              
              <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
                Your journey through the dungeons has been legendary. You've proven yourself worthy 
                of the Shadow Monarch's power and have earned your place among the elite hunters.
              </p>
            </div>

            {/* Achievement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{gameData.achievements.dungeonsConquered}</h4>
                  <p className="text-blue-300">Dungeons Conquered</p>
                </CardContent>
              </Card>
              
              <Card className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Sword className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{gameData.achievements.legendaryRelics}</h4>
                  <p className="text-blue-300">Legendary Relics</p>
                </CardContent>
              </Card>
              
              <Card className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{gameData.achievements.finalRank}</h4>
                  <p className="text-blue-300">Final Rank</p>
                </CardContent>
              </Card>
            </div>

            {/* Rewards Section */}
            <Card className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white text-center flex items-center justify-center">
                  <Gift className="w-6 h-6 mr-2 text-blue-400" />
                  Your Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gameData.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-xl">
                        {reward.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{reward.name}</h4>
                        <p className="text-blue-300 text-sm">{reward.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 text-white shadow-xl shadow-blue-600/30 px-8 py-6 text-lg font-semibold group"
                onClick={() => onNavigate('inventory')}
              >
                <Sword className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                View Your Relics
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-blue-500/50 text-blue-300 hover:bg-blue-800/40 hover:text-white px-8 py-6 text-lg font-semibold"
                onClick={() => onNavigate('dungeons')}
              >
                <Play className="w-5 h-5 mr-2" />
                Play Again
              </Button>
            </div>

            {/* Thank You Message */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl">
              <h4 className="text-xl font-bold text-white mb-3 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
                Thank You for Playing!
              </h4>
              <p className="text-gray-300 text-center">
                Your journey in the Shadow Realm has been epic. Continue your adventures, 
                collect more relics, and become the ultimate Shadow Monarch!
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
