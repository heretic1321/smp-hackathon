import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { GridPattern } from "./ui/GridPattern";
import { cn } from "../src/lib/utils";
import { authService } from '../src/lib/auth';
import { 
  LogOut, 
  User, 
  Sword, 
  Shield, 
  Zap, 
  Crown, 
  Users, 
  Trophy, 
  Star,
  Sparkles,
  ArrowRight,
  Play,
  Gamepad2,
  Coins,
  Target,
  Flame,
  Shield as ShieldIcon,
  Sword as SwordIcon,
  Zap as ZapIcon,
  Crown as CrownIcon
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'dev') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [authState, setAuthState] = useState(authService.state);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authState.isAuthenticated) {
        setAdminLoading(true);
        try {
          const adminStatus = await authService.checkAdminStatus();
          setIsAdmin(adminStatus);
        } catch (error) {
          setIsAdmin(false);
        } finally {
          setAdminLoading(false);
        }
      } else {
        setIsAdmin(false);
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [authState.isAuthenticated]);

  const isAuthenticated = authState.isAuthenticated;
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
        <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4 border-b border-blue-500/20">
           <div>
             <h1 className="text-xl sm:text-2xl font-bold text-white">Shadow Monarch's Path</h1>
             <p className="text-xs text-blue-300">Blockchain RPG Adventure</p>
           </div>
          <nav className="flex space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  className="bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 text-white shadow-xl shadow-blue-600/30 border border-blue-600/30"
                  onClick={() => onNavigate('dungeons')}
                >
                  Enter Dungeons
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-500/60 text-blue-600 hover:bg-blue-800/50 hover:border-blue-400 hover:text-blue-100 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 font-medium"
                  onClick={() => onNavigate('profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-600 hover:bg-yellow-800/40 hover:text-white"
                    onClick={() => onNavigate('dev')}
                  >
                    Dev Panel
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-blue-500/50 text-blue-700 hover:bg-blue-800/40 hover:text-white"
                  onClick={() => authService.signOut().then(() => onNavigate('home'))}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                className="bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 text-white shadow-xl shadow-blue-600/30 border border-blue-600/30"
                onClick={() => onNavigate('auth')}
              >
                Connect Wallet
              </Button>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="flex justify-center lg:justify-start">
                <Badge className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  New Blockchain RPG
                </Badge>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
                Shadow Monarch's
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-400">
                  Path
                </span>
              </h2>
              
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-transparent py-1 bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-400">
                Own. Fight. Rise.
              </h3>
              
              <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
                Enter the ultimate Solo Leveling experience. Command shadow armies, conquer dungeons, 
                and ascend to become the Shadow Monarch in this immersive blockchain-powered RPG.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-blue-300">Active Hunters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-sm text-blue-300">Dungeons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1M+</div>
                  <div className="text-sm text-blue-300">Relics Minted</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 text-white shadow-xl shadow-blue-600/30 px-8 py-6 text-lg font-semibold group"
                  onClick={() => onNavigate('auth')}
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Begin Your Awakening
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Right Content - Game Preview */}
            <div className="hidden md:flex relative w-full max-w-xs md:max-w-md mx-auto">
              <Card className="bg-black/70 border-blue-500/50 shadow-2xl shadow-blue-700/40 overflow-hidden relative group">
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src="https://res.cloudinary.com/dionysus2359/image/upload/v1759624175/photo-1662099768240-40d27dd0c843-removebg-preview_sxl58y.png"
                    alt="Shadow Monarch's Path Game Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Game Info Overlay */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm font-medium">Live Game</p>
                    </div>
                    <p className="text-sm opacity-75">Unity WebGL</p>
                    <p className="font-bold text-lg">Shadow Monarch's Awakening</p>
                  </div>
                  
                  {/* Grid Pattern Overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{
                      backgroundImage: `
                        linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                </div>
              </Card>
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-black/95 backdrop-blur-sm border border-blue-500/50 rounded-xl p-4 shadow-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Crown className="w-4 h-4 text-yellow-400 mr-1" />
                    <p className="text-blue-300 text-sm font-medium">Rank</p>
                  </div>
                  <p className="text-white font-bold text-xl">S</p>
                  <p className="text-xs text-gray-400">Shadow Monarch</p>
                </div>
              </div>
              
             
            </div>
          </div>
        </main>

        {/* Technology Stack Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 px-4 py-2 mb-4">
                <Zap className="w-4 h-4 mr-2" />
                Technology Stack
              </Badge>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Powered by Advanced Technology
              </h3>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Built with cutting-edge technologies to deliver the ultimate blockchain gaming experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  category: "Frontend",
                  description: "Next.js web app for profiles and marketplace, Unity WebGL for smooth combat gameplay",
                  icon: "💻",
                  tech: "Next.js + Unity WebGL"
                },
                {
                  category: "Backend", 
                  description: "Colyseus realtime server for combat, Node.js API with MongoDB for data management",
                  icon: "⚙️",
                  tech: "Colyseus + Node.js + MongoDB"
                },
                {
                  category: "Blockchain",
                  description: "PlayerCard SBT for identity, Relic721 for items, BossLog for kill receipts, and Marketplace contracts",
                  icon: "🔗",
                  tech: "Smart Contracts + NFTs"
                }
              ].map((tech, index) => (
                <Card key={index} className="bg-black/80 border-blue-500/50 p-6 hover:border-blue-400/70 hover:bg-black/90 transition-all duration-300 group shadow-lg shadow-blue-700/20">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {tech.icon}
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">{tech.category}</h4>
                  <p className="text-blue-300 text-sm mb-3">{tech.tech}</p>
                  <p className="text-gray-300 text-sm sm:text-base">{tech.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Game Features
              </Badge>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Master the Shadow Realm
              </h3>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Discover the unique features that make Shadow Monarch's Path the ultimate blockchain RPG experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Shadow Army",
                  description: "Command your own army of shadow soldiers extracted from defeated enemies",
                  icon: "👥"
                },
                {
                  title: "Blockchain Items", 
                  description: "True ownership of weapons and relics through NFT technology",
                  icon: "⚔️"
                },
                {
                  title: "Real-time Combat",
                  description: "Engage in fast-paced multiplayer battles with Unity WebGL",
                  icon: "⚡"
                },
                {
                  title: "Boss Hunting",
                  description: "Hunt legendary bosses and earn verified kill receipts on-chain",
                  icon: "🏆"
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-black/80 border-blue-500/50 p-6 hover:border-blue-400/70 hover:bg-black/90 transition-all duration-300 group shadow-lg shadow-blue-700/20">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-200 text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-blue-500/20 py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Shadow Monarch's Path</h4>
                    <p className="text-sm text-blue-300">Blockchain RPG Adventure</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                  The ultimate Solo Leveling experience where you command shadow armies, 
                  conquer dungeons, and ascend to become the Shadow Monarch.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h5 className="text-white font-semibold mb-4">Game</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-blue-300 text-sm transition-colors">Dungeons</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-blue-300 text-sm transition-colors">Inventory</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-blue-300 text-sm transition-colors">Marketplace</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-blue-300 text-sm transition-colors">Leaderboard</a></li>
                </ul>
              </div>

              {/* Community */}
              <div>
                <h5 className="text-white font-semibold mb-4">Community</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-blue-300 text-sm transition-colors">Discord</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-blue-300 text-sm transition-colors">Twitter</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-blue-300 text-sm transition-colors">Telegram</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-blue-300 text-sm transition-colors">GitHub</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-blue-500/20 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Shadow Monarch's Path. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Live</span>
                </div>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-400 text-sm">Built on Base</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}